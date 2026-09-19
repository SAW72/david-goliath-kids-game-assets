/**
 * Pure play-flow state machine. No DOM, no media.
 * Used by the web shell and by Node tests so Next / mini / pause
 * rules stay consistent.
 */
(function (root) {
  var LOCK_MS = 450;

  function createFlow(scenes, nowFn) {
    var now = nowFn || function () { return Date.now(); };
    var index = 0;
    var miniOpen = false;
    var miniDone = false;
    var paused = false;
    var finished = false;
    var lockUntil = 0;

    function scene() {
      return scenes[index] || null;
    }

    function snapshot() {
      return {
        index: index,
        miniOpen: miniOpen,
        miniDone: miniDone,
        paused: paused,
        finished: finished,
        scene: scene()
      };
    }

    function takeLock() {
      var t = now();
      if (t < lockUntil) return false;
      lockUntil = t + LOCK_MS;
      return true;
    }

    function goForward() {
      if (index + 1 >= scenes.length) {
        finished = true;
        miniOpen = false;
        return { type: "end", state: snapshot() };
      }
      index += 1;
      miniOpen = false;
      miniDone = false;
      return { type: "scene", state: snapshot() };
    }

    return {
      snapshot: snapshot,

      startStory: function () {
        index = 0;
        miniOpen = false;
        miniDone = false;
        paused = false;
        finished = false;
        lockUntil = 0;
        return { type: "scene", state: snapshot() };
      },

      requestNext: function () {
        if (paused || finished || miniOpen) return { type: "ignore", state: snapshot() };
        if (!takeLock()) return { type: "ignore", state: snapshot() };
        var sc = scene();
        if (sc && sc.mini && !miniDone) {
          miniOpen = true;
          return { type: "startMini", mini: sc.mini, state: snapshot() };
        }
        return goForward();
      },

      onVideoEnded: function () {
        if (paused || finished || miniOpen) return { type: "ignore", state: snapshot() };
        var sc = scene();
        if (sc && sc.mini && !miniDone) {
          miniOpen = true;
          return { type: "startMini", mini: sc.mini, state: snapshot() };
        }
        return { type: "waitNext", state: snapshot() };
      },

      completeMini: function () {
        if (!miniOpen || finished) return { type: "ignore", state: snapshot() };
        miniOpen = false;
        miniDone = true;
        return goForward();
      },

      pause: function () {
        if (finished) return { type: "ignore", state: snapshot() };
        paused = true;
        return { type: "paused", state: snapshot() };
      },

      resume: function () {
        if (!paused) return { type: "ignore", state: snapshot() };
        paused = false;
        return { type: "resumed", state: snapshot() };
      },

      home: function () {
        index = 0;
        miniOpen = false;
        miniDone = false;
        paused = false;
        finished = false;
        lockUntil = 0;
        return { type: "home", state: snapshot() };
      },

      replay: function () {
        if (paused || finished || miniOpen) return { type: "ignore", state: snapshot() };
        return { type: "replay", state: snapshot() };
      }
    };
  }

  var api = { createFlow: createFlow, LOCK_MS: LOCK_MS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.DavidGame = Object.assign(root.DavidGame || {}, api);
})(typeof globalThis !== "undefined" ? globalThis : this);
