import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface ResultCardProps {
  content: string
  raw?: any
}

export default function ResultCard({ content, raw }: ResultCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Response
        </h3>
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Copy response"
        >
          {copied ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : (
            <Copy className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>
      
      <div className="prose dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
          {content}
        </div>
      </div>

      {copied && (
        <div className="mt-2 text-sm text-green-600 dark:text-green-400">
          Copied to clipboard!
        </div>
      )}
    </div>
  )
}
