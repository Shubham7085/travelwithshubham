import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA7mBhVBjkVoOMn7Haaxj-7cV-q152x-sY",
  authDomain: "travelwithshubham-c9fa9.firebaseapp.com",
  projectId: "travelwithshubham-c9fa9",
  storageBucket: "travelwithshubham-c9fa9.appspot.com",
  messagingSenderId: "390059239223",
  appId: "1:390059239223:web:676d41a95556de2ebadcb2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

