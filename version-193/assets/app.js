(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }

    callback();
  }

  function setupHeader() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    function updateHeader() {
      if (!header || header.classList.contains("header-solid")) {
        return;
      }

      if (window.scrollY > 32) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
      var scopeSelector = panel.getAttribute("data-filter-scope") || "body";
      var scope = document.querySelector(scopeSelector) || document;
      var input = panel.querySelector("[data-filter-input]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var year = panel.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));

      function apply() {
        var q = normalizeText(input && input.value);
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var yearValue = year ? year.value : "";

        cards.forEach(function (card) {
          var text = normalizeText([
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year")
          ].join(" "));
          var matchesQuery = !q || text.indexOf(q) >= 0;
          var matchesRegion = !regionValue || card.getAttribute("data-region") === regionValue;
          var matchesType = !typeValue || card.getAttribute("data-type") === typeValue;
          var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
          card.classList.toggle("hidden-card", !(matchesQuery && matchesRegion && matchesType && matchesYear));
        });
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function setupSearchOverlay() {
    var overlay = document.querySelector("[data-search-overlay]");

    if (!overlay) {
      return;
    }

    var openers = Array.prototype.slice.call(document.querySelectorAll("[data-search-open]"));
    var closer = overlay.querySelector("[data-search-close]");
    var form = overlay.querySelector("form");
    var input = overlay.querySelector("input");
    var results = overlay.querySelector("[data-search-results]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    function open() {
      overlay.classList.add("is-open");
      if (input) {
        window.setTimeout(function () {
          input.focus();
        }, 40);
      }
    }

    function close() {
      overlay.classList.remove("is-open");
    }

    function render(query) {
      if (!results) {
        return;
      }

      var q = normalizeText(query);
      results.innerHTML = "";

      if (!q) {
        return;
      }

      cards.filter(function (card) {
        var text = normalizeText([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year")
        ].join(" "));
        return text.indexOf(q) >= 0;
      }).slice(0, 10).forEach(function (card) {
        var link = card.querySelector("a");
        var image = card.querySelector("img");
        var title = card.getAttribute("data-title") || "影片";
        var meta = [card.getAttribute("data-region"), card.getAttribute("data-type"), card.getAttribute("data-year")].filter(Boolean).join(" · ");
        var item = document.createElement("a");
        item.className = "search-result";
        item.href = link ? link.getAttribute("href") : "#";
        item.innerHTML = '<img src="' + (image ? image.getAttribute("src") : "") + '" alt="' + title.replace(/"/g, "&quot;") + '"><span><strong>' + title + '</strong><span>' + meta + '</span></span>';
        results.appendChild(item);
      });
    }

    openers.forEach(function (opener) {
      opener.addEventListener("click", open);
    });

    if (closer) {
      closer.addEventListener("click", close);
    }

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        close();
      }
    });

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        render(input ? input.value : "");
      });
    }

    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
  }

  function setupPlayer() {
    var video = document.querySelector("[data-player-video]");
    var launchers = Array.prototype.slice.call(document.querySelectorAll("[data-player-launch]"));
    var streamUrl = window.__filmStream || "";
    var hlsInstance = null;
    var isBound = false;

    if (!video || !streamUrl || launchers.length === 0) {
      return;
    }

    function bindStream() {
      if (isBound) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      isBound = true;
    }

    function play() {
      bindStream();
      launchers.forEach(function (launcher) {
        launcher.classList.add("is-hidden");
      });
      video.controls = true;
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    launchers.forEach(function (launcher) {
      launcher.addEventListener("click", play);
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  }

  onReady(function () {
    setupHeader();
    setupHero();
    setupFilters();
    setupSearchOverlay();
    setupPlayer();
  });
})();
