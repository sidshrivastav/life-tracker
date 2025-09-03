import { SupabaseClient } from '@supabase/supabase-js';

// Enum for meal types
export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack'
}

// Database entity for calorie entries
export interface CalorieEntry {
  id: bigint;
  created_at: string;
  meal: MealType;
  quantity: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  date: string; // Date as string
  user_id: string; // UUID as string
  meal_item?: bigint; // Foreign key to Food Entries
}

// For creating new calorie entries (without id and timestamps)
export interface CreateCalorieEntry {
  meal: MealType;
  quantity: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  user_id: string; // UUID as string
  meal_item?: number; // Foreign key to Food Entries (converted from bigint)
}

// For updating existing calorie entries
export interface UpdateCalorieEntry {
  meal?: MealType;
  quantity?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  meal_item?: number; // Foreign key to Food Entries (converted from bigint)
}

// CalorieEntry with joined Food Entry data
export interface CalorieEntryWithFood extends CalorieEntry {
  food_name?: string; // From joined Food Entries table
}

// Daily nutritional summary for calorie entries
export interface DailyCalorieSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalQuantity: number;
  entryCount: number;
  meals: {
    [key in MealType]: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      quantity: number;
      entryCount: number;
    };
  };
}

// Get entries for a specific user
export const getCalorieEntries = async (supabase: SupabaseClient, userId: string): Promise<CalorieEntry[]> => {
  const { data: CalorieEntries, error } = await supabase
    .from('Calorie Entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching calorie entries:', error);
    return [];
  }

  return CalorieEntries || [];
};

// Add a new calorie entry
export const addCalorieEntry = async (supabase: SupabaseClient, entry: CreateCalorieEntry): Promise<CalorieEntry | null> => {
  console.log('Adding calorie entry:', entry);
  
  const { data: CalorieEntries, error } = await supabase
    .from('Calorie Entries')
    .insert([entry])
    .select();

  if (error) {
    console.error('Error adding calorie entry:', error);
    console.error('Entry data:', entry);
    return null;
  }

  if (!CalorieEntries || CalorieEntries.length === 0) {
    console.error('No data returned from insert');
    return null;
  }

  return CalorieEntries[0];
};

// Delete a calorie entry
export const deleteCalorieEntry = async (supabase: SupabaseClient, id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('Calorie Entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting calorie entry:', error);
    return false;
  }

  return true;
};

// Update a calorie entry
export const updateCalorieEntry = async (supabase: SupabaseClient, id: number, updates: UpdateCalorieEntry): Promise<CalorieEntry | null> => {
  const { data: CalorieEntries, error } = await supabase
    .from('Calorie Entries')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating calorie entry:', error);
    return null;
  }

  if (!CalorieEntries || CalorieEntries.length === 0) {
    console.error('No data returned from update');
    return null;
  }

  return CalorieEntries[0];
};

// Get nutrition totals for a specific user
export const getNutritionTotals = async (supabase: SupabaseClient, userId: string) => {
  const { data: CalorieEntries, error } = await supabase
    .from('Calorie Entries')
    .select('calories, protein, carbs, fat, fiber, quantity')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching nutrition totals:', error);
    return null;
  }

  // Calculate totals
  const totals = CalorieEntries.reduce((acc: any, entry) => {
    acc.calories += entry.calories || 0;
    acc.protein += entry.protein || 0;
    acc.carbs += entry.carbs || 0;
    acc.fat += entry.fat || 0;
    acc.fiber += entry.fiber || 0;
    acc.quantity += entry.quantity || 0;
    
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, quantity: 0 });

  return totals;
};

// Get entries for a specific user and date range
export const getCalorieEntriesRange = async (supabase: SupabaseClient, userId: string, startDate?: string, endDate?: string): Promise<CalorieEntry[]> => {
  let query = supabase
    .from('Calorie Entries')
    .select('*')
    .eq('user_id', userId);

  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data: CalorieEntries, error } = await query
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching calorie entries range:', error);
    return [];
  }

  return CalorieEntries || [];
};

// Get total calories for a specific user
export const getTotalCalories = async (supabase: SupabaseClient, userId: string): Promise<number> => {
  const { data: CalorieEntries, error } = await supabase
    .from('Calorie Entries')
    .select('calories')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching total calories:', error);
    return 0;
  }

  return CalorieEntries.reduce((total, entry) => total + (entry.calories || 0), 0);
};

// Get entries for a specific date
export const getCalorieEntriesByDate = async (supabase: SupabaseClient, userId: string, date: string): Promise<CalorieEntry[]> => {
  const { data: CalorieEntries, error } = await supabase
    .from('Calorie Entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching calorie entries by date:', error);
    return [];
  }

  return CalorieEntries || [];
};

// Get entries for a specific date with food names
export const getCalorieEntriesByDateWithFood = async (supabase: SupabaseClient, userId: string, date: string): Promise<CalorieEntryWithFood[]> => {
  const { data: CalorieEntries, error } = await supabase
    .from('Calorie Entries')
    .select(`
      *,
      food_name:Food Entries(food_name)
    `)
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching calorie entries with food by date:', error);
    return [];
  }

  // Transform the joined data
  const transformedEntries = CalorieEntries?.map((entry: any) => ({
    ...entry,
    food_name: entry.food_name?.food_name || null
  })) || [];

  return transformedEntries;
};

// Get entries by meal type
export const getCalorieEntriesByMeal = async (supabase: SupabaseClient, userId: string, meal: MealType, date?: string): Promise<CalorieEntry[]> => {
  let query = supabase
    .from('Calorie Entries')
    .select('*')
    .eq('user_id', userId)
    .eq('meal', meal);

  if (date) {
    query = query.eq('date', date);
  }

  const { data: CalorieEntries, error } = await query
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching calorie entries by meal:', error);
    return [];
  }

  return CalorieEntries || [];
};

// Get daily summary for a specific date
export const getDailyCalorieSummary = async (supabase: SupabaseClient, userId: string, date: string): Promise<DailyCalorieSummary | null> => {
  const { data: CalorieEntries, error } = await supabase
    .from('Calorie Entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date);

  if (error) {
    console.error('Error fetching daily calorie summary:', error);
    return null;
  }

  if (!CalorieEntries || CalorieEntries.length === 0) {
    return {
      date,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      totalQuantity: 0,
      entryCount: 0,
      meals: {
        [MealType.BREAKFAST]: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, quantity: 0, entryCount: 0 },
        [MealType.LUNCH]: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, quantity: 0, entryCount: 0 },
        [MealType.DINNER]: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, quantity: 0, entryCount: 0 },
        [MealType.SNACK]: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, quantity: 0, entryCount: 0 }
      }
    };
  }

  // Initialize summary
  const summary: DailyCalorieSummary = {
    date,
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalFiber: 0,
    totalQuantity: 0,
    entryCount: CalorieEntries.length,
    meals: {
      [MealType.BREAKFAST]: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, quantity: 0, entryCount: 0 },
      [MealType.LUNCH]: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, quantity: 0, entryCount: 0 },
      [MealType.DINNER]: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, quantity: 0, entryCount: 0 },
      [MealType.SNACK]: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, quantity: 0, entryCount: 0 }
    }
  };

  // Calculate totals
  CalorieEntries.forEach((entry) => {
    const calories = entry.calories || 0;
    const protein = entry.protein || 0;
    const carbs = entry.carbs || 0;
    const fat = entry.fat || 0;
    const fiber = entry.fiber || 0;
    const quantity = entry.quantity || 0;

    // Add to totals
    summary.totalCalories += calories;
    summary.totalProtein += protein;
    summary.totalCarbs += carbs;
    summary.totalFat += fat;
    summary.totalFiber += fiber;
    summary.totalQuantity += quantity;

    // Add to meal-specific totals
    const meal = entry.meal as MealType;
    if (summary.meals[meal]) {
      summary.meals[meal].calories += calories;
      summary.meals[meal].protein += protein;
      summary.meals[meal].carbs += carbs;
      summary.meals[meal].fat += fat;
      summary.meals[meal].fiber += fiber;
      summary.meals[meal].quantity += quantity;
      summary.meals[meal].entryCount += 1;
    }
  });

  return summary;
};

// Get all calorie entries for a specific user
export const getAllCalorieEntries = async (supabase: SupabaseClient, userId: string): Promise<CalorieEntry[]> => {
  console.log('getAllCalorieEntries called for user:', userId);
  
  const { data: CalorieEntries, error } = await supabase
    .from('Calorie Entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all calorie entries:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    return [];
  }

  console.log(`Found ${CalorieEntries?.length || 0} entries in Calorie Entries table`);
  return CalorieEntries || [];
};

// Get all food entries for selection dropdown
export const getFoodEntriesForSelection = async (supabase: SupabaseClient, userId: string): Promise<{ id: bigint; food_name: string; calories: number; protein?: number; carbs?: number; fat?: number; fiber?: number }[]> => {
  const { data: FoodEntries, error } = await supabase
    .from('Food Entries')
    .select('id, food_name, calories, protein, carbs, fat, fiber')
    .eq('user_id', userId)
    .order('food_name', { ascending: true });

  if (error) {
    console.error('Error fetching food entries for selection:', error);
    return [];
  }

  return FoodEntries || [];
};