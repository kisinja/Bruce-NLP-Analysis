import { useEffect, useState } from "react";

export const useLanguages = () => {
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    const cachedLanguages = localStorage.getItem("googleTranslateLanguages");

    if (cachedLanguages) {
      // ✅ Use cached version
      setLanguages(JSON.parse(cachedLanguages));
    } else {
      // 🌐 Fetch from API if not cached
      const fetchLanguages = async () => {
        const API_KEY = process.env.NEXT_PUBLIC_TRANSLATE_API_KEY;
        try {
          const res = await fetch(
            `https://translation.googleapis.com/language/translate/v2/languages?target=en&key=${API_KEY}`
          );
          const data = await res.json();
          const langs = data.data.languages;

          // 🧠 Save to cache
          localStorage.setItem(
            "googleTranslateLanguages",
            JSON.stringify(langs)
          );
          setLanguages(langs);
        } catch (err) {
          console.error("Failed to fetch languages:", err);
        }
      };

      fetchLanguages();
    }
  }, []);

  return languages;
};
