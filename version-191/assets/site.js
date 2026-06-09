(function () {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const siteNav = document.querySelector('[data-site-nav]');

    if (navToggle && siteNav) {
        navToggle.addEventListener('click', function () {
            siteNav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let index = 0;
        let timer = null;

        const activate = function (nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
            });
        };

        const play = function () {
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        };

        dots.forEach(function (dot, current) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                activate(current);
                play();
            });
        });

        if (slides.length > 1) {
            play();
        }
    }

    const grids = Array.from(document.querySelectorAll('[data-card-grid]'));

    grids.forEach(function (grid) {
        const section = grid.closest('section') || document;
        const searchInput = section.querySelector('.site-search');
        const buttons = Array.from(section.querySelectorAll('[data-filter]'));
        const cards = Array.from(grid.querySelectorAll('.movie-card'));
        const empty = section.querySelector('[data-no-results]');
        let activeFilter = 'all';

        const matchesFilter = function (card) {
            const type = card.getAttribute('data-type') || '';
            const region = card.getAttribute('data-region') || '';
            const yearText = card.getAttribute('data-year') || '';
            const year = parseInt(yearText.replace(/\D/g, '').slice(0, 4), 10) || 0;

            if (activeFilter === 'movie') {
                return type.indexOf('电影') !== -1;
            }
            if (activeFilter === 'series') {
                return type.indexOf('剧') !== -1 || type.indexOf('综艺') !== -1 || type.indexOf('动漫') !== -1;
            }
            if (activeFilter === 'cn') {
                return region.indexOf('中国') !== -1 || region.indexOf('香港') !== -1 || region.indexOf('台湾') !== -1 || region.indexOf('内地') !== -1;
            }
            if (activeFilter === 'new') {
                return year >= 2024;
            }
            return true;
        };

        const apply = function () {
            const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-year') || ''
                ].join(' ').toLowerCase();
                const show = (!keyword || haystack.indexOf(keyword) !== -1) && matchesFilter(card);
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        };

        if (searchInput) {
            searchInput.addEventListener('input', apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });
    });
})();
