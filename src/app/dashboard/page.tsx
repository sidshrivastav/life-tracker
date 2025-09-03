'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../../utils/supabase/client'
import { getAllFoodEntries } from '../../../utils/database/foodEntry'

export default function Dashboard() {
  const [tables, setTables] = useState<any[]>([])
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...')
  const [foodEntriesTest, setFoodEntriesTest] = useState<string>('Testing...')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    testSupabaseConnection()
  }, [])

  const testSupabaseConnection = async () => {
    try {
      // Test basic connection
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Auth user:', user)
      
      if (user) {
        setConnectionStatus('✅ Connected to Supabase')
      } else {
        setConnectionStatus('⚠️ Connected but no user authenticated')
      }

      // Test common table names
      const commonTables = ['users', 'profiles', 'food_entries', 'Food Entries', 'FoodEntries']
      const existingTables = []
      
      for (const tableName of commonTables) {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (!error) {
          existingTables.push({ table_name: tableName, status: '✅ Exists' })
        } else {
          existingTables.push({ table_name: tableName, status: '❌ ' + error.message })
        }
      }
      
      setTables(existingTables)

      // Test getAllFoodEntries function without user requirement
      console.log('Testing getAllFoodEntries function...')
      try {
        const foodEntries = await getAllFoodEntries()
        setFoodEntriesTest(`✅ getAllFoodEntries works! Found ${foodEntries.length} entries`)
        console.log('Food entries:', foodEntries)
        
        // Test insert capability
        console.log('Testing insert capability...')
        const testEntry = {
          food_name: 'Test Food',
          calories: 100,
          protein: 10
        }
        
        const { data, error } = await supabase
          .from('Food Entries')
          .insert([testEntry])
          .select()
        
        if (error) {
          console.error('Insert test failed:', error)
          setFoodEntriesTest(prev => prev + `\n❌ Insert failed: ${error.message}`)
        } else {
          console.log('Insert test successful:', data)
          setFoodEntriesTest(prev => prev + `\n✅ Insert works!`)
          
          // Clean up test entry
          if (data && data[0]) {
            await supabase.from('Food Entries').delete().eq('id', data[0].id)
          }
        }
      } catch (error) {
        setFoodEntriesTest(`❌ getAllFoodEntries failed: ${error}`)
        console.error('getAllFoodEntries error:', error)
      }

    } catch (error) {
      console.error('Connection test failed:', error)
      setConnectionStatus('❌ Connection failed: ' + error)
      setFoodEntriesTest('❌ Cannot test - connection failed')
    }
    
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Supabase connection test and available tables</p>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Connection Status</h2>
        <p className="text-sm font-mono text-gray-900">{connectionStatus}</p>
      </div>

      {/* Food Entries Test */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">getAllFoodEntries Test</h2>
        <p className="text-sm font-mono text-gray-900">{foodEntriesTest}</p>
      </div>

      {/* Tables List */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Available Tables</h2>
        {loading ? (
          <p className="text-gray-900">Loading tables...</p>
        ) : tables.length === 0 ? (
          <p className="text-gray-500">No tables found or unable to access table information</p>
        ) : (
          <div className="space-y-2">
            {tables.map((table, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-mono text-sm text-gray-900">{table.table_name}</span>
                <span className="text-xs text-gray-700">{table.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          href="/dashboard/food"
          className="bg-white hover:bg-gray-50 rounded-lg shadow p-6 transition-colors duration-200 border border-gray-200 hover:border-indigo-300"
        >
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-500 rounded-md flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h3 className="ml-4 text-lg font-medium text-gray-900">Food Tracking</h3>
          </div>
          <p className="text-gray-600">Track your daily nutrition and calories</p>
        </a>
      </div>
    </div>
  )
}