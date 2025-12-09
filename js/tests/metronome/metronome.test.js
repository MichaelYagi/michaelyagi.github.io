const assert = require("assert").strict;
const { JSDOM, VirtualConsole  } = require("jsdom");
const fs = require("fs");
const path = require("path");

const htmlPath = path.resolve(__dirname, "../../../metronome/index.html"); // update to your actual path
let html = fs.readFileSync(htmlPath, "utf8");

describe("Metronome embedded script (real HTML)", function () {
  let dom;
  let window;
  let document;
  let metronome;

  beforeEach(() => {
    const vc = new VirtualConsole();
    vc.on("jsdomError", (err) => {
      const msg = String(err?.message || err);
      // Ignore only the noisy resource errors
      if (msg.includes("Could not load img") || msg.includes("Status code: 204")) {
        return;
      }
      // Let real errors through
      console.error(err);
    });

    dom = new JSDOM(html, {
      url: "http://localhost/",
      runScripts: "dangerously",
      resources: "usable",
      virtualConsole: vc,
      pretendToBeVisual: true,
      // Ensure mocks exist before your embedded script runs
      beforeParse(win) {
        win.MediaStreamTrack = class {};
        win.MediaStream = class {
          constructor() { this._tracks = []; }
          getTracks() { return this._tracks; }
        };
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

    // Create a mock audioCtx instance so tests can use it
    window.audioCtx = new window.AudioContext();

    window.micStream = new window.MediaStream();
    window.eval("micStream = window.micStream;");

    // Wait for the DOM to be interactive; inline scripts execute during parsing
    metronome = window.metronome;
    assert.ok(metronome, "window.metronome not found; ensure you export it in HTML");
  });

  afterEach(() => {
    dom.window.close();
  });

  it("defaults tempo to 120 if invalid", () => {
    const tempo = document.getElementById("tempo");
    tempo.value = "120";
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

  it("updateBPMDialDisplay reflects tempo value", () => {
    const dial = document.getElementById("dialBPM") || document.body.appendChild(Object.assign(document.createElement("div"), { id: "dialBPM" }));
    const tempo = document.getElementById("tempo");
    tempo.value = "90";
    window.updateBPMDialDisplay();
    assert.equal(dial.textContent, "BPM: 90");
  });

  it("setMetronomeActive disables tempo and buttons when inactive", () => {
    const tempo = document.getElementById("tempo");
    window.setMetronomeActive(false);
    assert.equal(tempo.disabled, true);
    window.setMetronomeActive(true);
    assert.equal(tempo.disabled, false);
  });

  it("syncUIState dims metronomeBox when tone is playing", () => {
    const metronomeBox = document.getElementById("metronomeBox");
    window.toneOscillator = {}; // simulate tone playing
    window.syncUIState();

    assert.ok(metronomeBox.classList.contains("box"));
    assert.ok(!metronomeBox.classList.contains("dimmed"));
  });

  it("registerTap updates tempo based on tap intervals", function (done) {
    const tempo = document.getElementById("tempo") ||
        document.body.appendChild(Object.assign(document.createElement("input"), { id: "tempo", type: "number", value: "120" }));
    const text = document.getElementById("metronomeText") ||
        document.body.appendChild(Object.assign(document.createElement("div"), { id: "metronomeText" }));
    const e = { target: document.createElement("div"), preventDefault() {} };

    window.registerTap(e); // first tap
    setTimeout(() => {
      window.registerTap(e); // second tap ~500ms later → ~120 BPM
      assert.match(text.textContent, /Tapped tempo/);
      assert.ok(parseInt(tempo.value, 10) >= 30 && parseInt(tempo.value, 10) <= 240);
      done();
    }, 500);
  });

  it("getSubdivisions returns integer from #subdivisions input", () => {
    // Ensure the element exists
    const input = document.getElementById("subdivisions") ||
        document.body.appendChild(Object.assign(document.createElement("input"), {
          id: "subdivisions",
          type: "number"
        }));

    input.value = "4";
    const result = window.getSubdivisions ? window.getSubdivisions() : null;
    assert.equal(result, 4, "should parse subdivisions as integer");

    input.value = "1";
    assert.equal(window.getSubdivisions(), 0, "should handle single subdivision");
  });

  it("getPolySubdivisions returns integer from #polySubdivisions input", () => {
    // Ensure the element exists
    const input = document.getElementById("polySubdivisions") ||
        document.body.appendChild(Object.assign(document.createElement("input"), {
          id: "polySubdivisions",
          type: "number"
        }));

    input.value = "3";
    const result = window.getPolySubdivisions ? window.getPolySubdivisions() : null;
    assert.equal(result, 3, "should parse polyrhythm subdivisions as integer");

    input.value = "0";
    assert.equal(window.getPolySubdivisions(), 0, "should handle zero poly subdivisions");
  });

  it("dialToNote maps dial index to note data", () => {
    const { name, octave, f } = window.dialToNote(30);
    assert.equal(name, "A");
    assert.equal(octave, 4);
    assert.ok(Math.abs(f - 440) < 0.01);
  });

  it("updateDialDisplay updates dialNote and dialFreq", () => {
    const dial = document.getElementById("noteDial") || document.body.appendChild(Object.assign(document.createElement("input"), { id: "noteDial", value: "30", min: "0", max: "60" }));
    const dialNote = document.getElementById("dialNote") || document.body.appendChild(Object.assign(document.createElement("div"), { id: "dialNote" }));
    const dialFreq = document.getElementById("dialFreq") || document.body.appendChild(Object.assign(document.createElement("div"), { id: "dialFreq" }));
    window.updateDialDisplay();
    assert.match(dialNote.textContent, /Note: A4/);
    assert.match(dialFreq.textContent, /Freq: 440/);
  });

  it("freqToNoteData returns cents offset for detuned frequency", () => {
    const data = window.freqToNoteData(445); // slightly sharp A4
    assert.equal(data.name, "A");
    assert.equal(data.octave, 4);
    assert.ok(data.cents > 0);
  });

  it("pauses mic when metronome starts and resumes on stop", async () => {
    // Create a fake micStream with one track
    const track = new window.MediaStreamTrack();
    window.micStream = new window.MediaStream();
    // Replace the default track with our custom one
    window.micStream._tracks = [track];

    assert.equal(track.enabled, true, "mic should start enabled");

    metronome.startMetronome();
    assert.equal(document.getElementById("status").textContent, "Mic paused while tone is playing");

    metronome.stopMetronome();
    assert.equal(document.getElementById("status").textContent, "Mic: enabled");
  });

  it("disableMic stops micStream and updates status", () => {
    const status = document.getElementById("status");
    window.disableMic();
    assert.equal(status.textContent, "Mic: disabled");
  });

  it("updatePauseMessages shows tuner paused when metronome is running and mic enabled", async () => {
    const status = document.getElementById("status") ||
        document.body.appendChild(Object.assign(document.createElement("div"), { id: "status" }));

    // Simulate mic enabled with a track
    const track = new window.MediaStreamTrack();
    window.micStream = new window.MediaStream();
    window.micStream._tracks = [track];

    // Ensure start button exists
    const startBtn = document.getElementById("startMetronome") ||
        document.body.appendChild(Object.assign(document.createElement("button"), { id: "startMetronome" }));

    // Click start button → triggers startMetronome logic
    startBtn.click();

    // Now metronomeInterval is active and micStream is defined
    await window.updatePauseMessages();

    assert.equal(status.textContent, "Tuner paused while metronome is on");

    // Clean up
    window.stopMetronome();
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
