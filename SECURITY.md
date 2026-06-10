# 🔒 Guia de Segurança - Site Bolos da Margarete

## Vulnerabilidades Corrigidas

### 1. ✅ XSS (Cross-Site Scripting)
**Status:** CORRIGIDO
- Removido uso de `innerHTML` com template literals
- Substituído por `textContent` e `createElement` para criação segura de elementos
- Adicionada função `sanitizarEntrada()` que escapa caracteres perigosos

**O que foi feito:**
```javascript
// ❌ ANTES (vulnerável)
div.innerHTML = `<span class="nome">${item.nome}</span>`;

// ✅ DEPOIS (seguro)
const span = document.createElement('span');
span.textContent = item.nome;
```

### 2. ✅ Validação de Entrada
**Status:** IMPLEMENTADO
- Limite de tamanho para Nome (100 caracteres)
- Validação de Telefone (mínimo 10 dígitos)
- Limite para Endereço (200 caracteres)
- Limite para Observações (500 caracteres)
- Limite para Comentários (240 caracteres)

### 3. ✅ Sanitização de Dados
**Status:** IMPLEMENTADO
- Função `sanitizarEntrada()` escapa:
  - `<` → `&lt;`
  - `>` → `&gt;`
  - `"` → `&quot;`
  - `'` → `&#x27;`
  - `/` → `&#x2F;`

---

## ⚠️ Problemas Remanescentes (Requerem Ação da Mãe)

### 1. Credenciais Expostas no Código
**Risco:** MÉDIO

As chaves do Firebase estão visíveis no código frontend (`firebase-config.js`).

**Como mitigar:**
1. Abra o Google Cloud Console
2. Vá para: APIs & Services → Credentials
3. Configure "API key restrictions":
   - Deixe apenas "Realtime Database" habilitado
   - Restrinja por domínio: `seudominio.com`

**Comando para verificar:**
```bash
grep -n "apiKey" firebase-config.js
```

### 2. Regras de Segurança do Firebase
**Risco:** MÉDIO

Configure regras de segurança no Firebase Console:

```json
{
  "rules": {
    "avaliacoes": {
      ".read": true,
      ".write": "!root.child('avaliacoes').hasChild(auth.uid)",
      "$avaliacaoId": {
        ".validate": "newData.hasChildren(['nome', 'bolo', 'estrelas', 'comentario', 'createdAt'])",
        "nome": {
          ".validate": "newData.isString() && newData.val().length <= 100"
        },
        "comentario": {
          ".validate": "newData.isString() && newData.val().length <= 240"
        },
        "estrelas": {
          ".validate": "newData.isNumber() && newData.val() >= 1 && newData.val() <= 5"
        }
      }
    }
  }
}
```

### 3. HTTPS Obrigatório
**Risco:** ALTO

Sempre acesse o site via HTTPS (nunca HTTP).

**Como verificar:**
- Seu domínio deve ter certificado SSL
- Use Let's Encrypt (gratuito) se hospedado em servidor próprio

### 4. Google Sheets - Permissões
**Risco:** MÉDIO

A planilha que recebe os pedidos deve ter permissões restritas:

1. Abra o Google Sheet
2. Clique em "Compartilhar"
3. Configure para: **Apenas você tem acesso**
4. Adicione o email do Google Apps Script como colaborador (se necessário)

---

## 🔐 Recomendações Adicionais

### 1. Rate Limiting
O site possui proteção básica contra spam:
- Limite de 1 avaliação por minuto por navegador (localStorage)

### 2. Campo Anti-spam
Há um campo oculto `avalSite` que detecta bots automáticos.

### 3. Validação no Servidor
**PRÓXIMA ETAPA (não implementada):**
- Criar backend próprio para validar/filtrar dados antes de enviar ao Google Sheets
- Implementar CORS (Cross-Origin Resource Sharing)
- Adicionar rate limiting no backend

---

## 📋 Checklist de Segurança

- [ ] Certificado SSL/HTTPS configurado
- [ ] Firebase API key restringida por domínio
- [ ] Regras de segurança do Firebase configuradas
- [ ] Google Sheets com permissões restritas
- [ ] Testar XSS: Tentar enviar `<script>alert('xss')</script>` em um campo
- [ ] Testar validação: Tentar enviar telefone inválido

---

## 🚨 Como Reportar Vulnerabilidades

Se encontrar uma vulnerabilidade, **NÃO publica publicamente**:

1. Documente o problema
2. Envie por email privado
3. Aguarde resposta antes de divulgar

---

## 📚 Recursos Úteis

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

---

**Última atualização:** 2026-06-09
**Status:** ✅ Melhorias aplicadas
