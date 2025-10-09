from pydantic import BaseModel, AnyHttpUrl, validator
from typing import Optional, List, Union
from datetime import datetime


class SettingOut(BaseModel):
    lm_studio_base_url: str
    context_message_count: int = 5


class SettingIn(BaseModel):
    lm_studio_base_url: Union[str, AnyHttpUrl]
    context_message_count: Optional[int] = 5
    
    @validator('lm_studio_base_url', pre=True)
    def validate_url(cls, v):
        if isinstance(v, str):
            return v
        return str(v)
    
    @validator('context_message_count')
    def validate_context_count(cls, v):
        if v is not None and (v < 0 or v > 20):
            raise ValueError('Context message count must be between 0 and 20')
        return v


class PersonaIn(BaseModel):
    name: str
    system_prompt: str


class ChatRenameIn(BaseModel):
    name: str


class PersonaOut(BaseModel):
    id: int
    name: str
    system_prompt: str


class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime


class ChatOut(BaseModel):
    id: int
    name: str
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageOut] = []


class ChatIn(BaseModel):
    model: str
    persona_id: Optional[int] = None
    prompt: str
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 512
    stream: Optional[bool] = False
    chat_id: Optional[int] = None


class ChatResponseOut(BaseModel):
    content: str
    raw: dict
    chat_id: int

