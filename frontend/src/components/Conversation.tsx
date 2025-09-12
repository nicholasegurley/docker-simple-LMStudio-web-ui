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
      // Check if this message is already in the chat to prevent duplicates
      const messageExists = chat.messages.some(msg => 
        msg.content === newMessage.content && 
        msg.role === newMessage.role &&
        Math.abs(new Date(msg.created_at).getTime() - Date.now()) < 5000 // Within 5 seconds
      )
      
      if (!messageExists) {
        // Add the new message to the current chat with a temporary ID and current timestamp
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
        
        // Notify parent that message has been processed
        if (onMessageProcessed) {
          onMessageProcessed()
        }
      }
    }
  }, [newMessage, chat, onMessageProcessed])

  useEffect(() => {
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Just now'
      }
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
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
