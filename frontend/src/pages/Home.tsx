import { useState } from 'react'
import QueryForm from '../components/QueryForm'
import ResultCard from '../components/ResultCard'
import ChatHistoryPanel from '../components/ChatHistoryPanel'
import Conversation from '../components/Conversation'

export default function Home() {
  const [currentChatId, setCurrentChatId] = useState<number | undefined>(undefined)
  const [result, setResult] = useState<{ content: string; raw: any; chat_id: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState<{ role: string; content: string } | undefined>(undefined)
  const [chatHistoryRefreshTrigger, setChatHistoryRefreshTrigger] = useState(0)
  const [chatRenameTrigger, setChatRenameTrigger] = useState(0)

  const handleResult = (newResult: { content: string; raw: any; chat_id: number }) => {
    setResult(newResult)
    setError(null)
    setCurrentChatId(newResult.chat_id)
    // Set new message for the conversation component
    setNewMessage({ role: 'assistant', content: newResult.content })
    // Trigger chat history refresh
    setChatHistoryRefreshTrigger(prev => prev + 1)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setResult(null)
  }

  const handleChatSelect = (chatId: number) => {
    setCurrentChatId(chatId)
    setResult(null)
    setError(null)
    setNewMessage(undefined)
  }

  const handleNewChat = () => {
    setCurrentChatId(undefined)
    setResult(null)
    setError(null)
    setNewMessage(undefined)
  }

  const handleNewUserMessage = (message: string) => {
    setNewMessage({ role: 'user', content: message })
  }

  const handleMessageProcessed = () => {
    setNewMessage(undefined)
  }

  const handleChatRenamed = () => {
    setChatHistoryRefreshTrigger(prev => prev + 1)
    setChatRenameTrigger(prev => prev + 1)
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Chat History Panel */}
      <ChatHistoryPanel
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        currentChatId={currentChatId}
        refreshTrigger={chatHistoryRefreshTrigger}
        onChatRenamed={handleChatRenamed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Conversation View */}
        <div className="flex-1 overflow-y-auto">
          <Conversation 
            chatId={currentChatId} 
            newMessage={newMessage} 
            onMessageProcessed={handleMessageProcessed}
            onChatRenamed={handleChatRenamed}
            refreshTrigger={chatRenameTrigger}
          />
        </div>

        {/* Query Form */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <QueryForm
            onResult={handleResult}
            onError={handleError}
            currentChatId={currentChatId}
            onUserMessage={handleNewUserMessage}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="border-t border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Error
            </h3>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Result Display (for new chats) */}
        {result && !currentChatId && <ResultCard content={result.content} raw={result.raw} />}
      </div>
    </div>
  )
}


