
import { GoogleGenAI } from "@google/genai";

export const optimizeDescription = async (name: string, category: string, rawDesc: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert copywriter for a premium celebration and event directory in Qatar. 
      Rewrite the following vendor description to be more engaging, professional, and friendly for users planning parties.
      Business Title: ${name}
      Business Category: ${category}
      Original Description: ${rawDesc}
      
      Guidelines:
      1. Keep it to 2-3 short, impactful sentences.
      2. Focus on the quality, reliability, and the premium experience created for guests.
      3. Use a tone that appeals to anyone looking for the best event services in Qatar (weddings, birthdays, corporate, etc.).`,
    });
    return response.text?.trim() || rawDesc;
  } catch (error) {
    console.error("Gemini AI error:", error);
    return rawDesc;
  }
};
