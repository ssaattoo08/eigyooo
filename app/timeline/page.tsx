"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

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
            <Link href="/timeline" style={{ color: '#0070f3', fontWeight: 'bold', fontSize: 15, textDecoration: 'none' }}>Timeline</Link>
            <Link href="/mypage" style={{ color: '#222', fontWeight: 'bold', fontSize: 15, textDecoration: 'none' }}>MyPage</Link>
          </div>
        </div>
      </nav>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: 0 }}>
        <div style={{ padding: "0 0 24px 0", textAlign: 'center', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 }}>タイムライン</div>
        <div style={{ margin: '0 auto 24px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e3e8f0', padding: 20, maxWidth: 520 }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={2}
            style={{ width: "100%", fontSize: 14, padding: 10, borderRadius: 8, border: '1px solid #d1d5db', background: '#f9fafb', resize: 'none', marginBottom: 12 }}
            placeholder="今日の頑張りや気持ちをつぶやこう！"
          />
          <button
            onClick={handlePost}
            disabled={loading}
            style={{ width: '100%', padding: 10, fontSize: 14, background: '#0070f3', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', marginBottom: 4, boxShadow: '0 1px 4px #e3e8f0' }}
          >
            {loading ? "投稿中..." : "投稿する"}
          </button>
          {error && <div style={{ color: "#e00", marginTop: 8, fontSize: 12 }}>{error}</div>}
        </div>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          {posts.length === 0 && <div style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>投稿がありません。</div>}
          {posts.map((post: any) => (
            <div key={post.id} style={{ background: '#fff', border: "1px solid #e3e8f0", borderRadius: 12, padding: 18, marginBottom: 22, boxShadow: '0 2px 8px #e3e8f0', display: 'flex', alignItems: 'flex-start', fontFamily: 'Meiryo UI, Meiryo, Yu Gothic, YuGothic, Hiragino Kaku Gothic ProN, Hiragino Sans, Arial, sans-serif' }}>
              {/* アイコン */}
              {getInitialIcon(post.nickname_ja || post.user?.nickname_ja || "匿名")}
              <div style={{ flex: 1 }}>
                {/* 上段：ニックネーム・日付・タグ */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontWeight: 'bold', color: '#0070f3', fontSize: 15 }}>{post.nickname_ja || post.user?.nickname_ja || "匿名"}</span>
                  <span style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>{new Date(post.created_at).toLocaleString()}</span>
                  {post.is_my_rule && <span style={{ marginLeft: 8, color: '#bfa100', fontWeight: 'bold', fontSize: 12, background: '#fffbe6', borderRadius: 4, padding: '2px 8px' }}>MyRule</span>}
                </div>
                {/* 本文 */}
                <div style={{ marginBottom: 10, fontSize: 14, color: '#222', whiteSpace: 'pre-line', lineHeight: 1.7 }}>{post.content}</div>
                {/* 下段：いいね・コメント */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => handleLike(post.id)} style={{ background: '#f6f7fa', color: '#0070f3', border: '1px solid #e3e8f0', borderRadius: 6, padding: '2px 14px', fontWeight: 'bold', fontSize: 13, cursor: 'pointer' }}>
                    いいね ({post.likes || 0})
                  </button>
                </div>
                {/* コメント一覧 */}
                <div style={{ marginTop: 14, background: '#f9fafb', borderRadius: 8, padding: 12, border: '1px solid #e3e8f0' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 6, color: '#0070f3', fontSize: 13 }}>コメント</div>
                  {comments[post.id]?.length === 0 && <div style={{ color: '#bbb', fontSize: 12 }}>コメントはまだありません。</div>}
                  {comments[post.id]?.map((c) => (
                    <div key={c.id} style={{ marginBottom: 6, fontSize: 13 }}>
                      <span style={{ fontWeight: 'bold', color: '#0070f3' }}>{c.nickname_ja}</span>：{c.content}
                      <span style={{ fontSize: 10, color: '#aaa', marginLeft: 8 }}>{new Date(c.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                  {/* コメント投稿フォーム */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <input
                      type="text"
                      placeholder="コメントを書く"
                      value={commentInputs[post.id] || ""}
                      onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      style={{ flex: 1, padding: 6, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, background: '#fff' }}
                      disabled={commentLoading[post.id]}
                    />
                    <button
                      onClick={() => handleComment(post.id)}
                      disabled={commentLoading[post.id]}
                      style={{ background: '#0070f3', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 'bold', fontSize: 12, cursor: 'pointer' }}
                    >
                      {commentLoading[post.id] ? "送信中..." : "送信"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 