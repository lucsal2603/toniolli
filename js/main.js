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
  let heroTl = null, introPartita = false;
  function startIntro() {
    if (introPartita) return heroTl;
    introPartita = true;
    heroTl = heroIntro();
    return heroTl;
  }
  function releasePage(force) {
    if (released) return;
    released = true;
    document.body.classList.add("is-loaded");
    document.documentElement.style.overflow = "";
    gsap.set(preloader, { display: "none" });
    if (lenis) lenis.start();
    startIntro();
    if (force && heroTl) heroTl.progress(1); // rAF inaffidabile: stato finale subito
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
    const preLogo = $("#preLogo");
    const monte = $("#preMonte");
    const lunghezza = monte.getTotalLength();
    gsap.set(preLogo, { autoAlpha: 0, y: 30, scale: 0.965 });
    gsap.set(monte, { strokeDasharray: lunghezza, strokeDashoffset: lunghezza });
    const ptl = gsap.timeline({ onComplete: releasePage });
    ptl.to(preLogo, { autoAlpha: 1, y: 0, scale: 1, duration: 1.0, ease: "expo.out" }, 0.1)
      .to(preVal, {
        v: 575, duration: 1.1, ease: "power2.out",
        onUpdate: () => { $("#preVal").textContent = Math.round(preVal.v); }
      }, 0.15)
      // il crinale si disegna da destra fino a chiudersi a sinistra
      .to(monte, { strokeDashoffset: 0, duration: 0.85, ease: "power2.inOut" }, "+=0.2")
      .add("apertura", "-=0.05")
      .to(".pre-inner", { autoAlpha: 0, y: -22, duration: 0.3, ease: "power2.in" }, "apertura")
      .add(() => { if (lenis) lenis.start(); startIntro(); }, "apertura+=0.18")
      // il versante sopra la linea sale, quello sotto scende: appare il sito
      .to(".pre-sopra", { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "apertura+=0.1")
      .to(".pre-sotto", { yPercent: 100, duration: 0.9, ease: "power4.inOut" }, "apertura+=0.1")
      .to(monte, { autoAlpha: 0, duration: 0.35 }, "apertura+=0.5");
    // rete di sicurezza: se i rAF vengono sospesi (tab in background), sblocca comunque
    setTimeout(() => { if (!released) { ptl.progress(1); releasePage(true); } }, 4600);
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
  {
    const mmMani = gsap.matchMedia();
    const pinEl = $("#maniPin");
    const img = $("#maniImg");
    const quoteWrap = $("#maniQuoteWrap");
    const next = $("#maniNext");

    // schermo fermo: parole, poi l'immagine entra da destra e si blocca,
    // poi la citazione lascia il posto al titolo della valle
    mmMani.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      pinEl.classList.add("is-seq");
      gsap.set(maniWords, { opacity: 0.13 });
      gsap.set(img, { xPercent: 120, autoAlpha: 0 });
      gsap.set(next, { autoAlpha: 0, y: 36 });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinEl, start: "top top", end: "+=300%",
          pin: true, scrub: 0.5, anticipatePin: 1,
          invalidateOnRefresh: true, refreshPriority: 3
        }
      });
      tl.to(maniWords, { opacity: 1, stagger: 0.05, ease: "none", duration: 1.1 })
        .to({}, { duration: 0.15 })
        .to(img, { xPercent: 0, autoAlpha: 1, duration: 0.55, ease: "power3.out" })
        .to({}, { duration: 0.12 })
        .to(quoteWrap, { autoAlpha: 0, y: -44, duration: 0.3, ease: "power2.in" })
        .to(next, { autoAlpha: 1, y: 0, duration: 0.32, ease: "power2.out" }, "-=0.08")
        .to({}, { duration: 0.18 });
      return () => {
        pinEl.classList.remove("is-seq");
        gsap.set([img, quoteWrap, next], { clearProps: "all" });
        gsap.set(maniWords, { clearProps: "opacity" });
      };
    });

    // sotto i 1024px niente scena: solo le parole che si accendono
    mmMani.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.set(maniWords, { opacity: 0.13 });
      gsap.to(maniWords, {
        opacity: 1, stagger: 0.08, ease: "none",
        scrollTrigger: { trigger: ".mani-quote", start: "top 75%", end: "bottom 55%", scrub: 0.4 }
      });
      return () => gsap.set(maniWords, { clearProps: "opacity" });
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

  // ogni crinale ha il suo ritmo: parte in un momento diverso dagli altri
  // e si riempie a una velocità diversa
  const RITMI = [0.55, 2.4, 1.1, 3.1, 1.7, 0.85];
  const PARTENZE = ["top 94%", "top 74%", "top 86%", "top 66%", "top 90%", "top 80%"];
  const ARRIVI = ["48% 42%", "82% 46%", "60% 36%", "92% 52%", "70% 40%", "55% 30%"];
  $$(".contour").forEach((svg, sezione) => {
    const host = svg.closest("section") || svg.parentElement;
    $$("path", svg).forEach((path, i) => {
      const len = path.getTotalLength();
      const k = (i + sezione * 2) % RITMI.length;
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, {
        strokeDashoffset: 0, ease: "none",
        scrollTrigger: { trigger: host, start: PARTENZE[k], end: ARRIVI[k], scrub: RITMI[k] }
      });
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
     STAGIONI — nastro che gira da solo, non legato allo scroll
     ============================================================ */
  {
    const track = $("#stagTrack");
    if (track) {
      const originali = [...track.children];
      if (!reduceMotion && !staticMode) {
        // copia della sequenza: serve per chiudere il giro senza stacchi
        originali.forEach((el) => {
          const clone = el.cloneNode(true);
          clone.setAttribute("aria-hidden", "true");
          track.appendChild(clone);
        });
        $$("img", track).forEach((im) => { im.draggable = false; });

        // posizione governata a mano: avanzamento automatico + trascinamento
        let meta = 0;
        const misura = () => { meta = track.scrollWidth / 2; };
        misura();
        ScrollTrigger.addEventListener("refreshInit", misura);

        let pos = 0, velInerzia = 0, fattore = 1, obiettivo = 1;
        let visibile = false, trascina = false, ultimaX = 0, ultimoT = 0;
        whenVisible(track, () => { visibile = true; }, () => { visibile = false; });

        const avvolgi = (x) => { const m = meta || 1; return ((x % m) - m) % m; };

        gsap.ticker.add((t, dtMs) => {
          if (!visibile || !meta) return;
          const dt = Math.min(dtMs / 1000, 0.05);
          fattore += (obiettivo - fattore) * Math.min(1, 6 * dt);
          if (!trascina) {
            pos += (-meta / 46) * fattore * dt + velInerzia * dt;
            velInerzia *= Math.exp(-3.2 * dt);
          }
          pos = avvolgi(pos);
          gsap.set(track, { x: pos });
        });

        track.addEventListener("pointerdown", (e) => {
          trascina = true;
          ultimaX = e.clientX; ultimoT = e.timeStamp;
          velInerzia = 0;
          track.classList.add("sta-trascinando");
          try { track.setPointerCapture(e.pointerId); } catch (err) { /* pointer sintetici */ }
        });
        track.addEventListener("pointermove", (e) => {
          if (!trascina) return;
          const dx = e.clientX - ultimaX;
          const dt = Math.max(1, e.timeStamp - ultimoT);
          pos = avvolgi(pos + dx);
          velInerzia = gsap.utils.clamp(-1600, 1600, (dx / dt) * 1000);
          ultimaX = e.clientX; ultimoT = e.timeStamp;
          gsap.set(track, { x: pos });
        });
        const rilascia = () => {
          if (!trascina) return;
          trascina = false;
          track.classList.remove("sta-trascinando");
        };
        track.addEventListener("pointerup", rilascia);
        track.addEventListener("pointercancel", rilascia);

        // sopra una scheda rallenta, per leggere senza che sembri fermo
        $$(".stag-item", track).forEach((card) => {
          card.addEventListener("pointerenter", () => { obiettivo = 0.22; });
          card.addEventListener("pointerleave", () => { obiettivo = 1; });
        });
      }

      // leggera parallasse verticale dentro ogni riquadro
      if (!reduceMotion) {
        $$(".si-frame img", track).forEach((img) => {
          gsap.fromTo(img, { yPercent: -8 }, {
            yPercent: 0, ease: "none",
            scrollTrigger: { trigger: track, start: "top bottom", end: "bottom top", scrub: 1 }
          });
        });
      }
    }
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
  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
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
        refreshPriority: 1,
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
    const giant = $("#footerGiant");
    const fill = $("#fgFill");
    const bolle = $("#fgBolle");
    if (giant && fill && bolle && !reduceMotion) {
      const scopri = { p: 0 };
      gsap.to(scopri, {
        p: 1, ease: "none",
        scrollTrigger: { trigger: giant, start: "top 92%", end: "top 42%", scrub: 0.5 },
        onUpdate: () => {
          const taglio = "inset(0 " + (100 - scopri.p * 100).toFixed(2) + "% 0 0)";
          fill.style.clipPath = taglio;
          bolle.style.clipPath = taglio;
        }
      });
      // le bollicine arrivano solo a scritta piena
      ScrollTrigger.create({
        trigger: giant, start: "top 44%",
        onEnter: () => {
          giant.classList.add("is-piena");
          gsap.to(bolle, { opacity: 1, duration: 0.9, ease: "power2.out" });
        },
        onLeaveBack: () => {
          gsap.to(bolle, { opacity: 0, duration: 0.4, onComplete: () => giant.classList.remove("is-piena") });
        }
      });
    }
  }


  /* ============================================================
     SFONDI ANIMATI — pulviscolo, bollicine, glow, nastri
     Un solo ticker condiviso; i canvas dormono quando escono di vista.
     ============================================================ */
  const canvasLoops = [];

  function setupCanvas(cv) {
    const ctx = cv.getContext("2d", { alpha: true });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fit = () => {
      const r = cv.getBoundingClientRect();
      cv.width = Math.max(1, Math.round(r.width * dpr));
      cv.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: r.width, h: r.height };
    };
    return { ctx, fit };
  }

  // sospende il disegno quando l'elemento non è a schermo
  function whenVisible(el, onIn, onOut) {
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? onIn() : onOut()), { rootMargin: "120px" });
    io.observe(el);
    return io;
  }

  /* ---------- pulviscolo dorato ---------- */
  function dust(cv, opts = {}) {
    if (!cv || reduceMotion || staticMode) return;
    const { ctx, fit } = setupCanvas(cv);
    let size = fit();
    const density = opts.density || 0.000055;
    const cap = opts.cap || 90;
    let bits = [];
    const seed = (n) => {
      bits = Array.from({ length: n }, (_, i) => ({
        x: ((i * 97) % 100) / 100 * size.w,
        y: ((i * 61) % 100) / 100 * size.h,
        r: 0.7 + ((i * 37) % 100) / 100 * 2.1,
        vy: -(0.06 + ((i * 53) % 100) / 100 * 0.22),
        vx: (((i * 29) % 100) / 100 - 0.5) * 0.12,
        a: 0.16 + ((i * 71) % 100) / 100 * 0.6,
        ph: ((i * 43) % 100) / 100 * Math.PI * 2
      }));
    };
    const build = () => {
      size = fit();
      seed(Math.min(cap, Math.round(size.w * size.h * density)));
    };
    build();

    let t = 0, alive = false;
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, size.w, size.h);
      for (const b of bits) {
        b.y += b.vy; b.x += b.vx + Math.sin(t * 0.6 + b.ph) * 0.09;
        if (b.y < -6) { b.y = size.h + 6; b.x = Math.random() * size.w; }
        if (b.x < -6) b.x = size.w + 6;
        if (b.x > size.w + 6) b.x = -6;
        const tw = 0.55 + Math.sin(t * 1.4 + b.ph) * 0.45;
        const al = (b.a * tw);
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 2.6);
        g.addColorStop(0, `rgba(232, 205, 148, ${al.toFixed(3)})`);
        g.addColorStop(1, "rgba(232, 205, 148, 0)");
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 2.6, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
    };
    const loop = { draw, active: () => alive };
    canvasLoops.push(loop);
    whenVisible(cv, () => { alive = true; }, () => { alive = false; });
    ScrollTrigger.addEventListener("refreshInit", build);
    gsap.to(cv, { opacity: 1, duration: 1.6, ease: "power2.out",
      scrollTrigger: { trigger: cv.parentElement, start: "top 80%", once: true } });
  }

  /* ---------- bollicine ---------- */
  function bubbles(cv) {
    if (!cv || reduceMotion || staticMode) return;
    const { ctx, fit } = setupCanvas(cv);
    let size = fit();
    let bs = [];
    const build = () => {
      size = fit();
      const n = Math.min(72, Math.round(size.h / 13));
      bs = Array.from({ length: n }, (_, i) => ({
        x: ((i * 83) % 100) / 100 * size.w,
        y: size.h + ((i * 47) % 100) / 100 * size.h,
        r: 1.4 + ((i * 31) % 100) / 100 * 4.2,
        v: 0.22 + ((i * 59) % 100) / 100 * 0.5,
        ph: ((i * 67) % 100) / 100 * Math.PI * 2
      }));
    };
    build();
    let t = 0, alive = false;
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, size.w, size.h);
      for (const b of bs) {
        b.y -= b.v;
        const x = b.x + Math.sin(t * 0.9 + b.ph) * 7;
        if (b.y < -8) { b.y = size.h + 8; b.x = Math.random() * size.w; }
        const fade = Math.min(1, b.y / size.h + 0.15);
        ctx.beginPath();
        ctx.arc(x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(232, 205, 148, ${(0.5 * fade).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    };
    canvasLoops.push({ draw, active: () => alive });
    whenVisible(cv, () => { alive = true; }, () => { alive = false; });
    ScrollTrigger.addEventListener("refreshInit", build);
    gsap.to(cv, { opacity: 1, duration: 1.4, ease: "power2.out", delay: 0.3 });
  }

  dust($("#dustHero"), { cap: 130, density: 0.00008 });
  dust($("#dustFam"), { cap: 80, density: 0.00006 });
  bubbles($("#bolle"));

  if (canvasLoops.length) {
    gsap.ticker.add(() => { for (const l of canvasLoops) if (l.active()) l.draw(); });
  }

  /* ---------- glow che respirano ---------- */
  if (!reduceMotion && !staticMode) {
    $$(".glow").forEach((g, i) => {
      gsap.to(g, {
        scale: 1.16, opacity: 0.72, xPercent: 4,
        duration: 6.5 + i * 0.8, yoyo: true, repeat: -1, ease: "sine.inOut"
      });
    });
  }

  /* ---------- Ken Burns, attivo solo a schermo ---------- */
  $$(".vimg img").forEach((img) => {
    img.classList.add("kenburns");
    if (reduceMotion) return;
    img.style.animationPlayState = "paused";
    whenVisible(img, () => { img.style.animationPlayState = "running"; },
                     () => { img.style.animationPlayState = "paused"; });
  });

  /* ---------- parallax multilivello sulle nuove foto ---------- */
  if (!reduceMotion) {
    [[".baitmap img", 14], [".bg-frame img", 7]].forEach(([sel, amt]) => {
      $$(sel).forEach((img) => {
        gsap.fromTo(img, { yPercent: -amt / 2 }, {
          yPercent: amt / 2, ease: "none",
          scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: 1 }
        });
      });
    });
  }

  /* ---------- scie del manifesto: la punta corre, la coda insegue ---------- */
  {
    const svg = $("#maniTrails");
    if (svg && !reduceMotion) {
      const isDesk = window.matchMedia("(min-width: 1024px)").matches;
      $$("path", svg).forEach((path, i) => {
        const len = path.getTotalLength();
        const coda = 130 + i * 70;
        const punta = path.cloneNode(false);
        punta.classList.add("tip");
        svg.appendChild(punta);
        const dove = {
          trigger: ".manifesto",
          start: isDesk ? "top top" : "top 85%",
          end: isDesk ? "+=300%" : "bottom top",
          scrub: 0.25 + i * 0.18
        };
        gsap.set(path, { strokeDasharray: coda + " " + (len + coda), strokeDashoffset: coda });
        gsap.to(path, { strokeDashoffset: -len, ease: "none", scrollTrigger: Object.assign({}, dove) });
        gsap.set(punta, { strokeDasharray: "14 " + (len + 14), strokeDashoffset: coda - 14 });
        gsap.to(punta, { strokeDashoffset: -len - coda + 14, ease: "none", scrollTrigger: Object.assign({}, dove) });
      });
    }
  }

  /* ---------- percorso del metodo: righe e pallini in sequenza ---------- */
  if (!reduceMotion) {
    const passi = $$(".mstep");
    if (passi.length) {
      const perc = gsap.timeline({
        scrollTrigger: { trigger: ".metodo-list", start: "top 80%", end: "bottom 65%", scrub: 0.6 }
      });
      passi.forEach((passo) => {
        const riga = $(".ms-line", passo);
        const pallino = $(".ms-dot", passo);
        gsap.set(pallino, { scale: 1, backgroundColor: "rgba(210,166,75,0)" });
        perc.to(riga, { scaleX: 1, duration: 1, ease: "none" })
            .to(pallino, { backgroundColor: "rgba(210,166,75,1)", scale: 1.28, duration: 0.18, ease: "power2.out" }, "<0.82")
            .to(pallino, { scale: 1.12, duration: 0.14, ease: "power2.inOut" });
      });
    }
  }

  /* ---------- reveal a cascata sui gruppi ---------- */
  if (!reduceMotion) {
    [".valle-data", ".metodo-list", ".bg-grid", ".info-grid"].forEach((sel) => {
      const box = $(sel);
      if (!box) return;
      const kids = [...box.children];
      kids.forEach((k) => k.removeAttribute("data-reveal"));
      gsap.fromTo(kids, { y: 46, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 0.95, ease: "expo.out", stagger: 0.09,
        scrollTrigger: { trigger: box, start: "top 85%", once: true }
      });
    });
  }


  /* ---------- la storia: una tappa alla volta, mentre scorri ---------- */
  {
    const tappe = $$(".tl-item");
    if (tappe.length && !reduceMotion) {
      tappe.forEach((item) => {
        const line = $(".tl-line", item);
        const when = $(".tl-when", item);
        const body = $(".tl-body", item);
        gsap.set(line, { scaleX: 0 });
        gsap.set(when, { autoAlpha: 0, x: -26 });
        gsap.set(body, { autoAlpha: 0, y: 34 });
        gsap.timeline({ scrollTrigger: { trigger: item, start: "top 84%", once: true } })
          .to(line, { scaleX: 1, duration: 0.9, ease: "power3.out" })
          .to(when, { autoAlpha: 1, x: 0, duration: 0.7, ease: "expo.out" }, "-=0.62")
          .to(body, { autoAlpha: 1, y: 0, duration: 0.85, ease: "expo.out" }, "-=0.55");
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
