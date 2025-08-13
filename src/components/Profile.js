import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase'; // Ensure storage is exported from firebase.js
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytesResumable, deleteObject } from 'firebase/storage';
import Header from './Header';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { CgProfile } from 'react-icons/cg';
import { AiOutlinePlus, AiOutlineDelete } from 'react-icons/ai';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [quizCount, setQuizCount] = useState(0);
  const [quizData, setQuizData] = useState([]);
  const [quizList, setQuizList] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        sessionStorage.setItem('user', JSON.stringify(currentUser));
        await fetchQuizData(currentUser.uid);
        await fetchProfileImage(currentUser.uid);
      } else {
        setUser(null);
        sessionStorage.removeItem('user');
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchQuizData = async (userId) => {
    try {
      const quizPerformanceRef = collection(db, 'quiz_performance');
      const q = query(quizPerformanceRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      setQuizCount(querySnapshot.size);
      const monthlyQuizData = Array(12).fill(0);
      const quizzes = [];

      querySnapshot.forEach((doc) => {
        const quizData = doc.data();
        const quizDate = quizData.date; 
        const quizMonth = new Date(quizDate.seconds * 1000).getMonth();
        monthlyQuizData[quizMonth] += 1;

        quizzes.push({
          date: new Date(quizDate.seconds * 1000).toLocaleDateString(),
          points: quizData.points,
          score: quizData.score,
        });
      });
      setQuizData(monthlyQuizData);
      setQuizList(quizzes);
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    }
  };

  const fetchProfileImage = async (userId) => {
    try {
      const imageRef = ref(storage, `userphoto/${userId}`);
      const url = await getDownloadURL(imageRef);
      setProfileImage(url);
    } catch (error) {
      console.log('No profile image found:', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    sessionStorage.removeItem('user');
    navigate('/mainhome');
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `userphoto/${user.uid}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setImageUploading(true);

    uploadTask.on(
      'state_changed',
      null,
      (error) => {
        console.error('Error uploading image:', error);
        setImageUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setProfileImage(downloadURL);
          setImageUploading(false);
        });
      }
    );
  };

  const handleImageDelete = async () => {
    const imageRef = ref(storage, `userphoto/${user.uid}`);
    try {
      await deleteObject(imageRef);
      setProfileImage(null);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Quizzes Taken',
        data: quizData,
        fill: true,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div>
      <Header />
      <div className="bg-primary-bg bg-cover bg-fixed min-h-screen flex flex-col items-center py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col w-full max-w-4xl space-y-6">
          {/* First Card: Name and Email */}
          <div className="p-10 bg-white rounded-xl shadow-md flex flex-col items-center">
            {/* Profile Image */}
            <div className="relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <CgProfile className="w-32 h-32 text-gray-400" />
              )}
              
              {/* Upload + Icon */}
              <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-700">
                <AiOutlinePlus className="text-white w-6 h-6" />
                <input type="file" className="hidden" onChange={handleImageUpload} />
              </label>

              {/* Delete Icon */}
              {profileImage && (
                <button
                  onClick={handleImageDelete}
                  className="absolute top-0 right-0 bg-red-500 rounded-full p-2 cursor-pointer hover:bg-red-700"
                >
                  <AiOutlineDelete className="text-white w-6 h-6" />
                </button>
              )}
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Profile</h2>
            </div>
            {user && (
              <div className="mt-8 space-y-6">
                <p className="text-lg font-semibold">Name: {user.displayName || 'User'}</p>
                <p className="text-md text-gray-600">Email: {user.email}</p>
                <button
                  onClick={handleLogout}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Second Card: Graph and Total Quizzes */}
          <div className="p-10 bg-white rounded-xl shadow-md flex flex-col items-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Quiz Performance</h3>
            <p className="text-lg font-semibold mb-4">Total Quizzes Taken: {quizCount}</p>
            <div className="relative w-full h-96">
              <Line data={data} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Third Card: List of Quizzes */}
          <div className="p-10 bg-white rounded-xl shadow-md flex flex-col items-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Quizzes Attended</h3>
            <ul className="space-y-4 w-full">
              {quizList.map((quiz, index) => (
                <li key={index} className="flex justify-between bg-gray-100 p-4 rounded-lg shadow-sm">
                  <div>Date: {quiz.date}</div>
                  <div>Points: {quiz.points}</div>
                  <div>Score: {quiz.score}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
