// Database entity for food entries
export interface FoodEntry {
  id: bigint;
  created_at: string;
  food_name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  user_id: string; // UUID as string
}

// For form data (before sending to database)
export interface FoodEntryInput {
  food_name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
}

// For creating new food entries (without id and timestamps)
export interface CreateFoodEntry {
  food_name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  user_id: string; // UUID as string
}

// For updating existing food entries
export interface UpdateFoodEntry {
  food_name?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

// Nutritional summary for daily/weekly views
export interface NutritionalSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  entryCount: number;
}

// Food entry with calculated percentages
export interface FoodEntryWithPercentages extends FoodEntry {
  proteinPercentage?: number;
  carbsPercentage?: number;
  fatPercentage?: number;
}
