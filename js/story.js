/**
 * Story content for the toddler web game.
 * Keep this file free of DOM / platform-shell code so a future app
 * wrapper can reuse the same scene list and level settings.
 *
 * Numbered story: Jesse → sheep → lion → bear → Saul → Goliath → victory.
 * The spare shepherd clip is a bonus interlude (welcome, after sheep, tap-in).
 * Lion / bear / Goliath stay the existing soft cartoon framing.
 */
(function (root) {
  const INTERLUDE = {
    id: "hills",
    file: "videos/01-david-shepherd-boy.mp4",
    title: "David’s hills",
    caption: "David was a shepherd boy 💛",
    kickerWelcome: "A little hello",
    kickerBetween: "A quiet moment",
    kickerBonus: "David’s song"
  };

  const SCENES = [
    {
      id: "jesse",
      file: "videos/08-jesse-sends-david.mp4",
      label: "Jesse sends David",
      narr: "assets/audio/narr_jesse.mp3",
      char: "assets/audio/jesse_voice.mp3",
      sfx: null,
      mini: null
    },
    {
      id: "sheep",
      file: "videos/03-david-with-sheep.mp4",
      label: "David & the sheep",
      narr: "assets/audio/narr_sheep.mp3",
      char: null,
      sfx: "assets/audio/sheep_baa.mp3",
      mini: "sheep",
      interludeAfter: true
    },
    {
      id: "lion",
      file: "videos/05-david-fights-lion.mp4",
      label: "David & the lion",
      narr: "assets/audio/narr_lion.mp3",
      char: null,
      sfx: "assets/audio/lion_soft.mp3",
      mini: null
    },
    {
      id: "bear",
      file: "videos/06-david-fights-bear.mp4",
      label: "David & the bear",
      narr: "assets/audio/narr_bear.mp3",
      char: null,
      sfx: "assets/audio/bear_soft.mp3",
      mini: null
    },
    {
      id: "saul",
      file: "videos/07-david-tells-saul-lion-bear.mp4",
      label: "David tells Saul",
      narr: null,
      char: "assets/audio/david_saul.mp3",
      sfx: "assets/audio/saul_voice.mp3",
      mini: "brave"
    },
    {
      id: "goliath",
      file: "videos/02-goliath-philistine-champion.mp4",
      label: "Goliath challenges",
      narr: "assets/audio/narr_goliath.mp3",
      char: "assets/audio/goliath_challenge.mp3",
      sfx: null,
      mini: "stone"
    },
    {
      id: "victory",
      file: "videos/04-david-vs-goliath-victory.mp4",
      label: "Victory!",
      narr: null,
      char: "assets/audio/david_victory.mp3",
      sfx: null,
      mini: null,
      memory: true
    }
  ];

  // Still gentle for about age 3, even on Hard.
  const LEVELS = {
    easy: { sheep: 2, brave: 2, stone: 3, name: "Easy ⭐", delay: 1000, confetti: 16 },
    medium: { sheep: 3, brave: 3, stone: 4, name: "Medium ⭐⭐", delay: 700, confetti: 22 },
    hard: { sheep: 4, brave: 3, stone: 5, name: "Hard ⭐⭐⭐", delay: 500, confetti: 28 }
  };

  const AUDIO = {
    harp: "assets/audio/soft_harp_bg.mp3",
    birds: "assets/audio/birds_ambient.mp3",
    harpNote: "assets/audio/harp_note.mp3",
    celebrate: "assets/audio/celebrate.mp3",
    tweet: "assets/audio/bird_tweet.mp3",
    chirp: "assets/audio/birds_chirp.mp3",
    sheep: "assets/audio/sheep_baa.mp3"
  };

  const ICONS = {
    sheep: "assets/sheep-icon.jpg",
    sling: "assets/sling-icon.jpg"
  };

  const api = { SCENES: SCENES, INTERLUDE: INTERLUDE, LEVELS: LEVELS, AUDIO: AUDIO, ICONS: ICONS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.DavidGame = Object.assign(root.DavidGame || {}, api);
})(typeof globalThis !== "undefined" ? globalThis : this);
