import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const ChatbotQuiz = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-10 px-4">
      <div className="max-w-6xl mx-auto relative">
        <button
          onClick={() => navigate('/cquizdashboard')}
          className="absolute -top-2 left-0 text-white/90 hover:text-white"
          aria-label="Back to Dashboard"
          title="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
            <path fillRule="evenodd" d="M9.53 3.97a.75.75 0 010 1.06L4.56 10h16.69a.75.75 0 010 1.5H4.56l4.97 4.97a.75.75 0 11-1.06 1.06l-6.25-6.25a.75.75 0 010-1.06l6.25-6.25a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-white text-3xl md:text-4xl font-extrabold text-center mb-8 drop-shadow-sm">AI-powered Quiz Builder</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Card */}
          <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-white/40 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quiz Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={quizDetails.subject}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Computer Networks"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Topic</label>
                  <input
                    type="text"
                    name="topic"
                    value={quizDetails.topic}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Routing Protocols"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Questions</label>
                  <input
                    type="number"
                    name="numQuestions"
                    value={quizDetails.numQuestions}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="1"
                    required
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    name="quizDuration"
                    value={quizDetails.quizDuration}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 30"
                    required
                  />
                </div>
              </div>

              <h3 className="text-sm font-semibold text-gray-800 mt-2">Schedule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={quizDetails.startDate}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={quizDetails.startTime}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={quizDetails.endDate}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={quizDetails.endTime}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                {loading ? "Creating Quiz..." : "Create Quiz"}
              </button>
            </form>
          </div>

          {/* Info Card */}
          <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg border border-white/40 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">What will be generated?</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600"></span>
                A quiz with the exact number of questions you request, each with four options and one correct answer.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600"></span>
                If a question or option contains code, it will be displayed clearly in a readable code block.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600"></span>
                We also generate a unique Quiz Code and Access Key and store everything securely.
              </li>
            </ul>
            <div className="mt-6 p-4 rounded-lg bg-gray-50 border">
              <p className="text-sm text-gray-600">Tip: Be specific with the topic (e.g., "Dijkstra vs. Bellman-Ford") for higher quality questions.</p>
            </div>
          </div>
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
            <div className="bg-white rounded-xl shadow-xl w-11/12 max-w-3xl p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Generated Quiz</h2>
              <div className="max-h-[60vh] overflow-y-auto pr-2">
                {generatedQuiz?.map((q, index) => (
                  <div key={index} className="my-4">
                    <p style={{ textAlign: 'left' }}>
                      <strong>Q{index + 1}: </strong>
                      {renderQuestionWithCode(q.question)}
                    </p>
                    <ul className="mt-2 list-disc pl-5 text-gray-800">
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
                    <p className="mt-1 text-indigo-700"><strong>Correct Answer: </strong>{q.answer}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={closeModal} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer />
      </div>
    </div>
  );
};

export default ChatbotQuiz;
