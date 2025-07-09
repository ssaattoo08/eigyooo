"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface Comment {
  id: number;
  post_id: number;
  nickname_ja: string;
  content: string;
  created_at: string;
}

export default function TimelinePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [comments, setComments] = useState<{ [postId: number]: Comment[] }>({});
  const [commentInputs, setCommentInputs] = useState<{ [postId: number]: string }>({});
  const [commentLoading, setCommentLoading] = useState<{ [postId: number]: boolean }>({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*, user:users(nickname_ja, nickname_en)")
      .order("created_at", { ascending: false });
    if (error) {
      setError("投稿の取得に失敗しました: " + error.message);
    } else {
      setPosts(data || []);
      // 各投稿のコメントも取得
      if (data) {
        for (const post of data) {
          fetchComments(post.id);
        }
      }
    }
  };

  const fetchComments = async (postId: number) => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setComments(prev => ({ ...prev, [postId]: data || [] }));
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    const nickname_en = localStorage.getItem("nickname_en");
    const nickname_ja = localStorage.getItem("nickname_ja");
    if (!nickname_en || !nickname_ja) {
      setError("ユーザー情報がありません。再登録してください。");
      setLoading(false);
      return;
    }
    const { error } = await supabase
      .from("posts")
      .insert([
        { content, nickname_en, nickname_ja }
      ]);
    setLoading(false);
    if (error) {
      setError("投稿に失敗しました: " + error.message);
    } else {
      setContent("");
      fetchPosts();
    }
  };

  const handleLike = async (postId: number) => {
    await supabase.rpc("increment_likes", { post_id: postId });
    fetchPosts();
  };

  // コメント送信
  const handleComment = async (postId: number) => {
    const comment = commentInputs[postId]?.trim();
    if (!comment) return;
    setCommentLoading(prev => ({ ...prev, [postId]: true }));
    const nickname_en = localStorage.getItem("nickname_en");
    const nickname_ja = localStorage.getItem("nickname_ja");
    if (!nickname_en || !nickname_ja) {
      setError("ユーザー情報がありません。再登録してください。");
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
      return;
    }
    await supabase.from("comments").insert([
      { post_id: postId, nickname_en, nickname_ja, content: comment }
    ]);
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
    setCommentLoading(prev => ({ ...prev, [postId]: false }));
    fetchComments(postId);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#222', maxWidth: 700, margin: "0 auto", padding: 32 }}>
      <h2 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>タイムライン</h2>
      <div style={{ marginBottom: 24, background: '#f9f9f9', borderRadius: 10, padding: 20, boxShadow: '0 2px 8px #eee' }}>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={3}
          style={{ width: "100%", fontSize: 16, padding: 8, borderRadius: 6, border: '1px solid #ccc', background: '#fff' }}
          placeholder="今日の頑張りや気持ちをつぶやこう！"
        />
        <button
          onClick={handlePost}
          disabled={loading}
          style={{ marginTop: 8, width: "100%", padding: 10, fontSize: 16, background: "#0070f3", color: "#fff", border: "none", borderRadius: 6, fontWeight: 'bold' }}
        >
          {loading ? "投稿中..." : "投稿する"}
        </button>
        {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      </div>
      <div>
        {posts.length === 0 && <div style={{ color: '#888', textAlign: 'center' }}>投稿がありません。</div>}
        {posts.map((post: any) => (
          <div key={post.id} style={{ background: '#f5f5f5', border: "1px solid #eee", borderRadius: 10, padding: 18, marginBottom: 18, boxShadow: '0 1px 4px #eee' }}>
            <div style={{ fontWeight: "bold", marginBottom: 4, color: '#0070f3' }}>{post.nickname_ja || post.user?.nickname_ja || "匿名"}</div>
            <div style={{ marginBottom: 8 }}>{post.content}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{new Date(post.created_at).toLocaleString()}</div>
            <button onClick={() => handleLike(post.id)} style={{ marginTop: 8, background: '#fff', color: '#0070f3', border: '1px solid #0070f3', borderRadius: 6, padding: '4px 16px', fontWeight: 'bold', cursor: 'pointer' }}>
              いいね ({post.likes || 0})
            </button>
            {/* コメント一覧 */}
            <div style={{ marginTop: 16, background: '#fff', borderRadius: 8, padding: 12, border: '1px solid #eee' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#0070f3' }}>コメント</div>
              {comments[post.id]?.length === 0 && <div style={{ color: '#888' }}>コメントはまだありません。</div>}
              {comments[post.id]?.map((c) => (
                <div key={c.id} style={{ marginBottom: 8 }}>
                  <span style={{ fontWeight: 'bold', color: '#0070f3' }}>{c.nickname_ja}</span>：{c.content}
                  <span style={{ fontSize: 11, color: '#aaa', marginLeft: 8 }}>{new Date(c.created_at).toLocaleString()}</span>
                </div>
              ))}
              {/* コメント投稿フォーム */}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input
                  type="text"
                  placeholder="コメントを書く"
                  value={commentInputs[post.id] || ""}
                  onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                  style={{ flex: 1, padding: 6, borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }}
                  disabled={commentLoading[post.id]}
                />
                <button
                  onClick={() => handleComment(post.id)}
                  disabled={commentLoading[post.id]}
                  style={{ background: '#0070f3', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {commentLoading[post.id] ? "送信中..." : "送信"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 