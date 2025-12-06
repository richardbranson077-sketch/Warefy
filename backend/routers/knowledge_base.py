from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import json

from backend.database_lite import get_db
from backend.models_lite import KnowledgeBaseArticle, User
from backend.auth_lite import get_current_active_user
from backend.routers.ai_chat import call_llm

router = APIRouter(prefix="/api/v1/knowledge-base", tags=["Knowledge Base"])

# Pydantic Schemas
class ArticleBase(BaseModel):
    title: str
    content: str
    category: str
    tags: List[str] = []

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(ArticleBase):
    pass

class ArticleResponse(ArticleBase):
    id: int
    author_id: int
    views: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SearchQuery(BaseModel):
    query: str

class AskQuery(BaseModel):
    question: str
    context_article_id: Optional[int] = None

# CRUD Endpoints

@router.get("/articles", response_model=List[ArticleResponse])
def get_articles(
    category: Optional[str] = None, 
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(KnowledgeBaseArticle)
    
    if category:
        query = query.filter(KnowledgeBaseArticle.category == category)
        
    if search:
        # Simple case-insensitive search for SQLite
        search_term = f"%{search}%"
        query = query.filter(
            (KnowledgeBaseArticle.title.ilike(search_term)) | 
            (KnowledgeBaseArticle.content.ilike(search_term))
        )
        
    return query.order_by(KnowledgeBaseArticle.updated_at.desc()).all()

@router.get("/articles/{article_id}", response_model=ArticleResponse)
def get_article(
    article_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    article = db.query(KnowledgeBaseArticle).filter(KnowledgeBaseArticle.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    # Increment views
    article.views += 1
    db.commit()
    db.refresh(article)
    
    return article

@router.post("/articles", response_model=ArticleResponse)
def create_article(
    article: ArticleCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_article = KnowledgeBaseArticle(
        title=article.title,
        content=article.content,
        category=article.category,
        tags=article.tags,
        author_id=current_user.id
    )
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article

@router.put("/articles/{article_id}", response_model=ArticleResponse)
def update_article(
    article_id: int, 
    article_update: ArticleUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_article = db.query(KnowledgeBaseArticle).filter(KnowledgeBaseArticle.id == article_id).first()
    if not db_article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    for key, value in article_update.dict().items():
        setattr(db_article, key, value)
        
    db.commit()
    db.refresh(db_article)
    return db_article

@router.delete("/articles/{article_id}")
def delete_article(
    article_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_article = db.query(KnowledgeBaseArticle).filter(KnowledgeBaseArticle.id == article_id).first()
    if not db_article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    db.delete(db_article)
    db.commit()
    return {"message": "Article deleted successfully"}

# AI Endpoints

@router.post("/search")
async def semantic_search(
    query: SearchQuery, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    AI-powered search that finds relevant articles based on meaning, not just keywords.
    """
    articles = db.query(KnowledgeBaseArticle).all()
    
    # Prepare context for AI
    articles_context = "\n".join([
        f"ID: {a.id} | Title: {a.title} | Content Snippet: {a.content[:200]}..." 
        for a in articles
    ])
    
    prompt_text = f"""
    You are a helpful knowledge base assistant.
    User Query: "{query.query}"
    
    Task: Identify the most relevant articles for the user's query.
    Return a JSON object with a list of relevant article IDs and a brief reason why.
    Format: {{ "results": [ {{ "id": 1, "relevance": "high", "reason": "..." }} ] }}
    """
    
    try:
        response = await call_llm(prompt_text, articles_context)
        # Clean up response
        import re
        cleaned_response = re.sub(r'^```json\s*|\\s*```$', '', response.strip(), flags=re.MULTILINE)
        result = json.loads(cleaned_response)
        
        # Fetch full article details for the results
        relevant_articles = []
        for item in result.get("results", []):
            article = db.query(KnowledgeBaseArticle).filter(KnowledgeBaseArticle.id == item["id"]).first()
            if article:
                relevant_articles.append({
                    "article": article,
                    "relevance": item["relevance"],
                    "reason": item["reason"]
                })
                
        return relevant_articles
    except Exception as e:
        # Fallback to keyword search if AI fails
        print(f"AI Search failed: {e}")
        search_term = f"%{query.query}%"
        fallback_articles = db.query(KnowledgeBaseArticle).filter(
            (KnowledgeBaseArticle.title.ilike(search_term)) | 
            (KnowledgeBaseArticle.content.ilike(search_term))
        ).all()
        return [{"article": a, "relevance": "medium", "reason": "Keyword match"} for a in fallback_articles]

@router.post("/ask")
async def ask_ai(
    query: AskQuery, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Ask AI a question, optionally scoped to a specific article.
    """
    context = ""
    
    if query.context_article_id:
        article = db.query(KnowledgeBaseArticle).filter(KnowledgeBaseArticle.id == query.context_article_id).first()
        if article:
            context = f"Context Article:\nTitle: {article.title}\nContent: {article.content}\n\n"
    else:
        # If no specific article, fetch all (or top relevant) to build context
        # For simplicity in this lite version, we'll take top 5 most viewed or just all if small
        articles = db.query(KnowledgeBaseArticle).limit(10).all()
        context = "Knowledge Base Context:\n" + "\n---\n".join([
            f"Title: {a.title}\nContent: {a.content}" for a in articles
        ])
    
    prompt_text = f"""
    You are an intelligent assistant for the Warefy supply chain platform.
    User Question: {query.question}
    
    Answer:
    """
    
    try:
        response = await call_llm(prompt_text, context)
        return {"answer": response}
    except Exception as e:
        return {"answer": "I'm sorry, I'm having trouble processing your request right now. Please try again later."}
