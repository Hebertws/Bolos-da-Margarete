// ===== SEGURANÇA =====
// Função para sanitizar strings e evitar XSS
function sanitizarEntrada(texto) {
    if (typeof texto !== 'string') return '';
    return texto
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Função para validar email básico
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Função para validar telefone (apenas números, pelo menos 10 dígitos)
function validarTelefone(telefone) {
    const apenasNumeros = telefone.replace(/\D/g, '');
    return apenasNumeros.length >= 10;
}

// Carrossel
let indiceAtual = 0;
const itensCarrossel = document.querySelectorAll('.galeria-item').length;
let intervaloCarrossel;

// Menu Hamburguês Mobile
function toggleMenuMobile() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('ativo');
}

function fecharMenuMobile() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.remove('ativo');
}

// Sistema de Avaliações (Firebase)
let avaliacaoSelecionada = 0;
const TEMPO_ENTRE_AVALIACOES = 60 * 1000;
const LIMITE_COMENTARIO = 240;

function atualizarEstrelas(starsElements, valor, destacarHover = false) {
    starsElements.forEach((star, index) => {
        const ativa = index < valor;
        star.classList.toggle('ativo', ativa && !destacarHover);
        star.style.color = ativa ? '#ffd700' : '';
    });
}

function atualizarContadorComentario() {
    const comentario = document.getElementById('avalComentario');
    const contador = document.getElementById('contadorComentario');
    if (!comentario || !contador) return;

    contador.textContent = `${comentario.value.length}/${LIMITE_COMENTARIO}`;
}

function formatarDataAvaliacao(timestamp) {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function criarElementoTexto(classe, texto) {
    const elemento = document.createElement('div');
    elemento.className = classe;
    elemento.textContent = texto;
    return elemento;
}

function inicializarAvaliacoes() {
    const starsElements = document.querySelectorAll('#avaliacaoStars i');
    starsElements.forEach(star => {
        star.addEventListener('click', function () {
            avaliacaoSelecionada = parseInt(this.dataset.value, 10);
            document.getElementById('avalEstrelas').value = avaliacaoSelecionada;
            atualizarEstrelas(starsElements, avaliacaoSelecionada);
        });

        star.addEventListener('mouseover', function () {
            atualizarEstrelas(starsElements, parseInt(this.dataset.value, 10), true);
        });
    });

    document.getElementById('avaliacaoStars').addEventListener('mouseleave', function () {
        atualizarEstrelas(starsElements, avaliacaoSelecionada);
    });

    const comentario = document.getElementById('avalComentario');
    if (comentario) {
        comentario.addEventListener('input', atualizarContadorComentario);
        atualizarContadorComentario();
    }

    carregarAvaliacoes();
}

function enviarAvaliacao(event) {
    event.preventDefault();

    const nome = document.getElementById('avalNome').value.trim();
    const bolo = document.getElementById('avalBolo').value;
    const estrelas = document.getElementById('avalEstrelas').value;
    const comentario = document.getElementById('avalComentario').value.trim();
    const campoAntispam = document.getElementById('avalSite').value.trim();
    const btnEnviar = document.getElementById('btnEnviarAvaliacao');
    const ultimaAvaliacao = parseInt(localStorage.getItem('ultimaAvaliacaoEnviada') || '0', 10);

    if (campoAntispam) {
        return;
    }

    if (Date.now() - ultimaAvaliacao < TEMPO_ENTRE_AVALIACOES) {
        alert('Aguarde um pouquinho antes de enviar outra avaliação.');
        return;
    }

    if (!estrelas || estrelas === '0') {
        alert('Selecione uma avaliação em estrelas!');
        return;
    }

    if (!nome || !bolo || !comentario) {
        alert('Preencha seu nome, o bolo e o comentário.');
        return;
    }

    if (nome.length > 100) {
        alert('Nome deve ter no máximo 100 caracteres.');
        return;
    }

    if (comentario.length > LIMITE_COMENTARIO) {
        alert(`O comentário deve ter no máximo ${LIMITE_COMENTARIO} caracteres.`);
        return;
    }

    try {
        const avaliacaoId = Date.now().toString();
        const createdAt = Date.now();
        const avaliacao = {
            id: avaliacaoId,
            nome: sanitizarEntrada(nome),
            bolo: sanitizarEntrada(bolo),
            estrelas: Math.max(1, Math.min(5, parseInt(estrelas, 10))),
            comentario: sanitizarEntrada(comentario),
            createdAt: createdAt,
            data: formatarDataAvaliacao(createdAt)
        };

        btnEnviar.disabled = true;
        btnEnviar.textContent = 'Enviando...';

        db.ref('avaliacoes/' + avaliacaoId).set(avaliacao, function (error) {
            btnEnviar.disabled = false;
            btnEnviar.textContent = 'Enviar Avaliação';

            if (error) {
                alert('Erro ao enviar avaliação. Tente novamente.');
            } else {
                localStorage.setItem('ultimaAvaliacaoEnviada', Date.now().toString());
                alert('Avaliação enviada com sucesso! Obrigado!');
                document.getElementById('formAvaliacao').reset();
                avaliacaoSelecionada = 0;
                atualizarEstrelas(document.querySelectorAll('#avaliacaoStars i'), 0);
                atualizarContadorComentario();
            }
        });
    } catch (error) {
        console.error('Erro:', error);
        btnEnviar.disabled = false;
        btnEnviar.textContent = 'Enviar Avaliação';
        alert('Erro ao enviar avaliação. Configure o Firebase corretamente.');
    }
}

function carregarAvaliacoes() {
    try {
        db.ref('avaliacoes').orderByChild('createdAt').limitToLast(10).on('value', function (snapshot) {
            const container = document.getElementById('listaAvaliacoes');
            container.innerHTML = '';

            const avaliacoes = [];
            snapshot.forEach(function (childSnapshot) {
                avaliacoes.unshift(childSnapshot.val());
            });

            if (avaliacoes.length === 0) {
                container.innerHTML = '';
                const div = document.createElement('div');
                div.className = 'sem-avaliacoes';
                div.textContent = 'Seja o primeiro a avaliar um de nossos bolos!';
                container.appendChild(div);
                return;
            }

            avaliacoes.forEach(avaliacao => {
                const card = document.createElement('div');
                card.className = 'avaliacao-card';

                const header = document.createElement('div');
                header.className = 'avaliacao-header';

                const info = document.createElement('div');
                info.appendChild(criarElementoTexto('avaliacao-nome', avaliacao.nome || 'Cliente'));
                info.appendChild(criarElementoTexto('avaliacao-bolo', `Bolo: ${avaliacao.bolo || 'Não informado'}`));

                const resumo = document.createElement('div');
                resumo.appendChild(criarElementoTexto('avaliacao-stars-display', '⭐'.repeat(avaliacao.estrelas || 0)));
                resumo.appendChild(criarElementoTexto('avaliacao-data', avaliacao.data || 'Data não informada'));

                header.appendChild(info);
                header.appendChild(resumo);

                card.appendChild(header);
                card.appendChild(criarElementoTexto('avaliacao-comentario', avaliacao.comentario || ''));

                container.appendChild(card);
            });
        });
    } catch (error) {
        console.log('Firebase não configurado. Configure com suas credenciais para ativar avaliações.');
        const mensagem = document.createElement('div');
        mensagem.className = 'sem-avaliacoes';
        mensagem.textContent = 'Avaliações temporariamente indisponíveis.';
        document.getElementById('listaAvaliacoes').innerHTML = '';
        document.getElementById('listaAvaliacoes').appendChild(mensagem);
    }
}

function inicializarIndicadores() {
    const container = document.getElementById('indicadores');
    container.innerHTML = '';
    for (let i = 0; i < itensCarrossel; i++) {
        const indicador = document.createElement('div');
        indicador.className = `indicador ${i === 0 ? 'ativo' : ''}`;
        indicador.onclick = () => irParaSlide(i);
        container.appendChild(indicador);
    }
}

function atualizarCarrossel() {
    const carrossel = document.getElementById('carrossel');
    carrossel.style.transform = `translateX(-${indiceAtual * 100}%)`;

    document.querySelectorAll('.indicador').forEach((ind, i) => {
        ind.classList.toggle('ativo', i === indiceAtual);
    });
}

function reiniciarIntervalo() {
    clearInterval(intervaloCarrossel);
    intervaloCarrossel = setInterval(() => {
        moveCarrossel(1);
    }, 8000);
}

function moveCarrossel(direcao) {
    indiceAtual += direcao;

    if (indiceAtual >= itensCarrossel) {
        indiceAtual = 0;
    } else if (indiceAtual < 0) {
        indiceAtual = itensCarrossel - 1;
    }

    atualizarCarrossel();
    reiniciarIntervalo();
}

function irParaSlide(indice) {
    indiceAtual = indice;
    atualizarCarrossel();
    reiniciarIntervalo();
}

// Inicializar carrossel
inicializarIndicadores();
reiniciarIntervalo();

// Busca/Filtro do Cardápio
function filtrarCardapio() {
    const termoBusca = document.getElementById('buscaInput').value.toLowerCase();
    const itens = document.querySelectorAll('.cardapio-item');
    let encontrados = 0;

    itens.forEach(item => {
        const nome = item.querySelector('.item-nome').textContent.toLowerCase();
        if (nome.includes(termoBusca)) {
            item.classList.remove('oculto');
            encontrados++;
        } else {
            item.classList.add('oculto');
        }
    });

    const info = document.getElementById('buscaInfo');
    if (termoBusca === '') {
        info.textContent = '';
    } else {
        info.textContent = encontrados === 0
            ? 'Nenhum bolo encontrado'
            : `${encontrados} bolo(s) encontrado(s)`;
    }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

const WHATSAPP_NUMERO = '5531985740971';

function montarUrlWhatsapp(mensagem) {
    return `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMERO}&text=${encodeURIComponent(mensagem)}`;
}

function abrirWhatsapp(mensagem, janelaExistente = null) {
    const urlWhatsapp = montarUrlWhatsapp(mensagem);

    if (janelaExistente && !janelaExistente.closed) {
        janelaExistente.location.href = urlWhatsapp;
        return;
    }

    const janela = window.open(urlWhatsapp, '_blank');

    if (!janela) {
        window.location.href = urlWhatsapp;
    }
}

// Redirecionar para WhatsApp
function redirecionarWhatsapp() {
    abrirWhatsapp('Olá Margarete! Gostaria de fazer um pedido de bolo, palha italiana ou ambos.');
}

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.cardapio-item').forEach(item => {
    item.style.opacity = '0';
    observer.observe(item);
});

// Galeria Completa
function toggleGaleriaCompleta() {
    const galeria = document.getElementById('galeriaCompleta');
    galeria.classList.toggle('oculta');

    if (!galeria.classList.contains('oculta')) {
        galeria.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// ===== Lightbox de Imagem =====
let lightboxImagens = [];
let lightboxIndiceAtual = 0;

function construirListaLightbox() {
    lightboxImagens = [];

    // Imagens do carrossel
    document.querySelectorAll('.galeria-item').forEach(item => {
        const img = item.querySelector('img');
        const titulo = item.querySelector('h3');
        if (img) {
            lightboxImagens.push({ src: img.src, alt: img.alt, titulo: titulo ? titulo.textContent : '' });
        }
    });

    // Imagens da galeria completa (grid)
    document.querySelectorAll('.galeria-grid-item').forEach(item => {
        const img = item.querySelector('img');
        const titulo = item.querySelector('h4');
        if (img) {
            lightboxImagens.push({ src: img.src, alt: img.alt, titulo: titulo ? titulo.textContent : '' });
        }
    });
}

function abrirLightbox(src, titulo) {
    construirListaLightbox();

    // Encontrar índice da imagem clicada
    const idx = lightboxImagens.findIndex(img => img.src === src);
    lightboxIndiceAtual = idx >= 0 ? idx : 0;

    exibirLightbox();
    document.getElementById('modalLightbox').classList.add('ativo');
    document.body.style.overflow = 'hidden';
}

function exibirLightbox() {
    const item = lightboxImagens[lightboxIndiceAtual];
    if (!item) return;
    document.getElementById('lightboxImg').src = item.src;
    document.getElementById('lightboxImg').alt = item.alt;
    document.getElementById('lightboxTitulo').textContent = item.titulo;
}

function fecharLightbox() {
    document.getElementById('modalLightbox').classList.remove('ativo');
    document.body.style.overflow = '';
}

function navegarLightbox(direcao) {
    lightboxIndiceAtual += direcao;
    if (lightboxIndiceAtual >= lightboxImagens.length) lightboxIndiceAtual = 0;
    if (lightboxIndiceAtual < 0) lightboxIndiceAtual = lightboxImagens.length - 1;
    exibirLightbox();
}

// Fechar ao clicar fora da imagem
const modalLightbox = document.getElementById('modalLightbox');
if (modalLightbox) {
    modalLightbox.addEventListener('click', function (e) {
        if (e.target === this) fecharLightbox();
    });
}

// Fechar com tecla Esc, navegar com setas
document.addEventListener('keydown', function (e) {
    const lightbox = document.getElementById('modalLightbox');
    if (!lightbox || !lightbox.classList.contains('ativo')) return;
    if (e.key === 'Escape') fecharLightbox();
    if (e.key === 'ArrowRight') navegarLightbox(1);
    if (e.key === 'ArrowLeft') navegarLightbox(-1);
});

// Vincular clique nas imagens do carrossel
document.querySelectorAll('.galeria-item img').forEach(img => {
    img.addEventListener('click', function (e) {
        e.stopPropagation();
        abrirLightbox(this.src, this.alt);
    });
});

// Vincular clique nas imagens da galeria completa (grid)
document.querySelectorAll('.galeria-grid-item img').forEach(img => {
    img.addEventListener('click', function (e) {
        e.stopPropagation();
        abrirLightbox(this.src, this.alt);
    });
});

// Sistema de Encomenda
const bolosData = [
    { nome: 'Palha Italiana Tradicional', preco: 6.00, categoria: 'palha' },
    { nome: 'Palha Italiana Ninho', preco: 6.00, categoria: 'palha' },
    { nome: 'Palha Italiana Oreo', preco: 6.00, categoria: 'palha' },
    { nome: 'Bolo de Castanha', preco: 30.00, categoria: 'sem-calda' },
    { nome: 'Bolo de Cenoura com Cobertura de Chocolate', preco: 25.00, categoria: 'com-calda' },
    { nome: 'Bolo de Cenoura com Cobertura de Chocolate - No Pote', preco: 6.00, categoria: 'no-pote' },
    { nome: 'Bolo de Chocolate', preco: 25.00, categoria: 'com-calda' },
    { nome: 'Bolo de Chocolate - No Pote', preco: 6.00, categoria: 'no-pote' },
    { nome: 'Bolo de Chocolate com Castanha', preco: 30.00, categoria: 'com-calda' },
    { nome: 'Bolo de Chocolate com Castanha - No Pote', preco: 6.00, categoria: 'no-pote' },
    { nome: 'Bolo de Churros', preco: 25.00, categoria: 'com-calda' },
    { nome: 'Bolo de Churros - No Pote', preco: 6.00, categoria: 'no-pote' },
    { nome: 'Bolo de Coco', preco: 25.00, categoria: 'com-calda' },
    { nome: 'Bolo de Coco - No Pote', preco: 6.00, categoria: 'no-pote' },
    { nome: 'Bolo de Fubá com Queijo e Cobertura de Goiabada', preco: 25.00, categoria: 'com-calda' },
    { nome: 'Bolo de Fubá com Queijo e Cobertura de Goiabada - No Pote', preco: 6.00, categoria: 'no-pote' },
    { nome: 'Bolo de Fubá com Erva Doce', preco: 25.00, categoria: 'sem-calda' },
    { nome: 'Bolo de Laranja com Cobertura de Limão', preco: 25.00, categoria: 'com-calda' },
    { nome: 'Bolo de Laranja com Cobertura de Limão - No Pote', preco: 6.00, categoria: 'no-pote' },
    { nome: 'Bolo de Limão com Cobertura de Limão', preco: 25.00, categoria: 'com-calda' },
    { nome: 'Bolo de Limão com Cobertura de Limão - No Pote', preco: 6.00, categoria: 'no-pote' },
    { nome: 'Bolo de Maçã com Castanha', preco: 30.00, categoria: 'sem-calda' },
    { nome: 'Bolo de Milho', preco: 25.00, categoria: 'sem-calda' },
    { nome: 'Bolo de Paçoca', preco: 25.00, categoria: 'com-calda' },
    { nome: 'Bolo de Paçoca - No Pote', preco: 6.00, categoria: 'no-pote' },
    { nome: 'Broa de Farinha de Milho com Coco e Queijo', preco: 30.00, categoria: 'sem-calda' },
    { nome: 'Bolo de Mandioca', preco: 25.00, categoria: 'sem-calda' }
];

let pedidoAtual = {};

function formatarValorPedido(valor) {
    return valor.toFixed(2).replace('.', ',');
}

function inicializarEncomenda() {
    const container = document.getElementById('bolosSelecao');
    if (!container) return;

    container.innerHTML = '';

    bolosData.forEach((bolo, index) => {
        const div = document.createElement('div');
        div.className = 'bolo-item';
        div.setAttribute('data-categoria', bolo.categoria);
        div.setAttribute('data-nome', bolo.nome.toLowerCase());

        const nomeBolo = document.createElement('span');
        nomeBolo.className = 'bolo-nome';
        nomeBolo.textContent = bolo.nome;

        const precoBolo = document.createElement('span');
        precoBolo.className = 'bolo-preco';
        precoBolo.textContent = `R$ ${formatarValorPedido(bolo.preco)}`;

        const controleQuantidade = document.createElement('div');
        controleQuantidade.className = 'controle-quantidade';

        const btnMenos = document.createElement('button');
        btnMenos.type = 'button';
        btnMenos.className = 'qtd-btn qtd-btn-menos';
        btnMenos.setAttribute('aria-label', `Diminuir quantidade de ${bolo.nome}`);
        btnMenos.textContent = '−';

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'quantidade-input';
        input.min = '0';
        input.max = '99';
        input.value = '0';
        input.dataset.index = index;
        input.placeholder = '0';
        input.inputMode = 'numeric';

        const btnMais = document.createElement('button');
        btnMais.type = 'button';
        btnMais.className = 'qtd-btn qtd-btn-mais';
        btnMais.setAttribute('aria-label', `Aumentar quantidade de ${bolo.nome}`);
        btnMais.textContent = '+';

        controleQuantidade.appendChild(btnMenos);
        controleQuantidade.appendChild(input);
        controleQuantidade.appendChild(btnMais);

        div.appendChild(nomeBolo);
        div.appendChild(precoBolo);
        div.appendChild(controleQuantidade);

        const carregarQuantidadeAtual = function () {
            if (pedidoAtual[index]) {
                input.value = pedidoAtual[index].quantidade;
                div.classList.toggle('selecionado', pedidoAtual[index].quantidade > 0);
            } else {
                input.value = '0';
                div.classList.remove('selecionado');
            }
        };

        const atualizarQuantidade = function (normalizarCampo = false) {
            const qtd = parseInt(input.value, 10) || 0;
            const quantidade = Math.max(0, Math.min(qtd, 99));

            if (normalizarCampo || qtd > 99 || qtd < 0) {
                input.value = quantidade;
            }

            if (quantidade > 0) {
                div.classList.add('selecionado');
                pedidoAtual[index] = {
                    bolo: bolo.nome,
                    preco: bolo.preco,
                    quantidade: quantidade
                };
            } else {
                div.classList.remove('selecionado');
                delete pedidoAtual[index];
            }

            atualizarResumoPedido();
        };

        btnMenos.addEventListener('click', function () {
            const valorAtual = parseInt(input.value, 10) || 0;
            input.value = Math.max(0, valorAtual - 1);
            atualizarQuantidade(true);
        });

        btnMais.addEventListener('click', function () {
            const valorAtual = parseInt(input.value, 10) || 0;
            input.value = Math.min(99, valorAtual + 1);
            atualizarQuantidade(true);
        });

        input.addEventListener('input', atualizarQuantidade);
        input.addEventListener('change', function () {
            atualizarQuantidade(true);
        });

        carregarQuantidadeAtual();
        container.appendChild(div);
    });
}

function atualizarResumoPedido() {
    const resumo = document.getElementById('resumoPedido');
    resumo.innerHTML = '';
    let total = 0;
    const keys = Object.keys(pedidoAtual);

    if (keys.length === 0) {
        const p = document.createElement('p');
        p.style.color = 'var(--cor-texto-claro)';
        p.style.textAlign = 'center';
        p.textContent = 'Nenhum produto selecionado ainda';
        resumo.appendChild(p);
    } else {
        keys.forEach(index => {
            const item = pedidoAtual[index];
            const subtotal = item.preco * item.quantidade;
            total += subtotal;

            const div = document.createElement('div');
            div.className = 'item-pedido';

            const nome = document.createElement('span');
            nome.className = 'item-pedido-nome';
            const nomeItem = item.sabor ? `${item.bolo} (${item.sabor})` : item.bolo;
            nome.textContent = nomeItem;

            const qtd = document.createElement('span');
            qtd.className = 'item-pedido-qtd';
            qtd.textContent = `${item.quantidade}x`;

            const btn = document.createElement('button');
            btn.className = 'item-pedido-remover';
            btn.title = 'Remover';
            btn.textContent = '✕';
            btn.addEventListener('click', () => removerItemPedido(index));

            div.appendChild(nome);
            div.appendChild(qtd);
            div.appendChild(btn);

            resumo.appendChild(div);
        });
    }

    document.getElementById('totalPedido').textContent = formatarValorPedido(total);
    atualizarBotaoFlutuanteEncomenda();
}

function removerItemPedido(index) {
    delete pedidoAtual[index];

    const inputs = document.querySelectorAll('.quantidade-input');
    inputs.forEach(input => {
        if (parseInt(input.dataset.index) === index) {
            input.value = '0';
            const itemCard = input.closest('.bolo-item');
            itemCard.classList.remove('selecionado');
            const select = itemCard.querySelector('.sabor-palha-select');
            if (select) {
                select.value = select.options[0].value;
            }
        }
    });

    atualizarResumoPedido();
}

function formatarDataPedido(dataISO) {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

function obterDataLocalISO(data = new Date()) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

function inicializarDataMinimaEncomenda() {
    const campoData = document.getElementById('encData');
    if (!campoData) return;

    campoData.min = obterDataLocalISO();
}

function atualizarCamposEntrega() {
    const entregaMarcada = document.getElementById('encEntrega').checked;
    const grupoEndereco = document.getElementById('grupoEnderecoEntrega');
    const endereco = document.getElementById('encEndereco');

    grupoEndereco.classList.toggle('oculta', !entregaMarcada);
    endereco.required = entregaMarcada;

    if (!entregaMarcada) {
        endereco.value = '';
    }
}

function inicializarBuscaCardapio() {
    const buscaInput = document.getElementById('buscaInput');
    if (!buscaInput) return;

    buscaInput.addEventListener('input', filtrarCardapio);
}

function inicializarCamposEntrega() {
    const entrega = document.getElementById('encEntrega');
    if (!entrega) return;

    entrega.addEventListener('change', atualizarCamposEntrega);
    atualizarCamposEntrega();
}

function abrirModalPedidoConfirmado() {
    const modal = document.getElementById('modalPedidoConfirmado');
    if (modal) modal.classList.add('ativo');
}

function fecharModalPedidoConfirmado() {
    const modal = document.getElementById('modalPedidoConfirmado');
    if (modal) modal.classList.remove('ativo');
}

function confirmarEncomenda() {
    const nome = document.getElementById('encNome').value.trim();
    const telefone = document.getElementById('encTelefone').value.trim();
    const data = document.getElementById('encData').value;
    const obs = document.getElementById('encObs').value.trim();
    const desejaEntrega = document.getElementById('encEntrega').checked;
    const endereco = document.getElementById('encEndereco').value.trim();

    if (!nome || !telefone || !data) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }

    if (data < obterDataLocalISO()) {
        alert('Escolha uma data de hoje em diante para sua encomenda.');
        document.getElementById('encData').focus();
        return;
    }

    if (nome.length > 100) {
        alert('Nome deve ter no máximo 100 caracteres.');
        return;
    }

    if (!validarTelefone(telefone)) {
        alert('Telefone inválido. Use um número com pelo menos 10 dígitos.');
        return;
    }

    if (desejaEntrega && !endereco) {
        alert('Informe o endereço para entrega.');
        document.getElementById('encEndereco').focus();
        return;
    }

    if (endereco && endereco.length > 200) {
        alert('Endereço deve ter no máximo 200 caracteres.');
        return;
    }

    if (obs && obs.length > 500) {
        alert('Observações devem ter no máximo 500 caracteres.');
        return;
    }

    if (Object.keys(pedidoAtual).length === 0) {
        alert('Selecione pelo menos um produto para sua encomenda!');
        return;
    }

    // Montar mensagem para WhatsApp
    let mensagem = `*Olá! Nova Encomenda*\n\n`;
    mensagem += `*Cliente:* ${nome}\n`;
    mensagem += `*Telefone:* ${telefone}\n`;
    mensagem += `*Data desejada:* ${formatarDataPedido(data)}\n`;
    mensagem += `*Entrega:* ${desejaEntrega ? 'Quero consultar entrega' : 'Vou retirar no local'}\n`;

    if (desejaEntrega) {
        mensagem += `*Endereço para consulta:* ${endereco}\n`;
        mensagem += `*Entrega/frete:* A combinar pelo WhatsApp conforme endereço e disponibilidade\n`;
        mensagem += `*Pagamento:* A combinar após confirmar entrega/frete\n`;
    } else {
        mensagem += `*Pagamento:* A combinar pelo WhatsApp\n`;
    }

    mensagem += `\n`;
    mensagem += `*Produtos solicitados:*\n`;

    let total = 0;
    let resumoBolosParaPlanilha = [];

    Object.keys(pedidoAtual).forEach(index => {
        const item = pedidoAtual[index];
        const subtotal = item.preco * item.quantidade;
        total += subtotal;

        const nomeItem = item.sabor ? `${item.bolo} (${item.sabor})` : item.bolo;
        mensagem += `• ${item.quantidade}x ${nomeItem} - R$ ${formatarValorPedido(subtotal)}\n`;

        resumoBolosParaPlanilha.push(`${item.quantidade}x ${item.sabor ? `${item.bolo} (${item.sabor})` : item.bolo}`);
    });

    mensagem += `\n*Total dos produtos: R$ ${formatarValorPedido(total)}*\n`;
    mensagem += `_Entrega, frete e pagamento serão combinados pelo WhatsApp._\n`;

    if (obs) {
        mensagem += `\n*Observações:* ${obs}\n`;
    }

    // INTEGRAÇÃO COM GOOGLE SHEETS
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbykom4LkSI3BUG_Y_Y-FlVGHrLyvnBHgxa-L0FIhfpXCXASR-0BqqFbOq1dA3HoEdIG/exec';

    const dadosPedido = {
        dataPedido: formatarDataPedido(obterDataLocalISO()),
        nome: sanitizarEntrada(nome),
        telefone: telefone.replace(/\D/g, ''),
        dataDesejada: formatarDataPedido(data),
        entrega: desejaEntrega ? 'Entrega' : 'Retirada',
        endereco: desejaEntrega ? (endereco || '-') : '-',
        bolos: resumoBolosParaPlanilha.join(' | '),
        total: formatarValorPedido(total),
        observacoes: obs ? sanitizarEntrada(obs) : '-'
    };

    const janelaWhatsapp = window.open('', '_blank');

    if (janelaWhatsapp) {
        janelaWhatsapp.document.write('<!doctype html><html><head><title>WhatsApp</title></head><body><p>Abrindo WhatsApp...</p></body></html>');
        janelaWhatsapp.document.close();
    }

    const btnConfirmar = document.querySelector('button[onclick="confirmarEncomenda()"]');
    const textoOriginalBtn = btnConfirmar ? btnConfirmar.textContent : 'Confirmar Pedido';
    if (btnConfirmar) {
        btnConfirmar.innerHTML = '';
        const spinner = document.createElement('i');
        spinner.className = 'fas fa-spinner fa-spin';
        const textNode = document.createTextNode(' Processando...');
        btnConfirmar.appendChild(spinner);
        btnConfirmar.appendChild(textNode);
        btnConfirmar.disabled = true;
    }

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(dadosPedido)
    })
        .then(async response => {
            const textoResposta = await response.text();
            if (!response.ok) {
                throw new Error(`Resposta HTTP ${response.status}: ${textoResposta}`);
            }
            try {
                const json = JSON.parse(textoResposta);
                if (json.status && json.status.toLowerCase() !== 'sucesso') {
                    throw new Error(json.mensagem || 'Resposta inesperada do servidor.');
                }
            } catch (parseError) {
                console.warn('Resposta não JSON do Google Script:', textoResposta);
            }

            abrirWhatsapp(mensagem, janelaWhatsapp);
            abrirModalPedidoConfirmado();

            document.getElementById('formEncomenda').reset();
            pedidoAtual = {};
            inicializarEncomenda();
            inicializarDataMinimaEncomenda();
            atualizarCamposEntrega();
            atualizarResumoPedido();

            if (btnConfirmar) {
                btnConfirmar.innerHTML = '';
                btnConfirmar.textContent = textoOriginalBtn;
                btnConfirmar.disabled = false;
            }
        })
        .catch(error => {
            console.error('Erro ao salvar na planilha:', error);
            alert('Não foi possível gravar o pedido na planilha. Mas você pode continuar no WhatsApp.');

            abrirWhatsapp(mensagem, janelaWhatsapp);
            abrirModalPedidoConfirmado();

            if (btnConfirmar) {
                btnConfirmar.innerHTML = '';
                btnConfirmar.textContent = textoOriginalBtn;
                btnConfirmar.disabled = false;
            }
        });
}

// Cardápio Colapsável
function toggleCardapio() {
    const container = document.getElementById('cardapioContainer');
    const btn = document.getElementById('btnCardapioText');
    container.classList.toggle('oculta');
    btn.textContent = container.classList.contains('oculta') ? 'Ver Cardápio Completo' : 'Ocultar Cardápio';
}

// Filtro de Categorias na Encomenda
let categoriaAtual = 'todos';
let textoBuscaAtual = '';

function filtrarPorCategoria(categoria, ev) {
    if (ev && ev.preventDefault) ev.preventDefault();

    categoriaAtual = categoria;

    const abas = document.querySelectorAll('.aba-btn');
    abas.forEach(aba => aba.classList.remove('aba-ativo'));

    const btn = ev && ev.target && ev.target.closest ? ev.target.closest('.aba-btn') : null;
    if (btn) {
        btn.classList.add('aba-ativo');
    } else {
        const fallback = Array.from(abas).find(aba => aba.getAttribute('onclick') && aba.getAttribute('onclick').includes(`'${categoria}'`));
        if (fallback) fallback.classList.add('aba-ativo');
    }

    aplicarFiltros();
}

function filtrarBolosPorNome() {
    textoBuscaAtual = document.getElementById('buscaBolosInput').value.toLowerCase();
    aplicarFiltros();
}

function aplicarFiltros() {
    const bolos = document.querySelectorAll('.bolo-item');
    let visiveisCount = 0;
    
    bolos.forEach(bolo => {
        const categoria = bolo.getAttribute('data-categoria');
        const nome = bolo.getAttribute('data-nome');
        
        const passaCategoria = categoriaAtual === 'todos' || categoria === categoriaAtual;
        const passaBusca = nome.includes(textoBuscaAtual);
        
        if (passaCategoria && passaBusca) {
            bolo.style.display = 'flex';
            visiveisCount++;
        } else {
            bolo.style.display = 'none';
        }
    });
}

function inicializarEfeitoHero() {
    const hero = document.querySelector('.hero');
    const layer = document.querySelector('.hero-cursor-effects');
    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hero || !layer || reduzirMovimento) return;

    const cores = [
        'rgba(255, 255, 255, 0.88)',
        'rgba(255, 236, 244, 0.9)',
        'rgba(255, 209, 226, 0.86)',
        'rgba(255, 247, 214, 0.84)'
    ];
    const formatos = ['', 'is-dash', 'is-petal'];
    const particulas = Array.from({ length: 22 }, () => {
        const particula = document.createElement('span');
        particula.className = 'hero-particle';
        layer.appendChild(particula);
        return particula;
    });

    let indiceParticula = 0;
    let ultimoRastro = 0;
    let frameCursor = null;
    let pontoCursor = { x: 0, y: 0 };

    function atualizarBrilhoCursor() {
        frameCursor = null;
        hero.style.setProperty('--cursor-x', `${pontoCursor.x}px`);
        hero.style.setProperty('--cursor-y', `${pontoCursor.y}px`);
    }

    function criarParticula(x, y) {
        const particula = particulas[indiceParticula];
        indiceParticula = (indiceParticula + 1) % particulas.length;

        const tamanho = Math.round(7 + Math.random() * 13);
        const deslocamentoX = Math.round((Math.random() - 0.5) * 86);
        const deslocamentoY = Math.round(-28 - Math.random() * 64);
        const duracao = Math.round(650 + Math.random() * 360);
        const rotacao = Math.round((Math.random() - 0.5) * 180);
        const formato = formatos[Math.floor(Math.random() * formatos.length)];

        particula.className = `hero-particle ${formato}`.trim();
        particula.style.setProperty('--particle-x', `${x}px`);
        particula.style.setProperty('--particle-y', `${y}px`);
        particula.style.setProperty('--particle-size', `${tamanho}px`);
        particula.style.setProperty('--particle-dx', `${deslocamentoX}px`);
        particula.style.setProperty('--particle-dy', `${deslocamentoY}px`);
        particula.style.setProperty('--particle-rotation', `${rotacao}deg`);
        particula.style.setProperty('--particle-color', cores[Math.floor(Math.random() * cores.length)]);
        particula.style.animation = 'none';
        particula.offsetHeight;
        particula.style.animation = `heroParticleTrail ${duracao}ms ease-out forwards`;
    }

    hero.addEventListener('pointermove', function (event) {
        if (event.pointerType === 'touch') return;

        const rect = hero.getBoundingClientRect();
        pontoCursor = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };

        hero.classList.add('is-cursor-active');

        if (!frameCursor) {
            frameCursor = requestAnimationFrame(atualizarBrilhoCursor);
        }

        const agora = performance.now();
        if (agora - ultimoRastro > 38) {
            criarParticula(pontoCursor.x, pontoCursor.y);
            ultimoRastro = agora;
        }
    });

    hero.addEventListener('pointerleave', function () {
        hero.classList.remove('is-cursor-active');
    });
}

function inicializarTema() {
  const temaSalvo = localStorage.getItem('tema');
  if (temaSalvo === 'dark') {
    document.body.classList.add('dark-mode');
  }
}

function alternarModoEscuro() {
  document.body.classList.toggle('dark-mode');
  const temaAtual = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  localStorage.setItem('tema', temaAtual);
}

function atualizarBotaoFlutuanteEncomenda() {
  const btn = document.getElementById('btnEncomendaFlutuante');
  if (!btn) return;

  const temItens = Object.keys(pedidoAtual).length > 0;
  btn.classList.toggle('oculta', !temItens);
}

function irParaConfirmacaoEncomenda() {
  const botaoConfirmar = document.querySelector('button[onclick="confirmarEncomenda()"]');
  if (botaoConfirmar) {
    botaoConfirmar.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Inicializar quando página carregar
document.addEventListener('DOMContentLoaded', function () {
    inicializarTema();
    inicializarAvaliacoes();
    inicializarBuscaCardapio();
    inicializarEncomenda();
    inicializarDataMinimaEncomenda();
    inicializarCamposEntrega();
    inicializarEfeitoHero();
});
