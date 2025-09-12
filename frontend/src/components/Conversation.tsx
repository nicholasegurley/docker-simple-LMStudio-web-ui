import { useState, useEffect, useRef } from 'react'
import { User, Bot } from 'lucide-react'
import { getChat } from '../lib/api'

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
}

export default function Conversation({ chatId, newMessage, onMessageProcessed }: ConversationProps) {
  const [chat, setChat] = useState<Chat | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatId) {
      loadChat(chatId)
    } else {
      setChat(null)
    }
  }, [chatId])

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
    // Only auto-scroll if we're at or near the bottom of the chat
    if (chat?.messages.length && messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement
      if (container) {
        const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100
        if (isNearBottom) {
          scrollToBottom()
        }
      }
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
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
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
          <h3 className="text-lg font-medium mb-2">Welcome to LM Studio Web UI</h3>
          <p>Start a new conversation or select an existing chat from the sidebar.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {chat.name}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {chat.messages.length} messages
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
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
                <div className="whitespace-pre-wrap text-sm">
                  {message.content}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    message.role === 'user'
                      ? 'text-blue-100'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {formatTime(message.created_at)}
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
