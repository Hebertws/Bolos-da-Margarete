# 🛡️ Configuração de Segurança - Firebase

## 📝 Configurar Regras de Segurança do Firebase

### Passo 1: Acessar Firebase Console

1. Vá para [console.firebase.google.com](https://console.firebase.google.com)
2. Selecione seu projeto "bolos-margarete"
3. No menu esquerdo, vá para **Realtime Database**
4. Clique na aba **Regras**

### Passo 2: Copiar as Regras de Segurança

Cole o código abaixo na seção de Regras:

```json
{
  "rules": {
    "avaliacoes": {
      ".read": true,
      ".indexOn": ["createdAt"],
      ".write": false,
      "$avaliacaoId": {
        ".validate": "newData.hasChildren(['nome', 'bolo', 'estrelas', 'comentario', 'createdAt'])",
        ".write": "newData.val() !== null && !root.child('avaliacoes').child($avaliacaoId).exists()",
        "id": {
          ".validate": "newData.isString() && newData.val().length > 0"
        },
        "nome": {
          ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 100"
        },
        "bolo": {
          ".validate": "newData.isString() && newData.val().length > 0"
        },
        "estrelas": {
          ".validate": "newData.isNumber() && newData.val() >= 1 && newData.val() <= 5"
        },
        "comentario": {
          ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 240"
        },
        "createdAt": {
          ".validate": "newData.isNumber() && newData.val() > 0"
        },
        "data": {
          ".validate": "newData.isString()"
        }
      }
    }
  }
}
```

### Passo 3: Publicar as Regras

1. Clique em **Publicar**
2. Confirme quando solicitado

---

## 🔐 Restringir API Key do Firebase

### Passo 1: Acessar Google Cloud Console

1. Vá para [console.cloud.google.com](https://console.cloud.google.com)
2. Selecione o projeto "bolos-margarete"

### Passo 2: Encontrar a API Key

1. No menu esquerdo, vá para **APIs & Services** → **Credentials**
2. Procure pela chave que começa com `AIzaSy...` (a mesma do firebase-config.js)
3. Clique nela para editar

### Passo 3: Configurar Restrições

1. Vá para **Application restrictions**
   - Selecione: **HTTP referrers (web sites)**
   - Adicione seu domínio: `seusite.com.br/*`
   - Também adicione: `www.seusite.com.br/*`

2. Vá para **API restrictions**
   - Selecione: **Restrict key**
   - Procure por **Realtime Database API** e ative apenas ela
   - Clique em **Save**

---

## 📊 Verificar Permissões do Google Sheet

1. Abra a planilha que recebe os pedidos
2. Clique em **Compartilhar** (canto superior direito)
3. Mude para: **Compartilhado com apenas você**
4. Se o Apps Script precisa de acesso, use a conta de serviço do Google

---

## ✅ Testar as Mudanças de Segurança

### Teste 1: XSS (Cross-Site Scripting)
1. Vá para a seção de Avaliações
2. No campo "Seu Nome", tente colar: `<img src=x onerror="alert('XSS')">`
3. Resultado esperado: O texto deve aparecer escapado, SEM o alert

### Teste 2: Validação de Telefone
1. Vá para "Fazer Pedido"
2. No campo Telefone, tente: `abc`
3. Resultado esperado: Mensagem de erro: "Telefone inválido"

### Teste 3: Limite de Caracteres
1. No campo "Seu Nome", tente copiar e colar um texto com mais de 100 caracteres
2. Resultado esperado: Será aceito até 100 caracteres

---

## 🚀 Próximas Etapas (Recomendadas)

### Curto Prazo
- [ ] Testar todas as validações listadas acima
- [ ] Verificar que HTTPS está ativado
- [ ] Publicar as regras de segurança do Firebase

### Médio Prazo
- [ ] Considerar adicionar CAPTCHA (reCAPTCHA v3) para proteção contra bots
- [ ] Implementar logging de atividades suspeitas
- [ ] Fazer backup regular do Google Sheet

### Longo Prazo
- [ ] Migrar para um backend próprio (Node.js, Python, etc)
- [ ] Implementar autenticação de usuários
- [ ] Adicionar sistema de moderação para avaliações

---

## 📞 Suporte e Dúvidas

Se tiver dúvidas sobre a configuração do Firebase:
- [Documentação do Firebase](https://firebase.google.com/docs)
- [Security Rules Guide](https://firebase.google.com/docs/rules)

---

**Importante:** As mudanças de segurança foram aplicadas em `script.js`. Teste o site em diferentes navegadores para garantir que tudo funciona corretamente.
