import React from 'react';

export default function Transcript({ transcript }) {
  if (!transcript || transcript.length === 0) {
    return (
      <div style={{ padding: '20px', color: '#9CA3AF', textAlign: 'center' }}>
        No conversation history yet. Start a call to begin screening.
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxHeight: '350px',
        overflowY: 'auto',
        padding: '10px',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        backgroundColor: '#FAFAFA',
      }}
    >
      {transcript.map((msg, index) => {
        const isUser = msg.role === 'user';
        return (
          <div
            key={index}
            style={{
              alignSelf: isUser ? 'flex-end' : 'flex-start',
              backgroundColor: isUser ? '#2563EB' : '#E5E7EB',
              color: isUser ? '#FFFFFF' : '#1F2937',
              padding: '10px 14px',
              borderRadius: '12px',
              maxWidth: '75%',
              fontSize: '14px',
              lineHeight: '1.4',
            }}
          >
            <strong>{isUser ? 'You' : 'Assistant'}:</strong> {msg.content}
          </div>
        );
      })}
    </div>
  );
}