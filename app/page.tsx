import Image from "next/image";

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#FDF6EE', color: '#9C7A3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <a href="/login" style={{ padding: '6px 14px', background: '#F5E7CE', color: '#9C7A3A', borderRadius: 8, fontSize: 11, textDecoration: 'none', fontWeight: 'bold', border: '1px solid #E5D3B3', boxShadow: '0 2px 4px #eee' }}>ログイン</a>
          <a href="/register" style={{ padding: '6px 14px', background: '#F5E7CE', color: '#9C7A3A', borderRadius: 8, fontSize: 11, textDecoration: 'none', fontWeight: 'bold', border: '1px solid #E5D3B3', boxShadow: '0 2px 4px #eee' }}>
            新規登録
          </a>
        </div>
      </div>
    </div>
  );
}
