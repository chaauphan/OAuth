'use client';

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
    <main className="min-h-screen flex items-center justify-center bg-green">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Bello</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
        >
          Get started
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full text-center">
            {status === "loading" ? (
              <p>Loading...</p>
            ) : session ? (
              <>
                <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
                <p className="mb-6">You are signed in as: <strong>{session.user?.name || session.user?.email}</strong></p>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4 text-black">Sign In Required</h2>
                <p className="mb-6 text-black">Please sign in to join Poobie&apos;s site.</p>
                <button
                  onClick={() => signIn('google')}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition mb-4 w-full"
                >
                  Sign In with Google
                </button>
                <button
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition mb-4 w-full"
                >
                  Create Account
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition w-full"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}