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
      <div className="flex-1 flex flex-col relative">
        {/* Conversation View with padding for fixed input at bottom of screen */}
        <div className="flex-1 overflow-y-auto pb-[200px]">
          <Conversation 
            chatId={currentChatId} 
            newMessage={newMessage} 
            onMessageProcessed={handleMessageProcessed}
            onChatRenamed={handleChatRenamed}
            refreshTrigger={chatRenameTrigger}
          />
        </div>

        {/* Result Display (for new chats) */}
        {result && !currentChatId && <ResultCard content={result.content} raw={result.raw} />}
      </div>

      {/* Fixed Query Form - always visible at bottom of screen */}
      <div className="fixed bottom-0 left-80 right-0 z-50 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
        {/* Error Display */}
        {error && (
          <div className="border-b border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
              Error
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
        
        <div className="p-3 max-w-full">
          <QueryForm
            onResult={handleResult}
            onError={handleError}
            currentChatId={currentChatId}
            onUserMessage={handleNewUserMessage}
          />
        </div>
      </div>
    </div>
  )
}


