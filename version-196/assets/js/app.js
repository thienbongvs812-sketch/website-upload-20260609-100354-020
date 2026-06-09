(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    function applyFilters(panel) {
        var keywordInput = panel.querySelector('[data-filter-keyword]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var grid = document.querySelector('[data-card-grid]');
        var empty = document.querySelector('[data-empty-state]');

        if (!grid) {
            return;
        }

        var cards = selectAll('[data-movie-card]', grid);
        var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = card.textContent.toLowerCase();
            var cardYear = card.getAttribute('data-year') || '';
            var cardType = card.getAttribute('data-type') || '';
            var matched = true;

            if (keyword && haystack.indexOf(keyword) === -1) {
                matched = false;
            }

            if (year && cardYear !== year) {
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

        if (empty) {
            empty.classList.toggle('show', visible === 0);
        }
    }

    selectAll('[data-filter-form]').forEach(function (panel) {
        var keywordInput = panel.querySelector('[data-filter-keyword]');
        var controls = selectAll('input, select', panel);
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q');

        if (keywordInput && initial) {
            keywordInput.value = initial;
        }

        controls.forEach(function (control) {
            control.addEventListener('input', function () {
                applyFilters(panel);
            });

            control.addEventListener('change', function () {
                applyFilters(panel);
            });
        });

        applyFilters(panel);
    });

    window.initHlsPlayer = function (videoId, sourceUrl, buttonId) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var hls = null;
        var loaded = false;

        if (!video || !sourceUrl) {
            return;
        }

        function loadSource() {
            if (loaded) {
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = sourceUrl;
        }

        function beginPlayback() {
            loadSource();
            video.setAttribute('controls', 'controls');

            if (button) {
                button.classList.add('is-hidden');
            }

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', beginPlayback);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                beginPlayback();
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (button && video.currentTime === 0) {
                button.classList.remove('is-hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})();
