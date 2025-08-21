import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Modal from 'react-modal';
import sp from '../Assets/score-logo.png';

Modal.setAppElement('#root');

function AttendQuiz() {
  const location = useLocation();
  const { quiz } = location.state || {};
  const [userAnswers, setUserAnswers] = useState(Array(quiz?.length || 0).fill(''));
  const [score, setScore] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [answersModalIsOpen, setAnswersModalIsOpen] = useState(false);

  // Helper: get correct answer text for a question
  const getCorrectAnswerText = (q) => {
    // If answer is "A", "B", "C", or "D"
    if (q.answer && typeof q.answer === "string" && q.answer.length === 1) {
      const idx = q.answer.charCodeAt(0) - 65;
      return q.options[idx];
    }
    // fallback: if answer is the text itself
    return q.answer;
  };

  // Submit quiz
  const handleSubmit = () => {
    if (userAnswers.includes('')) {
      setError('Please answer all questions before submitting.');
      setModalIsOpen(true);
      return;
    }

    // Calculate score
    let calculatedScore = 0;
    quiz.forEach((q, index) => {
      const correctText = getCorrectAnswerText(q);
      if (userAnswers[index] === correctText) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-bg bg-fixed bg-cover p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Attend Quiz</h1>

        {quiz?.length > 0 ? (
          <div>
            {quiz.map((q, index) => (
              <div key={index} className="mb-4">
                <p className="font-semibold mb-2 text-left">
                  {q.question_number || index + 1}. {q.question}
                </p>
                {q.options.map((option, idx) => (
                  <label key={idx} className="inline-flex items-center w-full mb-2">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      onChange={(e) => {
                        const newAnswers = [...userAnswers];
                        newAnswers[index] = e.target.value;
                        setUserAnswers(newAnswers);
                      }}
                      checked={userAnswers[index] === option}
                      className="hidden"
                    />
                    <span
                      className={`inline-flex items-center cursor-pointer px-4 py-2 rounded w-full ${
                        userAnswers[index] === option ? 'bg-blue-500 text-white' : 'bg-gray-200'
                      }`}
                    >
                      {String.fromCharCode(97 + idx)}) {option}
                    </span>
                  </label>
                ))}
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={userAnswers.includes('')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              Submit Quiz
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-500">No quiz data available.</p>
        )}

        {/* Score Modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          className="fixed inset-0 flex items-center justify-center z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
            {error ? (
              <div>
                <h2 className="text-xl font-bold mb-4 text-center text-red-600">Error</h2>
                <p className="text-center">{error}</p>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex justify-center">
                  <img src={sp} alt="Score" className="w-62 h-32 object-cover" />
                </div>
                <h2 className="text-xl font-bold mb-4 text-center">
                  Your Score: {score} / {quiz.length}
                </h2>

                <button
                  onClick={() => setAnswersModalIsOpen(true)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full mt-4"
                >
                  Show Answers
                </button>
              </div>
            )}
            <button
              onClick={closeModal}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mt-4"
            >
              Close
            </button>
          </div>
        </Modal>

        {/* Answers Modal */}
        <Modal
          isOpen={answersModalIsOpen}
          onRequestClose={() => setAnswersModalIsOpen(false)}
          className="fixed inset-0 flex items-center justify-center z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div
            className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto overflow-y-auto"
            style={{ maxHeight: '80vh' }}
          >
            <h2 className="text-xl font-bold mb-4 text-center">Quiz Answers</h2>
            {quiz.map((q, index) => {
              const correctText = getCorrectAnswerText(q);
              return (
                <div key={index} className="mb-4">
                  <p className="font-semibold mb-2">
                    {q.question_number || index + 1}. {q.question}
                  </p>
                  {q.options.map((option, idx) => {
                    let bg = 'bg-gray-200';
                    if (option === correctText) bg = 'bg-green-300';
                    if (userAnswers[index] === option && option !== correctText) bg = 'bg-red-300';
                    return (
                      <div key={idx} className={`px-4 py-2 rounded mb-2 ${bg}`}>
                        {String.fromCharCode(97 + idx)}) {option}
                        {option === correctText && (
                          <span className="ml-2 font-bold text-green-700">(Correct Answer)</span>
                        )}
                        {userAnswers[index] === option && option !== correctText && (
                          <span className="ml-2 font-bold text-red-700">(Your Answer)</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            <button
              onClick={() => setAnswersModalIsOpen(false)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mt-4"
            >
              Close
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default AttendQuiz;
