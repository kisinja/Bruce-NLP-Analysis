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

export default function SentimentHistoryCard({
  item,
}: {
  item: SentimentHistoryItem;
}) {
  const sentimentColor = item.label.includes("Positive")
    ? "green"
    : item.label.includes("Negative")
    ? "red"
    : "blue";

  return (
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center mb-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2">
            Sentiment
          </span>
          <span className="text-sm text-gray-500">
            {item.language.toUpperCase()} •{" "}
            {new Date(item.createdAt).toLocaleString()}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-500 mb-1">Text</p>
            <p className="text-gray-800">{item.text}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Analysis</p>
            <div
              className={`flex items-center p-2 rounded-lg bg-${sentimentColor}-50 border-l-4 border-${sentimentColor}-500`}
            >
              <span className="text-xl mr-2">{item.emoji}</span>
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-gray-600">
                  Score: {item.score.toFixed(2)}
                  {item.magnitude
                    ? ` (Magnitude: ${item.magnitude.toFixed(2)})`
                    : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
