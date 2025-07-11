"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function UserPage() {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    const fetchProfile = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, nickname, username")
        .eq("username", username)
        .single();
      setProfile(profile);
      if (profile) {
        const { data: posts } = await supabase
          .from("posts")
          .select("id, content, created_at, nickname_ja, nickname_en")
          .eq("nickname_en", profile.username)
          .order("created_at", { ascending: false });
        setPosts(posts || []);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [username]);

  if (loading) return <div style={{ padding: 32 }}>読み込み中...</div>;
  if (!profile) return <div style={{ padding: 32 }}>ユーザーが見つかりません</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111', maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>{profile.nickname}</div>
        <div style={{ fontSize: 13, color: '#888' }}>@{profile.username}</div>
      </div>
      <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>投稿一覧</div>
      {posts.length === 0 ? (
        <div style={{ color: '#bbb', fontSize: 13 }}>まだ投稿がありません。</div>
      ) : (
        posts.map((post: any) => (
          <div key={post.id} style={{ background: '#fff', border: "1px solid #e3e8f0", borderRadius: 10, padding: 12, marginBottom: 14, boxShadow: '0 1px 4px #e3e8f0', fontSize: 13 }}>
            <div style={{ color: '#888', fontSize: 11, marginBottom: 4 }}>{new Date(post.created_at).toLocaleString()}</div>
            <div style={{ color: '#111', fontSize: 14 }}>{post.content}</div>
          </div>
        ))
      )}
    </div>
  );
} 