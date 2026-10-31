const formatadorPreco = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

const filtrosCardapio = document.getElementById('menuFilters');
const produtosCardapio = document.getElementById('menuProducts');
const statusCardapio = document.getElementById('menuStatus');
const contadorProdutos = document.getElementById('productCount');
let produtos = [];
let categoriaSelecionada = 'Todos';

function validarProduto(produto) {
    return produto
        && (typeof produto.id === 'number' || typeof produto.id === 'string')
        && typeof produto.nome === 'string'
        && typeof produto.descricao === 'string'
        && (produto.preco === null || (typeof produto.preco === 'number' && Number.isFinite(produto.preco)))
        && typeof produto.categoria === 'string'
        && typeof produto.disponivel === 'boolean'
        && (produto.imagem === null || typeof produto.imagem === 'string')
        && (produto.opcoes === undefined || (
            Array.isArray(produto.opcoes)
            && produto.opcoes.every(opcao => typeof opcao.nome === 'string'
                && typeof opcao.preco === 'number'
                && Number.isFinite(opcao.preco))
        ));
}

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
}

function criarPlaceholder(nome) {
    const placeholder = criarElemento('div', 'product-placeholder');
    placeholder.setAttribute('role', 'img');
    placeholder.setAttribute('aria-label', `Foto de ${nome} não cadastrada`);

    const icone = document.createElement('i');
    icone.className = 'fas fa-cake-candles';
    icone.setAttribute('aria-hidden', 'true');
    placeholder.append(icone, criarElemento('span', '', 'Foto em breve'));
    return placeholder;
}

function criarImagemProduto(produto) {
    const moldura = criarElemento('div', 'product-image');

    if (!produto.imagem) {
        moldura.appendChild(criarPlaceholder(produto.nome));
        return moldura;
    }

    const imagem = document.createElement('img');
    imagem.src = produto.imagem;
    imagem.alt = produto.nome;
    imagem.loading = 'lazy';
    imagem.decoding = 'async';
    imagem.addEventListener('error', () => {
        moldura.replaceChildren(criarPlaceholder(produto.nome));
    }, { once: true });
    moldura.appendChild(imagem);
    return moldura;
}

function formatarPrecoProduto(produto) {
    if (produto.preco === null) return 'Consulte o valor';

    const preco = formatadorPreco.format(produto.preco);
    return produto.opcoes?.length ? `A partir de ${preco}` : preco;
}

function criarDetalhesOpcoes(produto) {
    if (!produto.opcoes?.length) return null;

    const lista = criarElemento('ul', 'product-options');
    produto.opcoes.forEach(opcao => {
        const item = criarElemento('li');
        item.append(
            criarElemento('span', '', opcao.nome),
            criarElemento('span', '', formatadorPreco.format(opcao.preco))
        );
        lista.appendChild(item);
    });
    return lista;
}

function criarBotaoEncomenda(produto) {
    if (!produto.disponivel) {
        const indisponivel = criarElemento('button', 'product-order is-unavailable', 'Indisponível');
        indisponivel.type = 'button';
        indisponivel.disabled = true;
        return indisponivel;
    }

    const mensagem = `Olá! Gostaria de fazer uma encomenda do ${produto.nome}.`;
    const link = criarElemento('a', 'product-order');
    const icone = document.createElement('i');
    icone.className = 'fab fa-whatsapp';
    icone.setAttribute('aria-hidden', 'true');

    link.href = montarUrlWhatsapp(mensagem);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.append(document.createTextNode('Fazer encomenda '), icone);
    return link;
}

function criarCardProduto(produto) {
    const card = criarElemento('article', 'product-card');
    const conteudo = criarElemento('div', 'product-content');
    const categoria = criarElemento('span', 'product-category', produto.categoria);
    const titulo = criarElemento('h3', '', produto.nome);
    const descricao = criarElemento(
        'p',
        'product-description',
        produto.descricao || 'Consulte os detalhes deste produto ao fazer sua encomenda.'
    );
    const preco = criarElemento('p', 'product-price', formatarPrecoProduto(produto));

    card.appendChild(criarImagemProduto(produto));
    conteudo.append(categoria, titulo, descricao, preco);

    const opcoes = criarDetalhesOpcoes(produto);
    if (opcoes) conteudo.appendChild(opcoes);

    card.append(conteudo, criarBotaoEncomenda(produto));
    if (!produto.disponivel) card.classList.add('is-unavailable');
    return card;
}

function exibirMensagem(texto, tipo = '') {
    statusCardapio.textContent = texto;
    statusCardapio.className = `menu-status${tipo ? ` is-${tipo}` : ''}`;
    statusCardapio.hidden = false;
}

function criarFiltros() {
    const categorias = [...new Set(produtos.map(produto => produto.categoria))]
        .sort((a, b) => a.localeCompare(b, 'pt-BR'));

    filtrosCardapio.replaceChildren();
    ['Todos', ...categorias].forEach(categoria => {
        const botao = criarElemento('button', 'menu-filter', categoria);
        botao.type = 'button';
        botao.dataset.category = categoria;
        botao.setAttribute('aria-pressed', String(categoria === categoriaSelecionada));
        if (categoria === categoriaSelecionada) botao.classList.add('is-active');
        botao.addEventListener('click', () => {
            categoriaSelecionada = categoria;
            filtrosCardapio.querySelectorAll('.menu-filter').forEach(filtro => {
                const ativo = filtro.dataset.category === categoriaSelecionada;
                filtro.classList.toggle('is-active', ativo);
                filtro.setAttribute('aria-pressed', String(ativo));
            });
            renderizarProdutos();
        });
        filtrosCardapio.appendChild(botao);
    });
}

function renderizarProdutos() {
    const filtrados = categoriaSelecionada === 'Todos'
        ? produtos
        : produtos.filter(produto => produto.categoria === categoriaSelecionada);

    produtosCardapio.replaceChildren(...filtrados.map(criarCardProduto));
    contadorProdutos.textContent = `${filtrados.length} ${filtrados.length === 1 ? 'produto' : 'produtos'}`;
    produtosCardapio.setAttribute('aria-busy', 'false');

    if (filtrados.length === 0) {
        exibirMensagem('Não há produtos cadastrados nesta categoria no momento.');
        return;
    }

    statusCardapio.hidden = true;
}

async function carregarProdutos() {
    try {
        const resposta = await fetch('data/bolos.json');
        if (!resposta.ok) {
            throw new Error(`O arquivo de produtos respondeu com status ${resposta.status}.`);
        }

        const dados = await resposta.json();
        if (!dados || !Array.isArray(dados.bolos) || !dados.bolos.every(validarProduto)) {
            throw new Error('O arquivo de produtos não contém uma lista válida de bolos.');
        }

        produtos = dados.bolos;
        criarFiltros();
        if (produtos.length === 0) {
            produtosCardapio.replaceChildren();
            contadorProdutos.textContent = '0 produtos';
            produtosCardapio.setAttribute('aria-busy', 'false');
            exibirMensagem('Nosso cardápio está sendo atualizado. Em breve teremos novidades.');
            return;
        }

        renderizarProdutos();
    } catch (erro) {
        console.error('Não foi possível carregar o cardápio:', erro);
        produtosCardapio.replaceChildren();
        produtosCardapio.setAttribute('aria-busy', 'false');
        contadorProdutos.textContent = '';
        exibirMensagem('Não foi possível carregar o cardápio agora. Tente novamente mais tarde.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', carregarProdutos);