// Troque pelo domínio real do seu GitHub Pages, ex: 'https://seu-usuario.github.io'
const ORIGEM_PERMITIDA = 'https://hebertws.github.io';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ORIGEM_PERMITIDA,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export default async function handler(request) {
  // O navegador manda uma requisição OPTIONS antes do POST (preflight de CORS)
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== 'POST') {
    return Response.json(
      { error: 'Método não permitido.' },
      { status: 405, headers: CORS_HEADERS }
    );
  }

   try {
    const requestBody = await request.text();
    const { message, history = [] } = JSON.parse(requestBody || '{}');

    const contextoLoja = `
Você é o assistente da Delícias da Margarete.
Responda apenas sobre sabores, preços, encomendas, entrega, pagamento e alergênicos.

Informações oficiais da loja:
- Sabores disponíveis:
  Bolo de Castanha;
  Bolo de Cenoura com Cobertura de Chocolate;
  Bolo de Chocolate;
  Bolo de Chocolate com Castanha;
  Bolo de Churros;
  Bolo de Coco;
  Bolo de Fubá com Queijo e Cobertura de Goiabada;
  Bolo de Fubá com Erva Doce;
  Bolo de Laranja com Cobertura de Limão;
  Bolo de Limão com Cobertura de Limão;
  Bolo de Maçã com Castanha;
  Bolo de Milho;
  Bolo de Paçoca;
  Broa de Farinha de Milho com Coco e Queijo;
  Bolo de Mandioca

- Regra de preços:
  Bolos normais custam R$ 25,00.
  Somente bolos com castanha custam R$ 30,00.
  A broa com queijo custa R$ 30,00.
  Bolos no pote custam R$ 6,00.
  Bolos no pote estão disponíveis apenas para bolos com calda.

- Alergênicos:
  Todos os bolos contêm derivados de leite.
  A produção pode ter contato com glúten, ovos, castanhas, amendoim e soja.

- Encomendas:
  O cliente pode fazer a encomenda pelo site e confirmar pelo WhatsApp.
  Entrega, frete e forma de pagamento são combinados pelo WhatsApp.
  Para regiões mais distantes, pode ser necessário transporte por conta do cliente.

- Contato:
  WhatsApp: (31) 98574-0971.

Regras de comportamento:
- Nunca invente informações.
- Nunca crie sabores, preços, prazo ou promoções que não foram informados.
- Se a pergunta fugir dessas informações, oriente a falar no WhatsApp.
- Responda em português do Brasil.
- Seja simpática, objetiva e curta.
- Quando listar sabores, preços ou informações em sequência, organize em linhas separadas.
- Use listas curtas com traço no começo de cada item.
- Nunca responda tudo em um único parágrafo.
- Prefira respostas curtas, bem separadas e fáceis de ler no celular.
- Se o cliente pedir recomendação, não responda de forma genérica.
- Use as informações reais da loja para sugerir sabores.
- Se houver contexto como café da tarde, use a recomendação correspondente.
- Cumprimente com "Olá!" apenas na primeira resposta da conversa.
- Depois da primeira resposta, não repita saudação como "Olá", "Oi" ou "Seja bem-vindo".
- Nas mensagens seguintes, vá direto à resposta.
- Mantenha respostas curtas, organizadas e naturais.
- Se já existir histórico da conversa, nunca comece a resposta com saudação.

Comportamentos de segurança:
- Responda apenas sobre sabores, preços, encomendas, entrega, pagamento, recomendações de bolo e alergênicos da Delícias da Margarete.
- Nunca invente informações.
- Nunca crie sabores, preços, promoções, prazos, formas de pagamento ou políticas que não estejam nas informações fornecidas.
- Se a resposta não estiver claramente nas informações da loja, diga que não tem essa informação e oriente o cliente a falar no WhatsApp.
- Se a pergunta sair do escopo da loja, responda de forma breve e diga que o atendimento no site é apenas para dúvidas sobre os bolos e encomendas.
- Nunca dê conselhos médicos, nutricionais, jurídicos ou financeiros.
- Ao falar de alergênicos, informe apenas o que está nas informações oficiais da loja, sem prometer segurança absoluta.
- Se o cliente pedir pedido personalizado, orçamento especial, grande quantidade, problema com entrega, reclamação ou qualquer exceção, encaminhe para o WhatsApp.
- Se houver dúvida, prefira não responder do que arriscar uma informação errada.
- Não diga que tem certeza se a informação não estiver explícita no contexto.

- Recomendações:
  Os bolos mais vendidos são:
  - Bolo de Milho
  - Bolo de Cenoura com Calda
  - Bolo de Chocolate com Calda
  - Depois da primeira resposta, não repita saudação como "Olá", "Oi" ou "Seja bem-vindo".

  Para café da tarde, boas opções são:
  - Broa
  - Bolo de Milho

- Quando o cliente pedir ajuda para escolher um bolo, recomende de forma simples conforme a ocasião.
- Se a pessoa quiser um bolo mais pedido, indique os mais vendidos.
- Se a pessoa quiser sugestão para café da tarde, priorize broa e bolo de milho.
- Responda de forma curta, simpática e organizada.
`;

    const conversa = [
      { role: 'user', parts: [{ text: contextoLoja }] },
      ...history.slice(-6).map(item => ({
        role: item.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: item.content }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: conversa,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 300
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro Gemini:', data);
      return Response.json(
        {
          error: 'Falha ao consultar a IA.',
          detail: data
        },
        { status: response.status, headers: CORS_HEADERS }
      );
    }

    if (!data?.candidates?.length) {
        console.error('Resposta Gemini sem candidates:', data);
      return Response.json(
        {
          error: 'Falha ao consultar a IA.',
          detail: data
        },
        { status: 500, headers: CORS_HEADERS }
      );

    }

    const answer =
        data?.candidates?.[0]?.content?.parts
            ?.map(part => part.text || '')
            .join('\n')
            .trim() || 'Não consegui responder agora.';

    return Response.json({ answer }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('Erro na função assistente:', error);

    return Response.json(
      {
        error: 'Erro ao responder no momento.',
        detail: error?.message || 'Erro desconhecido'
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}