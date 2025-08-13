import { Card } from "flowbite-react";
import Gk from "../Assets/Gk.jpeg";
import Cs from "../Assets/Computer-Science.jpeg";
import Apti from "../Assets/Aptitute-Test.jpg";
import Header from "../components/Header";
import Ai from  "../Assets/AIcard.jpg";
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from "firebase/auth";
import Chatbot from '../components/ChatBot'; // Assuming you have a Chatbot component
import Lottie from 'lottie-react'; // Import Lottie
import WallELottie from '../Assets/WallE.json'; // Adjust the path to your Wall-E animation JSON file

export default function Homepage() {
  const [username, setUsername] = useState('');
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || user.email);
      } else {
        setUsername('');
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  return (
    <div className="bg-primary-bg bg-fixed bg-cover w-full h-fit">
      <Header />
      <section id="Resume" className="b rounded-md">
        <div className="px-4 mx-auto max-w-screen-xl text-center py-24 lg:py-52">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl">
            Quizdom
          </h1>
          <p className="mb-8 text-lg font-normal text-gray-300 lg:text-xl sm:px-16 lg:px-48">
            Welcome, {username ? username : 'Guest'}
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center gap-5 sm:space-y-0">
            <Link to="/ai-quiz">
              <div className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900">
                Take Quiz
                <svg
                  className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
              </div>
            </Link>
            <Link to="/EnterQuizCode">
              <div className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900">
                Quiz Code
                <svg
                  className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
              </div>
            </Link>
            <Link to="/cquizdashboard">
              <div className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900">
                Create Quiz
                <svg
                  className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Quiz Cards Section */}
      <div className="flex flex-col flex-wrap items-center rounded-lg justify-center">
        <div className="p-10 w-fit h-fit bg-white rounded-t-lg gap-5 flex justify-center">
          <Link to="/quiz?category=gk">
            <Card
              className="max-w-sm border-black border-2 bg-white"
              imgAlt="Meaningful alt text for an image that is not purely decorative"
              imgSrc={Gk}
            >
              <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                General Knowledge Quiz
              </h5>
              <p className="font-normal text-gray-700 dark:text-gray-400">
                A general knowledge quiz tests participants on diverse topics such as history, science, geography, and current events. It assesses knowledge breadth and is popular in educational settings and social gatherings for learning and entertainment.
              </p>
            </Card>
          </Link>
          <Link to="/quiz?category=cs">
            <Card
              className="max-w-sm border-black border-2 bg-white"
              imgAlt="Meaningful alt text for an image that is not purely decorative"
              imgSrc={Cs}
            >
              <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Computer Science Quiz
              </h5>
              <p className="font-normal text-gray-700 dark:text-gray-400">
                Computer science is the study of computers and computational systems. It encompasses topics like programming, data structures, and software development. This field drives innovation and problem-solving across various industries through technology.
              </p>
            </Card>
          </Link>
        </div>

        <div className="p-10 w-fit h-fit bg-white rounded-b-lg flex gap-5 justify-center">
          <Link to="/quiz?category=apti">
            <Card
              className="max-w-sm border-black border-2 bg-white"
              imgAlt="Meaningful alt text for an image that is not purely decorative"
              imgSrc={Apti}
            >
              <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Aptitude MCQ
              </h5>
              <p className="font-normal text-gray-700 dark:text-gray-400">
                An aptitude test evaluates a person's ability to learn or perform specific tasks. It assesses skills like logical reasoning, numerical ability, verbal proficiency, and problem-solving capabilities. Aptitude tests are commonly used in educational admissions, job placements, and career assessments.
              </p>
            </Card>
          </Link>
          <Link to="/ai-quiz">
            <Card
              className="max-w-sm border-black border-2 bg-white"
              imgAlt="AI Quiz"
              imgSrc={Ai}
            >
              <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                AI Quiz
              </h5>
              <p className="font-normal text-gray-700 dark:text-gray-400">
                Test your knowledge about Artificial Intelligence! This quiz covers a variety of topics in AI, including machine learning, neural networks, and more.
              </p>
            </Card>
          </Link>
        </div>
      </div>

      {/* Floating Help Button with Wall-E Lottie */}
      <div className="relative mt-8">
  <div
    onClick={toggleChatbot}
    className="fixed bottom-1 right-3 flex justify-center items-center"
  >
    <Lottie 
      animationData={WallELottie} 
      className="w-56 h-56" // Increased size without circular border
    />
  </div>
</div>




      {/* Chatbot Modal */}
{showChatbot && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="relative bg-white w-full max-w-3xl p-6 rounded-lg shadow-lg h-[80vh] transform transition-all overflow-y-auto">
      {/* Close Button */}
      <button
        onClick={toggleChatbot}
        className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 focus:outline-none"
      >
        X
      </button>

      {/* Chatbot Title */}
      <h2 className="text-2xl font-semibold text-center mb-4">Wall-E </h2>
      <p className="text-1xl font-light font-sans">
      Wall-E is a user-friendly AI assistant designed to simplify your daily tasks. With capabilities ranging from setting reminders to answering questions, Wall-E offers personalized support powered by advanced natural language processing and machine learning. This makes Wall-E an invaluable tool for enhancing productivity and organization in your life.      </p>

      {/* Lottie Animation */}
      <div className="flex justify-center">
      <Lottie 
        animationData={WallELottie} 
        className=" w-52 h-52  justify-center items-center" // Increased size without circular border
      />
      </div>

      {/* Chatbot Component */}
      <Chatbot />
    </div>
  </div>
)}
{/* Footer */}
<footer className="relative z-10 py-4 bg-blue-950 text-white w-full text-center">
        <p>&copy; 2025 Quizdom. All rights reserved.</p>
      </footer>
</div>
  );
}

