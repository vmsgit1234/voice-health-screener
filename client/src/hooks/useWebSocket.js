import { useState, useEffect, useRef, useCallback } from 'react';

export function useWebSocket(url = 'ws://localhost:5000') {
  const [status, setStatus] = useState('DISCONNECTED');
  const [transcript, setTranscript] = useState([]);
  const [report, setReport] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    let socket;
    try {
      socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connected');
        setStatus('CONNECTED');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.event) {
            case 'STATUS':
              setStatus(data.data);
              break;
            case 'AGENT_TEXT':
              setStatus('SPEAKING');
              setTranscript((prev) => [
                ...prev,
                { role: 'assistant', content: data.text },
              ]);
              break;
            case 'AGENT_AUDIO':
              if (data.audio) {
                try {
                  const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
                  audio.onended = () => setStatus('CONNECTED');
                  audio.play().catch((err) => console.error('Audio playback error:', err));
                } catch (audioErr) {
                  console.error('Audio object error:', audioErr);
                }
              } else {
                setStatus('CONNECTED');
              }
              break;
            case 'FINAL_REPORT':
              setReport(data.report);
              setStatus('COMPLETED');
              break;
            case 'ERROR':
              console.error('Server error:', data.message);
              setStatus('ERROR');
              break;
            default:
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      socket.onerror = (err) => {
        console.error('WebSocket connection error:', err);
        setStatus('DISCONNECTED');
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
        setStatus('DISCONNECTED');
      };
    } catch (e) {
      console.error('WebSocket initialization error:', e);
      setStatus('DISCONNECTED');
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [url]);

  const startCall = useCallback(() => {
    setTranscript([]);
    setReport(null);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ event: 'START_CALL' }));
    }
  }, []);

  const sendUserTranscript = useCallback((text) => {
    if (!text || !text.trim()) return;
    setTranscript((prev) => [...prev, { role: 'user', content: text }]);
    setStatus('THINKING');
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ event: 'USER_TRANSCRIPT', text }));
    }
  }, []);

  const endCall = useCallback(() => {
    setStatus('THINKING');
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ event: 'END_CALL' }));
    }
  }, []);

  return {
    status,
    transcript,
    report,
    startCall,
    sendUserTranscript,
    endCall,
  };
}