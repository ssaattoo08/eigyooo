"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError("ログインに失敗しました: " + error.message);
      return;
    }
    // ログイン成功時はタイムラインへ
    // プロフィール取得
    const { data: { user } } = await supabase.auth.getUser();
    const fetchAndStoreNickname = async (retry = 0) => {
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("nickname")
          .eq("id", user.id)
          .single();
        if (profile && profile.nickname) {
          localStorage.setItem("nickname", profile.nickname);
        } else if (retry < 3) {
          setTimeout(() => fetchAndStoreNickname(retry + 1), 1000); // 1秒後にリトライ（最大3回）
        }
      }
    };
    await fetchAndStoreNickname();
    router.push("/calendar");
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111' }}>
      <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px #eee', padding: 20, minWidth: 240, maxWidth: 320, margin: '40px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>ログイン</div>
        <div style={{ margin: '10px 0' }}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: 7, marginBottom: 8, borderRadius: 5, border: '1px solid #ccc', fontSize: 12, background: '#fffbe6' }}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: 7, marginBottom: 8, borderRadius: 5, border: '1px solid #ccc', fontSize: 12, background: '#fffbe6' }}
            autoComplete="current-password"
          />
        </div>
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', padding: 8, fontSize: 13, background: '#111', color: '#fff', border: 'none', borderRadius: 5, fontWeight: 'bold', marginBottom: 6, maxWidth: 320, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>
        {/* 新規登録やCalendarの文言を削除 */}
        {/* <div style={{ marginTop: 8 }}>
          <a href="/register" style={{ color: '#0070f3', textDecoration: 'underline', fontSize: 11 }}>新規登録はこちら</a>
        </div>
        <a href="/calendar" style={{ color: '#111', fontWeight: 'bold', fontSize: 13, textDecoration: 'none', marginLeft: 12 }}>Calendar</a> */}
        {error && <div style={{ color: "red", marginTop: 8, fontSize: 11 }}>{error}</div>}
      </div>
    </div>
  );
} 