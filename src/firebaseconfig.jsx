// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdyfjSa7nOC23fYzAMkc8snqrnhLnDuTI",
  authDomain: "flavorfinderfeedback.firebaseapp.com",
  projectId: "flavorfinderfeedback",
  storageBucket: "flavorfinderfeedback.firebasestorage.app",
  messagingSenderId: "1020798096498",
  appId: "1:1020798096498:web:96def282d9607dcf821eeb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export{db , auth};