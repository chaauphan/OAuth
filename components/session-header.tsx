'use client';

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { DisplayNameSetup } from "./display-name-setup";

export function SessionHeader() {
  const { data: session } = useSession();
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);

  if (!session) {
    return null;
  }

  return (
    <>
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-zinc-700">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-black dark:text-white">
                <span className="inline-flex mb-6 mr-2">
                  <Image 
                    src="/piplup_nom.png" 
                    alt="Nom" 
                    width={128}
                    height={128}
                    className="w-12 h-12"
                  />
                </span>
                  Chau
                <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                  (and friends)
                </span>
                <span className="text-2xl font-bold text-black dark:text-white">&apos;s Game Log </span>
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Signed in as: <strong className="text-gray-900 dark:text-white">{session.user?.email}</strong>
              </p>
                          {session.user?.displayName && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Display name: <strong className="text-gray-900 dark:text-white">{session.user.displayName}</strong>
              </p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          
          <Link 
            href="/"
            className="bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded transition-colors w-fit"
            >
            Home
          </Link>
          <Link 
            href="/collection"
            className="bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded transition-colors w-fit"
          >
            Games Played
          </Link>

          { /* <Link 
            href="/community"
            className="bg-green-500 hover:bg-green-400 text-white text-sm font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded transition-colors w-fit"
            >
            Community Feed
          </Link> 

          {!session.user?.displayName && (
            <button
              onClick={() => setShowDisplayNameModal(true)}
              className="bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded transition-colors w-fit"
            >
              Set Display Name
            </button>
          )}*/}
        </div>
        </div>
      </div>

      {/* Display name*/}
      {showDisplayNameModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Set Display Name
              </h2>
              <button
                onClick={() => setShowDisplayNameModal(false)}
                className="cursor-pointer text-gray-500 dark:text-white hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <DisplayNameSetup 
              onDisplayNameSet={() => {
                setShowDisplayNameModal(false);
                window.location.reload();
              }}
              showEditButton={false}
            />
          </div>
        </div>
      )}
    </>
  );
}
