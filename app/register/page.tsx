"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { generateNickname } from "@/utils/generateNickname";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    const nickname = generateNickname();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) {
      setError("登録に失敗しました: " + signUpError.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      const { error: insertError } = await supabase.from("profiles").insert({
        id: data.user.id,
        nickname: nickname.ja,
        username: email
      });
      if (insertError) {
        setError("profilesテーブルへのINSERT失敗: " + insertError.message);
        setLoading(false);
        return;
      }
      localStorage.setItem("nickname", nickname.ja);
    }
    setRegistered(true);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px #eee', padding: 20, minWidth: 240, maxWidth: 320, width: '100%', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 11, marginBottom: 18, color: '#888' }}>登録すると自動でニックネームが付与されます</div>
        {registered ? (
          <>
            <div style={{ color: '#111', fontSize: 14, margin: '24px 0 16px 0', lineHeight: 1.7 }}>
              ご登録のメールアドレス宛に認証メールを送信しました。<br />
              メール内のリンクをクリックして認証を完了してください。
            </div>
            <a href="/login" style={{ display: 'inline-block', marginTop: 12, padding: '8px 24px', background: '#111', color: '#fff', borderRadius: 6, fontSize: 13, textDecoration: 'none', fontWeight: 'bold', border: 'none' }}>ログイン画面へ</a>
          </>
        ) : (
          <>
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
                autoComplete="new-password"
              />
            </div>
            <button
              onClick={handleRegister}
              disabled={loading}
              style={{ width: '100%', padding: 8, fontSize: 13, background: '#f5f5f5', color: '#111', border: '1px solid #ccc', borderRadius: 5, fontWeight: 'bold', marginBottom: 6, maxWidth: 320, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? "登録中..." : "新規登録"}
            </button>
            {error && <div style={{ color: "red", marginTop: 8, fontSize: 11 }}>{error}</div>}
          </>
        )}
      </div>
    </div>
  );
} 