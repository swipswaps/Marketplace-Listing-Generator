import { PriceHistoryPoint } from '../types';

/**
 * Simulates a call to the eBay API to fetch recent sales data for a given item.
 * In a real application, this would make an authenticated request to an endpoint
 * like the eBay Finding API. For this demo, it generates mock data.
 * @param itemName The name of the item to search for.
 * @param apiKey The user's eBay API key.
 * @returns A promise that resolves to an array of price history points or null if no key is provided.
 */
export const fetchPriceHistory = async (
  itemName: string,
  apiKey: string,
): Promise<PriceHistoryPoint[] | null> => {
  if (!apiKey || !itemName) {
    // Don't attempt to fetch if the API key or item name is missing.
    return null;
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // --- Mock Data Generation ---
  // This section simulates a real API response.
  const data: PriceHistoryPoint[] = [];
  const numPoints = 15; // Number of sales data points to generate
  const basePrice = 100 + Math.random() * 50; // Random base price for variety
  const today = new Date();

  for (let i = numPoints - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i * 2); // Data points spread over the last 30 days

    // Generate a price with some realistic variance
    const price = basePrice + (Math.random() - 0.5) * (basePrice * 0.2);

    data.push({
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      price: parseFloat(price.toFixed(2)),
    });
  }

  return data;
};
