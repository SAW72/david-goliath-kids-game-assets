/* Simple cache for http(s) play. Not registered on file://. */
var CACHE = "david-goliath-kids-v1";

var PRECACHE = [
  "./",
  "./index.html",
  "./css/app.css",
  "./js/story.js",
  "./js/flow.js",
  "./js/media.js",
  "./js/minis.js",
  "./js/game.js",
  "./js/boot.js",
  "./manifest.webmanifest",
  "./assets/title.jpg",
  "./assets/sheep-icon.jpg",
  "./assets/sling-icon.jpg",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/audio/soft_harp_bg.mp3",
  "./assets/audio/birds_ambient.mp3",
  "./assets/audio/harp_note.mp3",
  "./assets/audio/celebrate.mp3",
  "./assets/audio/bird_tweet.mp3",
  "./assets/audio/birds_chirp.mp3",
  "./assets/audio/sheep_baa.mp3",
  "./assets/audio/narr_jesse.mp3",
  "./assets/audio/narr_sheep.mp3",
  "./assets/audio/narr_lion.mp3",
  "./assets/audio/narr_bear.mp3",
  "./assets/audio/narr_goliath.mp3",
  "./assets/audio/jesse_voice.mp3",
  "./assets/audio/david_saul.mp3",
  "./assets/audio/david_victory.mp3",
  "./assets/audio/goliath_challenge.mp3",
  "./assets/audio/saul_voice.mp3",
  "./assets/audio/lion_soft.mp3",
  "./assets/audio/bear_soft.mp3"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(PRECACHE);
    }).then(function () {
      return self.skipWaiting();
    }).catch(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k !== CACHE;
      }).map(function (k) {
        return caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  var url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var fetched = fetch(event.request).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(event.request, copy);
          });
        }
        return res;
      }).catch(function () {
        return cached;
      });
      return cached || fetched;
    })
  );
});
