import { useState, useEffect, useRef } from 'react'
import { User, Bot, Copy, Check, Pencil } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getChat, renameChat } from '../lib/api'

interface ChatMessage {
  id: number
  role: string
  content: string
  created_at: string
}

interface Chat {
  id: number
  name: string
  created_at: string
  updated_at: string
  messages: ChatMessage[]
}

interface ConversationProps {
  chatId?: number
  newMessage?: { role: string; content: string }
  onMessageProcessed?: () => void
  onChatRenamed?: () => void
  refreshTrigger?: number
}

export default function Conversation({ chatId, newMessage, onMessageProcessed, onChatRenamed, refreshTrigger }: ConversationProps) {
  const [chat, setChat] = useState<Chat | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editingName, setEditingName] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (chatId) {
      loadChat(chatId)
      setIsEditingName(false)
    } else {
      setChat(null)
    }
  }, [chatId, refreshTrigger])

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditingName])

  useEffect(() => {
    if (newMessage && chat) {
      // For user messages, we'll add them temporarily to show immediate feedback
      // For assistant messages, we'll reload the chat to get the proper server data
      if (newMessage.role === 'user') {
        // Check if this message is already in the chat to prevent duplicates
        const messageExists = chat.messages.some(msg => 
          msg.content === newMessage.content && 
          msg.role === newMessage.role &&
          Math.abs(new Date(msg.created_at).getTime() - Date.now()) < 5000 // Within 5 seconds
        )
        
        if (!messageExists) {
          // Add the new user message to the current chat with a temporary ID and current timestamp
          const tempMessage: ChatMessage = {
            id: Date.now(), // Temporary ID
            role: newMessage.role,
            content: newMessage.content,
            created_at: new Date().toISOString()
          }
          
          setChat(prev => prev ? {
            ...prev,
            messages: [...prev.messages, tempMessage]
          } : null)
        }
      } else if (newMessage.role === 'assistant') {
        // For assistant messages, reload the chat to get the proper server data
        if (chat.id) {
          loadChat(chat.id)
        }
      }
      
      // Notify parent that message has been processed
      if (onMessageProcessed) {
        onMessageProcessed()
      }
    }
  }, [newMessage, chat, onMessageProcessed])

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (chat?.messages.length) {
      scrollToBottom()
    }
  }, [chat?.messages.length])

  const loadChat = async (id: number) => {
    try {
      setIsLoading(true)
      const chatData = await getChat(id)
      setChat(chatData)
    } catch (error) {
      console.error('Failed to load chat:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const copyToClipboard = async (content: string, messageId: number) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedMessageId(null)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = content
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedMessageId(messageId)
      setTimeout(() => {
        setCopiedMessageId(null)
      }, 2000)
    }
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Just now'
      }
      
      // Check if the date is very recent (within last minute)
      const now = new Date()
      const diffInSeconds = (now.getTime() - date.getTime()) / 1000
      
      if (diffInSeconds < 60) {
        return 'Just now'
      }
      
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
    } catch (error) {
      return 'Just now'
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading conversation...</div>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Chat with your local LLM</h3>
          <p>Start a new conversation or select an existing chat from the sidebar.</p>
        </div>
      </div>
    )
  }

  const handleRenameStart = () => {
    if (!chat) return
    setIsEditingName(true)
    setEditingName(chat.name)
  }

  const handleRenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value)
  }

  const handleRenameCancel = () => {
    setIsEditingName(false)
    setEditingName('')
  }

  const handleRenameSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    // Clear any pending blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }
    
    if (!chat || !editingName.trim() || editingName.trim() === chat.name) {
      handleRenameCancel()
      return
    }

    try {
      await renameChat(chat.id, editingName.trim())
      setChat(prev => prev ? { ...prev, name: editingName.trim() } : null)
      if (onChatRenamed) {
        onChatRenamed()
      }
    } catch (error) {
      console.error('Failed to rename chat:', error)
      alert('Failed to rename chat.')
    } finally {
      handleRenameCancel()
    }
  }

  const handleRenameBlur = () => {
    // Use a small timeout to allow click events (like the edit button) to process first
    blurTimeoutRef.current = setTimeout(() => {
      handleRenameSubmit()
    }, 200)
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {isEditingName ? (
            <form onSubmit={handleRenameSubmit} className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={editingName}
                onChange={handleRenameChange}
                onBlur={handleRenameBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    if (blurTimeoutRef.current) {
                      clearTimeout(blurTimeoutRef.current)
                      blurTimeoutRef.current = null
                    }
                    handleRenameCancel()
                  }
                }}
                className="text-lg font-semibold bg-transparent w-full text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 -ml-1"
              />
            </form>
          ) : (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {chat.name}
            </h2>
          )}
          {!isEditingName && (
            <button
              onClick={handleRenameStart}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title="Rename chat"
            >
              <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {chat.messages.length} messages
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white ml-3'
                    : 'bg-gray-500 text-white mr-3'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>

              {/* Message Content */}
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Customize code blocks
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '')
                          return !inline ? (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          ) : (
                            <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                              {children}
                            </code>
                          )
                        },
                        // Customize pre blocks
                        pre({ children }) {
                          return (
                            <pre className="bg-gray-200 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto">
                              {children}
                            </pre>
                          )
                        },
                        // Customize links
                        a({ children, ...props }) {
                          return (
                            <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props}>
                              {children}
                            </a>
                          )
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                )}
                <div
                  className={`flex items-center justify-between mt-1 ${
                    message.role === 'user'
                      ? 'text-blue-100'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <span className="text-xs">
                    {formatTime(message.created_at)}
                  </span>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
