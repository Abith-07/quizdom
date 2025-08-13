import React, { useState } from 'react';
import { HfInference } from "@huggingface/inference";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../firebase'; // Ensure your Firebase config is correctly set up
import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc } from 'firebase/firestore';

const inference = new HfInference("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");

const ChatbotQuiz = () => {
  const [quizDetails, setQuizDetails] = useState({
    subject: '',
    topic: '',
    numQuestions: 1,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    quizDuration: '' // Add quiz duration to the state
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
  
      // Generate questions in a single request
      const response = await inference.chatCompletionStream({
        model: "HuggingFaceH4/zephyr-7b-beta",
        messages: [{ 
          role: "user", 
          content: `Generate ${numQuestions} unique quiz questions with 4 options each on ${topic} for ${subject}.` 
        }],
        max_tokens: 500 * numQuestions, // Adjust the max tokens according to the number of questions
      });
  
      let fullResponse = "";
      for await (const chunk of response) {
        const chunkText = chunk.choices[0]?.delta?.content || '';
        fullResponse += chunkText;
      }
  
      // Parse the response and extract the questions
      const questionsArray = fullResponse.trim().split(/\n\s*\n/); // Split the response by double line breaks
  
      questionsArray.forEach((questionBlock) => {
        const [question, optionsText, answer] = parseResponse(questionBlock.trim());
        generatedQuestions.push({
          question,
          options: optionsText.split('\n'),
          answer,
        });
      });
  
      // Log the generated quiz data
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
  
      console.log("Quiz Data to Store:", quizData); // Log quiz data for verification
  
      // Store quiz data in Firebase
      await addDoc(collection(db, 'created_quiz'), quizData);
      
      // Update the state to show the generated quiz
      setGeneratedQuiz(generatedQuestions);
      setModalOpen(true);
  
      // Notify user of successful creation
      toast.success(`Quiz created successfully! Quiz Code: ${quizCode} Access Key: ${accessKey}`);
  
    } catch (error) {
      console.error("Error details: ", error);
      toast.error("An unexpected error occurred: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  


  const parseResponse = (response) => {
    const lines = response.trim().split('\n');
    const question = lines[0]?.trim();
    const options = lines.slice(1, 5).map(option => option.trim()).join('\n');
    const answer = lines[lines.length - 1]?.replace(/^Correct Answer: /, '').trim();
    return [question, options, answer];
  };

  
  const closeModal = () => {
    setModalOpen(false);
    setGeneratedQuiz(null); // Clear the generated quiz data
  };

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
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-lg">
      <h2 className="text-xl font-bold mb-4">Generated Quiz</h2>
      <div className="max-h-80 overflow-y-auto"> {/* Added scrolling functionality */}
        {generatedQuiz?.map((q, index) => (
          <div key={index} className="my-4">
            <p><strong>Q{index + 1}: </strong>{q.question}</p>
            <ul>
              {q.options.map((option, i) => (
                <li key={i}>{option}</li>
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
