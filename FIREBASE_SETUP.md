# 🚀 Guia de Configuração Firebase + Netlify

## 1️⃣ **Criar Projeto no Firebase**

1. Acesse https://firebase.google.com
2. Clique em **"Go to console"** ou "Ir para console"
3. Clique em **"+ Criar projeto"** ou **"+ Add project"**
4. Digite o nome do projeto (ex: "bolos-margarete")
5. Desabilite Analytics (opcional) e clique em **Criar projeto**

## 2️⃣ **Criar Realtime Database**

1. Na lateral esquerda, procure por **"Realtime Database"** ou **"Build" → "Realtime Database"**
2. Clique em **"Criar banco de dados"** ou **"Create Database"**
3. Escolha a localização (ex: América do Sul - Brasil)
4. Selecione **"Começar em modo de testes"** ou **"Start in test mode"** (para começar)
5. Clique em **Habilitar**

## 3️⃣ **Configurar Regras de Segurança**

1. No Realtime Database, vá para a aba **"Regras"**
2. Substitua o conteúdo por:

```json
{
  "rules": {
    "avaliacoes": {
      ".read": true,
      ".write": true,
      "$uid": {
        ".validate": "newData.hasChildren(['nome', 'bolo', 'estrelas', 'comentario', 'data'])"
      }
    }
  }
}
```

3. Clique em **Publicar**

## 4️⃣ **Obter Credenciais do Firebase**

1. Na lateral esquerda, clique na **engrenagem** → **"Project Settings"**
2. Vá para aba **"Geral"**
3. Procure pela seção **"Seus aplicativos"** e clique em **Web** (</> )
4. Se não tiver, clique em **"Registrar um aplicativo"**
5. Copie o config (vai parecer assim):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDnV5_exemplo",
  authDomain: "seu-projeto.firebaseapp.com",
  databaseURL: "https://seu-projeto-default-rtdb.firebaseio.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 5️⃣ **Adicionar Credenciais ao Projeto**

1. Abra o arquivo `firebase-config.js`
2. Substitua a configuração vazia pelas suas credenciais
3. Salve o arquivo

## 6️⃣ **Deploy no Netlify**

### Opção A: Git (Recomendado)

1. Faça push do seu projeto no GitHub:
```bash
git add .
git commit -m "Add Firebase reviews system"
git push
```

2. Acesse https://netlify.com e faça login
3. Clique em **"New site from Git"**
4. Selecione seu repositório
5. Configure:
   - Build command: deixar vazio (site estático)
   - Publish directory: `.` (diretório raiz)
6. Clique em **Deploy**

### Opção B: Drag & Drop

1. Acesse https://netlify.com
2. Arraste a pasta do projeto para a área indicada
3. Pronto! 🎉

## 7️⃣ **Testar as Avaliações**

1. Acesse seu site pelo Netlify
2. Vá até a seção **"Avaliações dos Clientes"**
3. Preencha o formulário e clique em **"Enviar Avaliação"**
4. A avaliação deve aparecer na lista em tempo real!

## ⚙️ **Solução de Problemas**

### "Firebase não configurado"
- Verifique se as credenciais no `firebase-config.js` estão corretas
- Teste se o Realtime Database foi criado
- Abra o console do navegador (F12) e veja os erros

### Avaliações não salvam
- Verifique as regras de segurança do Firebase
- Certifique-se que o modo de testes está habilitado
- Teste no console do Firebase se consegue escrever dados

### CORS Error
- Isso é normal em Firebase
- Certifique-se que as credenciais estão corretas
- O Firebase web SDK lida automaticamente com CORS

## 🔐 **Dica de Segurança**

Quando colocar em produção real:
1. Habilite autenticação (Google, Email, etc)
2. Restricione as regras de segurança
3. Configure domínios permitidos nas configurações do Firebase

## 📚 **Links Úteis**

- Firebase Console: https://console.firebase.google.com
- Netlify: https://netlify.com
- Firebase Docs: https://firebase.google.com/docs

---

✅ **Pronto!** Seu site agora tem avaliações em tempo real com Firebase + Netlify! 🚀
