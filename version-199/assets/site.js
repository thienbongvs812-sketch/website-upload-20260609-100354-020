(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            var target = form.getAttribute('action') || 'search.html';
            if (query) {
                window.location.href = target + '?q=' + encodeURIComponent(query);
            } else {
                window.location.href = target;
            }
        });
    });

    var carousel = document.querySelector('.hero-carousel');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('.hero-prev');
        var next = carousel.querySelector('.hero-next');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        showSlide(0);
        start();
    }

    var filterInput = document.querySelector('[data-local-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    function normalize(value) {
        return String(value || '').toLowerCase();
    }

    function applyFilter(value) {
        var query = normalize(value).trim();
        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' ');
            var matched = !query || normalize(text).indexOf(query) !== -1;
            card.classList.toggle('is-filter-hidden', !matched);
        });
    }

    if (filterInput && cards.length) {
        var params = new URLSearchParams(window.location.search);
        var preset = params.get('q') || '';
        if (preset) {
            filterInput.value = preset;
        }
        applyFilter(filterInput.value);
        filterInput.addEventListener('input', function () {
            applyFilter(filterInput.value);
        });
        document.querySelectorAll('[data-chip]').forEach(function (button) {
            button.addEventListener('click', function () {
                filterInput.value = button.getAttribute('data-chip') || '';
                applyFilter(filterInput.value);
            });
        });
    }
})();
