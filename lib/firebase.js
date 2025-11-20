// Importe apenas os módulos necessários do SDK do Firebase
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; // Opcional, se você quiser usar Analytics

// Suas configurações do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAHMWBsDXLSfKKcQxl2PGihbh0xvT1M0AE",
  authDomain: "taskflow-project-2e8f7.firebaseapp.com",
  projectId: "taskflow-project-2e8f7",
  storageBucket: "taskflow-project-2e8f7.firebasestorage.app",
  messagingSenderId: "962414566552",
  appId: "1:962414566552:web:c62b0d68c4f93dcb61c4ed",
  measurementId: "G-6LHSRJ999M" // Opcional
};

// Inicialize o Firebase
// Isso evita que o Firebase seja inicializado várias vezes no ambiente Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
// const analytics = getAnalytics(app); // Opcional

export { app, auth, db }; // Exporte o app, auth e db para uso em outros arquivos