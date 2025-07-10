"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function MyPage() {
  const [nickname, setNickname] = useState({ en: "", ja: "" });
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const nickname_en = localStorage.getItem("nickname_en") || "";
    const nickname_ja = localStorage.getItem("nickname_ja") || "";
    setNickname({ en: nickname_en, ja: nickname_ja });
    fetchMyPosts(nickname_en);
  }, []);

  const fetchMyPosts = async (nickname_en: string) => {
    if (!nickname_en) return;
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("nickname_en", nickname_en)
      .order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  // アイコンのダミー（イニシャル）
  const getInitialIcon = (nickname: string) => {
    return (
      <div style={{
        width: 36, height: 36, borderRadius: "50%", background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 16, marginRight: 0 }}>
        {nickname ? nickname[0] : "?"}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111' }}>
      {/* ナビゲーションバー */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e3e8f0', padding: '0 0', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 600, justifyContent: 'space-between', padding: '0 16px' }}>
          <Link href="/" style={{ fontWeight: 'bold', fontSize: 18, color: '#111', textDecoration: 'none', letterSpacing: 1 }}>process</Link>
          <div style={{ display: 'flex', gap: 18 }}>
            <Link href="/timeline" style={{ color: '#111', fontWeight: 'bold', fontSize: 15, textDecoration: 'none' }}>Timeline</Link>
            <Link href="/mypage" style={{ color: '#111', fontWeight: 'bold', fontSize: 15, textDecoration: 'none' }}>MyPage</Link>
          </div>
        </div>
      </nav>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 0 32px 0' }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e3e8f0', padding: 20, margin: '0 auto 24px auto', maxWidth: 480, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            {getInitialIcon(nickname.ja)}
            <span style={{ fontWeight: 'bold', fontSize: 13, color: '#111', marginLeft: 8 }}>{nickname.ja}</span>
          </div>
        </div>
        {loading ? (
          <div style={{ color: '#888', textAlign: 'center', fontSize: 12 }}>読み込み中...</div>
        ) : posts.length === 0 ? (
          <div style={{ color: '#bbb', textAlign: 'center', marginTop: 32, fontSize: 12 }}>まだ投稿がありません。</div>
        ) : (
          posts.map((post: any) => (
            <div key={post.id} style={{ background: '#fff', border: "1px solid #e3e8f0", borderRadius: 10, padding: 12, marginBottom: 18, boxShadow: '0 1px 4px #e3e8f0', display: 'flex', alignItems: 'flex-start', fontFamily: 'Meiryo UI, Meiryo, Yu Gothic, YuGothic, Hiragino Kaku Gothic ProN, Hiragino Sans, Arial, sans-serif', fontSize: 10, color: '#111' }}>
              {getInitialIcon(post.nickname_ja)}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                  {/* 投稿者名は非表示にする */}
                  <span style={{ display: 'none' }}>{post.nickname_ja}</span>
                  <span style={{ fontSize: 9, color: '#888', marginLeft: 0 }}>{new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={{ marginBottom: 4, fontSize: 10, color: '#111', whiteSpace: 'pre-line', lineHeight: 1.7 }}>{post.content}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: '#f6f7fa', color: '#111', border: '1px solid #e3e8f0', borderRadius: 6, padding: '2px 8px', fontWeight: 'bold', fontSize: 9 }}>
                    いいね {post.likes || 0}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 