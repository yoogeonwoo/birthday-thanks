const envelope = document.getElementById("envelope");

const btnOpenLetter = document.getElementById("btnOpenLetter");
const btnOpenInbox  = document.getElementById("btnOpenInbox");
const btnCheckName  = document.getElementById("btnCheckName");

const modalLetter = document.getElementById("modalLetter");
const modalName   = document.getElementById("modalName");
const modalReply  = document.getElementById("modalReply");

const nameInput  = document.getElementById("nameInput");
const replyTitle = document.getElementById("replyTitle");
const replyBody  = document.getElementById("replyBody");

let repliesCache = null;

function show(el){ el.classList.add("show"); el.setAttribute("aria-hidden","false"); }
function hide(el){ el.classList.remove("show"); el.setAttribute("aria-hidden","true"); }

async function loadReplies(){
  if (repliesCache) return repliesCache;
  try{
    const res = await fetch("./data/replies.json", { cache:"no-store" });
    if(!res.ok){ repliesCache = {}; return repliesCache; }
    const json = await res.json();
    repliesCache = (json && typeof json === "object") ? json : {};
    return repliesCache;
  }catch{
    repliesCache = {};
    return repliesCache;
  }
}

btnOpenLetter.addEventListener("click", () => {
  envelope.classList.add("open");
  window.setTimeout(() => {
    show(modalLetter);
    const sc = modalLetter.querySelector(".paper-scroll");
    if (sc) sc.scrollTop = 0;
  }, 860);
});

btnOpenInbox.addEventListener("click", async () => {
  await loadReplies();
  nameInput.value = "";
  show(modalName);
  try{ nameInput.focus({ preventScroll:true }); }catch{}
});

btnCheckName.addEventListener("click", async () => {
  const name = nameInput.value;
  if (!name) return;

  const data = await loadReplies();
  const msg = data[name];
  if (!msg) return;

  hide(modalName);
  replyTitle.textContent = `${name}님께`;
  replyBody.textContent = String(msg);
  show(modalReply);
});

nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btnCheckName.click();
});

document.addEventListener("click", (e) => {
  const closeKey = e.target?.dataset?.close;
  if (!closeKey) return;

  const target = document.getElementById(closeKey);
  if (target) hide(target);

  envelope.classList.remove("open");
});
