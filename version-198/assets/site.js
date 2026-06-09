(function () {
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-nav]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    const carousel = document.querySelector('.js-hero-carousel');

    if (carousel) {
        const backgrounds = Array.from(carousel.querySelectorAll('.hero-bg'));
        const panels = Array.from(carousel.querySelectorAll('[data-hero-panel]'));
        const thumbs = Array.from(carousel.querySelectorAll('[data-hero-index]'));
        let current = 0;
        let timer = null;

        const activate = function (index) {
            current = index;
            backgrounds.forEach(function (item, itemIndex) {
                item.classList.toggle('is-active', itemIndex === current);
            });
            panels.forEach(function (item, itemIndex) {
                item.classList.toggle('is-active', itemIndex === current);
            });
            thumbs.forEach(function (item, itemIndex) {
                item.classList.toggle('is-active', itemIndex === current);
            });
        };

        const next = function () {
            if (backgrounds.length > 0) {
                activate((current + 1) % backgrounds.length);
            }
        };

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                const index = Number(thumb.getAttribute('data-hero-index')) || 0;
                activate(index);
                window.clearInterval(timer);
                timer = window.setInterval(next, 5200);
            });
        });

        timer = window.setInterval(next, 5200);
    }

    const filterList = document.querySelector('[data-filter-list]');

    if (filterList) {
        const cards = Array.from(filterList.querySelectorAll('[data-filter-card]'));
        const searchInput = document.querySelector('[data-search-input]');
        const yearSelect = document.querySelector('[data-filter-year]');
        const regionSelect = document.querySelector('[data-filter-region]');
        const categorySelect = document.querySelector('[data-filter-category]');
        const count = document.querySelector('[data-filter-count]');

        const normalize = function (value) {
            return String(value || '').trim().toLowerCase();
        };

        const apply = function () {
            const query = normalize(searchInput ? searchInput.value : '');
            const year = normalize(yearSelect ? yearSelect.value : '');
            const region = normalize(regionSelect ? regionSelect.value : '');
            const category = normalize(categorySelect ? categorySelect.value : '');
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags'),
                    card.textContent
                ].join(' '));
                const cardYear = normalize(card.getAttribute('data-year'));
                const cardRegion = normalize(card.getAttribute('data-region'));
                const cardCategory = normalize(card.getAttribute('data-category'));
                const matched = (!query || haystack.indexOf(query) !== -1) &&
                    (!year || cardYear === year) &&
                    (!region || cardRegion === region) &&
                    (!category || cardCategory === category);

                card.classList.toggle('is-hidden-by-filter', !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }
        };

        [searchInput, yearSelect, regionSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    }
}());
