"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { addMonths, isSunday, isSaturday } from "date-fns";
import Holidays from 'date-holidays';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { ja } from 'date-fns/locale';
import { enUS } from 'date-fns/locale';

export default function MyPage() {
  const [nickname, setNickname] = useState("");
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const hd = new Holidays('JP');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("icon_url, nickname")
        .eq("id", user.id)
        .single();
      if (profile) {
        setIconUrl(profile.icon_url || null);
        setNickname(profile.nickname || "");
        fetchMyPosts(profile.nickname || "");
      }
    };
    fetchProfile();
  }, [currentMonth]);

  const fetchMyPosts = async (nickname_ja: string) => {
    if (!nickname_ja) return;
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("nickname_ja", nickname_ja)
      .order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  const handlePost = async () => {
    if (!content.trim()) {
      setError("投稿内容を入力してください。");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .insert({
          nickname_ja: nickname,
          content: content,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      setContent("");
      fetchMyPosts(nickname);
    } catch (err) {
      console.error("Error posting:", err);
      setError("投稿に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  // プロフィール画像アップロード
  const handleIconClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}.${fileExt}`;
    // Storageにアップロード
    const { error: uploadError } = await supabase.storage.from('profile-icons').upload(filePath, file, { upsert: true });
    if (uploadError) {
      alert('アップロードに失敗しました');
      return;
    }
    // 公開URL取得
    const { data } = supabase.storage.from('profile-icons').getPublicUrl(filePath);
    const publicUrl = data.publicUrl;
    // profilesテーブルに保存
    await supabase.from('profiles').update({ icon_url: publicUrl }).eq('id', userId);
    setIconUrl(publicUrl);
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

  // アイコン表示
  const renderIcon = () => {
    return iconUrl ? (
      <img
        src={iconUrl}
        alt="icon"
        style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", marginRight: 0, cursor: "pointer", border: '1px solid #ccc' }}
        onClick={handleIconClick}
      />
    ) : (
      <div
        style={{ width: 36, height: 36, borderRadius: "50%", background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 16, marginRight: 0, cursor: "pointer" }}
        onClick={handleIconClick}
      >
        {nickname ? nickname[0] : "?"}
      </div>
    );
  };

  // カレンダー生成（カレンダーページと同じテーブル型・祝日色分け・月送りUI）
  const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
  const days = [];
  let d = start;
  while (d <= end) {
    days.push(new Date(d));
    d = new Date(d);
    d.setDate(d.getDate() + 1);
  }
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  const postDates = posts.map(p => p.created_at.slice(0, 10));
  const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111' }}>
      {/* ナビゲーションバー */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e3e8f0', padding: '0 0', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 600, justifyContent: 'space-between', padding: '0 16px' }}>
          <div style={{
            display: 'inline-block',
            background: '#111',
            color: '#fff',
            borderRadius: 16,
            padding: '6px 18px',
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 0,
            letterSpacing: 0,
            fontStretch: 'condensed',
            boxShadow: '0 2px 8px #eee',
            textDecoration: 'none',
            cursor: 'default',
          }}>process</div>
          <div style={{ display: 'flex', gap: 18 }}>
            <Link href="/calendar" style={{ color: '#111', fontWeight: 'bold', fontSize: 15, textDecoration: 'none' }}>Calendar</Link>
            <Link href="/mypage" style={{ color: '#111', fontWeight: 'bold', fontSize: 15, textDecoration: 'none' }}>MyPage</Link>
          </div>
        </div>
      </nav>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 0 32px 0' }}>
        {/* 投稿ボックス追加 */}
        <div style={{ margin: '0 auto 16px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e3e8f0', padding: 10, maxWidth: 520, position: 'relative', overflow: 'hidden', minHeight: 40, border: '1px solid #d1d5db', display: 'block' }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={2}
            style={{ width: "100%", fontSize: 12, padding: 6, borderRadius: 8, border: 'none', background: '#fff', resize: 'none', marginBottom: 6, color: '#111', boxSizing: 'border-box', outline: 'none', fontWeight: 500, minHeight: 30, height: 30, lineHeight: 1.3 }}
            placeholder="今日の頑張りや気持ちをつぶやこう！"
          />
          <button
            onClick={handlePost}
            disabled={loading}
            style={{
              position: 'absolute',
              right: 16,
              top: 20,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#888',
              color: '#fff',
              border: 'none',
              fontWeight: 'bold',
              fontSize: 13,
              opacity: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              zIndex: 2
            }}
          >
            {loading ? "..." : "Post"}
          </button>
          {error && <div style={{ color: "#e00", marginTop: 8, fontSize: 11 }}>{error}</div>}
        </div>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e3e8f0', padding: 12, margin: '0 auto 16px auto', maxWidth: 520, textAlign: 'center', minHeight: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
            {renderIcon()}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <span style={{ fontWeight: 'bold', fontSize: 13, color: '#111', marginLeft: 8 }}>{nickname || "ニックネーム反映中..."}</span>
          </div>
          {/* カレンダーをプロフィールボックス内に大きく表示（テーブル型・祝日色分け・月送りUI） */}
          <div style={{ margin: '16px 0 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <button onClick={() => setCurrentMonth(prevMonth)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>◀</button>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 22, letterSpacing: 0, margin: '0 16px', minWidth: 100 }}>
                {format(currentMonth, 'MMMM', { locale: enUS })}
              </div>
              <button onClick={() => setCurrentMonth(nextMonth)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>▶</button>
            </div>
            {/* 年の表示は削除 */}
            {/* <div style={{ textAlign: 'center', fontSize: 15, color: '#888', marginBottom: 8 }}>{format(currentMonth, 'yyyy年', { locale: ja })}</div> */}
            <table style={{ borderCollapse: 'collapse', width: '100%', background: '#fff', boxShadow: '0 2px 8px #eee', fontSize: 16 }}>
              <thead>
                <tr>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w, i) => (
                    <th key={w} style={{ border: '1px solid #e3e8f0', padding: 0, width: '14.2%', height: 32, color: i === 0 ? '#e00' : i === 6 ? '#0070f3' : '#111', fontWeight: 'bold', fontSize: 14, background: '#fafbfc' }}>{w}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, wi) => (
                  <tr key={wi}>
                    {week.map((date, di) => {
                      const inMonth = isSameMonth(date, currentMonth);
                      const ymd = format(date, 'yyyy-MM-dd');
                      const posted = postDates.includes(ymd);
                      const holiday = hd.isHoliday(date);
                      const isSun = date.getDay() === 0;
                      const isSat = date.getDay() === 6;
                      let color = '#111';
                      if (holiday) color = '#e00';
                      else if (isSun) color = '#e00';
                      else if (isSat) color = '#0070f3';
                      const isOtherMonth = !inMonth;
                      return (
                        <td key={di} style={{ border: '1px solid #e3e8f0', verticalAlign: 'top', background: isOtherMonth ? '#fafbfc' : '#fff', color, padding: 0, height: 40, textAlign: 'center', fontSize: isOtherMonth ? 11 : 16, opacity: isOtherMonth ? 0.5 : 1 }}>
                          <div style={{ fontWeight: posted ? 'bold' : 'normal', marginTop: 2, fontSize: isOtherMonth ? 11 : 16 }}>{date.getDate()}</div>
                          {holiday && (
                            <div style={{ color: '#e00', fontSize: 9, marginTop: 2 }}>{holiday[0].name}</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {loading ? (
          <div style={{ color: '#888', textAlign: 'center', fontSize: 12 }}>読み込み中...</div>
        ) : posts.length === 0 ? (
          <div style={{ color: '#bbb', textAlign: 'center', marginTop: 32, fontSize: 12 }}>まだ投稿がありません。</div>
        ) : (
          posts.map((post: any) => (
            <div key={post.id} style={{ background: '#fff', border: "1px solid #e3e8f0", borderRadius: 10, padding: 12, margin: '0 auto 18px auto', boxShadow: '0 1px 4px #e3e8f0', display: 'flex', alignItems: 'flex-start', fontFamily: 'Meiryo UI, Meiryo, Yu Gothic, YuGothic, Hiragino Kaku Gothic ProN, Hiragino Sans, Arial, sans-serif', fontSize: 10, color: '#111', maxWidth: 520 }}>
              {getInitialIcon(post.nickname_ja)}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                  {/* 投稿者名は非表示にする */}
                  <span style={{ display: 'none' }}>{post.nickname_ja}</span>
                  <span style={{ fontSize: 9, color: '#888', marginLeft: 0 }}>{new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={{ marginBottom: 4, fontSize: 10, color: '#111', whiteSpace: 'pre-line', lineHeight: 1.7 }}>{post.content}</div>
                {/* いいね機能を削除 */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 