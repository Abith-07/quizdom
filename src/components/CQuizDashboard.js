import React from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you're using React Router for navigation
import Header from './Header'; // Assume you have a Header component

const CQuizDashboard = () => {
  const navigate = useNavigate();

  // Handlers for button clicks
  const handleCreateNewQuiz = () => {
    navigate('/create-quiz'); // Route to Create Quiz page
  };

  const handleViewExistingQuiz = () => {
    navigate('/existing-quiz'); // Route to Existing Quizzes page
  };

  const handleCreateGeneratedQuiz = () => {
    navigate('/create-generated-quiz'); // Route to Create Generated Quiz page
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-400"> {/* Gradient background */}
        <div className="max-w-4xl w-full p-10 bg-white rounded-xl shadow-md">
          <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-8">Quiz Dashboard</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Button for Creating New Quiz */}
            <button
              onClick={handleCreateNewQuiz}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition duration-300"
            >
              Create New Quiz
            </button>

            {/* Button for Viewing Existing Quizzes */}
            <button
              onClick={handleViewExistingQuiz}
              className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition duration-300"
            >
              Existing Quizzes
            </button>

            {/* Button for Creating Generated Quiz */}
            <button
              onClick={handleCreateGeneratedQuiz}
              className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition duration-300"
            >
              Create Generated Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CQuizDashboard;
