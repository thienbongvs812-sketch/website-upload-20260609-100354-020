(function () {
    const players = Array.from(document.querySelectorAll('.js-hls-player'));

    players.forEach(function (shell) {
        const video = shell.querySelector('video');
        const button = shell.querySelector('.js-play-button');
        let initialized = false;
        let hls = null;

        const start = function () {
            if (!video) {
                return;
            }

            const source = video.getAttribute('data-hls');

            if (!source) {
                return;
            }

            if (!initialized) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    const sourceElement = document.createElement('source');
                    sourceElement.src = source;
                    sourceElement.type = 'application/vnd.apple.mpegurl';
                    video.appendChild(sourceElement);
                }

                initialized = true;
            }

            shell.classList.add('is-playing');

            const promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        };

        if (button) {
            button.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!initialized) {
                    start();
                }
            });

            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                if (video.currentTime === 0) {
                    shell.classList.remove('is-playing');
                }
            });
        }
    });
}());
