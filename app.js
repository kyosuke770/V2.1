let cards = [];

let index = 0;
let revealed = false;
let currentAnswer = "";
let currentJp = "";

const jpEl = document.getElementById("jp");
const enEl = document.getElementById("en");
const cardEl = document.getElementById("card");
const nextBtn = document.getElementById("next");

/* =========================
   CSV Loader
========================= */
async function loadCSV() {
  const res = await fetch("data.csv");
  const text = await res.text();
  cards = parseCSV(text);
  render();
}

function parseCSV(text) {
  const lines = text.trim().split("\n");
  lines.shift(); // header

  return lines.map(line => {
    const cols = splitCSV(line);

    const no = Number(cols[0]);
    const jp = cols[1];
    const en = cols[2];
    const slotsRaw = cols[3];
    const video = cols[4];
    const lv = Number(cols[5]);

    let slots = null;
    if (slotsRaw) {
      slots = slotsRaw.split("|").map(s => {
        const [jp, en] = s.split("=");
        return { jp, en };
      });
    }

    return { no, jp, en, slots, video, lv };
  });
}
// カンマ対応CSV split（Safari OK）
function splitCSV(line) {
  const result = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result.map(s => s.replace(/^"|"$/g, ""));
}

/* =========================
   Card Logic
========================= */
function pickSlot(card) {
  if (!card.slots) return null;
  const i = Math.floor(Math.random() * card.slots.length);
  return card.slots[i];
}

function render() {
  if (!cards.length) return;

  const card = cards[index];
  const slot = pickSlot(card);

  if (slot) {
    currentJp = card.jp.replace("{x}", slot.jp);
    currentAnswer = card.en.replace("{x}", slot.en);
    jpEl.textContent = currentJp;
    enEl.textContent = revealed
      ? currentAnswer
      : card.en.replace("{x}", "___");
  } else {
    currentJp = card.jp;
    currentAnswer = card.en;
    jpEl.textContent = currentJp;
    enEl.textContent = revealed ? currentAnswer : "タップして答え";
  }
}

cardEl.addEventListener("click", () => {
  revealed = !revealed;
  enEl.textContent = revealed ? currentAnswer : "タップして答え";
});

nextBtn.addEventListener("click", () => {
  index = (index + 1) % cards.length;
  revealed = false;
  render();
});

/* =========================
   Init
========================= */
loadCSV();
