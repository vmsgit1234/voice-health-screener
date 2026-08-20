import { WebSocketServer } from 'ws';
import { getAIResponse } from '../services/llmService.js';
import { textToSpeech } from '../services/ttsService.js';
import { generateHealthReport } from '../services/reportService.js';

export function setupCallWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    // Session context tracker
    const session = {
      transcriptHistory: [],
      isProcessing: false,
    };

    ws.on('message', async (message) => {
      try {
        const payload = JSON.parse(message.toString());

        switch (payload.event) {
          case 'START_CALL':
            session.transcriptHistory = [];
            ws.send(JSON.stringify({ event: 'STATUS', data: 'CONNECTED' }));
            break;

          case 'USER_TRANSCRIPT':
            // Append user response to transcript history
            session.transcriptHistory.push({ role: 'user', content: payload.text });

            // Generate LLM response based on context history
            const agentReplyText = await getAIResponse(session.transcriptHistory);
            session.transcriptHistory.push({ role: 'assistant', content: agentReplyText });

            // Send textual response back
            ws.send(JSON.stringify({ event: 'AGENT_TEXT', text: agentReplyText }));

            // Synthesize text to speech audio
            const audioBase64 = await textToSpeech(agentReplyText);
            ws.send(JSON.stringify({ event: 'AGENT_AUDIO', audio: audioBase64 }));
            break;

          case 'END_CALL':
            // Synthesize structured report on call termination
            const report = await generateHealthReport(session.transcriptHistory);
            ws.send(JSON.stringify({ event: 'FINAL_REPORT', report }));
            break;

          default:
            console.warn('Unknown event type:', payload.event);
        }
      } catch (err) {
        console.error('WebSocket message processing error:', err);
        ws.send(
          JSON.stringify({
            event: 'ERROR',
            message: 'Failed to process audio payload.',
          })
        );
      }
    });
  });
}