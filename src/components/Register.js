import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import Lottie from 'lottie-react';
import RegisterLottie from '../Assets/login_Lottie.json'; // Assuming you have a separate Lottie file for registration

// Toastify imports
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');

  const navigate = useNavigate();

  const submit = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: registerNumber });
      await sendEmailVerification(user);

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        registerNumber,
      });

      await setDoc(doc(db, "leaderboard", user.uid), {
        name: registerNumber,
        points: 0,
      });

      toast.success('Registration successful! Please check your email to verify your account.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-register-bg bg-cover bg-center'>
      <div className='w-full max-w-4xl p-8 space-y-6 bg-white bg-opacity-50 backdrop-blur-md rounded-lg shadow-md flex'>
        {/* Lottie Animation on the left */}
        <div className='hidden md:block w-1/2 p-4'>
          <Lottie animationData={RegisterLottie} className="w-full h-full" />
        </div>

        {/* Register Form on the right */}
        <div className='w-full md:w-1/2 p-4 space-y-6'>
          <h2 className='text-2xl font-bold text-gray-900'>Register Now</h2>
          <div className='space-y-4'>
            <input
              type='text'
              placeholder='User Name'
              value={registerNumber}
              onChange={(e) => setRegisterNumber(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
            <input
              type='email'
              placeholder='Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
            <input
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </div>
          <button
            onClick={submit}
            className='w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          >
            Register
          </button>
          <p className='text-center text-gray-600'>
            Already Have an Account? <Link to='/login' className='text-indigo-600 hover:underline'>Login</Link>
          </p>
        </div>
      </div>

      {/* Toastify Container */}
      <ToastContainer />
    </div>
  );
};

export default Register;
