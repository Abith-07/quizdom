import React from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const QuizDetail = () => {
  const { state } = useLocation();
  const { quiz } = state || {};

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard!'))
      .catch(err => toast.error('Failed to copy: ' + err));
  };

  const formatDate = (dateString) => {
    if (dateString) {
      return new Date(dateString).toLocaleDateString();
    }
    return 'N/A';
  };

  const formatTime = (timeString) => {
    if (timeString) {
      return new Date(`1970-01-01T${timeString}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return 'N/A';
  };

  return (
    <div className="bg-gradient-to-r from-purple-300 via-indigo-300 to-blue-300 min-h-screen flex flex-col items-center py-12">
      <ToastContainer />
      <div className="max-w-4xl w-full p-10 bg-white rounded-xl shadow-lg">
        <h2 className="text-5xl font-extrabold mb-8 text-center bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">Quiz Details</h2>

        {quiz ? (
          <div className="space-y-8">
            {/* Quiz Code */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-md">
              <div>
                <p className="text-lg font-semibold text-gray-700">Quiz Code:</p>
                <p className="text-indigo-700 font-bold">{quiz.quizCode}</p>
              </div>
              <button
                onClick={() => copyToClipboard(quiz.quizCode)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700"
              >
                Copy Code
              </button>
            </div>

            {/* Access Key */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-md">
              <div>
                <p className="text-lg font-semibold text-gray-700">Access Key:</p>
                <p className="text-indigo-700 font-bold">{quiz.accessKey}</p>
              </div>
              <button
                onClick={() => copyToClipboard(quiz.accessKey)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-700"
              >
                Copy Access Key
              </button>
            </div>

            {/* Subject and Topic */}
            <div className="p-4 bg-gray-50 rounded-lg shadow-md space-y-4">
              <div>
                <p className="text-lg font-semibold text-gray-700">Subject:</p>
                <p className="text-gray-800">{quiz.subject}</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700">Topic:</p>
                <p className="text-gray-800">{quiz.topic}</p>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg shadow-md">
              <div>
                <p className="text-lg font-semibold text-gray-700">Start Date:</p>
                <p className="text-gray-800">{formatDate(quiz.startDate)}</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700">Start Time:</p>
                <p className="text-gray-800">{formatTime(quiz.startTime)}</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700">End Date:</p>
                <p className="text-gray-800">{formatDate(quiz.endDate)}</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700">End Time:</p>
                <p className="text-gray-800">{formatTime(quiz.endTime)}</p>
              </div>
            </div>

            {/* Quiz Duration */}
            <div className="p-4 bg-gray-50 rounded-lg shadow-md">
              <p className="text-lg font-semibold text-gray-700">Quiz Duration (minutes):</p>
              <p className="text-gray-800">{quiz.quizDuration}</p>
            </div>

            {/* Questions */}
            <div className="p-4 bg-gray-50 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Questions:</h3>
              <ul className="list-none space-y-6 mt-4">
                {quiz.questions.map((q, index) => (
                  <li key={index} className="p-4 bg-white border border-gray-200 rounded-lg shadow-md">
                    <p className="font-medium text-gray-900">Q{index + 1}: {q.question}</p>
                    <ul className="list-decimal list-inside pl-6 mt-2 space-y-2">
                      {q.options.map((option, oIndex) => (
                        <li key={oIndex} className="text-gray-700 hover:text-indigo-600 transition-colors">
                          {option}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-green-700 font-semibold">Answer: {q.answer}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center">No quiz data available.</p>
        )}
      </div>
    </div>
  );
};

export default QuizDetail;
