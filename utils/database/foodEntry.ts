import { supabase } from './supabase';

export interface FoodEntry {
  id: number;
  created_at: string;
  food_name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface FoodEntryInsert {
  food_name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

// Get all entries
export const getFoodEntries = async (): Promise<FoodEntry[]> => {
  const { data: FoodEntries, error } = await supabase
    .from('Food Entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching entries:', error);
    return [];
  }

  return FoodEntries || [];
};

// Add a new food entry
export const addFoodEntry = async (entry: FoodEntryInsert): Promise<FoodEntry | null> => {
  console.log('Adding food entry:', entry);
  
  const { data: FoodEntries, error } = await supabase
    .from('Food Entries')
    .insert([entry])
    .select();

  if (error) {
    console.error('Error adding entry:', error);
    console.error('Entry data:', entry);
    return null;
  }

  if (!FoodEntries || FoodEntries.length === 0) {
    console.error('No data returned from insert');
    return null;
  }

  return FoodEntries[0];
};


// Delete a food entry
export const deleteFoodEntry = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('Food Entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting entry:', error);
    return false;
  }

  return true;
};

// Update a food entry
export const updateFoodEntry = async (id: number, updates: Partial<FoodEntryInsert>): Promise<FoodEntry | null> => {
  const { data: FoodEntries, error } = await supabase
    .from('Food Entries')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating entry:', error);
    return null;
  }

  if (!FoodEntries || FoodEntries.length === 0) {
    console.error('No data returned from update');
    return null;
  }

  return FoodEntries[0];
};

// Get nutrition totals for all entries
export const getNutritionTotals = async () => {
  const { data: FoodEntries, error } = await supabase
    .from('Food Entries')
    .select('calories, protein, carbs, fat, fiber');

  if (error) {
    console.error('Error fetching nutrition totals:', error);
    return null;
  }

  // Calculate totals
  const totals = FoodEntries.reduce((acc: any, entry) => {
    acc.calories += entry.calories || 0;
    acc.protein += entry.protein || 0;
    acc.carbs += entry.carbs || 0;
    acc.fat += entry.fat || 0;
    acc.fiber += entry.fiber || 0;
    
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  return totals;
};

// Get entries (alias for getAllFoodEntries)
export const getFoodEntriesRange = async (): Promise<FoodEntry[]> => {
  return getAllFoodEntries();
};

// Get total calories for all entries
export const getTotalCalories = async (): Promise<number> => {
  const { data: FoodEntries, error } = await supabase
    .from('Food Entries')
    .select('calories');

  if (error) {
    console.error('Error fetching total calories:', error);
    return 0;
  }

  return FoodEntries.reduce((total, entry) => total + (entry.calories || 0), 0);
};

// Search food entries by name
export const searchFoodEntries = async (searchTerm: string): Promise<FoodEntry[]> => {
  let query = supabase
    .from('Food Entries')
    .select('*');

  // Only add search filter if searchTerm is provided
  if (searchTerm && searchTerm.trim()) {
    query = query.ilike('food_name', `%${searchTerm}%`);
  }

  const { data: FoodEntries, error } = await query
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error searching entries:', error);
    return [];
  }

  return FoodEntries || [];
};

// Get all food entries (for database view)
export const getAllFoodEntries = async (): Promise<FoodEntry[]> => {
  console.log('getAllFoodEntries called');
  
  const { data: FoodEntries, error } = await supabase
    .from('Food Entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all entries:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    return [];
  }

  console.log(`Found ${FoodEntries?.length || 0} entries in Food Entries table`);
  return FoodEntries || [];
};
