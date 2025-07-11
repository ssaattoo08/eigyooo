import Image from "next/image";

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: 20, width: '100%' }}>
        {/* ロゴ画像の表示（中央揃え） */}
        <div style={{ textAlign: 'center', padding: 20 }}>
          <img src="/logo-process-horizontal.png" alt="process logo" style={{ maxWidth: 300, height: 'auto' }} />
        </div>
        <div style={{ fontSize: 11, color: '#555', marginBottom: 12, lineHeight: 1.4 }}>
          毎日、営業プロセスを記録していこう<br />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <a href="/login" style={{ padding: '6px 14px', background: '#f5f5f5', color: '#111', borderRadius: 8, fontSize: 11, textDecoration: 'none', fontWeight: 'bold', border: '1px solid #ccc', boxShadow: '0 2px 4px #eee' }}>ログイン</a>
          <a href="/register" style={{ padding: '6px 14px', background: '#f5f5f5', color: '#111', borderRadius: 8, fontSize: 11, textDecoration: 'none', fontWeight: 'bold', border: '1px solid #ccc', boxShadow: '0 2px 4px #eee' }}>
            新規登録
          </a>
        </div>
      </div>
    </div>
  );
}
