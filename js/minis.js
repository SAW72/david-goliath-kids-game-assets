/**
 * Gentle tap mini-games. Count and icons come from story/level data.
 */
(function (root) {
  function startMini(opts) {
    var grid = opts.grid;
    var titleEl = opts.titleEl;
    var nextBtn = opts.nextBtn;
    var type = opts.type;
    var needed = opts.needed;
    var icons = opts.icons;
    var muted = opts.muted;
    var onTapSound = opts.onTapSound;
    var onSheepSound = opts.onSheepSound;

    grid.innerHTML = "";
    nextBtn.classList.remove("show");
    nextBtn.setAttribute("aria-hidden", "true");

    if (type === "sheep") titleEl.textContent = "Tap the happy sheep! (" + needed + ") 🐑";
    else if (type === "brave") titleEl.textContent = "Tap David to be brave! (" + needed + ") 💛";
    else titleEl.textContent = "Pick smooth stones! (" + needed + ") 🪨";

    var done = 0;

    function addItem(html, isImg) {
      var d = document.createElement("button");
      d.type = "button";
      d.className = "tap-item";
      d.setAttribute("aria-label", type === "sheep" ? "Happy sheep" : type === "brave" ? "David" : "Smooth stone");
      if (isImg) d.innerHTML = html;
      else d.textContent = html;
      d.addEventListener("click", function () {
        if (d.classList.contains("done")) return;
        d.classList.add("done");
        d.disabled = true;
        if (!muted()) {
          if (onTapSound) onTapSound();
          if (type === "sheep" && onSheepSound) onSheepSound();
        }
        done += 1;
        if (done >= needed) {
          nextBtn.classList.add("show");
          nextBtn.setAttribute("aria-hidden", "false");
        }
      });
      grid.appendChild(d);
    }

    for (var i = 0; i < needed; i++) {
      if (type === "sheep") addItem('<img src="' + icons.sheep + '" alt="">', true);
      else if (type === "brave") addItem("🦸", false);
      else addItem('<img src="' + icons.sling + '" alt="">', true);
    }
  }

  var api = { startMini: startMini };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.DavidGame = Object.assign(root.DavidGame || {}, api);
})(typeof globalThis !== "undefined" ? globalThis : this);
