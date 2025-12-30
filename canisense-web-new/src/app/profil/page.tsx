'use client';

import { useState, useEffect } from 'react';

export default function Profil() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [energy, setEnergy] = useState(5);

  useEffect(() => {
    const stored = localStorage.getItem('canisense_profil');
    if (stored) {
      const { name: n, age: a, energy: e } = JSON.parse(stored);
      setName(n || '');
      setAge(a || '');
      setEnergy(e || 5);
    }
  }, []);

  useEffect(() => {
    const profil = { name, age, energy };
    localStorage.setItem('canisense_profil', JSON.stringify(profil));
  }, [name, age, energy]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center sm:text-3xl sm:mb-8">Profil de ton chien</h1>
        <div className="bg-slate-800 rounded-lg p-4 space-y-4 sm:p-6 sm:space-y-6">
          <div>
            <label className="block text-xs font-medium mb-2 sm:text-sm">Nom du chien</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-slate-700 text-white rounded-lg sm:p-3"
              placeholder="Entrez le nom de votre chien"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2 sm:text-sm">Âge (optionnel)</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-2 bg-slate-700 text-white rounded-lg sm:p-3"
              placeholder="Entrez l'âge en années"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2 sm:text-sm">Niveau d’énergie</label>
            <input
              type="range"
              min="1"
              max="10"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-center mt-2">{energy}/10</p>
          </div>
          <p className="text-xs text-gray-400 sm:text-sm">
            Ces informations aident à personnaliser les analyses et à mieux comprendre le comportement de votre chien.
          </p>
        </div>
      </div>
    </div>
  );
}
