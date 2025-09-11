import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { listPersonas, createPersona, updatePersona, deletePersona } from '../lib/api'

interface Persona {
  id: number
  name: string
  system_prompt: string
}

export default function PersonaManager() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({ name: '', system_prompt: '' })

  useEffect(() => {
    loadPersonas()
  }, [])

  const loadPersonas = async () => {
    try {
      const data = await listPersonas()
      setPersonas(data)
    } catch (error) {
      console.error('Failed to load personas:', error)
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.system_prompt.trim()) return

    try {
      await createPersona(formData)
      setFormData({ name: '', system_prompt: '' })
      setIsCreating(false)
      loadPersonas()
    } catch (error) {
      console.error('Failed to create persona:', error)
      alert('Failed to create persona')
    }
  }

  const handleUpdate = async (id: number) => {
    if (!formData.name.trim() || !formData.system_prompt.trim()) return

    try {
      await updatePersona(id, formData)
      setEditingId(null)
      setFormData({ name: '', system_prompt: '' })
      loadPersonas()
    } catch (error) {
      console.error('Failed to update persona:', error)
      alert('Failed to update persona')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this persona?')) return

    try {
      await deletePersona(id)
      loadPersonas()
    } catch (error) {
      console.error('Failed to delete persona:', error)
      alert('Failed to delete persona')
    }
  }

  const startEdit = (persona: Persona) => {
    setEditingId(persona.id)
    setFormData({ name: persona.name, system_prompt: persona.system_prompt })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    setFormData({ name: '', system_prompt: '' })
  }

  return (
    <div className="space-y-4">
      {/* Create New Persona */}
      {isCreating ? (
        <div className="card p-4">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Persona name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
            />
            <textarea
              placeholder="System prompt"
              value={formData.system_prompt}
              onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
              rows={3}
              className="input resize-none"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleCreate}
                className="btn btn-primary flex items-center space-x-1"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
              <button
                onClick={cancelEdit}
                className="btn btn-secondary flex items-center space-x-1"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Persona</span>
        </button>
      )}

      {/* Personas List */}
      <div className="space-y-3">
        {personas.map((persona) => (
          <div key={persona.id} className="card p-4">
            {editingId === persona.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                />
                <textarea
                  value={formData.system_prompt}
                  onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                  rows={3}
                  className="input resize-none"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdate(persona.id)}
                    className="btn btn-primary flex items-center space-x-1"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="btn btn-secondary flex items-center space-x-1"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {persona.name}
                  </h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(persona)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <Edit2 className="h-4 w-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(persona.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {persona.system_prompt}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {personas.length === 0 && !isCreating && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No personas created yet. Click "Add Persona" to create your first one.
        </p>
      )}
    </div>
  )
}
