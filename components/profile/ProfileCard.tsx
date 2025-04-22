"use client";

import type React from "react";

interface ProfileCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

export default function ProfileCard({ label, value, icon }: ProfileCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 p-5 flex gap-4 items-start">
      <div className="text-blue-600 dark:text-blue-400 mt-1">{icon}</div>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-base font-medium text-gray-900 dark:text-white break-words">{value}</p>
      </div>
    </div>
  );
}