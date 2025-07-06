'use client';

import { useSession } from "next-auth/react";
import Link from "next/link";

export function SessionHeader() {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Signed in as: <strong className="text-gray-900 dark:text-white">{session.user?.name || session.user?.email}</strong>
        </p>
        <Link 
          href="/collection"
          className="bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded transition-colors w-fit"
        >
          Games Played
        </Link>
      </div>
    </div>
  );
}
