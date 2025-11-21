import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Trash2, Plus, Pencil } from 'lucide-react'
import { listChats, deleteChat, renameChat } from '../lib/api'

interface Chat {
  id: number
  name: string
  created_at: string
  updated_at: string
}

interface ChatHistoryPanelProps {
  onChatSelect: (chatId: number) => void;
  onNewChat: () => void;
  currentChatId?: number;
  refreshTrigger?: number;
  onChatRenamed?: () => void;
}

export default function ChatHistoryPanel({ onChatSelect, onNewChat, currentChatId, refreshTrigger, onChatRenamed }: ChatHistoryPanelProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingChatId, setDeletingChatId] = useState<number | null>(null)
  const [editingChatId, setEditingChatId] = useState<number | null>(null)
  const [editingChatName, setEditingChatName] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadChats()
  }, [])

  useEffect(() => {
    if (refreshTrigger) {
      loadChats()
    }
  }, [refreshTrigger])

  useEffect(() => {
    if (editingChatId !== null && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingChatId])

  const loadChats = async () => {
    try {
      setIsLoading(true)
      const chatList = await listChats()
      setChats(chatList)
    } catch (error) {
      console.error('Failed to load chats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteChat = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        setDeletingChatId(chatId)
        await deleteChat(chatId)
        setChats(chats.filter(chat => chat.id !== chatId))
        // If we deleted the current chat, start a new one
        if (currentChatId === chatId) {
          onNewChat()
        }
      } catch (error) {
        console.error('Failed to delete chat:', error)
        alert('Failed to delete chat')
      } finally {
        setDeletingChatId(null)
      }
    }
  }

  const handleRenameStart = (chatId: number, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingChatId(chatId)
    setEditingChatName(currentName)
  }

  const handleRenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingChatName(e.target.value)
  }

  const handleRenameCancel = () => {
    setEditingChatId(null)
    setEditingChatName('')
  }

  const handleRenameSubmit = async (chatId: number) => {
    // Clear any pending blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }
    
    if (editingChatId !== chatId || !editingChatName.trim()) {
      handleRenameCancel()
      return
    }

    // Find the current chat to check if name changed
    const currentChat = chats.find(c => c.id === chatId)
    if (currentChat && editingChatName.trim() === currentChat.name) {
      handleRenameCancel()
      return
    }

    try {
      await renameChat(chatId, editingChatName.trim())
      setChats(chats.map(c => c.id === chatId ? { ...c, name: editingChatName.trim() } : c))
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

  const handleRenameBlur = (chatId: number) => {
    // Use a small timeout to allow click events (like buttons) to process first
    blurTimeoutRef.current = setTimeout(() => {
      handleRenameSubmit(chatId)
    }, 200)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { 
        weekday: 'short',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
    }
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chat History
          </h2>
          <button
            onClick={onNewChat}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="New Chat"
          >
            <Plus className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Loading chats...
          </div>
        ) : chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No chats yet</p>
            <p className="text-sm">Start a new conversation!</p>
          </div>
        ) : (
          <div className="p-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => editingChatId === chat.id ? null : onChatSelect(chat.id)}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                  currentChatId === chat.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    {editingChatId === chat.id ? (
                      <form onSubmit={(e) => { e.preventDefault(); handleRenameSubmit(chat.id); }}>
                        <input
                          ref={inputRef}
                          type="text"
                          value={editingChatName}
                          onChange={handleRenameChange}
                          onBlur={() => handleRenameBlur(chat.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              if (blurTimeoutRef.current) {
                                clearTimeout(blurTimeoutRef.current)
                                blurTimeoutRef.current = null
                              }
                              handleRenameCancel()
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-white dark:bg-gray-700 border border-blue-500 rounded px-1 py-0 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </form>
                    ) : (
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {chat.name}
                      </h3>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(chat.updated_at)}
                    </p>
                  </div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingChatId !== chat.id && (
                      <button
                        onClick={(e) => handleRenameStart(chat.id, chat.name, e)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Rename chat"
                      >
                        <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      disabled={deletingChatId === chat.id}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-all"
                      title="Delete chat"
                    >
                      {deletingChatId === chat.id ? (
                        <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
