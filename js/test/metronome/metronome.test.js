import { strict as assert } from "assert";
import { JSDOM } from "jsdom";

// Import your metronome module here
import { startMetronome, stopMetronome, playClick, getTempo } from "../../../tuner.html";

describe("Metronome", function () {
  let dom;
  let document;

  beforeEach(() => {
    // Setup a fake DOM
    dom = new JSDOM(`<!DOCTYPE html>
      <body>
        <div id="metronomeBox"></div>
        <input id="tempo" value="120" />
        <input id="subdivisions" value="1" />
        <input id="polySubdivisions" value="0" />
        <div id="metronomeText"></div>
        <div id="metronomeDot"></div>
        <div id="subdivisionDot"></div>
        <button id="startMetronome"></button>
        <button id="stopMetronome"></button>
        <select id="clickSound"><option value="square"></option></select>
      </body>`);
    document = dom.window.document;

    // Attach globals expected by your code
    global.document = document;
    global.window = dom.window;
    global.performance = { now: () => Date.now() };
    global.setTimeout = dom.window.setTimeout;
    global.clearTimeout = dom.window.clearTimeout;
    global.setInterval = dom.window.setInterval;
    global.clearInterval = dom.window.clearInterval;

    // Mock AudioContext
    global.AudioContext = class {
      constructor() { this.currentTime = 0; }
      createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {} }, type: "" }; }
      createGain() { return { connect: () => {}, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
    };
  });

  it("should default tempo to 120 BPM if invalid", () => {
    document.getElementById("tempo").value = "0";
    const bpm = getTempo();
    assert.equal(bpm, 120);
  });

  it("should start metronome and update text", () => {
    startMetronome();
    const text = document.getElementById("metronomeText").textContent;
    assert.match(text, /Playing|subdivisions/);
  });

  it("should stop metronome and update text", () => {
    startMetronome();
    stopMetronome();
    const text = document.getElementById("metronomeText").textContent;
    assert.equal(text, "Stopped");
  });

  it("should playClick with strong beat", () => {
    // This just ensures no error is thrown
    assert.doesNotThrow(() => playClick(true));
  });

  it("should playClick with subdivision beat", () => {
    assert.doesNotThrow(() => playClick(false));
  });
});
