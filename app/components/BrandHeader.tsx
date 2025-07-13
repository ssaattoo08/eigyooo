"use client";

export default function BrandHeader() {
  return (
    <div style={{ textAlign: 'center', padding: 20, width: '100%' }}>
      <div style={{
        display: 'inline-block',
        background: '#F5E7CE',
        color: '#9C7A3A',
        borderRadius: 16,
        padding: '8px 24px',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        letterSpacing: 0,
        fontStretch: 'condensed',
        boxShadow: '0 2px 8px #eee',
      }}>
        process
      </div>
      <div style={{ fontSize: 11, color: '#B89B7B', marginBottom: 12, lineHeight: 1.4 }}>
        毎日、営業プロセスを記録していこう<br />
      </div>
    </div>
  );
} 