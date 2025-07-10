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

function getMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - ((day + 6) % 7); // 月曜始まり
  return new Date(d.setDate(diff));
}

function getWeekDates(date: Date) {
  const monday = getMonday(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function TimelinePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setError("投稿の取得に失敗しました: " + error.message);
    } else {
      setPosts(data || []);
    }
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

  // アイコンのダミー（イニシャル）
  const getInitialIcon = (nickname: string) => {
    return (
      <div style={{
        width: 24, height: 24, borderRadius: "50%", background: "#e3e8f0", color: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 12, marginRight: 8 }}>
        {nickname ? nickname[0] : "?"}
      </div>
    );
  };

  // 今週の月曜〜日曜の日付リスト
  const weekDates = getWeekDates(new Date());

  // 各日ごとの投稿を抽出
  const postsByDate = weekDates.map((date) => {
    const ymd = date.toISOString().slice(0, 10);
    return posts.filter(post => post.created_at && post.created_at.slice(0, 10) === ymd);
  });

  const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // いいね機能
  const handleLike = async (postId: number) => {
    await supabase.rpc("increment_likes", { post_id: postId });
    fetchPosts();
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
      <div style={{ maxWidth: 700, margin: "0 auto", padding: 0 }}>
        <div style={{ margin: '0 auto 24px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e3e8f0', padding: 16, maxWidth: 520 }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={2}
            style={{ width: "100%", fontSize: 12, padding: 8, borderRadius: 8, border: '1px solid #d1d5db', background: '#f9fafb', resize: 'none', marginBottom: 10, color: '#111' }}
            placeholder="今日の頑張りや気持ちをつぶやこう！"
          />
          <button
            onClick={handlePost}
            disabled={loading}
            style={{ width: '100%', padding: 8, fontSize: 12, background: '#0070f3', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', marginBottom: 4, boxShadow: '0 1px 4px #e3e8f0' }}
          >
            {loading ? "投稿中..." : "投稿する"}
          </button>
          {error && <div style={{ color: "#e00", marginTop: 8, fontSize: 11 }}>{error}</div>}
        </div>
        {/* 週次カレンダー表示 */}
        <div style={{ display: 'flex', gap: 8, marginTop: 32, marginBottom: 16, justifyContent: 'center' }}>
          {weekDates.map((date, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', color: '#111', fontWeight: 'bold', fontSize: 12 }}>
              <div>{weekLabels[i]}</div>
              <div style={{ fontSize: 11 }}>{date.getMonth() + 1}/{date.getDate()}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {postsByDate.map((dayPosts, i) => (
            <div key={i} style={{ flex: 1, minHeight: 80 }}>
              {dayPosts.length === 0 ? (
                <div style={{ color: '#bbb', fontSize: 11, textAlign: 'center', marginTop: 8 }}>投稿なし</div>
              ) : (
                dayPosts.map((post: any) => (
                  <div key={post.id} style={{ background: '#fff', border: "1px solid #e3e8f0", borderRadius: 10, padding: 8, marginBottom: 8, boxShadow: '0 1px 4px #e3e8f0', display: 'flex', alignItems: 'flex-start', fontFamily: 'Meiryo UI, Meiryo, Yu Gothic, YuGothic, Hiragino Kaku Gothic ProN, Hiragino Sans, Arial, sans-serif', fontSize: 10, color: '#111' }}>
                    {getInitialIcon(post.nickname_ja)}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ fontWeight: 'bold', color: '#111', fontSize: 11 }}>{post.nickname_ja}</span>
                        <span style={{ fontSize: 8, color: '#888', marginLeft: 8 }}>{new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div style={{ marginBottom: 4, fontSize: 10, color: '#111', whiteSpace: 'pre-line', lineHeight: 1.7 }}>{post.content}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => handleLike(post.id)} style={{ background: '#f6f7fa', color: '#111', border: '1px solid #e3e8f0', borderRadius: 6, padding: '2px 8px', fontWeight: 'bold', fontSize: 9, cursor: 'pointer' }}>
                          いいね ({post.likes || 0})
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 