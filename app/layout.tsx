import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import Head from "next/head";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "process",
  description: "営業職のための匿名SNS"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <Head>
        <title>process</title>
        <meta name="description" content="営業職のための匿名SNS" />
      </Head>
      <body style={{ background: '#fff', color: '#111', fontFamily: 'Meiryo UI, Meiryo, Yu Gothic, YuGothic, Hiragino Kaku Gothic ProN, Hiragino Sans, Arial, sans-serif', fontSize: 13, minHeight: '100vh' }}>
        <nav style={{ padding: '10px 20px', background: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Link href="/" style={{ fontWeight: 'bold', fontSize: 18, color: '#111', textDecoration: 'none', letterSpacing: 0, fontStretch: 'condensed' }}>process</Link>
          <div style={{ display: 'flex', gap: 18 }}>
            <Link href="/calendar" style={{ color: '#111', fontWeight: 'bold', fontSize: 15, textDecoration: 'none' }}>Calendar</Link>
            <Link href="/mypage" style={{ color: '#111', fontWeight: 'bold', fontSize: 15, textDecoration: 'none' }}>MyPage</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
