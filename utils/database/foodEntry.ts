import { SupabaseClient } from '@supabase/supabase-js';

export interface FoodEntry {
  id: number;
  created_at: string;
  food_name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  user_id: string; // UUID as string
}

export interface FoodEntryInsert {
  food_name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  user_id: string; // UUID as string
}

// Get entries for a specific user
export const getFoodEntries = async (supabase: SupabaseClient, userId: string): Promise<FoodEntry[]> => {
  const { data: FoodEntries, error } = await supabase
    .from('Food Entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching entries:', error);
    return [];
  }

  return FoodEntries || [];
};

// Add a new food entry
export const addFoodEntry = async (supabase: SupabaseClient, entry: FoodEntryInsert): Promise<FoodEntry | null> => {
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
export const deleteFoodEntry = async (supabase: SupabaseClient, id: number): Promise<boolean> => {
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
export const updateFoodEntry = async (supabase: SupabaseClient, id: number, updates: Partial<FoodEntryInsert>): Promise<FoodEntry | null> => {
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

// Get nutrition totals for a specific user
export const getNutritionTotals = async (supabase: SupabaseClient, userId: string) => {
  const { data: FoodEntries, error } = await supabase
    .from('Food Entries')
    .select('calories, protein, carbs, fat, fiber')
    .eq('user_id', userId);

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

// Get entries for a specific user (alias for getAllFoodEntries)
export const getFoodEntriesRange = async (supabase: SupabaseClient, userId: string): Promise<FoodEntry[]> => {
  return getAllFoodEntries(supabase, userId);
};

// Get total calories for a specific user
export const getTotalCalories = async (supabase: SupabaseClient, userId: string): Promise<number> => {
  const { data: FoodEntries, error } = await supabase
    .from('Food Entries')
    .select('calories')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching total calories:', error);
    return 0;
  }

  return FoodEntries.reduce((total, entry) => total + (entry.calories || 0), 0);
};

// Search food entries by name for a specific user
export const searchFoodEntries = async (supabase: SupabaseClient, userId: string, searchTerm: string): Promise<FoodEntry[]> => {
  let query = supabase
    .from('Food Entries')
    .select('*')
    .eq('user_id', userId);

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

// Get all food entries for a specific user
export const getAllFoodEntries = async (supabase: SupabaseClient, userId: string): Promise<FoodEntry[]> => {
  console.log('getAllFoodEntries called for user:', userId);
  
  const { data: FoodEntries, error } = await supabase
    .from('Food Entries')
    .select('*')
    .eq('user_id', userId)
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
