import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { SessionHeader } from "@/components/session-header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chau's Really Cool Site ",
  description: "Poop",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} antialiased`}
    >
      <head />
      <body className="bg-white text-black dark:bg-gray-800 dark:text-white">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <SessionHeader />
              <div className="flex justify-end p-4">
                <ModeToggle />
              </div>
              
              {children}
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}