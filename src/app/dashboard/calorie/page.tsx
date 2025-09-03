'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '../../../../utils/supabase/client'
import { 
  addCalorieEntry, 
  updateCalorieEntry, 
  deleteCalorieEntry,
  getCalorieEntriesByDateWithFood,
  getDailyCalorieSummary,
  CalorieEntryWithFood,
  CreateCalorieEntry,
  MealType,
  DailyCalorieSummary
} from '../../../../utils/database/calorieEntry'
import { searchFoodEntries, FoodEntry } from '../../../../utils/database/foodEntry'

export default function CaloriePage() {
  const [entries, setEntries] = useState<CalorieEntryWithFood[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [editingEntry, setEditingEntry] = useState<CalorieEntryWithFood | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [dailySummary, setDailySummary] = useState<DailyCalorieSummary | null>(null)
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([])
  const [foodSearchTerm, setFoodSearchTerm] = useState<string>('')
  const [showFoodResults, setShowFoodResults] = useState<boolean>(false)

  // Form state
  const [formData, setFormData] = useState({
    meal: MealType.BREAKFAST,
    quantity: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    meal_item: '', // Food item selection
    entryMode: 'manual' // 'manual' or 'food_item'
  })

  const loadEntriesForDate = useCallback(async (date: string) => {
    if (!user) return
    
    const supabase = createClient()
    const data = await getCalorieEntriesByDateWithFood(supabase, user.id, date)
    const summary = await getDailyCalorieSummary(supabase, user.id, date)
    
    setEntries(data)
    setDailySummary(summary)
  }, [user])

  useEffect(() => {
    const loadData = async () => {
      // Get current user
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (user && selectedDate) {
      loadEntriesForDate(selectedDate)
    }
  }, [selectedDate, user, loadEntriesForDate])

  const searchFoodItems = async (searchTerm: string) => {
    if (!user || !searchTerm.trim()) {
      setFoodEntries([])
      setShowFoodResults(false)
      return
    }
    
    const supabase = createClient()
    const data = await searchFoodEntries(supabase, user.id, searchTerm.trim())
    setFoodEntries(data)
    setShowFoodResults(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validate required fields
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      alert('Valid quantity is required')
      return
    }

    if (formData.entryMode === 'food_item' && !formData.meal_item) {
      alert('Please select a food item')
      return
    }

    if (formData.entryMode === 'manual' && (!formData.calories || parseInt(formData.calories) < 0)) {
      alert('Valid calories value is required for manual entry')
      return
    }

    const entryData: CreateCalorieEntry = {
      meal: formData.meal,
      quantity: parseInt(formData.quantity) || 0,
      calories: parseInt(formData.calories) || 0,
      protein: formData.protein ? parseFloat(formData.protein) : undefined,
      carbs: formData.carbs ? parseFloat(formData.carbs) : undefined,
      fat: formData.fat ? parseFloat(formData.fat) : undefined,
      fiber: formData.fiber ? parseFloat(formData.fiber) : undefined,
      meal_item: formData.meal_item && formData.entryMode === 'food_item' ? parseInt(formData.meal_item) : undefined,
      user_id: user.id
    }

    console.log('Submitting calorie entry:', entryData)

    const supabase = createClient()
    
    if (editingEntry) {
      // Update existing entry
      const updated = await updateCalorieEntry(supabase, Number(editingEntry.id), entryData)
      if (updated) {
        setEntries(entries.map(entry => 
          entry.id === editingEntry.id ? updated : entry
        ))
      }
    } else {
      // Create new entry
      const newEntry = await addCalorieEntry(supabase, entryData)
      if (newEntry) {
        setEntries([newEntry, ...entries])
      }
    }

    // Reset form
    setFormData({
      meal: MealType.BREAKFAST,
      quantity: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      meal_item: '',
      entryMode: 'manual'
    })
    
    // Reset food search
    setFoodSearchTerm('')
    setFoodEntries([])
    setShowFoodResults(false)
    setEditingEntry(null)
    setShowForm(false)
    
    // Reload entries for the selected date
    await loadEntriesForDate(selectedDate)
  }

  const handleEdit = (entry: CalorieEntryWithFood) => {
    setFormData({
      meal: entry.meal,
      quantity: entry.quantity.toString(),
      calories: entry.calories.toString(),
      protein: entry.protein?.toString() || '',
      carbs: entry.carbs?.toString() || '',
      fat: entry.fat?.toString() || '',
      fiber: entry.fiber?.toString() || '',
      meal_item: entry.meal_item?.toString() || '',
      entryMode: entry.meal_item ? 'food_item' : 'manual'
    })
    
    // Set food search term if editing a food item entry
    if (entry.meal_item && entry.food_name) {
      setFoodSearchTerm(entry.food_name)
    }
    
    setEditingEntry(entry)
    setShowForm(true)
  }

  const handleDelete = async (id: bigint) => {
    if (window.confirm('Are you sure you want to delete this calorie entry?')) {
      const supabase = createClient()
      const success = await deleteCalorieEntry(supabase, Number(id))
      if (success) {
        setEntries(entries.filter(entry => entry.id !== id))
        await loadEntriesForDate(selectedDate)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      meal: MealType.BREAKFAST,
      quantity: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      meal_item: '',
      entryMode: 'manual'
    })
    
    // Reset food search
    setFoodSearchTerm('')
    setFoodEntries([])
    setShowFoodResults(false)
    setEditingEntry(null)
    setShowForm(false)
  }

  const handleFoodItemSelect = (food: FoodEntry) => {
    if (formData.entryMode === 'food_item') {
      // Auto-populate nutrition data from selected food item
      // Food values are per 100g, so calculate based on quantity in grams / 100
      const quantityInGrams = parseInt(formData.quantity) || 1
      const multiplier = quantityInGrams / 100
      
      setFormData({
        ...formData,
        meal_item: food.id.toString(),
        calories: Math.round(food.calories * multiplier).toString(),
        protein: food.protein ? (food.protein * multiplier).toFixed(1) : '',
        carbs: food.carbs ? (food.carbs * multiplier).toFixed(1) : '',
        fat: food.fat ? (food.fat * multiplier).toFixed(1) : '',
        fiber: food.fiber ? (food.fiber * multiplier).toFixed(1) : ''
      })
    } else {
      setFormData({
        ...formData,
        meal_item: food.id.toString()
      })
    }
    
    // Hide search results after selection
    setShowFoodResults(false)
    setFoodSearchTerm(food.food_name)
  }

  const handleQuantityChange = (quantity: string) => {
    setFormData({
      ...formData,
      quantity
    })

    // If in food_item mode and a food is selected, recalculate nutrition values
    if (formData.entryMode === 'food_item' && formData.meal_item) {
      const selectedFood = foodEntries.find(food => food.id.toString() === formData.meal_item)
      if (selectedFood) {
        // Food values are per 100g, so calculate based on quantity in grams / 100
        const quantityInGrams = parseInt(quantity) || 1
        const multiplier = quantityInGrams / 100
        
        setFormData(prev => ({
          ...prev,
          quantity,
          calories: Math.round(selectedFood.calories * multiplier).toString(),
          protein: selectedFood.protein ? (selectedFood.protein * multiplier).toFixed(1) : '',
          carbs: selectedFood.carbs ? (selectedFood.carbs * multiplier).toFixed(1) : '',
          fat: selectedFood.fat ? (selectedFood.fat * multiplier).toFixed(1) : '',
          fiber: selectedFood.fiber ? (selectedFood.fiber * multiplier).toFixed(1) : ''
        }))
      }
    }
  }

  const handleFoodSearchChange = (value: string) => {
    setFoodSearchTerm(value)
    if (value.trim()) {
      searchFoodItems(value)
    } else {
      setFoodEntries([])
      setShowFoodResults(false)
    }
  }

  const clearFoodSelection = () => {
    setFoodSearchTerm('')
    setFoodEntries([])
    setShowFoodResults(false)
    setFormData({
      ...formData,
      meal_item: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: ''
    })
  }

  const getMealDisplayName = (meal: MealType) => {
    return meal.charAt(0).toUpperCase() + meal.slice(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Header with Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calorie Tracker</h1>
          <p className="text-gray-600">Track your daily calorie intake by meal</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <a
            href="/dashboard/food"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          >
            Food DB
          </a>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {showForm ? 'Cancel' : 'Add Entry'}
          </button>
        </div>
      </div>

      {/* Daily Summary */}
      {dailySummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-orange-600">{dailySummary.totalCalories}</div>
            <div className="text-sm text-gray-600">Total Calories</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{dailySummary.totalProtein.toFixed(1)}g</div>
            <div className="text-sm text-gray-600">Protein</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{dailySummary.totalCarbs.toFixed(1)}g</div>
            <div className="text-sm text-gray-600">Carbs</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">{dailySummary.totalFat.toFixed(1)}g</div>
            <div className="text-sm text-gray-600">Fat</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">{dailySummary.totalFiber.toFixed(1)}g</div>
            <div className="text-sm text-gray-600">Fiber</div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingEntry ? 'Edit Calorie Entry' : 'Add Calorie Entry'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Entry Mode Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entry Type *
                </label>
                <select
                  value={formData.entryMode}
                  onChange={(e) => setFormData({...formData, entryMode: e.target.value as 'manual' | 'food_item'})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="manual">Manual Entry</option>
                  <option value="food_item">From Food Database</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meal *
                </label>
                <select
                  value={formData.meal}
                  onChange={(e) => setFormData({...formData, meal: e.target.value as MealType})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {Object.values(MealType).map((meal) => (
                    <option key={meal} value={meal}>
                      {getMealDisplayName(meal)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Food Item Search (only show if food_item mode) */}
            {formData.entryMode === 'food_item' && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food Item * 
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for food items..."
                    value={foodSearchTerm}
                    onChange={(e) => handleFoodSearchChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required={formData.entryMode === 'food_item'}
                  />
                  {formData.meal_item && (
                    <button
                      type="button"
                      onClick={clearFoodSelection}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Search Results */}
                {showFoodResults && foodEntries.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {foodEntries.map((food) => (
                      <button
                        key={food.id.toString()}
                        type="button"
                        onClick={() => handleFoodItemSelect(food)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      >
                        <div className="font-medium text-gray-900">{food.food_name}</div>
                        <div className="text-sm text-gray-500">
                          {food.calories} cal per 100g
                          {food.protein && ` • ${food.protein}g protein`}
                          {food.carbs && ` • ${food.carbs}g carbs`}
                          {food.fat && ` • ${food.fat}g fat`}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* No Results */}
                {showFoodResults && foodEntries.length === 0 && foodSearchTerm.trim() && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3">
                    <div className="text-gray-500 text-sm">No food items found for &ldquo;{foodSearchTerm}&rdquo;</div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity (grams) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calories * {formData.entryMode === 'food_item' && <span className="text-xs text-gray-500">(auto-calculated)</span>}
                </label>
                <input
                  type="number"
                  required={formData.entryMode === 'manual'}
                  min="0"
                  value={formData.calories}
                  onChange={(e) => setFormData({...formData, calories: e.target.value})}
                  disabled={formData.entryMode === 'food_item'}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Protein (g) {formData.entryMode === 'food_item' && <span className="text-xs text-gray-500">(auto-calculated)</span>}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) => setFormData({...formData, protein: e.target.value})}
                  disabled={formData.entryMode === 'food_item'}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carbs (g) {formData.entryMode === 'food_item' && <span className="text-xs text-gray-500">(auto-calculated)</span>}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) => setFormData({...formData, carbs: e.target.value})}
                  disabled={formData.entryMode === 'food_item'}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fat (g) {formData.entryMode === 'food_item' && <span className="text-xs text-gray-500">(auto-calculated)</span>}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.fat}
                  onChange={(e) => setFormData({...formData, fat: e.target.value})}
                  disabled={formData.entryMode === 'food_item'}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiber (g) {formData.entryMode === 'food_item' && <span className="text-xs text-gray-500">(auto-calculated)</span>}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.fiber}
                  onChange={(e) => setFormData({...formData, fiber: e.target.value})}
                  disabled={formData.entryMode === 'food_item'}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {editingEntry ? 'Update Entry' : 'Add Entry'}
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

      {/* Meal Breakdown */}
      {dailySummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Object.entries(dailySummary.meals).map(([mealType, mealData]) => (
            <div key={mealType} className="bg-white rounded-lg shadow p-4">
              <h4 className="font-medium text-gray-900 mb-2">{getMealDisplayName(mealType as MealType)}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Calories: {mealData.calories}</div>
                <div>Protein: {mealData.protein.toFixed(1)}g</div>
                <div>Entries: {mealData.entryCount}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calorie Entries List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Entries for {selectedDate}
          </h3>
        </div>
        
        {entries.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No calorie entries found for this date. Add your first entry above!
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <div key={entry.id.toString()} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mr-3">
                        {getMealDisplayName(entry.meal)}
                      </span>
                      {entry.food_name && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-3">
                          {entry.food_name}
                        </span>
                      )}
                      <span className="text-sm text-gray-600">Quantity: {entry.quantity}g</span>
                    </div>
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
                      className="text-orange-600 hover:text-orange-900 text-sm font-medium"
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