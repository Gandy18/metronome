let bpm = 120;
let isRunning = false;
let intervalId = null;
let currentBeat = 1;
let lastTap = 0;
let beatsPerMeasure = 4; // default time signature numerator
let beatUnit = 4;

const beatEl = document.getElementById("beat");
const bpmEl = document.getElementById("bpm");
const app = document.getElementById("app");
const beatsSelector = document.getElementById("beats");

beatsSelector.addEventListener("change", () => {
  beatsPerMeasure = parseInt(beatsSelector.value, 10);
  currentBeat = 1;
});

unitSelector.addEventListener("change", () => {
  beatUnit = parseInt(unitSelector.value, 10);
});

function handleScreenTap(e) {
  const isButtonOrEditable =
    e.target.closest("button") || e.target.isContentEditable;
  if (isButtonOrEditable) return;

  const now = Date.now();
  if (now - lastTap > 300) {
    toggleMetronome();
    lastTap = now;
  }
}

function updateBPMDisplay() {
  bpmEl.textContent = `${bpm} BPM`;
}

function updateBeat() {
  beatEl.textContent = currentBeat;

  if (currentBeat === 1) {
    beatEl.classList.add("pulse");
    setTimeout(() => beatEl.classList.remove("pulse"), 300);
  }

  currentBeat = currentBeat % beatsPerMeasure + 1;
}

function startMetronome() {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  // Calculate base note duration in milliseconds
  const baseNoteValue = 4; // quarter note = standard
  const noteRatio = baseNoteValue / beatUnit;

  const interval = (60000 / bpm) * noteRatio;

  updateBeat();
  intervalId = setInterval(updateBeat, interval);
  isRunning = true;
}

function stopMetronome() {
  clearInterval(intervalId);
  isRunning = false;
}

function toggleMetronome() {
  if (document.activeElement === bpmEl) return; // prevent toggle if editing BPM
  isRunning ? stopMetronome() : startMetronome();
}

function handleScreenTap(e) {
  const isButtonOrEditable =
    e.target.closest("button") || e.target.isContentEditable;
  if (!isButtonOrEditable) {
    toggleMetronome();
  }
}

// Handle BPM edits
bpmEl.addEventListener("blur", () => {
  const input = bpmEl.textContent.replace(/\D/g, "");
  const newBPM = parseInt(input, 10);
  if (!isNaN(newBPM) && newBPM >= 40 && newBPM <= 240) {
    bpm = newBPM;
    updateBPMDisplay();
    if (isRunning) {
      stopMetronome();
      startMetronome();
    }
  } else {
    updateBPMDisplay();
  }
});

// Button logic
function changeBPM(delta) {
  bpm = Math.min(240, Math.max(40, bpm + delta));
  updateBPMDisplay();
  if (isRunning) {
    stopMetronome();
    startMetronome();
  }
}

document.getElementById("increase").addEventListener("click", e => {
  e.stopPropagation(); changeBPM(1);
});
document.getElementById("decrease").addEventListener("click", e => {
  e.stopPropagation(); changeBPM(-1);
});
document.getElementById("increase10").addEventListener("click", e => {
  e.stopPropagation(); changeBPM(10);
});
document.getElementById("decrease10").addEventListener("click", e => {
  e.stopPropagation(); changeBPM(-10);
});
document.body.addEventListener("pointerup", handleScreenTap);

updateBPMDisplay();

function applyTapFeedback(btn) {
  btn.classList.add("tap-feedback");
  setTimeout(() => btn.classList.remove("tap-feedback"), 100);
}

["increase", "decrease", "increase10", "decrease10"].forEach(id => {
  const btn = document.getElementById(id);
  btn.addEventListener("pointerup", () => applyTapFeedback(btn));
});
