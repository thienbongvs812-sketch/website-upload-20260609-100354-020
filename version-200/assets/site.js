(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            var isOpen = menu.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function setupSlider() {
        var slider = document.querySelector("[data-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide-dot]"));
        var prev = slider.querySelector("[data-slide-prev]");
        var next = slider.querySelector("[data-slide-next]");
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener("click", function () {
                show(itemIndex);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : "";
    }

    function setupFilters() {
        var list = document.querySelector("[data-movie-list]");
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        var searchInput = document.querySelector("[data-search-input]");
        var typeSelect = document.querySelector("[data-filter-type]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var regionSelect = document.querySelector("[data-filter-region]");
        var resetButton = document.querySelector("[data-filter-reset]");
        var empty = document.querySelector("[data-empty-result]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (searchInput && query) {
            searchInput.value = query;
        }

        function matches(card) {
            var keyword = valueOf(searchInput);
            var type = valueOf(typeSelect);
            var year = valueOf(yearSelect);
            var region = valueOf(regionSelect);
            var haystack = [
                card.getAttribute("data-title"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.textContent
            ].join(" ").toLowerCase();
            var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var okType = !type || (card.getAttribute("data-type") || "").toLowerCase() === type;
            var okYear = !year || (card.getAttribute("data-year") || "").toLowerCase() === year;
            var okRegion = !region || (card.getAttribute("data-region") || "").toLowerCase() === region;
            return okKeyword && okType && okYear && okRegion;
        }

        function apply() {
            var visible = 0;
            cards.forEach(function (card) {
                var isVisible = matches(card);
                card.style.display = isVisible ? "" : "none";
                if (isVisible) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [searchInput, typeSelect, yearSelect, regionSelect].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });

        if (resetButton) {
            resetButton.addEventListener("click", function () {
                if (searchInput) {
                    searchInput.value = "";
                }
                if (typeSelect) {
                    typeSelect.value = "";
                }
                if (yearSelect) {
                    yearSelect.value = "";
                }
                if (regionSelect) {
                    regionSelect.value = "";
                }
                apply();
            });
        }
        apply();
    }

    function initMoviePlayer(playbackSource) {
        var video = document.getElementById("movie-player");
        var button = document.querySelector("[data-play-button]");
        var message = document.querySelector("[data-player-message]");
        var hlsInstance = null;
        var loaded = false;

        if (!video || !playbackSource) {
            return;
        }

        function setMessage(text) {
            if (message) {
                message.textContent = text || "";
            }
        }

        function attachSource() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = playbackSource;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(playbackSource);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage("视频暂时无法播放，请稍后重试");
                    }
                });
            } else {
                setMessage("视频暂时无法播放，请稍后重试");
            }
        }

        function playVideo() {
            attachSource();
            if (button) {
                button.classList.add("is-hidden");
            }
            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {
                    setMessage("点击播放按钮继续观看");
                });
            }
        }

        if (button) {
            button.addEventListener("click", playVideo);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
            setMessage("");
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        setupMobileMenu();
        setupSlider();
        setupFilters();
    });

    window.initMoviePlayer = initMoviePlayer;
})();
