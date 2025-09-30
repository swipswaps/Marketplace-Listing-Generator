import { GoogleGenAI, Type } from "@google/genai";
import { Platform, ImageFile, GeneratedListing } from '../types';

/**
 * Performs a lightweight check to verify if the provided Gemini API key is valid.
 * @param apiKey The Google Gemini API key to verify.
 * @returns A promise that resolves to `true` if the key is valid, otherwise `false`.
 */
export const verifyApiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) {
    return false;
  }
  try {
    const ai = new GoogleGenAI({ apiKey });
    // This is a minimal, low-cost call to validate the key's authenticity.
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "hi",
    });
    return true;
  } catch (error) {
    console.error("API Key validation failed:", error);
    // An error during this minimal call strongly suggests an invalid key or configuration issue.
    return false;
  }
};

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
  apiKey: string,
  image?: ImageFile
): Promise<GeneratedListing> => {
    
  if (!apiKey) {
    throw new Error("Google Gemini API key is missing. Please add it in the Settings panel.");
  }

  const ai = new GoogleGenAI({ apiKey });
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
    
    if (!parsedJson.listing || !parsedJson.listing.title) {
        throw new Error("Invalid JSON structure received from API.");
    }

    return parsedJson as GeneratedListing;

  } catch (error) {
    console.error("Full API Error:", error);

    if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes('api key not valid')) {
            throw new Error("The provided Gemini API key is not valid. Please check the key in the Settings panel and ensure it's correct.");
        }
        if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
            throw new Error("You've exceeded your API request limit. Please check your Google Cloud account for usage details or try again later.");
        }
        if (errorMessage.includes('safety')) {
             throw new Error("The request was blocked by the AI's safety filters. Please try rephrasing your description or using a different image.");
        }
        if (errorMessage.includes('fetch')) {
             throw new Error("A network error occurred. Please check your internet connection and try again.");
        }
    }
    
    // Fallback for other API errors or unexpected issues
    throw new Error("Failed to generate the listing. The AI service may be temporarily unavailable. Please try again later.");
  }
};