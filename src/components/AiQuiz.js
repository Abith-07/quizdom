import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

function AiQuiz() {
  const [numQuestions, setNumQuestions] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

    setLoading(true);

    const GEMINI_API_KEY = "AIzaSyBV3GUouXySp3a4rrXPQan8Ebi3c7tARFE"; // replace
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = `
    Generate exactly ${numQuestions} multiple-choice quiz questions 
    on the subject "${subject}" with "${difficulty}" difficulty.
    Each question must have 4 options (A–D) and a correct answer.  
    Return only valid JSON in the format:

    [
      {
        "question": "Question text?",
        "options": ["A", "B", "C", "D"],
        "answer": "A"
      }
    ]

    Do not include explanations or extra text. Only JSON.
    `;

    try {
      const response = await axios.post(GEMINI_API_URL, {
        contents: [{ parts: [{ text: prompt }] }]
      });

      let quizText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!quizText) {
        setError("Empty response from AI. Try again.");
        setLoading(false);
        return;
      }

      // Clean if Gemini wraps in code blocks
      quizText = quizText.replace(/```json|```/g, '').trim();

      let quizData = [];
      try {
        quizData = JSON.parse(quizText);
      } catch (e) {
        console.error("JSON parse error:", e, quizText);
        setError("Invalid JSON from AI. Try again.");
        setLoading(false);
        return;
      }

      navigate('/attend-quiz', {
        state: { quiz: quizData, numQuestions, difficulty, subject }
      });
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
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
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Quiz"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiQuiz;
