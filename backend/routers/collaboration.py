"""
Collaboration Router - Team collaboration with AI-powered features
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from backend.database_lite import get_db
from backend.models_lite import User, Team, TeamMember, Message, Notification, Task, FileShare
from backend.auth_lite import get_current_active_user
from backend.base_schema import CamelCaseModel
from backend.routers.ai_chat import call_llm

router = APIRouter(prefix="/api/v1/collaboration", tags=["Collaboration"])

# ============ Schemas ============

class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None

class TeamResponse(CamelCaseModel):
    id: int
    name: str
    description: Optional[str]
    created_by: int
    created_at: datetime
    member_count: int

class TeamMemberResponse(CamelCaseModel):
    id: int
    user_id: int
    username: str
    role: str
    joined_at: datetime

class MessageCreate(BaseModel):
    content: str

class MessageResponse(CamelCaseModel):
    id: int
    team_id: int
    user_id: int
    username: str
    content: str
    sentiment: Optional[str]
    attachments: Optional[list]
    created_at: datetime
    edited_at: Optional[datetime]

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: Optional[int] = None
    priority: str = "medium"
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[int] = None

class TaskResponse(CamelCaseModel):
    id: int
    team_id: int
    title: str
    description: Optional[str]
    assigned_to: Optional[int]
    assignee_name: Optional[str]
    created_by: int
    creator_name: str
    status: str
    priority: str
    due_date: Optional[datetime]
    created_at: datetime

class NotificationResponse(CamelCaseModel):
    id: int
    type: str
    content: str
    related_id: Optional[int]
    is_read: bool
    created_at: datetime

class AIReplyRequest(BaseModel):
    context: str
    tone: str = "professional"  # professional, casual, brief

class AISummaryResponse(CamelCaseModel):
    summary: str
    key_points: List[str]
    action_items: List[str]

# ============ Team Management ============

@router.get("/teams", response_model=List[TeamResponse])
def get_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all teams the user is a member of"""
    memberships = db.query(TeamMember).filter(TeamMember.user_id == current_user.id).all()
    teams = []
    
    for membership in memberships:
        team = db.query(Team).filter(Team.id == membership.team_id).first()
        if team:
            member_count = db.query(TeamMember).filter(TeamMember.team_id == team.id).count()
            teams.append({
                "id": team.id,
                "name": team.name,
                "description": team.description,
                "created_by": team.created_by,
                "created_at": team.created_at,
                "member_count": member_count
            })
    
    return teams

@router.post("/teams", response_model=TeamResponse)
def create_team(
    team_data: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new team"""
    team = Team(
        name=team_data.name,
        description=team_data.description,
        created_by=current_user.id
    )
    db.add(team)
    db.flush()
    
    # Add creator as admin
    member = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role="admin"
    )
    db.add(member)
    db.commit()
    db.refresh(team)
    
    return {
        "id": team.id,
        "name": team.name,
        "description": team.description,
        "created_by": team.created_by,
        "created_at": team.created_at,
        "member_count": 1
    }

@router.get("/teams/{team_id}/members", response_model=List[TeamMemberResponse])
def get_team_members(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all members of a team"""
    # Verify user is team member
    membership = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="Not a team member")
    
    members = db.query(TeamMember).filter(TeamMember.team_id == team_id).all()
    result = []
    
    for member in members:
        user = db.query(User).filter(User.id == member.user_id).first()
        if user:
            result.append({
                "id": member.id,
                "user_id": user.id,
                "username": user.username,
                "role": member.role,
                "joined_at": member.joined_at
            })
    
    return result

@router.post("/teams/{team_id}/members")
def add_team_member(
    team_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add a member to a team (admin only)"""
    # Verify current user is admin
    membership = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id,
        TeamMember.role == "admin"
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if user already a member
    existing = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User already a member")
    
    new_member = TeamMember(
        team_id=team_id,
        user_id=user_id,
        role="member"
    )
    db.add(new_member)
    db.commit()
    
    return {"message": "Member added successfully"}

# ============ Messaging ============

@router.get("/teams/{team_id}/messages", response_model=List[MessageResponse])
def get_messages(
    team_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get team messages"""
    # Verify user is team member
    membership = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="Not a team member")
    
    messages = db.query(Message).filter(
        Message.team_id == team_id
    ).order_by(desc(Message.created_at)).limit(limit).all()
    
    result = []
    for msg in messages:
        user = db.query(User).filter(User.id == msg.user_id).first()
        result.append({
            "id": msg.id,
            "team_id": msg.team_id,
            "user_id": msg.user_id,
            "username": user.username if user else "Unknown",
            "content": msg.content,
            "sentiment": msg.sentiment,
            "attachments": msg.attachments,
            "created_at": msg.created_at,
            "edited_at": msg.edited_at
        })
    
    return list(reversed(result))  # Return oldest first

@router.post("/teams/{team_id}/messages", response_model=MessageResponse)
async def send_message(
    team_id: int,
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Send a message to a team"""
    # Verify user is team member
    membership = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="Not a team member")
    
    # Analyze sentiment with AI
    sentiment = await analyze_sentiment(message_data.content)
    
    message = Message(
        team_id=team_id,
        user_id=current_user.id,
        content=message_data.content,
        sentiment=sentiment
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    
    # Create notifications for mentions
    if "@" in message_data.content:
        await create_mention_notifications(db, team_id, message.id, message_data.content, current_user.id)
    
    return {
        "id": message.id,
        "team_id": message.team_id,
        "user_id": message.user_id,
        "username": current_user.username,
        "content": message.content,
        "sentiment": message.sentiment,
        "attachments": message.attachments,
        "created_at": message.created_at,
        "edited_at": message.edited_at
    }

# ============ AI Features ============

@router.post("/messages/ai-reply")
async def generate_ai_reply(
    request: AIReplyRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Generate AI-powered reply suggestion"""
    tone_prompts = {
        "professional": "Generate a professional, business-appropriate response.",
        "casual": "Generate a friendly, casual response.",
        "brief": "Generate a brief, concise response."
    }
    
    prompt = f"""You are a helpful assistant helping with team collaboration.

{tone_prompts.get(request.tone, tone_prompts['professional'])}

Provide a suggested reply that is helpful and appropriate for the context."""

    try:
        reply = await call_llm(prompt, request.context)
        return {"suggested_reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

@router.post("/teams/{team_id}/summarize", response_model=AISummaryResponse)
async def summarize_discussion(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate AI summary of recent team discussions"""
    # Verify user is team member
    membership = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="Not a team member")
    
    # Get recent messages
    messages = db.query(Message).filter(
        Message.team_id == team_id
    ).order_by(desc(Message.created_at)).limit(50).all()
    
    if not messages:
        return {
            "summary": "No messages to summarize",
            "key_points": [],
            "action_items": []
        }
    
    # Build context
    context = "\n".join([f"{msg.user_id}: {msg.content}" for msg in reversed(messages)])
    
    prompt = """Analyze this team discussion and provide:
1. A brief summary
2. Key points discussed
3. Action items or tasks mentioned

Respond in JSON format:
{
    "summary": "brief summary here",
    "key_points": ["point 1", "point 2"],
    "action_items": ["action 1", "action 2"]
}"""

    try:
        response = await call_llm(prompt, context)
        
        # Handle potential error strings from call_llm
        if response.startswith("AI analysis unavailable") or response.startswith("AI analysis failed"):
            return {
                "summary": response,
                "key_points": [],
                "action_items": []
            }
            
        # Clean up response if it contains markdown code blocks
        import re
        cleaned_response = re.sub(r'^```json\s*|\s*```$', '', response.strip(), flags=re.MULTILINE)
        
        # Parse JSON response
        import json
        result = json.loads(cleaned_response)
        return result
    except Exception as e:
        print(f"Summary Generation Error: {e}")
        return {
            "summary": "Unable to generate summary due to processing error.",
            "key_points": [],
            "action_items": []
        }

# ============ Tasks ============

@router.get("/teams/{team_id}/tasks", response_model=List[TaskResponse])
def get_tasks(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get team tasks"""
    # Verify user is team member
    membership = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="Not a team member")
    
    tasks = db.query(Task).filter(Task.team_id == team_id).all()
    result = []
    
    for task in tasks:
        creator = db.query(User).filter(User.id == task.created_by).first()
        assignee = db.query(User).filter(User.id == task.assigned_to).first() if task.assigned_to else None
        
        result.append({
            "id": task.id,
            "team_id": task.team_id,
            "title": task.title,
            "description": task.description,
            "assigned_to": task.assigned_to,
            "assignee_name": assignee.username if assignee else None,
            "created_by": task.created_by,
            "creator_name": creator.username if creator else "Unknown",
            "status": task.status,
            "priority": task.priority,
            "due_date": task.due_date,
            "created_at": task.created_at
        })
    
    return result

@router.post("/teams/{team_id}/tasks", response_model=TaskResponse)
def create_task(
    team_id: int,
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new task"""
    # Verify user is team member
    membership = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="Not a team member")
    
    task = Task(
        team_id=team_id,
        title=task_data.title,
        description=task_data.description,
        assigned_to=task_data.assigned_to,
        created_by=current_user.id,
        priority=task_data.priority,
        due_date=task_data.due_date
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    
    # Create notification for assignee
    if task.assigned_to:
        notification = Notification(
            user_id=task.assigned_to,
            type="task_assigned",
            content=f"You were assigned task: {task.title}",
            related_id=task.id
        )
        db.add(notification)
        db.commit()
    
    assignee = db.query(User).filter(User.id == task.assigned_to).first() if task.assigned_to else None
    
    return {
        "id": task.id,
        "team_id": task.team_id,
        "title": task.title,
        "description": task.description,
        "assigned_to": task.assigned_to,
        "assignee_name": assignee.username if assignee else None,
        "created_by": task.created_by,
        "creator_name": current_user.username,
        "status": task.status,
        "priority": task.priority,
        "due_date": task.due_date,
        "created_at": task.created_at
    }

@router.put("/tasks/{task_id}")
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update task status/priority"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Verify user is team member
    membership = db.query(TeamMember).filter(
        TeamMember.team_id == task.team_id,
        TeamMember.user_id == current_user.id
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="Not a team member")
    
    if task_update.status:
        task.status = task_update.status
    if task_update.priority:
        task.priority = task_update.priority
    if task_update.assigned_to is not None:
        task.assigned_to = task_update.assigned_to
    
    db.commit()
    return {"message": "Task updated successfully"}

# ============ Notifications ============

@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user notifications"""
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(desc(Notification.created_at)).limit(limit).all()
    
    return notifications

@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark notification as read"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}

# ============ Helper Functions ============

async def analyze_sentiment(content: str) -> str:
    """Analyze message sentiment using AI"""
    prompt = """Analyze the sentiment of this message and classify it as one of: positive, neutral, negative, urgent.

Respond with only one word: positive, neutral, negative, or urgent."""
    
    try:
        result = await call_llm(prompt, content)
        sentiment = result.strip().lower()
        if sentiment in ["positive", "neutral", "negative", "urgent"]:
            return sentiment
        return "neutral"
    except:
        return "neutral"

async def create_mention_notifications(db: Session, team_id: int, message_id: int, content: str, sender_id: int):
    """Create notifications for @mentioned users"""
    # Simple mention detection (could be enhanced)
    words = content.split()
    mentioned_usernames = [word[1:] for word in words if word.startswith("@")]
    
    for username in mentioned_usernames:
        user = db.query(User).filter(User.username == username).first()
        if user and user.id != sender_id:
            # Verify user is team member
            membership = db.query(TeamMember).filter(
                TeamMember.team_id == team_id,
                TeamMember.user_id == user.id
            ).first()
            
            if membership:
                notification = Notification(
                    user_id=user.id,
                    type="mention",
                    content=f"You were mentioned in a message",
                    related_id=message_id
                )
                db.add(notification)
    
    db.commit()
