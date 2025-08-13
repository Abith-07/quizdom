import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';
import { auth, db } from '../firebase'; // Make sure to adjust the import path
import { collection, addDoc, Timestamp, doc, updateDoc, increment } from 'firebase/firestore';
import sp from '../Assets/score-logo.png'; // Ensure the image path is correct

// Bind modal to app element
Modal.setAppElement('#root');

function AttendQuiz() {
  const location = useLocation();
  const { quiz } = location.state || {};
  const [userAnswers, setUserAnswers] = useState(Array(quiz.length).fill(''));
  const [score, setScore] = useState(null);
  const [points, setPoints] = useState(null);
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [answersModalIsOpen, setAnswersModalIsOpen] = useState(false);

  const handleSubmit = async () => {
    if (userAnswers.includes('')) {
      setError('Please answer all questions before submitting.');
      setModalIsOpen(true);
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/calculate_score', {
        quiz,
        user_answers: userAnswers
      });
      const { score, points } = response.data;
      setScore(score);
      setPoints(points);
      setModalIsOpen(true);

      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const quizName = quiz[0]?.subject || 'Computer Science Quiz';
        const difficultyLevel = quiz[0]?.difficulty || 'Unknown';

        // Store score, points, difficulty level, quiz name, and date in quiz_performance
        await addDoc(collection(db, 'quiz_performance'), {
          userId,
          quizName,
          difficultyLevel,
          score,
          points,
          date: Timestamp.now()
        });

        // Update points in LeaderBoard
        const leaderboardRef = doc(db, 'leaderboard', userId);
        await updateDoc(leaderboardRef, {
          points: increment(points)
        });

        console.log('Document added successfully');
      } else {
        console.error('User is not authenticated');
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
      setModalIsOpen(true);
    }
  };

  const handleRecommendation = async (answer) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/recommend_questions', {
        user_answer: answer
      });
      setRelatedQuestions(response.data);
    } catch (error) {
      setError(`Error: ${error.message}`);
      setModalIsOpen(true);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setError(null);
  };

  const openAnswersModal = () => {
    setAnswersModalIsOpen(true);
  };

  const closeAnswersModal = () => {
    setAnswersModalIsOpen(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-bg bg-fixed bg-cover p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Attend Quiz</h1>
        {quiz.length > 0 && (
          <div>
            {quiz.map((q, index) => (
              <div key={index} className="mb-4">
                <p className="font-semibold mb-2 text-left">{q.question_number}. {q.question}</p>
                {q.options.map((option, idx) => (
                  <div key={idx} className="mb-2 flex items-start">
                    <label className="inline-flex items-center w-full">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        onChange={(e) => {
                          const newAnswers = [...userAnswers];
                          newAnswers[index] = e.target.value;
                          setUserAnswers(newAnswers);
                          handleRecommendation(e.target.value);
                        }}
                        className="form-radio hidden"
                      />
                      <span
                        className={`inline-flex items-center cursor-pointer px-4 py-2 rounded w-full ${
                          userAnswers[index] === option ? 'bg-blue-500 text-white' : 'bg-gray-200'
                        }`}
                      >
                        {String.fromCharCode(97 + idx)}) {option}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            ))}
            <button
              onClick={handleSubmit}
              disabled={userAnswers.includes('')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Submit Quiz
            </button>
          </div>
        )}

        {/* Score Modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Quiz Feedback"
          className="fixed inset-0 flex items-center justify-center z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
            {error ? (
              <div>
                <h2 className="text-xl font-bold mb-4 text-center">Error</h2>
                <p className="text-md text-red-600 text-center">{error}</p>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex justify-center">
                  <img src={sp} alt="Score" className="w-62 h-32 object-cover" />
                </div>
                <h2 className="text-xl font-bold mb-4 text-center">Your Score: {score}</h2>
                <h2 className="text-xl font-bold mb-4 text-center">Your Points: {points}</h2>
                {relatedQuestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Related Questions:</h3>
                    <ul className="list-disc ml-5">
                      {relatedQuestions.map((rq, idx) => (
                        <li key={idx} className="mb-2">{rq}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  onClick={openAnswersModal}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mt-4"
                >
                  Show Answers
                </button>
              </div>
            )}
            <button
              onClick={closeModal}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mt-4"
            >
              Close
            </button>
          </div>
        </Modal>

       {/* Modal to show correct and incorrect answers */}
<Modal
  isOpen={answersModalIsOpen}
  onRequestClose={closeAnswersModal}
  contentLabel="Quiz Answers"
  className="fixed inset-0 flex items-center justify-center z-50"
  overlayClassName="fixed inset-0 bg-black bg-opacity-50"
>
  <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
    <h2 className="text-xl font-bold mb-4 text-center">Quiz Answers</h2>
    {quiz.map((q, index) => (
      <div key={index} className="mb-4">
        <p className="font-semibold mb-2 text-left">{q.question_number}. {q.question}</p>
        {q.options.map((option, idx) => (
          <div
            key={idx}
            className={`mb-2 px-4 py-2 rounded ${
              option === q.correct_answer ? 'bg-green-200' : userAnswers[index] === option ? 'bg-red-200' : 'bg-gray-200'
            }`}
          >
            {String.fromCharCode(97 + idx)}) {option}
          </div>
        ))}
      </div>
    ))}
    <button
      onClick={closeAnswersModal}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mt-4"
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
