import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc } from 'firebase/firestore';

const ChatbotQuiz = () => {
  const [quizDetails, setQuizDetails] = useState({
    subject: '',
    topic: '',
    numQuestions: 1,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    quizDuration: ''
  });
  const [loading, setLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setQuizDetails(prevDetails => ({ ...prevDetails, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { subject, topic, numQuestions, startDate, startTime, endDate, endTime, quizDuration } = quizDetails;

    if (!subject || !topic || !numQuestions || !startDate || !startTime || !endDate || !endTime || !quizDuration) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      toast.info("Generating quiz code and access key...");

      const quizCode = uuidv4().slice(0, 6).toUpperCase();
      const accessKey = uuidv4().slice(0, 4).toUpperCase();
      let generatedQuestions = [];

      toast.info("Generating quiz questions...");

      // Gemini API call
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate ${numQuestions} unique quiz questions with 4 options each on ${topic} for ${subject}.
If a question or option contains code, include the code as plain text, properly indented, and do NOT use Markdown formatting or backticks.
Format each question as:
Question: <question>
code:<code>
A) <option1>
B) <option2>
C) <option3>
D) <option4>
Correct Answer: <A/B/C/D>`
              }]
            }]
          })
        }
      );

      const geminiData = await geminiResponse.json();
      if (!geminiData.candidates || !geminiData.candidates[0]?.content?.parts[0]?.text) {
        throw new Error("No response from Gemini. Please try again.");
      }

      const fullResponse = geminiData.candidates[0].content.parts[0].text;

      // Parse the response and extract the questions
      const questionsArray = fullResponse.trim().split(/Question:/).filter(Boolean);

      questionsArray.forEach((block) => {
        const lines = block.trim().split('\n').filter(Boolean);

        // Find indices for options and answer
        const aIndex = lines.findIndex(line => line.trim().startsWith('A)'));
        const bIndex = lines.findIndex(line => line.trim().startsWith('B)'));
        const cIndex = lines.findIndex(line => line.trim().startsWith('C)'));
        const dIndex = lines.findIndex(line => line.trim().startsWith('D)'));
        const answerIndex = lines.findIndex(line => line.trim().startsWith('Correct Answer:'));

        // Question: all lines from 0 to aIndex
        const question = lines.slice(0, aIndex).join('\n').trim();

        // Options: from their marker to the next marker
        const options = [
          lines.slice(aIndex, bIndex).map(l => l.replace(/^A\)\s*/, '')).join('\n').trim(),
          lines.slice(bIndex, cIndex).map(l => l.replace(/^B\)\s*/, '')).join('\n').trim(),
          lines.slice(cIndex, dIndex).map(l => l.replace(/^C\)\s*/, '')).join('\n').trim(),
          lines.slice(dIndex, answerIndex).map(l => l.replace(/^D\)\s*/, '')).join('\n').trim(),
        ];

        // Extract answer
        const answerLine = lines[answerIndex];
        const answer = answerLine ? answerLine.replace("Correct Answer:", "").trim() : "";

        generatedQuestions.push({ question, options, answer });
      });

      const quizData = {
        subject,
        topic,
        quizCode,
        accessKey,
        startDate,
        startTime,
        endDate,
        endTime,
        quizDuration,
        createdAt: new Date(),
        questions: generatedQuestions,
      };

      await addDoc(collection(db, 'created_quiz'), quizData);

      setGeneratedQuiz(generatedQuestions);
      setModalOpen(true);

      toast.success(`Quiz created successfully! Quiz Code: ${quizCode} Access Key: ${accessKey}`);

    } catch (error) {
      console.error("Error details: ", error);
      toast.error("An unexpected error occurred: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setGeneratedQuiz(null);
  };

  // Helper to render question and code block
  function renderQuestionWithCode(question) {
    // Split at 'code:' (case-insensitive)
    const [questionText, codePart] = question.split(/code:/i);
    const elements = [];
    let key = 0;

    // Add the question text as normal text (left aligned)
    if (questionText && questionText.trim()) {
      elements.push(
        <span key={key++} style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem' }}>
          {questionText.trim()}
        </span>
      );
    }

    // If there is code, render it as a code block (left aligned, monospace)
    if (codePart && codePart.trim()) {
      elements.push(
        <pre
          key={key++}
          className="bg-gray-100 rounded p-2 my-1 text-sm"
          style={{
            fontFamily: 'Fira Mono, Menlo, Monaco, Consolas, monospace',
            textAlign: 'left',
            margin: 0,
          }}
        >
          <code>{codePart.trim()}</code>
        </pre>
      );
    }

    return elements;
  }

  return (
    <div className="w-full h-full flex flex-col bg-white shadow-lg rounded-lg border border-gray-300">
      <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4">
        <div className="mb-4">
          <label className="block text-gray-700">Subject:</label>
          <input
            type="text"
            name="subject"
            value={quizDetails.subject}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter Subject"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Topic:</label>
          <input
            type="text"
            name="topic"
            value={quizDetails.topic}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter Topic"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Number of Questions:</label>
          <input
            type="number"
            name="numQuestions"
            value={quizDetails.numQuestions}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg"
            min="1"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Start Date:</label>
          <input
            type="date"
            name="startDate"
            value={quizDetails.startDate}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Start Time:</label>
          <input
            type="time"
            name="startTime"
            value={quizDetails.startTime}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">End Date:</label>
          <input
            type="date"
            name="endDate"
            value={quizDetails.endDate}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">End Time:</label>
          <input
            type="time"
            name="endTime"
            value={quizDetails.endTime}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        {/* Quiz Duration Field */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Quiz Duration (in minutes):</label>
          <input
            type="number"
            name="quizDuration"
            value={quizDetails.quizDuration}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Enter duration in minutes"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          disabled={loading}
        >
          {loading ? "Creating Quiz..." : "Create Quiz"}
        </button>
      </form>

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-lg">
            <h2 className="text-xl font-bold mb-4">Generated Quiz</h2>
            <div className="max-h-80 overflow-y-auto">
              {generatedQuiz?.map((q, index) => (
                <div key={index} className="my-4">
                  <p style={{ textAlign: 'left' }}>
                    <strong>Q{index + 1}: </strong>
                    {renderQuestionWithCode(q.question)}
                  </p>
                  <ul>
                    {q.options.map((option, i) => (
                      <li key={i}>
                        {option.includes('\n') ? (
                          <pre
                            className="bg-gray-100 rounded p-2 my-1 text-sm"
                            style={{
                              fontFamily: 'Fira Mono, Menlo, Monaco, Consolas, monospace',
                              textAlign: 'left',
                              margin: 0,
                            }}
                          >
                            <code>{option}</code>
                          </pre>
                        ) : (
                          option
                        )}
                      </li>
                    ))}
                  </ul>
                  <p><strong>Correct Answer: </strong>{q.answer}</p>
                </div>
              ))}
            </div>
            <button onClick={closeModal} className="mt-4 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded-lg">
              Close
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default ChatbotQuiz;
