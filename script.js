// Carrossel
let indiceAtual = 0;
const itensCarrossel = document.querySelectorAll('.galeria-item').length;
let intervaloCarrossel;

// Modo Escuro
function inicializarTema() {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

function alternarModoEscuro() {
    document.body.classList.toggle('dark-mode');
    const tempoAtual = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('tema', tempoAtual);
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

    if (comentario.length > LIMITE_COMENTARIO) {
        alert(`O comentário deve ter no máximo ${LIMITE_COMENTARIO} caracteres.`);
        return;
    }

    try {
        const avaliacaoId = Date.now().toString();
        const createdAt = Date.now();
        const avaliacao = {
            id: avaliacaoId,
            nome: nome,
            bolo: bolo,
            estrelas: parseInt(estrelas, 10),
            comentario: comentario,
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
                container.innerHTML = '<div class="sem-avaliacoes">Seja o primeiro a avaliar um de nossos bolos!</div>';
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
        document.getElementById('listaAvaliacoes').innerHTML =
            '<div class="sem-avaliacoes">Avaliações temporariamente indisponíveis.</div>';
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

// Redirecionar para WhatsApp
function redirecionarWhatsapp() {
    const numero = '5531985740971';
    const mensagem = encodeURIComponent('Olá Margarete! Gostaria de fazer um pedido de bolo.');
    window.open(`https://wa.me/${numero}?text=${mensagem}`, '_blank');
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
document.getElementById('modalLightbox').addEventListener('click', function (e) {
    if (e.target === this) fecharLightbox();
});

// Fechar com tecla Esc, navegar com setas
document.addEventListener('keydown', function (e) {
    const lightbox = document.getElementById('modalLightbox');
    if (!lightbox.classList.contains('ativo')) return;
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
    { nome: 'Bolo de Castanha', preco: 25.00 },
    { nome: 'Bolo de Cenoura com Cobertura de Chocolate', preco: 20.00 },
    { nome: 'Bolo de Chocolate', preco: 20.00 },
    { nome: 'Bolo de Chocolate com Castanha', preco: 25.00 },
    { nome: 'Bolo de Churros', preco: 20.00 },
    { nome: 'Bolo de Coco', preco: 20.00 },
    { nome: 'Bolo de Fubá com Queijo e Cobertura de Goiabada', preco: 20.00 },
    { nome: 'Bolo de Fubá com Erva Doce', preco: 20.00 },
    { nome: 'Bolo de Laranja com Cobertura de Limão', preco: 20.00 },
    { nome: 'Bolo de Limão com Cobertura de Limão', preco: 20.00 },
    { nome: 'Bolo de Maçã com Castanha', preco: 25.00 },
    { nome: 'Bolo de Milho', preco: 20.00 },
    { nome: 'Bolo de Paçoca', preco: 20.00 },
    { nome: 'Broa de Farinha de Milho com Coco e Queijo', preco: 25.00 }
];

let pedidoAtual = {};

function inicializarEncomenda() {
    const container = document.getElementById('bolosSelecao');
    container.innerHTML = '';

    bolosData.forEach((bolo, index) => {
        const div = document.createElement('div');
        div.className = 'bolo-item';
        div.innerHTML = `
            <span class="bolo-nome">${bolo.nome}</span>
            <span class="bolo-preco">R$ ${bolo.preco.toFixed(2)}</span>
            <input type="number" class="quantidade-input" min="0" max="99" value="0" 
                   data-index="${index}" placeholder="Qtd">
        `;

        div.querySelector('input').addEventListener('change', function () {
            const qtd = parseInt(this.value) || 0;
            if (qtd > 0) {
                div.classList.add('selecionado');
                pedidoAtual[index] = { bolo: bolo.nome, preco: bolo.preco, quantidade: qtd };
            } else {
                div.classList.remove('selecionado');
                delete pedidoAtual[index];
            }
            atualizarResumoPedido();
        });

        container.appendChild(div);
    });
}

function atualizarResumoPedido() {
    const resumo = document.getElementById('resumoPedido');
    let total = 0;
    let html = '';

    Object.keys(pedidoAtual).forEach(index => {
        const item = pedidoAtual[index];
        const subtotal = item.preco * item.quantidade;
        total += subtotal;

        html += `
            <div class="item-pedido">
                <span class="item-pedido-nome">${item.bolo}</span>
                <span class="item-pedido-qtd">${item.quantidade}x</span>
                <button class="item-pedido-remover" onclick="removerItemPedido(${index})" title="Remover">✕</button>
            </div>
        `;
    });

    if (html === '') {
        html = '<p style="color: var(--cor-texto-claro); text-align: center;">Nenhum bolo selecionado ainda</p>';
    }

    resumo.innerHTML = html;
    document.getElementById('totalPedido').textContent = total.toFixed(2);
}

function removerItemPedido(index) {
    delete pedidoAtual[index];

    const inputs = document.querySelectorAll('.quantidade-input');
    inputs.forEach(input => {
        if (parseInt(input.dataset.index) === index) {
            input.value = '0';
            input.closest('.bolo-item').classList.remove('selecionado');
        }
    });

    atualizarResumoPedido();
}

function formatarDataPedido(dataISO) {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
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

function inicializarCamposEntrega() {
    const entrega = document.getElementById('encEntrega');
    if (!entrega) return;

    entrega.addEventListener('change', atualizarCamposEntrega);
    atualizarCamposEntrega();
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

    if (desejaEntrega && !endereco) {
        alert('Informe o endereço para entrega.');
        document.getElementById('encEndereco').focus();
        return;
    }

    if (Object.keys(pedidoAtual).length === 0) {
        alert('Selecione pelo menos um bolo para sua encomenda!');
        return;
    }

    // Montar mensagem para WhatsApp
    let mensagem = `*Olá! Nova Encomenda*\n\n`;
    mensagem += `*Cliente:* ${nome}\n`;
    mensagem += `*Telefone:* ${telefone}\n`;
    mensagem += `*Data desejada:* ${formatarDataPedido(data)}\n`;
    mensagem += `*Entrega:* ${desejaEntrega ? 'Desejo receber na minha casa' : 'Vou retirar no local'}\n`;

    if (desejaEntrega) {
        mensagem += `*Endereço:* ${endereco}\n`;
        mensagem += `*Taxa de entrega:* A combinar conforme a localização\n`;
    }

    mensagem += `\n`;
    mensagem += `*Bolos solicitados:*\n`;

    let total = 0;
    Object.keys(pedidoAtual).forEach(index => {
        const item = pedidoAtual[index];
        const subtotal = item.preco * item.quantidade;
        total += subtotal;
        mensagem += `• ${item.quantidade}x ${item.bolo} - R$ ${subtotal.toFixed(2)}\n`;
    });

    mensagem += `\n*Total: R$ ${total.toFixed(2)}*\n`;

    if (obs) {
        mensagem += `\n*Observações:* ${obs}\n`;
    }

    // Encode para URL e redirecionar para WhatsApp
    const urlEncode = encodeURIComponent(mensagem);
    window.location.href = `https://wa.me/+5531985740971?text=${urlEncode}`;

    // Limpar formulário após envio
    setTimeout(() => {
        document.getElementById('formEncomenda').reset();
        pedidoAtual = {};
        inicializarEncomenda();
        atualizarCamposEntrega();
        atualizarResumoPedido();
    }, 500);
}

// Inicializar quando página carregar
document.addEventListener('DOMContentLoaded', function () {
    inicializarTema();
    inicializarAvaliacoes();
    inicializarEncomenda();
    inicializarCamposEntrega();
});

