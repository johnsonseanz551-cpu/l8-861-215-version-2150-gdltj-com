(function () {
  var configNode = document.getElementById('player-config');
  var video = document.querySelector('[data-player-video]');
  var playButton = document.querySelector('[data-player-button]');

  if (!configNode || !video || !playButton) {
    return;
  }

  var config = JSON.parse(configNode.textContent || '{}');
  var hlsInstance = null;
  var ready = false;

  function attachSource() {
    if (ready) {
      return;
    }

    ready = true;
    var source = config.source;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function startPlay() {
    attachSource();
    playButton.classList.add('is-hidden');
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        playButton.classList.remove('is-hidden');
      });
    }
  }

  playButton.addEventListener('click', startPlay);
  video.addEventListener('click', function () {
    if (!ready || video.paused) {
      startPlay();
    }
  });
  video.addEventListener('play', function () {
    playButton.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (ready) {
      playButton.classList.remove('is-hidden');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
