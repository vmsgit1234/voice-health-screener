import React from 'react';

export default function HealthReport({ report }) {
  if (!report) return null;

  if (report.status === 'INCOMPLETE') {
    return (
      <div
        style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#FEF3C7',
          border: '1px solid #F59E0B',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', color: '#92400E' }}>Incomplete Intake</h3>
        <p style={{ margin: 0, color: '#B45309' }}>{report.summary}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: '24px',
        padding: '20px',
        border: '1px solid #10B981',
        borderRadius: '8px',
        backgroundColor: '#ECFDF5',
      }}
    >
      <h2 style={{ marginTop: 0, color: '#065F46' }}>
        Synthesized Health Intake Report
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div>
          <strong>Patient Name:</strong> {report.patientName || 'Not Provided'}
        </div>
        <div>
          <strong>Chief Complaint:</strong> {report.chiefComplaint || 'Not Provided'}
        </div>
        <div>
          <strong>Duration:</strong> {report.duration || 'Not Provided'}
        </div>
        <div>
          <strong>Severity:</strong> {report.severity || 'Not Provided'}
        </div>
      </div>

      {report.associatedSymptoms && report.associatedSymptoms.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <strong>Associated Symptoms:</strong>
          <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
            {report.associatedSymptoms.map((sym, idx) => (
              <li key={idx}>{sym}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginBottom: '12px' }}>
        <strong>Summary:</strong>
        <p style={{ margin: '4px 0 0 0' }}>{report.summary}</p>
      </div>

      {report.flaggedFollowUp && (
        <div
          style={{
            padding: '10px',
            backgroundColor: '#FEE2E2',
            borderRadius: '6px',
            color: '#991B1B',
          }}
        >
          <strong>Flagged Items / Red Flags:</strong> {report.flaggedFollowUp}
        </div>
      )}
    </div>
  );
}