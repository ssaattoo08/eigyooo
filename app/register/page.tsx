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
  const router = useRouter();

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    // ニックネーム自動生成
    const nickname = generateNickname();
    // Supabase Authでユーザー作成
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) {
      setError("登録に失敗しました: " + signUpError.message);
      setLoading(false);
      return;
    }
    // サインアップ直後、セッションがnullなら明示的にサインイン
    if (!data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("自動ログインに失敗しました: " + signInError.message);
        setLoading(false);
        return;
      }
    }
    // 念のため最新セッションを取得
    await supabase.auth.getSession();
    // usersテーブルにニックネーム保存
    const user = data.user;
    if (user) {
      await supabase.from("users").insert([
        {
          id: user.id,
          nickname_en: nickname.en,
          nickname_ja: nickname.ja,
        },
      ]);
      // profilesテーブルにもinsert（nickname: カタカナ, username: ローマ字）
      await supabase.from("profiles").insert([
        {
          id: user.id,
          nickname: nickname.ja, // カタカナ
          username: nickname.en.toLowerCase(), // ローマ字（小文字）
          created_at: new Date().toISOString(),
        },
      ]);
      // localStorageにニックネーム保存（任意）
      localStorage.setItem("nickname_en", nickname.en);
      localStorage.setItem("nickname_ja", nickname.ja);
    }
    setLoading(false);
    // 登録後、タイムラインへ遷移
    router.push("/calendar");
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111' }}>
      <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px #eee', padding: 20, minWidth: 240, maxWidth: 320, margin: '40px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>新規登録</div>
        <div style={{ fontSize: 11, marginBottom: 18, color: '#888' }}>登録すると自動でニックネームが付与されます</div>
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
          style={{ width: '100%', padding: 8, fontSize: 13, background: '#111', color: '#fff', border: 'none', borderRadius: 5, fontWeight: 'bold', marginBottom: 6, maxWidth: 320, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? "登録中..." : "新規登録"}
        </button>
        {error && <div style={{ color: "red", marginTop: 8, fontSize: 11 }}>{error}</div>}
      </div>
    </div>
  );
} 