import React, { useEffect, useState } from 'react';
import Header from './Header';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useParams } from 'react-router-dom';

export default function TournamentResults() {
  const { id } = useParams();
  const [t, setT] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'tournaments', id), (snap) => {
      if (!snap.exists()) return;
      setT({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [id]);

  if (!t) {
    return (
      <div>
        <Header />
        <div className="min-h-screen flex items-center justify-center">Loading...</div>
      </div>
    );
  }

  const sorted = [...t.teams].sort((a, b) => (b.score || 0) - (a.score || 0));
  const winner = sorted[0];

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Tournament Results</h1>
          <div className="mb-6 p-4 rounded bg-green-50">
            <p className="text-green-800 font-semibold">Winner: {winner?.name} (Score: {winner?.score || 0})</p>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Team</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Players</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Score</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sorted.map((team, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 font-medium">{team.name}</td>
                  <td className="px-4 py-2 text-sm">{team.members.map(m => m.name).join(', ')}</td>
                  <td className="px-4 py-2">{team.score || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


