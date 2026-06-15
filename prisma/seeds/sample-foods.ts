// Sample common foods for testing. Full USDA import comes later.

const foods = [
  // Proteins
  { name: "Chicken Breast", brand: null, servingSize: 100, servingUnit: "g", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugars: 0 },
  { name: "Salmon Fillet", brand: null, servingSize: 100, servingUnit: "g", calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugars: 0 },
  { name: "Eggs", brand: null, servingSize: 100, servingUnit: "g", calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugars: 1 },
  { name: "Ground Beef 85%", brand: null, servingSize: 100, servingUnit: "g", calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugars: 0 },
  { name: "Tuna (canned in water)", brand: null, servingSize: 100, servingUnit: "g", calories: 116, protein: 26, carbs: 0, fat: 0.8, fiber: 0, sugars: 0 },
  { name: "Tofu", brand: null, servingSize: 100, servingUnit: "g", calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, sugars: 0 },
  { name: "Greek Yogurt", brand: null, servingSize: 170, servingUnit: "g", calories: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0, sugars: 5 },

  // Carbs
  { name: "White Rice (cooked)", brand: null, servingSize: 150, servingUnit: "g", calories: 205, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6, sugars: 0.1 },
  { name: "Brown Rice (cooked)", brand: null, servingSize: 150, servingUnit: "g", calories: 218, protein: 4.5, carbs: 46, fat: 1.6, fiber: 3.5, sugars: 0 },
  { name: "Pasta (cooked)", brand: null, servingSize: 140, servingUnit: "g", calories: 220, protein: 8, carbs: 43, fat: 1.3, fiber: 2.5, sugars: 0.8 },
  { name: "Bread (whole wheat)", brand: null, servingSize: 32, servingUnit: "g", calories: 81, protein: 4, carbs: 14, fat: 1.1, fiber: 2, sugars: 1.4 },
  { name: "Oatmeal (cooked)", brand: null, servingSize: 234, servingUnit: "g", calories: 166, protein: 6, carbs: 28, fat: 3.6, fiber: 4, sugars: 0.6 },
  { name: "Sweet Potato", brand: null, servingSize: 150, servingUnit: "g", calories: 129, protein: 2.4, carbs: 30, fat: 0.1, fiber: 4.5, sugars: 6.3 },
  { name: "Quinoa (cooked)", brand: null, servingSize: 185, servingUnit: "g", calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5, sugars: 1.6 },

  // Vegetables
  { name: "Broccoli", brand: null, servingSize: 91, servingUnit: "g", calories: 31, protein: 2.6, carbs: 6, fat: 0.3, fiber: 2.4, sugars: 1.5 },
  { name: "Spinach (raw)", brand: null, servingSize: 30, servingUnit: "g", calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, fiber: 0.7, sugars: 0.1 },
  { name: "Avocado", brand: null, servingSize: 100, servingUnit: "g", calories: 160, protein: 2, carbs: 8.5, fat: 15, fiber: 6.7, sugars: 0.7 },
  { name: "Carrots", brand: null, servingSize: 100, servingUnit: "g", calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sugars: 4.7 },
  { name: "Tomato", brand: null, servingSize: 123, servingUnit: "g", calories: 22, protein: 1.1, carbs: 4.8, fat: 0.2, fiber: 1.5, sugars: 3.2 },
  { name: "Cucumber", brand: null, servingSize: 100, servingUnit: "g", calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, sugars: 1.7 },

  // Fruits
  { name: "Banana", brand: null, servingSize: 118, servingUnit: "g", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, sugars: 14 },
  { name: "Apple", brand: null, servingSize: 182, servingUnit: "g", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, sugars: 19 },
  { name: "Orange", brand: null, servingSize: 140, servingUnit: "g", calories: 69, protein: 1.3, carbs: 18, fat: 0.2, fiber: 2.8, sugars: 12 },
  { name: "Blueberries", brand: null, servingSize: 148, servingUnit: "g", calories: 84, protein: 1.1, carbs: 21, fat: 0.5, fiber: 3.6, sugars: 15 },
  { name: "Strawberries", brand: null, servingSize: 152, servingUnit: "g", calories: 49, protein: 1, carbs: 12, fat: 0.5, fiber: 3, sugars: 7 },

  // Dairy
  { name: "Whole Milk", brand: null, servingSize: 244, servingUnit: "ml", calories: 149, protein: 8, carbs: 12, fat: 8, fiber: 0, sugars: 12 },
  { name: "Cheddar Cheese", brand: null, servingSize: 28, servingUnit: "g", calories: 115, protein: 7, carbs: 0.9, fat: 9.4, fiber: 0, sugars: 0.1 },
  { name: "Cottage Cheese", brand: null, servingSize: 113, servingUnit: "g", calories: 110, protein: 13, carbs: 5, fat: 4.3, fiber: 0, sugars: 4 },

  // Nuts & Seeds
  { name: "Almonds", brand: null, servingSize: 28, servingUnit: "g", calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5, sugars: 1.2 },
  { name: "Peanut Butter", brand: null, servingSize: 32, servingUnit: "g", calories: 190, protein: 8, carbs: 6, fat: 16, fiber: 2, sugars: 3 },
  { name: "Walnuts", brand: null, servingSize: 28, servingUnit: "g", calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5, fiber: 1.9, sugars: 0.7 },
  { name: "Chia Seeds", brand: null, servingSize: 28, servingUnit: "g", calories: 138, protein: 4.7, carbs: 12, fat: 8.7, fiber: 9.8, sugars: 0 },

  // Fats & Oils
  { name: "Olive Oil", brand: null, servingSize: 15, servingUnit: "ml", calories: 119, protein: 0, carbs: 0, fat: 13.5, fiber: 0, sugars: 0 },
  { name: "Butter", brand: null, servingSize: 14, servingUnit: "g", calories: 102, protein: 0.1, carbs: 0, fat: 11.5, fiber: 0, sugars: 0 },

  // Common Meals
  { name: "Chicken Rice Bowl", brand: null, servingSize: 350, servingUnit: "g", calories: 550, protein: 40, carbs: 55, fat: 14, fiber: 3, sugars: 2 },
  { name: "Protein Shake (whey)", brand: null, servingSize: 330, servingUnit: "ml", calories: 180, protein: 30, carbs: 8, fat: 3, fiber: 0, sugars: 2 },
  { name: "Caesar Salad", brand: null, servingSize: 250, servingUnit: "g", calories: 350, protein: 20, carbs: 12, fat: 25, fiber: 3, sugars: 2 },
  { name: "Burger (beef patty + bun)", brand: null, servingSize: 200, servingUnit: "g", calories: 540, protein: 34, carbs: 32, fat: 30, fiber: 1, sugars: 6 },
  { name: "Pizza Slice", brand: null, servingSize: 120, servingUnit: "g", calories: 285, protein: 12, carbs: 36, fat: 10, fiber: 2, sugars: 4 },
  { name: "Sushi Roll (8 pieces)", brand: null, servingSize: 200, servingUnit: "g", calories: 300, protein: 12, carbs: 48, fat: 4, fiber: 2, sugars: 4 },
  { name: "Omelette (3 eggs)", brand: null, servingSize: 200, servingUnit: "g", calories: 370, protein: 25, carbs: 3, fat: 28, fiber: 0, sugars: 2 },
  { name: "Pasta Bolognese", brand: null, servingSize: 400, servingUnit: "g", calories: 620, protein: 32, carbs: 65, fat: 22, fiber: 5, sugars: 8 },

  // Drinks
  { name: "Coffee (black)", brand: null, servingSize: 240, servingUnit: "ml", calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0, sugars: 0 },
  { name: "Orange Juice", brand: null, servingSize: 240, servingUnit: "ml", calories: 110, protein: 2, carbs: 26, fat: 0.5, fiber: 0.5, sugars: 21 },
  { name: "Coca-Cola", brand: null, servingSize: 355, servingUnit: "ml", calories: 140, protein: 0, carbs: 39, fat: 0, fiber: 0, sugars: 39 },
  { name: "Beer (lager)", brand: null, servingSize: 355, servingUnit: "ml", calories: 153, protein: 1.6, carbs: 13, fat: 0, fiber: 0, sugars: 0 },
];

export default foods;
