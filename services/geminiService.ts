
import { GoogleGenAI, Type } from "@google/genai";
import { Platform, ImageFile, GeneratedListing } from '../types';

const getPlatformInstructions = (platform: Platform): string => {
  switch (platform) {
    case Platform.Ebay:
      return "For eBay, create a compelling title with relevant keywords (max 80 chars). Write a detailed, structured HTML description using paragraphs, bullet points with <li> tags, and bold text with <b> tags to highlight key features and condition. Include sections for 'Item Specifics', 'Condition', and 'Shipping Information'.";
    case Platform.Facebook:
      return "For Facebook Marketplace, create a concise and friendly title. Write a clear, easy-to-read description using simple language and emojis. Focus on the item's benefits for a local buyer. Suggest 5-10 relevant tags.";
    case Platform.Craigslist:
      return "For Craigslist, create a straightforward, keyword-rich title. Write a simple text-based description. Emphasize the condition and price, and include a clear call to action for contacting the seller. Do not use any HTML formatting.";
    case Platform.X:
      return "For X.com (Twitter), create a very short, catchy post (under 280 characters) to sell this item. Use 3-5 relevant hashtags and emojis. Include a clear call to action, like 'DM to buy!'. State the price clearly.";
    default:
      return "Generate a standard product listing.";
  }
};

const buildPrompt = (platform: Platform, text: string, image?: ImageFile): any[] => {
  const parts: any[] = [];

  if (image) {
    parts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: image.base64,
      },
    });
  }

  const platformInstructions = getPlatformInstructions(platform);
  const userTextPrompt = `
    I want to create a listing for ${platform}.
    ${text ? `Based on the following user description: "${text}".` : ""}
    
    Your task is to:
    1.  Identify the item from the image and/or description. Be as specific as possible (e.g., '2021 Apple MacBook Pro 14-inch with M1 Pro chip, 16GB RAM, 512GB SSD, Space Gray').
    2.  Based on current market trends for similar sold items, suggest a competitive price range (e.g., "$1200 - $1400").
    3.  Generate a complete listing optimized for ${platform}.
    4.  ${platformInstructions}
    
    Return ONLY a valid JSON object matching the provided schema. Do not include markdown formatting or any text before or after the JSON object.
  `;

  parts.push({ text: userTextPrompt });
  return parts;
};

export const generateListing = async (
  platform: Platform,
  text: string,
  image?: ImageFile
): Promise<GeneratedListing> => {
    
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured. Please set the API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contents = { parts: buildPrompt(platform, text, image) };

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      itemName: { type: Type.STRING },
      suggestedPrice: { type: Type.STRING },
      listing: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["title", "description"],
      },
    },
    required: ["itemName", "suggestedPrice", "listing"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.5,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    
    // Quick validation
    if (!parsedJson.listing || !parsedJson.listing.title) {
        throw new Error("Invalid JSON structure received from API.");
    }

    return parsedJson as GeneratedListing;

  } catch (error) {
    console.error("Error generating listing:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error("The provided Gemini API key is not valid. Please check your configuration.");
        }
    }
    throw new Error("Failed to generate listing from Gemini API.");
  }
};