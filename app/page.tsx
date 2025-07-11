import Image from "next/image";

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111' }}>
      <div style={{ textAlign: 'center', padding: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, letterSpacing: 0, color: '#111', fontStretch: 'condensed' }}>process</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <a href="/login" style={{ padding: '6px 18px', background: '#f5f5f5', color: '#111', borderRadius: 6, fontSize: 12, textDecoration: 'none', fontWeight: 'bold', border: '1px solid #ccc' }}>ログイン</a>
          <a href="/register" style={{ padding: '6px 18px', background: '#111', color: '#fff', borderRadius: 6, fontSize: 12, textDecoration: 'none', fontWeight: 'bold', border: 'none' }}>新規登録</a>
        </div>
      </div>
    </div>
  );
}
