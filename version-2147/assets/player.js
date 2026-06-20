(function () {
  "use strict";

  function initVideo(video) {
    var hlsUrl = video.getAttribute("data-hls");
    var mp4Url = video.getAttribute("data-mp4");

    function useMp4Fallback() {
      if (mp4Url && video.getAttribute("src") !== mp4Url) {
        video.setAttribute("src", mp4Url);
      }
    }

    if (!hlsUrl) {
      useMp4Fallback();
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.setAttribute("src", hlsUrl);
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          hls.destroy();
          useMp4Fallback();
        }
      });
      return;
    }

    useMp4Fallback();
  }

  function initOverlay(button) {
    var stage = button.closest(".video-stage");
    var video = stage ? stage.querySelector("video") : null;

    if (!video) {
      return;
    }

    button.addEventListener("click", function () {
      button.classList.add("is-hidden");
      video.play().catch(function () {
        button.classList.remove("is-hidden");
      });
    });

    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        button.classList.remove("is-hidden");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.forEach.call(document.querySelectorAll(".movie-player"), initVideo);
    Array.prototype.forEach.call(document.querySelectorAll(".video-play-overlay"), initOverlay);
  });
})();
