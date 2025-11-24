from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
import logging

from app.models import Chat, ChatMessage

logger = logging.getLogger(__name__)


def create_chat(session: Session, name: str) -> Chat:
    """Create a new chat"""
    chat = Chat(name=name)
    session.add(chat)
    session.commit()
    session.refresh(chat)
    logger.info(f"Created new chat: {chat.id} - {name}")
    return chat


def get_chat(session: Session, chat_id: int) -> Optional[Chat]:
    """Get a chat by ID"""
    return session.get(Chat, chat_id)


def list_chats(session: Session) -> List[Chat]:
    """List all chats ordered by most recent"""
    statement = select(Chat).order_by(Chat.updated_at.desc())
    return session.exec(statement).all()


def delete_chat(session: Session, chat_id: int) -> bool:
    """Delete a chat and all its messages"""
    chat = session.get(Chat, chat_id)
    if not chat:
        return False
    
    # Delete all messages first
    statement = select(ChatMessage).where(ChatMessage.chat_id == chat_id)
    messages = session.exec(statement).all()
    for message in messages:
        session.delete(message)
    
    # Delete the chat
    session.delete(chat)
    session.commit()
    logger.info(f"Deleted chat: {chat_id}")
    return True


def add_message(session: Session, chat_id: int, role: str, content: str) -> ChatMessage:
    """Add a message to a chat"""
    # Log content length for debugging
    logger.info(f"add_message called - chat_id: {chat_id}, role: {role}, content_length: {len(content)}")
    message = ChatMessage(chat_id=chat_id, role=role, content=content)
    session.add(message)
    
    # Update chat's updated_at timestamp
    chat = session.get(Chat, chat_id)
    if chat:
        chat.updated_at = datetime.utcnow()
    
    session.commit()
    session.refresh(message)
    # Verify what was actually saved
    logger.info(f"Added {role} message to chat {chat_id}, saved content length: {len(message.content)}")
    return message


def get_chat_messages(session: Session, chat_id: int, limit: Optional[int] = None) -> List[ChatMessage]:
    """Get messages for a chat, optionally limited to recent messages"""
    statement = select(ChatMessage).where(ChatMessage.chat_id == chat_id).order_by(ChatMessage.created_at.asc())
    if limit:
        statement = statement.limit(limit)
    return session.exec(statement).all()


def get_recent_messages_for_context(session: Session, chat_id: int, count: int) -> List[ChatMessage]:
    """Get recent messages for context, excluding system messages"""
    statement = (
        select(ChatMessage)
        .where(ChatMessage.chat_id == chat_id)
        .where(ChatMessage.role != 'system')
        .order_by(ChatMessage.created_at.desc())
        .limit(count)
    )
    messages = session.exec(statement).all()
    # Return in chronological order
    return list(reversed(messages))


def generate_chat_name_from_prompt(prompt: str) -> str:
    """Generate a chat name from the initial prompt"""
    # Simple name generation - take first few words and clean them up
    words = prompt.strip().split()[:4]
    name = " ".join(words)
    
    # Clean up the name
    name = name.replace('\n', ' ').replace('\r', ' ')
    name = ' '.join(name.split())  # Remove extra whitespace
    
    # Truncate if too long
    if len(name) > 50:
        name = name[:47] + "..."
    
    # Default name if empty
    if not name:
        name = "New Chat"
    
    return name


def rename_chat(session: Session, chat_id: int, new_name: str) -> Optional[Chat]:
    """Rename a chat"""
    chat = session.get(Chat, chat_id)
    if not chat:
        return None

    chat.name = new_name
    chat.updated_at = datetime.utcnow()
    session.add(chat)
    session.commit()
    session.refresh(chat)
    logger.info(f"Renamed chat {chat_id} to: {new_name}")
    return chat
