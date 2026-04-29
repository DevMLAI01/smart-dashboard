"use client";

import { LayoutDashboard, Share2, Check } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface HeaderProps {
  title?: string;
  showShare?: boolean;
}

export function Header({ title, showShare }: HeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4 flex-shrink-0">
      <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
        <LayoutDashboard className="w-5 h-5" />
        <span className="font-bold text-base">Smart Dashboard</span>
      </Link>
      {title && (
        <>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600 font-medium text-sm truncate max-w-[300px]">{title}</span>
        </>
      )}
      <div className="ml-auto flex items-center gap-3">
        {showShare && (
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share Dashboard
              </>
            )}
          </button>
        )}
        <Link
          href="/"
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          Upload New
        </Link>
      </div>
    </header>
  );
}
