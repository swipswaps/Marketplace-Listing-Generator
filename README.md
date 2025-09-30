# AI Marketplace Listing Generator

An AI-powered tool to automatically generate optimized product listings for eBay, Facebook Marketplace, Craigslist, and X.com (formerly Twitter) from an image or text description. It uses the Google Gemini API to analyze products, suggest pricing, and craft compelling listings tailored to each platform's best practices.

![App Screenshot](https://picsum.photos/1200/600?random=1)

---

## Features

- **Multi-Platform Support:** Generate listings for eBay, Facebook Marketplace, Craigslist, and X.com.
- **AI-Powered Content:** Leverages Gemini to identify products, suggest competitive pricing, and write titles and descriptions.
- **Bring Your Own API Key:** Securely add your own Google Gemini or other LLM API keys directly in the app.
- **Image & Text Input:** Create listings from a product photo, a text description, or both.
- **Optimized for Each Platform:** The AI generates content formatted according to the conventions of the selected marketplace.
- **Easy Copy-Paste:** A dedicated "Copy" button for each part of the listing makes transferring the content seamless.
- **Modern & Responsive UI:** Built with React and Tailwind CSS for a great experience on any device.

---

## User Guide

Follow these simple steps to generate your first listing:

1.  **Add Your API Key (Required):**
    *   Click the **Settings** (⚙️) icon in the top-right corner.
    *   In the modal that appears, paste your **Google Gemini API Key**. The app cannot function without it.
    *   Click "Save Keys". Your key is stored securely in your browser. See the "API Keys" section below for instructions on how to get one.

2.  **Select a Platform:** At the top of the page, click on the platform you want to sell on (e.g., eBay, Facebook Marketplace).

3.  **Provide Product Details:**
    *   **Upload an Image:** Click the "Upload Image" area or drag and drop a clear photo of your item.
    *   **Describe the Item:** In the text box, type a brief description of your item (brand, model, condition, etc.).
    *   *Pro Tip:* For the best results, provide both an image and a short text description.

4.  **Generate the Listing:** Click the "Generate Listing" button. The app will use your API key to send your information to the AI for analysis.

5.  **Review and Use:** The generated listing will appear on the right. Use the copy icons next to each field to copy the content to your clipboard and paste it into the listing form on your chosen marketplace.

---

## API Keys & Setup

This application requires you to provide your own API keys for AI and other services. All keys are stored securely in your browser's `localStorage` and are never shared with any third-party server.

### How to Add Your Keys

1.  Click the **Settings** (⚙️) icon in the top-right corner of the application header.
2.  A modal window will appear with input fields for your API keys.
3.  Paste your keys into the appropriate fields.
4.  Click "Save Keys".

### Obtaining API Keys

#### Google Gemini API Key (Required)

The Gemini key is **essential** for the app's core functionality of generating listings.

1.  Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and sign in with your Google account.
2.  Click the "**Create API key**" button.
3.  Copy the generated key and paste it into the "Google Gemini API Key" field in the app's settings.
4.  Ensure your Google Cloud project associated with the key has billing enabled, as it is required for API usage beyond the free tier.

#### OpenAI (ChatGPT) API Key (Optional)

This key can be used in future versions of the app that support ChatGPT.

1.  Sign up or log in at the [OpenAI Platform](https://platform.openai.com/).
2.  Navigate to the "API Keys" section in your user dashboard.
3.  Create a new secret key, copy it, and paste it into the "OpenAI (ChatGPT) API Key" field in the app's settings.

#### eBay API Key (Optional)

An eBay API key can enable more accurate pricing suggestions by analyzing current and sold listings.

1.  Go to the [eBay Developers Program](https://developer.ebay.com/) and create a developer account.
2.  Navigate to "API Keys" in your dashboard and generate a new key set for a "Production" environment.
3.  Copy the `App ID (Client ID)` and paste it into the "eBay API Key" field in the app's settings.

#### X.com (Twitter) API Key (Optional)

An X.com API key is required to enable features for posting listings directly to your X.com account.

1.  Apply for a developer account at the [X Developer Platform](https://developer.twitter.com/).
2.  Once approved, create a new "Project" and then a new "App" within it.
3.  Navigate to the "Keys and Tokens" tab for your app and generate your keys.
4.  Copy the "API Key" and paste it into the "X.com (Twitter) API Key" field in the app's settings.

---

## Troubleshooting

### **Error: "Google Gemini API key is missing..."**

-   **Cause:** You have not yet added your Gemini API key.
-   **Solution:** Click the settings (⚙️) icon, paste your Gemini API key into the correct field, and click "Save Keys".

### **Error: "The provided Gemini API key is not valid..."**

-   **Cause:** The key you entered is incorrect, has been revoked, or is not associated with an active billing account.
-   **Solution:**
    1.  Go back to the [Google AI Studio](https://aistudio.google.com/app/apikey) and copy your key again to ensure it's correct.
    2.  Verify there are no extra spaces or characters when you paste it into the settings.
    3.  Confirm that the Google Cloud project for your API key has billing enabled.

### **Generated Listing is Inaccurate or Low Quality**

-   **Cause:** The AI's output depends on the quality of your input.
-   **Solution:**
    1.  **Improve Your Image:** Use a clear, high-resolution photo in good lighting.
    2.  **Refine Your Description:** Add specific details like brand, model, size, color, and condition. (e.g., "Used Dell XPS 15 9510, minor scratches on lid" is better than "used laptop").

---

This project is a demonstration of the power of generative AI in practical e-commerce applications. Happy selling!