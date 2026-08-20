import React, { useState, useEffect, useRef, useCallback, Component } from 'react';

// Error Boundary component to capture unexpected errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error in application:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', margin: '30px auto', maxWidth: '650px', backgroundColor: '#FEE2E2', border: '1px solid #EF4444', borderRadius: '12px', color: '#991B1B', fontFamily: 'system-ui, sans-serif' }}>
          <h2 style={{ marginTop: 0 }}>Runtime Error Captured</h2>
          <p style={{ fontFamily: 'monospace', backgroundColor: '#FCA5A5', padding: '10px', borderRadius: '6px', color: '#7F1D1D' }}>
            {this.state.error?.toString()}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '8px 16px', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function StatusBadge({ status }) {
  const getStatusColor = () => {
    switch (status) {
      case 'CONNECTED':
      case 'LISTENING':
        return '#10B981'; // Green
      case 'THINKING':
        return '#F59E0B'; // Amber
      case 'SPEAKING':
        return '#3B82F6'; // Blue
      case 'COMPLETED':
        return '#6366F1'; // Indigo
      case 'ERROR':
        return '#EF4444'; // Red
      case 'DISCONNECTED':
      default:
        return '#6B7280'; // Gray
    }
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        borderRadius: '20px',
        backgroundColor: '#F3F4F6',
        fontWeight: 'bold',
        fontSize: '13px',
        color: '#374151',
      }}
    >
      <span
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
          boxShadow: status === 'LISTENING' || status === 'SPEAKING' ? `0 0 10px ${getStatusColor()}` : 'none',
        }}
      />
      <span>{status}</span>
    </div>
  );
}

function AudioVisualizer({ isActive, mode, isMicListening }) {
  if (!isActive && !isMicListening) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 0', backgroundColor: mode === 'SPEAKING' ? '#EFF6FF' : '#ECFDF5', borderRadius: '8px', marginBottom: '12px' }}>
      <span style={{ fontSize: '14px', fontWeight: 'bold', color: mode === 'SPEAKING' ? '#2563EB' : '#059669', marginRight: '8px' }}>
        {mode === 'SPEAKING' ? '🔊 AI Assistant is Speaking...' : '🎙️ Microphone Active — Speak Now...'}
      </span>
      {[0.4, 0.8, 0.5, 0.9, 0.6, 0.3].map((heightScale, idx) => (
        <div
          key={idx}
          style={{
            width: '4px',
            height: `${24 * heightScale}px`,
            backgroundColor: mode === 'SPEAKING' ? '#3B82F6' : '#10B981',
            borderRadius: '4px',
            animation: 'pulseWave 1s infinite alternate',
            animationDelay: `${idx * 0.15}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes pulseWave {
          0% { transform: scaleY(0.4); opacity: 0.5; }
          100% { transform: scaleY(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function Transcript({ transcript, liveSpeechText }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, liveSpeechText]);

  if ((!transcript || transcript.length === 0) && !liveSpeechText) {
    return (
      <div style={{ padding: '36px 20px', color: '#9CA3AF', textAlign: 'center', border: '2px dashed #E5E7EB', borderRadius: '12px', margin: '15px 0' }}>
        <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>
          No conversation history yet. Click <strong>Start Live Voice Call</strong> to begin hands-free voice intake.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxHeight: '320px',
        overflowY: 'auto',
        padding: '16px',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        backgroundColor: '#FAFAFA',
        margin: '15px 0',
      }}
    >
      {transcript.map((msg, index) => {
        const isUser = msg.role === 'user';
        return (
          <div
            key={index}
            style={{
              alignSelf: isUser ? 'flex-end' : 'flex-start',
              backgroundColor: isUser ? '#2563EB' : '#FFFFFF',
              color: isUser ? '#FFFFFF' : '#1F2937',
              border: isUser ? 'none' : '1px solid #E5E7EB',
              padding: '12px 16px',
              borderRadius: '14px',
              maxWidth: '80%',
              fontSize: '14px',
              lineHeight: '1.5',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: '11px', opacity: 0.75, marginBottom: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {isUser ? 'You (Voice / Text)' : 'AI Health Assistant'}
            </div>
            <div>{msg.content}</div>
          </div>
        );
      })}

      {liveSpeechText && (
        <div
          style={{
            alignSelf: 'flex-end',
            backgroundColor: '#DBEAFE',
            color: '#1E40AF',
            border: '1px dashed #3B82F6',
            padding: '10px 14px',
            borderRadius: '12px',
            maxWidth: '80%',
            fontSize: '14px',
            fontStyle: 'italic',
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }}>Recording voice...</div>
          <div>{liveSpeechText}</div>
        </div>
      )}
    </div>
  );
}

function CallControls({ status, isMicListening, isVoiceMuted, toggleMute, onStartCall, onEndCall, onToggleMic, onSendText }) {
  const [inputText, setInputText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendText(inputText);
    setInputText('');
  };

  const isCallActive = status !== 'DISCONNECTED' && status !== 'COMPLETED' && status !== 'ERROR';

  return (
    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
        {!isCallActive ? (
          <button
            onClick={onStartCall}
            style={{
              padding: '14px 32px',
              fontSize: '16px',
              fontWeight: '700',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>🎤</span> Start Live Voice Call
          </button>
        ) : (
          <>
            {/* Primary Microphone Push/Toggle Button */}
            <button
              onClick={onToggleMic}
              style={{
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: '700',
                backgroundColor: isMicListening ? '#DC2626' : '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: isMicListening ? '0 0 15px rgba(220, 38, 38, 0.5)' : '0 4px 10px rgba(37, 99, 235, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '18px' }}>{isMicListening ? '🛑' : '🎙️'}</span>
              <span>{isMicListening ? 'Stop Recording' : 'Push to Speak (Mic)'}</span>
            </button>

            <button
              onClick={onEndCall}
              style={{
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              🛑 End Call & Report
            </button>

            <button
              onClick={toggleMute}
              style={{
                padding: '12px 16px',
                fontSize: '13px',
                fontWeight: '600',
                backgroundColor: isVoiceMuted ? '#F3F4F6' : '#E0E7FF',
                color: isVoiceMuted ? '#4B5563' : '#3730A3',
                border: '1px solid #C7D2FE',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              {isVoiceMuted ? '🔇 Unmute Voice AI' : '🔊 Voice AI Active'}
            </button>
          </>
        )}
      </div>

      {isCallActive && (
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Type your response OR click 'Push to Speak' above..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '12px 20px',
              backgroundColor: '#4B5563',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Send Text
          </button>
        </form>
      )}
    </div>
  );
}

function HealthReport({ report }) {
  if (!report) return null;

  if (report.status === 'INCOMPLETE') {
    return (
      <div
        style={{
          marginTop: '24px',
          padding: '18px',
          backgroundColor: '#FEF3C7',
          border: '1px solid #F59E0B',
          borderRadius: '10px',
        }}
      >
        <h3 style={{ margin: '0 0 6px 0', color: '#92400E', fontSize: '16px' }}>⚠️ Incomplete Intake Session</h3>
        <p style={{ margin: 0, color: '#B45309', fontSize: '14px' }}>{report.summary}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: '24px',
        padding: '24px',
        border: '1px solid #10B981',
        borderRadius: '12px',
        backgroundColor: '#ECFDF5',
        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
      }}
    >
      <h2 style={{ marginTop: 0, color: '#065F46', fontSize: '18px', borderBottom: '1px solid #A7F3D0', paddingBottom: '10px' }}>
        📋 Synthesized Health Intake Report
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
          margin: '18px 0',
          fontSize: '14px',
        }}
      >
        <div>
          <strong style={{ color: '#047857' }}>Patient Name:</strong> {report.patientName || 'Not Provided'}
        </div>
        <div>
          <strong style={{ color: '#047857' }}>Chief Complaint:</strong> {report.chiefComplaint || 'Not Provided'}
        </div>
        <div>
          <strong style={{ color: '#047857' }}>Onset / Duration:</strong> {report.duration || 'Not Provided'}
        </div>
        <div>
          <strong style={{ color: '#047857' }}>Severity:</strong> {report.severity || 'Not Provided'}
        </div>
      </div>

      {report.associatedSymptoms && report.associatedSymptoms.length > 0 && (
        <div style={{ marginBottom: '14px', fontSize: '14px' }}>
          <strong style={{ color: '#047857' }}>Associated Symptoms:</strong>
          <ul style={{ margin: '6px 0 0 20px', padding: 0 }}>
            {report.associatedSymptoms.map((sym, idx) => (
              <li key={idx} style={{ color: '#064E3B' }}>{sym}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginBottom: '14px', fontSize: '14px' }}>
        <strong style={{ color: '#047857' }}>Clinical Summary:</strong>
        <p style={{ margin: '6px 0 0 0', color: '#064E3B', lineHeight: '1.5' }}>{report.summary}</p>
      </div>

      {report.flaggedFollowUp && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            color: '#991B1B',
            fontSize: '13px',
          }}
        >
          <strong>⚠️ Flagged Red Flags / Follow-Up:</strong> {report.flaggedFollowUp}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [status, setStatus] = useState('DISCONNECTED');
  const [transcript, setTranscript] = useState([]);
  const [report, setReport] = useState(null);
  const [liveSpeechText, setLiveSpeechText] = useState('');
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false);

  const socketRef = useRef(null);
  const recognitionRef = useRef(null);
  const isCallActiveRef = useRef(false);

  // Dynamic WebSocket URL handling both production (Vercel/Render) and local dev
  const getWsUrl = () => {
    let customWsUrl = null;
    try {
      if (typeof window !== 'undefined' && window.VITE_WS_URL) {
        customWsUrl = window.VITE_WS_URL;
      } else if (typeof process !== 'undefined' && process.env && process.env.VITE_WS_URL) {
        customWsUrl = process.env.VITE_WS_URL;
      }
    } catch (e) {
      // Ignored
    }

    if (customWsUrl) {
      return customWsUrl;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//localhost:5000`;
  };

  // Text-to-Speech Output Function
  const speakText = useCallback((text) => {
    if (isVoiceMuted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setStatus('SPEAKING');
      stopSpeechRecognition();
    };

    utterance.onend = () => {
      if (isCallActiveRef.current) {
        setStatus('LISTENING');
        startSpeechRecognition();
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [isVoiceMuted]);

  // Speech-to-Text Recognition Initializer
  const startSpeechRecognition = useCallback(() => {
    if (!isCallActiveRef.current) return;

    // BARGE-IN FEATURE: If AI is currently speaking, immediately interrupt/cancel speech synthesis
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Web Speech API is not supported in this browser.");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // BARGE-IN TRIGGER: Cancel AI audio as soon as user sound/speech is detected
      recognition.onspeechstart = () => {
        if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      };

      recognition.onstart = () => {
        setIsMicListening(true);
        setStatus('LISTENING');
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setLiveSpeechText(interimTranscript || finalTranscript);

        if (finalTranscript.trim()) {
          setLiveSpeechText('');
          setIsMicListening(false);
          sendUserTranscript(finalTranscript);
        }
      };

      recognition.onerror = (err) => {
        console.warn("Speech recognition warning/pause:", err.error);
        setIsMicListening(false);
      };

      recognition.onend = () => {
        setIsMicListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setIsMicListening(false);
    }
  }, []);

  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsMicListening(false);
  }, []);

  const toggleMicListening = useCallback(() => {
    // BARGE-IN FEATURE: Interrupt speech synthesis if active when mic button is clicked
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    if (isMicListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  }, [isMicListening, startSpeechRecognition, stopSpeechRecognition]);

  const startCall = useCallback(() => {
    setTranscript([]);
    setReport(null);
    setLiveSpeechText('');
    isCallActiveRef.current = true;

    try {
      const wsUrl = getWsUrl();
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus('CONNECTED');
        socket.send(JSON.stringify({ event: 'START_CALL' }));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'STATUS') setStatus(data.data);

          if (data.event === 'AGENT_TEXT') {
            setTranscript((prev) => [...prev, { role: 'assistant', content: data.text }]);
            speakText(data.text);
          }

          if (data.event === 'FINAL_REPORT') {
            setReport(data.report);
            setStatus('COMPLETED');
            isCallActiveRef.current = false;
            stopSpeechRecognition();
            window.speechSynthesis.cancel();
          }
        } catch (e) {
          console.error("Error parsing WebSocket message:", e);
        }
      };

      socket.onerror = (err) => {
        console.warn("WebSocket server not reachable, using direct AI simulation mode:", err);
        runSimulatedCall();
      };

      socket.onclose = () => {
        if (isCallActiveRef.current) setStatus('DISCONNECTED');
      };
    } catch (err) {
      runSimulatedCall();
    }
  }, [speakText, stopSpeechRecognition]);

  const runSimulatedCall = () => {
    setStatus('CONNECTED');
    const greeting = "Hello! I am your AI Health Screening Assistant. May I have your full name, please?";
    setTranscript([{ role: 'assistant', content: greeting }]);
    speakText(greeting);
  };

  const sendUserTranscript = useCallback((text) => {
    if (!text || !text.trim()) return;

    setTranscript((prev) => [...prev, { role: 'user', content: text }]);
    setStatus('THINKING');

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ event: 'USER_TRANSCRIPT', text }));
    }
  }, []);

  const endCall = useCallback(() => {
    isCallActiveRef.current = false;
    setStatus('THINKING');
    stopSpeechRecognition();
    window.speechSynthesis.cancel();

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ event: 'END_CALL' }));
    }
  }, [stopSpeechRecognition]);

  const toggleMute = () => {
    setIsVoiceMuted((prev) => !prev);
    if (!isVoiceMuted) window.speechSynthesis.cancel();
  };

  return (
    <ErrorBoundary>
      <div
        style={{
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          maxWidth: '750px',
          margin: '30px auto',
          padding: '28px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
          borderRadius: '16px',
          backgroundColor: '#FFFFFF',
          color: '#111827',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid #F3F4F6',
            paddingBottom: '18px',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1F2937' }}>
              Voice Health Intake Screener
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
              Live Conversational AI Voice Intake & Synthesized Report
              <span style={{ marginLeft: '8px', color: '#2563EB', fontWeight: 'bold' }}>⚡ Barge-In Enabled</span>
            </p>
          </div>
          <StatusBadge status={status} />
        </header>

        <main>
          <AudioVisualizer isActive={status === 'SPEAKING'} mode={status} isMicListening={isMicListening} />
          <Transcript transcript={transcript} liveSpeechText={liveSpeechText} />
          <CallControls
            status={status}
            isMicListening={isMicListening}
            isVoiceMuted={isVoiceMuted}
            toggleMute={toggleMute}
            onStartCall={startCall}
            onEndCall={endCall}
            onToggleMic={toggleMicListening}
            onSendText={sendUserTranscript}
          />
          <HealthReport report={report} />
        </main>
      </div>
    </ErrorBoundary>
  );
}