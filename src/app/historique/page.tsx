'use client';

import { useState, useEffect } from 'react';

type Analysis = {
  date: string;
  state: string;
  explanation: string;
};

export default function Historique() {
  const [history, setHistory] = useState<Analysis[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('canisense_history');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center sm:text-3xl sm:mb-8">Historique</h1>
        {history.length === 0 ? (
          <p className="text-center text-gray-400">Aucune analyse enregistrée.</p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {history.map((item, index) => (
              <div key={index} className="bg-slate-800 rounded-lg p-3 sm:p-4">
                <p className="text-xs text-gray-400 sm:text-sm">{item.date}</p>
                <p className="font-semibold">{item.state}</p>
                <p>{item.explanation}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
