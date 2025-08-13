import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { CopyToClipboard } from 'react-copy-to-clipboard'; // Import for clipboard functionality

const EditQuiz = () => {
  const { id } = useParams();
  const [quizData, setQuizData] = useState({
    subject: '',
    topic: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    quizDuration: '', 
    questions: [],
    quizCode: '',
    accessKey: ''
  });

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
  const formattedTime = currentDate.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const quizRef = doc(db, 'created_quiz', id);
        const docSnap = await getDoc(quizRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setQuizData({
            subject: data.subject || '',
            topic: data.topic || '',
            startDate: data.startDate || formattedDate,
            endDate: data.endDate || '',
            startTime: data.startTime || '',
            endTime: data.endTime || '',
            quizDuration: data.quizDuration || '', 
            questions: data.questions || [],
            quizCode: data.quizCode || '',
            accessKey: data.accessKey || ''
          });
        } else {
          console.error('No such quiz document found!');
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error);
      }
    };

    fetchQuizData();
  }, [id, formattedDate, formattedTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const quizRef = doc(db, 'created_quiz', id);
      await updateDoc(quizRef, quizData);
      alert('Quiz updated successfully!');
    } catch (error) {
      console.error('Error updating quiz:', error);
      alert('Failed to update quiz');
    }
  };

  const handleChange = (field, value) => {
    setQuizData((prevData) => ({
      ...prevData,
      [field]: value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = quizData.questions.map((question, i) => {
      if (i === index) {
        return { ...question, [field]: value };
      }
      return question;
    });
    setQuizData((prevData) => ({
      ...prevData,
      questions: updatedQuestions
    }));
  };

  const handleAddOption = (index) => {
    const updatedQuestions = quizData.questions.map((question, i) => {
      if (i === index) {
        return {
          ...question,
          options: [...question.options, ''] // Add a new empty option
        };
      }
      return question;
    });
    setQuizData((prevData) => ({
      ...prevData,
      questions: updatedQuestions
    }));
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = quizData.questions.map((question, i) => {
      if (i === qIndex) {
        const updatedOptions = question.options.map((option, j) => {
          if (j === oIndex) {
            return value;
          }
          return option;
        });
        return { ...question, options: updatedOptions };
      }
      return question;
    });
    setQuizData((prevData) => ({
      ...prevData,
      questions: updatedQuestions
    }));
  };

  const handleDeleteOption = (qIndex, oIndex) => {
    const updatedQuestions = quizData.questions.map((question, i) => {
      if (i === qIndex) {
        const updatedOptions = question.options.filter((_, j) => j !== oIndex);
        return { ...question, options: updatedOptions };
      }
      return question;
    });
    setQuizData((prevData) => ({
      ...prevData,
      questions: updatedQuestions
    }));
  };

  const handleAddQuestion = () => {
    setQuizData((prevData) => ({
      ...prevData,
      questions: [...prevData.questions, { question: '', options: [''], correctAnswer: '' }]
    }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Edit Quiz</h2>
      <form onSubmit={handleSubmit}>
        {/* Subject Input */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Subject</label>
          <input
            type="text"
            value={quizData.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        {/* Topic Input */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Topic</label>
          <input
            type="text"
            value={quizData.topic}
            onChange={(e) => handleChange('topic', e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        {/* Start and End Date Inputs */}
        <div className="flex mb-4">
          <div className="mr-2 w-1/2">
            <label className="block text-gray-700 font-bold mb-2">Start Date</label>
            <input
              type="date"
              value={quizData.startDate}
              min={formattedDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="ml-2 w-1/2">
            <label className="block text-gray-700 font-bold mb-2">End Date</label>
            <input
              type="date"
              value={quizData.endDate}
              min={quizData.startDate || formattedDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
        </div>

        {/* Start and End Time Inputs */}
        <div className="flex mb-4">
          <div className="mr-2 w-1/2">
            <label className="block text-gray-700 font-bold mb-2">Start Time</label>
            <input
              type="time"
              value={quizData.startTime}
              min={formattedTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="ml-2 w-1/2">
            <label className="block text-gray-700 font-bold mb-2">End Time</label>
            <input
              type="time"
              value={quizData.endTime}
              onChange={(e) => handleChange('endTime', e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
        </div>

        {/* Quiz Duration Input */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Duration (minutes)</label>
          <input
            type="number"
            value={quizData.quizDuration}
            onChange={(e) => handleChange('duration', e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter duration in minutes"
            required
          />
        </div>

        {/* Quiz Code and Access Key with Copy Buttons */}
        <div className="flex mb-4">
          <div className="mr-2 w-1/2">
            <label className="block text-gray-700 font-bold mb-2">Quiz Code</label>
            <div className="flex">
              <input
                type="text"
                value={quizData.quizCode}
                readOnly
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <CopyToClipboard text={quizData.quizCode}>
                <button className="ml-2 bg-blue-500 text-white font-bold py-2 px-4 rounded">Copy</button>
              </CopyToClipboard>
            </div>
          </div>

          <div className="ml-2 w-1/2">
            <label className="block text-gray-700 font-bold mb-2">Access Key</label>
            <div className="flex">
              <input
                type="text"
                value={quizData.accessKey}
                readOnly
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <CopyToClipboard text={quizData.accessKey}>
                <button className="ml-2 bg-blue-500 text-white font-bold py-2 px-4 rounded">Copy</button>
              </CopyToClipboard>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <h3 className="text-lg font-bold mb-2">Questions</h3>
        {quizData.questions.map((question, index) => (
          <div key={index} className="mb-4 border p-4 rounded shadow">
            <label className="block text-gray-700 font-bold mb-2">Question {index + 1}</label>
            <input
              type="text"
              value={question.question}
              onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />

            {/* Options */}
            {question.options.map((option, oIndex) => (
              <div key={oIndex} className="flex items-center mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, oIndex, e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder={`Option ${oIndex + 1}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => handleDeleteOption(index, oIndex)}
                  className="ml-2 bg-red-500 text-white font-bold py-2 px-4 rounded"
                >
                  Delete
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddOption(index)}
              className="bg-green-500 text-white font-bold py-2 px-4 rounded mb-2"
            >
              Add Option
            </button>

            {/* Correct Answer Dropdown */}
            <label className="block text-gray-700 font-bold mb-2">Correct Answer</label>
            <select
                value={question.answer}
                onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="" disabled>Select correct answer</option>
                {question.options.map((option, oIndex) => (
                  <option key={oIndex} value={option}>{option}</option>
                ))}
              </select>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddQuestion}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded mb-2"
        >
          Add Question
        </button>

        {/* Submit Button */}
        <button type="submit" className="bg-green-500 text-white font-bold py-2 px-4 rounded">
          Update Quiz
        </button>
      </form>
    </div>
  );
};

export default EditQuiz;
