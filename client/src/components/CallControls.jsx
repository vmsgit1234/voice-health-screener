import React, { useState } from 'react';

export default function CallControls({ status, onStartCall, onEndCall, onSendText }) {
  const [inputText, setInputText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendText(inputText);
    setInputText('');
  };

  const isCallActive = status !== 'DISCONNECTED' && status !== 'COMPLETED' && status !== 'ERROR';

  return (
    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        {!isCallActive ? (
          <button
            onClick={onStartCall}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Start Call
          </button>
        ) : (
          <button
            onClick={onEndCall}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            End Call
          </button>
        )}
      </div>

      {isCallActive && (
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Type a message or speak..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '14px',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 18px',
              backgroundColor: '#2563EB',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}