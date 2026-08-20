import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config/env.js';

export async function generateHealthReport(transcriptHistory) {
  if (!transcriptHistory || transcriptHistory.length === 0) {
    return {
      status: 'INCOMPLETE',
      summary: 'Call ended before intake details could be gathered.',
      details: {},
    };
  }

  const prompt = `
Analyze the following healthcare intake transcript and extract structured clinical information.

Transcript:
${JSON.stringify(transcriptHistory, null, 2)}

Return a JSON object matching this exact structure:
{
  "patientName": "Extracted name or 'Not Provided'",
  "chiefComplaint": "Primary symptom or reason for call",
  "duration": "Duration of symptoms",
  "severity": "Severity description or scale (e.g. 7/10)",
  "associatedSymptoms": ["List of other symptoms mentioned"],
  "summary": "Brief 2-3 sentence overview of the conversation",
  "flaggedFollowUp": "Any urgent items or red flags noted"
}
`;

  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY missing in server configuration');
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    const modelsToTry = [
      'gemini-3.6-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash-latest',
    ];

    for (const modelName of modelsToTry) {
      try {
        console.log(`Generating health report with model: ${modelName}`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: 'application/json' },
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        if (responseText) {
          return JSON.parse(responseText);
        }
      } catch (modelErr) {
        console.warn(`Report generation with model ${modelName} failed:`, modelErr.message);
      }
    }

    console.log('SDK report generation failed, trying direct REST endpoint...');
    const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;

    const restResponse = await fetch(restUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generationConfig: { responseMimeType: 'application/json' },
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (restResponse.ok) {
      const restData = await restResponse.json();
      const restText = restData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (restText) {
        return JSON.parse(restText);
      }
    }

    throw new Error('Report generation failed across all fallback models.');
  } catch (error) {
    console.error('Error generating health report:', error);
    return {
      status: 'INCOMPLETE',
      summary: 'Error generating health report summary from transcript.',
      details: {},
    };
  }
}