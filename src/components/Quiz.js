import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Modal from 'react-modal';

// Set the app element for the modal
Modal.setAppElement('#root');

function Quiz() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const category = params.get('category');

  const [difficulty, setDifficulty] = useState('');
  const [numQuestions, setNumQuestions] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false); // State to control answer visibility

  const categoryMap = {
    gk: 9, // General Knowledge
    cs: 18, // Computers
    apti: 19 // Mathematics (substitute for Aptitude)
  };

  const decodeHtmlEntities = (text) => {
    const parser = new DOMParser();
    return parser.parseFromString(text, 'text/html').body.textContent;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get('https://opentdb.com/api.php', {
        params: {
          amount: numQuestions,
          category: categoryMap[category],
          difficulty: difficulty,
          type: 'multiple'
        }
      });
      setQuizData(response.data.results);
      setSelectedAnswers({});
      setIsSubmitted(false);
      setScore(0);
      setShowAnswers(false); // Reset answer visibility when fetching new quiz
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    }
  };

  const handleOptionClick = (questionIndex, answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answer
    });
  };

  const handleQuizSubmit = () => {
    let correctAnswers = 0;
    if (quizData) {
      quizData.forEach((question, index) => {
        if (selectedAnswers[index] === question.correct_answer) {
          correctAnswers += 1;
        }
      });
      setScore(correctAnswers);
      setIsSubmitted(true);
      setModalIsOpen(true);
    }
  };

  const handleShowAnswers = () => {
    setShowAnswers(true); // Set to true to show the correct answers
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setShowAnswers(false); // Close modal and reset answers
  };

  let categoryName;
  switch (category) {
    case 'gk':
      categoryName = 'General Knowledge';
      break;
    case 'cs':
      categoryName = 'Computer Science';
      break;
    case 'apti':
      categoryName = 'Aptitude';
      break;
    default:
      categoryName = 'Unknown Category';
  }

  return (
    <div>
      <Header />
      <div className="bg-primary-bg bg-fixed bg-cover w-full h-fit flex items-center justify-center min-h-screen p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-center">Generate Quiz</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Topic</label>
              <input
                type="text"
                value={categoryName}
                readOnly
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Difficulty Level</label>
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
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Number of Questions</label>
              <input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                min="1"
                max="50"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Generate Quiz
            </button>
          </form>

          {quizData && !isSubmitted && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Quiz Questions</h2>
              <ul className="space-y-4">
                {quizData.map((question, index) => (
                  <li key={index} className="mb-4">
                    <h3 className="font-semibold mb-2">{decodeHtmlEntities(question.question)}</h3>
                    <ul className="space-y-2">
                      {[...question.incorrect_answers, question.correct_answer].sort().map((answer, i) => (
                        <li
                          key={i}
                          onClick={() => handleOptionClick(index, answer)}
                          className={`p-3 rounded border-2 cursor-pointer border-gray-300 transition-colors duration-300 ${
                            selectedAnswers[index] === answer
                              ? 'bg-blue-100'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {decodeHtmlEntities(answer)}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleQuizSubmit}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mt-4"
              >
                Submit Quiz
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal for displaying the score and answers */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="bg-white p-6 rounded shadow-lg max-w-lg mx-auto mt-24"
        overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"
        shouldCloseOnOverlayClick={true}
      >
        <div className="max-h-screen overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">Quiz Results</h2>
          <p className="text-lg text-center">You scored {score} out of {quizData ? quizData.length : 0}!</p>
          <div className="flex justify-center mt-4">
            <button
              onClick={closeModal}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-4"
            >
              Close
            </button>
            {isSubmitted && (
              <button
                onClick={handleShowAnswers}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Show Answers
              </button>
            )}
          </div>

          {showAnswers && (
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 text-center">Correct Answers</h3>
              <ul className="space-y-4">
                {quizData.map((question, index) => (
                  <li key={index} className="mb-4">
                    <h4 className="font-semibold mb-2">{decodeHtmlEntities(question.question)}</h4>
                    <ul className="space-y-2">
                      {[...question.incorrect_answers, question.correct_answer].sort().map((answer, i) => (
                        <li
                          key={i}
                          className={`p-3 rounded border-2 transition-colors duration-300 ${
                            answer === question.correct_answer
                              ? 'bg-green-200 border-green-600'
                              : selectedAnswers[index] === answer
                              ? 'bg-red-200 border-red-600'
                              : 'border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {decodeHtmlEntities(answer)}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default Quiz;
