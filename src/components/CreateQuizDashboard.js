import React, { useState } from 'react';
import { db } from '../firebase'; // Import Firebase configuration
import { collection, addDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid'; // For generating quiz codes and access keys
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import { getAuth } from 'firebase/auth';

const CreateQuizDashBoard = () => {
  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [quizDuration, setQuizDuration] = useState(''); // State for quiz duration
  const [questions, setQuestions] = useState([{ question: '', options: [], answer: '' }]);

  const today = new Date().toISOString().split("T")[0];

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', options: [], answer: '' }]);
  };

  const handleDeleteQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleAddOption = (qIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options.length < 4) {
      newQuestions[qIndex].options.push('');
      setQuestions(newQuestions);
    } else {
      toast.error('Maximum of 4 options allowed');
    }
  };

  const handleSubmit = async () => {
    if (!userId || !subject || !topic || !startDate || !endDate || !startTime || !endTime || !quizDuration || !questions.length) {
      toast.error('Please fill all fields.');
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (endDateTime <= startDateTime) {
      toast.error('End date and time must be greater than start date and time.');
      return;
    }

    try {
      const quizCode = uuidv4().slice(0, 6).toUpperCase();
      const accessKey = uuidv4().slice(0, 4).toUpperCase(); 

      await addDoc(collection(db, 'created_quiz'), {
        userId,
        subject,
        topic,
        startDate,
        endDate,
        startTime,
        endTime,
        quizDuration, // Add quiz duration
        questions,
        quizCode,
        accessKey,
        createdAt: new Date(),
      });

      toast.success(`Quiz Created! Quiz Code: ${quizCode}, Access Key: ${accessKey}`);
    } catch (error) {
      console.error("Error creating quiz:", error.message);
      toast.error(`Error creating quiz: ${error.message}`);
    }
  };

  const minEndDate = startDate ? startDate : today;
  const minEndTime = startTime ? startTime : '';

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center py-12">
      <ToastContainer />
      <div className="max-w-4xl w-full p-10 bg-white rounded-xl shadow-md">
        <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-8">Create New Quiz</h2>

        {/* Subject Field */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Topic Field */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Topic:</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Start Date Field */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={today}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Start Time Field */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Start Time:</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* End Date Field */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={minEndDate}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* End Time Field */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">End Time:</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            min={minEndTime}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Quiz Duration Field */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Quiz Duration (in minutes):</label>
          <input
            type="number"
            value={quizDuration}
            onChange={(e) => setQuizDuration(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Enter duration in minutes"
          />
        </div>

        {/* Questions */}
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-4">Questions:</h3>
          {questions.map((q, index) => (
            <div key={index} className="mb-6 border p-4 rounded-lg">
              <label className="block text-gray-700 text-sm font-bold mb-2">Question {index + 1}:</label>
              <input
                type="text"
                value={q.question}
                onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg mb-4"
              />

              {/* Options */}
              {q.options.map((opt, optIndex) => (
                <div key={optIndex} className="mb-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Option {optIndex + 1}:</label>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() => handleAddOption(index)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Add Option
              </button>

              <div className="mt-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Answer:</label>
                <input
                  type="text"
                  value={q.answer}
                  onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <button
                type="button"
                onClick={() => handleDeleteQuestion(index)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg mt-4"
              >
                Delete Question
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddQuestion}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mt-4"
          >
            Add New Question
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded-lg w-full"
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
};

export default CreateQuizDashBoard;
