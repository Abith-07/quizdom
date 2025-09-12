import React, { useEffect, useState } from 'react';
import Header from './Header';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function TournamentCode() {
  const [code, setCode] = useState('');
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');

  const fetchInfo = async () => {
    try {
      setError('');
      const q = query(collection(db, 'tournaments'), where('code', '==', code));
      const snap = await getDocs(q);
      if (snap.empty) { setInfo(null); setError('No tournament found'); return; }
      setInfo(snap.docs[0].data());
    } catch (e) {
      setError(e.message || 'Failed to fetch');
    }
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-md w-full max-w-xl p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Tournament Code</h1>
          <div className="flex gap-2 mb-4">
            <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Enter access code" className="flex-1 border rounded p-2" />
            <button onClick={fetchInfo} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">Fetch</button>
          </div>
          {error && <p className="text-red-600 mb-2 text-center">{error}</p>}
          {info && (
            <div className="border rounded p-4">
              <p><span className="font-semibold">Topic:</span> {info.topic}</p>
              <p><span className="font-semibold">Questions:</span> {info.numQuestions}</p>
              <p><span className="font-semibold">Teams:</span> {info.numTeams}</p>
              <p><span className="font-semibold">Access Code:</span> {info.code}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


