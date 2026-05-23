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

function inicializarAvaliacoes() {
    // Carregar avaliações do Firebase
    const starsElements = document.querySelectorAll('#avaliacaoStars i');
    starsElements.forEach(star => {
        star.addEventListener('click', function() {
            avaliacaoSelecionada = this.dataset.value;
            document.getElementById('avalEstrelas').value = avaliacaoSelecionada;
            
            starsElements.forEach((s, index) => {
                if (index < avaliacaoSelecionada) {
                    s.classList.add('ativo');
                } else {
                    s.classList.remove('ativo');
                }
            });
        });
        
        star.addEventListener('mouseover', function() {
            starsElements.forEach((s, index) => {
                if (index < this.dataset.value) {
                    s.style.color = '#ffd700';
                } else {
                    s.style.color = '#ddd';
                }
            });
        });
    });
    
    document.getElementById('avaliacaoStars').addEventListener('mouseleave', function() {
        starsElements.forEach((s, index) => {
            if (index < avaliacaoSelecionada) {
                s.style.color = '#ffd700';
            } else {
                s.style.color = '#ddd';
            }
        });
    });

    carregarAvaliacoes();
}

function enviarAvaliacao(event) {
    event.preventDefault();
    
    const nome = document.getElementById('avalNome').value;
    const bolo = document.getElementById('avalBolo').value;
    const estrelas = document.getElementById('avalEstrelas').value;
    const comentario = document.getElementById('avalComentario').value;
    
    if (!estrelas || estrelas === '0') {
        alert('Selecione uma avaliação!');
        return;
    }
    
    // Salvar no Firebase
    try {
        const avaliacaoId = Date.now().toString();
        const avaliacao = {
            id: avaliacaoId,
            nome: nome,
            bolo: bolo,
            estrelas: parseInt(estrelas),
            comentario: comentario,
            data: new Date().toLocaleString('pt-BR')
        };
        
        db.ref('avaliacoes/' + avaliacaoId).set(avaliacao, function(error) {
            if (error) {
                alert('Erro ao enviar avaliação. Tente novamente.');
            } else {
                alert('Avaliação enviada com sucesso! Obrigado!');
                document.getElementById('formAvaliacao').reset();
                avaliacaoSelecionada = 0;
                document.querySelectorAll('#avaliacaoStars i').forEach(s => s.classList.remove('ativo'));
                carregarAvaliacoes();
            }
        });
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao enviar avaliação. Configure o Firebase corretamente.');
    }
}

function carregarAvaliacoes() {
    try {
        db.ref('avaliacoes').orderByChild('data').limitToLast(10).on('value', function(snapshot) {
            const container = document.getElementById('listaAvaliacoes');
            container.innerHTML = '';
            
            const avaliacoes = [];
            snapshot.forEach(function(childSnapshot) {
                avaliacoes.unshift(childSnapshot.val());
            });
            
            if (avaliacoes.length === 0) {
                container.innerHTML = '<div class="sem-avaliacoes">Seja o primeiro a avaliar um de nossos bolos!</div>';
                return;
            }
            
            avaliacoes.forEach(avaliacao => {
                const card = document.createElement('div');
                card.className = 'avaliacao-card';
                
                const stars = '⭐'.repeat(avaliacao.estrelas);
                
                card.innerHTML = `
                    <div class="avaliacao-header">
                        <div>
                            <div class="avaliacao-nome">${avaliacao.nome}</div>
                            <div class="avaliacao-bolo">📍 ${avaliacao.bolo}</div>
                        </div>
                        <div>
                            <div class="avaliacao-stars-display">${stars}</div>
                            <div class="avaliacao-data">${avaliacao.data}</div>
                        </div>
                    </div>
                    <div class="avaliacao-comentario">${avaliacao.comentario}</div>
                `;
                
                container.appendChild(card);
            });
        });
    } catch (error) {
        console.log('Firebase não configurado. Configure com suas credenciais para ativar avaliações.');
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

// Inicializar tema
inicializarTema();

// Inicializar avaliações
inicializarAvaliacoes();

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

// Adicionar listeners de click nos itens do cardápio
document.querySelectorAll('.cardapio-item').forEach(item => {
    item.addEventListener('click', function() {
        if (!this.classList.contains('oculto')) {
            const nomeBolo = this.querySelector('.item-nome').textContent;
            abrirReceita(nomeBolo);
        }
    });
});

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

// Base de ingredientes (sem quantidade)
const ingredientes = {
    'Bolo de Castanha': [
        'Farinha de trigo',
        'Açúcar',
        'Ovos',
        'Óleo',
        'Leite',
        'Fermento',
        'Castanha de caju',
        'Sal'
    ],
    'Bolo de Cenoura com Cobertura de Chocolate': [
        'Cenoura',
        'Óleo',
        'Ovos',
        'Açúcar',
        'Farinha de trigo',
        'Fermento',
        'Canela',
        'Chocolate em pó',
        'Leite'
    ],
    'Bolo de Chocolate': [
        'Farinha de trigo',
        'Açúcar',
        'Chocolate em pó',
        'Ovos',
        'Óleo',
        'Leite',
        'Fermento',
        'Sal'
    ],
    'Bolo de Chocolate com Castanha': [
        'Farinha de trigo',
        'Açúcar',
        'Chocolate em pó',
        'Ovos',
        'Óleo',
        'Leite',
        'Fermento',
        'Castanha de caju',
        'Sal'
    ],
    'Bolo de Churros': [
        'Farinha de trigo',
        'Açúcar',
        'Ovos',
        'Óleo',
        'Leite',
        'Fermento',
        'Canela',
        'Churro'
    ],
    'Bolo de Coco': [
        'Farinha de trigo',
        'Açúcar',
        'Coco ralado',
        'Ovos',
        'Óleo',
        'Leite de coco',
        'Fermento',
        'Sal'
    ],
    'Bolo de Fubá com Queijo e Cobertura de Goiabada': [
        'Fubá',
        'Farinha de trigo',
        'Açúcar',
        'Ovos',
        'Óleo',
        'Leite',
        'Queijo meia cura',
        'Fermento',
        'Goiabada',
        'Sal'
    ],
    'Bolo de Fubá com Erva Doce': [
        'Fubá',
        'Farinha de trigo',
        'Açúcar',
        'Ovos',
        'Óleo',
        'Leite',
        'Erva doce',
        'Fermento'
    ],
    'Bolo de Laranja com Cobertura de Limão': [
        'Farinha de trigo',
        'Açúcar',
        'Ovos',
        'Óleo',
        'Laranja',
        'Fermento',
        'Limão'
    ],
    'Bolo de Limão com Cobertura de Limão': [
        'Farinha de trigo',
        'Açúcar',
        'Ovos',
        'Óleo',
        'Limão',
        'Leite',
        'Fermento'
    ],
    'Bolo de Maçã com Castanha': [
        'Maçã',
        'Farinha de trigo',
        'Açúcar',
        'Ovos',
        'Óleo',
        'Leite',
        'Fermento',
        'Castanha de caju',
        'Canela'
    ],
    'Bolo de Milho': [
        'Farinha de trigo',
        'Açúcar',
        'Milho verde',
        'Ovos',
        'Óleo',
        'Leite',
        'Fermento',
        'Sal'
    ],
    'Bolo de Paçoca': [
        'Farinha de trigo',
        'Açúcar',
        'Paçoca',
        'Ovos',
        'Óleo',
        'Leite',
        'Fermento',
        'Sal'
    ],
    'Broa de Farinha de Milho com Coco e Queijo': [
        'Fubá',
        'Farinha de trigo',
        'Açúcar',
        'Ovos',
        'Óleo',
        'Leite',
        'Coco ralado',
        'Queijo meia cura',
        'Fermento',
        'Sal'
    ]
};

// Funções do Modal
function abrirReceita(nomeBolo) {
    const lista = ingredientes[nomeBolo];
    if (!lista) return;
    
    document.getElementById('receita-titulo').textContent = nomeBolo;
    
    const ingredientesHtml = lista.map(i => `<li>${i}</li>`).join('');
    document.getElementById('receita-ingredientes').innerHTML = ingredientesHtml;
    
    document.getElementById('modalReceita').classList.add('ativo');
}

function fecharModal() {
    document.getElementById('modalReceita').classList.remove('ativo');
}

window.onclick = function(event) {
    const modal = document.getElementById('modalReceita');
    if (event.target == modal) {
        fecharModal();
    }
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
