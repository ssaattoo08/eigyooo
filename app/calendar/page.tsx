"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import Holidays from 'date-holidays';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay } from 'date-fns';

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
    if (error) {
      // setError("投稿の取得に失敗しました: " + error.message); // Original code had this line commented out
    } else {
      setPosts(data || []);
    }
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

  // 月次カレンダー生成
  const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
  const days = [];
  let d = start;
  while (d <= end) {
    days.push(new Date(d));
    d = new Date(d);
    d.setDate(d.getDate() + 1);
  }
  const postDates = posts.map(p => p.created_at.slice(0, 10));

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111' }}>
      {/* ナビゲーションバー */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e3e8f0', padding: '0 0', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 600, justifyContent: 'space-between', padding: '0 16px' }}>
          <Link href="/" style={{ fontWeight: 'bold', fontSize: 18, color: '#111', textDecoration: 'none', letterSpacing: 0, fontStretch: 'condensed' }}>process</Link>
          <div style={{ display: 'flex', gap: 18 }}>
            <Link href="/calendar" style={{ color: '#111', fontWeight: 'bold', fontSize: 15, textDecoration: 'none' }}>Calendar</Link>
            <Link href="/mypage" style={{ color: '#111', fontWeight: 'bold', fontSize: 15, textDecoration: 'none' }}>MyPage</Link>
          </div>
        </div>
      </nav>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: 0 }}>
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18, margin: '24px 0' }}>
          {format(currentMonth, 'yyyy年M月')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 40px)', gap: 4, justifyContent: 'center' }}>
          {["日", "月", "火", "水", "木", "金", "土"].map((w, i) => (
            <div key={w} style={{ textAlign: 'center', fontSize: 13, color: i === 0 ? '#e00' : i === 6 ? '#0070f3' : '#111', fontWeight: 'bold' }}>{w}</div>
          ))}
          {days.map((date, i) => {
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
            return (
              <div key={i} style={{
                width: 40, height: 40, borderRadius: 8, background: posted ? '#111' : inMonth ? '#fff' : '#f6f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color,
                fontWeight: posted ? 'bold' : 'normal',
                fontSize: 15,
                margin: 0,
                position: 'relative',
              }}>
                {posted ? (
                  <span style={{ borderRadius: '50%', width: 28, height: 28, background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 15 }}>{date.getDate()}</span>
                ) : (
                  <span>{date.getDate()}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 