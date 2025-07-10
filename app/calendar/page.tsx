"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import Holidays from 'date-holidays';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';

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

  // 2ヶ月分の月（今月・翌月）
  const months = [currentMonth, new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)];

  // カレンダー生成（月曜始まり）
  const getMonthMatrix = (monthDate: Date) => {
    const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
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
    return weeks;
  };
  const weekLabels = ["月", "火", "水", "木", "金", "土", "日"];
  const postDates = posts.map(p => p.created_at.slice(0, 10));

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111', padding: 0 }}>
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
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 0 }}>
        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '32px 0 8px 0' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 28, letterSpacing: 0 }}>{format(currentMonth, 'M', { locale: ja })}</div>
          <div style={{ textAlign: 'center', fontSize: 15, color: '#888', marginBottom: 8 }}>{format(currentMonth, 'yyyy年', { locale: ja })}</div>
        </div>
        {/* カレンダー本体 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 32 }}>
          {months.map((monthDate, idx) => {
            const weeks = getMonthMatrix(monthDate);
            return (
              <div key={idx} style={{ minWidth: 320 }}>
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 28, marginBottom: 8 }}>{format(monthDate, 'yyyy年M月', { locale: ja })}</div>
                <table style={{ borderCollapse: 'collapse', width: '100%', background: '#fff', fontSize: 18 }}>
                  <thead>
                    <tr>
                      {weekLabels.map((w, i) => (
                        <th key={w} style={{ border: 'none', padding: 0, width: '14.2%', height: 32, color: i === 5 ? '#0070f3' : i === 6 ? '#e00' : '#111', fontWeight: 'bold', fontSize: 16, background: '#fff' }}>{w}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weeks.map((week, wi) => (
                      <tr key={wi}>
                        {week.map((date, di) => {
                          const inMonth = isSameMonth(date, monthDate);
                          const ymd = format(date, 'yyyy-MM-dd');
                          const posted = postDates.includes(ymd);
                          const holiday = hd.isHoliday(date);
                          let color = '#111';
                          if (holiday) color = '#e00';
                          else if (date.getDay() === 0) color = '#e00'; // 日曜
                          else if (date.getDay() === 6) color = '#0070f3'; // 土曜
                          const isOtherMonth = !inMonth;
                          return (
                            <td key={di} style={{ verticalAlign: 'top', background: isOtherMonth ? '#fafbfc' : '#fff', color, padding: 0, height: 40, textAlign: 'center', fontSize: isOtherMonth ? 13 : 18, opacity: isOtherMonth ? 0.5 : 1 }}>
                              <div style={{ fontWeight: posted ? 'bold' : 'normal', marginTop: 4, fontSize: isOtherMonth ? 13 : 18 }}>{date.getDate()}</div>
                              {holiday && (
                                <div style={{ color: '#e00', fontSize: 11, marginTop: 2 }}>{holiday[0].name}</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 