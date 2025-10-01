import { GoogleGenAI, Type } from "@google/genai";
import { Platform, ImageFile, GeneratedListing } from '../types';

interface VerificationResult {
  success: boolean;
  message?: string;
}

/**
 * Performs a lightweight check to verify if the provided Gemini API key is valid.
 * @param apiKey The Google Gemini API key to verify.
 * @returns A promise that resolves to an object with a `success` boolean and an optional error `message`.
 */
export const verifyApiKey = async (apiKey: string): Promise<VerificationResult> => {
  if (!apiKey) {
    return { success: false, message: "API key cannot be empty." };
  }
  try {
    const ai = new GoogleGenAI({ apiKey });
    // This is a minimal, low-cost call to validate the key's authenticity.
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "hi",
    });
    return { success: true };
  } catch (error) {
    console.error("API Key validation failed:", error);
    if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('api key not valid')) {
            return { success: false, message: "The provided Gemini API key is invalid or has been revoked. Please double-check the key." };
        }
        if (errorMessage.includes('billing')) {
            return { success: false, message: "The API key seems valid, but billing is not enabled on the associated Google Cloud project. Please enable billing to proceed." };
        }
        if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
            return { success: false, message: "API key is valid, but you have exceeded your usage quota. Please check your Google Cloud account." };
        }
    }
    // Generic fallback for network errors or other unexpected issues
    return { success: false, message: "Could not verify the API key. Please check your network connection and try again." };
  }
};

const getPlatformInstructions = (platform: Platform): string => {
  switch (platform) {
    case Platform.Ebay:
      return "For eBay, create a compelling title with relevant keywords (max 80 chars). Write a detailed, structured HTML description using paragraphs (<p>), bullet points (<ul> and <li> tags), and bold text (<b> tags) to highlight key features and condition. Include sections for 'Item Specifics', 'Condition', and 'Shipping Information'.";
    case Platform.Facebook:
      return "For Facebook Marketplace, create a concise and friendly title. Write a clear, conversational description using simple paragraphs (separated by newlines) and emojis to improve readability. Focus on the item's benefits for a local buyer. Do not use any HTML tags. The output should be plain text with line breaks. Suggest 5-10 relevant tags.";
    case Platform.Craigslist:
      return "For Craigslist, create a straightforward, keyword-rich title. Write a simple text-based description. Emphasize the condition and price, and include a clear call to action for contacting the seller. Strictly do not use any HTML formatting; use plain text and line breaks only.";
    case Platform.X:
      return "For X.com (Twitter), generate a complete tweet to sell this item. The entire tweet, including hashtags, emojis, price, and call-to-action, must be placed in the 'description' field and must not exceed 280 characters. The 'title' field should be a very short, attention-grabbing phrase (e.g., 'For Sale!'). Use 3-5 relevant hashtags within the description.";
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
    
    Your task is to act as an expert e-commerce market analyst. Your analysis must be extremely thorough and follow these steps precisely:

    1.  **Primary Data Extraction (Highest Priority):**
        - If an image is provided, your absolute first step is to perform Optical Character Recognition (OCR) and barcode scanning on it.
        - Meticulously search for and extract any and all text, including brand names, model numbers, serial numbers, SKUs, ASINs, UPCs, or any other identifiers printed on the item or its packaging.
        - If you find a barcode, decode it and identify the product. This data is the most reliable source of truth.
        - **This step is non-negotiable. The accuracy of the entire listing depends on successfully extracting this information.**

    2.  **Visual Attribute Analysis:**
        - Identify the item's primary color(s), material (e.g., leather, plastic, metal, wood), texture, style, and any other distinctive visual features.
        - Note any visible signs of condition, such as wear, scratches, dents, or if it appears new or in its original packaging.

    3.  **Synthesize Item Identity:**
        - Using the extracted data from Step 1 as your primary source, and supplementing with the visual analysis from Step 2 and the user's text, determine the exact identity of the item.
        - The resulting 'itemName' must be as specific as possible. For example, instead of "Headphones", it should be "Used Sony WH-1000XM4 Wireless Noise Cancelling Headphones in Silver, model WH1000XM4/S". Prioritize model numbers and specific identifiers you found.

    4.  **Market-Driven Price Analysis:**
        - Based on the precise item identity, research the current market for this item on ${platform}.
        - Analyze recently sold listings in a similar condition to provide a data-driven price suggestion.
        - In the 'suggestedPrice' object, provide:
            - 'range': A competitive price range (e.g., "$200 - $250").
            - 'analysis': A brief (1-2 sentences) justification, e.g., "Based on 5 recently sold listings for this model in 'used' condition on eBay."
            - 'confidence': A score ('High', 'Medium', or 'Low') based on the volume and quality of pricing data available.

    5.  **Generate Optimized Listing:**
        - Generate a complete listing specifically optimized for ${platform}.
        - **Crucially, you must incorporate all the specific details you identified** (model number, color, material, condition) into both the title and description to maximize accuracy and appeal.
        - Follow these platform-specific instructions: ${platformInstructions}
    
    Return ONLY a valid JSON object that strictly adheres to the provided schema. Do not include any markdown formatting, explanatory text, or anything outside the JSON structure.
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
      itemName: { type: Type.STRING, description: "The specific name of the item identified, e.g., '2021 Apple MacBook Pro 14-inch'." },
      suggestedPrice: {
        type: Type.OBJECT,
        description: "A detailed pricing analysis.",
        properties: {
          range: { type: Type.STRING, description: "A competitive price range for the item, e.g., '$1200 - $1400'." },
          analysis: { type: Type.STRING, description: "A brief explanation of the reasoning behind the suggested price." },
          confidence: { type: Type.STRING, enum: ['High', 'Medium', 'Low'], description: "The confidence level of the pricing analysis." }
        },
        required: ["range", "analysis", "confidence"]
      },
      listing: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The listing title. Must follow platform-specific rules (e.g., max 80 chars for eBay, very short for X.com)." },
          description: { type: Type.STRING, description: "The listing description. Format must match platform requirements (e.g., HTML for eBay, plain text for Craigslist, full tweet for X.com)." },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of relevant keywords or tags for the listing (especially for Facebook Marketplace)."
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
    let parsedJson;
    try {
      parsedJson = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse JSON from API response:", jsonText);
      throw new Error("The AI returned an invalid response format. Please try generating the listing again.");
    }

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