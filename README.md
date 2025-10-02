# AI Marketplace Listing Generator

An AI-powered tool to automatically generate optimized product listings for eBay, Facebook Marketplace, Craigslist, and X.com (formerly Twitter) from an image or text description. It uses the Google Gemini API to analyze products, suggest pricing, and craft compelling listings tailored to each platform's best practices.

![App Screenshot](https://picsum.photos/1200/600?random=1)

---

## Features

- **Multi-Platform Support:** Generate listings for eBay, Facebook Marketplace, Craigslist, and X.com.
- **AI-Powered Content:** Leverages Gemini to identify products, suggest competitive pricing, and write titles and descriptions.
- **Full Listing Management (CRUD):** Create, view, search, sort, update, and delete your listings.
- **Advanced Exporting:** Download any listing as a PDF, DOC, TXT, JSON, CSV, or SQL file for easy record-keeping.
- **Image & Text Input:** Create listings from a product photo, a text description, or both.
- **Camera Support:** Capture a product image directly using your system or a USB camera.
- **Optimized for Each Platform:** The AI generates content formatted according to the conventions of the selected marketplace.
- **Modern & Responsive UI:** Built with React and Tailwind CSS for a great experience on any device.

---

## User Guide

Follow these simple steps to generate and manage your listings:

1.  **Add Your API Key (Required):**
    *   Click the **Settings** (⚙️) icon in the top-right corner.
    *   In the modal that appears, paste your **Google Gemini API Key**. The app cannot function without it.
    *   Click "Save Keys". Your key is stored securely in your browser.

2.  **Select a Platform:** At the top of the page, click on the platform you want to sell on (e.g., eBay, Facebook Marketplace).

3.  **Provide Product Details:**
    *   **Upload an Image:** Use the file uploader or drag and drop a clear photo of your item.
    *   **Use Camera:** Switch to the camera tab to capture a photo directly.
    *   **Describe the Item:** In the text box, type a brief description of your item (brand, model, condition, etc.).
    *   *Pro Tip:* For the best results, provide both an image and a short text description.

4.  **Generate the Listing:** Click the "Generate Listing" button.

5.  **Save the Listing:**
    *   Once the listing appears, click the **"Save Listing"** button.
    *   Give it a custom title (or use the suggested one) and click "Save". It will now appear in your "Saved" tab.

---

## Managing Your Listings

The app includes powerful features to organize your work.

### Searching and Sorting
-   Use the **search bar** above the History/Saved tabs to filter listings by title, description, or your original input text.
-   Use the **sort dropdown** to organize your lists by date, item name, or platform.

### Editing a Saved Listing
1.  Go to the **"Saved"** tab.
2.  Hover over the listing you wish to change. An **edit icon (pencil)** will appear.
3.  Click the edit icon to open a modal where you can update the custom title, listing title, and description.
4.  Click "Save Changes" to update the listing.

### Deleting Listings
-   Hover over any item in the **"History"** or **"Saved"** list.
-   A **delete icon (trash can)** will appear. Click it to permanently remove the item.

---

## Exporting Listings

You can download any generated listing in various formats for your records.

1.  Generate a new listing or select an existing one from your History/Saved list.
2.  Click the **"Actions"** dropdown menu in the top-right of the listing preview.
3.  Select **"Export As..."**.
4.  In the modal that appears, choose your desired format:
    *   **PDF:** A print-friendly document.
    *   **Word (DOC):** A basic document compatible with Microsoft Word.
    *   **Text (TXT):** A plain text file with all listing details.
    *   **JSON:** A structured data file, useful for developers.
    *   **CSV:** A comma-separated file, easily opened in spreadsheet software like Excel or Google Sheets.
    *   **SQL:** An `INSERT` statement for use in a database.

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

#### eBay API Key (Optional)

An eBay API key can enable more accurate pricing suggestions by analyzing current and sold listings.

1.  Go to the [eBay Developers Program](https://developer.ebay.com/) and create a developer account.
2.  Navigate to "API Keys" in your dashboard and generate a new key set for a "Production" environment.
3.  Copy the `App ID (Client ID)` and paste it into the "eBay API Key" field in the app's settings.

---

## Troubleshooting

### **Error: "Google Gemini API key is missing..."**

-   **Cause:** You have not yet added your Gemini API key.
-   **Solution:** Click the settings (⚙️) icon, paste your Gemini API key into the correct field, and click "Save Keys".

### **Generated Listing is Inaccurate or Low Quality**

-   **Cause:** The AI's output depends on the quality of your input.
-   **Solution:**
    1.  **Improve Your Image:** Use a clear, high-resolution photo in good lighting.
    2.  **Refine Your Description:** Add specific details like brand, model, size, color, and condition. (e.g., "Used Dell XPS 15 9510, minor scratches on lid" is better than "used laptop").

---

This project is a demonstration of the power of generative AI in practical e-commerce applications. Happy selling!