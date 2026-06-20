(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var stage = document.querySelector('[data-player-stage]');
        if (!stage) {
            return;
        }

        var video = stage.querySelector('video');
        var overlay = stage.querySelector('[data-player-overlay]');
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-play-button]'));
        var stream = video ? video.getAttribute('data-stream') : '';
        var hlsInstance = null;

        function loadStream() {
            if (!video || !stream || video.getAttribute('data-loaded') === 'true') {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }

            video.setAttribute('data-loaded', 'true');
        }

        function startPlayback() {
            loadStream();

            if (overlay) {
                overlay.hidden = true;
            }

            if (video) {
                video.controls = true;
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        if (overlay) {
                            overlay.hidden = false;
                        }
                    });
                }
            }
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                startPlayback();
            });
        });

        if (overlay) {
            overlay.addEventListener('click', function () {
                startPlayback();
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused || video.getAttribute('data-loaded') !== 'true') {
                    startPlayback();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}());
