import { useState, useEffect } from 'react'
import { X, RefreshCw } from 'lucide-react'
import { getSettings, putSettings, refreshModels } from '../lib/api'
import PersonaManager from './PersonaManager'

interface SettingsModalProps {
  onClose: () => void
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [lmStudioUrl, setLmStudioUrl] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const settings = await getSettings()
      setLmStudioUrl(settings.lm_studio_base_url)
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await putSettings(lmStudioUrl)
      onClose()
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRefreshModels = async () => {
    setIsRefreshing(true)
    try {
      await refreshModels()
      alert('Models refreshed successfully!')
    } catch (error) {
      console.error('Failed to refresh models:', error)
      alert('Failed to refresh models. Check your LM Studio URL and connection.')
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-6">
            {/* LM Studio URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                LM Studio Base URL
              </label>
              <input
                type="url"
                value={lmStudioUrl}
                onChange={(e) => setLmStudioUrl(e.target.value)}
                placeholder="http://192.168.1.10:1234/v1"
                className="input"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                The URL where your LM Studio server is running
              </p>
            </div>

            {/* Refresh Models Button */}
            <div>
              <button
                onClick={handleRefreshModels}
                disabled={isRefreshing}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Models'}</span>
              </button>
            </div>

            {/* Persona Manager */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Persona Manager
              </h3>
              <PersonaManager />
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn btn-primary"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
