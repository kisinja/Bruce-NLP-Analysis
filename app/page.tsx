"use client";

import AnalyseSentimentButton from "@/components/AnalyseSentimentButton";
import TranslateButton from "@/components/TranslateButton";
import { useLanguages } from "@/hooks/useLanguages";
import { useState } from "react";

type HistoryItem = {
  sourceLanguage: string;
  targetLanguage: string;
  originalText: string;
  translatedText: string;
  timestamp: string;
};

type SentimentData = {
  label: string;
  emoji: string;
  score?: number;
  magnitude?: number;
};

const HomePage = () => {
  const [text, setText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [translationResult, setTranslationResult] = useState<string | null>(
    null
  );
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [sentimentHistory, setSentimentHistory] = useState<
    {
      text: string;
      label: string;
      score?: number;
      magnitude?: number;
      emoji: string;
      language: string;
      timestamp: string;
    }[]
  >([]);

  const handleTranslate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const API_KEY = process.env.NEXT_PUBLIC_TRANSLATE_API_KEY;
      // Step 1: Call Google Translate API
      const translateRes = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            q: text,
            source: sourceLanguage,
            target: targetLanguage,
            format: "text",
          }),
        }
      );

      if (!translateRes.ok) {
        throw new Error(
          `Translation error: ${translateRes.status} ${translateRes.statusText}`
        );
      }

      const translateData = await translateRes.json();
      const translatedText = translateData.data.translations[0].translatedText;

      setTranslationResult(translatedText);
      setSuccess("Translation successful!");
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

      // Step 2: Save to history
      const historyRes = await fetch("/api/user/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceLanguage,
          targetLanguage,
          originalText: text,
          translatedText,
        }),
      });

      if (!historyRes.ok) {
        throw new Error("Failed to save translation history");
      }

      //const savedHistoryItem = await historyRes.json(); // Fixed: using historyRes instead of res

      // Update local state
      const newHistoryItem = {
        sourceLanguage,
        targetLanguage,
        originalText: text,
        translatedText,
        timestamp: new Date().toLocaleString(),
      };

      setHistory((prevHistory) => [newHistoryItem, ...prevHistory].slice(0, 3));
      localStorage.setItem(
        "translations",
        JSON.stringify([newHistoryItem, ...history].slice(0, 10)) // Keep last 10 in localStorage
      );
    } catch (error) {
      console.error("Translation error:", error);
      setError(
        `Translation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentData = (score: number): SentimentData => {
    if (score > 0.6) {
      return { label: "Very Positive", emoji: "😍", score };
    } else if (score > 0.2) {
      return { label: "Positive", emoji: "😊", score };
    } else if (score > -0.2) {
      return { label: "Neutral", emoji: "😐", score };
    } else if (score > -0.6) {
      return { label: "Negative", emoji: "😠", score };
    } else {
      return { label: "Very Negative", emoji: "😡", score };
    }
  };

  const languages: { language: string; name: string }[] = useLanguages();

  const handleSentimentAnalysis = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setSentimentData(null);

    try {
      const API_KEY = "AIzaSyAUgp0cDrh90yPAZWm6RdcKlUT8Tv9ymXU";
      const url = `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${API_KEY}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document: {
            content: text,
            type: "PLAIN_TEXT",
            language: sourceLanguage,
          },
          encodingType: "UTF8",
        }),
      });

      if (!res.ok) throw new Error("Failed to analyze sentiment");

      const data = await res.json();
      const sentiment = getSentimentData(data.documentSentiment.score);
      sentiment.magnitude = data.documentSentiment.magnitude;

      setSentimentData(sentiment);
      setSuccess("Sentiment analysis completed!");
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

      // Save to history
      const historyRes = await fetch("/api/user/sentiment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          label: sentiment.label,
          score: sentiment.score,
          magnitude: sentiment.magnitude,
          emoji: sentiment.emoji,
          language: sourceLanguage,
        }),
      });

      if (!historyRes.ok) {
        throw new Error("Failed to save sentiment analysis");
      }

      // Save to local state
      const newSentimentItem = {
        text,
        label: sentiment.label,
        score: sentiment.score,
        magnitude: sentiment.magnitude,
        emoji: sentiment.emoji,
        language: sourceLanguage,
        timestamp: new Date().toLocaleString(),
      };

      setSentimentHistory((prev) => [newSentimentItem, ...prev].slice(0, 3));
      localStorage.setItem(
        "sentiments",
        JSON.stringify([newSentimentItem, ...sentimentHistory].slice(0, 10))
      );
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      setError(
        `Sentiment analysis failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setTranslationResult(null);
    setSentimentData(null);
    setError(null);
    setSuccess(null);
  };

  const getSentimentColor = () => {
    if (!sentimentData) return "blue";
    switch (sentimentData.label) {
      case "Very Positive":
      case "Positive":
        return "green";
      case "Very Negative":
      case "Negative":
        return "red";
      default:
        return "blue";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl bg-clip-textbg-gradient-to-r from-blue-600 to-indigo-600">
            Advanced NLP Translator
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Translate text and analyze sentiment with AI-powered precision
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Translator Panel */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="sourceLanguage"
                  className="block text-sm font-medium text-gray-700"
                >
                  Source Language
                </label>
                <div className="relative">
                  <select
                    id="sourceLanguage"
                    className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg bg-white border shadow-sm"
                    value={sourceLanguage}
                    onChange={(e) => setSourceLanguage(e.target.value)}
                  >
                    {languages.map((l, index) => (
                      <option key={index} value={l.language}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="inputText"
                  className="block text-sm font-medium text-gray-700"
                >
                  Text to Translate or Analyze
                </label>
                <textarea
                  id="inputText"
                  className="block w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                  rows={8}
                  placeholder="Type or paste your text here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                ></textarea>
              </div>

              <div className="flex flex-wrap gap-3">
                <AnalyseSentimentButton
                  onSentimentAnalysis={handleSentimentAnalysis}
                  loading={loading}
                />

                <TranslateButton
                  onTranslate={handleTranslate}
                  loading={loading}
                />

                <button
                  onClick={handleClear}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Clear
                </button>
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="targetLanguage"
                  className="block text-sm font-medium text-gray-700"
                >
                  Target Language
                </label>
                <div className="relative">
                  <select
                    id="targetLanguage"
                    className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg bg-white border shadow-sm"
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                  >
                    {languages.map((l, index) => (
                      <option key={index} value={l.language}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Result
                </label>
                <div
                  className="w-full px-4 py-3 min-h-[200px] bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : translationResult ? (
                    translationResult
                  ) : (
                    "Your translation will appear here"
                  )}
                </div>
              </div>

              {sentimentData && (
                <div
                  className={`p-4 rounded-lg border-l-4 ${
                    getSentimentColor() === "green"
                      ? "border-green-500 bg-green-50"
                      : getSentimentColor() === "red"
                      ? "border-red-500 bg-red-50"
                      : "border-blue-500 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {getSentimentColor() === "green" ? (
                        <svg
                          className="h-5 w-5 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : getSentimentColor() === "red" ? (
                        <svg
                          className="h-5 w-5 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5 text-blue-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium">
                        Sentiment Analysis: {sentimentData.label}{" "}
                        {sentimentData.emoji}
                      </h3>
                      <div className="mt-2 text-sm">
                        <p>
                          Sentiment score:{" "}
                          <span className="font-mono">
                            {sentimentData.score?.toFixed(2)}
                          </span>
                          {sentimentData.magnitude && (
                            <>
                              {" "}
                              (Magnitude:{" "}
                              <span className="font-mono">
                                {sentimentData.magnitude.toFixed(2)}
                              </span>
                              )
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* History Section */}

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl shadow-xl p-8 divide-x lg:divide-x-0 divide-gray-200">
        {/* Translation History */}
        <div>
          <h2 className="text-xl font-medium text-gray-800 mb-4">
            Recent Translations
          </h2>
          <ul className="space-y-4">
            {history.map((item, idx) => (
              <li key={idx} className="p-4 bg-red-50 rounded-xl shadow">
                <p className="text-sm text-gray-600">
                  {item.originalText} → <strong>{item.translatedText}</strong>
                </p>
                <p className="text-xs text-gray-400">{item.timestamp}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Sentiment History */}
        <div>
          <h2 className="text-xl font-medium text-gray-800 mb-4">
            Recent Sentiment Analysis
          </h2>
          <ul className="space-y-4">
            {sentimentHistory.map((item, idx) => (
              <li key={idx} className="p-4 bg-blue-50 rounded-xl shadow">
                <p className="text-sm text-gray-600">
                  &quot;{item.text}&quot; → {item.emoji}{" "}
                  <strong>{item.label}</strong> (Score: {item.score}, Mag:{" "}
                  {item.magnitude})
                </p>
                <p className="text-xs text-gray-400">{item.timestamp}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
