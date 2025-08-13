import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; // Import Firebase configuration
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa'; // Import icons for edit, delete, and view
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const ExistingQuiz = ({ userId }) => {
  const [quizzes, setQuizzes] = useState({}); // Object to store quizzes grouped by subject
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchQuizzes = async () => {
      const quizCollection = collection(db, 'created_quiz');
      const quizSnapshot = await getDocs(quizCollection);

      const quizzesBySubject = {};
      quizSnapshot.forEach(doc => {
        const data = doc.data();
        const subject = data.subject;
        const topic = data.topic;

        // Group by subject and topic
        if (!quizzesBySubject[subject]) {
          quizzesBySubject[subject] = {};
        }
        if (!quizzesBySubject[subject][topic]) {
          quizzesBySubject[subject][topic] = [];
        }
        quizzesBySubject[subject][topic].push({ id: doc.id, ...data }); // Store quiz ID and data
      });

      setQuizzes(quizzesBySubject);
    };

    fetchQuizzes();
  }, []);

  const handleDeleteQuiz = async (quizId) => {
    try {
      await deleteDoc(doc(db, 'created_quiz', quizId)); // Delete quiz document
      toast.success('Quiz deleted successfully!');
      // Refresh the quiz list
      const updatedQuizzes = { ...quizzes };
      for (const subject in updatedQuizzes) {
        for (const topic in updatedQuizzes[subject]) {
          updatedQuizzes[subject][topic] = updatedQuizzes[subject][topic].filter(q => q.id !== quizId);
        }
      }
      setQuizzes(updatedQuizzes);
    } catch (error) {
      console.error('Error deleting quiz:', error.message);
      toast.error('Error deleting quiz: ' + error.message);
    }
  };

  const handleEditQuiz = (quizId) => {
    navigate(`/edit-quiz/${quizId}`); // Navigate to the edit quiz form with the quiz ID
  };

  const handleViewQuiz = (quiz) => {
    navigate('/quiz-detail', { state: { quiz } }); // Navigate to the QuizDetail component and pass quiz data
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center py-12">
      <ToastContainer />
      <div className="max-w-4xl w-full p-10 bg-white rounded-xl shadow-md">
        <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-8">Existing Quizzes</h2>
        
        {Object.keys(quizzes).length === 0 ? (
          <p className="text-center text-lg text-gray-600">No quizzes available.</p>
        ) : (
          Object.keys(quizzes).map((subject) => (
            <div key={subject} className="mb-6">
              <div className="bg-blue-100 p-4 rounded-lg shadow-md mb-4">
                <h3 className="text-2xl font-bold text-blue-700">{subject}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.keys(quizzes[subject]).map((topic) => (
                  <div key={topic} className="p-4 bg-white rounded-lg shadow-lg">
                    <h4 className="text-xl font-semibold mb-2">{topic}</h4>
                    {quizzes[subject][topic].map((quiz) => (
                      <div key={quiz.id} className="flex justify-between items-center mb-2 p-2 border-b">
                        <span className="font-medium text-gray-800">Quiz Code: {quiz.quizCode}</span>
                        <div className="flex space-x-2">
                          <button onClick={() => handleViewQuiz(quiz)} className="text-green-600 hover:text-green-800">
                            <FaEye />
                          </button>
                          <button onClick={() => handleEditQuiz(quiz.id)} className="text-blue-600 hover:text-blue-800">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDeleteQuiz(quiz.id)} className="text-red-600 hover:text-red-800">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExistingQuiz;
