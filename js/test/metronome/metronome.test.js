const assert = require("assert").strict;
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const htmlPath = path.resolve(__dirname, "../../../metronome/index.html"); // update to your actual path
const html = fs.readFileSync(htmlPath, "utf8");

describe("Metronome embedded script (real HTML)", function () {
  let dom;
  let window;
  let document;
  let metronome;

  beforeEach(() => {
    dom = new JSDOM(html, {
      url: "http://localhost/",
      runScripts: "dangerously",
      resources: "usable",
      pretendToBeVisual: true,
      // Ensure mocks exist before your embedded script runs
      beforeParse(win) {
        // Minimal AudioContext mock
        win.AudioContext = class {
          constructor() { this.currentTime = 0; this.state = "running"; }
          createOscillator() {
            return {
              type: "sine",
              frequency: { setValueAtTime() {} },
              connect() { return this; },
              start() {},
              stop() {}
            };
          }
          createGain() {
            return {
              gain: {
                setValueAtTime() {},
                exponentialRampToValueAtTime() {},
                linearRampToValueAtTime() {}
              },
              connect() { return this; }
            };
          }
          createAnalyser() {
            return {
              fftSize: 0,
              getFloatTimeDomainData(buf) { buf.fill(0); },
              connect() {},
              disconnect() {}
            };
          }
          createMediaStreamSource(stream) {
            // Validate correct type in tests
            if (!(stream instanceof win.MediaStream)) {
              throw new TypeError("createMediaStreamSource expects MediaStream");
            }
            return { connect() {}, disconnect() {} };
          }
          resume() { this.state = "running"; return Promise.resolve(); }
          close() { this.state = "closed"; return Promise.resolve(); }
        };

        // Minimal MediaStream mock
        win.MediaStreamTrack = class {
          constructor() { this.enabled = true; }
          stop() { this.enabled = false; }
        };
        win.MediaStream = class {
          constructor() { this._tracks = [new win.MediaStreamTrack()]; }
          getTracks() { return this._tracks; }
          getAudioTracks() { return this._tracks; }
        };

        // Navigator/mediaDevices mock (used by enableMic)
        win.navigator = win.navigator || {};
        win.navigator.mediaDevices = {
          getUserMedia: async () => new win.MediaStream()
        };

        // requestAnimationFrame mock used by tuner loop
        win.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 5);
        win.cancelAnimationFrame = id => clearTimeout(id);
        win.performance = { now: () => Date.now() };
      }
    });

    window = dom.window;
    document = window.document;

    // Wait for the DOM to be interactive; inline scripts execute during parsing
    metronome = window.metronome;
    assert.ok(metronome, "window.metronome not found; ensure you export it in HTML");
  });

  afterEach(() => {
    dom.window.close();
  });

  it("defaults tempo to 120 if invalid", () => {
    const tempo = document.getElementById("tempo");
    tempo.value = "0";
    const bpm = metronome.getTempo();
    assert.equal(bpm, 120);
    assert.equal(tempo.value, "120");
  });

  it("startMetronome updates status and sets running state", () => {
    // Ensure required elements exist even if your HTML differs
    const text = document.getElementById("metronomeText") || document.body.appendChild(Object.assign(document.createElement("div"), { id: "metronomeText" }));
    metronome.startMetronome();
    assert.match(text.textContent, /Playing|subdivisions/);
  });

  it("stopMetronome updates status", () => {
    const text = document.getElementById("metronomeText") || document.body.appendChild(Object.assign(document.createElement("div"), { id: "metronomeText" }));
    metronome.startMetronome();
    metronome.stopMetronome();
    assert.equal(text.textContent, "Stopped");
  });

  it("playClick sets dot opacity for strong beat", () => {
    const dot = document.getElementById("metronomeDot") || document.body.appendChild(Object.assign(document.createElement("div"), { id: "metronomeDot" }));
    metronome.playClick(true);
    assert.equal(dot.style.opacity, "1");
  });

  it("pauses mic when metronome starts and resumes on stop", async () => {
    // Prepare a live mic
    await window.AudioContext.prototype.resume.call(window.audioCtx || new window.AudioContext());
    // Explicitly enable mic via your exported function if available
    if (metronome.enableMic) {
      await metronome.enableMic();
    } else {
      // Manually set a micStream to simulate enabled mic
      window.micStream = new window.MediaStream();
      const analyser = (window.analyser = window.audioCtx.createAnalyser());
      const micSource = (window.micSource = window.audioCtx.createMediaStreamSource(window.micStream));
      micSource.connect(analyser);
    }

    const track = window.micStream.getAudioTracks()[0];
    assert.equal(track.enabled, true, "mic should start enabled");

    metronome.startMetronome();
    assert.equal(track.enabled, false, "mic should be paused on metronome start");

    metronome.stopMetronome();
    assert.equal(track.enabled, true, "mic should resume on metronome stop");
  });

  it("does not throw when changing waveform while tone is playing", () => {
    // Simulate tone playing
    const dial = document.getElementById("noteDial") || document.body.appendChild(Object.assign(document.createElement("input"), { id: "noteDial", value: "30", min: "0", max: "60" }));
    const waveform = document.getElementById("waveform") || document.body.appendChild(Object.assign(document.createElement("select"), { id: "waveform" }));
    const optSine = document.createElement("option"); optSine.value = "sine"; waveform.appendChild(optSine);
    const optPiano = document.createElement("option"); optPiano.value = "piano"; waveform.appendChild(optPiano);

    // Start tone
    const { f } = window.dialToNote ? window.dialToNote(30) : { f: 440 };
    window.playTone ? window.playTone(f, "sine") : null;

    // Switch waveform
    waveform.value = "piano";
    assert.doesNotThrow(() => window.updateWaveform ? window.updateWaveform() : null);
  });
});
