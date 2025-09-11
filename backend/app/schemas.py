from pydantic import BaseModel, AnyHttpUrl, validator
from typing import Optional, List, Union


class SettingOut(BaseModel):
    lm_studio_base_url: str


class SettingIn(BaseModel):
    lm_studio_base_url: Union[str, AnyHttpUrl]
    
    @validator('lm_studio_base_url', pre=True)
    def validate_url(cls, v):
        if isinstance(v, str):
            return v
        return str(v)


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

