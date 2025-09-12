import React, { useEffect, useState } from 'react';
import Header from './Header';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

export default function JoinTournament() {
  const [code, setCode] = useState('');
  const [tournament, setTournament] = useState(null);
  const [error, setError] = useState('');
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  const fetchTournament = async () => {
    try {
      setError('');
      const q = query(collection(db, 'tournaments'), where('code','==',code));
      const snap = await getDocs(q);
      if (snap.empty) { setTournament(null); setError('Tournament not found'); return; }
      setTournament({ id: snap.docs[0].id, ...snap.docs[0].data() });
    } catch (e) {
      setError(e.message || 'Failed to fetch');
    }
  };

  const joinTeam = async (teamIndex) => {
    if (!user) { setError('Please login to join'); return; }
    const t = tournament;
    const team = t.teams[teamIndex];
    if (team.members.length >= 2) return;
    if (team.members.find(m => m.userId === user.uid)) return;
    try {
      const updatedTeams = [...t.teams];
      updatedTeams[teamIndex] = { ...team, members: [...team.members, { userId: user.uid, name: user.displayName || user.email } ] };
      await updateDoc(doc(db,'tournaments', t.id), { teams: updatedTeams });
      setTournament({ ...t, teams: updatedTeams });
    } catch (e) {
      setError(e.message || 'Failed to join');
    }
  };

  const goLobby = () => {
    if (!tournament) { setError('Load a tournament first'); return; }
    navigate(`/tournament/lobby/${tournament.id}`);
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-md w-full max-w-4xl p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Join Tournament</h1>
          <div className="flex gap-2 mb-6">
            <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Enter join code" className="flex-1 border rounded p-2" />
            <button onClick={fetchTournament} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">Load</button>
          </div>
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          {tournament && (
            <div>
              <h2 className="text-xl font-semibold mb-4">{tournament.topic} (Teams: {tournament.numTeams})</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tournament.teams.map((team, idx) => {
                  const isFull = team.members.length >= 2;
                  return (
                    <div key={idx} className={`border rounded p-4 ${isFull ? 'opacity-60' : ''}`}>
                      <h3 className="font-bold mb-2">{team.name}</h3>
                      <ul className="text-sm mb-3">
                        {team.members.map((m, i) => (
                          <li key={i}>• {m.name}</li>
                        ))}
                        {Array.from({ length: 2 - team.members.length }).map((_, i) => (
                          <li key={`empty-${i}`} className="text-gray-400">• Waiting for player...</li>
                        ))}
                      </ul>
                      <button disabled={isFull} onClick={() => joinTeam(idx)} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-2 rounded">
                        {isFull ? 'Team Full' : 'Join Team'}
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={goLobby} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded">Go to Lobby</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


