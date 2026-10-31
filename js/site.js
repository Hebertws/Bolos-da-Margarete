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

function toggleMenuMobile() {
    const navMenu = document.getElementById('navMenu');
    const botaoMenu = document.querySelector('.menu-hamburger');
    if (!navMenu || !botaoMenu) return;

    const menuAberto = navMenu.classList.toggle('ativo');
    botaoMenu.setAttribute('aria-expanded', String(menuAberto));
    botaoMenu.setAttribute('aria-label', menuAberto ? 'Fechar menu' : 'Abrir menu');
    botaoMenu.innerHTML = `<i class="fas fa-${menuAberto ? 'xmark' : 'bars'}"></i>`;
}

function fecharMenuMobile() {
    const navMenu = document.getElementById('navMenu');
    const botaoMenu = document.querySelector('.menu-hamburger');
    if (!navMenu || !botaoMenu) return;

    navMenu.classList.remove('ativo');
    botaoMenu.setAttribute('aria-expanded', 'false');
    botaoMenu.setAttribute('aria-label', 'Abrir menu');
    botaoMenu.innerHTML = '<i class="fas fa-bars"></i>';
}

function inicializarTema() {
    if (localStorage.getItem('tema') === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

function alternarModoEscuro() {
    document.body.classList.toggle('dark-mode');
    const temaAtual = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('tema', temaAtual);
}

document.addEventListener('DOMContentLoaded', inicializarTema);
