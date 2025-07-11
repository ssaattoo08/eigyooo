import Image from "next/image";

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: 32, width: '100%' }}>
        <div style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 18, letterSpacing: 0, color: '#111', fontStretch: 'condensed' }}>process</div>
        <div style={{ fontSize: 15, color: '#555', marginBottom: 28 }}>
          営業プロセスをただ残すだけ<br />自分だけの記録管理サービス
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <a href="/login" style={{ padding: '10px 32px', background: '#f5f5f5', color: '#111', borderRadius: 8, fontSize: 15, textDecoration: 'none', fontWeight: 'bold', border: '1px solid #ccc' }}>ログイン</a>
          <a href="/register" style={{ padding: '10px 32px', background: '#111', color: '#fff', borderRadius: 8, fontSize: 15, textDecoration: 'none', fontWeight: 'bold', border: 'none' }}>新規登録</a>
        </div>
      </div>
    </div>
  );
}
