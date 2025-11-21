import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
      
      <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
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
          {content}
        </ReactMarkdown>
      </div>

      {copied && (
        <div className="mt-2 text-sm text-green-600 dark:text-green-400">
          Copied to clipboard!
        </div>
      )}
    </div>
  )
}


