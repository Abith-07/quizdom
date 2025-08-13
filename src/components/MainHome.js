import React from "react";
import { Link } from "react-router-dom";
import MHeader from "../components/MainHeader";
import { Carousel } from "flowbite-react";
import Cur1 from "../Assets/cur1.jpeg";
import Cur2 from "../Assets/cur2.jpg";
import Cur3 from "../Assets/cur3.jpg";
import Cur4 from "../Assets/cur4.jpg";
import Cur5 from "../Assets/cur5.jpg";
import Lottie from "lottie-react";
import LottieBG from "../Assets/Bg_Lottie_Mpage.json";

export default function MainHome() {
  return (
    <div className="relative bg-gray-100 min-h-screen flex flex-col items-center">
      {/* Lottie Animation as Full Page Background */}
      <div className="absolute inset-0 z-0">
        <Lottie animationData={LottieBG} className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        {/* Main Header */}
        <div className="relative h-full z-10">
          <MHeader />
        </div>

        <div className="flex-grow flex  bg-transparent flex-col justify-center items-center text-center p-4">
          <div className=" p-6 mb-8 bg-white bg-opacity-10 w-full rounded-lg max-w-4xl mx-4  ">
            <h2 className="text-6xl font-semibold text-white hover:text-black mt-5 mb-4 shadow-white ">Quizdom</h2>
            <p className="text-xl hover:text-black text-white">
            This project aims to develop a quiz generation system that allows users to customize quizzes by questions, subject, and difficulty. It features interactive quizzes, score tracking, a leaderboard for competition, and a discussion forum to enhance learning and promote knowledge sharing.            </p>
          </div>
          </div>

          <div className="flex-grow flex flex-col justify-center items-center text-center p-4">

          {/* Links */}
          <div className="flex gap-4 mb-8">
            <Link
              to="/login"
              className="bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-blue-800 hover:shadow-xl transition transform hover:scale-105 duration-300 ease-in-out animate-fadeInUp delay-400"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-green-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-green-700 hover:shadow-xl transition transform hover:scale-105 duration-300 ease-in-out animate-fadeInUp delay-600"
            >
              Signup
            </Link>
          </div>

          {/* Carousel */}
          <div className="h-56 sm:h-64 xl:h-80 2xl:h-96 w-full max-w-xl">
            <Carousel>
              <img src={Cur1} alt="Quiz Image 1" />
              <img src={Cur2} alt="Quiz Image 2" />
              <img src={Cur3} alt="Quiz Image 3" />
              <img src={Cur4} alt="Quiz Image 4" />
              <img src={Cur5} alt="Quiz Image 5" />
            </Carousel>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 bg-blue-950 text-white w-full text-center">
        <p>&copy; 2025 Quizdom. All rights reserved.</p>
      </footer>
    </div>
  );
}
