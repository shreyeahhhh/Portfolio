(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;

  if ("scrollRestoration" in history) { history.scrollRestoration = "manual"; }

  /* ---------------------------------------------------------------------
     Preloader
  --------------------------------------------------------------------- */
  function initPreloader() {
    const preloader = document.getElementById("preloader");
    const fill = document.getElementById("preloadFill");
    const pct = document.getElementById("preloadPct");
    const hero = document.querySelector(".hero");
    if (!preloader) return;

    let progress = 0;
    const finish = () => {
      fill.style.width = "100%";
      pct.textContent = "100%";
      setTimeout(() => {
        preloader.classList.add("is-done");
        hero && hero.classList.add("is-ready");
        document.body.style.removeProperty("overflow");
      }, 260);
    };

    if (prefersReducedMotion) { finish(); return; }

    document.body.style.overflow = "hidden";
    const tick = () => {
      progress += Math.random() * 18 + 6;
      if (progress >= 100) { finish(); return; }
      fill.style.width = progress + "%";
      pct.textContent = Math.floor(progress) + "%";
      setTimeout(tick, 140);
    };
    tick();
    window.addEventListener("load", () => {
      if (progress < 90) { progress = 90; }
    });
  }

  /* ---------------------------------------------------------------------
     Custom cursor (dot + trailing clay blob)
  --------------------------------------------------------------------- */
  function initCursor() {
    if (!isFinePointer) return;
    const dot = document.getElementById("cursorDot");
    const blob = document.getElementById("cursorBlob");
    const label = document.getElementById("cursorLabel");
    if (!dot || !blob) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let bx = mx, by = my;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });

    const loop = () => {
      bx += (mx - bx) * 0.16;
      by += (my - by) * 0.16;
      blob.style.transform = `translate(${bx}px, ${by}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    const hoverTargets = document.querySelectorAll("a, button, [data-cursor]");
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        blob.classList.add("is-hover");
        label.textContent = el.getAttribute("data-cursor") || "";
      });
      el.addEventListener("mouseleave", () => {
        blob.classList.remove("is-hover");
        label.textContent = "";
      });
    });

    document.addEventListener("mouseleave", () => { blob.style.opacity = "0"; dot.style.opacity = "0"; });
    document.addEventListener("mouseenter", () => { blob.style.opacity = "1"; dot.style.opacity = "1"; });
  }

  /* ---------------------------------------------------------------------
     Theme toggle (persisted)
  --------------------------------------------------------------------- */
  function initTheme() {
    const btn = document.getElementById("themeToggle");
    const root = document.documentElement;
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (stored) root.setAttribute("data-theme", stored);
    else if (prefersDark) root.setAttribute("data-theme", "dark");

    btn && btn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }

  /* ---------------------------------------------------------------------
     Mobile menu
  --------------------------------------------------------------------- */
  function initMobileMenu() {
    const burger = document.getElementById("navBurger");
    const closeBtn = document.getElementById("mobileClose");
    const menu = document.getElementById("mobileMenu");
    if (!burger || !menu) return;

    const open = () => { menu.classList.add("is-open"); burger.setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden"; };
    const close = () => { menu.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); document.body.style.removeProperty("overflow"); };

    burger.addEventListener("click", open);
    closeBtn && closeBtn.addEventListener("click", close);
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  }

  /* ---------------------------------------------------------------------
     Smooth-scroll anchor links only (native wheel/trackpad scroll stays
     untouched — a global CSS scroll-behavior:smooth hijacks every wheel
     tick and causes visible tearing/jank on fast scrolls).
  --------------------------------------------------------------------- */
  function initSmoothAnchors() {
    const NAV_OFFSET = 90;
    document.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href");
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------------------------------------------------------------
     Scrollspy nav
  --------------------------------------------------------------------- */
  function initScrollspy() {
    const links = document.querySelectorAll("[data-spy]");
    if (!links.length) return;
    const sections = Array.from(links).map((l) => document.querySelector(l.getAttribute("href"))).filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = "#" + entry.target.id;
          links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === id));
        }
      });
    }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });

    sections.forEach((s) => observer.observe(s));
  }

  /* ---------------------------------------------------------------------
     Typewriter role text
  --------------------------------------------------------------------- */
  function initTypewriter() {
    const el = document.getElementById("typeRole");
    if (!el) return;
    const words = ["things that ship.", "AI that behaves.", "data into decisions.", "bots that don't ghost.", "for humans, mostly."];
    if (prefersReducedMotion) { el.textContent = words[0]; return; }

    let wordIndex = 0, charIndex = 0, deleting = false;

    const tick = () => {
      const word = words[wordIndex];
      if (!deleting) {
        charIndex++;
        el.textContent = word.slice(0, charIndex);
        if (charIndex === word.length) { deleting = true; setTimeout(tick, 1500); return; }
      } else {
        charIndex--;
        el.textContent = word.slice(0, charIndex);
        if (charIndex === 0) { deleting = false; wordIndex = (wordIndex + 1) % words.length; }
      }
      setTimeout(tick, deleting ? 35 : 65);
    };
    tick();
  }

  /* ---------------------------------------------------------------------
     Reveal on scroll
  --------------------------------------------------------------------- */
  function initReveal() {
    const pending = new Set(document.querySelectorAll("[data-reveal]"));
    if (!pending.size) return;
    if (prefersReducedMotion) { pending.forEach((i) => i.classList.add("is-visible")); return; }

    const reveal = (el, delay = 0) => {
      if (!pending.has(el)) return;
      pending.delete(el);
      setTimeout(() => el.classList.add("is-visible"), delay);
      if (!pending.size) window.removeEventListener("scroll", onScroll);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) { observer.unobserve(entry.target); reveal(entry.target, (i % 4) * 90); }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -60px 0px" });

    pending.forEach((el) => observer.observe(el));

    // Safety net: a large instant jump (End key, a restored scroll position,
    // browser find-in-page) can carry an element past the viewport without
    // the observer ever seeing it cross into view. A cheap scroll sweep
    // catches anything the observer missed. Deliberately not rAF-throttled —
    // rAF is suspended for backgrounded/hidden pages, and this check is cheap
    // enough (a shrinking set, plain bounding-rect reads) to run on every
    // scroll event directly.
    function sweep() {
      if (!pending.size) { window.removeEventListener("scroll", sweep); return; }
      pending.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) { observer.unobserve(el); reveal(el); }
      });
    }
    window.addEventListener("scroll", sweep, { passive: true });
    sweep();
  }

  /* ---------------------------------------------------------------------
     Count-up stats
  --------------------------------------------------------------------- */
  function initCounters() {
    const pending = new Set(document.querySelectorAll("[data-counter]"));
    if (!pending.size) return;

    const finalValue = (el) => (parseFloat(el.getAttribute("data-target"))).toLocaleString() + (el.getAttribute("data-suffix") || "");

    const animate = (el) => {
      const target = parseFloat(el.getAttribute("data-target"));
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = 1400;
      const start = performance.now();

      if (prefersReducedMotion) { el.textContent = target.toLocaleString() + suffix; return; }

      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString() + suffix;
      };
      requestAnimationFrame(step);
    };

    const resolve = (el) => {
      if (!pending.has(el)) return;
      pending.delete(el);
      if (!pending.size) window.removeEventListener("scroll", onScroll);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { observer.unobserve(entry.target); resolve(entry.target); animate(entry.target); }
      });
    }, { threshold: 0.6 });

    pending.forEach((el) => observer.observe(el));

    // Same safety net as initReveal(): catch counters an instant jump
    // (End key, restored scroll, find-in-page) carried past the observer.
    // Not rAF-throttled — rAF is suspended on hidden/backgrounded pages,
    // and this check is cheap enough to run directly on every scroll event.
    function sweep() {
      if (!pending.size) { window.removeEventListener("scroll", sweep); return; }
      pending.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          observer.unobserve(el); resolve(el); el.textContent = finalValue(el);
        }
      });
    }
    window.addEventListener("scroll", sweep, { passive: true });
    sweep();
  }

  /* ---------------------------------------------------------------------
     Magnetic buttons
  --------------------------------------------------------------------- */
  function initMagnetic() {
    if (!isFinePointer || prefersReducedMotion) return;
    const targets = document.querySelectorAll("[data-magnetic]");
    targets.forEach((el) => {
      let raf = null;
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px)`;
        });
      });
      el.addEventListener("mouseleave", () => {
        if (raf) cancelAnimationFrame(raf);
        el.style.transform = "translate(0,0)";
      });
    });
  }

  /* ---------------------------------------------------------------------
     Side-quest horizontal scroller
  --------------------------------------------------------------------- */
  function initSideQuest() {
    const track = document.getElementById("sqTrack");
    const left = document.getElementById("sqLeft");
    const right = document.getElementById("sqRight");
    if (!track) return;
    const scrollByCard = (dir) => {
      const card = track.querySelector(".sq-card");
      const distance = card ? card.getBoundingClientRect().width + 20 : 300;
      track.scrollBy({ left: dir * distance, behavior: "smooth" });
    };
    left && left.addEventListener("click", () => scrollByCard(-1));
    right && right.addEventListener("click", () => scrollByCard(1));
  }

  /* ---------------------------------------------------------------------
     Copy email
  --------------------------------------------------------------------- */
  function initEmailCopy() {
    const btn = document.getElementById("emailBtn");
    const icon = document.getElementById("emailIcon");
    const text = document.getElementById("emailText");
    if (!btn) return;
    const email = "shreyamerinmathew13@gmail.com";

    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(email);
      } catch (err) {
        /* clipboard unavailable — still show feedback via mailto fallback */
      }
      const original = text.textContent;
      text.textContent = "Copied to clipboard!";
      icon.innerHTML = '<use href="#i-check"/>';
      setTimeout(() => {
        text.textContent = original;
        icon.innerHTML = '<use href="#i-copy"/>';
      }, 1800);
    });
  }

  /* ---------------------------------------------------------------------
     Back to top + footer year
  --------------------------------------------------------------------- */
  function initFooter() {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const toTop = document.getElementById("toTop");
    toTop && toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------------------------------------------------------------
     Boot
  --------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initPreloader();
    initCursor();
    initTheme();
    initMobileMenu();
    initSmoothAnchors();
    initScrollspy();
    initTypewriter();
    initReveal();
    initCounters();
    initMagnetic();
    initSideQuest();
    initEmailCopy();
    initFooter();
  });
})();
