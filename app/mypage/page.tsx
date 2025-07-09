"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

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

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#222', maxWidth: 700, margin: "0 auto", padding: 32 }}>
      <h2 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>マイページ</h2>
      <div style={{ fontSize: 22, marginBottom: 16, textAlign: 'center' }}>あなたのニックネーム：<b style={{ color: '#0070f3' }}>{nickname.ja}</b></div>
      <h3 style={{ fontSize: 20, marginBottom: 16, color: '#0070f3' }}>自分の投稿</h3>
      {loading ? (
        <div>読み込み中...</div>
      ) : posts.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center' }}>まだ投稿がありません。</div>
      ) : (
        posts.map((post: any) => (
          <div key={post.id} style={{ background: '#f5f5f5', border: "1px solid #eee", borderRadius: 10, padding: 18, marginBottom: 18, boxShadow: '0 1px 4px #eee' }}>
            <div style={{ marginBottom: 8 }}>{post.content}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{new Date(post.created_at).toLocaleString()}</div>
            <div style={{ fontSize: 12, color: "#888" }}>いいね: {post.likes || 0}</div>
          </div>
        ))
      )}
    </div>
  );
} 