import React from 'react';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

export default function TournamentHome() {
  const navigate = useNavigate();
  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-md w-full max-w-3xl p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Tournament</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button onClick={() => navigate('/tournament/create')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg">Create Tournament</button>
            <button onClick={() => navigate('/tournament/code')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg">Tournament Code</button>
            <button onClick={() => navigate('/tournament/join')} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg">Join Tournament</button>
          </div>
        </div>
      </div>
    </div>
  );
}


