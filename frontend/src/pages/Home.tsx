import { useState } from 'react'
import QueryForm from '../components/QueryForm'
import ResultCard from '../components/ResultCard'

export default function Home() {
  const [result, setResult] = useState<{ content: string; raw: any } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleResult = (newResult: { content: string; raw: any }) => {
    setResult(newResult)
    setError(null)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setResult(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          LMStudio Web UI
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Chat with your local LLM models through LM Studio
        </p>
      </div>

      <QueryForm onResult={handleResult} onError={handleError} />

      {error && (
        <div className="card p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error
          </h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {result && <ResultCard content={result.content} raw={result.raw} />}
    </div>
  )
}


