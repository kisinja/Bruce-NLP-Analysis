"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import TranslationHistoryCard from "@/components/TranslationHistoryCard";
import SentimentHistoryCard from "@/components/SentimentHistoryCard";

type TranslationHistoryItem = {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  originalText: string;
  translatedText: string;
  createdAt: string;
};

type SentimentHistoryItem = {
  id: string;
  text: string;
  label: string;
  score: number;
  magnitude?: number;
  emoji?: string;
  language: string;
  createdAt: string;
};

type CombinedHistoryItem = {
  id: string;
  type: "translation" | "sentiment";
  data: TranslationHistoryItem | SentimentHistoryItem;
  createdAt: string;
};

export default function CombinedHistoryPage() {
  const { userId } = useAuth();
  const [combinedHistory, setCombinedHistory] = useState<CombinedHistoryItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "translations" | "sentiments"
  >("all");

  useEffect(() => {
    const fetchHistories = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch both histories in parallel
        const [translationsRes, sentimentsRes] = await Promise.all([
          fetch("/api/user/history"),
          fetch("/api/user/sentiment"),
        ]);

        if (!translationsRes.ok || !sentimentsRes.ok) {
          throw new Error("Failed to fetch histories");
        }

        const translations = await translationsRes.json();
        const sentiments = await sentimentsRes.json();

        // Combine and sort by date
        const combined = [
          ...translations.map((item: TranslationHistoryItem) => ({
            id: item.id,
            type: "translation",
            data: item,
            createdAt: item.createdAt,
          })),
          ...sentiments.map((item: SentimentHistoryItem) => ({
            id: item.id,
            type: "sentiment",
            data: item,
            createdAt: item.createdAt,
          })),
        ].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setCombinedHistory(combined);
      } catch (err) {
        console.error("Error fetching histories:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchHistories();
  }, [userId]);

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="mb-6">Please sign in to view your history.</p>
          <Link
            href="/sign-in"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Filter history based on active tab
  const filteredHistory = combinedHistory.filter((item) => {
    if (activeTab === "all") return true;
    return item.type === activeTab.slice(0, -1); // 'translations' -> 'translation'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-3xl mx-auto">
          {/* Header with tabs */}
          <div className="border-b border-gray-200">
            <div className="px-6 py-5 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <svg
                  className="w-6 h-6 mr-2 text-indigo-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Your History
              </h3>
              <Link
                href="/"
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Back to Translator
              </Link>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "all"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  All Activities
                </button>
                <button
                  onClick={() => setActiveTab("translations")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "translations"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Translations
                </button>
                <button
                  onClick={() => setActiveTab("sentiments")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "sentiments"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Sentiment Analyses
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No {activeTab === "all" ? "history" : activeTab} found
            </div>
          ) : (
            <div className="divide-y divide-gray-200 max-h-[calc(100vh-250px)] overflow-y-auto">
              {filteredHistory.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  {item.type === "translation" ? (
                    <TranslationHistoryCard
                      item={item.data as TranslationHistoryItem}
                    />
                  ) : (
                    <SentimentHistoryCard
                      item={item.data as SentimentHistoryItem}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
