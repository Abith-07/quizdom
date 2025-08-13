import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; // Firebase config
import { collection, addDoc, query, orderBy, onSnapshot, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { format } from "date-fns"; // For formatting dates
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase Storage functions
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify components
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import Lottie from "lottie-react";
import Loading from "../Assets/LoadingLottie.json"; // Import Loading Lottie animation
import Header from "../components/Header";

const Forum = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null); // State to hold the selected image
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [replyingTo, setReplyingTo] = useState(null); // State to track the message being replied to
  const [replyMessage, setReplyMessage] = useState(""); // State to hold the reply message

  const storage = getStorage(); // Initialize Firebase Storage

  // Fetch current user and get register number as username
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Query Firestore to find the user with the matching email
          const usersCollection = collection(db, "users");
          const q = query(usersCollection, where("email", "==", currentUser.email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            // Get the first document that matches
            const userData = querySnapshot.docs[0].data();
            setUser({
              email: currentUser.email,
              uid: currentUser.uid,
              username: userData.registerNumber // Assuming the field is named "registerNumber"
            });
          } else {
            // If no matching user found in Firestore, set user with email and uid only
            setUser({ email: currentUser.email, uid: currentUser.uid, username: "Anonymous" });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch messages from Firestore in real-time
  useEffect(() => {
    const q = query(collection(db, "forum_messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Set loading to false after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  const sendMessage = async () => {
    if ((message.trim() === "" && replyMessage.trim() === "") || !user) {
      toast.error("Message cannot be empty!");
      return;
    }
  
    let imageUrl = "";
    if (image) {
      try {
        const imageRef = ref(storage, `forum_images/${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Error uploading image!");
        return;
      }
    }
  
    try {
      await addDoc(collection(db, "forum_messages"), {
        text: replyMessage || message,
        createdAt: new Date(),
        user: user.username,
        uid: user.uid,
        imageUrl,
        replyingTo: replyingTo ? { user: replyingTo.user, text: replyingTo.text } : null,
      });
      setMessage("");
      setImage(null);
      setReplyingTo(null);
      setReplyMessage("");
      toast.success("Message posted successfully!");
    } catch (error) {
      console.error("Error posting message:", error);
      toast.error("Error posting message!");
    }
  };

  const handleReply = (msg) => {
    setReplyingTo(msg);
    setReplyMessage(`@${msg.user}: `);
  };

  return (
    <div >
      {loading ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <Lottie animationData={Loading} loop={true} style={{ width: 150, height: 150 }} />
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : (
        <div> 
        <Header />
        <div className="flex flex-col w-full bg-gray-100 py-8 px-6">
         
        <h1 className="text-4xl font-bold mt-4 mb-4 text-transparent h-14 bg-clip-text bg-gradient-to-r from-black to-blue-500 shadow-lg mb-6">
              Discussion Forum
            </h1>

          <div className="flex flex-col space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-6 rounded-lg shadow-md space-y-2 ${
                  msg.uid === user?.uid ? "bg-green-100 self-end" : "bg-white self-start"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`text-white font-bold rounded-full h-10 w-10 flex items-center justify-center ${
                    msg.uid === user?.uid ? "bg-green-500" : "bg-blue-500"
                  }`}>
                    {msg.user[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{msg.user}</span>
                    <span className="text-gray-500 text-sm">
                      {format(new Date(msg.createdAt.seconds * 1000), "PPpp")}
                    </span>
                  </div>
                </div>
                {msg.replyingTo && (
                  <div className="bg-gray-100 p-2 rounded mt-2">
                    <span className="font-bold">{msg.replyingTo.user}:</span>
                    <span className="text-gray-700"> {msg.replyingTo.text}</span>
                  </div>
                )}
                <p className="text-gray-700">{msg.text}</p>
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="Uploaded" className="mt-2 max-w-xs rounded" />
                )}
                <button
                  onClick={() => handleReply(msg)}
                  className="mt-2 text-blue-500 hover:underline"
                >
                  Reply
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white p-4 rounded-lg shadow-lg">
            <textarea
              value={replyingTo ? replyMessage : message}
              onChange={(e) => replyingTo ? setReplyMessage(e.target.value) : setMessage(e.target.value)}
              placeholder="Ask a question or share your thoughts..."
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="mt-4 border border-gray-300 rounded p-2"
            />
            <button
              onClick={sendMessage}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
            >
              Post
            </button>
          </div>

          <ToastContainer />
        </div>
        </div>
      )}
    </div>
  );
};

export default Forum;
