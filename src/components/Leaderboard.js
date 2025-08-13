import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Header from './Header'; // Assume you have a Header component
import Lottie from "lottie-react";
import Loading from "../Assets/LoadingLottie.json";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Simulate loading for 3 seconds
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Reference to the leaderboard collection
        const leaderboardRef = collection(db, 'leaderboard');
        
        // Query to get all documents and order them by points in descending order
        const q = query(leaderboardRef, orderBy('points', 'desc'));

        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('No data available');
          setLoading(false);
          return;
        }

        // Process the data and assign ranks
        const leaderboardData = querySnapshot.docs.map((doc, index) => ({
          rank: index + 1,
          id: doc.id,
          ...doc.data()
        }));

        setLeaderboard(leaderboardData);
        setLoading(false);
      } catch (error) {
        setError(`Error fetching leaderboard data: ${error.message}`);
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Function to get icon based on rank
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇'; // First place
      case 2:
        return '🥈'; // Second place
      case 3:
        return '🥉'; // Third place
      default:
        return rank;  // Display the rank number for other places
    }
  };

  // Function to set larger text size for top 3 ranks
  const getRankClass = (rank) => {
    if (rank <= 3) {
      return 'text-3xl';  // Larger size for top 3 ranks
    }
    return 'text-sm'; // Default size for other ranks
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Lottie animationData={Loading} className="w-56 h-56" />
      </div>
    );
  }
  
  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      <Header />
      <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full p-10 bg-white rounded-xl shadow-md">
          <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-8">Leaderboard</h2>
          {leaderboard.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-center uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-center uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  text-center uppercase tracking-wider">Points</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((user, index) => (
                    <tr key={index}>
                      <td className={`px-6 py-4 whitespace-nowrap font-medium text-gray-900 ${getRankClass(user.rank)}`}>
                        {getRankIcon(user.rank)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-600">No leaderboard data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
