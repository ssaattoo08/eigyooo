"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { addMonths, isSunday, isSaturday } from "date-fns";
import Holidays from 'date-holidays';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { ja } from 'date-fns/locale';
import { enUS } from 'date-fns/locale';
import { useRouter } from "next/navigation";

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
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [likeStates, setLikeStates] = useState<{ [postId: number]: { count: number; liked: boolean; likeId: string | null } }>({});
  const [likePopup, setLikePopup] = useState<{ postId: number | null; users: string[] }>({ postId: null, users: [] });
  const [editingPost, setEditingPost] = useState<{ id: number; content: string; visibility: 'public' | 'private' } | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editVisibility, setEditVisibility] = useState<'public' | 'private'>('public');
  const hd = new Holidays('JP');
  const router = useRouter();
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // メニュー外クリックで閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    }
    if (menuOpenId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpenId]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
      }
    };
    checkAuth();
  }, [router]);

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

  useEffect(() => {
    if (userId && posts.length > 0) {
      fetchLikes(posts);
    }
  }, [userId, posts]);

  const fetchMyPosts = async (nickname_ja: string) => {
    if (!nickname_ja) return;
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("nickname_ja", nickname_ja)
      .order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
    
    // いいね情報を取得
    if (data && data.length > 0) {
      fetchLikes(data);
    }
  };

  // いいね情報取得
  const fetchLikes = async (postsData: any[]) => {
    if (!userId) return;
    const postIds = postsData.map((p) => p.id);
    const { data: likesData } = await supabase
      .from("likes")
      .select("id, post_id, user_id")
      .in("post_id", postIds);
    
    const state: { [postId: number]: { count: number; liked: boolean; likeId: string | null } } = {};
    postIds.forEach(pid => {
      const likes = (likesData || []).filter(l => l.post_id === pid);
      const myLike = likes.find(l => l.user_id === userId);
      state[pid] = {
        count: likes.length,
        liked: !!myLike,
        likeId: myLike ? myLike.id : null
      };
    });
    setLikeStates(state);
  };

  // いいねトグル
  const handleLike = useCallback(async (postId: number) => {
    if (!userId) return;
    const current = likeStates[postId];
    if (current?.liked) {
      // 解除
      if (current.likeId) {
        await supabase.from("likes").delete().eq("id", current.likeId);
      }
    } else {
      // 追加
      await supabase.from("likes").insert({ post_id: postId, user_id: userId });
    }
    // 再取得
    const { data: likesData } = await supabase
      .from("likes")
      .select("id, post_id, user_id")
      .eq("post_id", postId);
    const myLike = (likesData || []).find(l => l.user_id === userId);
    setLikeStates(prev => ({
      ...prev,
      [postId]: {
        count: (likesData || []).length,
        liked: !!myLike,
        likeId: myLike ? myLike.id : null
      }
    }));
  }, [userId, likeStates]);

  // いいねユーザー一覧取得
  const handleShowLikeUsers = useCallback(async (postId: number) => {
    const { data: likesData } = await supabase
      .from("likes")
      .select("user_id")
      .eq("post_id", postId);
    const userIds = (likesData || []).map(l => l.user_id);
    if (userIds.length === 0) {
      setLikePopup({ postId, users: [] });
      return;
    }
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("nickname")
      .in("id", userIds);
    const users = (profilesData || []).map(p => p.nickname);
    setLikePopup({ postId, users });
  }, []);

  const handleCloseLikePopup = () => setLikePopup({ postId: null, users: [] });

  // 投稿編集開始
  const handleStartEdit = (post: any) => {
    setEditingPost({ id: post.id, content: post.content, visibility: post.visibility });
    setEditContent(post.content);
    setEditVisibility(post.visibility);
  };

  // 投稿編集キャンセル
  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditContent("");
    setEditVisibility('public');
  };

  // 投稿編集保存
  const handleSaveEdit = async () => {
    if (!editingPost || !editContent.trim()) {
      setError("投稿内容を入力してください。");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase
        .from("posts")
        .update({
          content: editContent,
          visibility: editVisibility,
        })
        .eq("id", editingPost.id);

      if (error) {
        throw error;
      }
      handleCancelEdit();
      fetchMyPosts(nickname);
    } catch (err) {
      console.error("Error updating post:", err);
      setError("投稿の更新に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  // 投稿削除
  const handleDeletePost = async (postId: number) => {
    if (!confirm("この投稿を削除しますか？")) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) {
        throw error;
      }
      fetchMyPosts(nickname);
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("投稿の削除に失敗しました。");
    } finally {
      setLoading(false);
    }
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
          visibility: visibility, // 追加
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
    console.log('upload filePath:', filePath); // デバッグ用
    // Storageにアップロード
    const { error: uploadError } = await supabase.storage.from('profile-icons').upload(filePath, file, { upsert: true });
    if (uploadError) {
      alert('アップロードに失敗しました');
      return;
    }
    // 公開URL取得
    console.log('getPublicUrl filePath:', filePath); // デバッグ用
    const { data } = supabase.storage.from('profile-icons').getPublicUrl(filePath);
    const publicUrl = data.publicUrl;
    // profilesテーブルに保存
    await supabase.from('profiles').update({ icon_url: publicUrl }).eq('id', userId);
    setIconUrl(publicUrl);
  };

  // アイコンのダミー（イニシャル）
  // アイコン表示は不要になったため、何も返さない
  const getInitialIcon = (nickname: string) => null;

  // アイコン表示
  // アイコン表示は不要になったため、何も返さない
  const renderIcon = () => null;

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

  // 日付ごとの投稿数を集計
  const postCountByDate: { [date: string]: number } = {};
  posts.forEach(p => {
    // UTC→JST変換
    const date = new Date(p.created_at);
    date.setHours(date.getHours() + 9); // JSTはUTC+9
    const ymd = date.toISOString().slice(0, 10);
    postCountByDate[ymd] = (postCountByDate[ymd] || 0) + 1;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#FDF6EE', color: '#9C7A3A', fontSize: 12 }}>
      {/* ナビゲーションバー */}
      <nav style={{ background: '#FDF6EE', padding: '0 0', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, fontSize: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 600, justifyContent: 'space-between', padding: '0 16px' }}>
          <div style={{
            display: 'inline-block',
            background: '#F5E7CE',
            color: '#9C7A3A',
            borderRadius: 16,
            padding: '4px 12px',
            fontSize: 15,
            fontWeight: 'bold',
            marginBottom: 0,
            letterSpacing: 0,
            fontStretch: 'condensed',
            boxShadow: '0 2px 8px #eee',
            textDecoration: 'none',
            cursor: 'default',
          }}>process</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/calendar" style={{ color: '#9C7A3A', fontWeight: 'bold', fontSize: 12, textDecoration: 'none' }}>Calendar</Link>
            <Link href="/mypage" style={{ color: '#9C7A3A', fontWeight: 'bold', fontSize: 12, textDecoration: 'none' }}>MyPage</Link>
          </div>
        </div>
      </nav>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 0 16px 0' }}>
        {/* 投稿ボックス追加 */}
        <div style={{ margin: '0 auto 4px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #eee', padding: 5, maxWidth: 520, position: 'relative', overflow: 'hidden', minHeight: 30, border: '1px solid #E5D3B3', display: 'block' }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={2}
            style={{ width: "100%", fontSize: 12, padding: 6, borderRadius: 8, border: 'none', background: '#FCF7F0', resize: 'none', marginBottom: 6, color: '#9C7A3A', boxSizing: 'border-box', outline: 'none', fontWeight: 500, minHeight: 30, height: 30, lineHeight: 1.3 }}
            placeholder="今日の頑張りや気持ちをつぶやこう！"
          />
          {/* 公開範囲選択ラジオボタン */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 6, fontSize: 12 }}>
            <label style={{ color: '#9C7A3A' }}>
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === 'public'}
                onChange={() => setVisibility('public')}
              /> 全員に公開
            </label>
            <label style={{ color: '#9C7A3A' }}>
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibility === 'private'}
                onChange={() => setVisibility('private')}
              /> 自分だけ
            </label>
          </div>
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
              background: '#B89B7B',
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
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #eee', padding: 6, margin: '0 auto 4px auto', maxWidth: 520, textAlign: 'center', minHeight: 30, border: '1px solid #E5D3B3' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
            {/* アイコン画像・イニシャルは非表示 */}
            <span style={{ fontWeight: 'bold', fontSize: 13, color: '#9C7A3A' }}>{nickname || "ニックネーム反映中..."}</span>
          </div>
          {/* カレンダーをプロフィールボックス内に大きく表示（テーブル型・祝日色分け・月送りUI） */}
          <div style={{ margin: '16px 0 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <button onClick={() => setCurrentMonth(prevMonth)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#B89B7B' }}>◀</button>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 22, letterSpacing: 0, margin: '0 16px', minWidth: 100, color: '#9C7A3A' }}>
                {format(currentMonth, 'MMMM', { locale: enUS })}
              </div>
              <button onClick={() => setCurrentMonth(nextMonth)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#B89B7B' }}>▶</button>
            </div>
            <table style={{ borderCollapse: 'collapse', width: '100%', background: '#fff', boxShadow: '0 2px 8px #eee', fontSize: 16 }}>
              <thead>
                <tr>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w, i) => (
                    <th key={w} style={{ border: '1px solid #E5D3B3', padding: 0, width: '14.2%', height: 32, color: i === 0 ? '#E89A9A' : i === 6 ? '#7BA6E5' : '#9C7A3A', fontWeight: 'bold', fontSize: 14, background: '#F5E7CE' }}>{w}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, wi) => (
                  <tr key={wi}>
                    {week.map((date, di) => {
                      const inMonth = isSameMonth(date, currentMonth);
                      const ymd = format(date, 'yyyy-MM-dd');
                      const postCount = postCountByDate[ymd] || 0;
                      const holiday = hd.isHoliday(date);
                      const isSun = date.getDay() === 0;
                      const isSat = date.getDay() === 6;
                      let color = '#9C7A3A';
                      if (holiday) color = '#E89A9A';
                      else if (isSun) color = '#E89A9A';
                      else if (isSat) color = '#7BA6E5';
                      const isOtherMonth = !inMonth;
                      return (
                        <td key={di} style={{ border: '1px solid #E5D3B3', verticalAlign: 'top', background: isOtherMonth ? '#F5E7CE' : '#fff', color, padding: 0, height: 40, textAlign: 'center', fontSize: isOtherMonth ? 11 : 16, opacity: isOtherMonth ? 0.5 : 1 }}>
                          <div style={{ fontWeight: postCount > 0 ? 'bold' : 'normal', marginTop: 2, fontSize: isOtherMonth ? 11 : 16, color }}>{date.getDate()}</div>
                          {/* 投稿数に応じた記号を日付の下に表示 */}
                          {postCount === 1 && <div style={{ fontSize: 13, color: '#B89B7B', marginTop: 2 }}>◯</div>}
                          {postCount === 2 && <div style={{ fontSize: 13, color: '#B89B7B', marginTop: 2 }}>◎</div>}
                          {postCount === 3 && <div style={{ fontSize: 13, color: '#B89B7B', marginTop: 2 }}>☆</div>}
                          {postCount >= 4 && <div style={{ fontSize: 13, color: '#B89B7B', marginTop: 2 }}>卍</div>}
                          {/* 祝日名の表示は削除 */}
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
          <div style={{ color: "#B89B7B", textAlign: 'center', fontSize: 12 }}>読み込み中...</div>
        ) : posts.length === 0 ? (
          <div style={{ color: "#B89B7B", textAlign: 'center', marginTop: 32, fontSize: 12 }}>まだ投稿がありません。</div>
        ) : (
          posts.map((post: any) => (
            <div key={post.id} style={{ background: '#fff', border: "1px solid #E5D3B3", borderRadius: 10, padding: 6, margin: '0 auto 6px auto', boxShadow: '0 1px 4px #eee', display: 'flex', alignItems: 'flex-start', fontFamily: 'Meiryo UI, Meiryo, Yu Gothic, YuGothic, Hiragino Kaku Gothic ProN, Hiragino Sans, Arial, sans-serif', fontSize: 10, color: '#9C7A3A', maxWidth: 520, position: 'relative' }}>
              {/* アイコン画像・イニシャルは非表示 */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                  {/* 投稿者名は非表示にする */}
                  <span style={{ display: 'none' }}>{post.nickname_ja}</span>
                  <span style={{ fontSize: 9, color: '#B89B7B', marginLeft: 0, display: 'inline-flex', alignItems: 'center' }}>
                    {new Date(post.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    {' '}
                    {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {/* おしゃれな鍵マークSVGを投稿日の右横にインライン表示 */}
                    {post.visibility === 'private' && (
                      <span style={{ marginLeft: 8, display: 'inline-flex', verticalAlign: 'middle' }} title="自分だけの投稿">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9C7A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="5" y="11" width="14" height="8" rx="2" fill="#fff" stroke="#9C7A3A"/>
                          <path d="M8 11V7a4 4 0 1 1 8 0v4" fill="none" stroke="#9C7A3A"/>
                          <circle cx="12" cy="15" r="1" fill="#9C7A3A"/>
                        </svg>
                      </span>
                    )}
                  </span>
                  {/* ︙メニューボタン */}
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      marginLeft: 'auto',
                      cursor: 'pointer',
                      outline: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      position: 'absolute',
                      right: 10,
                      top: 8,
                      zIndex: 10
                    }}
                    aria-label="メニュー"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B89B7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="5" r="1.2" fill="#B89B7B" />
                      <circle cx="12" cy="12" r="1.2" fill="#B89B7B" />
                      <circle cx="12" cy="19" r="1.2" fill="#B89B7B" />
                    </svg>
                  </button>
                  {/* メニュー本体 */}
                  {menuOpenId === post.id && (
                    <div ref={menuRef} style={{
                      position: 'absolute',
                      right: 10,
                      top: 28,
                      background: '#fff',
                      border: '1px solid #E5D3B3',
                      borderRadius: 8,
                      boxShadow: '0 4px 16px #eee',
                      minWidth: 80,
                      zIndex: 100,
                      padding: '6px 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                    }}>
                      <button
                        onClick={() => { setMenuOpenId(null); handleStartEdit(post); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#9C7A3A',
                          fontWeight: 'normal',
                          fontSize: 12,
                          padding: '8px 16px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          borderBottom: '1px solid #F5E7CE',
                          borderRadius: '8px 8px 0 0',
                          transition: 'background 0.15s',
                        }}
                      >編集</button>
                      <button
                        onClick={() => { setMenuOpenId(null); handleDeletePost(post.id); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#E89A9A',
                          fontWeight: 'normal',
                          fontSize: 12,
                          padding: '8px 16px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          borderRadius: '0 0 8px 8px',
                          transition: 'background 0.15s',
                        }}
                      >削除</button>
                    </div>
                  )}
                </div>
                {editingPost?.id === post.id ? (
                  // 編集モード
                  <div style={{ marginBottom: 4 }}>
                    <textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      rows={3}
                      style={{ width: "100%", fontSize: 10, padding: 6, borderRadius: 8, border: '1px solid #E5D3B3', background: '#FCF7F0', resize: 'none', color: '#9C7A3A', boxSizing: 'border-box', outline: 'none', fontWeight: 500, lineHeight: 1.3 }}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 10 }}>
                      <label style={{ color: '#9C7A3A' }}>
                        <input
                          type="radio"
                          name={`edit-visibility-${post.id}`}
                          value="public"
                          checked={editVisibility === 'public'}
                          onChange={() => setEditVisibility('public')}
                        /> 全員に公開
                      </label>
                      <label style={{ color: '#9C7A3A' }}>
                        <input
                          type="radio"
                          name={`edit-visibility-${post.id}`}
                          value="private"
                          checked={editVisibility === 'private'}
                          onChange={() => setEditVisibility('private')}
                        /> 自分だけ
                      </label>
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                      <button
                        onClick={handleSaveEdit}
                        disabled={loading}
                        style={{
                          padding: '2px 8px',
                          background: '#B89B7B',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          fontSize: 9,
                          fontWeight: 'bold',
                          cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {loading ? "..." : "保存"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          padding: '2px 8px',
                          background: '#F5E7CE',
                          color: '#9C7A3A',
                          border: '1px solid #E5D3B3',
                          borderRadius: 4,
                          fontSize: 9,
                          fontWeight: 'bold',
                          cursor: 'pointer',
                        }}
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  // 通常表示
                  <div style={{ marginBottom: 4, fontSize: 10, color: '#9C7A3A', whiteSpace: 'pre-line', lineHeight: 1.7 }}>{post.content}</div>
                )}
                {/* いいねUI */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, justifyContent: 'space-between' }}>
                  {/* 編集・削除ボタン */}
                  <div style={{ display: 'flex', gap: 2 }}>
                    {/* 編集・削除ボタン部分は削除（メニューに統合） */}
                  </div>
                  {/* いいねボタン */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: likeStates[post.id]?.liked ? '#E89A9A' : '#B89B7B',
                        fontSize: 10, // 14→10
                        transition: 'color 0.2s',
                        marginRight: 2, // 余白追加
                      }}
                      title={likeStates[post.id]?.liked ? "いいね済み" : "いいね！"}
                      onClick={() => handleLike(post.id)}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill={likeStates[post.id]?.liked ? "#E89A9A" : "none"} stroke="#E89A9A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z" fill={likeStates[post.id]?.liked ? "#E89A9A" : "#fff"}/>
                        <path d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z" fill="#E89A9A" fillOpacity="0.15"/>
                      </svg>
                    </button>
                    <span
                      style={{ fontSize: 8, color: '#B89B7B', marginLeft: 1, fontWeight: 500, cursor: 'pointer', textDecoration: 'underline', userSelect: 'none', lineHeight: 1 }}
                      onClick={() => handleShowLikeUsers(post.id)}
                      title="いいねしたユーザー一覧を表示"
                    >
                      {likeStates[post.id]?.count ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* いいねユーザーポップアップ */}
      {likePopup.postId !== null && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.10)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={handleCloseLikePopup}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 2px 12px #eee',
              padding: 20,
              minWidth: 180,
              maxWidth: 260,
              width: '90vw',
              maxHeight: '60vh',
              overflowY: 'auto',
              position: 'relative',
              textAlign: 'center',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontWeight: 'bold', fontSize: 13, color: '#9C7A3A', marginBottom: 10 }}>いいねした人</div>
            {likePopup.users.length === 0 ? (
              <div style={{ color: '#B89B7B', fontSize: 12 }}>まだ誰もいいねしていません</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {likePopup.users.map((n, i) => (
                  <li key={i} style={{ fontSize: 13, color: '#9C7A3A', padding: '2px 0' }}>{n}</li>
                ))}
              </ul>
            )}
            <button
              onClick={handleCloseLikePopup}
              style={{ marginTop: 14, padding: '4px 18px', background: '#F5E7CE', color: '#9C7A3A', borderRadius: 8, fontSize: 12, border: '1px solid #E5D3B3', fontWeight: 'bold', cursor: 'pointer' }}
            >閉じる</button>
          </div>
        </div>
      )}
    </div>
  );
} 