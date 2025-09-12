import React, { useEffect, useState } from 'react';
import Header from './Header';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function TournamentCode() {
  const [tournaments, setTournaments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setError('');
        const snap = await getDocs(collection(db, 'tournaments'));
        if (snap.empty) { setError('No tournaments found'); setTournaments([]); return; }
        const tournamentList = snap.docs.map(doc => doc.data());
        setTournaments(tournamentList);
      } catch (e) {
        setError(e.message || 'Failed to fetch tournaments');
      }
    };

    fetchTournaments();
  }, []);

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <h1 className="text-2xl font-bold mb-6 text-center">Available Tournaments</h1>
          {error && <p className="text-red-600 mb-2 text-center">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.map((tournament, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-4">
                <h2 className="text-xl font-semibold mb-2">{tournament.topic}</h2>
                <p><span className="font-semibold">Subject:</span> {tournament.subject}</p>
                <p><span className="font-semibold">Questions:</span> {tournament.numQuestions}</p>
                <p><span className="font-semibold">Teams:</span> {tournament.numTeams}</p>
                <p><span className="font-semibold">Access Code:</span> {tournament.code}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


