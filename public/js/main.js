/* =========================================================
   NANOBO — Interactions générales (menu, accordéons, reveal…)
   ========================================================= */

/* ---------- Menu mobile ---------- */
function initMobileMenu() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".mobile-menu");
  const closeBtn = document.querySelector(".mobile-menu-close");
  if (!toggle || !menu) return;
  const open = () => menu.classList.add("open");
  const close = () => menu.classList.remove("open");
  toggle.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);
  menu.addEventListener("click", (e) => {
    if (e.target === menu) close();
  });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
}

/* ---------- Filtres mobile (page boutique) ---------- */
function initMobileFilters() {
  const toggle = document.querySelector(".mobile-filter-toggle");
  const panel = document.querySelector(".filters-panel");
  const overlay = document.querySelector(".filters-overlay");
  if (!toggle || !panel) return;
  toggle.addEventListener("click", () => {
    panel.classList.add("open");
    if (overlay) overlay.classList.add("open");
  });
  if (overlay) {
    overlay.addEventListener("click", () => {
      panel.classList.remove("open");
      overlay.classList.remove("open");
    });
  }
}

/* ---------- Accordéons ---------- */
function initAccordions() {
  document.querySelectorAll(".accordion-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest(".accordion-item");
      const body = item.querySelector(".accordion-body");
      const isOpen = item.classList.contains("open");

      /* referme les autres items du même groupe */
      const group = item.closest("[data-accordion-group]");
      if (group) {
        group.querySelectorAll(".accordion-item.open").forEach((other) => {
          if (other !== item) {
            other.classList.remove("open");
            other.querySelector(".accordion-body").style.maxHeight = null;
          }
        });
      }

      if (isOpen) {
        item.classList.remove("open");
        body.style.maxHeight = null;
      } else {
        item.classList.add("open");
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });
}

/* ---------- Reveal au scroll ---------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal:not(.in-view)");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in-view"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  items.forEach((el) => observer.observe(el));
}

/* ---------- Bouton retour en haut ---------- */
function initBackToTop() {
  const btn = document.querySelector(".back-to-top");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.classList.toggle("show", window.scrollY > 500);
  });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ---------- Newsletter (démo, pas d'envoi réel) ---------- */
function initNewsletterForms() {
  document.querySelectorAll(".newsletter-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input[type=email]");
      const btn = form.querySelector("button");
      if (input && input.value) {
        const original = btn.textContent;
        btn.textContent = "Merci ! ✓";
        input.value = "";
        setTimeout(() => (btn.textContent = original), 2500);
      }
    });
  });
}

/* ---------- Stepper de quantité générique ---------- */
function initQtySteppers() {
  document.querySelectorAll(".qty-stepper").forEach((stepper) => {
    const input = stepper.querySelector("input");
    const [minusBtn, plusBtn] = stepper.querySelectorAll("button");
    if (!input) return;
    const clamp = (v) => Math.max(1, Math.min(99, v));
    minusBtn?.addEventListener("click", () => {
      input.value = clamp((parseInt(input.value, 10) || 1) - 1);
      input.dispatchEvent(new Event("change"));
    });
    plusBtn?.addEventListener("click", () => {
      input.value = clamp((parseInt(input.value, 10) || 1) + 1);
      input.dispatchEvent(new Event("change"));
    });
    input.addEventListener("change", () => {
      input.value = clamp(parseInt(input.value, 10) || 1);
    });
  });
}

/* ---------- Formulaire de contact (démo) ---------- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const box = document.getElementById("contact-success");
    form.style.display = "none";
    if (box) box.style.display = "block";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initMobileFilters();
  initAccordions();
  initReveal();
  initBackToTop();
  initNewsletterForms();
  initQtySteppers();
  initContactForm();
});
