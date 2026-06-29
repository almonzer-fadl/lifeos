// Open Food Facts API — free, no API key needed
// https://world.openfoodfacts.org/api/v2

const BASE = "https://world.openfoodfacts.org/api/v2";

export interface OFFProduct {
  code: string;
  product_name: string;
  brands: string;
  brands_tags: string[];
  quantity: string;
  categories: string;
  image_url: string;
  image_small_url: string;
  image_thumb_url: string;
  nutriments: {
    energy_100g?: number;
    energy_kcal_100g?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    sugars_100g?: number;
    fat_100g?: number;
    saturated_fat_100g?: number;
    fiber_100g?: number;
    sodium_100g?: number;
    salt_100g?: number;
    "energy-kcal_serving"?: number;
    proteins_serving?: number;
    carbohydrates_serving?: number;
    sugars_serving?: number;
    fat_serving?: number;
    saturated_fat_serving?: number;
    fiber_serving?: number;
    sodium_serving?: number;
    salt_serving?: number;
  };
  nutriscore_grade?: string;
  nova_group?: number;
  ingredients_text?: string;
  allergens?: string;
  traces?: string;
  serving_size?: string;
  serving_quantity?: number;
}

export interface OFFSearchResult {
  count: number;
  page: number;
  page_count: number;
  page_size: number;
  products: OFFProduct[];
}

export async function getProductByBarcode(barcode: string): Promise<OFFProduct | null> {
  const res = await fetch(`${BASE}/product/${encodeURIComponent(barcode)}`);
  if (!res.ok) throw new Error(`Open Food Facts: ${res.status}`);
  const data = await res.json();
  return data.product || null;
}

export async function searchProducts(
  query: string,
  page = 1,
  pageSize = 20
): Promise<OFFSearchResult> {
  const params = new URLSearchParams({
    search_terms: query,
    page: String(page),
    page_size: String(pageSize),
    json: "1",
    fields: "code,product_name,brands,quantity,image_url,image_thumb_url,categories,nutriments,nutriscore_grade,nova_group,serving_size",
  });

  const res = await fetch(`${BASE}/search?${params}`, {
    headers: { "User-Agent": "LifeOS/1.0 (personal health app)" },
  });
  if (!res.ok) throw new Error(`Open Food Facts: ${res.status}`);
  return res.json();
}

// Convert OFF product to our FoodItem model shape
export function toFoodItemRecord(p: OFFProduct) {
  return {
    name: p.product_name || "Unknown Product",
    brand: p.brands || null,
    barcode: p.code,
    servingSize: p.serving_quantity || 100,
    servingUnit: p.serving_size || "g",
    calories: (p.nutriments as Record<string, number>)?.["energy-kcal_100g"] || p.nutriments?.energy_kcal_100g || null,
    protein: p.nutriments?.proteins_100g || null,
    carbs: p.nutriments?.carbohydrates_100g || null,
    fat: p.nutriments?.fat_100g || null,
    fiber: p.nutriments?.fiber_100g || null,
    sugars: p.nutriments?.sugars_100g || null,
    saturatedFat: p.nutriments?.saturated_fat_100g || null,
    sodium: p.nutriments?.sodium_100g !== undefined ? p.nutriments.sodium_100g / 1000 : null, // convert mg to g if needed
  };
}
