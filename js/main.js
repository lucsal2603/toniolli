/* ============================================================
   CANTINA TONIOLLI — La Valle Verticale
   GSAP + ScrollTrigger + Lenis
   ============================================================ */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- split helpers ---------- */
  function splitChars(el) {
    const text = el.textContent;
    el.textContent = "";
    const frag = document.createDocumentFragment();
    [...text].forEach((ch) => {
      const s = document.createElement("span");
      if (ch === " ") { s.className = "sp"; s.innerHTML = "&nbsp;"; }
      else { s.className = "ch"; s.textContent = ch; }
      frag.appendChild(s);
    });
    el.appendChild(frag);
    return $$(".ch", el);
  }

  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.getAttribute("aria-label") || el.textContent.trim());
    el.textContent = "";
    words.forEach((w, i) => {
      const s = document.createElement("span");
      s.className = "w";
      s.setAttribute("aria-hidden", "true");
      s.textContent = w;
      s.style.display = "inline-block";
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return $$(".w", el);
  }

  /* ---------- lenis ---------- */
  const urlParams = new URLSearchParams(location.search);
  const noSmooth = urlParams.has("nosmooth") || urlParams.has("static");
  const staticMode = urlParams.has("static"); // debug: nessun loop infinito
  if (staticMode) document.documentElement.classList.add("static-mode");
  let lenis = null;
  if (!reduceMotion && !noSmooth) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToTarget(target) {
    const el = typeof target === "string" ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }

  /* ============================================================
     PRELOADER + INTRO HERO
     ============================================================ */
  const preloader = $("#preloader");
  const heroChars = { k: null };

  // pre-hide hero pieces (JS-only so no-JS users see everything)
  const heroLines = $$(".hero-title .split").map((el) => splitChars(el));
  const kicker = $("#heroKicker");
  const heroSub = $("#heroSub");
  const heroFoot = $(".hero-foot");
  const heroMedia = $("#heroMedia");
  const altimeter = $("#altimeter");

  if (!reduceMotion) {
    gsap.set(heroLines.flat(), { yPercent: 115 });
    gsap.set([kicker, heroSub, heroFoot], { autoAlpha: 0, y: 24 });
    gsap.set(heroMedia, { clipPath: "inset(0 0 0 100%)" });
  }

  function heroIntro() {
    if (reduceMotion) return null;
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.to(heroMedia, { clipPath: "inset(0 0 0 0%)", duration: 1.4, ease: "power4.inOut" })
      .to(heroLines[0], { yPercent: 0, duration: 1.1, stagger: 0.035 }, "-=0.9")
      .to(heroLines[1], { yPercent: 0, duration: 1.1, stagger: 0.035 }, "-=0.95")
      .to(heroLines[2], { yPercent: 0, duration: 1.1, stagger: 0.03 }, "-=0.95")
      .to(kicker, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.8")
      .to(heroSub, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.6")
      .to(heroFoot, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.5")
      .to(altimeter, { autoAlpha: 1, duration: 0.8 }, "-=0.5");
    return tl;
  }

  let released = false;
  function releasePage(force) {
    if (released) return;
    released = true;
    document.body.classList.add("is-loaded");
    document.documentElement.style.overflow = "";
    gsap.set(preloader, { display: "none" });
    if (lenis) lenis.start();
    const tl = heroIntro();
    if (force && tl) tl.progress(1); // rAF inaffidabile: stato finale subito
  }

  if (reduceMotion || document.hidden || (staticMode && location.hash)) {
    document.body.classList.add("is-loaded");
    gsap.set(altimeter, { autoAlpha: 1 });
    if (!reduceMotion) gsap.set([kicker, heroSub, heroFoot], { autoAlpha: 1, y: 0 }),
      gsap.set(heroLines.flat(), { yPercent: 0 }),
      gsap.set(heroMedia, { clipPath: "inset(0 0 0 0%)" });
  } else {
    if (lenis) lenis.stop();
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);
    const preVal = { v: 238 };
    const preChars = splitChars($("#preName"));
    gsap.set(preChars, { yPercent: 115 });
    const ptl = gsap.timeline({ onComplete: releasePage });
    ptl.to(preChars, { yPercent: 0, duration: 0.9, stagger: 0.045, ease: "expo.out" }, 0.1)
      .to(preVal, {
        v: 575, duration: 1.1, ease: "power2.out",
        onUpdate: () => { $("#preVal").textContent = Math.round(preVal.v); }
      }, 0.15)
      .to(preloader, { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, "+=0.3");
    // rete di sicurezza: se i rAF vengono sospesi (tab in background), sblocca comunque
    setTimeout(() => { if (!released) { ptl.progress(1); releasePage(true); } }, 3800);
  }

  /* ============================================================
     NAV — solid + hide on scroll down
     ============================================================ */
  const nav = $("#nav");
  ScrollTrigger.create({
    start: 10, end: "max",
    onUpdate: (self) => {
      nav.classList.toggle("is-solid", self.scroll() > 60);
      if (self.scroll() > 260 && self.direction === 1 && !menuOpen) nav.classList.add("is-hidden");
      else nav.classList.remove("is-hidden");
    }
  });

  /* ============================================================
     MENU OVERLAY
     ============================================================ */
  const menu = $("#menu");
  const burger = $("#navBurger");
  const menuClose = $("#menuClose");
  const menuLinks = $$(".menu-link, .menu-aside a", menu);
  let menuOpen = false;
  let lastFocused = null;

  function openMenu() {
    menuOpen = true;
    lastFocused = document.activeElement;
    menu.hidden = false;
    burger.setAttribute("aria-expanded", "true");
    if (lenis) lenis.stop();
    document.body.style.overflow = "hidden";
    gsap.fromTo(menu, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: reduceMotion ? 0 : 0.7, ease: "power4.inOut" });
    gsap.fromTo($$(".menu-link", menu), { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: reduceMotion ? 0 : 0.6, stagger: 0.05, delay: reduceMotion ? 0 : 0.25, ease: "expo.out" });
    gsap.fromTo($(".menu-aside"), { autoAlpha: 0 }, { autoAlpha: 1, duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.5 });
    menuClose.focus();
  }

  function closeMenu(cb) {
    menuOpen = false;
    burger.setAttribute("aria-expanded", "false");
    gsap.to(menu, {
      clipPath: "inset(0 0 100% 0)", duration: reduceMotion ? 0 : 0.55, ease: "power4.inOut",
      onComplete: () => {
        menu.hidden = true;
        document.body.style.overflow = "";
        if (lenis) lenis.start();
        if (cb) cb(); else if (lastFocused) lastFocused.focus();
      }
    });
  }

  burger.addEventListener("click", openMenu);
  menuClose.addEventListener("click", () => closeMenu());
  document.addEventListener("keydown", (e) => {
    if (!menuOpen) return;
    if (e.key === "Escape") closeMenu();
    if (e.key === "Tab") {
      const focusables = [menuClose, ...menuLinks];
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- anchor scrolling ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      if (menuOpen) closeMenu(() => scrollToTarget(target));
      else scrollToTarget(target);
    });
  });

  /* ============================================================
     HERO — scrub
     ============================================================ */
  if (!reduceMotion) {
    gsap.to("#heroImg", {
      scale: 1.16, yPercent: 8, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
    gsap.set("#heroImg", { scale: 1.02 });
    [[".ht-1", -5], [".ht-2", 6], [".ht-3", -3]].forEach(([sel, drift]) => {
      gsap.to(sel, {
        xPercent: drift, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    });
    gsap.to(".hero-foot", {
      autoAlpha: 0, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "40% top", end: "70% top", scrub: true }
    });
  }

  /* ============================================================
     MANIFESTO — parole che si accendono
     ============================================================ */
  const maniWords = splitWords($("#maniText"));
  if (!reduceMotion) {
    gsap.set(maniWords, { opacity: 0.13 });
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    gsap.to(maniWords, {
      opacity: 1, stagger: 0.08, ease: "none",
      scrollTrigger: {
        trigger: ".mani-pin",
        start: isDesktop ? "top top" : "top 70%",
        end: isDesktop ? "+=130%" : "bottom 60%",
        scrub: 0.4,
        pin: isDesktop,
        anticipatePin: 1
      }
    });
  }

  /* ============================================================
     LA VALLE — immagini sticky + contour + contatori
     ============================================================ */
  const vimgs = $$(".vimg");
  $$(".vblock").forEach((block) => {
    ScrollTrigger.create({
      trigger: block,
      start: "top 60%", end: "bottom 40%",
      onToggle: (self) => {
        if (!self.isActive) return;
        const i = +block.dataset.vimg;
        vimgs.forEach((img, j) => img.classList.toggle("is-active", i === j));
      }
    });
  });

  $$(".contour path").forEach((p, i) => {
    const len = p.getTotalLength();
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(p, {
      strokeDashoffset: 0, ease: "none",
      scrollTrigger: { trigger: ".valle", start: "top 80%", end: "60% 40%", scrub: 1 }
    });
  });

  // il valore finale sta nell'HTML (leggibile senza JS e dai crawler);
  // l'animazione parte da data-from e ci torna sopra
  $$(".counter").forEach((c) => {
    const end = +c.textContent.replace(/\D/g, "");
    const start = +(c.dataset.from ?? 0);
    if (!Number.isFinite(end) || reduceMotion) return;
    const obj = { v: start };
    ScrollTrigger.create({
      trigger: c, start: "top 92%", once: true,
      onEnter: () => {
        c.textContent = start;
        gsap.to(obj, {
          v: end, duration: 1.8, ease: "power2.out",
          onUpdate: () => { c.textContent = Math.round(obj.v); },
          onComplete: () => { c.textContent = end; }
        });
      }
    });
  });

  /* ============================================================
     STAGIONI — drift orizzontale
     ============================================================ */
  if (!reduceMotion) {
    const track = $("#stagTrack");
    const drift = () => -(track.scrollWidth - window.innerWidth + 60);
    gsap.fromTo(track, { x: 40 }, {
      x: drift, ease: "none",
      scrollTrigger: { trigger: ".stagioni", start: "top bottom", end: "bottom top", scrub: 1, invalidateOnRefresh: true }
    });
    $$(".si-frame img").forEach((img) => {
      gsap.fromTo(img, { yPercent: -8 }, {
        yPercent: 0, ease: "none",
        scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: 1 }
      });
    });
  }

  /* ============================================================
     I BAITI — parallax
     ============================================================ */
  if (!reduceMotion) {
    gsap.fromTo("#baitiImg", { yPercent: -9 }, {
      yPercent: 9, ease: "none",
      scrollTrigger: { trigger: ".baiti", start: "top bottom", end: "bottom top", scrub: true }
    });
    gsap.fromTo("#baitiTitle", { xPercent: 3, autoAlpha: 0.4 }, {
      xPercent: -3, autoAlpha: 1, ease: "none",
      scrollTrigger: { trigger: ".baiti", start: "top 80%", end: "bottom 40%", scrub: true }
    });
  }

  /* ============================================================
     LE ETICHETTE — scroll orizzontale (desktop)
     ============================================================ */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    const track = $("#winesTrack");
    const stage = $("#winesStage");
    const panels = $$(".wine-panel");
    const dist = () => track.scrollWidth - window.innerWidth;

    const horiz = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: () => "+=" + dist(),
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        snap: { snapTo: 1 / (panels.length - 1), duration: { min: 0.2, max: 0.6 }, delay: 0.08, ease: "power2.inOut" },
        onUpdate: (self) => {
          const idx = Math.round(self.progress * (panels.length - 1));
          const label = $(".wp-ghost", panels[idx]);
          if (label) $("#wineName").textContent = label.textContent;
          gsap.set("#wineFill", { scaleX: 0.25 + 0.75 * self.progress });
        }
      }
    });

    panels.forEach((panel) => {
      const num = $(".wp-ghost", panel);
      const bottleImg = $(".wp-bottle img", panel);
      gsap.fromTo(num, { xPercent: 0 }, {
        xPercent: 8, ease: "none",
        scrollTrigger: { containerAnimation: horiz, trigger: panel, start: "left right", end: "right left", scrub: true }
      });
      gsap.fromTo(bottleImg, { y: 90, rotation: 3.5 }, {
        y: 0, rotation: 0, ease: "none",
        scrollTrigger: { containerAnimation: horiz, trigger: panel, start: "left 95%", end: "left 15%", scrub: true }
      });
    });

    return () => {};
  });

  // float perpetuo delle bottiglie (fuori dallo scrub: agisce sul figure)
  if (!reduceMotion && !staticMode) {
    $$(".wp-bottle").forEach((fig, i) => {
      gsap.to(fig, { y: -12, duration: 2.8 + i * 0.35, yoyo: true, repeat: -1, ease: "sine.inOut" });
    });
    $$(".wp-glow").forEach((g, i) => {
      gsap.to(g, { scale: 1.12, opacity: 0.8, duration: 3.4 + i * 0.3, yoyo: true, repeat: -1, ease: "sine.inOut" });
    });
  }

  /* ============================================================
     LA FAMIGLIA — parole clip reveal
     ============================================================ */
  if (!reduceMotion) {
    $$("[data-fw]").forEach((w) => {
      gsap.fromTo(w, { clipPath: "inset(0 100% 0 0)", x: -28 }, {
        clipPath: "inset(0 0% 0 0)", x: 0, ease: "none",
        scrollTrigger: { trigger: w, start: "top 88%", end: "top 45%", scrub: 0.6 }
      });
    });
    gsap.fromTo("#famImg img", { yPercent: -10 }, {
      yPercent: 0, ease: "none",
      scrollTrigger: { trigger: "#famImg", start: "top bottom", end: "bottom top", scrub: 1 }
    });
  }

  /* ============================================================
     VISITA — parallax + marquee reattivo + magnetic
     ============================================================ */
  if (!reduceMotion) {
    gsap.fromTo("#visitaImg", { yPercent: -10 }, {
      yPercent: 10, ease: "none",
      scrollTrigger: { trigger: ".visita", start: "top bottom", end: "bottom top", scrub: true }
    });

    if (!staticMode) {
      const marquee = gsap.to("#marqueeInner", { xPercent: -50, duration: 26, repeat: -1, ease: "none" });
      ScrollTrigger.create({
        trigger: ".visita", start: "top bottom", end: "bottom top",
        onUpdate: (self) => {
          const v = Math.min(Math.abs(self.getVelocity()) / 900, 3.2);
          gsap.to(marquee, { timeScale: 1 + v, duration: 0.4, overwrite: true });
        }
      });
    }
  }

  const magnetic = $("#magneticBtn");
  if (magnetic && finePointer && !reduceMotion) {
    const qx = gsap.quickTo(magnetic, "x", { duration: 0.35, ease: "power3.out" });
    const qy = gsap.quickTo(magnetic, "y", { duration: 0.35, ease: "power3.out" });
    magnetic.addEventListener("pointermove", (e) => {
      const r = magnetic.getBoundingClientRect();
      qx((e.clientX - r.left - r.width / 2) * 0.35);
      qy((e.clientY - r.top - r.height / 2) * 0.5);
    });
    magnetic.addEventListener("pointerleave", () => { qx(0); qy(0); });
  }

  /* ============================================================
     FOOTER — TONIOLLI gigante
     ============================================================ */
  {
    const chars = splitChars($("#footerGiant .split"));
    if (!reduceMotion) {
      gsap.set(chars, { yPercent: 60, autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: ".footer", start: "top 75%", once: true,
        onEnter: () => gsap.to(chars, { yPercent: 0, autoAlpha: 1, duration: 1.1, stagger: 0.05, ease: "expo.out" })
      });
    }
  }

  /* ============================================================
     ALTIMETRO — 238 m (Avisio) → 905 m (vigne alte)
     (creato DOPO i pin così le posizioni includono gli spacer)
     ============================================================ */
  const altiVal = $("#altiVal");
  const altiZone = $("#altiZone");
  const altiMarker = $("#altiMarker");
  const QUOTA_MIN = 238, QUOTA_MAX = 905;

  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => {
      const q = Math.round(QUOTA_MIN + (QUOTA_MAX - QUOTA_MIN) * self.progress);
      altiVal.textContent = q;
      gsap.set(altiMarker, { top: `${self.progress * 100}%` });
    }
  });

  $$("[data-zone]").forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: "top 55%", end: "bottom 55%",
      onToggle: (self) => { if (self.isActive) altiZone.textContent = sec.dataset.zone; },
      onUpdate: (self) => { if (self.isActive && altiZone.textContent !== sec.dataset.zone) altiZone.textContent = sec.dataset.zone; }
    });
  });

  /* ============================================================
     REVEAL GENERICI
     ============================================================ */
  if (!reduceMotion) {
    $$("[data-reveal]").forEach((el) => {
      gsap.fromTo(el, { y: 44, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 1, ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" }
      });
    });
    $$("[data-title]").forEach((el) => {
      gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)", y: 40 }, {
        clipPath: "inset(0 0 -8% 0)", y: 0, duration: 1.2, ease: "power4.out",
        scrollTrigger: { trigger: el, start: "top 82%", toggleActions: "play none none none" }
      });
    });
  }

  /* ---------- refresh + debug handles ---------- */
  window.__lenis = lenis;
  window.__pump = (n = 180) => { for (let i = 0; i < n; i++) gsap.ticker.tick(); };
  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
    if (staticMode) {
      if (location.hash) {
        const t = $(location.hash);
        if (t) t.scrollIntoView();
      }
      window.__pump(240);
    }
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
})();
