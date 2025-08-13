import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CgProfile } from "react-icons/cg";

export default function MainHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header
      id="Header"
      className="flex justify-between px-4 py-4 bg-blue-950 border-2 border-black items-center w-full"
    >
      <h1 className="font-bold text-lg text-white">Quizdom</h1>
      <div className="hidden md:flex gap-4">
        {/* Display only Login and Signup buttons in the header for the open page */}
        <Link
          to="/login"
          className="bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-800 hover:shadow-xl transition transform hover:scale-105 duration-300 ease-in-out"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 hover:shadow-xl transition transform hover:scale-105 duration-300 ease-in-out"
        >
          Signup
        </Link>
      </div>
      <div className="md:hidden relative">
        <Bars3Icon
          className="h-6 w-6 text-white cursor-pointer"
          onClick={toggleMenu}
        />
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-black border border-gray-700 rounded-md shadow-lg z-50">
            <XMarkIcon
              className="h-6 w-6 text-white cursor-pointer ml-auto m-2"
              onClick={toggleMenu}
            />
            <nav className="flex flex-col items-start p-2">
              {/* Mobile menu with Login and Signup options */}
              <Link
                to="/login"
                className="text-white text-sm my-2"
                onClick={toggleMenu}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-white text-sm my-2"
                onClick={toggleMenu}
              >
                Signup
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
