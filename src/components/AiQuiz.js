import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

function AiQuiz() {
  const [numQuestions, setNumQuestions] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const subjects = [
    'Computer Networks',
    'Operating Systems',
    'DBMS',
    'Mixed Quiz'
  ];

  const validateInputs = () => {
    if (!numQuestions || !subject || !difficulty) {
      setError('All fields are required.');
      return false;
    }
    if (parseInt(numQuestions, 10) <= 0) {
      setError('Number of questions must be a positive integer.');
      return false;
    }
    setError('');
    return true;
  };

  const generateQuiz = async () => {
    if (!validateInputs()) return;

    try {
      const response = await axios.post('http://127.0.0.1:5000/generate_quiz', {
        num_questions: parseInt(numQuestions, 10),
        subject: subject === 'Mixed Quiz' ? '' : subject,
        difficulty,
      });

      // Navigate to AttendQuiz, passing quiz data and difficulty level
      navigate('/attend-quiz', { 
        state: { 
          quiz: response.data, 
          numQuestions, 
          difficulty, // Pass the difficulty here
          subject 
        } 
      });
    } catch (error) {
      console.error('Error generating quiz:', error);
    }
  };

  return (
    <div>
      <Header />
      <div className="bg-primary-bg bg-fixed bg-cover w-full h-fit flex items-center justify-center min-h-screen p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
          <h1 className="text-2xl font-bold mb-4 text-center">AI Quiz Generator</h1>
          {error && (
            <div className="bg-red-200 text-red-800 p-3 rounded mb-4">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Number of Questions:
            </label>
            <input
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Subject:
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Select Subject</option>
              {subjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Difficulty:
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Select Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={generateQuiz}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Generate Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiQuiz;
