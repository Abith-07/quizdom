import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Header from './Header';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalQuizzes: 0,
    totalAttempts: 0,
    totalViolations: 0,
    averageScore: 0,
    violationRate: 0,
    topPerformers: [],
    recentActivity: [],
    quizStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const currentUserId = auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        console.log('Fetching analytics...');
        
        // Fetch all quizzes (for now, show all data)
        const quizzesQuery = query(collection(db, 'created_quiz'));
        const quizzesSnapshot = await getDocs(quizzesQuery);
        const allQuizzes = quizzesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Quizzes found:', allQuizzes.length);
        
        // Fetch all leaderboard entries
        const leaderboardQuery = query(collection(db, 'leaderboard'));
        const leaderboardSnapshot = await getDocs(leaderboardQuery);
        const allAttempts = leaderboardSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Attempts found:', allAttempts.length);
        
        // Use all data for analytics (not filtered by user)
        const userQuizzes = allQuizzes;
        const attempts = allAttempts;
        
        // Calculate analytics
        const totalQuizzes = userQuizzes.length;
        const totalAttempts = attempts.length;
        const violatedAttempts = attempts.filter(attempt => attempt.points === 'violated');
        const totalViolations = attempts.reduce((sum, attempt) => sum + (attempt.violationCount || 0), 0);
        const completedAttempts = attempts.filter(attempt => attempt.points !== 'violated' && typeof attempt.points === 'number');
        const averageScore = completedAttempts.length > 0 
          ? (completedAttempts.reduce((sum, attempt) => sum + attempt.points, 0) / completedAttempts.length).toFixed(1)
          : 0;
        const violationRate = totalAttempts > 0 ? ((violatedAttempts.length / totalAttempts) * 100).toFixed(1) : 0;
        
        // Top performers (completed attempts only)
        const topPerformers = completedAttempts
          .sort((a, b) => b.points - a.points)
          .slice(0, 5)
          .map(attempt => ({
            name: attempt.name,
            score: attempt.points,
            quizCode: attempt.quizCode
          }));
        
        // Recent activity
        const recentActivity = attempts
          .sort((a, b) => new Date(b.createdAt?.toDate?.() || 0) - new Date(a.createdAt?.toDate?.() || 0))
          .slice(0, 10)
          .map(attempt => ({
            name: attempt.name,
            score: attempt.points,
            quizCode: attempt.quizCode,
            violations: attempt.violationCount || 0,
            date: attempt.createdAt?.toDate?.() || new Date()
          }));
        
        // Quiz-specific stats
        const quizStats = userQuizzes.map(quiz => {
          const quizAttempts = attempts.filter(attempt => attempt.quizCode === quiz.quizCode);
          const quizViolated = quizAttempts.filter(attempt => attempt.points === 'violated');
          const quizCompleted = quizAttempts.filter(attempt => attempt.points !== 'violated' && typeof attempt.points === 'number');
          const quizAverageScore = quizCompleted.length > 0 
            ? (quizCompleted.reduce((sum, attempt) => sum + attempt.points, 0) / quizCompleted.length).toFixed(1)
            : 0;
          
          return {
            quizCode: quiz.quizCode,
            subject: quiz.subject,
            topic: quiz.topic,
            totalAttempts: quizAttempts.length,
            violatedAttempts: quizViolated.length,
            averageScore: quizAverageScore,
            violationRate: quizAttempts.length > 0 ? ((quizViolated.length / quizAttempts.length) * 100).toFixed(1) : 0
          };
        });
        
        setAnalytics({
          totalQuizzes,
          totalAttempts,
          totalViolations,
          averageScore,
          violationRate,
          topPerformers,
          recentActivity,
          quizStats
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setError('Failed to load analytics data');
        setLoading(false);
      }
    };

    // Always fetch analytics regardless of auth status
    fetchAnalytics();
  }, [currentUserId]);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center text-red-600">
            <p className="text-xl">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Remove the auth check - show analytics for everyone

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.totalQuizzes}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.totalAttempts}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Violation Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.violationRate}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Score</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.averageScore}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Performers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
              {analytics.topPerformers.length > 0 ? (
                <div className="space-y-3">
                  {analytics.topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{performer.name}</p>
                          <p className="text-sm text-gray-500">Quiz: {performer.quizCode}</p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-green-600">{performer.score}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No completed attempts yet</p>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              {analytics.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {analytics.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{activity.name}</p>
                        <p className="text-sm text-gray-500">
                          {activity.date.toLocaleDateString()} - Quiz: {activity.quizCode}
                        </p>
                        {activity.violations > 0 && (
                          <p className="text-xs text-red-500">Violations: {activity.violations}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-semibold ${
                          activity.score === 'violated' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {activity.score === 'violated' ? 'Violated' : activity.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>

          {/* Quiz Statistics */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Statistics</h3>
            {analytics.quizStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Violated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Violation Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.quizStats.map((quiz, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quiz.quizCode}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quiz.subject}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quiz.topic}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quiz.totalAttempts}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quiz.violatedAttempts}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quiz.averageScore}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quiz.violationRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No quiz statistics available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
