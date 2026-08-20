import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config/env.js';

// System prompt instructing the AI on intake role, tone, and question pacing
export const INTAKE_SYSTEM_PROMPT = `
You are an empathetic medical intake voice assistant conducting a preliminary health screening.
Your goal is to collect the following information efficiently and gently:
1. Patient's Name
2. Primary Symptom / Chief Complaint
3. Onset and Duration (When did it start?)
4. Severity rating (1 to 10 or qualitative description)
5. Any secondary or associated symptoms

RULES:
- Ask only ONE question at a time.
- Keep responses concise (maximum 1-2 short sentences) since your output will be converted to speech.
- Be supportive and professional.
- If the user's response is vague, ask a brief clarifying follow-up.
- Speak in simple language, avoiding overly complex clinical terminology.
- You can communicate in English or Hindi depending on the language used by the user.
`;

export async function getAIResponse(transcriptHistory) {
  try {
    if (!GEMINI_API_KEY) {
      console.error('CRITICAL: GEMINI_API_KEY is missing in server/.env');
      return 'Server API key configuration is missing. Please update server/.env with a valid key.';
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // Format conversation turns for the Gemini SDK
    const contents = transcriptHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Prioritize gemini-3.6-flash as instructed by the Google Gemini API error response
    const modelsToTry = [
      'gemini-3.6-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash-latest',
    ];

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting AI generation with model: ${modelName}`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: INTAKE_SYSTEM_PROMPT,
        });

        const result = await model.generateContent({ contents });
        const response = await result.response;
        const responseText = response.text();

        if (responseText) {
          console.log(`Gemini AI (${modelName}) response received successfully.`);
          return responseText;
        }
      } catch (modelErr) {
        console.warn(`Model ${modelName} call failed:`, modelErr.message);
      }
    }

    console.log('SDK attempts failed, attempting direct REST endpoint fallback with gemini-3.6-flash...');
    const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;

    const restResponse = await fetch(restUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: INTAKE_SYSTEM_PROMPT }] },
        contents: contents,
      }),
    });

    if (restResponse.ok) {
      const restData = await restResponse.json();
      const restText = restData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (restText) {
        console.log('Gemini REST API fallback succeeded.');
        return restText;
      }
    } else {
      const errText = await restResponse.text();
      console.error('REST API fallback error:', errText);
    }

    throw new Error('All model generation attempts exhausted.');
  } catch (error) {
    console.error('Error generating AI response from Gemini API:', error);
    return 'I am having trouble connecting to the medical AI service. Please check your backend terminal logs.';
  }
}