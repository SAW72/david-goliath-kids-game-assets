(function () {
  function start() {
    DavidGame.boot();
    DavidGame.registerServiceWorker();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
