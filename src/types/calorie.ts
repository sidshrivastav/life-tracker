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
}

// For form data (before sending to database)
export interface CalorieEntryInput {
  meal: MealType;
  quantity: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  date: string;
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

// Calorie entry with calculated percentages
export interface CalorieEntryWithPercentages extends CalorieEntry {
  proteinPercentage?: number;
  carbsPercentage?: number;
  fatPercentage?: number;
}