'''Enhanced notification router with Firebase, SendGrid, Twilio + fallback'''

import os
import json
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from sqlalchemy.orm import Session

from ..auth_lite import get_current_active_user
from ..database_lite import get_db
from ..models_lite import User, AuditLog

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

# ------------------------------------------------------------------
# Schemas
# ------------------------------------------------------------------
class PushNotification(BaseModel):
    title: str
    body: str
    device_token: Optional[str] = None  # FCM token
    topic: Optional[str] = None  # For topic-based messaging
    data: Optional[dict] = None  # Additional payload

class EmailNotification(BaseModel):
    to: EmailStr
    subject: str
    body: str
    html: Optional[str] = None  # HTML version

class SMSNotification(BaseModel):
    to: str  # E.164 format
    message: str

# ------------------------------------------------------------------
# Firebase Cloud Messaging (Push)
# ------------------------------------------------------------------
@router.post("/push")
def send_push(payload: PushNotification, user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """
    Send push notification via Firebase Cloud Messaging
    """
    try:
        import firebase_admin
        from firebase_admin import credentials, messaging
        
        # Initialize Firebase (only once)
        if not firebase_admin._apps:
            cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
            if cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
            else:
                raise HTTPException(status_code=500, detail="Firebase credentials not configured")
        
        # Build message
        if payload.device_token:
            # Send to specific device
            message = messaging.Message(
                notification=messaging.Notification(
                    title=payload.title,
                    body=payload.body,
                ),
                data=payload.data or {},
                token=payload.device_token,
            )
            response = messaging.send(message)
            
            # Log audit
            audit = AuditLog(
                user_id=user.id,
                action="push_notification_sent",
                details=json.dumps({"token": payload.device_token[:10] + "...", "title": payload.title}),
            )
            db.add(audit)
            db.commit()
            
            return {"detail": "Push sent", "message_id": response}
        
        elif payload.topic:
            # Send to topic subscribers
            message = messaging.Message(
                notification=messaging.Notification(
                    title=payload.title,
                    body=payload.body,
                ),
                data=payload.data or {},
                topic=payload.topic,
            )
            response = messaging.send(message)
            return {"detail": "Push sent to topic", "message_id": response}
        
        else:
            raise HTTPException(status_code=400, detail="Either device_token or topic required")
            
    except ImportError:
        # Fallback to Web Push (using pywebpush)
        try:
            from pywebpush import webpush, WebPushException
            
            subscription_info = {
                "endpoint": os.getenv("WEB_PUSH_ENDPOINT"),
                "keys": {
                    "p256dh": os.getenv("WEB_PUSH_P256DH"),
                    "auth": os.getenv("WEB_PUSH_AUTH"),
                }
            }
            
            webpush(
                subscription_info=subscription_info,
                data=json.dumps({"title": payload.title, "body": payload.body}),
                vapid_private_key=os.getenv("VAPID_PRIVATE_KEY"),
                vapid_claims={"sub": "mailto:admin@warefy.com"}
            )
            
            return {"detail": "Web push sent"}
            
        except Exception as e:
            # Final fallback - just log
            print(f"[PUSH FALLBACK] {payload.title}: {payload.body}")
            return {"detail": "Push logged (no service configured)", "warning": str(e)}

# ------------------------------------------------------------------
# SendGrid Email
# ------------------------------------------------------------------
@router.post("/email")
def send_email(payload: EmailNotification, user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """
    Send email via SendGrid (primary) or SMTP (fallback)
    """
    # Try SendGrid first
    sendgrid_key = os.getenv("SENDGRID_API_KEY")
    if sendgrid_key:
        try:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail
            
            message = Mail(
                from_email=os.getenv("SENDGRID_FROM_EMAIL", "noreply@warefy.com"),
                to_emails=payload.to,
                subject=payload.subject,
                plain_text_content=payload.body,
                html_content=payload.html or f"<p>{payload.body}</p>",
            )
            
            sg = SendGridAPIClient(sendgrid_key)
            response = sg.send(message)
            
            # Log audit
            audit = AuditLog(
                user_id=user.id,
                action="email_sent",
                details=json.dumps({"to": payload.to, "subject": payload.subject, "provider": "sendgrid"}),
            )
            db.add(audit)
            db.commit()
            
            return {"detail": "Email sent via SendGrid", "status_code": response.status_code}
            
        except Exception as e:
            print(f"SendGrid failed: {e}, falling back to SMTP")
    
    # Fallback to SMTP
    smtp_host = os.getenv("SMTP_HOST")
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    
    if not all([smtp_host, smtp_user, smtp_pass]):
        raise HTTPException(status_code=500, detail="No email service configured")
    
    try:
        import smtplib
        import ssl
        from email.message import EmailMessage
        
        msg = EmailMessage()
        msg["From"] = smtp_user
        msg["To"] = payload.to
        msg["Subject"] = payload.subject
        msg.set_content(payload.body)
        
        if payload.html:
            msg.add_alternative(payload.html, subtype="html")
        
        context = ssl.create_default_context()
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls(context=context)
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        
        # Log audit
        audit = AuditLog(
            user_id=user.id,
            action="email_sent",
            details=json.dumps({"to": payload.to, "subject": payload.subject, "provider": "smtp"}),
        )
        db.add(audit)
        db.commit()
        
        return {"detail": "Email sent via SMTP"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email failed: {str(e)}")

# ------------------------------------------------------------------
# Twilio SMS with fallback to other providers
# ------------------------------------------------------------------
@router.post("/sms")
def send_sms(payload: SMSNotification, user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """
    Send SMS via Twilio (primary) or fallback providers
    """
    # Try Twilio first
    twilio_sid = os.getenv("TWILIO_ACCOUNT_SID")
    twilio_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_from = os.getenv("TWILIO_FROM_NUMBER")
    
    if all([twilio_sid, twilio_token, twilio_from]):
        try:
            from twilio.rest import Client
            
            client = Client(twilio_sid, twilio_token)
            message = client.messages.create(
                body=payload.message,
                from_=twilio_from,
                to=payload.to,
            )
            
            # Log audit
            audit = AuditLog(
                user_id=user.id,
                action="sms_sent",
                details=json.dumps({"to": payload.to[:5] + "***", "provider": "twilio", "sid": message.sid}),
            )
            db.add(audit)
            db.commit()
            
            return {"detail": "SMS sent via Twilio", "sid": message.sid}
            
        except Exception as e:
            print(f"Twilio failed: {e}, trying fallback")
    
    # Fallback to Vonage (Nexmo)
    vonage_key = os.getenv("VONAGE_API_KEY")
    vonage_secret = os.getenv("VONAGE_API_SECRET")
    vonage_from = os.getenv("VONAGE_FROM_NUMBER")
    
    if all([vonage_key, vonage_secret, vonage_from]):
        try:
            import vonage
            
            client = vonage.Client(key=vonage_key, secret=vonage_secret)
            sms = vonage.Sms(client)
            
            response = sms.send_message({
                "from": vonage_from,
                "to": payload.to,
                "text": payload.message,
            })
            
            if response["messages"][0]["status"] == "0":
                # Log audit
                audit = AuditLog(
                    user_id=user.id,
                    action="sms_sent",
                    details=json.dumps({"to": payload.to[:5] + "***", "provider": "vonage"}),
                )
                db.add(audit)
                db.commit()
                
                return {"detail": "SMS sent via Vonage"}
            else:
                raise Exception(response["messages"][0]["error-text"])
                
        except Exception as e:
            print(f"Vonage failed: {e}")
    
    # Final fallback - AWS SNS
    aws_region = os.getenv("AWS_REGION", "us-east-1")
    if os.getenv("AWS_ACCESS_KEY_ID"):
        try:
            import boto3
            
            sns = boto3.client("sns", region_name=aws_region)
            response = sns.publish(
                PhoneNumber=payload.to,
                Message=payload.message,
            )
            
            # Log audit
            audit = AuditLog(
                user_id=user.id,
                action="sms_sent",
                details=json.dumps({"to": payload.to[:5] + "***", "provider": "aws_sns"}),
            )
            db.add(audit)
            db.commit()
            
            return {"detail": "SMS sent via AWS SNS", "message_id": response["MessageId"]}
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"All SMS providers failed. Last error: {str(e)}")
    
    raise HTTPException(status_code=500, detail="No SMS provider configured")
