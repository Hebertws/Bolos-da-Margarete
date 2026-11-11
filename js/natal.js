// ===== TEMA DE NATAL — Delícias da Margarete =====
// Carregar DEPOIS de script.js.

(function () {
    'use strict';

    // ---------- Neve no hero ----------
    function criarNeve() {
        const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const hero = document.querySelector('.hero');
        if (!hero || reduzirMovimento) return;

        const neve = document.createElement('div');
        neve.className = 'natal-neve';
        neve.setAttribute('aria-hidden', 'true');

        const quantidade = window.innerWidth < 600 ? 16 : 30;

        for (let i = 0; i < quantidade; i++) {
            const floco = document.createElement('span');
            const tamanho = 3 + Math.random() * 5;
            floco.className = 'natal-floco';
            floco.style.left = `${Math.random() * 100}%`;
            floco.style.width = `${tamanho}px`;
            floco.style.height = `${tamanho}px`;
            floco.style.opacity = String(0.45 + Math.random() * 0.5);
            floco.style.animationDuration = `${9 + Math.random() * 9}s`;
            floco.style.animationDelay = `-${Math.random() * 14}s`;
            floco.style.setProperty('--deriva', `${Math.round(-30 + Math.random() * 60)}px`);
            neve.appendChild(floco);
        }

        hero.appendChild(neve);
    }

    document.addEventListener('DOMContentLoaded', criarNeve);
})();