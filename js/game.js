/**
 * Web-shell controller. Talks to the flow machine + media helper.
 * A future native wrapper could replace this file and keep story.js / flow.js.
 */
(function (root) {
  function qs(id) { return document.getElementById(id); }

  function boot() {
    var G = root.DavidGame;
    var scenes = G.SCENES;
    var levels = G.LEVELS;
    var flow = G.createFlow(scenes);
    var level = "medium";
    var sceneTimers = [];
    var confettiTimer = null;
    var media = G.createMedia({
      bgMusic: qs("bg-music"),
      birds: qs("birds"),
      harpNote: qs("harp-note"),
      narr: qs("narr"),
      charVoice: qs("char-voice"),
      sfx: qs("sfx"),
      celebrate: qs("celebrate"),
      tweet: qs("tweet"),
      video: qs("video")
    });

    var video = qs("video");
    var progressBar = qs("progress-bar");
    var sceneLabel = qs("scene-label");
    var starsEl = qs("stars");
    var memory = qs("memory");
    var mini = qs("mini");
    var miniGrid = qs("mini-grid");
    var miniTitle = qs("mini-title");
    var miniNext = qs("mini-next");
    var volSlider = qs("vol-slider");
    var levelBadge = qs("level-badge");
    var pauseOverlay = qs("pause-overlay");
    var tapToPlay = qs("tap-to-play");
    var chromePlay = qs("chrome-play");
    var muteBtn = qs("mute-btn");

    scenes.forEach(function (_, i) {
      var s = document.createElement("span");
      s.className = "star";
      s.textContent = "⭐";
      s.id = "star-" + i;
      s.setAttribute("aria-hidden", "true");
      starsEl.appendChild(s);
    });

    function clearSceneTimers() {
      sceneTimers.forEach(function (t) { clearTimeout(t); });
      sceneTimers = [];
    }

    function later(fn, ms) {
      sceneTimers.push(setTimeout(fn, ms));
    }

    function showScreen(id) {
      document.querySelectorAll(".screen").forEach(function (s) { s.classList.remove("active"); });
      qs(id).classList.add("active");
      var playing = id === "player-area";
      chromePlay.hidden = !playing;
      levelBadge.hidden = !playing && id !== "level-screen";
      if (id !== "player-area") closeMini();
      if (id !== "end-screen") clearConfetti();
    }

    function lightStars(n) {
      for (var i = 0; i < scenes.length; i++) {
        qs("star-" + i).classList.toggle("lit", i <= n);
      }
    }

    function closeMini() {
      mini.classList.remove("active");
      mini.setAttribute("aria-hidden", "true");
      miniNext.classList.remove("show");
    }

    function hidePause() {
      pauseOverlay.classList.remove("active");
      pauseOverlay.setAttribute("aria-hidden", "true");
    }

    function applyAction(action) {
      if (!action || action.type === "ignore") return;
      if (action.type === "scene") showScene(action.state.index);
      else if (action.type === "startMini") openMini(action.mini);
      else if (action.type === "end") showEnd();
      else if (action.type === "replay") replayScene();
      else if (action.type === "paused") showPause();
      else if (action.type === "resumed") doResume();
      else if (action.type === "home") goHome();
    }

    function showScene(idx) {
      hidePause();
      closeMini();
      showScreen("player-area");
      var sc = scenes[idx];
      clearSceneTimers();
      media.stopVoices();
      tapToPlay.hidden = true;
      sceneLabel.textContent = "Scene " + (idx + 1) + " of " + scenes.length + " • " + sc.label;
      lightStars(idx);
      memory.classList.toggle("show", !!sc.memory);
      progressBar.style.width = "0%";
      video.src = sc.file;
      video.load();
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () { tapToPlay.hidden = false; });
      }

      var d = levels[level].delay;
      later(function () { if (sc.narr) media.playClip(qs("narr"), sc.narr); }, d);
      later(function () { if (sc.char) media.playClip(qs("char-voice"), sc.char); }, d + 1600);
      later(function () { if (sc.sfx) media.playClip(qs("sfx"), sc.sfx); }, d + 2800);
      if (Math.random() > 0.45) {
        later(function () { media.playOneShot(qs("tweet")); }, d + 500);
      }
    }

    function replayScene() {
      var sc = scenes[flow.snapshot().index];
      clearSceneTimers();
      media.stopVoices();
      tapToPlay.hidden = true;
      try { video.currentTime = 0; } catch (e) {}
      video.play().catch(function () { tapToPlay.hidden = false; });
      var d = 280;
      later(function () { if (sc.narr) media.playClip(qs("narr"), sc.narr); }, d);
      later(function () { if (sc.char) media.playClip(qs("char-voice"), sc.char); }, d + 400);
      later(function () { if (sc.sfx) media.playClip(qs("sfx"), sc.sfx); }, d + 800);
    }

    function openMini(type) {
      video.pause();
      media.stopVoices();
      clearSceneTimers();
      mini.classList.add("active");
      mini.setAttribute("aria-hidden", "false");
      G.startMini({
        grid: miniGrid,
        titleEl: miniTitle,
        nextBtn: miniNext,
        type: type,
        needed: levels[level][type],
        icons: G.ICONS,
        muted: function () { return media.muted; },
        onTapSound: function () { media.playOneShot(qs("harp-note")); },
        onSheepSound: function () { media.playClip(qs("sfx"), G.AUDIO.sheep); }
      });
    }

    function showPause() {
      video.pause();
      qs("bg-music").pause();
      qs("birds").pause();
      qs("narr").pause();
      qs("char-voice").pause();
      qs("sfx").pause();
      pauseOverlay.classList.add("active");
      pauseOverlay.setAttribute("aria-hidden", "false");
    }

    function doResume() {
      hidePause();
      if (document.hidden) return;
      media.playAmbient();
      if (!mini.classList.contains("active") && video.src && !video.ended) {
        video.play().catch(function () { tapToPlay.hidden = false; });
      }
    }

    function goHome() {
      clearSceneTimers();
      clearConfetti();
      hidePause();
      closeMini();
      media.stopAll();
      tapToPlay.hidden = true;
      memory.classList.remove("show");
      progressBar.style.width = "0%";
      chromePlay.hidden = true;
      levelBadge.hidden = true;
      showScreen("title-screen");
    }

    function clearConfetti() {
      if (confettiTimer) { clearTimeout(confettiTimer); confettiTimer = null; }
      qs("confetti").innerHTML = "";
    }

    function showEnd() {
      closeMini();
      hidePause();
      clearSceneTimers();
      video.pause();
      showScreen("end-screen");
      media.playOneShot(qs("celebrate"));
      var conf = qs("confetti");
      conf.innerHTML = "";
      var colors = ["#FF6B6B", "#FF9A3C", "#4CAF50", "#42A5F5", "#AB47BC", "#FFEE58"];
      var n = levels[level].confetti;
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) n = Math.min(8, n);
      for (var i = 0; i < n; i++) {
        var p = document.createElement("div");
        p.className = "c-piece";
        p.style.left = Math.random() * 100 + "%";
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.animationDuration = (4 + Math.random() * 4) + "s";
        p.style.animationDelay = (Math.random() * 1.2) + "s";
        p.style.opacity = "0.85";
        conf.appendChild(p);
      }
      confettiTimer = setTimeout(function () { conf.innerHTML = ""; }, 10000);
    }

    function chooseLevel(name) {
      level = name;
      levelBadge.hidden = false;
      levelBadge.textContent = levels[level].name;
      media.unlock();
      media.playAmbient();
      applyAction(flow.startStory());
    }

    video.addEventListener("timeupdate", function () {
      if (video.duration) progressBar.style.width = (video.currentTime / video.duration * 100) + "%";
    });
    video.addEventListener("ended", function () {
      applyAction(flow.onVideoEnded());
    });
    video.addEventListener("error", function () {
      tapToPlay.hidden = true;
    });
    video.addEventListener("playing", function () {
      tapToPlay.hidden = true;
    });

    qs("start-btn").addEventListener("click", function () {
      media.unlock();
      media.playAmbient();
      showScreen("level-screen");
      levelBadge.hidden = true;
    });

    document.querySelectorAll("[data-level]").forEach(function (btn) {
      btn.addEventListener("click", function () { chooseLevel(btn.dataset.level); });
    });

    qs("next-btn").addEventListener("click", function () { applyAction(flow.requestNext()); });
    qs("replay-btn").addEventListener("click", function () { applyAction(flow.replay()); });
    qs("mini-next").addEventListener("click", function () { applyAction(flow.completeMini()); });
    qs("pause-btn").addEventListener("click", function () { applyAction(flow.pause()); });
    qs("resume-btn").addEventListener("click", function () { applyAction(flow.resume()); });
    qs("home-btn").addEventListener("click", function () { applyAction(flow.home()); });
    qs("pause-home-btn").addEventListener("click", function () { applyAction(flow.home()); });
    qs("end-home-btn").addEventListener("click", function () { applyAction(flow.home()); });

    qs("restart-btn").addEventListener("click", function () {
      media.stopVoices();
      applyAction(flow.startStory());
    });
    qs("change-level-btn").addEventListener("click", function () {
      media.stopVoices();
      hidePause();
      closeMini();
      chromePlay.hidden = true;
      showScreen("level-screen");
    });

    muteBtn.addEventListener("click", function () {
      var isMuted = media.toggleMute();
      muteBtn.textContent = isMuted ? "🔇" : "🔊";
      muteBtn.setAttribute("aria-label", isMuted ? "Unmute" : "Mute");
    });
    volSlider.addEventListener("input", function (e) {
      media.setVolume(Number(e.target.value) / 100);
    });

    tapToPlay.addEventListener("click", function () {
      media.unlock().then(function () {
        video.play().then(function () { tapToPlay.hidden = true; }).catch(function () {});
      });
    });

    media.bindVisibility(function () { return flow.snapshot().paused; });

    document.addEventListener("gesturestart", function (e) { e.preventDefault(); });
    document.addEventListener("dblclick", function (e) { e.preventDefault(); });

    showScreen("title-screen");
  }

  function registerServiceWorker() {
    var http = location.protocol === "http:" || location.protocol === "https:";
    if (!http || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }

  root.DavidGame = Object.assign(root.DavidGame || {}, {
    boot: boot,
    registerServiceWorker: registerServiceWorker
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
