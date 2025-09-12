import React, { useEffect, useState, useRef } from 'react';
import Header from './Header';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

export default function TournamentLobby() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'tournaments', id), (snap) => {
      if (!snap.exists()) { setError('Tournament not found'); return; }
      const data = { id: snap.id, ...snap.data() };
      setTournament(data);

      // Auto-start logic
      const allTeamsHaveTwo = data.teams.every((t) => t.members.length === 2);
      const everyoneReady = data.teams.every((t) => t.ready === true);
      if (allTeamsHaveTwo && everyoneReady && data.status !== 'started' && countdown === null) {
        setCountdown(3);
      }
      if (data.status === 'started') {
        navigate(`/tournament/game/${data.id}`);
      }
    });
    return () => unsub();
  }, [id, countdown, navigate]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0 && tournament) {
      updateDoc(doc(db, 'tournaments', tournament.id), { status: 'started', currentQuestionIndex: 0, answeredTeams: [] });
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, tournament]);

  const toggleReady = async () => {
    if (!tournament) return;
    try {
      const myTeamIndex = tournament.teams.findIndex((t) => t.members.some((m) => m.userId === user?.uid));
      if (myTeamIndex === -1) { setError('You are not in a team'); return; }
      const team = tournament.teams[myTeamIndex];
      if (team.members.length < 2) { setError('Your team needs 2 players'); return; }
      const updated = [...tournament.teams];
      updated[myTeamIndex] = { ...team, ready: !team.ready };
      await updateDoc(doc(db, 'tournaments', tournament.id), { teams: updated });
    } catch (e) {
      setError(e.message || 'Failed to update ready');
    }
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Lobby</h1>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          {!tournament ? (
            <p>Loading...</p>
          ) : (
            <div>
              <p className="mb-4">Topic: <span className="font-semibold">{tournament.topic}</span> • Code: <span className="font-semibold">{tournament.code}</span></p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tournament.teams.map((team, idx) => (
                  <div key={idx} className="border rounded p-4">
                    <h3 className="font-bold mb-2">{team.name}</h3>
                    <ul className="text-sm mb-2">
                      {team.members.map((m, i) => (
                        <li key={i}>• {m.name}</li>
                      ))}
                      {Array.from({ length: Math.max(0, 2 - team.members.length) }).map((_, i) => (
                        <li key={`wait-${i}`} className="text-gray-400">• Waiting for player...</li>
                      ))}
                    </ul>
                    <p className="text-sm">Ready: {team.ready ? '✅' : '❌'}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <button onClick={toggleReady} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded">{(() => {
                  const myTeamIndex = tournament.teams.findIndex((t) => t.members.some((m) => m.userId === user?.uid));
                  if (myTeamIndex === -1) return 'Join a Team';
                  return tournament.teams[myTeamIndex].ready ? 'Unready' : 'Ready';
                })()}</button>
                {countdown !== null && (
                  <div className="text-3xl font-bold">Starting in {countdown}...</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


