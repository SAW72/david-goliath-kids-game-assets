import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { SCENES, INTERLUDE, LEVELS } = require("../js/story.js");
const { createFlow } = require("../js/flow.js");

function flowWithClock() {
  let t = 10_000;
  const flow = createFlow(SCENES, () => t);
  return {
    flow,
    tick(ms) { t += ms; }
  };
}

function beginStory(flow, tick) {
  const welcome = flow.startStory();
  assert.equal(welcome.type, "interlude");
  assert.equal(welcome.kind, "welcome");
  tick(500);
  const scene = flow.closeInterlude();
  assert.equal(scene.type, "scene");
  assert.equal(scene.state.index, 0);
  assert.equal(scene.state.scene.id, "jesse");
  return scene;
}

test("numbered story is 7 scenes; shepherd clip is the interlude", () => {
  const files = SCENES.map((s) => s.file);
  assert.equal(INTERLUDE.file, "videos/01-david-shepherd-boy.mp4");
  assert.equal(files[0], "videos/08-jesse-sends-david.mp4");
  assert.ok(files.includes("videos/03-david-with-sheep.mp4"));
  assert.ok(files.includes("videos/05-david-fights-lion.mp4"));
  assert.ok(files.includes("videos/06-david-fights-bear.mp4"));
  assert.ok(files.includes("videos/07-david-tells-saul-lion-bear.mp4"));
  assert.ok(files.includes("videos/02-goliath-philistine-champion.mp4"));
  assert.ok(files.includes("videos/04-david-vs-goliath-victory.mp4"));
  assert.equal(SCENES.length, 7);
  assert.ok(!files.includes(INTERLUDE.file));
  assert.equal(SCENES.find((s) => s.id === "sheep").interludeAfter, true);
});

test("levels stay gentle for a toddler", () => {
  assert.ok(LEVELS.easy.sheep <= 2);
  assert.ok(LEVELS.hard.sheep <= 4);
  assert.ok(LEVELS.hard.stone <= 5);
  assert.ok(LEVELS.hard.confetti <= 32);
});

test("Next does not skip an unfinished mini", () => {
  const { flow, tick } = flowWithClock();
  beginStory(flow, tick);
  tick(500);
  assert.equal(flow.requestNext().type, "scene");
  tick(500);
  const mini = flow.requestNext();
  assert.equal(mini.type, "startMini");
  assert.equal(mini.mini, "sheep");
  tick(500);
  assert.equal(flow.requestNext().type, "ignore");
  assert.equal(flow.snapshot().index, 1);
  assert.equal(flow.snapshot().miniOpen, true);
});

test("sheep mini leads to the hills interlude, then the lion scene", () => {
  const { flow, tick } = flowWithClock();
  beginStory(flow, tick);
  tick(500);
  flow.requestNext();
  tick(500);
  flow.requestNext();
  const hills = flow.completeMini();
  assert.equal(hills.type, "interlude");
  assert.equal(hills.kind, "between");
  assert.equal(flow.snapshot().index, 1);
  tick(500);
  const after = flow.closeInterlude();
  assert.equal(after.type, "scene");
  assert.equal(after.state.index, 2);
  assert.equal(after.state.scene.id, "lion");
});

test("tap-in bonus interlude does not advance the story", () => {
  const { flow, tick } = flowWithClock();
  beginStory(flow, tick);
  const bonus = flow.openBonus();
  assert.equal(bonus.type, "interlude");
  assert.equal(bonus.kind, "bonus");
  assert.equal(flow.snapshot().index, 0);
  tick(500);
  const back = flow.closeInterlude();
  assert.equal(back.type, "resumeScene");
  assert.equal(back.state.index, 0);
});

test("pause blocks Next; home resets", () => {
  const { flow, tick } = flowWithClock();
  beginStory(flow, tick);
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
  assert.equal(flow.snapshot().interludeOpen, false);
});

test("rapid Next is locked so two taps do not skip two scenes", () => {
  const { flow, tick } = flowWithClock();
  beginStory(flow, tick);
  tick(500);
  assert.equal(flow.requestNext().type, "scene");
  assert.equal(flow.requestNext().type, "ignore");
  tick(500);
  assert.equal(flow.requestNext().type, "startMini");
});

test("story can reach the end screen", () => {
  const { flow, tick } = flowWithClock();
  let action = flow.startStory();
  for (let i = 0; i < 30; i++) {
    tick(500);
    if (action.type === "interlude") action = flow.closeInterlude();
    else if (action.type === "startMini") action = flow.completeMini();
    else if (action.type === "end") break;
    else action = flow.requestNext();
  }
  assert.equal(action.type, "end");
  assert.equal(flow.snapshot().finished, true);
});
