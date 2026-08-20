import React from 'react';

export default function StatusBadge({ status }) {
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
        fontSize: '14px',
      }}
    >
      <span
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
        }}
      />
      <span>{status}</span>
    </div>
  );
}