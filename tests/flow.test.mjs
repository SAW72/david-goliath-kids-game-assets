import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { SCENES, LEVELS } = require("../js/story.js");
const { createFlow } = require("../js/flow.js");

function flowWithClock() {
  let t = 10_000;
  const flow = createFlow(SCENES, () => t);
  return {
    flow,
    tick(ms) { t += ms; }
  };
}

test("story wires every video, shepherd first", () => {
  const files = SCENES.map((s) => s.file);
  assert.equal(files[0], "videos/01-david-shepherd-boy.mp4");
  assert.ok(files.includes("videos/08-jesse-sends-david.mp4"));
  assert.ok(files.includes("videos/03-david-with-sheep.mp4"));
  assert.ok(files.includes("videos/05-david-fights-lion.mp4"));
  assert.ok(files.includes("videos/06-david-fights-bear.mp4"));
  assert.ok(files.includes("videos/07-david-tells-saul-lion-bear.mp4"));
  assert.ok(files.includes("videos/02-goliath-philistine-champion.mp4"));
  assert.ok(files.includes("videos/04-david-vs-goliath-victory.mp4"));
  assert.equal(SCENES.length, 8);
  assert.equal(new Set(files).size, 8);
});

test("levels stay gentle for a toddler", () => {
  assert.ok(LEVELS.easy.sheep <= 2);
  assert.ok(LEVELS.hard.sheep <= 4);
  assert.ok(LEVELS.hard.stone <= 5);
  assert.ok(LEVELS.hard.confetti <= 32);
});

test("Next does not skip an unfinished mini", () => {
  const { flow, tick } = flowWithClock();
  flow.startStory();
  // shepherd (no mini) → jesse (no mini) → sheep (mini)
  assert.equal(flow.requestNext().type, "scene");
  tick(500);
  assert.equal(flow.requestNext().type, "scene");
  tick(500);
  const mini = flow.requestNext();
  assert.equal(mini.type, "startMini");
  assert.equal(mini.mini, "sheep");
  tick(500);
  assert.equal(flow.requestNext().type, "ignore");
  assert.equal(flow.snapshot().index, 2);
  assert.equal(flow.snapshot().miniOpen, true);
});

test("video ended and Next do not double-advance a mini scene", () => {
  const { flow, tick } = flowWithClock();
  flow.startStory();
  flow.requestNext();
  tick(500);
  flow.requestNext();
  tick(500);
  const ended = flow.onVideoEnded();
  assert.equal(ended.type, "startMini");
  const again = flow.onVideoEnded();
  assert.equal(again.type, "ignore");
  tick(500);
  assert.equal(flow.requestNext().type, "ignore");
  const done = flow.completeMini();
  assert.equal(done.type, "scene");
  assert.equal(done.state.index, 3);
});

test("completing mini advances once", () => {
  const { flow, tick } = flowWithClock();
  flow.startStory();
  flow.requestNext();
  tick(500);
  flow.requestNext();
  tick(500);
  flow.requestNext();
  const first = flow.completeMini();
  assert.equal(first.type, "scene");
  assert.equal(flow.completeMini().type, "ignore");
});

test("pause blocks Next; home resets", () => {
  const { flow, tick } = flowWithClock();
  flow.startStory();
  flow.requestNext();
  tick(500);
  assert.equal(flow.pause().type, "paused");
  assert.equal(flow.requestNext().type, "ignore");
  assert.equal(flow.resume().type, "resumed");
  tick(500);
  assert.equal(flow.requestNext().type, "scene");
  flow.home();
  assert.equal(flow.snapshot().index, 0);
  assert.equal(flow.snapshot().paused, false);
  assert.equal(flow.snapshot().finished, false);
});

test("rapid Next is locked so two taps do not skip two scenes", () => {
  const { flow, tick } = flowWithClock();
  flow.startStory();
  assert.equal(flow.requestNext().type, "scene");
  assert.equal(flow.requestNext().type, "ignore");
  tick(500);
  assert.equal(flow.requestNext().type, "scene");
});

test("story can reach the end screen", () => {
  const { flow, tick } = flowWithClock();
  flow.startStory();
  let action;
  for (let i = 0; i < 20; i++) {
    tick(500);
    const snap = flow.snapshot();
    if (snap.scene && snap.scene.mini && !snap.miniDone && !snap.miniOpen) {
      action = flow.requestNext();
      if (action.type === "startMini") action = flow.completeMini();
    } else {
      action = flow.requestNext();
      if (action.type === "startMini") action = flow.completeMini();
    }
    if (action.type === "end") break;
  }
  assert.equal(action.type, "end");
  assert.equal(flow.snapshot().finished, true);
});
