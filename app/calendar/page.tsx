"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import Holidays from 'date-holidays';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { enUS } from 'date-fns/locale';

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
  const hd = new Holidays('JP');

  useEffect(() => {
    fetchPosts();
  }, [currentMonth]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setPosts(data || []);
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
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111', padding: 0 }}>
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
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 0 }}>
        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '32px 0 8px 0' }}>
          <button onClick={() => setCurrentMonth(prevMonth)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#b89b7b' }}>◀</button>
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 28, letterSpacing: 0, minWidth: 120, color: '#7c5c2e' }}>
            {format(currentMonth, 'MMMM', { locale: enUS })}
          </div>
          <button onClick={() => setCurrentMonth(nextMonth)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#b89b7b' }}>▶</button>
        </div>
        {/* やさしい区切りのリスト型カレンダー本体 */}
        <div style={{ margin: '0 0 32px 0', background: '#fdf6ee', border: '1px solid #e5d3b3', borderRadius: 12, overflow: 'hidden', maxWidth: 600, boxShadow: 'none' }}>
          {days.map((date, idx) => {
            const ymd = format(date, 'yyyy-MM-dd');
            const nicknames = nicknamesByDate[ymd] || [];
            const dayName = format(date, 'EEE', { locale: enUS }).toUpperCase();
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            // 交互に背景色を変える
            const rowBg = idx % 2 === 0 ? '#fdf6ee' : '#f7e9d2';
            return (
              <div key={ymd} style={{
                display: 'flex',
                alignItems: 'center',
                minHeight: 44,
                padding: '0 16px',
                background: isToday ? '#ffecc7' : rowBg,
                borderTop: idx === 0 ? 'none' : '1px solid #e5d3b3',
                borderBottom: '1px solid #e5d3b3',
                fontSize: 15,
                transition: 'background 0.2s',
              }}>
                <div style={{
                  minWidth: 98,
                  textAlign: 'center',
                  color: '#7c5c2e',
                  fontWeight: 'bold',
                  fontSize: 15,
                  letterSpacing: 1,
                  padding: '8px 0',
                }}>
                  {format(date, 'yyyy/MM/dd')} <span style={{ fontSize: 12, color: '#b89b7b', fontWeight: 'bold' }}>{dayName}</span>
                </div>
                <div style={{ flex: 1, fontSize: 14, color: '#7c5c2e', fontWeight: 500, letterSpacing: 0.5, padding: '8px 0', minHeight: 24 }}>
                  {nicknames.length > 0 ? (
                    <span>{nicknames.join(', ')}</span>
                  ) : (
                    <span style={{ color: '#c8b9a6', fontWeight: 400 }}>投稿なし</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 