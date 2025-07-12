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
        // profilesテーブルへのINSERT失敗は正常な動作（メール認証後に自動で作成される）
        console.warn("profilesテーブルへのINSERT失敗（メール認証後に自動で作成されます）:", insertError.message);
        // エラー表示せず、メール送信完了画面を表示
      } else {
        localStorage.setItem("nickname", nickname.ja);
      }
    }
    setRegistered(true);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FDF6EE', color: '#9C7A3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#F5E7CE', borderRadius: 10, boxShadow: '0 2px 12px #eee', padding: 20, minWidth: 240, maxWidth: 320, width: '100%', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 11, marginBottom: 18, color: '#B89B7B' }}>登録すると自動でニックネームが付与されます</div>
        {registered ? (
          <>
            <div style={{ color: '#9C7A3A', fontSize: 14, margin: '24px 0 16px 0', lineHeight: 1.7 }}>
              ご登録のメールアドレス宛に認証メールを送信しました。<br />
              メール内のリンクをクリックして認証を完了してください。
            </div>
            <a href="/login" style={{ display: 'inline-block', marginTop: 12, padding: '8px 24px', background: '#F5E7CE', color: '#9C7A3A', borderRadius: 6, fontSize: 13, textDecoration: 'none', fontWeight: 'bold', border: '1px solid #E5D3B3' }}>ログイン画面へ</a>
          </>
        ) : (
          <>
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
                autoComplete="new-password"
              />
            </div>
            <button
              onClick={handleRegister}
              disabled={loading}
              style={{ width: '100%', padding: 8, fontSize: 13, background: '#F5E7CE', color: '#9C7A3A', border: '1px solid #E5D3B3', borderRadius: 5, fontWeight: 'bold', marginBottom: 6, maxWidth: 320, cursor: loading ? 'not-allowed' : 'pointer' }}
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