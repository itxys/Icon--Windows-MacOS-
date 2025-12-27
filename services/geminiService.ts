
import { GoogleGenAI } from "@google/genai";

/**
 * Generates an icon image using the Gemini 2.5 Flash Image model.
 * @param prompt The user's description of the icon.
 * @param style The enhanced style instructions.
 * @returns A base64 encoded data URL for the generated image.
 */
export const generateIcon = async (prompt: string, style: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Construct an enhanced prompt to guide the model towards professional icon design.
  const enhancedPrompt = `Professional app icon design of ${prompt}. Style: ${style}. High resolution, 4k, centered, isolated on a simple neutral background, masterwork, masterpiece, trending on dribbble and behance. No text in the icon.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: enhancedPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // Validate candidates
    const candidate = response.candidates?.[0];
    if (!candidate) {
      throw new Error("The model failed to produce any response candidates.");
    }

    // Check for safety blocks or other finish reasons
    if (candidate.finishReason && !['STOP', 'MAX_TOKENS'].includes(candidate.finishReason)) {
      throw new Error(`Generation interrupted. Reason: ${candidate.finishReason}. This is often due to safety filter triggers.`);
    }

    let base64Data = '';
    let explanationText = '';

    // Iterate through response parts to find image data or explanatory text
    if (candidate.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          base64Data = part.inlineData.data;
          break; // Found the image
        } else if (part.text) {
          explanationText += part.text;
        }
      }
    }

    if (!base64Data) {
      if (explanationText) {
        throw new Error(`Model refused to generate image: ${explanationText}`);
      }
      throw new Error("Model returned a response but no image data was found. It might have been filtered or failed internally.");
    }

    return `data:image/png;base64,${base64Data}`;
  } catch (error: any) {
    console.error("Gemini AI Generation Failure:", error);
    
    // Provide a cleaner message for common API issues
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error("Invalid API Key. Please check your environment configuration.");
    }
    
    // Rethrow with original message if descriptive, otherwise generic
    throw new Error(error.message || "An unexpected error occurred while communicating with the AI service.");
  }
};
