(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var navMenu = document.querySelector('[data-nav-menu]');
    if (menuButton && navMenu) {
        menuButton.addEventListener('click', function () {
            navMenu.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) return;
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    });

    document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-search-input]');
        var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));
        var container = scope.parentElement || document;
        var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));
        var selected = 'all';
        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var text = card.textContent.toLowerCase();
                var type = (card.getAttribute('data-type') || '').toLowerCase();
                var region = (card.getAttribute('data-region') || '').toLowerCase();
                var year = (card.getAttribute('data-year') || '').toLowerCase();
                var filter = selected.toLowerCase();
                var matchFilter = filter === 'all' || type.indexOf(filter) !== -1 || region.indexOf(filter) !== -1 || year.indexOf(filter) !== -1 || text.indexOf(filter) !== -1;
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1 || type.indexOf(keyword) !== -1 || region.indexOf(keyword) !== -1 || year.indexOf(keyword) !== -1;
                card.classList.toggle('is-hidden', !(matchFilter && matchKeyword));
            });
        }
        if (input) {
            input.addEventListener('input', apply);
        }
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                selected = button.getAttribute('data-filter') || 'all';
                buttons.forEach(function (btn) { btn.classList.remove('active'); });
                button.classList.add('active');
                apply();
            });
        });
    });
})();

function initPlayer(url) {
    var video = document.querySelector('.video-player');
    var layer = document.querySelector('[data-play]');
    var loaded = false;
    function load() {
        if (!video || loaded) return;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(url);
            hls.attachMedia(video);
        } else {
            video.src = url;
        }
        loaded = true;
    }
    function start() {
        load();
        if (layer) {
            layer.classList.add('is-hidden');
        }
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {
                if (layer) {
                    layer.classList.remove('is-hidden');
                }
            });
        }
    }
    if (!video) return;
    load();
    if (layer) {
        layer.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener('play', function () {
        if (layer) {
            layer.classList.add('is-hidden');
        }
    });
}
