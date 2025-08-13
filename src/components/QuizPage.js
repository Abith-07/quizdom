import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase"; // Ensure the correct path to your firebase configuration file
import { doc, getDoc } from "firebase/firestore";

export default function QuizPage() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizRef = doc(db, "quizzes", quizId);
        const quizDoc = await getDoc(quizRef);

        if (quizDoc.exists()) {
          const quizData = quizDoc.data();
          setQuiz(quizData);

          // Update the current time every second
          const interval = setInterval(() => {
            setCurrentTime(new Date().toISOString());
          }, 1000);

          return () => clearInterval(interval);
        } else {
          alert("Quiz not found");
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
        alert("An error occurred. Please try again.");
      }
    };

    fetchQuiz();
  }, [quizId]);

  const isQuizExpired = () => {
    if (!quiz) return false;
    const currentDateTime = new Date(currentTime);
    const endDateTime = new Date(`${quiz.endDate}T${quiz.endTime}`);
    return currentDateTime > endDateTime;
  };

  const handleOptionChange = (questionIndex, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let calculatedScore = 0;

    quiz.questions.forEach((q, index) => {
      if (
        selectedAnswers[index] !== undefined &&
        selectedAnswers[index] === q.correctAnswer
      ) {
        calculatedScore += 1; // Assuming each correct answer is worth 1 point
      }
    });

    setScore(calculatedScore);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-bg bg-fixed bg-cover p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Attend Quiz</h1>
        {quiz ? (
          <>
            {isQuizExpired() ? (
              <p className="text-red-600 text-center font-medium">
                The quiz has expired.
              </p>
            ) : score !== null ? (
              <p className="text-green-600 text-center font-medium">
                Your score: {score} out of {quiz.questions.length}
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {quiz.questions.map((q, index) => (
                  <div key={index} className="mb-4">
                    <p className="font-semibold mb-2 text-left">
                      {index + 1}. {q.questionText}
                    </p>
                    {q.options.map((option, optIndex) => (
                      <div key={optIndex} className="mb-2 flex items-start">
                        <label className="inline-flex items-center w-full">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            onChange={() => handleOptionChange(index, option)}
                            checked={selectedAnswers[index] === option}
                            className="form-radio hidden"
                          />
                          <span
                            className={`inline-flex items-center cursor-pointer px-4 py-2 rounded w-full ${
                              selectedAnswers[index] === option
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200"
                            }`}
                          >
                            {String.fromCharCode(97 + optIndex)}) {option}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                >
                  Submit Quiz
                </button>
              </form>
            )}
          </>
        ) : (
          <p className="text-center text-lg text-gray-600">Loading quiz...</p>
        )}
      </div>
    </div>
  );
}
