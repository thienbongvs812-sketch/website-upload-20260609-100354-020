(function () {
    window.initVideoPlayer = function (source) {
        var video = document.querySelector('[data-video-player]');
        var cover = document.querySelector('[data-video-cover]');
        var button = document.querySelector('[data-video-button]');
        var loaded = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function loadVideo() {
            if (!loaded) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
                loaded = true;
            }

            if (cover) {
                cover.classList.add('is-hidden');
            }

            video.setAttribute('controls', 'controls');
            video.play().catch(function () {});
        }

        if (button) {
            button.addEventListener('click', loadVideo);
        }

        if (cover) {
            cover.addEventListener('click', loadVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                loadVideo();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    };
})();
