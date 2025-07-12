"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { generateNickname } from "@/utils/generateNickname";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URLから認証情報を取得
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setError("認証エラーが発生しました: " + error.message);
          setLoading(false);
          return;
        }

        if (data.session?.user) {
          // プロフィールが存在するかチェック
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", data.session.user.id)
            .single();

          if (!profile) {
            // プロフィールが存在しない場合、作成
            const nickname = generateNickname();
            const { error: insertError } = await supabase.from("profiles").insert({
              id: data.session.user.id,
              nickname: nickname.ja,
              username: data.session.user.email
            });

            if (insertError) {
              console.error("プロフィール作成エラー:", insertError);
              setError("プロフィールの作成に失敗しました。");
              setLoading(false);
              return;
            }

            // ニックネームをlocalStorageに保存
            localStorage.setItem("nickname", nickname.ja);
          }

          // 認証完了、ログインページへリダイレクト
          router.push("/login");
        } else {
          setError("認証情報が見つかりません。");
          setLoading(false);
        }
      } catch (err) {
        console.error("認証コールバックエラー:", err);
        setError("予期しないエラーが発生しました。");
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FDF6EE', color: '#9C7A3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#F5E7CE', borderRadius: 10, boxShadow: '0 2px 12px #eee', padding: 20, minWidth: 240, maxWidth: 320, width: '100%', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ color: '#9C7A3A', fontSize: 14, margin: '24px 0 16px 0' }}>
            認証を確認中...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#FDF6EE', color: '#9C7A3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#F5E7CE', borderRadius: 10, boxShadow: '0 2px 12px #eee', padding: 20, minWidth: 240, maxWidth: 320, width: '100%', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ color: 'red', fontSize: 14, margin: '24px 0 16px 0' }}>
            {error}
          </div>
          <a href="/login" style={{ display: 'inline-block', marginTop: 12, padding: '8px 24px', background: '#F5E7CE', color: '#9C7A3A', borderRadius: 6, fontSize: 13, textDecoration: 'none', fontWeight: 'bold', border: '1px solid #E5D3B3' }}>
            ログイン画面へ
          </a>
        </div>
      </div>
    );
  }

  return null;
} 