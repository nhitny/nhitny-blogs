import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// import { getAuth } from "firebase/auth"; // Import getAuth đúng cách
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";



const firebaseConfig = {
    apiKey: "AIzaSyCvj6bfGaCC0JMzNvSCXYvuzYNlqtLmU88",
    authDomain: "nhitny-blogs.firebaseapp.com",
    projectId: "nhitny-blogs",
    storageBucket: "nhitny-blogs.firebasestorage.app",
    messagingSenderId: "982379704130",
    appId: "1:982379704130:web:131039e22abf2a5c4de2db",
    measurementId: "G-YLXXTXNBZ1"
};

const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);



export { db, auth , provider, storage};
