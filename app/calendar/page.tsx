"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import Holidays from 'date-holidays';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { enUS } from 'date-fns/locale';
import React from "react";

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

export default function CalendarPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNickname, setModalNickname] = useState<string | null>(null);
  const [modalPosts, setModalPosts] = useState<any[]>([]);
  const hd = new Holidays('JP');

  useEffect(() => {
    fetchPosts();
  }, [currentMonth]);

  useEffect(() => {
    // デバッグ用: posts配列の中身を出力
    if (posts.length > 0) {
      console.log('postsデータ:', posts.map(p => ({ nickname_ja: p.nickname_ja, visibility: p.visibility, content: p.content, created_at: p.created_at })));
    }
  }, [posts]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setPosts(data || []);
  };

  // モーダル用: 指定ニックネームの全員公開投稿を取得
  const openModal = (nickname: string) => {
    const filtered = posts.filter(
      (p) =>
        (p.nickname_ja?.trim() ?? '') === nickname.trim() &&
        (typeof p.visibility === 'string' && p.visibility.toLowerCase() === 'public')
    );
    setModalNickname(nickname);
    setModalPosts(filtered);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setModalNickname(null);
    setModalPosts([]);
  };

  // 日付ごとの投稿者ニックネーム一覧をJST基準で集計
  const nicknamesByDate: { [date: string]: string[] } = {};
  posts.forEach(p => {
    // UTC→JST変換
    const date = new Date(p.created_at);
    date.setHours(date.getHours() + 9);
    const ymd = date.toISOString().slice(0, 10);
    if (!nicknamesByDate[ymd]) nicknamesByDate[ymd] = [];
    if (p.nickname_ja && !nicknamesByDate[ymd].includes(p.nickname_ja)) {
      nicknamesByDate[ymd].push(p.nickname_ja);
    }
  });

  // 現在の月の日付リストを作成
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days: Date[] = [];
  let d = new Date(start);
  while (d <= end) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }

  // 前月・翌月の月
  const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

  return (
    <div style={{ minHeight: '100vh', background: '#FDF6EE', color: '#9C7A3A', padding: 0, fontSize: 12 }}>
      {/* ナビゲーションバー */}
      <nav style={{ background: '#FDF6EE', borderBottom: '1px solid #E5D3B3', padding: '0 0', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, fontSize: 13 }}>
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
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 0 }}>
        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '24px 0 4px 0' }}>
          <button onClick={() => setCurrentMonth(prevMonth)} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#b89b7b' }}>◀</button>
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18, letterSpacing: 0, minWidth: 80, color: '#7c5c2e' }}>
            {format(currentMonth, 'MMMM', { locale: enUS })}
          </div>
          <button onClick={() => setCurrentMonth(nextMonth)} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#b89b7b' }}>▶</button>
        </div>
        {/* カレンダーリストを昇順（1日→末日が下）で表示。投稿がない日は空欄。未来の日付は表示しない */}
        <div style={{ margin: '0 0 16px 0' }}>
          {[...days].reverse().filter(date => date <= new Date()).map((date, idx) => {
            const ymd = format(date, 'yyyy-MM-dd');
            const nicknames = nicknamesByDate[ymd] || [];
            const dayName = format(date, 'EEE', { locale: enUS }).toUpperCase();
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            return (
              <div key={ymd} style={{
                background: isToday ? '#f7e9d2' : '#fdf6ee',
                border: '1px solid #e5d3b3',
                borderRadius: 16,
                boxShadow: '0 2px 8px #f3e6d6',
                margin: '0 auto 8px auto',
                padding: '10px 10px 6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                minHeight: 36,
                maxWidth: 520,
                width: '100%',
              }}>
                <div style={{
                  minWidth: 60,
                  textAlign: 'center',
                  color: '#7c5c2e',
                  fontWeight: 'bold',
                  fontSize: 12,
                  letterSpacing: 1,
                }}>
                  {format(date, 'yyyy/MM/dd')}<br />
                  <span style={{ fontSize: 9, color: '#b89b7b', fontWeight: 'bold' }}>{dayName}</span>
                </div>
                <div style={{ flex: 1, fontSize: 10, color: '#7c5c2e', fontWeight: 500, letterSpacing: 0.5 }}>
                  {nicknames.length > 0 ? (
                    <span>
                      {nicknames.map((n, i) => (
                        <React.Fragment key={n}>
                          <span
                            style={{
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              color: '#B89B7B',
                              marginRight: 6
                            }}
                            onClick={() => openModal(n)}
                          >
                            {n}
                          </span>
                          {i < nicknames.length - 1 && ', '}
                        </React.Fragment>
                      ))}
                    </span>
                  ) : (
                    null
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* モーダル */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={closeModal}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 4px 24px #b89b7b33',
              padding: 24,
              minWidth: 320,
              maxWidth: 420,
              width: '90vw',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: 18,
                color: '#b89b7b',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
              aria-label="閉じる"
            >×</button>
            <div style={{ fontWeight: 'bold', fontSize: 15, color: '#9C7A3A', marginBottom: 12 }}>{modalNickname}さんの公開投稿</div>
            {modalPosts.length === 0 ? (
              <div style={{ color: '#B89B7B', fontSize: 12 }}>全員に公開された投稿はありません。</div>
            ) : (
              modalPosts.map((p) => (
                <div key={p.id} style={{
                  background: '#fdf6ee',
                  border: '1px solid #e5d3b3',
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 10,
                  fontSize: 12,
                  color: '#9C7A3A',
                  boxShadow: '0 1px 4px #eee',
                }}>
                  <div style={{ fontSize: 11, color: '#B89B7B', marginBottom: 2 }}>
                    {new Date(p.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </div>
                  <div style={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>{p.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 