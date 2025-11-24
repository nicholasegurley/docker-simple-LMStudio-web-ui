import { useState, useEffect, useRef } from 'react'
import { Send, Loader2, Upload, X, FileText } from 'lucide-react'
import { fetchModels, listPersonas, chat } from '../lib/api'
import { readFile, isSupportedFileType, FileContent } from '../utils/fileReader'

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
  const [uploadedFiles, setUploadedFiles] = useState<FileContent[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const fileArray = Array.from(files)
      
      // Validate all files first
      for (const file of fileArray) {
        if (!isSupportedFileType(file)) {
          onError(`Unsupported file type: ${file.name}. Supported types: PDF and text-based files.`)
          setIsUploading(false)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
          return
        }
      }

      // Read all files
      const fileContents = await Promise.all(
        fileArray.map(file => readFile(file))
      )

      setUploadedFiles(prev => [...prev, ...fileContents])
    } catch (error: any) {
      console.error('File reading error:', error)
      onError(error.message || 'Failed to read file')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedModel || (!prompt.trim() && uploadedFiles.length === 0)) return
    if (isUploading) return

    setIsLoading(true)
    
    try {
      // Build the message content
      let messageContent = prompt.trim()
      
      // Add file contents to the message
      if (uploadedFiles.length > 0) {
        const fileSections = uploadedFiles.map(file => {
          return `[File: ${file.name}]\n${file.content}\n[/File: ${file.name}]`
        }).join('\n\n')
        
        if (messageContent) {
          messageContent = `${messageContent}\n\n${fileSections}`
        } else {
          messageContent = fileSections
        }
      }

      const userMessage = messageContent

      // Debug logging
      console.log('Sending message to backend:', {
        hasFiles: uploadedFiles.length > 0,
        fileCount: uploadedFiles.length,
        messageLength: userMessage.length,
        messagePreview: userMessage.substring(0, 200),
        fullMessage: userMessage
      })

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
      setUploadedFiles([])
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

      {/* File Upload Section */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 text-sm"
            >
              <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300 max-w-[200px] truncate" title={file.name}>
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Compact Message Input and Send Button */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 flex flex-col gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your message here..."
            rows={2}
            className="input resize-none flex-1 text-sm"
            required={uploadedFiles.length === 0}
            disabled={isUploading}
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
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              accept=".pdf,.txt,.md,.csv,.html,.json,.js,.css,.xml,.py,.jsx,.tsx,.ts,.java,.cpp,.c,.h,.hpp,.go,.rs,.rb,.php,.sh,.yaml,.yml,text/*,application/pdf"
              onChange={handleFileSelect}
              disabled={isUploading || isLoading}
            />
            <label
              htmlFor="file-upload"
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded border cursor-pointer transition-colors ${
                isUploading || isLoading
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-600 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              title="Upload PDF or text files"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Upload File</span>
                </>
              )}
            </label>
          </div>
        </div>
        <button
          type="submit"
          disabled={!selectedModel || (!prompt.trim() && uploadedFiles.length === 0) || isLoading || isUploading}
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


