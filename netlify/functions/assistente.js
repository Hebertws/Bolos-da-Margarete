export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Método não permitido.' })
    };
  }

  try {
    const { message, history = [] } = JSON.parse(event.body || '{}');

    const contextoLoja = `
Você é o assistente da Bolos da Margarete.
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
  Bolo de Maracujá;
  Bolo de Banana Normal;
  Bolo de Banana Fit.

- Regra de preços:
  Bolos normais custam R$ 20,00.
  Somente bolos com castanha custam R$ 25,00.
  A broa com queijo custa R$ 25,00.
  Bolos no pote custam R$ 5,00.
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
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: contextoLoja },
          ...history.slice(-6),
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'Não consegui responder agora.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Erro ao responder no momento.' })
    };
  }
}