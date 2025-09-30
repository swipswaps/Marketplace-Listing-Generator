
# AI Marketplace Listing Generator

An AI-powered tool to automatically generate optimized product listings for eBay, Facebook Marketplace, Craigslist, and X.com (formerly Twitter) from an image or text description. It uses the Google Gemini API to analyze products, suggest pricing, and craft compelling listings tailored to each platform's best practices.

![App Screenshot](https://picsum.photos/1200/600?random=1)

---

## Features

- **Multi-Platform Support:** Generate listings for eBay, Facebook Marketplace, Craigslist, and X.com.
- **AI-Powered Content:** Leverages Gemini to identify products, suggest competitive pricing, and write titles and descriptions.
- **Image & Text Input:** Create listings from a product photo, a text description, or both.
- **Optimized for Each Platform:** The AI generates content formatted according to the conventions of the selected marketplace.
- **Easy Copy-Paste:** A dedicated "Copy" button for each part of the listing makes transferring the content seamless.
- **Modern & Responsive UI:** Built with React and Tailwind CSS for a great experience on any device.

---

## User Guide

Follow these simple steps to generate your first listing:

1.  **Select a Platform:** At the top of the page, click on the platform you want to sell on (e.g., eBay, Facebook Marketplace). The selected platform will be highlighted.

2.  **Provide Product Details:** You have two options:
    *   **Upload an Image:** Click the "Upload Image" area or drag and drop a clear, well-lit photo of your item. A preview of the image will appear.
    *   **Describe the Item:** In the text box, type a brief description of your item. Include any important details like brand, model, condition, or unique features.
    *   *Pro Tip:* For the best results, provide both an image and a short text description.

3.  **Generate the Listing:** Click the "Generate Listing" button. The app will send your information to the AI for analysis. Please be patient, as this may take a few moments. A loading indicator will show that it's working.

4.  **Review and Use:** The generated listing will appear on the right side of the screen. It will include:
    *   A suggested title.
    *   A suggested price range.
    *   A detailed description formatted for your chosen platform.
    *   Suggested tags (for platforms like Facebook Marketplace).

5.  **Copy and Paste:** Use the copy icons next to each field to copy the content to your clipboard. Then, paste it directly into the listing form on the eBay, Facebook, Craigslist, or X.com website/app.

---

## Development Setup

This project is a single-page React application. To run it locally, you'll need Node.js and a package manager like npm or yarn.

### Environment Variables

The application requires a Google Gemini API key to function. This key must be provided as an environment variable.

1.  **Obtain a Gemini API Key:** Visit the [Google AI Studio](https://aistudio.google.com/app/apikey) to get your API key.
2.  **Create an Environment File:** In the root of the project, create a file named `.env`.
3.  **Add the API Key:** Add your API key to the `.env` file like this. **The application code expects the key via `process.env.API_KEY`**. If you are using a bundler like Vite, it will expose variables prefixed with `VITE_`. For this project, a build setup would need to map `VITE_GEMINI_API_KEY` to `process.env.API_KEY`. For simplicity in a local dev server context, you might see this:

    ```
    # .env
    API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```
    *Note: A standard Create React App or Vite setup is required to load these environment variables into the application. The provided code assumes `process.env.API_KEY` is correctly populated in the execution environment.*

---

## Troubleshooting

Encountering an issue? Here are some common problems and their solutions.

### **Error: API key not valid. Please pass a valid API key.**

-   **Cause:** The Gemini API key is missing, incorrect, or has not been properly loaded into the application's environment.
-   **Solution:**
    1.  Double-check that you have a `.env` file in the project root.
    2.  Verify that the key inside the `.env` file is correct and has no extra spaces or characters.
    3.  Ensure your Google Cloud project associated with the key has billing enabled, as it is required for API usage.
    4.  If you've just added the `.env` file, you **must restart your development server** for the changes to take effect.

### **Generated Listing is Inaccurate or Low Quality**

-   **Cause:** The AI's output is highly dependent on the quality of the input you provide.
-   **Solution:**
    1.  **Improve Your Image:** Use a clear, high-resolution photo taken in good lighting. Make sure the item is the main focus of the image.
    2.  **Refine Your Description:** Add more specific details to the text description. Include brand, model, size, color, and condition. For example, instead of "used laptop," try "Used Dell XPS 15 9510, minor scratches on lid, fully functional."
    3.  **Regenerate:** Sometimes the AI might not get it right on the first try. Simply click "Generate Listing" again.

### **The "Generate Listing" Button is Disabled**

-   **Cause:** You must provide either an image or a text description before you can generate a listing.
-   **Solution:** Upload an image or type a description in the text box. The button will become active once you've provided input.

### **The App is Stuck on Loading**

-   **Cause:** This could be due to a slow internet connection or a temporary issue with the Gemini API.
-   **Solution:**
    1.  Wait a little longer, as complex image analysis can take time.
    2.  Check your internet connection.
    3.  If it persists, try refreshing the page and starting over. Check the [Google Cloud Status Dashboard](https://status.cloud.google.com/) for any reported API outages.

---

This project is a demonstration of the power of generative AI in practical e-commerce applications. Happy selling!
