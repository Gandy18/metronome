let bpm = 120;
let isRunning = false;
let intervalId = null;
let currentBeat = 1;

const beatEl = document.getElementById("beat");
const bpmEl = document.getElementById("bpm");
const app = document.getElementById("app");

function updateBPMDisplay() {
  bpmEl.textContent = `${bpm} BPM`;
}

function updateBeat() {
  beatEl.textContent = currentBeat;
  currentBeat = currentBeat % 4 + 1;
}

function startMetronome() {
  const interval = 60000 / bpm;
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
document.body.addEventListener("touchstart", handleScreenTap);
document.body.addEventListener("click", handleScreenTap);

app.addEventListener("touchstart", toggleMetronome);
app.addEventListener("click", toggleMetronome); // for desktop

updateBPMDisplay();
