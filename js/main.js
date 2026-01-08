(() => {
  const $ = (s) => document.querySelector(s);

  /* =========================
     Elements
     ========================= */
  const envelope = $("#envelope");

  const modalLetter = $("#modalLetter");
  const modalName   = $("#modalName");
  const modalReply  = $("#modalReply");

  const btnOpenLetter = $("#btnOpenLetter");
  const btnOpenInbox  = $("#btnOpenInbox");
  const btnCheckName  = $("#btnCheckName");

  const nameInput = $("#nameInput");
  const replyTitle = $("#replyTitle");
  const replyBody  = $("#replyBody");

  /* =========================
     Safety check (버튼 먹통 방지)
     ========================= */
  const required = [
    envelope,
    modalLetter, modalName, modalReply,
    btnOpenLetter, btnOpenInbox, btnCheckName,
    nameInput, replyTitle, replyBody
  ];

  if (required.some(el => !el)) {
    console.warn("[init] required element missing");
    return;
  }

  /* =========================
     State
     ========================= */
  let repliesCache = null;
  let isAnimating = false;

  /* =========================
     Modal helpers
     ========================= */
  const openModal = (m) => {
    m.classList.add("is-open");
    m.setAttribute("aria-hidden", "false");
  };

  const closeModal = (m) => {
    m.classList.remove("is-open");
    m.setAttribute("aria-hidden", "true");
  };

  /* =========================
     Global close (X / backdrop)
     ========================= */
  document.addEventListener("click", (e) => {
    const key = e.target?.dataset?.close;
    if (!key) return;

    if (key === "modalLetter") {
      closeModal(modalLetter);
      envelope.classList.remove("is-opening");
      isAnimating = false;
    }

    if (key === "modalName")  closeModal(modalName);
    if (key === "modalReply") closeModal(modalReply);
  });

  /* =========================
     Load replies
     ========================= */
  const loadReplies = async () => {
    if (repliesCache) return repliesCache;

    try {
      const res = await fetch("data/replies.json", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");

      const json = await res.json();
      repliesCache = (json && typeof json === "object") ? json : {};
      return repliesCache;
    } catch {
      repliesCache = {};
      return repliesCache;
    }
  };

  /* =========================
     Envelope open → letter modal
     ========================= */
  btnOpenLetter.addEventListener("click", () => {
    if (isAnimating) return;
    isAnimating = true;

    envelope.classList.add("is-opening");

    setTimeout(() => {
      openModal(modalLetter);
      isAnimating = false;
    }, 680);
  });

  /* =========================
     Inbox → name input
     ========================= */
  btnOpenInbox.addEventListener("click", async () => {
    await loadReplies();
    nameInput.value = "";
    openModal(modalName);

    try {
      nameInput.focus({ preventScroll: true });
    } catch {}
  });

  /* =========================
     Open personal reply
     ========================= */
  const tryOpenReply = async () => {
    const name = nameInput.value.trim();
    if (!name) return;

    const data = await loadReplies();
    const msg = data[name];
    if (!msg) return;

    closeModal(modalName);

    replyTitle.textContent = `${name}님께`;
    replyBody.textContent = String(msg);

    openModal(modalReply);
  };

  btnCheckName.addEventListener("click", tryOpenReply);

  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryOpenReply();
  });

})();
