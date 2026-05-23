// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA_JmrGtPFMH3-6xdExARQxXWPd4Hj2k4Q",
  authDomain: "bolos-margarete.firebaseapp.com",
  databaseURL: "https://bolos-margarete-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bolos-margarete",
  storageBucket: "bolos-margarete.firebasestorage.app",
  messagingSenderId: "311399448070",
  appId: "1:311399448070:web:9bd158a892c0710b8c8d87"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Torna o banco de dados disponível para o seu script.js
const db = firebase.database();