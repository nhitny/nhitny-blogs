import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth"; // Import getAuth đúng cách

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
const db = getFirestore(app);
const auth = getAuth(app);


export { db, auth };
