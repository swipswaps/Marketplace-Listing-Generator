interface VerificationResult {
  success: boolean;
  message?: string;
}

/**
 * Verifies an OpenAI API key by making a lightweight API call.
 * @param apiKey The OpenAI API key to verify.
 * @returns A promise resolving to a verification result.
 */
export const verifyApiKey = async (apiKey: string): Promise<VerificationResult> => {
    if (!apiKey) {
        return { success: false, message: "API key cannot be empty." };
    }
    if (!apiKey.startsWith('sk-')) {
        return { success: false, message: "Invalid format. OpenAI keys must start with 'sk-'." };
    }
    
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (response.ok) {
            return { success: true };
        } else {
            const errorData = await response.json();
            const errorMessage = errorData?.error?.message || `Verification failed with status: ${response.status}.`;
            return { success: false, message: `OpenAI API Error: ${errorMessage}` };
        }
    } catch (error) {
        console.error("OpenAI Key validation failed:", error);
        return { success: false, message: "Could not verify the key. Check network connection or CORS policy." };
    }
};