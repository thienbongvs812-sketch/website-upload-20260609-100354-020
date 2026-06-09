(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navButton && mobileNav) {
        navButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startSlider() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startSlider();
            });
        });

        if (slides.length > 1) {
            startSlider();
        }
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterYear = document.querySelector('[data-filter-year]');
    var filterRegion = document.querySelector('[data-filter-region]');
    var filterType = document.querySelector('[data-filter-type]');
    var filterList = document.querySelector('[data-filter-list]');
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function applyFilters() {
        if (!filterList) {
            return;
        }

        var keyword = normalize(filterInput ? filterInput.value : '');
        var year = normalize(filterYear ? filterYear.value : '');
        var region = normalize(filterRegion ? filterRegion.value : '');
        var type = normalize(filterType ? filterType.value : '');
        var visible = 0;
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-movie-card]'));

        cards.forEach(function (card) {
            var search = normalize(card.getAttribute('data-search'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var cardType = normalize(card.getAttribute('data-type'));
            var matched = true;

            if (keyword && search.indexOf(keyword) === -1) {
                matched = false;
            }
            if (year && cardYear !== year) {
                matched = false;
            }
            if (region && cardRegion !== region) {
                matched = false;
            }
            if (type && cardType !== type) {
                matched = false;
            }

            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    [filterInput, filterYear, filterRegion, filterType].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && filterInput) {
        filterInput.value = query;
        applyFilters();
    }

    var searchForm = document.querySelector('[data-search-form]');

    if (searchForm) {
        searchForm.addEventListener('submit', function (event) {
            var input = searchForm.querySelector('input[name="q"]');
            if (input && input.value.trim()) {
                return;
            }
            event.preventDefault();
            window.location.href = searchForm.getAttribute('action');
        });
    }
})();
