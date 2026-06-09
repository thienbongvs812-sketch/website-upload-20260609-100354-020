(function () {
    const video = document.getElementById('movie-video');
    const cover = document.getElementById('player-cover');
    const config = window.__videoConfig || {};
    let hlsInstance = null;
    let started = false;

    if (!video || !cover || !config.url) {
        return;
    }

    const hideCover = function () {
        cover.classList.add('is-hidden');
    };

    const beginWithNative = function () {
        video.src = config.url;
        video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
        }, { once: true });
        video.play().catch(function () {});
    };

    const beginWithHls = function () {
        if (!window.Hls || !window.Hls.isSupported()) {
            beginWithNative();
            return;
        }

        if (hlsInstance) {
            video.play().catch(function () {});
            return;
        }

        hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hlsInstance.loadSource(config.url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
                return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
            } else {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };

    const start = function () {
        hideCover();

        if (started) {
            video.play().catch(function () {});
            return;
        }

        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            beginWithNative();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            beginWithHls();
            return;
        }

        window.addEventListener('hls-loader-ready', function () {
            beginWithHls();
        }, { once: true });

        window.setTimeout(function () {
            if (!hlsInstance && !video.currentSrc) {
                beginWithNative();
            }
        }, 1200);
    };

    cover.addEventListener('click', start);
    document.querySelectorAll('[data-start-player]').forEach(function (button) {
        button.addEventListener('click', start);
    });
    video.addEventListener('click', function () {
        if (!started) {
            start();
        }
    });
})();
