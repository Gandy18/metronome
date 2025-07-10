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
const unitSelector = document.getElementById("unit");

beatsSelector.addEventListener("change", () => {
  beatsPerMeasure = parseInt(beatsSelector.value, 10);
  currentBeat = 1;
});

unitSelector.addEventListener("change", () => {
  beatUnit = parseInt(unitSelector.value, 10);
});

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTick(accented = false) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "square";
  oscillator.frequency.value = accented ? 1000 : 600;
  gainNode.gain.value = 0.1;

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.05);
}

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

  const accented = currentBeat === 1;
  if (accented) {
    beatEl.classList.add("pulse");
    setTimeout(() => beatEl.classList.remove("pulse"), 300);
  }

  playTick(accented);

  // Trigger subdivisions
  const subdivisions = beatUnit === 8 ? 2 : beatUnit === 16 ? 4 : 1;
  triggerSubPulses(subdivisions);

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

function triggerSubPulses(count) {
  const container = document.getElementById("sub-pulses");
  container.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const dot = document.createElement("div");
    dot.className = "sub-pulse";
    container.appendChild(dot);

    setTimeout(() => {
      dot.style.opacity = "1";
    }, i * 100); // staggered timing
  }

  setTimeout(() => {
    container.innerHTML = "";
  }, count * 100 + 300);
}

