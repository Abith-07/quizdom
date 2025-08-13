// import React from 'react';
// import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import './App.css';
// import Quiz from './components/Quiz';
// import AiQuiz from './components/AiQuiz';
// import Login from './components/Login';
// import Register from './components/Register';
// import Homepage from './components/Homepage';
// import Profile from './components/Profile';
// import AttendQuiz from './components/AttendQuiz';
// import CreateQuizDashboard from './components/CreateQuizDashboard';
// import LeaderBoard from './components/Leaderboard';
// import QuizPage from './components/QuizPage';
// import EnterQuizCode from './components/EnterQuizCode';
// import MainHome from './components/MainHome';
// import CQuizDashboard from './components/CQuizDashboard';
// import ChatbotQuiz from './components/ChatbotQuiz';
// import ExistingQuiz from './components/ExistingQuiz';
// import QuizDetail from './components/QuizDetail';
// import EditQuiz from './components/EditQuiz';


// function App() {
//   return (
//     <Router>
//       <div className="App">
//         <Routes>
//           <Route path="/" element={<Navigate to="/mainhome" />} />
//           <Route path="/mainhome" element={<MainHome />} />
//           <Route path="/quiz" element={<Quiz />} />
//           <Route path="/homepage" element={<Homepage />} />
//           <Route path="/ai-quiz" element={<AiQuiz />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/profile" element={<Profile />} />
//           <Route path="/attend-quiz" element={<AttendQuiz />} />
//           <Route path="/create-quiz" element={<CreateQuizDashboard />} />
//           <Route path="/cquizdashboard" element={<CQuizDashboard />} />
//           <Route path="/leaderboard" element={<LeaderBoard />} />
//           <Route path="/QuizPage" element={<QuizPage />} />
//           <Route path="/EnterQuizCode" element={<EnterQuizCode/>}/>
//           <Route path="/create-generated-quiz" element={<ChatbotQuiz/>}/>
//           <Route path="/existing-quiz" element={<ExistingQuiz/>}/>
//           <Route path="/quiz-detail" element={<QuizDetail/>}/>
//           <Route path="/edit-quiz/:id" element={<EditQuiz />} />

//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Quiz from './components/Quiz';
import AiQuiz from './components/AiQuiz';
import Login from './components/Login';
import Register from './components/Register';
import Homepage from './components/Homepage';
import Profile from './components/Profile';
import AttendQuiz from './components/AttendQuiz';
import CreateQuizDashboard from './components/CreateQuizDashboard';
import LeaderBoard from './components/Leaderboard';
import QuizPage from './components/QuizPage';
import EnterQuizCode from './components/EnterQuizCode';
import MainHome from './components/MainHome';
import CQuizDashboard from './components/CQuizDashboard';
import ChatbotQuiz from './components/ChatbotQuiz';
import ExistingQuiz from './components/ExistingQuiz';
import QuizDetail from './components/QuizDetail';
import EditQuiz from './components/EditQuiz';
import DiscussionForum from './components/Forum';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/mainhome" />} />
          <Route path="/mainhome" element={<MainHome />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/ai-quiz" element={<AiQuiz />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/attend-quiz" element={<AttendQuiz />} />
          <Route path="/create-quiz" element={<CreateQuizDashboard />} />
          <Route path="/cquizdashboard" element={<CQuizDashboard />} />
          <Route path="/leaderboard" element={<LeaderBoard />} />
          <Route path="/quizpage" element={<QuizPage />} />
          <Route path="/EnterQuizCode" element={<EnterQuizCode />} />
          <Route path="/create-generated-quiz" element={<ChatbotQuiz />} />
          <Route path="/existing-quiz" element={<ExistingQuiz />} />
          <Route path="/quiz-detail" element={<QuizDetail />} />
          <Route path="/edit-quiz/:id" element={<EditQuiz />} /> {/* Dynamic route for EditQuiz */}
          <Route path='/forum' element={<DiscussionForum/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

