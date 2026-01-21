// Mobile menu
const menu = document.querySelector("[data-menu]");
const toggle = document.querySelector("[data-menu-toggle]");
if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // close menu when clicking a link
  menu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Reveal on scroll
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add("show");
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// ===== Smart Email/Call buttons (Hero chips) =====
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const EMAIL = "renielsantiago09@gmail.com";
const PHONE_DISPLAY = "0981 285 0176";
const PHONE_TEL = "+639812850176";
const GMAIL_COMPOSE =
  "https://mail.google.com/mail/?view=cm&fs=1" +
  "&to=" + encodeURIComponent(EMAIL) +
  "&su=" + encodeURIComponent("Portfolio Inquiry - Reniel Santiago");

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    alert("Copied:\n" + text);
  } catch (e) {
    prompt("Copy this:", text);
  }
}

document.getElementById("emailBtn")?.addEventListener("click", async () => {
  if (isMobile) {
    window.location.href =
      `mailto:${EMAIL}?subject=${encodeURIComponent("Portfolio Inquiry - Reniel Santiago")}`;
    return;
  }

  const w = window.open(GMAIL_COMPOSE, "_blank", "noopener,noreferrer");
  if (!w) await copyToClipboard(EMAIL);
});

document.getElementById("callBtn")?.addEventListener("click", async () => {
  if (isMobile) {
    window.location.href = "tel:" + PHONE_TEL;
    return;
  }
  await copyToClipboard(PHONE_DISPLAY);
});

// ===== Toast + Contact form (AJAX FormSubmit) =====
const toast = document.getElementById("toast");
const toastClose = document.getElementById("toastClose");
const contactForm = document.getElementById("contactForm");
const sendBtn = document.getElementById("sendBtn");

// Use the AJAX endpoint to avoid FormSubmit pages/logos
const FORMSUBMIT_AJAX = "https://formsubmit.co/ajax/renielsantiago09@gmail.com";

function showToast() {
  toast?.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast?.classList.remove("show"), 4500);
}
toastClose?.addEventListener("click", () => toast?.classList.remove("show"));

contactForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd = new FormData(contactForm);
  fd.append("_subject", "Portfolio Inquiry — Reniel G. Santiago");
  fd.append("_captcha", "false");
  fd.append("_template", "table");

  try {
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.textContent = "Sending...";
    }

    const res = await fetch(FORMSUBMIT_AJAX, {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: fd
    });

    if (!res.ok) throw new Error("Send failed");

    contactForm.reset();
    showToast();
  } catch (err) {
    alert("Failed to send. Please try again or use the Email button.");
  } finally {
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.textContent = "Send message";
    }
  }
});

// ========= Gallery modal (supports .png + .jpg + .jpeg) =========
const modal = document.querySelector("[data-modal]");
const imgEl = document.getElementById("galleryImg");
const titleEl = document.getElementById("galleryTitle");
const counterEl = document.getElementById("galleryCounter");
const thumbsEl = document.getElementById("thumbs");

const EXTENSIONS = ["png", "jpg", "jpeg"];

const galleries = {
  "bitsys": {
    title: "BiTSys (20)",
    baseItems: Array.from({length: 20}, (_, i) => `images/projects/bitsys/${i+1}`)
  },
  "enrollment": {
    title: "Enrollment System (19)",
    baseItems: Array.from({length: 19}, (_, i) => `images/projects/enrollment/${i+1}`)
  },
  "template": {
    title: "Website Template Design (6)",
    baseItems: Array.from({length: 6}, (_, i) => `images/projects/template/${i+1}`)
  },
  "ppt-bitsys": {
    title: "BiTSys.ppt (12)",
    baseItems: Array.from({length: 12}, (_, i) => `images/designs/ppt-bitsys/${i+1}`)
  },
  "ppt-debriment": {
    title: "Debriment.ppt (16)",
    baseItems: Array.from({length: 16}, (_, i) => `images/designs/ppt-debriment/${i+1}`)
  },
  "visual": {
    title: "Visual Design (10)",
    baseItems: Array.from({length: 10}, (_, i) => `images/designs/visual/${i+1}`)
  },
  "certs": {
    title: "Certifications (6)",
    baseItems: Array.from({length: 6}, (_, i) => `images/certifications/${i+1}`)
  }
};

let current = { key: null, index: 0 };
const resolvedCache = new Map();

async function resolveImageURL(basePath){
  if (resolvedCache.has(basePath)) return resolvedCache.get(basePath);

  for (const ext of EXTENSIONS) {
    const url = `${basePath}.${ext}`;
    try {
      const res = await fetch(url, { method: "HEAD", cache: "no-store" });
      if (res.ok) {
        resolvedCache.set(basePath, url);
        return url;
      }
    } catch (err) {
      break;
    }
  }

  resolvedCache.set(basePath, null);
  return null;
}

function openGallery(key){
  const g = galleries[key];
  if (!g) return;

  current.key = key;
  current.index = 0;

  titleEl.textContent = g.title;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  renderThumbs();
  showImage(0);
}

function closeGallery(){
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

async function showImage(idx){
  const g = galleries[current.key];
  if (!g) return;

  current.index = (idx + g.baseItems.length) % g.baseItems.length;
  const basePath = g.baseItems[current.index];

  counterEl.textContent = `${current.index + 1} / ${g.baseItems.length}`;

  [...thumbsEl.querySelectorAll("button")].forEach((b, i) => {
    b.classList.toggle("active", i === current.index);
  });

  const resolved = await resolveImageURL(basePath);

  if (resolved) {
    imgEl.alt = "Gallery image";
    imgEl.onerror = null;
    imgEl.src = resolved;
    return;
  }

  const tryList = EXTENSIONS.map(ext => `${basePath}.${ext}`);
  loadImageFallback(tryList);
}

function loadImageFallback(urls){
  if (!urls.length) {
    imgEl.removeAttribute("src");
    imgEl.alt = "Image not found. Add .png or .jpg files in the correct folder.";
    return;
  }

  const next = urls.shift();
  imgEl.alt = "Loading image...";
  imgEl.src = next;

  imgEl.onerror = () => loadImageFallback(urls);
}

function renderThumbs(){
  const g = galleries[current.key];
  thumbsEl.innerHTML = "";
  g.baseItems.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = String(i + 1);
    b.addEventListener("click", () => showImage(i));
    thumbsEl.appendChild(b);
  });
}

document.querySelectorAll("[data-open-gallery]").forEach(btn => {
  btn.addEventListener("click", () => openGallery(btn.dataset.openGallery));
});

document.querySelectorAll("[data-close-modal]").forEach(el => {
  el.addEventListener("click", closeGallery);
});

document.querySelector("[data-prev]")?.addEventListener("click", () => showImage(current.index - 1));
document.querySelector("[data-next]")?.addEventListener("click", () => showImage(current.index + 1));

window.addEventListener("keydown", (e) => {
  if (!modal.classList.contains("open")) return;
  if (e.key === "Escape") closeGallery();
  if (e.key === "ArrowLeft") showImage(current.index - 1);
  if (e.key === "ArrowRight") showImage(current.index + 1);
});

// Touch swipe
let touchX = null;
imgEl?.addEventListener("touchstart", (e) => {
  touchX = e.touches[0].clientX;
}, { passive: true });

imgEl?.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) showImage(current.index + (dx < 0 ? 1 : -1));
  touchX = null;
}, { passive: true });
