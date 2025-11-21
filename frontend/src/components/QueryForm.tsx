import { useState, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { fetchModels, listPersonas, chat } from '../lib/api'

interface Model {
  id: string
  object: string
  created: number
  owned_by: string
}

interface Persona {
  id: number
  name: string
  system_prompt: string
}

interface QueryFormProps {
  onResult: (result: { content: string; raw: any; chat_id: number }) => void
  onError: (error: string) => void
  currentChatId?: number
  onUserMessage?: (message: string) => void
}

export default function QueryForm({ onResult, onError, currentChatId, onUserMessage }: QueryFormProps) {
  const [models, setModels] = useState<Model[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedPersona, setSelectedPersona] = useState<number | null>(null)
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingModels, setIsLoadingModels] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoadingModels(true)
    try {
      const [modelsData, personasData] = await Promise.all([
        fetchModels(),
        listPersonas()
      ])
      
      setModels(modelsData.data || [])
      setPersonas(personasData)
      
      // Auto-select first model if available
      if (modelsData.data && modelsData.data.length > 0) {
        setSelectedModel(modelsData.data[0].id)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      onError('Failed to load models or personas')
    } finally {
      setIsLoadingModels(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedModel || !prompt.trim()) return

    setIsLoading(true)
    const userMessage = prompt.trim()
    try {
      // Notify parent about user message for conversation display
      if (onUserMessage) {
        onUserMessage(userMessage)
      }
      
      const result = await chat({
        model: selectedModel,
        persona_id: selectedPersona || undefined,
        prompt: userMessage,
        temperature: 0.7,
        max_tokens: 512,
        chat_id: currentChatId
      })
      onResult(result)
      setPrompt('')
    } catch (error: any) {
      console.error('Chat error:', error)
      onError(error.response?.data?.detail || 'Failed to get response from LM Studio')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Compact Model and Persona Selection */}
      <div className="flex gap-2 items-center">
        {isLoadingModels ? (
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Loading models...</span>
          </div>
        ) : (
          <>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="input text-sm py-1.5 flex-1"
              required
              title="Select a model"
            >
              <option value="">Select model</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.id}
                </option>
              ))}
            </select>
            <select
              value={selectedPersona || ''}
              onChange={(e) => setSelectedPersona(e.target.value ? parseInt(e.target.value) : null)}
              className="input text-sm py-1.5 flex-shrink-0 w-32"
              title="Select persona (optional)"
            >
              <option value="">No persona</option>
              {personas.map((persona) => (
                <option key={persona.id} value={persona.id}>
                  {persona.name}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Compact Message Input and Send Button */}
      <div className="flex gap-2 items-end">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your message here..."
          rows={2}
          className="input resize-none flex-1 text-sm"
          required
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              const form = e.currentTarget.closest('form')
              if (form) {
                form.requestSubmit()
              }
            }
          }}
        />
        <button
          type="submit"
          disabled={!selectedModel || !prompt.trim() || isLoading}
          className="btn btn-primary px-4 py-2 flex items-center justify-center space-x-2 flex-shrink-0"
          title="Send message (Ctrl/Cmd + Enter)"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
      {models.length === 0 && !isLoadingModels && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          No models available. Check your LM Studio connection in settings.
        </p>
      )}
    </form>
  )
}


