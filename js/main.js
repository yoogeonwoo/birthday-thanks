(() => {
  const $ = (s) => document.querySelector(s);

  const openModal = (m) => {
    if (!m) return;
    m.classList.add("is-open");
    m.setAttribute("aria-hidden", "false");
  };

  const closeModal = (m) => {
    if (!m) return;
    m.classList.remove("is-open");
    m.setAttribute("aria-hidden", "true");
  };

  const loadRepliesFactory = () => {
    let cache = null;
    return async () => {
      if (cache) return cache;
      try {
        const res = await fetch("data/replies.json", { cache: "no-store" });
        if (!res.ok) { cache = {}; return cache; }
        const json = await res.json();
        cache = (json && typeof json === "object") ? json : {};
        return cache;
      } catch {
        cache = {};
        return cache;
      }
    };
  };

  const init = () => {
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

    const must = [
      ["#envelope", envelope],
      ["#modalLetter", modalLetter],
      ["#modalName", modalName],
      ["#modalReply", modalReply],
      ["#btnOpenLetter", btnOpenLetter],
      ["#btnOpenInbox", btnOpenInbox],
      ["#btnCheckName", btnCheckName],
      ["#nameInput", nameInput],
      ["#replyTitle", replyTitle],
      ["#replyBody", replyBody],
    ];
    const missing = must.filter(([, el]) => !el).map(([sel]) => sel);
    if (missing.length) {
      console.warn("[init] Missing elements:", missing);
      return;
    }

    let isAnimating = false;
    const loadReplies = loadRepliesFactory();

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

    btnOpenLetter.addEventListener("click", () => {
      if (isAnimating) return;
      isAnimating = true;

      envelope.classList.add("is-opening");

      window.setTimeout(() => {
        openModal(modalLetter);
        isAnimating = false;
      }, 680);
    });

    btnOpenInbox.addEventListener("click", async () => {
      await loadReplies();
      nameInput.value = "";
      openModal(modalName);
      try { nameInput.focus({ preventScroll: true }); } catch {}
    });

    const tryOpenReply = async () => {
      const name = nameInput.value?.trim();
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
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
