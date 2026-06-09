(function () {
    var hlsLibrary = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
    var hlsReady = null;

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(true);
        }
        if (hlsReady) {
            return hlsReady;
        }
        hlsReady = new Promise(function (resolve) {
            var script = document.createElement('script');
            script.src = hlsLibrary;
            script.async = true;
            script.onload = function () {
                resolve(true);
            };
            script.onerror = function () {
                resolve(false);
            };
            document.head.appendChild(script);
        });
        return hlsReady;
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function setupFilters() {
        var form = document.querySelector('[data-grid-filter]');
        var grid = document.querySelector('[data-movie-grid]');
        if (!form || !grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card, .ranking-row'));
        var search = form.querySelector('[data-filter-search]');
        var year = form.querySelector('[data-filter-year]');
        var category = form.querySelector('[data-filter-category]');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');

        if (q && search) {
            search.value = q;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function apply() {
            var keyword = normalize(search && search.value);
            var yearValue = normalize(year && year.value);
            var categoryValue = normalize(category && category.value);

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-title'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardCategory = normalize(card.getAttribute('data-category'));
                var visible = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    visible = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    visible = false;
                }
                if (categoryValue && cardCategory !== categoryValue) {
                    visible = false;
                }

                card.classList.toggle('is-hidden', !visible);
            });
        }

        form.addEventListener('input', apply);
        form.addEventListener('change', apply);
        form.addEventListener('reset', function () {
            window.setTimeout(apply, 0);
        });
        apply();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var play = player.querySelector('[data-play]');
            var attached = false;

            if (!video) {
                return;
            }

            function hideCover() {
                if (play) {
                    play.classList.add('is-hidden');
                }
            }

            function attachNative(src) {
                video.src = src;
                attached = true;
            }

            function attachWithHls(src) {
                return loadHls().then(function () {
                    if (window.Hls && window.Hls.isSupported()) {
                        if (video._hls) {
                            video._hls.destroy();
                        }
                        video._hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        video._hls.loadSource(src);
                        video._hls.attachMedia(video);
                        attached = true;
                        return true;
                    }
                    attachNative(src);
                    return true;
                });
            }

            function start() {
                var src = video.getAttribute('data-stream');
                hideCover();

                var ready = Promise.resolve(true);
                if (!attached && src) {
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        attachNative(src);
                    } else {
                        ready = attachWithHls(src);
                    }
                }

                ready.then(function () {
                    var playResult = video.play();
                    if (playResult && typeof playResult.catch === 'function') {
                        playResult.catch(function () {
                            video.controls = true;
                        });
                    }
                });
            }

            if (play) {
                play.addEventListener('click', start);
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
