/* ==========================================================================
   Romière — Maison
   Shared chrome (header, menu, search, bag, footer), motion and page logic.
   ========================================================================== */
(() => {
  "use strict";

  const CATALOG = window.ROMIERE_CATALOG || [];
  const CONFIG = {
    freeShippingFrom: 6000, // cents
    // Set to the WooCommerce checkout (or another checkout) once it is connected.
    checkoutUrl: null,
    email: "info@romiere.nl",
    instagram: "https://www.instagram.com/romiere.official/",
    tiktok: "https://www.tiktok.com/@romiere.official",
  };
  const BAG_KEY = "romiere-bag-v1";
  const LOADER_KEY = "romiere-intro-seen";

  const CATEGORIES = {
    all: { label: "All", title: "Collection", eyebrow: "The Forever Collection",
      intro: "Every piece in the Forever line, designed to be worn now and remembered forever." },
    "new-in": { label: "New in", title: "New in", eyebrow: "Just arrived",
      intro: "The latest additions to the Forever line. Fresh signatures, made to be noticed." },
    bestsellers: { label: "Bestsellers", title: "Bestsellers", eyebrow: "Loved by you",
      intro: "Our most-loved jewellery, chosen time and again by the Romière community." },
    necklaces: { label: "Necklaces", title: "Necklaces", eyebrow: "The Forever Collection", singular: "Necklace",
      intro: "Delicate chains, luminous pearls and zirconia that catch the light with every movement." },
    bracelets: { label: "Bracelets", title: "Bracelets", eyebrow: "Bracelets & handjewels", singular: "Bracelet",
      intro: "Fine chains that frame the wrist and hand with a quiet, unmistakable sparkle." },
    earrings: { label: "Earrings", title: "Earrings", eyebrow: "The Forever Collection", singular: "Earrings",
      intro: "From freshwater pearl studs to radiant florals: the finishing touch to every look." },
    sets: { label: "Sets", title: "Sets", eyebrow: "Thoughtfully paired", singular: "Set",
      intro: "Matching pieces, made to be worn together. The perfect gift, for someone else or yourself." },
  };
  const CATEGORY_ORDER = ["all", "new-in", "bestsellers", "necklaces", "bracelets", "earrings", "sets"];

  /* ---------- Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (cents) => new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(cents / 100);
  const fold = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  // Bodoni's em dash becomes an invisible hairline at display sizes; use the en dash there.
  const displayText = (s) => esc(s).replace(/\u2014/g, "\u2013");
  const params = new URLSearchParams(location.search);
  const bySlug = (slug) => CATALOG.find((p) => p.slug === slug);
  const byId = (id) => CATALOG.find((p) => p.id === id);
  const productUrl = (p) => `product.html?p=${encodeURIComponent(p.slug)}`;
  const imgPath = (img, size) => `assets/img/products/${img.base}-${size}.webp`;
  const srcset = (img) => `${imgPath(img, 600)} 600w, ${imgPath(img, 1200)} 1200w`;
  const ed = (name, size = 1200) => `assets/img/editorial/${name}-${size}.webp`;
  const page = document.body.dataset.page || "";
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const storage = {
    get(store, k) { try { return window[store].getItem(k); } catch { return null; } },
    set(store, k, v) { try { window[store].setItem(k, v); } catch { /* unavailable */ } },
  };

  const ICONS = {
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h17M14 6l6 6-6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v17M6 14l6 6 6-6"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    gift: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="12" width="22" height="15"/><path d="M3 8h26v4H3zM16 8v19M16 8c-2-4-7-5-7-2s4 2 7 2c3 0 7 1 7-2s-5-2-7 2"/></svg>',
    truck: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 8h16v14H3zM19 13h6l4 5v4H19z"/><circle cx="9" cy="24" r="2.5"/><circle cx="24" cy="24" r="2.5"/></svg>',
    shield: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3l11 4v8c0 7-5 12-11 14C10 27 5 22 5 15V7z"/><path d="M11 16l3.5 3.5L21 13"/></svg>',
    clock: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="12"/><path d="M16 9v7l5 3"/></svg>',
  };

  /* ---------- Shared chrome ---------- */
  const MENU = [
    ["I", "The Collection", "shop.html", "necklace-reveal"],
    ["II", "New in", "shop.html?c=new-in", "earring-portrait"],
    ["III", "Bestsellers", "shop.html?c=bestsellers", "hands-layered"],
    ["IV", "The Story", "story.html", "signature-box"],
    ["V", "Client care", "contact.html", "the-edit"],
  ];

  function renderChrome() {
    const html = `
      <a class="skip-link" href="#main">Naar de inhoud</a>
      <header class="hdr on-dark" data-hdr>
        <div class="wrap hdr__inner">
          <div class="hdr__side">
            <button class="hdr__btn" type="button" data-open="menu" aria-label="Open menu">
              <span class="burger" aria-hidden="true"><i></i><i></i></span><span class="label hide-sm">Menu</span>
            </button>
            <a class="hdr__btn label hide-sm" href="shop.html">Collection</a>
          </div>
          <a class="hdr__logo" href="index.html" aria-label="Romière — home">
            <img class="logo-ivory" src="assets/img/brand/romiere-logo-white.png" alt="Romière" width="1000" height="341">
            <img class="logo-ink" src="assets/img/brand/romiere-logo.png" alt="" aria-hidden="true" width="1000" height="341">
          </a>
          <div class="hdr__side hdr__side--right">
            <button class="hdr__btn label hide-sm" type="button" data-open="search">Search</button>
            <button class="hdr__btn hdr__icon" type="button" data-open="search" aria-label="Zoeken">${ICONS.search}</button>
            <button class="hdr__btn label" type="button" data-open="bag">Bag<sup data-bag-count>0</sup></button>
          </div>
        </div>
      </header>

      <div class="menu" data-panel="menu" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true">
        <div class="menu__inner">
          <div class="menu__top">
            <img src="assets/img/brand/romiere-logo-white.png" alt="Romière">
            <button class="close-x label" type="button" data-close>Close <i aria-hidden="true"></i></button>
          </div>
          <nav class="menu__nav" aria-label="Hoofdmenu">
            ${MENU.map(([n, label, href, img], i) => `
              <a class="menu__item" href="${href}" data-menu-img="${img}" style="--i:${i}">
                <span class="roman">${n}.</span><span class="menu__word">${esc(label)}</span>
              </a>`).join("")}
          </nav>
          <div class="menu__side" aria-hidden="true">
            <figure class="menu__visual">
              ${MENU.map(([, , , img], i) => `<img src="${ed(img)}" alt="" data-img="${img}" class="${i === 0 ? "is-active" : ""}" loading="lazy">`).join("")}
            </figure>
          </div>
          <div class="menu__foot label">
            <nav aria-label="Categorieën">
              <a href="shop.html?c=necklaces">Necklaces</a><a href="shop.html?c=bracelets">Bracelets</a>
              <a href="shop.html?c=earrings">Earrings</a><a href="shop.html?c=sets">Sets</a>
            </nav>
            <nav aria-label="Social">
              <a href="${CONFIG.instagram}" target="_blank" rel="noopener">Instagram</a>
              <a href="${CONFIG.tiktok}" target="_blank" rel="noopener">TikTok</a>
              <a href="mailto:${CONFIG.email}">${CONFIG.email}</a>
            </nav>
          </div>
        </div>
      </div>

      <div class="search t-dark" data-panel="search" role="dialog" aria-modal="true" aria-label="Zoeken" aria-hidden="true">
        <div class="wrap">
          <div class="search__top">
            <span class="label accent">Search the collection</span>
            <button class="close-x label" type="button" data-close>Close <i aria-hidden="true"></i></button>
          </div>
          <label class="search__field">
            <span class="visually-hidden">Zoek een sieraad</span>
            <input type="search" placeholder="Pearl, Florea, handjewel…" autocomplete="off" data-search-input>
          </label>
          <div class="search__suggest label">
            ${["Pearl", "Florea", "Handjewel", "Clover", "Éclat", "Star"].map((s) => `<button type="button" data-suggest="${esc(s)}">${esc(s)}</button>`).join("")}
          </div>
          <div class="search__results" data-search-results></div>
        </div>
      </div>

      <div class="scrim" data-scrim></div>
      <aside class="drawer" data-panel="bag" role="dialog" aria-modal="true" aria-label="Winkeltas" aria-hidden="true">
        <div class="drawer__head">
          <h2>Your selection<sup data-bag-items></sup></h2>
          <button class="close-x label" type="button" data-close>Close <i aria-hidden="true"></i></button>
        </div>
        <div class="meter" data-meter></div>
        <div class="drawer__body" data-bag-body></div>
        <div class="drawer__foot" data-bag-foot></div>
      </aside>

      <div class="toast" role="status" aria-live="polite" data-toast></div>
      <div class="curtain${reduceMotion ? " is-up" : ""}" data-curtain aria-hidden="true"></div>`;
    document.body.insertAdjacentHTML("afterbegin", html);
  }

  function renderFooter() {
    const html = `
      <footer class="ftr t-wine" data-theme="dark">
        <div class="wrap ftr__top">
          <div class="ftr__news">
            <p class="label accent">Join the Romière community</p>
            <h2 class="display s-lg" data-split>A little sparkle <em>in your inbox</em></h2>
            <form class="news" data-newsletter novalidate>
              <label class="visually-hidden" for="nl-email">E-mailadres</label>
              <input id="nl-email" type="email" name="email" placeholder="Your e-mail address" required autocomplete="email">
              <button type="submit" aria-label="Inschrijven">${ICONS.arrow}</button>
            </form>
            <small>Ontvang als eerste nieuwe collecties, stylingtips en exclusieve aanbiedingen.</small>
          </div>
          <div class="ftr__cols">
            <div>
              <h4 class="label">Collection</h4>
              <ul>
                <li><a href="shop.html?c=new-in">New in</a></li>
                <li><a href="shop.html?c=necklaces">Necklaces</a></li>
                <li><a href="shop.html?c=bracelets">Bracelets</a></li>
                <li><a href="shop.html?c=earrings">Earrings</a></li>
                <li><a href="shop.html?c=sets">Sets</a></li>
              </ul>
            </div>
            <div>
              <h4 class="label">Romière</h4>
              <ul>
                <li><a href="story.html">The story</a></li>
                <li><a href="story.html#craftsmanship">Craftsmanship</a></li>
                <li><a href="story.html#signature-edit">Signature Edit</a></li>
                <li><a href="${CONFIG.instagram}" target="_blank" rel="noopener">Instagram</a></li>
                <li><a href="${CONFIG.tiktok}" target="_blank" rel="noopener">TikTok</a></li>
              </ul>
            </div>
            <div>
              <h4 class="label">Client care</h4>
              <ul>
                <li><a href="contact.html">Contact</a></li>
                <li><a href="contact.html#faq">FAQ</a></li>
                <li><a href="contact.html#shipping">Shipping</a></li>
                <li><a href="contact.html#returns">Returns</a></li>
                <li><a href="mailto:${CONFIG.email}">${CONFIG.email}</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="wrap ftr__service label">
          <span>Complimentary shipping from €&nbsp;60</span>
          <span>Signature gift box</span>
          <span>180-day guarantee</span>
          <span>Ordered before 23:00, shipped next day</span>
        </div>
        <div class="ftr__logo"><img src="assets/img/brand/romiere-logo-white.png" alt="Romière" loading="lazy" data-reveal></div>
        <div class="wrap ftr__bottom">
          <span>© ${new Date().getFullYear()} Romière. All rights reserved.</span>
          <nav aria-label="Betaalmethoden en social">
            <span>iDEAL · Bancontact · Klarna</span>
            <a href="contact.html#returns">Returns</a>
            <a href="${CONFIG.instagram}" target="_blank" rel="noopener">@romiere.official</a>
          </nav>
        </div>
      </footer>`;
    const main = $("#main");
    main.insertAdjacentHTML("afterend", html);
  }

  /* ---------- Overlays ---------- */
  let openKey = null;
  let lastFocus = null;
  function openPanel(key) {
    if (openKey) closePanel(true);
    const el = $(`[data-panel="${key}"]`);
    if (!el) return;
    lastFocus = document.activeElement;
    openKey = key;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    if (key === "bag") $("[data-scrim]").classList.add("is-on");
    document.body.classList.add("is-locked");
    hdr.classList.remove("is-hidden");
    const focusTarget = key === "search" ? $("[data-search-input]") : $("[data-close]", el);
    setTimeout(() => focusTarget && focusTarget.focus({ preventScroll: true }), 120);
  }
  function closePanel(silent) {
    if (!openKey) return;
    const el = $(`[data-panel="${openKey}"]`);
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    $("[data-scrim]").classList.remove("is-on");
    openKey = null;
    if (!silent) {
      document.body.classList.remove("is-locked");
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
  }

  function bindOverlays() {
    document.addEventListener("click", (e) => {
      const opener = e.target.closest("[data-open]");
      if (opener) {
        if (opener.dataset.open === "bag") renderBag();
        openPanel(opener.dataset.open);
        return;
      }
      if (e.target.closest("[data-close]") || e.target.closest("[data-scrim]")) closePanel();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closePanel(); closeLightbox(); }
    });

    // Menu: image follows the hovered chapter
    $$(".menu__item").forEach((item) => item.addEventListener("mouseenter", () => {
      $$(".menu__visual img").forEach((img) => img.classList.toggle("is-active", img.dataset.img === item.dataset.menuImg));
    }));

    // Search
    const input = $("[data-search-input]");
    const results = $("[data-search-results]");
    const run = () => {
      const q = fold(input.value.trim());
      if (!q) { results.innerHTML = ""; return; }
      const hits = CATALOG.filter((p) => fold([p.name, p.categories.join(" "), p.tagline, p.details.join(" ")].join(" ")).includes(q));
      results.innerHTML = hits.length
        ? `<p class="label accent" style="margin:0 0 48px">${hits.length} ${hits.length === 1 ? "piece" : "pieces"}</p>
           <div class="pieces">${hits.map((p) => pieceHTML(p, { compact: true })).join("")}</div>`
        : `<p class="search__empty">Geen sieraden gevonden voor “${esc(input.value)}”.</p>`;
    };
    input.addEventListener("input", run);
    $$("[data-suggest]").forEach((b) => b.addEventListener("click", () => { input.value = b.dataset.suggest; run(); input.focus(); }));

    // Newsletter (front-end only until connected to a mailing tool)
    $$("[data-newsletter]").forEach((form) => form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!/^\S+@\S+\.\S+$/.test(form.email.value.trim())) { form.email.focus(); toast("Vul een geldig e-mailadres in."); return; }
      form.outerHTML = `<p class="news-done">Welcome to the Romière community.</p>`;
    }));
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const el = $("[data-toast]");
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-on"), 3400);
  }

  /* ---------- Bag ---------- */
  const readBag = () => {
    try { return JSON.parse(storage.get("localStorage", BAG_KEY)) || []; } catch { return []; }
  };
  let bag = readBag().filter((i) => byId(i.id));
  const writeBag = () => { storage.set("localStorage", BAG_KEY, JSON.stringify(bag)); updateCount(); };
  const bagCount = () => bag.reduce((n, i) => n + i.qty, 0);
  function updateCount() { $$("[data-bag-count]").forEach((el) => { el.textContent = bagCount(); }); }

  function addToBag(product, options = {}, qty = 1) {
    if (!product.inStock) return;
    const key = `${product.id}|${Object.entries(options).map(([k, v]) => `${k}:${v}`).join(",")}`;
    const line = bag.find((i) => i.key === key);
    if (line) line.qty = Math.min(line.qty + qty, 10);
    else bag.push({ key, id: product.id, options, qty });
    writeBag();
    renderBag();
    openPanel("bag");
  }

  function renderBag() {
    const body = $("[data-bag-body]");
    const foot = $("[data-bag-foot]");
    const meter = $("[data-meter]");
    const subtotal = bag.reduce((s, i) => s + byId(i.id).price * i.qty, 0);
    $("[data-bag-items]").textContent = bag.length ? bagCount() : "";

    const remaining = CONFIG.freeShippingFrom - subtotal;
    meter.hidden = !bag.length;
    meter.innerHTML = `${remaining > 0
      ? `Nog <strong>${money(remaining)}</strong> tot complimentary shipping.`
      : `<strong>Complimentary shipping</strong> — je bestelling wordt gratis verzonden.`}
      <div class="meter__bar"><span style="transform:scaleX(${Math.min(subtotal / CONFIG.freeShippingFrom, 1)})"></span></div>`;

    if (!bag.length) {
      body.innerHTML = `<div class="drawer__empty">
          <p class="serif">Your selection<br><em>is still empty</em></p>
          <p>Ontdek de Forever line en vind jouw signature piece.</p>
          <a class="pill pill--ink" href="shop.html"><span>Discover the collection</span></a>
        </div>`;
      foot.innerHTML = "";
      return;
    }
    body.innerHTML = bag.map((i) => {
      const p = byId(i.id);
      const opts = Object.entries(i.options).map(([k, v]) => `${esc(k)}: ${esc(v)}`).join(" · ");
      return `<div class="line" data-key="${esc(i.key)}">
          <a class="line__img" href="${productUrl(p)}"><img src="${imgPath(p.images[0], 600)}" alt="${esc(p.name)}" loading="lazy"></a>
          <div>
            <h3><a href="${productUrl(p)}">${esc(p.name)}</a></h3>
            <p class="line__opt">${opts || "Forever line"}</p>
            <div class="stepper" aria-label="Aantal">
              <button type="button" data-qty="-1" aria-label="Minder">−</button><output>${i.qty}</output><button type="button" data-qty="1" aria-label="Meer">+</button>
            </div>
          </div>
          <div class="line__price">${money(p.price * i.qty)}<div><button class="line__remove" type="button" data-remove>Remove</button></div></div>
        </div>`;
    }).join("");
    foot.innerHTML = `
      <div class="drawer__total"><span class="label">Subtotal</span><strong>${money(subtotal)}</strong></div>
      <p class="drawer__note">Inclusief btw. Signature gift box inbegrepen. Verzendkosten worden berekend bij het afrekenen.</p>
      <button class="pill pill--ink pill--block" type="button" data-checkout><span>Proceed to checkout</span></button>
      <p class="drawer__pay">iDEAL · Bancontact · Klarna</p>`;
  }

  function bindBag() {
    $("[data-panel='bag']").addEventListener("click", (e) => {
      if (e.target.closest("[data-checkout]")) {
        if (CONFIG.checkoutUrl) location.href = CONFIG.checkoutUrl;
        else toast("De checkout is nog niet gekoppeld in deze preview.");
        return;
      }
      const row = e.target.closest("[data-key]");
      const line = row && bag.find((i) => i.key === row.dataset.key);
      if (!line) return;
      const q = e.target.closest("[data-qty]");
      if (q) line.qty = clamp(line.qty + Number(q.dataset.qty), 0, 10);
      if (e.target.closest("[data-remove]")) line.qty = 0;
      bag = bag.filter((i) => i.qty > 0);
      writeBag();
      renderBag();
    });
    window.addEventListener("storage", (e) => {
      if (e.key === BAG_KEY) { bag = readBag().filter((i) => byId(i.id)); updateCount(); renderBag(); }
    });
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-quick]");
      if (!btn) return;
      e.preventDefault();
      addToBag(byId(Number(btn.dataset.quick)), btn.dataset.option ? { [btn.dataset.option]: btn.dataset.value } : {});
    });
    updateCount();
  }

  /* ---------- Product piece ---------- */
  function subline(p) {
    const finish = p.options.find((o) => o.name === "Finish") || p.options[0];
    if (finish) return finish.values.join(" · ");
    const cat = ["sets", "necklaces", "bracelets", "earrings"].find((c) => p.categories.includes(c));
    return cat ? CATEGORIES[cat].singular : "Forever line";
  }

  function pieceHTML(p, { compact = false, eager = false } = {}) {
    const [a, b] = p.images;
    const sizes = compact ? "220px" : "(max-width: 640px) 50vw, (max-width: 1180px) 45vw, 30vw";
    const flag = !p.inStock
      ? `<span class="piece__flag piece__flag--out label">Sold out</span>`
      : p.categories.includes("new-in") ? `<span class="piece__flag label">New</span>` : "";
    let quick = "";
    if (p.inStock && !compact) {
      if (p.options.length === 1) {
        const o = p.options[0];
        quick = `<div class="piece__quick"><em>Add</em>${o.values.map((v) => `<button type="button" data-quick="${p.id}" data-option="${esc(o.name)}" data-value="${esc(v)}">${esc(v)}</button>`).join("")}</div>`;
      } else if (p.options.length > 1) {
        quick = `<div class="piece__quick"><a href="${productUrl(p)}">Choose your finish</a></div>`;
      } else {
        quick = `<div class="piece__quick"><button type="button" data-quick="${p.id}">Add to bag</button></div>`;
      }
    }
    return `<article class="piece">
      <div class="piece__media">
        <a class="piece__frame" href="${productUrl(p)}" data-cursor="view" aria-label="${esc(p.name)}">
          ${flag}
          <img class="fit-${a.fit}" src="${imgPath(a, 600)}" srcset="${srcset(a)}" sizes="${sizes}" alt="${esc(p.name)}" loading="${eager ? "eager" : "lazy"}" width="${a.w}" height="${a.h}">
          ${b ? `<img class="piece__alt fit-${b.fit}" src="${imgPath(b, 600)}" srcset="${srcset(b)}" sizes="${sizes}" alt="" loading="lazy" width="${b.w}" height="${b.h}">` : ""}
        </a>
        ${quick}
      </div>
      <div class="piece__info">
        <h3 class="piece__name"><a href="${productUrl(p)}">${esc(p.name)}</a></h3>
        <span class="piece__price">${p.price ? money(p.price) : "—"}</span>
      </div>
      <p class="piece__sub">${esc(subline(p))}</p>
    </article>`;
  }

  function listFor(key) {
    const items = CATALOG.slice();
    if (key === "bestsellers") return items.filter((p) => p.bestseller).sort((a, b) => a.bestseller - b.bestseller);
    if (!key || key === "all") return items;
    return items.filter((p) => p.categories.includes(key));
  }

  /* ---------- Text splitting ---------- */
  function splitWords(root, cls = "w") {
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span");
            w.className = cls;
            if (cls === "w") {
              const inner = document.createElement("span");
              inner.textContent = part;
              inner.style.transitionDelay = `${(i++) * 0.055}s`;
              w.appendChild(inner);
            } else {
              w.textContent = part;
            }
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          walk(child);
        }
      });
    };
    walk(root);
  }

  function bindReveal(root = document) {
    $$("[data-split]:not([data-split-done])", root).forEach((el) => { splitWords(el); el.setAttribute("data-split-done", ""); });
    const els = $$("[data-reveal]:not(.is-in), [data-split]:not(.is-in)", root);
    if (reduceMotion || !("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("is-in")); return; }
    // A fully clipped mask counts as invisible to IntersectionObserver, so watch its parent instead.
    const targets = new Map();
    els.forEach((el) => {
      const t = el.dataset.reveal === "mask" ? el.parentElement : el;
      targets.set(t, [...(targets.get(t) || []), el]);
    });
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      (targets.get(en.target) || []).forEach((el) => el.classList.add("is-in"));
      io.unobserve(en.target);
    }), { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    targets.forEach((_, t) => io.observe(t));
  }

  /* ---------- Header & scroll engine ---------- */
  let hdr;
  const scrollers = [];
  function bindHeader() {
    hdr = $("[data-hdr]");
    let lastY = window.scrollY;
    scrollers.push(() => {
      const forced = document.body.dataset.header;
      const y = window.scrollY;
      const dy = y - lastY;
      if (!openKey) {
        if (y > 160 && dy > 6) hdr.classList.add("is-hidden");
        else if (dy < -6 || y < 160) hdr.classList.remove("is-hidden");
      }
      lastY = y;
      const filled = forced ? true : y > 40;
      hdr.classList.toggle("is-filled", filled);
      hdr.classList.toggle("is-forced", Boolean(forced));
      document.body.classList.toggle("hdr-visible", !hdr.classList.contains("is-hidden") && y > 40);
      let theme = forced;
      if (!theme) {
        const probe = document.elementFromPoint(window.innerWidth / 2, hdr.offsetHeight + 2);
        const section = probe && probe.closest("[data-theme]");
        theme = section ? section.dataset.theme : null;
      }
      if (theme) {
        hdr.classList.toggle("on-light", theme === "light");
        hdr.classList.toggle("on-dark", theme !== "light");
      }
    });
  }

  function bindParallax() {
    const els = $$("[data-speed]");
    if (!els.length || reduceMotion) return;
    scrollers.push(() => {
      const vh = window.innerHeight;
      els.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const offset = (r.top + r.height / 2 - vh / 2) * Number(el.dataset.speed);
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
    });
  }

  let ticking = false;
  function runScrollers() {
    ticking = false;
    scrollers.forEach((fn) => fn());
  }
  function requestTick() {
    if (!ticking) { ticking = true; requestAnimationFrame(runScrollers); }
  }

  /* ---------- Cursor ---------- */
  function bindCursor() {
    if (!finePointer || reduceMotion) return;
    document.body.insertAdjacentHTML("beforeend", `<div class="cursor is-hidden" aria-hidden="true"><span class="cursor__dot"></span><span class="cursor__ring"><span>View</span></span></div>`);
    document.body.classList.add("has-cursor");
    const cursor = $(".cursor");
    const dot = $(".cursor__dot", cursor);
    const ring = $(".cursor__ring", cursor);
    const label = $(".cursor__ring span", cursor);
    let x = -100, y = -100, rx = -100, ry = -100;
    window.addEventListener("mousemove", (e) => {
      x = e.clientX; y = e.clientY;
      cursor.classList.remove("is-hidden");
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }, { passive: true });
    document.addEventListener("mouseleave", () => cursor.classList.add("is-hidden"));
    document.addEventListener("mouseover", (e) => {
      const view = e.target.closest("[data-cursor]");
      const link = e.target.closest("a, button, summary, label, select, [role='radio']");
      cursor.classList.toggle("is-view", Boolean(view));
      cursor.classList.toggle("is-link", Boolean(link) && !view);
      if (view) label.textContent = view.dataset.cursorLabel || "View";
    });
    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- Loader & page transitions ---------- */
  function bindTransitions() {
    const curtain = $("[data-curtain]");
    const ready = () => document.body.classList.add("is-ready");
    const showLoader = page === "home" && !reduceMotion && !storage.get("sessionStorage", LOADER_KEY);

    if (showLoader) {
      storage.set("sessionStorage", LOADER_KEY, "1");
      document.body.insertAdjacentHTML("beforeend", `
        <div class="loader" data-loader aria-hidden="true">
          <div class="loader__mark">
            <img src="assets/img/brand/romiere-logo-white.png" alt="">
            <span class="label">Forever Guided</span>
          </div>
        </div>`);
      curtain.classList.add("is-up");
      document.body.classList.add("is-locked");
      setTimeout(() => {
        $("[data-loader]").classList.add("is-done");
        document.body.classList.remove("is-locked");
        setTimeout(ready, 350);
        setTimeout(() => $("[data-loader]")?.remove(), 1400);
      }, 2300);
    } else {
      requestAnimationFrame(() => requestAnimationFrame(() => { curtain.classList.add("is-up"); setTimeout(ready, 250); }));
    }

    window.addEventListener("pageshow", (e) => {
      if (e.persisted) { curtain.classList.remove("is-armed", "is-closing"); curtain.classList.add("is-up"); ready(); }
    });

    if (reduceMotion) return;
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
      e.preventDefault();
      closePanel(true);
      curtain.classList.remove("is-up");
      curtain.classList.add("is-armed");
      void curtain.offsetWidth;
      curtain.classList.add("is-closing");
      setTimeout(() => { location.href = url.href; }, 720);
    });
  }

  /* ==========================================================================
     Pages
     ========================================================================== */
  function initHome() {
    // Hero slideshow inside the arch
    const slides = $$(".hero__arch img");
    const ticks = $$(".hero__count i");
    let current = 0;
    const show = (i) => {
      slides.forEach((s, k) => s.classList.toggle("is-active", k === i));
      ticks.forEach((t) => t.classList.remove("is-active"));
      if (ticks[i]) { void ticks[i].offsetWidth; ticks[i].classList.add("is-active"); }
    };
    show(0);
    if (slides.length > 1 && !reduceMotion) setInterval(() => { current = (current + 1) % slides.length; show(current); }, 6000);

    // Manifesto: words light up as you read
    const manifesto = $("[data-scrub]");
    if (manifesto) {
      splitWords(manifesto, "sw");
      const words = $$(".sw", manifesto);
      if (reduceMotion) words.forEach((w) => w.classList.add("is-lit"));
      else scrollers.push(() => {
        const r = manifesto.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
        const lit = Math.round(p * words.length * 1.1);
        words.forEach((w, i) => w.classList.toggle("is-lit", i < lit));
      });
    }

    // Horizontal collection
    const hcol = $("[data-hscroll]");
    if (hcol) {
      const track = $("[data-track]", hcol);
      const picks = [...listFor("bestsellers"), ...listFor("new-in")]
        .filter((p, i, arr) => p.inStock && arr.findIndex((x) => x.id === p.id) === i).slice(0, 10);
      track.innerHTML = picks.map((p, i) => pieceHTML(p, { eager: i < 3 })).join("") + `
        <a class="hcol__end" href="shop.html" data-cursor="view" data-cursor-label="Enter">
          <span><span class="label">Discover all</span><span class="serif">${CATALOG.length} pieces</span></span>
        </a>`;
      const bar = $(".hcol__progress span", hcol);
      const count = $("[data-hcol-count]", hcol);
      let dist = 0;
      let active = false;
      const measure = () => {
        active = window.innerWidth > 900 && !reduceMotion;
        if (!active) { hcol.style.height = ""; track.style.transform = ""; return; }
        dist = Math.max(0, track.scrollWidth - window.innerWidth);
        hcol.style.height = `${window.innerHeight + dist}px`;
      };
      measure();
      window.addEventListener("resize", measure);
      window.addEventListener("load", measure);
      scrollers.push(() => {
        if (!active) return;
        const p = clamp(-hcol.getBoundingClientRect().top / (dist || 1), 0, 1);
        track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px, 0, 0)`;
        bar.style.transform = `scaleX(${p})`;
        if (count) count.textContent = `${String(Math.round(p * (picks.length - 1)) + 1).padStart(2, "0")} — ${String(picks.length).padStart(2, "0")}`;
      });
    }

    // Meaning chapters
    const chapters = $("[data-chapters]");
    if (chapters) {
      const picks = [[162, "Florea"], [104, "Éclat"], [166, "Amour <em>Rouge</em>"]];
      chapters.innerHTML = picks.map(([id, title], i) => {
        const p = byId(id);
        if (!p) return "";
        const [a, b] = p.images;
        return `<article class="chapter${i % 2 ? " chapter--flip" : ""}">
            <div class="chapter__media">
              <a class="chapter__arch" href="${productUrl(p)}" data-cursor="view" data-reveal="mask">
                <img src="${imgPath(a, 1200)}" srcset="${srcset(a)}" sizes="(max-width: 900px) 80vw, 40vw" alt="${esc(p.name)}" loading="lazy">
              </a>
              ${b ? `<figure class="chapter__float" data-speed="-0.08"><img src="${imgPath(b, 600)}" alt="" loading="lazy"></figure>` : ""}
            </div>
            <div class="chapter__body">
              <span class="chapter__num label accent" data-reveal>N° ${String(i + 1).padStart(2, "0")} — The meaning</span>
              <h3 class="display s-xl" data-split>${title}</h3>
              <p class="quote" data-reveal>“${displayText(p.meaning)}”</p>
              <div class="chapter__meta" data-reveal><span class="serif">${esc(p.name)}</span><span class="label">${esc(subline(p))}</span><span class="price">${money(p.price)}</span></div>
              <a class="uline" href="${productUrl(p)}" data-reveal>Discover the piece ${ICONS.arrow}</a>
            </div>
          </article>`;
      }).join("");
    }

    // Category index with floating preview
    const index = $("[data-index]");
    if (index) {
      $$("[data-count]", index).forEach((el) => { el.textContent = listFor(el.dataset.count).length; });
      const float = $(".index__float", index);
      const imgs = $$("img", float);
      let tx = 0, ty = 0, fx = 0, fy = 0, raf = null;
      const follow = () => {
        fx += (tx - fx) * 0.14;
        fy += (ty - fy) * 0.14;
        float.style.transform = `translate3d(${fx.toFixed(1)}px, ${fy.toFixed(1)}px, 0)`;
        raf = Math.abs(tx - fx) + Math.abs(ty - fy) > 0.5 ? requestAnimationFrame(follow) : null;
      };
      index.addEventListener("mousemove", (e) => {
        tx = e.clientX; ty = e.clientY;
        if (!float.classList.contains("is-on")) { fx = tx; fy = ty; }
        if (!raf) raf = requestAnimationFrame(follow);
      });
      $$(".index__row", index).forEach((row) => {
        row.addEventListener("mouseenter", () => {
          imgs.forEach((img) => img.classList.toggle("is-active", img.dataset.img === row.dataset.img));
          float.classList.add("is-on");
        });
        row.addEventListener("mouseleave", () => float.classList.remove("is-on"));
      });
    }

    // Ritual steps swap the sticky image
    const ritual = $("[data-ritual]");
    if (ritual && "IntersectionObserver" in window) {
      const steps = $$(".ritual__step", ritual);
      const frames = $$(".ritual__frame img", ritual);
      const io = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const i = steps.indexOf(en.target);
        steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
        frames.forEach((f, k) => f.classList.toggle("is-active", k === i));
      }), { rootMargin: "-45% 0px -45% 0px" });
      steps.forEach((s) => io.observe(s));
    }
  }

  function initShop() {
    const grid = $("[data-shop-grid]");
    const cats = $("[data-cats]");
    const sortSel = $("[data-sort]");
    let current = CATEGORIES[params.get("c")] ? params.get("c") : "all";

    cats.innerHTML = CATEGORY_ORDER.map((k, i) => `${i ? '<span aria-hidden="true">/</span>' : ""}<button type="button" data-cat="${k}" aria-pressed="${k === current}">${esc(CATEGORIES[k].label)}</button>`).join("");

    const tiles = [
      `<a class="editorial-tile" href="story.html" data-cursor="view" data-cursor-label="Story">
          <img src="${ed("the-edit")}" alt="" loading="lazy">
          <div class="editorial-tile__body">
            <p class="label">Forever Guided</p>
            <p class="quote">Made for confidence, defined by elegance, worn with individuality.</p>
            <span class="uline">The Romière story ${ICONS.arrow}</span>
          </div>
        </a>`,
      `<a class="editorial-tile" href="story.html#signature-edit" data-cursor="view" data-cursor-label="Story">
          <img src="${ed("signature-box")}" alt="" loading="lazy">
          <div class="editorial-tile__body">
            <p class="label">The signature box</p>
            <p class="quote">Every piece arrives in our signature gift box. Every detail has a meaning.</p>
            <span class="uline">Discover the ritual ${ICONS.arrow}</span>
          </div>
        </a>`,
    ];

    const render = () => {
      const meta = CATEGORIES[current];
      let items = listFor(current);
      const sort = sortSel.value;
      if (sort === "price-asc") items.sort((a, b) => (a.price ?? 1e9) - (b.price ?? 1e9));
      if (sort === "price-desc") items.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
      if (sort === "name") items.sort((a, b) => a.name.localeCompare(b.name, "nl"));
      if (sort === "featured") items.sort((a, b) => Number(b.inStock) - Number(a.inStock));

      $("[data-shop-eyebrow]").textContent = meta.eyebrow;
      $("[data-shop-title]").textContent = meta.title;
      $("[data-shop-sup]").textContent = items.length;
      $("[data-shop-intro]").textContent = meta.intro;
      $("[data-shop-count]").textContent = `${items.length} ${items.length === 1 ? "piece" : "pieces"}`;
      document.title = `${meta.title} — Romière`;
      $$("[data-cat]", cats).forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.cat === current)));

      if (!items.length) { grid.innerHTML = `<p class="shop-empty">Er zijn op dit moment geen sieraden in deze categorie.</p>`; return; }
      const cards = items.map((p, i) => pieceHTML(p, { eager: i < 3 }));
      if (current === "all" && sort === "featured") {
        if (cards.length > 4) cards.splice(4, 0, tiles[0]);
        if (cards.length > 14) cards.splice(14, 0, tiles[1]);
      }
      grid.innerHTML = cards.join("");
    };

    cats.addEventListener("click", (e) => {
      const c = e.target.closest("[data-cat]");
      if (!c) return;
      current = c.dataset.cat;
      const url = new URL(location.href);
      if (current === "all") url.searchParams.delete("c"); else url.searchParams.set("c", current);
      history.replaceState(null, "", url);
      render();
    });
    sortSel.addEventListener("change", render);
    render();
  }

  // Lightbox
  let lbImages = [];
  let lbIndex = 0;
  function openLightbox(images, i) {
    lbImages = images; lbIndex = i;
    const lb = $("[data-lightbox]");
    $("img", lb).src = imgPath(images[i], 1200);
    lb.classList.add("is-open");
    document.body.classList.add("is-locked");
  }
  function closeLightbox() {
    const lb = $("[data-lightbox]");
    if (!lb || !lb.classList.contains("is-open")) return;
    lb.classList.remove("is-open");
    if (!openKey) document.body.classList.remove("is-locked");
  }
  function stepLightbox(d) {
    lbIndex = (lbIndex + d + lbImages.length) % lbImages.length;
    $("[data-lightbox] img").src = imgPath(lbImages[lbIndex], 1200);
  }

  function detailHTML(d) {
    const m = d.match(/^([A-Za-zÀ-ÿ -]{2,22}):\s*(.+)$/);
    return m ? `<li><strong>${esc(m[1])}:</strong> ${esc(m[2])}</li>` : `<li>${esc(d)}</li>`;
  }

  function initProduct() {
    const root = $("[data-pdp]");
    const p = bySlug(params.get("p"));
    if (!p) {
      root.innerHTML = `<section class="notfound t-dark" data-theme="dark">
          <div>
            <p class="label accent">Not found</p>
            <h1 class="display s-lg">Dit sieraad is <em>niet gevonden</em></h1>
            <a class="pill" href="shop.html"><span>Discover the collection</span></a>
          </div>
        </section>`;
      document.body.removeAttribute("data-header");
      return;
    }
    document.title = `${p.name} — Romière`;
    const metaDesc = $('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", (p.tagline || p.intro[0] || "").slice(0, 155));

    const cat = ["sets", "necklaces", "bracelets", "earrings"].find((c) => p.categories.includes(c));
    const number = String(CATALOG.indexOf(p) + 1).padStart(2, "0");
    const state = {};
    p.options.forEach((o) => { state[o.name] = o.values[0]; });

    const options = p.options.map((o) => `<div class="opt" role="radiogroup" aria-label="${esc(o.name)}">
        <div class="opt__head"><span class="label">${esc(o.name)}</span><span class="serif" data-opt-value="${esc(o.name)}">${esc(state[o.name])}</span></div>
        <div class="opt__vals">${o.values.map((v) => `<button type="button" class="swatch" role="radio" data-opt="${esc(o.name)}" data-val="${esc(v)}" aria-checked="${v === state[o.name]}"><i class="metal--${fold(v)}"></i>${esc(v)}</button>`).join("")}</div>
      </div>`).join("");

    const perks = [
      [ICONS.truck, "Complimentary shipping vanaf € 60 (NL, BE & DE)"],
      [ICONS.clock, "Voor 23:00 besteld, morgen verzonden"],
      [ICONS.gift, "In onze signature gift box"],
      [ICONS.shield, "180 dagen kwaliteitsgarantie"],
    ];

    root.innerHTML = `
      <section class="pdp">
        <div class="pdp__gallery t-light" data-theme="light" data-gallery>
          ${p.images.map((img, i) => `<div class="pdp__slide" data-slide="${i}" data-cursor="view" data-cursor-label="Zoom">
              <img class="fit-${img.fit}" src="${imgPath(img, 1200)}" srcset="${srcset(img)}" sizes="(max-width: 900px) 100vw, 55vw" alt="${esc(p.name)}${i ? ` — afbeelding ${i + 1}` : ""}" loading="${i < 2 ? "eager" : "lazy"}" width="${img.w}" height="${img.h}">
            </div>`).join("")}
        </div>
        <div class="pdp__dots" aria-hidden="true">${p.images.map((_, i) => `<span class="${i ? "" : "is-active"}"></span>`).join("")}</div>
        <aside class="pdp__panel t-dark" data-theme="dark">
          <div class="pdp__sticky" data-sticky>
            <nav class="crumbs label" aria-label="Kruimelpad">
              <a href="shop.html">Collection</a><span aria-hidden="true">/</span>
              ${cat ? `<a href="shop.html?c=${cat}">${esc(CATEGORIES[cat].label)}</a>` : ""}
            </nav>
            <p class="label accent">N° ${number} — Forever line</p>
            <h1 class="display pdp__title">${esc(p.name)}</h1>
            ${p.tagline ? `<p class="pdp__tagline">${displayText(p.tagline)}</p>` : ""}
            <div class="pdp__price"><span class="serif">${p.price ? money(p.price) : ""}</span>${p.price ? "<small>incl. btw</small>" : ""}</div>
            ${p.inStock ? options : ""}
            ${p.inStock
              ? `<div class="pdp__buy">
                  <div class="stepper" aria-label="Aantal"><button type="button" data-step="-1" aria-label="Minder">−</button><output data-qty>1</output><button type="button" data-step="1" aria-label="Meer">+</button></div>
                  <button class="pill pill--solid" type="button" data-add><span>Add to bag</span></button>
                </div>`
              : `<button class="pill pill--block" type="button" disabled><span>Sold out</span></button>
                 <p class="pdp__soldout">Tijdelijk uitverkocht. Volg <a class="text-link" href="${CONFIG.instagram}" target="_blank" rel="noopener">@romiere.official</a> om als eerste te horen wanneer dit piece terug is.</p>`}
            <ul class="perks">${perks.map(([icon, t]) => `<li>${icon}<span>${esc(t)}</span></li>`).join("")}</ul>
            <a class="uline" href="#details" style="margin-top:38px;align-self:flex-start">Details &amp; care ${ICONS.down}</a>
          </div>
        </aside>
      </section>
      <section class="pdp-details t-light" id="details" data-theme="light">
        <div class="wrap pdp-details__grid">
          <div>
            <p class="label accent" data-reveal>The piece</p>
            ${p.intro.length ? `<p class="pdp-details__lead serif" data-reveal>${displayText(p.intro[0])}</p>` : ""}
            ${p.intro.slice(1).map((t) => `<p class="body-copy" data-reveal>${esc(t)}</p>`).join("")}
          </div>
          <div class="acc" data-reveal data-delay="1">
            ${p.details.length ? `<details open>
              <summary class="label">Details &amp; materials</summary>
              <div class="acc__body"><ul>${p.details.map(detailHTML).join("")}</ul></div>
            </details>` : ""}
            <details${p.details.length ? "" : " open"}>
              <summary class="label">Delivery &amp; returns</summary>
              <div class="acc__body">
                <p>Voor 23:00 besteld, de volgende werkdag verzonden. Gratis verzending vanaf €&nbsp;60 naar Nederland, België en Duitsland.</p>
                <p>Retourneren kan binnen 14 dagen na ontvangst, mits ongedragen, onbeschadigd en in de originele verzegelde verpakking. <a class="text-link" href="contact.html#returns">Retourbeleid</a></p>
              </div>
            </details>
            <details>
              <summary class="label">Care</summary>
              <div class="acc__body"><p>Bewaar je sieraad in de signature Romière box wanneer je het niet draagt en poets het voorzichtig met een zachte, droge doek. Fijne kettingen en handjewels zijn delicaat: draag ze met zorg.</p></div>
            </details>
          </div>
        </div>
      </section>
      ${p.meaning ? `<section class="pdp-meaning t-wine" data-theme="dark">
          <div class="narrow">
            <p class="label accent" data-reveal>The meaning of ${esc(p.name)}</p>
            <p class="quote" data-reveal data-delay="1">“${displayText(p.meaning)}”</p>
            ${p.closing.length ? `<p class="pdp-meaning__closing label" data-reveal data-delay="2">${esc(p.closing[0].replace(/[“”"]/g, ""))}</p>` : ""}
          </div>
        </section>` : ""}
      <section class="pdp-more t-light" data-theme="light">
        <div class="wrap">
          <div class="section-head">
            <div>
              <p class="label accent">Complete the look</p>
              <h2 class="display s-lg" data-split>You may <em>also love</em></h2>
            </div>
            <a class="uline" href="shop.html${cat ? `?c=${cat}` : ""}">View all ${ICONS.arrow}</a>
          </div>
          <div class="pieces" data-related></div>
        </div>
      </section>
      <div class="lightbox" data-lightbox role="dialog" aria-label="Afbeelding vergroot">
        <button class="close-x label" type="button" data-lb-close>Close <i aria-hidden="true"></i></button>
        <img src="" alt="${esc(p.name)}">
        <div class="lightbox__nav">
          <button class="round-btn" type="button" data-lb="-1" aria-label="Vorige">${ICONS.prev}</button>
          <button class="round-btn" type="button" data-lb="1" aria-label="Volgende">${ICONS.next}</button>
        </div>
      </div>`;

    const related = CATALOG.filter((x) => x.id !== p.id && x.inStock)
      .map((x) => ({ x, score: x.categories.filter((c) => p.categories.includes(c) && c !== "forever-line").length * 2 + (x.bestseller ? 1 : 0) }))
      .sort((a, b) => b.score - a.score).slice(0, 4).map(({ x }) => x);
    $("[data-related]").innerHTML = related.map((x) => pieceHTML(x)).join("");

    // Sticky panel only when it fits the viewport
    const sticky = $("[data-sticky]");
    const fit = () => sticky.classList.toggle("is-static", sticky.scrollHeight > window.innerHeight);
    fit();
    window.addEventListener("resize", fit);

    // Gallery: dots on mobile, lightbox everywhere
    const gallery = $("[data-gallery]");
    const dots = $$(".pdp__dots span");
    gallery.addEventListener("scroll", () => {
      const i = Math.round(gallery.scrollLeft / gallery.clientWidth);
      dots.forEach((d, k) => d.classList.toggle("is-active", k === i));
    }, { passive: true });
    gallery.addEventListener("click", (e) => {
      const s = e.target.closest("[data-slide]");
      if (s) openLightbox(p.images, Number(s.dataset.slide));
    });
    const lb = $("[data-lightbox]");
    lb.addEventListener("click", (e) => {
      const nav = e.target.closest("[data-lb]");
      if (nav) stepLightbox(Number(nav.dataset.lb));
      else if (e.target.closest("[data-lb-close]") || e.target === lb) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "ArrowRight") stepLightbox(1);
      if (e.key === "ArrowLeft") stepLightbox(-1);
    });

    // Finish, quantity, add to bag
    let qty = 1;
    root.addEventListener("click", (e) => {
      const opt = e.target.closest("[data-opt]");
      if (opt) {
        state[opt.dataset.opt] = opt.dataset.val;
        $$(`[data-opt="${CSS.escape(opt.dataset.opt)}"]`, root).forEach((b) => b.setAttribute("aria-checked", String(b === opt)));
        $(`[data-opt-value="${CSS.escape(opt.dataset.opt)}"]`, root).textContent = opt.dataset.val;
      }
      const step = e.target.closest("[data-step]");
      if (step) {
        qty = clamp(qty + Number(step.dataset.step), 1, 10);
        $("[data-qty]", root).textContent = qty;
      }
      if (e.target.closest("[data-add]")) addToBag(p, { ...state }, qty);
    });
  }

  function initContact() {
    const form = $("[data-contact-form]");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const f = Object.fromEntries(new FormData(form));
      const subject = `${f.subject || "Vraag"}${f.order ? ` — bestelling ${f.order}` : ""}`;
      const body = `${f.message}\n\n${f.name}\n${f.email}${f.order ? `\nBestelnummer: ${f.order}` : ""}`;
      location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      toast("Je e-mailprogramma wordt geopend om het bericht te versturen.");
    });
  }

  /* ---------- Boot ---------- */
  renderChrome();
  renderFooter();
  bindTransitions();
  bindOverlays();
  bindBag();
  renderBag();
  bindHeader();
  const inits = { home: initHome, shop: initShop, product: initProduct, contact: initContact };
  try { if (inits[page]) inits[page](); } catch (err) { console.error(err); }
  bindParallax();
  bindReveal();
  bindCursor();
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);
  runScrollers();
})();
