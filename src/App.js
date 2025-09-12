
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
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
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
import QuizAccess from './components/QuizAccess';
import Dashboard from './components/Dashboard';
import TournamentHome from './components/TournamentHome';
import CreateTournament from './components/CreateTournament';
import TournamentCode from './components/TournamentCode';
import JoinTournament from './components/JoinTournament';
import TournamentLobby from './components/TournamentLobby';
import TournamentGame from './components/TournamentGame';
import TournamentResults from './components/TournamentResults';
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
          <Route path="/quiz-access" element={<QuizAccess />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tournament" element={<TournamentHome />} />
          <Route path="/tournament/create" element={<CreateTournament />} />
          <Route path="/tournament/code" element={<TournamentCode />} />
          <Route path="/tournament/join" element={<JoinTournament />} />
          <Route path="/tournament/lobby/:id" element={<TournamentLobby />} />
          <Route path="/tournament/game/:id" element={<TournamentGame />} />
          <Route path="/tournament/results/:id" element={<TournamentResults />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

