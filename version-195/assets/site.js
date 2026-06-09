(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchRoot = document.querySelector('[data-filter-root]');
  if (searchRoot) {
    var searchInput = searchRoot.querySelector('[data-filter-search]');
    var yearSelect = searchRoot.querySelector('[data-filter-year]');
    var typeSelect = searchRoot.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(searchRoot.querySelectorAll('.movie-card'));
    var emptyState = searchRoot.querySelector('[data-empty-state]');

    function valueOf(input) {
      return input ? String(input.value || '').trim().toLowerCase() : '';
    }

    function applyFilters() {
      var query = valueOf(searchInput);
      var year = valueOf(yearSelect);
      var type = valueOf(typeSelect);
      var visible = 0;
      cards.forEach(function (card) {
        var text = String(card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = String(card.getAttribute('data-year') || '').toLowerCase();
        var cardType = String(card.getAttribute('data-type') || '').toLowerCase();
        var ok = (!query || text.indexOf(query) !== -1) && (!year || cardYear === year) && (!type || cardType === type);
        card.classList.toggle('hidden-card', !ok);
        if (ok) visible += 1;
      });
      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }

    [searchInput, yearSelect, typeSelect].forEach(function (input) {
      if (input) input.addEventListener('input', applyFilters);
      if (input) input.addEventListener('change', applyFilters);
    });
  }
})();

function initPlayer(src) {
  var video = document.querySelector('[data-player-video]');
  var cover = document.querySelector('[data-player-cover]');
  var button = document.querySelector('[data-player-button]');
  if (!video || !src) return;

  function bindSource() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      return;
    }
    video.src = src;
  }

  function start() {
    bindSource();
    if (cover) cover.classList.add('hidden');
    var play = video.play();
    if (play && typeof play.catch === 'function') {
      play.catch(function () {});
    }
  }

  if (button) button.addEventListener('click', start);
  if (cover) cover.addEventListener('click', start);
  video.addEventListener('play', function () {
    if (cover) cover.classList.add('hidden');
  });
}
