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
        width: 36, height: 36, borderRadius: "50%", background: "#e3e8f0", color: "#0070f3", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 18, marginRight: 12 }}>
        {nickname ? nickname[0] : "?"}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f6f7fa', color: '#222' }}>
      {/* ナビゲーションバー */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e3e8f0', padding: '0 0', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 600, justifyContent: 'space-between', padding: '0 16px' }}>
          <Link href="/" style={{ fontWeight: 'bold', fontSize: 18, color: '#0070f3', textDecoration: 'none', letterSpacing: 1 }}>eigyooo</Link>
          <div style={{ display: 'flex', gap: 18 }}>
            <Link href="/timeline" style={{ color: '#222', fontWeight: 'bold', fontSize: 15, textDecoration: 'none' }}>Timeline</Link>
            <Link href="/mypage" style={{ color: '#0070f3', fontWeight: 'bold', fontSize: 15, textDecoration: 'none' }}>MyPage</Link>
          </div>
        </div>
      </nav>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 0 32px 0' }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e3e8f0', padding: 20, margin: '0 auto 24px auto', maxWidth: 480, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            {getInitialIcon(nickname.ja)}
            <span style={{ fontWeight: 'bold', fontSize: 16, color: '#0070f3' }}>{nickname.ja}</span>
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>あなたのニックネーム</div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>自分の投稿</div>
        {loading ? (
          <div style={{ color: '#888', textAlign: 'center' }}>読み込み中...</div>
        ) : posts.length === 0 ? (
          <div style={{ color: '#bbb', textAlign: 'center', marginTop: 32 }}>まだ投稿がありません。</div>
        ) : (
          posts.map((post: any) => (
            <div key={post.id} style={{ background: '#fff', border: "1px solid #e3e8f0", borderRadius: 12, padding: 16, marginBottom: 18, boxShadow: '0 2px 8px #e3e8f0', display: 'flex', alignItems: 'flex-start' }}>
              {getInitialIcon(post.nickname_ja)}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontWeight: 'bold', color: '#0070f3', fontSize: 15 }}>{post.nickname_ja}</span>
                  <span style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>{new Date(post.created_at).toLocaleString()}</span>
                  {post.is_my_rule && <span style={{ marginLeft: 8, color: '#bfa100', fontWeight: 'bold', fontSize: 12, background: '#fffbe6', borderRadius: 4, padding: '2px 8px' }}>MyRule</span>}
                </div>
                <div style={{ marginBottom: 8, fontSize: 14, whiteSpace: 'pre-line' }}>{post.content}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: '#f6f7fa', color: '#0070f3', border: '1px solid #e3e8f0', borderRadius: 6, padding: '2px 12px', fontWeight: 'bold', fontSize: 13 }}>
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