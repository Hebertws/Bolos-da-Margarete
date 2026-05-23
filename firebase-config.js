// Configuração do Firebase
// ⚠️ IMPORTANTE: Substitua com suas credenciais do Firebase!
// Siga os passos:
// 1. Vá para https://firebase.google.com
// 2. Clique em "Go to console"
// 3. Crie um novo projeto
// 4. Na lateral, clique em "Realtime Database"
// 5. Crie um banco de dados
// 6. Vá em "Project Settings" (engrenagem no topo)
// 7. Copie as credenciais abaixo

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_JmrGtPFMH3-6xdExARQxXWPd4Hj2k4Q",
  authDomain: "bolos-margarete.firebaseapp.com",
  databaseURL: "https://bolos-margarete-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bolos-margarete",
  storageBucket: "bolos-margarete.firebasestorage.app",
  messagingSenderId: "311399448070",
  appId: "1:311399448070:web:9bd158a892c0710b8c8d87"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Obtém referência ao banco de dados
const db = firebase.database();
