from pydantic import BaseModel, AnyHttpUrl
from typing import Optional, List


class SettingOut(BaseModel):
    lm_studio_base_url: AnyHttpUrl


class SettingIn(BaseModel):
    lm_studio_base_url: AnyHttpUrl


class PersonaIn(BaseModel):
    name: str
    system_prompt: str


class PersonaOut(BaseModel):
    id: int
    name: str
    system_prompt: str


class ChatIn(BaseModel):
    model: str
    persona_id: Optional[int] = None
    prompt: str
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 512
    stream: Optional[bool] = False


class ChatOut(BaseModel):
    content: str
    raw: dict
