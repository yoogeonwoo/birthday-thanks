(() => {
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

  /* ✅ 추가: 스크롤 요소/버튼 */
  const replyScroll = $("#replyScroll");
  const replyScrollUp = $("#replyScrollUp");
  const replyScrollDown = $("#replyScrollDown");

  const required = [
    envelope, modalLetter, modalName, modalReply,
    btnOpenLetter, btnOpenInbox, btnCheckName,
    nameInput, replyTitle, replyBody,
    replyScroll, replyScrollUp, replyScrollDown
  ];
  if (required.some(el => !el)) return;

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
      const res = await fetch("data/replies.json", { cache: "no-store" });
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
      isAnimating = false;
    }, 680);
  });

  btnOpenInbox.addEventListener("click", async () => {
    await loadReplies();
    nameInput.value = "";
    openModal(modalName);
    try { nameInput.focus({ preventScroll: true }); } catch {}
  });

  /* =========================
     ✅ 추가: 스크롤 버튼 로직
     ========================= */

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const updateScrollButtons = () => {
    const max = replyScroll.scrollHeight - replyScroll.clientHeight;
    const t = replyScroll.scrollTop;

    const canScroll = max > 2;
    replyScrollUp.style.display = canScroll ? "block" : "none";
    replyScrollDown.style.display = canScroll ? "block" : "none";

    replyScrollUp.disabled = !canScroll || t <= 0;
    replyScrollDown.disabled = !canScroll || t >= max - 1;
  };

  const scrollByAmount = (dir) => {
    const step = Math.round(replyScroll.clientHeight * 0.72); // 한 번에 72% 정도 이동
    const max = replyScroll.scrollHeight - replyScroll.clientHeight;
    const next = clamp(replyScroll.scrollTop + (dir * step), 0, max);
    replyScroll.scrollTo({ top: next, behavior: "smooth" });
  };

  replyScrollUp.addEventListener("click", () => scrollByAmount(-1));
  replyScrollDown.addEventListener("click", () => scrollByAmount(1));
  replyScroll.addEventListener("scroll", () => updateScrollButtons(), { passive: true });

  /* 모달Reply가 열릴 때 항상 맨 위로 + 버튼 상태 갱신 */
  const prepareReplyScroll = () => {
    replyScroll.scrollTop = 0;
    // 레이아웃이 잡힌 뒤 scrollHeight 계산이 정확해지도록 다음 프레임에 갱신
    requestAnimationFrame(() => updateScrollButtons());
    requestAnimationFrame(() => updateScrollButtons());
  };

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

    prepareReplyScroll();
  };

  btnCheckName.addEventListener("click", () => { void tryOpenReply(); });
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") void tryOpenReply();
  });

  /* modalReply 닫았다가 다시 열 때도 버튼 상태 초기화 */
  document.addEventListener("click", (e) => {
    const key = e.target?.dataset?.close;
    if (key === "modalReply") {
      // 닫힐 때 상태 정리(다음 열림 대비)
      requestAnimationFrame(() => updateScrollButtons());
    }
  });
})();
