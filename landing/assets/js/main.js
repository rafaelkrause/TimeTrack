(function () {
    'use strict';

    const html = document.documentElement;
    const toggle = document.getElementById('theme-toggle');
    const THEMES = ['auto', 'light', 'dark'];
    const ICONS = { auto: 'bi-circle-half', light: 'bi-sun', dark: 'bi-moon-stars' };

    function resolve(pref) {
        if (pref === 'auto') {
            return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return pref;
    }

    function apply(pref) {
        html.setAttribute('data-bs-theme', resolve(pref));
        if (toggle) {
            const icon = toggle.querySelector('i');
            if (icon) icon.className = 'bi ' + (ICONS[pref] || ICONS.auto);
        }
    }

    apply(localStorage.getItem('jt-theme') || 'auto');

    if (toggle) {
        toggle.addEventListener('click', () => {
            const cur = localStorage.getItem('jt-theme') || 'auto';
            const next = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
            localStorage.setItem('jt-theme', next);
            apply(next);
        });
    }

    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if ((localStorage.getItem('jt-theme') || 'auto') === 'auto') apply('auto');
    });

    document.querySelectorAll('.btn-copy').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const text = btn.dataset.copy;
            if (!text) return;
            try {
                await navigator.clipboard.writeText(text);
            } catch (e) {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); } catch (_) { /* give up silently */ }
                document.body.removeChild(ta);
            }
            const icon = btn.querySelector('i');
            const prev = icon ? icon.className : '';
            if (icon) icon.className = 'bi bi-check-lg';
            btn.classList.add('copied');
            setTimeout(() => {
                if (icon) icon.className = prev;
                btn.classList.remove('copied');
            }, 1500);
        });
    });

    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
