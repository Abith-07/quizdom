import React, { useEffect, useState } from 'react';
import Header from './Header';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

export default function TournamentGame() {
  const { id } = useParams();
  const [t, setT] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [lockedTeamIds, setLockedTeamIds] = useState([]); // teams that answered this question
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'tournaments', id), (snap) => {
      if (!snap.exists()) return;
      const data = { id: snap.id, ...snap.data() };
      setT(data);
      setTimeLeft(15);
      setLockedTeamIds([]);
      if (data.currentQuestionIndex >= data.questions.length) {
        navigate(`/tournament/results/${data.id}`);
      }
    });
    return () => unsub();
  }, [id, navigate]);

  useEffect(() => {
    if (!t) return;
    const timer = setInterval(() => setTimeLeft((x) => x - 1), 1000);
    return () => clearInterval(timer);
  }, [t?.currentQuestionIndex]);

  useEffect(() => {
    if (timeLeft === 0 && t) {
      updateDoc(doc(db, 'tournaments', t.id), { currentQuestionIndex: t.currentQuestionIndex + 1, answeredTeams: [] });
    }
  }, [timeLeft, t]);

  const myTeamIndex = t?.teams.findIndex((team) => team.members.some((m) => m.userId === user?.uid));
  const myTeamId = myTeamIndex !== -1 ? myTeamIndex : null;

  const answer = async (option) => {
    if (!t || myTeamId === null) return;
    if (lockedTeamIds.includes(myTeamId)) return; // already answered
    setLockedTeamIds((prev) => [...prev, myTeamId]);
    const q = t.questions[t.currentQuestionIndex];
    if (option === q.answer) {
      const updatedTeams = [...t.teams];
      updatedTeams[myTeamId] = { ...updatedTeams[myTeamId], score: (updatedTeams[myTeamId].score || 0) + 1 };
      await updateDoc(doc(db, 'tournaments', t.id), { teams: updatedTeams, answeredTeams: [...(t.answeredTeams || []), myTeamId] });
    } else {
      await updateDoc(doc(db, 'tournaments', t.id), { answeredTeams: [...(t.answeredTeams || []), myTeamId] });
    }
  };

  if (!t) {
    return (
      <div>
        <Header />
        <div className="min-h-screen flex items-center justify-center">Loading...</div>
      </div>
    );
  }

  const q = t.questions[t.currentQuestionIndex];

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Question {t.currentQuestionIndex + 1} / {t.questions.length}</h1>
            <div className="font-semibold">Time: {timeLeft}s</div>
          </div>
          <p className="mb-4 font-medium">{q.question}</p>
          <div className="grid grid-cols-1 gap-3">
            {q.options.map((opt, idx) => (
              <button key={idx} onClick={() => answer(opt)} className="border rounded p-3 hover:bg-gray-100 text-left">{String.fromCharCode(65+idx)}. {opt}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


