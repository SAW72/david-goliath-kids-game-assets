/**
 * Media helper for Safari / iPad: unlock, volume, pause-on-hide.
 * Platform-shell code lives here; story data does not.
 */
(function (root) {
  function createMedia(els) {
    var unlocked = false;
    var muted = false;
    var masterVol = 0.7;
    var hidden = false;
    var bgWanted = false;
    var videoWasPlaying = false;
    var voiceWas = { narr: false, char: false, sfx: false };
    var onHidden = null;
    var onVisible = null;

    var list = [
      els.bgMusic, els.birds, els.harpNote, els.narr,
      els.charVoice, els.sfx, els.celebrate, els.tweet, els.video
    ].filter(Boolean);

    function applyVolume() {
      var v = muted ? 0 : masterVol;
      if (els.bgMusic) els.bgMusic.volume = v * 0.28;
      if (els.birds) els.birds.volume = v * 0.22;
      if (els.narr) els.narr.volume = v * 0.95;
      if (els.charVoice) els.charVoice.volume = v * 0.95;
      if (els.sfx) els.sfx.volume = v * 0.85;
      if (els.harpNote) els.harpNote.volume = v * 0.65;
      if (els.celebrate) els.celebrate.volume = v * 0.9;
      if (els.tweet) els.tweet.volume = v * 0.5;
      if (els.video) els.video.volume = v * 0.45;
    }

    function setMutedFlag(all, value) {
      all.forEach(function (a) { a.muted = value; });
    }

    applyVolume();

    return {
      get muted() { return muted; },
      get masterVol() { return masterVol; },
      get unlocked() { return unlocked; },
      get hidden() { return hidden; },

      setCallbacks: function (fns) {
        onHidden = fns && fns.onHidden;
        onVisible = fns && fns.onVisible;
      },

      setVolume: function (v) {
        masterVol = Math.max(0, Math.min(1, v));
        applyVolume();
      },

      setMuted: function (value) {
        muted = !!value;
        setMutedFlag(list, muted);
        applyVolume();
        if (!muted && bgWanted) this.playAmbient();
      },

      toggleMute: function () {
        this.setMuted(!muted);
        return muted;
      },

      unlock: function () {
        if (unlocked) return Promise.resolve();
        unlocked = true;
        var tasks = list.filter(function (el) {
          return el !== els.video && (el.currentSrc || el.src);
        }).map(function (el) {
          try {
            var wasMuted = el.muted;
            el.muted = true;
            var p = el.play();
            if (!p || !p.then) {
              el.pause();
              try { el.currentTime = 0; } catch (e) {}
              el.muted = wasMuted || muted;
              return Promise.resolve();
            }
            return p.then(function () {
              el.pause();
              try { el.currentTime = 0; } catch (e) {}
              el.muted = wasMuted || muted;
            }).catch(function () {
              el.muted = wasMuted || muted;
            });
          } catch (e) {
            return Promise.resolve();
          }
        });
        if (root.AudioContext || root.webkitAudioContext) {
          try {
            var Ctx = root.AudioContext || root.webkitAudioContext;
            var ctx = new Ctx();
            if (ctx.state === "suspended") tasks.push(ctx.resume().catch(function () {}));
          } catch (e) {}
        }
        var settled = Promise.all(tasks).then(function () { applyVolume(); });
        var cap = new Promise(function (resolve) { setTimeout(resolve, 700); });
        return Promise.race([settled, cap]);
      },

      playAmbient: function () {
        bgWanted = true;
        if (muted || hidden) return;
        if (els.bgMusic) els.bgMusic.play().catch(function () {});
        if (els.birds) els.birds.play().catch(function () {});
      },

      stopAmbient: function () {
        bgWanted = false;
        if (els.bgMusic) els.bgMusic.pause();
        if (els.birds) els.birds.pause();
      },

      playClip: function (el, src) {
        if (muted || hidden || !el || !src) return;
        el.src = src;
        el.play().catch(function () {});
      },

      playOneShot: function (el) {
        if (muted || hidden || !el) return;
        try { el.currentTime = 0; } catch (e) {}
        el.play().catch(function () {});
      },

      stopVoices: function () {
        [els.narr, els.charVoice, els.sfx, els.celebrate].forEach(function (a) {
          if (!a) return;
          a.pause();
          try { a.currentTime = 0; } catch (e) {}
        });
      },

      stopAll: function () {
        this.stopVoices();
        this.stopAmbient();
        if (els.video) {
          els.video.pause();
          try { els.video.removeAttribute("src"); els.video.load(); } catch (e) {}
        }
      },

      pauseForBackground: function () {
        hidden = true;
        videoWasPlaying = !!(els.video && !els.video.paused && !els.video.ended);
        voiceWas = {
          narr: !!(els.narr && !els.narr.paused),
          char: !!(els.charVoice && !els.charVoice.paused),
          sfx: !!(els.sfx && !els.sfx.paused)
        };
        list.forEach(function (a) { try { a.pause(); } catch (e) {} });
        if (onHidden) onHidden();
      },

      resumeFromBackground: function (userPaused) {
        hidden = false;
        if (userPaused) return;
        if (bgWanted && !muted) this.playAmbient();
        if (videoWasPlaying && els.video) els.video.play().catch(function () {});
        if (voiceWas.narr && els.narr) els.narr.play().catch(function () {});
        if (voiceWas.char && els.charVoice) els.charVoice.play().catch(function () {});
        if (voiceWas.sfx && els.sfx) els.sfx.play().catch(function () {});
        videoWasPlaying = false;
        voiceWas = { narr: false, char: false, sfx: false };
        if (onVisible) onVisible();
      },

      bindVisibility: function (userPausedFn) {
        var self = this;
        function handle() {
          var hiddenNow = document.hidden || document.visibilityState === "hidden";
          if (hiddenNow) self.pauseForBackground();
          else self.resumeFromBackground(userPausedFn && userPausedFn());
        }
        document.addEventListener("visibilitychange", handle);
        window.addEventListener("pagehide", function () { self.pauseForBackground(); });
        window.addEventListener("pageshow", function () {
          self.resumeFromBackground(userPausedFn && userPausedFn());
        });
      }
    };
  }

  var api = { createMedia: createMedia };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.DavidGame = Object.assign(root.DavidGame || {}, api);
})(typeof globalThis !== "undefined" ? globalThis : this);
