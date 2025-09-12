import React, { useState } from 'react';
import Header from './Header';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

export default function CreateTournament() {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [numTeams, setNumTeams] = useState(2);
  const [subject, setSubject] = useState(''); // New state for the subject
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const auth = getAuth();

  const handleCreate = async () => {
    if (!topic || !numQuestions || !numTeams || !subject) { // Added subject validation
      setError('Please fill all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const code = uuidv4().slice(0,6).toUpperCase();
      // Generate simple placeholder questions
      const questions = Array.from({ length: Number(numQuestions) }).map((_, i) => ({
        question: `${topic} - Question ${i + 1}?`,
        options: [
          'Option A',
          'Option B',
          'Option C',
          'Option D',
        ],
        answer: 'Option A',
      }));

      const tournamentDoc = {
        topic,
        numQuestions: Number(numQuestions),
        numTeams: Number(numTeams),
        subject, // Added subject to tournament data
        code,
        status: 'pending',
        ownerId: auth.currentUser ? auth.currentUser.uid : null,
        ownerName: auth.currentUser ? (auth.currentUser.displayName || auth.currentUser.email) : 'Owner',
        questions,
        currentQuestionIndex: -1,
        answeredTeams: [],
        createdAt: new Date(),
        teams: Array.from({ length: Number(numTeams) }).map((_, i) => ({
          name: `Team ${i+1}`,
          members: [],
          score: 0,
        })),
      };
      await addDoc(collection(db, 'tournaments'), tournamentDoc);
      setAccessCode(code);
    } catch (e) {
      setError(e.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-md w-full max-w-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Create Tournament</h1>
          {error && <p className="text-red-600 mb-3 text-center">{error}</p>}
          <div className="space-y-4">
            
             <div>
              <label className="block text-sm font-semibold mb-1">Subject</label>
              <input value={subject} onChange={e=>setSubject(e.target.value)} className="w-full border rounded p-2" placeholder="e.g., Computer Science" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Topic</label>
              <input value={topic} onChange={e=>setTopic(e.target.value)} className="w-full border rounded p-2" placeholder="e.g., Python Basics" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Number of Questions</label>
              <input type="number" value={numQuestions} onChange={e=>setNumQuestions(e.target.value)} className="w-full border rounded p-2" min={1} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Number of Teams</label>
              <input type="number" value={numTeams} onChange={e=>setNumTeams(e.target.value)} className="w-full border rounded p-2" min={2} />
            </div>
            <button onClick={handleCreate} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded">
              {loading ? 'Creating...' : 'Create Tournament'}
            </button>
            {accessCode && (
              <div className="p-3 rounded bg-green-50 text-green-700 text-center">Tournament Created! Access Code: <span className="font-bold">{accessCode}</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


