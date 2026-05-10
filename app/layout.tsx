/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "深宮謎案",
  description: "一個由第二組開發的網頁解謎遊戲專案",
};

import { AudioProvider } from "./lib/AudioContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <AudioProvider>
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}
