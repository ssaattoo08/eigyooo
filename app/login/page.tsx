"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import BrandHeader from "../components/BrandHeader";

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
    // プロフィール取得・作成（一時的なフォールバック処理）
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", user.id)
        .single();
      if (profile && profile.nickname) {
        localStorage.setItem("nickname", profile.nickname);
      } else {
        // プロフィールが存在しない場合、新規作成（一時的な対応）
        const { generateNickname } = await import("@/utils/generateNickname");
        const nickname = generateNickname();
        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          nickname: nickname.ja,
          username: user.email
        });
        if (!insertError) {
          localStorage.setItem("nickname", nickname.ja);
        }
      }
    }
    router.push("/calendar");
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FDF6EE', color: '#9C7A3A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <BrandHeader />
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: '8px 14px', borderRadius: 8, border: '1px solid #E5D3B3', fontSize: 13, background: '#FCF7F0', color: '#9C7A3A', boxSizing: 'border-box' }}
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: '8px 14px', borderRadius: 8, border: '1px solid #E5D3B3', fontSize: 13, background: '#FCF7F0', color: '#9C7A3A', boxSizing: 'border-box' }}
          autoComplete="current-password"
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', padding: '8px 0', fontSize: 13, background: '#F5E7CE', color: '#9C7A3A', border: '1px solid #E5D3B3', borderRadius: 8, fontWeight: 'bold', maxWidth: 320, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 4px #eee' }}
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>
        {error && <div style={{ color: "red", marginTop: 8, fontSize: 11, width: '100%', textAlign: 'center' }}>{error}</div>}
      </div>
    </div>
  );
} 