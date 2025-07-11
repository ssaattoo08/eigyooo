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

  // カレンダー生成
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

  // 日付ごとの投稿者ニックネーム一覧を集計
  const nicknamesByDate: { [date: string]: string[] } = {};
  posts.forEach(p => {
    const ymd = p.created_at.slice(0, 10);
    if (!nicknamesByDate[ymd]) nicknamesByDate[ymd] = [];
    if (p.nickname_ja && !nicknamesByDate[ymd].includes(p.nickname_ja)) {
      nicknamesByDate[ymd].push(p.nickname_ja);
    }
  });

  // 前月・翌月の月
  const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111', padding: 0 }}>
      {/* ナビゲーションバー */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e3e8f0', padding: '0 0', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 600, justifyContent: 'space-between', padding: '0 16px' }}>
          {/* ロゴ画像の表示（中央揃え） */}
          <div style={{ textAlign: 'center', padding: 0 }}>
            <img src="/logo-process-horizontal.png" alt="process logo" style={{ maxWidth: 120, height: 'auto', verticalAlign: 'middle' }} />
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            <Link href="/calendar" style={{ color: '#111', fontWeight: 'bold', fontSize: 15, textDecoration: 'none' }}>Calendar</Link>
            <Link href="/mypage" style={{ color: '#111', fontWeight: 'bold', fontSize: 15, textDecoration: 'none' }}>MyPage</Link>
          </div>
        </div>
      </nav>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 0 }}>
        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '32px 0 8px 0' }}>
          <button onClick={() => setCurrentMonth(prevMonth)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>◀</button>
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 28, letterSpacing: 0, minWidth: 120 }}>
            {format(currentMonth, 'MMMM', { locale: enUS })}
          </div>
          <button onClick={() => setCurrentMonth(nextMonth)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>▶</button>
        </div>
        {/* 年の表示は削除 */}
        {/* <div style={{ textAlign: 'center', fontSize: 15, color: '#888', marginBottom: 8 }}>{format(currentMonth, 'yyyy年', { locale: ja })}</div> */}
        {/* カレンダー本体 */}
        <table style={{ borderCollapse: 'collapse', width: '100%', background: '#fff', boxShadow: '0 2px 8px #eee', fontSize: 18 }}>
          <thead>
            <tr>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w, i) => (
                <th key={w} style={{ border: '1px solid #e3e8f0', padding: 0, width: '14.2%', height: 36, color: i === 0 ? '#e00' : i === 6 ? '#0070f3' : '#111', fontWeight: 'bold', fontSize: 16, background: '#fafbfc' }}>{w}</th>
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
                  const nicknames = nicknamesByDate[ymd] || [];
                  const holiday = hd.isHoliday(date);
                  const isSun = date.getDay() === 0;
                  const isSat = date.getDay() === 6;
                  let color = '#111';
                  if (holiday) color = '#e00';
                  else if (isSun) color = '#e00';
                  else if (isSat) color = '#0070f3';
                  const isOtherMonth = !inMonth;
                  return (
                    <td key={di} style={{ border: '1px solid #e3e8f0', verticalAlign: 'top', background: isOtherMonth ? '#fafbfc' : '#fff', color, padding: 0, height: 64, textAlign: 'center', fontSize: isOtherMonth ? 13 : 18, opacity: isOtherMonth ? 0.5 : 1 }}>
                      <div style={{ fontWeight: posted ? 'bold' : 'normal', marginTop: 4, fontSize: isOtherMonth ? 13 : 18, color: holiday ? '#e00' : color }}>{date.getDate()}</div>
                      {/* 投稿があった場合、その日の投稿者ニックネーム一覧を小さく表示 */}
                      {nicknames.length > 0 && (
                        <div style={{
                          fontSize: 10,
                          color: '#888',
                          marginTop: 2,
                          wordBreak: 'break-all',
                          lineHeight: 1.2,
                          maxHeight: 24,
                          overflowY: 'auto',
                        }}>
                          {nicknames.join(', ')}
                        </div>
                      )}
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
  );
} 