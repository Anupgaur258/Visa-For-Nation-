import React from 'react';
import { Globe } from './Art.jsx';

export default function GlobeRoute() {
  return (
    <div className="hp-globe-visual" style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px',
      background: 'linear-gradient(135deg, rgba(235, 36, 42, 0.04) 0%, rgba(20, 22, 26, 0.03) 100%)',
      borderRadius: '24px',
      border: '1px solid var(--hp-line, #e2e4e8)',
      overflow: 'hidden'
    }}>
      <Globe />
    </div>
  );
}

