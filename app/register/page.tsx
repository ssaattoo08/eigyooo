"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { generateNickname } from "@/utils/generateNickname";
import { useRouter } from "next/navigation";
import BrandHeader from "../components/BrandHeader";

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
    // メール認証後にprofilesテーブルが作成されるため、ここでは作成しない
    // ニックネームは認証完了時に生成される
    setRegistered(true);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FDF6EE', color: '#9C7A3A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <BrandHeader />
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 11, marginBottom: 8, color: '#B89B7B', width: '100%', textAlign: 'center' }}>登録すると自動でニックネームが付与されます</div>
        {registered ? (
          <>
            <div style={{ color: '#9C7A3A', fontSize: 14, margin: '24px 0 16px 0', lineHeight: 1.7, width: '100%', textAlign: 'center' }}>
              ご登録のメールアドレス宛に認証メールを送信しました。<br />
              メール内のリンクをクリックして認証を完了してください。
            </div>
            <a href="/login" style={{ display: 'inline-block', marginTop: 12, padding: '8px 24px', background: '#F5E7CE', color: '#9C7A3A', borderRadius: 8, fontSize: 13, textDecoration: 'none', fontWeight: 'bold', border: '1px solid #E5D3B3', boxShadow: '0 2px 4px #eee' }}>ログイン画面へ</a>
          </>
        ) : (
          <>
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
              autoComplete="new-password"
            />
            <button
              onClick={handleRegister}
              disabled={loading}
              style={{ width: '100%', padding: '8px 0', fontSize: 13, background: '#F5E7CE', color: '#9C7A3A', border: '1px solid #E5D3B3', borderRadius: 8, fontWeight: 'bold', maxWidth: 320, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 4px #eee' }}
            >
              {loading ? "登録中..." : "新規登録"}
            </button>
            {error && <div style={{ color: "red", marginTop: 8, fontSize: 11, width: '100%', textAlign: 'center' }}>{error}</div>}
          </>
        )}
      </div>
    </div>
  );
} 