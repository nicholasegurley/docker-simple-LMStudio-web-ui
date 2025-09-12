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
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Chat with LM Studio
      </h2>

      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Model
        </label>
        {isLoadingModels ? (
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading models...</span>
          </div>
        ) : (
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="input"
            required
          >
            <option value="">Select a model</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.id}
              </option>
            ))}
          </select>
        )}
        {models.length === 0 && !isLoadingModels && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            No models available. Check your LM Studio connection in settings.
          </p>
        )}
      </div>

      {/* Persona Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Persona (Optional)
        </label>
        <select
          value={selectedPersona || ''}
          onChange={(e) => setSelectedPersona(e.target.value ? parseInt(e.target.value) : null)}
          className="input"
        >
          <option value="">None</option>
          {personas.map((persona) => (
            <option key={persona.id} value={persona.id}>
              {persona.name}
            </option>
          ))}
        </select>
      </div>

      {/* Prompt Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Message
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your message here..."
          rows={4}
          className="input resize-none"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!selectedModel || !prompt.trim() || isLoading}
        className="btn btn-primary w-full flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Getting response...</span>
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            <span>Send</span>
          </>
        )}
      </button>
    </form>
  )
}


