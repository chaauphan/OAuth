'use client';

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Bello</h1>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Bello</h1>
        {status === "loading" ? (
          <p>Loading...</p>
        ) : session ? (
          <p>Welcome, {session.user?.name || session.user?.email}!</p>
        ) : (
          <button 
            onClick={() => signIn('google')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Sign In with Google
          </button>
        )}
      </div>
    </main>
  );
}