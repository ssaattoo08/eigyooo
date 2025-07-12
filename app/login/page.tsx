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
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", user.id)
        .single();
      if (profile && profile.nickname) {
        localStorage.setItem("nickname", profile.nickname);
      }
    }
    router.push("/calendar");
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FDF6EE', color: '#9C7A3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#F5E7CE', borderRadius: 10, boxShadow: '0 2px 12px #eee', padding: 20, minWidth: 240, maxWidth: 320, width: '100%', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ margin: '10px 0' }}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: 7, marginBottom: 8, borderRadius: 5, border: '1px solid #E5D3B3', fontSize: 12, background: '#FCF7F0', color: '#9C7A3A' }}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: 7, marginBottom: 8, borderRadius: 5, border: '1px solid #E5D3B3', fontSize: 12, background: '#FCF7F0', color: '#9C7A3A' }}
            autoComplete="current-password"
          />
        </div>
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', padding: 8, fontSize: 13, background: '#F5E7CE', color: '#9C7A3A', border: '1px solid #E5D3B3', borderRadius: 5, fontWeight: 'bold', marginBottom: 6, maxWidth: 320, cursor: loading ? 'not-allowed' : 'pointer' }}
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