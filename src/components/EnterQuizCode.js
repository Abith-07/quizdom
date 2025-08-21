import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function EnterQuizCode() {
  const [quizCode, setQuizCode] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const quizQuery = query(collection(db, 'created_quiz'), where('quizCode', '==', quizCode));
      const querySnapshot = await getDocs(quizQuery);

      if (!querySnapshot.empty) {
        const quizDoc = querySnapshot.docs[0];
        const data = quizDoc.data();

        if (data.accessKey !== accessKey) {
          setError('Invalid access key. Please try again.');
          return;
        }

        const currentDate = new Date();
        const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
        const endDateTime = new Date(`${data.endDate}T${data.endTime}`);

        if (currentDate >= startDateTime && currentDate <= endDateTime) {
          navigate('/quiz-access', { state: { quiz: data } });
          return;
        } else if (currentDate < startDateTime) {
          setError('The quiz has not started yet. Please try again later.');
        } else {
          setError('The quiz has ended. Please contact your instructor for more information.');
        }
      } else {
        setError('Invalid quiz code. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-400 relative">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg overflow-y-auto h-[80vh] flex items-center justify-center">
        <div className="w-full">
          <h1 className="text-2xl font-bold mb-4 text-center">Enter Quiz Code</h1>
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Quiz Code:</label>
              <input
                type="text"
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value)}
                required
                className="border border-gray-300 rounded w-full p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Access Key:</label>
              <input
                type="password"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                required
                className="border border-gray-300 rounded w-full p-2"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-600"
            >
              Join Quiz
            </button>
          </form>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
