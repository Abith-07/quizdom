import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as faceapi from 'face-api.js';

export default function EnterQuizCode() {
  const [quizCode, setQuizCode] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [proctoringError, setProctoringError] = useState('');
  const [tabSwitchWarning, setTabSwitchWarning] = useState('');
  const videoRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const streamRef = useRef(null);
  const warningTimeoutRef = useRef(null);

  // Timer formatting
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        console.log("Face detection models loaded");
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };
    loadModels();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchWarning('You have switched the tab. Please return to the quiz.');
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = setTimeout(() => {
          setTabSwitchWarning('');
        }, 10000);
      }
    };

    const handleWindowBlur = () => {
      setTabSwitchWarning('You have switched the window or minimized the tab. Please return to the quiz.');
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = setTimeout(() => {
        setTabSwitchWarning('');
      }, 10000);
    };

    const handleWindowFocus = () => {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = setTimeout(() => {
        setTabSwitchWarning('');
      }, 10000);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      stopWebcam();
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      clearTimeout(warningTimeoutRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const startProctoring = () => {
    const detectFace = async () => {
      if (videoRef.current) {
        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        if (detections.length === 0) {
          setProctoringError('No face detected. Please stay in front of the camera.');
        } else if (detections.length > 1) {
          setProctoringError('Multiple faces detected! This is a violation.');
        } else {
          const landmarks = detections[0].landmarks;
          const nose = landmarks.getNose();
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();
          const noseX = nose[3].x;
          const leftEyeX = leftEye[0].x;
          const rightEyeX = rightEye[3].x;
          const eyeDistance = rightEyeX - leftEyeX;
          const noseToLeftEyeDistance = noseX - leftEyeX;

          if (noseToLeftEyeDistance / eyeDistance > 0.6) {
            setProctoringError('Head turned left.');
          } else if (noseToLeftEyeDistance / eyeDistance < 0.4) {
            setProctoringError('Head turned right.');
          } else {
            setProctoringError('');
          }
        }
      }
    };

    detectionIntervalRef.current = setInterval(detectFace, 5000);
  };

  const startTimer = () => {
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerIntervalRef.current);
          handleSubmitAnswers();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      videoRef.current.play();
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      streamRef.current = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const quizQuery = query(collection(db, 'created_quiz'), where('quizCode', '==', quizCode));
      const querySnapshot = await getDocs(quizQuery);

      if (!querySnapshot.empty) {
        const quizDoc = querySnapshot.docs[0];
        const data = quizDoc.data();

        if (data.accessKey !== accessKey) {
          setError('Invalid access key. Please try again.');
          setQuizData(null);
          return;
        }

        const currentDate = new Date();
        const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
        const endDateTime = new Date(`${data.endDate}T${data.endTime}`);

        if (currentDate >= startDateTime && currentDate <= endDateTime) {
          setQuizData(data);
          setError('');
          setSubmitted(false);
          setTimeLeft(data.duration * 60);
          startWebcam();
          startProctoring();
          startTimer();
        } else if (currentDate < startDateTime) {
          setError('The quiz has not started yet. Please try again later.');
          setQuizData(null);
        } else {
          setError('The quiz has ended. Please contact your instructor for more information.');
          setQuizData(null);
        }
      } else {
        setError('Invalid quiz code. Please try again.');
        setQuizData(null);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError('An error occurred. Please try again.');
    }
  };

  const handleOptionChange = (qIndex, option) => {
    setSelectedAnswers({ ...selectedAnswers, [qIndex]: option });
  };

  const handleSubmitAnswers = () => {
    if (quizData) {
      let calculatedScore = 0;
      quizData.questions.forEach((q, qIndex) => {
        if (selectedAnswers[qIndex] === q.answer) {
          calculatedScore += 1;
        }
      });
      setScore(calculatedScore);
      setSubmitted(true);

      // Stop proctoring
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      stopWebcam(); // Stop webcam after quiz submission

      // No navigation; show results on the same page
    }
  };

  return (
    <div
  className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-400 relative"
>

      <div className="absolute top-0 right-0 p-4 bg-white shadow-md rounded-lg">
        <video ref={videoRef} className="w-40 h-40 border-2 border-red-500"></video>
        {/* Proctoring video and errors */}
        {proctoringError && <p className="text-red-500">{proctoringError}</p>}
        {tabSwitchWarning && <p className="text-red-500">{tabSwitchWarning}</p>}
      </div>
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg overflow-y-auto h-[80vh]">
        <h1 className="text-2xl font-bold mb-4 text-center">Enter Quiz Code</h1>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Quiz Code:</label>
            <input
              type="text"
              value={quizCode}
              onChange={(e) => setQuizCode(e.target.value)}
              required
              className="border border-gray-300 rounded w-full p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Access Key:</label>
            <input
              type="password"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              required
              className="border border-gray-300 rounded w-full p-2"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-600"
          >
            Join Quiz
          </button>
        </form>
        {error && <p className="text-red-500">{error}</p>}
        {quizData && (
          <div>
            <h2 className="text-xl font-bold mb-4">Quiz: {quizData.quizTitle}</h2>
            <div className="overflow-y-auto h-[60vh]">
              {quizData.questions.map((q, index) => (
                <div key={index} className="mb-4">
                  <p className="font-semibold">{index + 1}. {q.question}</p>
                  {q.options.map((option) => (
                    <div key={option} className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        onChange={() => handleOptionChange(index, option)}
                        className="mr-2"
                      />
                      <label>{option}</label>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button
              onClick={handleSubmitAnswers}
              className="bg-green-500 text-white rounded py-2 px-4 hover:bg-green-600"
            >
              Submit Answers
            </button>
            {submitted && (
              <div className="mt-4">
                <p className="text-xl font-bold">Your Score: {score}/{quizData.questions.length}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
