// Carrossel
let indiceAtual = 0;
const itensCarrossel = document.querySelectorAll('.galeria-item').length;
let intervaloCarrossel;

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
