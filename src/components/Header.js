import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { CgProfile } from "react-icons/cg";
import { auth, storage } from '../firebase';
import { onAuthStateChanged } from "firebase/auth";
import { getDownloadURL, ref } from "firebase/storage";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null); // Store the profile image

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    // Fetch the authenticated user
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch profile image from Firebase Storage
        const imageRef = ref(storage, `userphoto/${currentUser.uid}`);
        getDownloadURL(imageRef)
          .then((url) => {
            setProfileImage(url); // Set profile image URL
          })
          .catch(() => {
            // If no image is found, you can keep the default or handle the error
            setProfileImage(null);
          });
      } else {
        setUser(null);
        setProfileImage(null); // Reset the profile image if not logged in
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <header
      id="Header"
      className="flex justify-between px-4 py-4 bg-blue-950 border-2 border-black items-center"
    >
      <h1 className="font-bold text-lg text-white">Quizdom</h1>
      <nav className="hidden md:flex gap-4 px-10">
        <a href="/homepage" className="text-white hover:bg-white hover:text-black rounded-lg p-1 transition-colors duration-300">
          Home
        </a>
        {/* <a href="/homepage" className="text-white hover:bg-white hover:text-black rounded-lg p-1 transition-colors duration-300">
          Quiz
        </a>
        <a href="/leaderboard" className="text-white hover:bg-white hover:text-black rounded-lg p-1 transition-colors duration-300">
          LeaderBoard
        </a>
        <a href="/forum" className="text-white hover:bg-white hover:text-black rounded-lg p-1 transition-colors duration-300">
          Forum
        </a>
        <a href="#Projects" className="text-white hover:bg-white hover:text-black rounded-lg p-1 transition-colors duration-300">
          About
        </a> */}
        <a href="/profile">
          {/* Show user's profile image or default icon */}
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <CgProfile size={28} className="text-white" />
          )}
        </a>
      </nav>
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
              <a
                href="/homepage"
                className="text-white text-sm my-2"
                onClick={toggleMenu}
              >
                Home
              </a>
              <a
                href="/homepage"
                className="text-white text-sm my-2"
                onClick={toggleMenu}
              >
                Quiz
              </a>
              <a
                href="/leaderboard"
                className="text-white text-sm my-2"
                onClick={toggleMenu}
              >
                LeaderBoard
              </a>
              <a
                href="#Projects"
                className="text-white text-sm my-2"
                onClick={toggleMenu}
              >
                About
              </a>
              <a
                href="/profile"
                className="text-white text-sm my-2"
                onClick={toggleMenu}
              >
                {/* Show user's profile image or default icon */}
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <CgProfile size={20} className="text-white" />
                )}
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
