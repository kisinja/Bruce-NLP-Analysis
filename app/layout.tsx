import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
//import { SessionProvider } from "next-auth/react";


export const metadata: Metadata = {
  title: "Bruce NLP Translation",
  description: "Translate and analyze from here",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`bg-gray-100`}
      >
        <ClerkProvider>
          <Navbar />
          <main className="flex min-h-screen flex-col items-center justify-between px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
            {children}
          </main>
        </ClerkProvider>
      </body>
    </html>
  );
}
