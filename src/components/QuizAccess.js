import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import sp from '../Assets/score-logo.png';
import * as faceapi from 'face-api.js';

Modal.setAppElement('#root');

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

  // Only render code block if codePart exists, is not empty, and does not contain "no code needed"
  if (
    codePart &&
    codePart.trim() &&
    !/^#?\s*no code needed\s*$/i.test(codePart.trim())
  ) {
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

// Helper to render options and code block
function renderOptionWithCode(option) {
  // Split at 'code:' (case-insensitive)
  const [optionText, codePart] = option.split(/code:/i);
  const elements = [];
  let key = 0;

  // Show only the first line of optionText as the main option
  const firstLine = optionText ? optionText.split('\n')[0].trim() : '';

  if (firstLine) {
    elements.push(
      <span key={key++} style={{ display: 'inline', textAlign: 'left', marginBottom: '0.2rem' }}>
        {firstLine}
      </span>
    );
  }

  // If there is code, render it as a code block (left aligned, monospace)
  if (
    codePart &&
    codePart.trim() &&
    !/^#?\s*no code needed\s*$/i.test(codePart.trim())
  ) {
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

export default function QuizAccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { quiz } = location.state || {};
  const [userAnswers, setUserAnswers] = useState(Array(quiz?.questions?.length || 0).fill(''));
  const [score, setScore] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [answersModalIsOpen, setAnswersModalIsOpen] = useState(false);
  const [backConfirmIsOpen, setBackConfirmIsOpen] = useState(false);

  // Proctoring states
  const [proctoringError, setProctoringError] = useState('');
  const [tabSwitchWarning, setTabSwitchWarning] = useState('');
  const [violationCount, setViolationCount] = useState(0);
  const [violated, setViolated] = useState(false);
  const videoRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const streamRef = useRef(null);

  // Load face-api models and set up proctoring
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      } catch (error) {
        // ignore
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

    startWebcam();
    startProctoring();

    return () => {
      stopWebcam();
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      clearTimeout(warningTimeoutRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
    // eslint-disable-next-line
  }, []);

  // Proctoring logic
  const startProctoring = () => {
    const detectFace = async () => {
      if (videoRef.current) {
        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        let violation = false;

        if (detections.length === 0) {
          setProctoringError('No face detected. Please stay in front of the camera.');
          violation = true;
        } else if (detections.length > 1) {
          setProctoringError('Multiple faces detected! This is a violation.');
          violation = true;
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
            violation = true;
          } else if (noseToLeftEyeDistance / eyeDistance < 0.4) {
            setProctoringError('Head turned right.');
            violation = true;
          } else {
            setProctoringError('');
          }
        }

        if (violation) {
          setViolationCount(prev => {
            const newCount = prev + 1;
            if (newCount >= 3) {
              setViolated(true);
              stopWebcam();
              if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
            }
            return newCount;
          });
        }
      }
    };

    detectionIntervalRef.current = setInterval(detectFace, 5000);
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        // Only play after metadata is loaded
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
    } catch (error) {
      // ignore
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

  // Helper: get correct answer text for a question
  const getCorrectAnswerText = (q) => {
    if (q.answer && typeof q.answer === "string" && q.answer.length === 1) {
      const idx = q.answer.charCodeAt(0) - 65;
      return q.options[idx];
    }
    return q.answer;
  };

  // Submit quiz
  const handleSubmit = () => {
    if (userAnswers.includes('')) {
      setError('Please answer all questions before submitting.');
      setModalIsOpen(true);
      return;
    }

    let calculatedScore = 0;
    quiz.questions.forEach((q, index) => {
      const correctText = getCorrectAnswerText(q);
      if (userAnswers[index] === correctText) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);

    // Stop proctoring and webcam
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      streamRef.current = null;
    }

    setModalIsOpen(true);
  };

  const handleEndQuiz = () => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    stopWebcam();
    setBackConfirmIsOpen(false);
    navigate('/EnterQuizCode');
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-bg bg-fixed bg-cover p-4">
      {/* Webcam and proctoring warnings */}
      <div className="fixed top-4 right-4 z-40 p-4 bg-white shadow-md rounded-lg">
        <video ref={videoRef} className="w-40 h-40 border-2 border-red-500"></video>
        {proctoringError && <p className="text-red-500">{proctoringError}</p>}
        {tabSwitchWarning && <p className="text-red-500">{tabSwitchWarning}</p>}
        {violationCount > 0 && !violated && (
          <p className="text-red-500 font-bold">Proctoring Violations: {violationCount}/3</p>
        )}
      </div>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Attend Quiz</h1>

        {violated ? (
          <div className="w-full text-center">
            <h2 className="text-3xl font-bold text-red-600 mb-4">Quiz Violated</h2>
            <p className="text-lg text-gray-700">You have exceeded the allowed number of proctoring violations. The quiz is now closed.</p>
            <button
              onClick={handleEndQuiz}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-6"
            >
              Back
            </button>
          </div>
        ) : quiz?.questions?.length > 0 ? (
          <div>
            {quiz.questions.map((q, index) => (
              <div key={index} className="mb-4">
                <p className="font-semibold mb-2 text-left">
                  {q.question_number || index + 1}. {renderQuestionWithCode(q.question)}
                </p>
                {q.options.map((option, idx) => (
                  <label key={idx} className="inline-flex items-center w-full mb-2">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      onChange={(e) => {
                        const newAnswers = [...userAnswers];
                        newAnswers[index] = e.target.value;
                        setUserAnswers(newAnswers);
                      }}
                      checked={userAnswers[index] === option}
                      className="hidden"
                    />
                    <span
                      className={`inline-flex items-center cursor-pointer px-4 py-2 rounded w-full ${
                        userAnswers[index] === option ? 'bg-blue-500 text-white' : 'bg-gray-200'
                      }`}
                      style={{ textAlign: 'left' }}
                    >
                      {String.fromCharCode(97 + idx)}) {renderOptionWithCode(option)}
                    </span>
                  </label>
                ))}
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={userAnswers.includes('')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              Submit Quiz
            </button>
            <button
              onClick={() => setBackConfirmIsOpen(true)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded w-full mt-3"
            >
              Back
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-500">No quiz data available.</p>
        )}

        {/* Score Modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          className="fixed inset-0 flex items-center justify-center z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
            {error ? (
              <div>
                <h2 className="text-xl font-bold mb-4 text-center text-red-600">Error</h2>
                <p className="text-center">{error}</p>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex justify-center">
                  <img src={sp} alt="Score" className="w-62 h-32 object-cover" />
                </div>
                <h2 className="text-xl font-bold mb-4 text-center">
                  Your Score: {score} / {quiz.questions.length}
                </h2>

                <button
                  onClick={() => setAnswersModalIsOpen(true)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full mt-4"
                >
                  Show Answers
                </button>
              </div>
            )}
            <button
              onClick={closeModal}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mt-4"
            >
              Close
            </button>
          </div>
        </Modal>

        {/* Answers Modal */}
        <Modal
          isOpen={answersModalIsOpen}
          onRequestClose={() => setAnswersModalIsOpen(false)}
          className="fixed inset-0 flex items-center justify-center z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div
            className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto overflow-y-auto"
            style={{ maxHeight: '80vh' }}
          >
            <h2 className="text-xl font-bold mb-4 text-center">Quiz Answers</h2>
            {quiz.questions.map((q, index) => {
              const correctText = getCorrectAnswerText(q);
              return (
                <div key={index} className="mb-4">
                  <p className="font-semibold mb-2">
                    {q.question_number || index + 1}. {renderQuestionWithCode(q.question)}
                  </p>
                  {q.options.map((option, idx) => {
                    let bg = 'bg-gray-200';
                    if (option === correctText) bg = 'bg-green-300';
                    if (userAnswers[index] === option && option !== correctText) bg = 'bg-red-300';
                    return (
                      <div key={idx} className={`px-4 py-2 rounded mb-2 ${bg}`} style={{ textAlign: 'left' }}>
                        {String.fromCharCode(97 + idx)}) {renderOptionWithCode(option)}
                        {option === correctText && (
                          <span className="ml-2 font-bold text-green-700">(Correct Answer)</span>
                        )}
                        {userAnswers[index] === option && option !== correctText && (
                          <span className="ml-2 font-bold text-red-700">(Your Answer)</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            <button
              onClick={() => setAnswersModalIsOpen(false)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mt-4"
            >
              Close
            </button>
          </div>
        </Modal>

        {/* Back Confirmation Modal */}
        <Modal
          isOpen={backConfirmIsOpen}
          onRequestClose={() => setBackConfirmIsOpen(false)}
          className="fixed inset-0 flex items-center justify-center z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-2 text-center">Leave Quiz?</h2>
            <p className="text-center text-gray-700">Do you want to end the quiz or continue?</p>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleEndQuiz}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-1/2"
              >
                End Quiz
              </button>
              <button
                onClick={() => setBackConfirmIsOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 px-4 rounded w-1/2"
              >
                Continue Quiz
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}