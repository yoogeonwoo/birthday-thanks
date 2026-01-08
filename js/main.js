const $ = (s) => document.querySelector(s);

const envelope = $("#envelope");

const modalLetter = $("#modalLetter");
const modalName = $("#modalName");
const modalReply = $("#modalReply");

const btnOpenLetter = $("#btnOpenLetter");
const btnOpenInbox = $("#btnOpenInbox");
const btnCheckName = $("#btnCheckName");

const nameInput = $("#nameInput");
const replyTitle = $("#replyTitle");
const replyBody = $("#replyBody");

let repliesCache = null;
let isAnimating = false;

const openModal = (m) => {
  m.classList.add("is-open");
  m.setAttribute("aria-hidden", "false");
};

const closeModal = (m) => {
  m.classList.remove("is-open");
  m.setAttribute("aria-hidden", "true");
};

document.addEventListener("click", (e) => {
  const key = e.target?.dataset?.close;
  if (!key) return;

  if (key === "modalLetter") {
    closeModal(modalLetter);
    envelope.classList.remove("is-opening");
    isAnimating = false;
  }
  if (key === "modalName") closeModal(modalName);
  if (key === "modalReply") closeModal(modalReply);
});

const loadReplies = async () => {
  if (repliesCache) return repliesCache;
  try {
    const res = await fetch("./data/replies.json", { cache: "no-store" });
    if (!res.ok) { repliesCache = {}; return repliesCache; }
    const json = await res.json();
    repliesCache = (json && typeof json === "object") ? json : {};
    return repliesCache;
  } catch {
    repliesCache = {};
    return repliesCache;
  }
};

btnOpenLetter.addEventListener("click", () => {
  if (isAnimating) return;
  isAnimating = true;

  envelope.classList.add("is-opening");

  window.setTimeout(() => {
    openModal(modalLetter);
    const sc = document.querySelector("#modalLetter .paperScroll");
    if (sc) sc.scrollTop = 0;
    isAnimating = false;
  }, 860);
});

btnOpenInbox.addEventListener("click", async () => {
  await loadReplies();
  nameInput.value = "";
  openModal(modalName);
  try { nameInput.focus({ preventScroll: true }); } catch {}
});

const tryOpenReply = async () => {
  const name = nameInput.value;
  if (!name) return;

  const data = await loadReplies();
  const msg = data[name];
  if (!msg) return;

  closeModal(modalName);
  replyTitle.textContent = `${name}님께`;
  replyBody.textContent = String(msg);
  openModal(modalReply);
};

btnCheckName.addEventListener("click", () => { void tryOpenReply(); });

nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") void tryOpenReply();
});
