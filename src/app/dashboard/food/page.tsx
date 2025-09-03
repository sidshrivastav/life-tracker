'use client'

import { useState, useEffect } from 'react'
import { 
  searchFoodEntries,
  getAllFoodEntries,
  addFoodEntry, 
  updateFoodEntry, 
  deleteFoodEntry,
  FoodEntry, 
  FoodEntryInsert 
} from '../../../../utils/database/foodEntry'

export default function FoodPage() {
  const [entries, setEntries] = useState<FoodEntry[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    food_name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: ''
  })

  useEffect(() => {
    const loadData = async () => {
      await loadEntries()
      setLoading(false)
    }
    loadData()
  }, [])

  const loadEntries = async (search?: string) => {
    const data = search && search.trim()
      ? await searchFoodEntries(search)
      : await getAllFoodEntries()
    setEntries(data)
  }

  const handleSearch = async () => {
    await loadEntries(searchTerm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.food_name.trim()) {
      alert('Food name is required')
      return
    }

    if (!formData.calories || parseInt(formData.calories) < 0) {
      alert('Valid calories value is required')
      return
    }

    const entryData: FoodEntryInsert = {
      food_name: formData.food_name.trim(),
      calories: parseInt(formData.calories) || 0,
      protein: formData.protein ? parseFloat(formData.protein) : undefined,
      carbs: formData.carbs ? parseFloat(formData.carbs) : undefined,
      fat: formData.fat ? parseFloat(formData.fat) : undefined,
      fiber: formData.fiber ? parseFloat(formData.fiber) : undefined
    }

    console.log('Submitting food entry:', entryData)

    if (editingEntry) {
      // Update existing entry
      const updated = await updateFoodEntry(editingEntry.id, entryData)
      if (updated) {
        setEntries(entries.map(entry => 
          entry.id === editingEntry.id ? updated : entry
        ))
      }
    } else {
      // Create new entry
      const newEntry = await addFoodEntry(entryData)
      if (newEntry) {
        setEntries([newEntry, ...entries])
      }
    }

    // Reset form
    setFormData({
      food_name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: ''
    })
    setEditingEntry(null)
    setShowForm(false)
    
    // Reload entries
    await loadEntries(searchTerm)
  }

  const handleEdit = (entry: FoodEntry) => {
    setFormData({
      food_name: entry.food_name,
      calories: entry.calories.toString(),
      protein: entry.protein?.toString() || '',
      carbs: entry.carbs?.toString() || '',
      fat: entry.fat?.toString() || '',
      fiber: entry.fiber?.toString() || ''
    })
    setEditingEntry(entry)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      const success = await deleteFoodEntry(id)
      if (success) {
        setEntries(entries.filter(entry => entry.id !== id))
      }
    }
  }

  const resetForm = () => {
    setFormData({
      food_name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: ''
    })
    setEditingEntry(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search food items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {showForm ? 'Cancel' : 'Add Food Item'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingEntry ? 'Edit Food Item' : 'Add Food Item'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.food_name}
                  onChange={(e) => setFormData({...formData, food_name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Chicken Breast"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calories *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.calories}
                  onChange={(e) => setFormData({...formData, calories: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) => setFormData({...formData, protein: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) => setFormData({...formData, carbs: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fat (g)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.fat}
                  onChange={(e) => setFormData({...formData, fat: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiber (g)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.fiber}
                  onChange={(e) => setFormData({...formData, fiber: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {editingEntry ? 'Update Item' : 'Add Item'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Food Items List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Food Database
          </h3>
        </div>
        
        {entries.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No food items found. Add your first food item above!
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <div key={entry.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      {entry.food_name}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Calories:</span> {entry.calories}
                      </div>
                      {entry.protein && (
                        <div>
                          <span className="font-medium">Protein:</span> {entry.protein}g
                        </div>
                      )}
                      {entry.carbs && (
                        <div>
                          <span className="font-medium">Carbs:</span> {entry.carbs}g
                        </div>
                      )}
                      {entry.fat && (
                        <div>
                          <span className="font-medium">Fat:</span> {entry.fat}g
                        </div>
                      )}
                      {entry.fiber && (
                        <div>
                          <span className="font-medium">Fiber:</span> {entry.fiber}g
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
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