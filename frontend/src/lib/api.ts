import axios from "axios";

// Get the current host from the browser's location
const getCurrentHost = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname;
  }
  return 'localhost';
};

// Use the current host for API calls, but fall back to environment variable or localhost
const API_BASE = import.meta.env.VITE_API_BASE ?? `http://${getCurrentHost()}:8001/api`;

console.log('API Base URL:', API_BASE);
console.log('Environment VITE_API_BASE:', import.meta.env.VITE_API_BASE);
console.log('Current Host:', getCurrentHost());

export const api = axios.create({ baseURL: API_BASE });

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Making API request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API error:', error.response?.status, error.response?.data, error.config?.url);
    return Promise.reject(error);
  }
);

// settings
export async function getSettings() {
  return (await api.get("/settings")).data;
}

export async function putSettings(lm_studio_base_url: string, context_message_count?: number) {
  return (await api.put("/settings", { lm_studio_base_url, context_message_count })).data;
}

// models
export async function fetchModels() {
  return (await api.get("/models")).data;
}

export async function refreshModels() {
  return (await api.post("/models/refresh")).data;
}

// personas
export async function listPersonas() {
  return (await api.get("/personas")).data;
}

export async function createPersona(payload: { name: string; system_prompt: string }) {
  return (await api.post("/personas", payload)).data;
}

export async function updatePersona(id: number, payload: { name: string; system_prompt: string }) {
  return (await api.put(`/personas/${id}`, payload)).data;
}

export async function deletePersona(id: number) {
  return (await api.delete(`/personas/${id}`)).data;
}

// chat
export async function chat(payload: {
  model: string;
  persona_id?: number;
  prompt: string;
  temperature?: number;
  max_tokens?: number;
  chat_id?: number;
}) {
  return (await api.post("/chat", payload)).data as { content: string; raw: any; chat_id: number };
}

// chats
export async function listChats() {
  return (await api.get("/chats")).data;
}

export async function getChat(chatId: number) {
  return (await api.get(`/chats/${chatId}`)).data;
}

export async function deleteChat(chatId: number) {
  return (await api.delete(`/chats/${chatId}`)).data;
}


