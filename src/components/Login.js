import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from "firebase/auth";

import Lottie from 'lottie-react';  
import LoginLottie from '../Assets/login_Lottie.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const submit = async () => {
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email is required');
      toast.error('Email is required');
      return;
    } else if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      toast.error('Invalid email format');
      return;
    }

    if (!password) {
      setPasswordError('Password is required');
      toast.error('Password is required');
      return;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        toast.warn('Please verify your email before logging in.');
        return;
      }

      if (user) {
        toast.success('User Login Successfully');
        setTimeout(() => {
          navigate('/homepage');
        }, 2000);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-login-bg bg-cover bg-center'>
      <ToastContainer />
      <div className='w-full max-w-4xl p-8 space-y-6 bg-white bg-opacity-50 backdrop-blur-md rounded-lg shadow-md flex'>
        {/* Lottie Animation on the left */}
        <div className='hidden md:block w-1/2 p-4'>
          <Lottie animationData={LoginLottie} className="w-full h-full" />
        </div>

        {/* Login Form on the right */}
        <div className='w-full md:w-1/2 p-4 space-y-6'>
          <h2 className='text-2xl font-bold text-gray-900'>Login Now</h2>
          <div className='space-y-4'>
            <div>
              <input
                type='email'
                placeholder='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
              {emailError && <p className='text-red-500 text-sm'>{emailError}</p>}
            </div>
            <div>
              <input
                type='password'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
              {passwordError && <p className='text-red-500 text-sm'>{passwordError}</p>}
            </div>
          </div>
          <button
            onClick={submit}
            className='w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          >
            Login
          </button>
          <p className='text-center text-gray-600'>
            Don't Have an Account? <Link to='/register' className='text-indigo-600 hover:underline'>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
