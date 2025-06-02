type TranslationHistoryItem = {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  originalText: string;
  translatedText: string;
  createdAt: string;
};

export default function TranslationHistoryCard({ item }: { item: TranslationHistoryItem }) {
  return (
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center mb-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
            Translation
          </span>
          <span className="text-sm text-gray-500">
            {item.sourceLanguage.toUpperCase()} → {item.targetLanguage.toUpperCase()} • {new Date(item.createdAt).toLocaleString()}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Original</p>
            <p className="text-gray-800">{item.originalText}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Translation</p>
            <p className="text-gray-800">{item.translatedText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}