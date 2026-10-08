/* ==========================================================================
   Romière — shared site behaviour
   Header, menus, search, shopping bag, product rendering and page logic.
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

  const CATEGORIES = {
    all: { label: "All", title: "The Collection", eyebrow: "Forever line",
      intro: "Every piece in the Forever line, designed to be worn now and remembered forever." },
    "new-in": { label: "New in", title: "New in", eyebrow: "Just arrived",
      intro: "The latest additions to the Forever line. Fresh signatures, made to be noticed." },
    bestsellers: { label: "Bestsellers", title: "Bestsellers", eyebrow: "Loved by you",
      intro: "Our most-loved jewellery, chosen time and again by the Romière community." },
    necklaces: { label: "Necklaces", title: "Necklaces", eyebrow: "The collection",
      intro: "Delicate chains, luminous pearls and zirconia that catch the light with every movement." },
    bracelets: { label: "Bracelets", title: "Bracelets & Handjewels", eyebrow: "The collection",
      intro: "Fine chains that frame the wrist and hand with a quiet, unmistakable sparkle." },
    earrings: { label: "Earrings", title: "Earrings", eyebrow: "The collection",
      intro: "From freshwater pearl studs to radiant florals: the finishing touch to every look." },
    sets: { label: "Sets", title: "Sets", eyebrow: "Thoughtfully paired",
      intro: "Matching pieces, made to be worn together. The perfect gift, for someone else or yourself." },
  };
  const CATEGORY_ORDER = ["all", "new-in", "bestsellers", "necklaces", "bracelets", "earrings", "sets"];

  /* ---------- Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (cents) => new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(cents / 100);
  const fold = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const params = new URLSearchParams(location.search);
  const bySlug = (slug) => CATALOG.find((p) => p.slug === slug);
  const byId = (id) => CATALOG.find((p) => p.id === id);
  const productUrl = (p) => `product.html?p=${encodeURIComponent(p.slug)}`;
  const imgPath = (img, size) => `assets/img/products/${img.base}-${size}.webp`;
  const srcset = (img) => `${imgPath(img, 600)} 600w, ${imgPath(img, 1200)} 1200w`;
  const page = document.body.dataset.page || "";

  const ICONS = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>',
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18M3 12h12M3 17h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
    star: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M5 0l1.2 3.8L10 5 6.2 6.2 5 10 3.8 6.2 0 5l3.8-1.2z" fill="currentColor"/></svg>',
    gift: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="12" width="22" height="15"/><path d="M3 8h26v4H3zM16 8v19M16 8c-2-4-7-5-7-2s4 2 7 2c3 0 7 1 7-2s-5-2-7 2"/></svg>',
    truck: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 8h16v14H3zM19 13h6l4 5v4H19z"/><circle cx="9" cy="24" r="2.5"/><circle cx="24" cy="24" r="2.5"/></svg>',
    shield: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3l11 4v8c0 7-5 12-11 14C10 27 5 22 5 15V7z"/><path d="M11 16l3.5 3.5L21 13"/></svg>',
    clock: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="12"/><path d="M16 9v7l5 3"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 1.8A3.2 3.2 0 0 0 3.8 7v10A3.2 3.2 0 0 0 7 20.2h10a3.2 3.2 0 0 0 3.2-3.2V7A3.2 3.2 0 0 0 17 3.8zm5 3.7a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 1.8a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4zm5.3-3.7a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z"/></svg>',
  };

  /* ---------- Shared chrome ---------- */
  const ANNOUNCEMENTS = [
    "Complimentary shipping from €\u00a060 · NL, BE & DE",
    "Signature gift box included with every order",
    "Order before 23:00, shipped the next day",
    "180-day quality guarantee",
  ];

  function renderMasthead() {
    const navCurrent = (key) => (page === key ? ' aria-current="page"' : "");
    const html = `
      <a class="skip-link" href="#main">Naar de inhoud</a>
      <div class="masthead" data-masthead>
        <div class="announcement" role="region" aria-label="Service">
          ${ANNOUNCEMENTS.map((a, i) => `<p class="announcement__item${i === 0 ? " is-active" : ""}">${esc(a)}</p>`).join("")}
        </div>
        <header class="site-header">
          <div class="container header-inner">
            <div class="header-left">
              <button class="icon-btn menu-toggle" type="button" aria-label="Open menu" data-open-menu>${ICONS.menu}</button>
              <nav class="main-nav" aria-label="Hoofdmenu">
                <ul>
                  <li class="has-mega">
                    <a class="nav-link" href="shop.html"${navCurrent("shop")}>Shop</a>
                    <div class="mega">
                      <div class="container mega__inner">
                        <div>
                          <h4>Jewellery</h4>
                          <ul>
                            <li><a href="shop.html?c=necklaces">Necklaces</a></li>
                            <li><a href="shop.html?c=bracelets">Bracelets &amp; Handjewels</a></li>
                            <li><a href="shop.html?c=earrings">Earrings</a></li>
                            <li><a href="shop.html?c=sets">Sets</a></li>
                          </ul>
                        </div>
                        <div>
                          <h4>Discover</h4>
                          <ul>
                            <li><a href="shop.html?c=new-in">New in</a></li>
                            <li><a href="shop.html?c=bestsellers">Bestsellers</a></li>
                            <li><a href="shop.html">The Forever line</a></li>
                            <li><a href="shop.html?c=sets">Gifts</a></li>
                          </ul>
                        </div>
                        <a class="mega__feature" href="story.html">
                          <img src="assets/img/editorial/necklace-reveal-1200.webp" alt="" loading="lazy">
                          <span>The Romière Story</span>
                        </a>
                      </div>
                    </div>
                  </li>
                  <li><a class="nav-link" href="shop.html?c=new-in">New in</a></li>
                  <li class="hide-lg"><a class="nav-link" href="shop.html?c=bestsellers">Bestsellers</a></li>
                  <li><a class="nav-link" href="story.html"${navCurrent("story")}>Our story</a></li>
                </ul>
              </nav>
            </div>
            <a class="header-logo" href="index.html" aria-label="Romière — home">
              <img class="logo-dark" src="assets/img/brand/romiere-logo.png" alt="Romière" width="1000" height="341">
              <img class="logo-light" src="assets/img/brand/romiere-logo-white.png" alt="" width="1000" height="341" aria-hidden="true">
            </a>
            <div class="header-tools">
              <a class="nav-link nav-text" href="contact.html"${navCurrent("contact")}>Contact</a>
              <button class="icon-btn" type="button" data-open-search aria-label="Zoeken">${ICONS.search}<span class="nav-text hide-lg">Search</span></button>
              <button class="icon-btn" type="button" data-open-bag aria-label="Winkeltas">${ICONS.bag}<span class="bag-count" data-bag-count>0</span></button>
            </div>
          </div>
        </header>
      </div>

      <div class="scrim" data-scrim></div>

      <aside class="mobile-menu" data-menu aria-label="Menu" aria-hidden="true">
        <div class="mobile-menu__top">
          <img src="assets/img/brand/romiere-logo.png" alt="Romière">
          <button class="close-btn" type="button" data-close aria-label="Sluit menu">${ICONS.close}</button>
        </div>
        <nav>
          <a href="shop.html">Shop all</a>
          <a href="shop.html?c=new-in">New in</a>
          <a href="shop.html?c=necklaces">Necklaces</a>
          <a href="shop.html?c=bracelets">Bracelets</a>
          <a href="shop.html?c=earrings">Earrings</a>
          <a href="shop.html?c=sets">Sets</a>
        </nav>
        <div class="mobile-menu__sub">
          <a href="shop.html?c=bestsellers">Bestsellers</a>
          <a href="story.html">Our story</a>
          <a href="contact.html">Contact</a>
          <a href="${CONFIG.instagram}" target="_blank" rel="noopener">Instagram</a>
        </div>
        <img class="mobile-menu__sign" src="assets/img/brand/forever-guided-signature.png" alt="Forever Guided, Forever Romière.">
      </aside>

      <div class="search-panel" data-search aria-hidden="true" role="dialog" aria-label="Zoeken">
        <div class="container">
          <div class="search-panel__top">
            <label class="search-field">
              ${ICONS.search}
              <span class="visually-hidden">Zoek een sieraad</span>
              <input type="search" placeholder="Search the collection" autocomplete="off" data-search-input>
            </label>
            <button class="close-btn" type="button" data-close aria-label="Sluit zoeken">${ICONS.close}</button>
          </div>
          <div class="search-suggest">
            <span>Popular:</span>
            ${["Pearl", "Florea", "Handjewel", "Clover", "Éclat"].map((s) => `<button type="button" data-suggest="${esc(s)}">${esc(s)}</button>`).join("")}
          </div>
          <div data-search-results></div>
        </div>
      </div>

      <aside class="drawer" data-bag aria-hidden="true" role="dialog" aria-label="Winkeltas">
        <div class="drawer__head">
          <h2>Your bag <small data-bag-items></small></h2>
          <button class="close-btn" type="button" data-close aria-label="Sluit winkeltas">${ICONS.close}</button>
        </div>
        <div class="shipping-meter" data-shipping-meter></div>
        <div class="drawer__body" data-bag-body></div>
        <div class="drawer__foot" data-bag-foot></div>
      </aside>

      <div class="toast" role="status" aria-live="polite" data-toast></div>`;
    document.body.insertAdjacentHTML("afterbegin", html);
  }

  function renderFooter() {
    const html = `
      <section class="newsletter" aria-labelledby="newsletter-title">
        <div class="container--narrow">
          <p class="eyebrow eyebrow--center">Join the Romière community</p>
          <h2 class="title-lg" id="newsletter-title">A little sparkle <em>in your inbox</em></h2>
          <p>Ontvang als eerste nieuwe collecties, stylingtips en exclusieve aanbiedingen.</p>
          <form class="newsletter-form" data-newsletter novalidate>
            <label class="visually-hidden" for="nl-email">E-mailadres</label>
            <input id="nl-email" type="email" name="email" placeholder="E-mailadres" required autocomplete="email">
            <button type="submit">Inschrijven</button>
          </form>
          <small>Je kunt je op ieder moment weer uitschrijven.</small>
        </div>
      </section>
      <footer class="site-footer">
        <div class="container">
          <div class="footer-top">
            <div class="footer-brand">
              <img src="assets/img/brand/romiere-logo-white.png" alt="Romière" loading="lazy">
              <p>Created for those who don't follow trends, they set them. Jewellery for confidence, elegance and individuality.</p>
              <div class="footer-social">
                <a href="${CONFIG.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICONS.instagram}</a>
                <a href="${CONFIG.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${ICONS.tiktok}</a>
              </div>
            </div>
            <div>
              <h4>Shop</h4>
              <ul>
                <li><a href="shop.html?c=new-in">New in</a></li>
                <li><a href="shop.html?c=necklaces">Necklaces</a></li>
                <li><a href="shop.html?c=bracelets">Bracelets</a></li>
                <li><a href="shop.html?c=earrings">Earrings</a></li>
                <li><a href="shop.html?c=sets">Sets</a></li>
              </ul>
            </div>
            <div>
              <h4>Romière</h4>
              <ul>
                <li><a href="story.html">The Romière story</a></li>
                <li><a href="story.html#craftsmanship">Craftsmanship &amp; materials</a></li>
                <li><a href="story.html#signature-edit">Find your signature piece</a></li>
                <li><a href="${CONFIG.instagram}" target="_blank" rel="noopener">@romiere.official</a></li>
              </ul>
            </div>
            <div>
              <h4>Customer care</h4>
              <ul>
                <li><a href="contact.html">Contact</a></li>
                <li><a href="contact.html#faq">FAQ</a></li>
                <li><a href="contact.html#shipping">Shipping &amp; delivery</a></li>
                <li><a href="contact.html#returns">Returns</a></li>
                <li><a href="mailto:${CONFIG.email}">${CONFIG.email}</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-sign">
            <img src="assets/img/brand/forever-guided-signature-white.png" alt="Forever Guided, Forever Romière." loading="lazy">
          </div>
          <div class="footer-bottom">
            <span>© ${new Date().getFullYear()} Romière. All rights reserved.</span>
            <div class="payments" aria-label="Betaalmethoden"><span>iDEAL</span><span>Bancontact</span><span>Klarna</span><span>Secure checkout</span></div>
          </div>
        </div>
      </footer>`;
    document.body.insertAdjacentHTML("beforeend", html);
  }

  /* ---------- Overlay management ---------- */
  let openPanel = null;
  function openOverlay(el) {
    if (openPanel && openPanel !== el) closeOverlay(true);
    openPanel = el;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    $("[data-scrim]").classList.add("is-visible");
    document.body.classList.add("is-locked");
    const focusable = el.querySelector("input, button, a");
    setTimeout(() => focusable && focusable.focus({ preventScroll: true }), 80);
  }
  function closeOverlay(keepScrim) {
    if (!openPanel) return;
    openPanel.classList.remove("is-open");
    openPanel.setAttribute("aria-hidden", "true");
    openPanel = null;
    if (!keepScrim) {
      $("[data-scrim]").classList.remove("is-visible");
      document.body.classList.remove("is-locked");
    }
  }

  function bindChrome() {
    const masthead = $("[data-masthead]");
    const hasHero = document.body.classList.contains("has-hero");
    let hovering = false;
    const onScroll = () => {
      const y = window.scrollY;
      masthead.classList.toggle("is-scrolled", y > 24);
      const solid = !hasHero || hovering || y > window.innerHeight * 0.75 - 120;
      masthead.classList.toggle("is-solid", solid);
    };
    masthead.addEventListener("mouseenter", () => { hovering = true; onScroll(); });
    masthead.addEventListener("mouseleave", () => { hovering = false; onScroll(); });
    masthead.addEventListener("focusin", () => { hovering = true; onScroll(); });
    masthead.addEventListener("focusout", () => { hovering = false; onScroll(); });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Rotating announcements
    const items = $$(".announcement__item");
    let idx = 0;
    if (items.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInterval(() => {
        items[idx].classList.remove("is-active");
        idx = (idx + 1) % items.length;
        items[idx].classList.add("is-active");
      }, 4500);
    }

    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-open-menu],[data-open-search],[data-open-bag],[data-close],[data-scrim]");
      if (!t) return;
      if (t.hasAttribute("data-open-menu")) openOverlay($("[data-menu]"));
      else if (t.hasAttribute("data-open-search")) openOverlay($("[data-search]"));
      else if (t.hasAttribute("data-open-bag")) { renderBag(); openOverlay($("[data-bag]")); }
      else closeOverlay();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeOverlay(); closeLightbox(); }
    });

    // Search
    const input = $("[data-search-input]");
    const results = $("[data-search-results]");
    const runSearch = () => {
      const q = fold(input.value.trim());
      if (!q) { results.innerHTML = ""; return; }
      const hits = CATALOG.filter((p) => fold([p.name, p.categories.join(" "), p.tagline, p.details.join(" ")].join(" ")).includes(q));
      results.innerHTML = hits.length
        ? `<div class="search-results">${hits.map((p) => cardHTML(p, { compact: true })).join("")}</div>`
        : `<p class="search-empty">Geen sieraden gevonden voor “${esc(input.value)}”.</p>`;
    };
    input.addEventListener("input", runSearch);
    $$("[data-suggest]").forEach((b) => b.addEventListener("click", () => { input.value = b.dataset.suggest; runSearch(); input.focus(); }));

    // Newsletter (front-end only until connected to a mailing tool)
    $$("[data-newsletter]").forEach((form) => form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) { form.email.focus(); toast("Vul een geldig e-mailadres in."); return; }
      form.outerHTML = `<p class="newsletter__done">Welcome to the Romière community.</p>`;
    }));
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const el = $("[data-toast]");
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 3200);
  }

  /* ---------- Bag ---------- */
  const readBag = () => {
    try { return JSON.parse(localStorage.getItem(BAG_KEY)) || []; } catch { return []; }
  };
  const writeBag = (items) => {
    try { localStorage.setItem(BAG_KEY, JSON.stringify(items)); } catch { /* storage unavailable */ }
    updateBagCount(items);
  };
  let bag = readBag().filter((i) => byId(i.id));

  function updateBagCount(items = bag, bump = false) {
    const count = items.reduce((n, i) => n + i.qty, 0);
    $$("[data-bag-count]").forEach((el) => {
      el.textContent = count;
      if (bump) { el.classList.add("is-bump"); setTimeout(() => el.classList.remove("is-bump"), 400); }
    });
  }

  function addToBag(product, options = {}, qty = 1) {
    if (!product.inStock) return;
    const key = `${product.id}|${Object.entries(options).map(([k, v]) => `${k}:${v}`).join(",")}`;
    const line = bag.find((i) => i.key === key);
    if (line) line.qty = Math.min(line.qty + qty, 10);
    else bag.push({ key, id: product.id, options, qty });
    writeBag(bag);
    updateBagCount(bag, true);
    renderBag();
    openOverlay($("[data-bag]"));
  }

  function renderBag() {
    const body = $("[data-bag-body]");
    const foot = $("[data-bag-foot]");
    const meter = $("[data-shipping-meter]");
    const subtotal = bag.reduce((s, i) => s + byId(i.id).price * i.qty, 0);
    const count = bag.reduce((n, i) => n + i.qty, 0);
    $("[data-bag-items]").textContent = count ? `(${count})` : "";

    const remaining = CONFIG.freeShippingFrom - subtotal;
    const pct = Math.min(subtotal / CONFIG.freeShippingFrom, 1);
    meter.innerHTML = `${remaining > 0
      ? `Nog <strong>${money(remaining)}</strong> tot gratis verzending.`
      : `<strong>Gefeliciteerd</strong> — je bestelling wordt gratis verzonden.`}
      <div class="shipping-meter__bar"><span style="transform:scaleX(${pct})"></span></div>`;
    meter.hidden = !bag.length;

    if (!bag.length) {
      body.innerHTML = `<div class="drawer__empty">
          <div class="ornament">${ICONS.star}</div>
          <p>Je winkeltas is nog leeg.</p>
          <a class="btn" href="shop.html">Discover the collection</a>
        </div>`;
      foot.innerHTML = "";
      return;
    }
    body.innerHTML = bag.map((i) => {
      const p = byId(i.id);
      const img = p.images[0];
      const opts = Object.entries(i.options).map(([k, v]) => `${esc(k)}: ${esc(v)}`).join(" · ");
      return `<div class="line-item" data-key="${esc(i.key)}">
          <a class="line-item__media" href="${productUrl(p)}"><img src="${imgPath(img, 600)}" alt="${esc(p.name)}" loading="lazy"></a>
          <div>
            <h3><a href="${productUrl(p)}">${esc(p.name)}</a></h3>
            <p class="line-item__meta">${opts || "One size"}</p>
            <div class="qty" aria-label="Aantal">
              <button type="button" data-qty="-1" aria-label="Minder">−</button>
              <output>${i.qty}</output>
              <button type="button" data-qty="1" aria-label="Meer">+</button>
            </div>
          </div>
          <div class="line-item__price">
            ${money(p.price * i.qty)}
            <div><button class="line-item__remove" type="button" data-remove>Remove</button></div>
          </div>
        </div>`;
    }).join("");
    foot.innerHTML = `
      <div class="drawer__row"><span>Subtotal</span><span class="total">${money(subtotal)}</span></div>
      <p class="drawer__note">Inclusief btw. Signature gift box inbegrepen. Verzendkosten worden berekend bij het afrekenen.</p>
      <button class="btn btn--block" type="button" data-checkout>Checkout</button>
      <p class="drawer__trust">iDEAL · Bancontact · Klarna</p>`;
  }

  function bindBag() {
    const drawer = $("[data-bag]");
    drawer.addEventListener("click", (e) => {
      const row = e.target.closest("[data-key]");
      if (e.target.closest("[data-checkout]")) {
        if (CONFIG.checkoutUrl) location.href = CONFIG.checkoutUrl;
        else toast("De checkout is nog niet gekoppeld in deze preview.");
        return;
      }
      if (!row) return;
      const line = bag.find((i) => i.key === row.dataset.key);
      if (!line) return;
      const q = e.target.closest("[data-qty]");
      if (q) line.qty = Math.max(0, Math.min(10, line.qty + Number(q.dataset.qty)));
      if (e.target.closest("[data-remove]")) line.qty = 0;
      bag = bag.filter((i) => i.qty > 0);
      writeBag(bag);
      renderBag();
    });
    window.addEventListener("storage", (e) => {
      if (e.key === BAG_KEY) { bag = readBag(); updateBagCount(); renderBag(); }
    });
    updateBagCount();
  }

  /* ---------- Product cards ---------- */
  function swatches(p) {
    const finish = p.options.find((o) => o.name === "Finish");
    if (!finish) return "";
    return `<div class="card__swatches" aria-label="Verkrijgbaar in ${finish.values.map(esc).join(" en ")}">
      ${finish.values.map((v) => `<span class="swatch-dot swatch-dot--${fold(v)}" title="${esc(v)}"></span>`).join("")}
    </div>`;
  }

  function cardHTML(p, { compact = false, eager = false } = {}) {
    const [a, b] = p.images;
    const loading = eager ? "eager" : "lazy";
    const sizes = compact ? "200px" : "(max-width: 700px) 50vw, (max-width: 1180px) 33vw, 25vw";
    const badge = !p.inStock
      ? `<span class="card__badge card__badge--soldout">Sold out</span>`
      : p.categories.includes("new-in") && !compact ? `<span class="card__badge">New in</span>` : "";
    let quick = "";
    if (p.inStock && !compact) {
      const multi = p.options.length > 1;
      const finish = p.options.length === 1 ? p.options[0] : null;
      if (finish) {
        quick = `<div class="card__quick"><span class="card__quick-label">Add</span>${finish.values
          .map((v, i) => `${i ? '<span class="card__quick-sep"></span>' : ""}<button type="button" data-quick="${p.id}" data-option="${esc(finish.name)}" data-value="${esc(v)}">${esc(v)}</button>`)
          .join("")}</div>`;
      } else if (multi) {
        quick = `<a class="card__quick" href="${productUrl(p)}">Choose your finish</a>`;
      } else {
        quick = `<button class="card__quick" type="button" data-quick="${p.id}">Add to bag</button>`;
      }
    }
    return `<article class="card">
      <div class="card__frame">
        <a class="card__media" href="${productUrl(p)}" aria-label="${esc(p.name)}">
          ${badge}
          <img class="fit-${a.fit}" src="${imgPath(a, 600)}" srcset="${srcset(a)}" sizes="${sizes}" alt="${esc(p.name)}" loading="${loading}" width="${a.w}" height="${a.h}">
          ${b ? `<img class="card__alt fit-${b.fit}" src="${imgPath(b, 600)}" srcset="${srcset(b)}" sizes="${sizes}" alt="" loading="lazy" width="${b.w}" height="${b.h}">` : ""}
        </a>
        ${quick}
      </div>
      <div class="card__body">
        <h3 class="card__title"><a href="${productUrl(p)}">${esc(p.name)}</a></h3>
        <p class="card__price">${p.price ? money(p.price) : "&nbsp;"}</p>
        ${compact ? "" : swatches(p)}
      </div>
    </article>`;
  }

  function bindQuickAdd(root = document) {
    root.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-quick]");
      if (!btn) return;
      e.preventDefault();
      const p = byId(Number(btn.dataset.quick));
      const opts = btn.dataset.option ? { [btn.dataset.option]: btn.dataset.value } : {};
      addToBag(p, opts);
    });
  }

  function listFor(key) {
    const items = CATALOG.slice();
    if (key === "bestsellers") return items.filter((p) => p.bestseller).sort((a, b) => a.bestseller - b.bestseller);
    if (key === "all" || !key) return items;
    return items.filter((p) => p.categories.includes(key));
  }

  /* ---------- Rails ---------- */
  function bindRail(wrap) {
    const rail = $(".rail", wrap);
    const bar = $(".rail-progress span", wrap);
    const step = () => (rail.firstElementChild ? rail.firstElementChild.getBoundingClientRect().width + 28 : 300);
    $$("[data-rail]", wrap).forEach((b) => b.addEventListener("click", () => rail.scrollBy({ left: Number(b.dataset.rail) * step() })));
    const update = () => {
      if (!bar) return;
      const max = rail.scrollWidth - rail.clientWidth;
      const visible = rail.clientWidth / rail.scrollWidth;
      bar.style.width = `${visible * 100}%`;
      bar.style.transform = `translateX(${max > 0 ? (rail.scrollLeft / max) * ((1 - visible) / visible) * 100 : 0}%)`;
    };
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- Reveal on scroll ---------- */
  function bindReveal() {
    const els = $$(".reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("is-visible")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Pages ---------- */
  function initHome() {
    const best = $("[data-products='bestsellers']");
    if (best) {
      best.innerHTML = listFor("bestsellers").map((p, i) => cardHTML(p, { eager: i < 4 })).join("");
      bindRail(best.closest(".rail-wrap"));
    }
    const fresh = $("[data-products='new-in']");
    if (fresh) {
      fresh.innerHTML = listFor("new-in").filter((p) => p.inStock).slice(0, Number(fresh.dataset.limit) || 4)
        .map((p) => cardHTML(p)).join("");
    }
  }

  function initShop() {
    const grid = $("[data-shop-grid]");
    const chips = $("[data-chips]");
    const sortSel = $("[data-sort]");
    const countEl = $("[data-count]");
    let current = CATEGORIES[params.get("c")] ? params.get("c") : "all";

    chips.innerHTML = CATEGORY_ORDER.map((k) => `<button class="chip" type="button" data-cat="${k}" aria-pressed="${k === current}">${esc(CATEGORIES[k].label)}</button>`).join("");

    const render = () => {
      const meta = CATEGORIES[current];
      $("[data-shop-eyebrow]").textContent = meta.eyebrow;
      $("[data-shop-title]").textContent = meta.title;
      $("[data-shop-intro]").textContent = meta.intro;
      document.title = `${meta.title} — Romière`;
      $$(".chip", chips).forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.cat === current)));

      let items = listFor(current);
      const sort = sortSel.value;
      if (sort === "price-asc") items.sort((a, b) => (a.price ?? 1e9) - (b.price ?? 1e9));
      if (sort === "price-desc") items.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
      if (sort === "name") items.sort((a, b) => a.name.localeCompare(b.name, "nl"));
      if (sort === "featured") items.sort((a, b) => Number(b.inStock) - Number(a.inStock));
      countEl.textContent = `${items.length} ${items.length === 1 ? "piece" : "pieces"}`;

      if (!items.length) { grid.innerHTML = `<p class="shop-empty">Er zijn op dit moment geen sieraden in deze categorie.</p>`; return; }
      const cards = items.map((p, i) => cardHTML(p, { eager: i < 4 }));
      if (current === "all" && sort === "featured" && cards.length > 8) {
        cards.splice(6, 0, `<a class="grid-feature" href="story.html">
            <img src="assets/img/editorial/ritual-box-1200.webp" alt="" loading="lazy">
            <div class="grid-feature__text">
              <p class="eyebrow" style="color:var(--white)">The Romière Story</p>
              <p class="serif-quote">Wear it now.<br>Remember it forever.<br>Make it yours.</p>
              <span class="link link--light">Discover our story</span>
            </div>
          </a>`);
      }
      grid.innerHTML = cards.join("");
    };

    chips.addEventListener("click", (e) => {
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

  // Lightbox (product page)
  let lightboxImages = [];
  let lightboxIndex = 0;
  function openLightbox(images, index) {
    lightboxImages = images;
    lightboxIndex = index;
    const lb = $("[data-lightbox]");
    $("img", lb).src = imgPath(images[index], 1200);
    lb.classList.add("is-open");
    document.body.classList.add("is-locked");
  }
  function closeLightbox() {
    const lb = $("[data-lightbox]");
    if (!lb || !lb.classList.contains("is-open")) return;
    lb.classList.remove("is-open");
    if (!openPanel) document.body.classList.remove("is-locked");
  }
  function stepLightbox(d) {
    lightboxIndex = (lightboxIndex + d + lightboxImages.length) % lightboxImages.length;
    $("[data-lightbox] img").src = imgPath(lightboxImages[lightboxIndex], 1200);
  }

  function detailHTML(d) {
    const m = d.match(/^([A-Za-zÀ-ÿ -]{2,22}):\s*(.+)$/);
    return m ? `<li><strong>${esc(m[1])}:</strong> ${esc(m[2])}</li>` : `<li>${esc(d)}</li>`;
  }

  function initProduct() {
    const root = $("[data-pdp]");
    const p = bySlug(params.get("p"));
    if (!p) {
      root.innerHTML = `<div class="container" style="text-align:center;padding:120px 0">
          <p class="eyebrow eyebrow--center">Not found</p>
          <h1 class="title-lg">Dit sieraad kunnen we niet vinden</h1>
          <p class="lead" style="margin:20px 0 36px">Misschien is het verplaatst of niet langer beschikbaar.</p>
          <a class="btn" href="shop.html">Discover the collection</a>
        </div>`;
      return;
    }
    document.title = `${p.name} — Romière`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", (p.tagline || p.intro[0] || "").slice(0, 155));

    const primaryCat = ["sets", "necklaces", "bracelets", "earrings"].find((c) => p.categories.includes(c));
    const state = {};
    p.options.forEach((o) => { state[o.name] = o.values[0]; });

    const thumbs = p.images.map((img, i) => `<button type="button" data-thumb="${i}" aria-label="Afbeelding ${i + 1}" aria-current="${i === 0}">
        <img class="fit-${img.fit}" src="${imgPath(img, 600)}" alt="" loading="lazy"></button>`).join("");
    const slides = p.images.map((img, i) => `<div class="gallery-pdp__slide" data-slide="${i}">
        <img class="fit-${img.fit}" src="${imgPath(img, 1200)}" srcset="${srcset(img)}" sizes="(max-width: 960px) 100vw, 50vw" alt="${esc(p.name)}${i ? ` — afbeelding ${i + 1}` : ""}" loading="${i < 2 ? "eager" : "lazy"}" width="${img.w}" height="${img.h}">
      </div>`).join("");
    const options = p.options.map((o) => `<div class="option" role="radiogroup" aria-label="${esc(o.name)}">
        <div class="option__label"><span>${esc(o.name)}</span><span data-option-value="${esc(o.name)}">${esc(state[o.name])}</span></div>
        <div class="option__values">${o.values.map((v) => `<button type="button" class="finish" role="radio" data-opt="${esc(o.name)}" data-val="${esc(v)}" aria-checked="${v === state[o.name]}">
            <span class="swatch-dot swatch-dot--${fold(v)}"></span>${esc(v)}</button>`).join("")}</div>
      </div>`).join("");

    const perks = [
      [ICONS.truck, "Gratis verzending vanaf €\u00a060 (NL, BE & DE)"],
      [ICONS.clock, "Voor 23:00 besteld, morgen verzonden"],
      [ICONS.gift, "Geleverd in een signature Romière gift box"],
      [ICONS.shield, "180 dagen kwaliteitsgarantie"],
    ];

    root.innerHTML = `
      <section class="pdp">
        <div class="container">
          <nav class="breadcrumbs" aria-label="Kruimelpad">
            <a href="index.html">Home</a><span aria-hidden="true">/</span>
            ${primaryCat ? `<a href="shop.html?c=${primaryCat}">${esc(CATEGORIES[primaryCat].label)}</a><span aria-hidden="true">/</span>` : ""}
            <span>${esc(p.name)}</span>
          </nav>
          <div class="pdp__grid">
            <div>
              <div class="gallery-pdp">
                <div class="gallery-pdp__thumbs">${thumbs}</div>
                <div class="gallery-pdp__main" data-gallery>${slides}</div>
              </div>
              <div class="gallery-pdp__dots" aria-hidden="true">${p.images.map((_, i) => `<span class="${i ? "" : "is-active"}"></span>`).join("")}</div>
            </div>
            <div class="pdp__info">
              <p class="eyebrow eyebrow--rule">Forever line${primaryCat ? ` · ${esc(CATEGORIES[primaryCat].label)}` : ""}</p>
              <h1 class="pdp__title">${esc(p.name)}</h1>
              <p class="pdp__price">${p.price ? money(p.price) : ""}${p.price ? "<small>incl. btw</small>" : ""}</p>
              ${p.tagline ? `<p class="pdp__tagline">${esc(p.tagline)}</p>` : ""}
              <div class="pdp__divider"></div>
              ${p.inStock ? options : ""}
              ${p.inStock
                ? `<div class="pdp__buy">
                    <div class="qty" aria-label="Aantal">
                      <button type="button" data-step="-1" aria-label="Minder">−</button>
                      <output data-qty-out>1</output>
                      <button type="button" data-step="1" aria-label="Meer">+</button>
                    </div>
                    <button class="btn" type="button" data-add>Add to bag — ${money(p.price)}</button>
                  </div>`
                : `<button class="btn btn--block" type="button" disabled>Sold out</button>
                   <p class="pdp__soldout">Dit sieraad is tijdelijk uitverkocht. Volg <a class="text-link" href="${CONFIG.instagram}" target="_blank" rel="noopener">@romiere.official</a> om als eerste te horen wanneer het terug is.</p>`}
              <ul class="pdp__perks">${perks.map(([icon, t]) => `<li>${icon}<span>${esc(t)}</span></li>`).join("")}</ul>
              <div class="accordion">
                <details open>
                  <summary>Description</summary>
                  <div class="accordion__body">${p.intro.map((t) => `<p>${esc(t)}</p>`).join("")}</div>
                </details>
                ${p.details.length ? `<details>
                  <summary>Details &amp; materials</summary>
                  <div class="accordion__body"><ul>${p.details.map(detailHTML).join("")}</ul></div>
                </details>` : ""}
                <details>
                  <summary>Shipping &amp; returns</summary>
                  <div class="accordion__body">
                    <p>Bestellingen die voor 23:00 zijn geplaatst, worden de volgende werkdag verzonden. Gratis verzending vanaf €&nbsp;60 naar Nederland, België en Duitsland.</p>
                    <p>Retourneren kan binnen 14 dagen na ontvangst, mits ongedragen, onbeschadigd en in de originele verzegelde verpakking. <a class="text-link" href="contact.html#returns">Lees ons retourbeleid</a></p>
                  </div>
                </details>
                <details>
                  <summary>Care</summary>
                  <div class="accordion__body">
                    <p>Bewaar je sieraad in de signature Romière box wanneer je het niet draagt, en poets het voorzichtig met een zachte, droge doek. Fijne kettingen en handjewels zijn delicaat: draag ze met zorg.</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>
      ${p.meaning ? `<section class="meaning">
        <div class="container">
          <p class="eyebrow eyebrow--center">The meaning</p>
          <div class="ornament" style="margin-bottom:32px">${ICONS.star}</div>
          <p class="serif-quote reveal">“${esc(p.meaning)}”</p>
          ${p.closing.length ? `<p class="meaning__closing">${esc(p.closing[0].replace(/[“”"]/g, ""))}</p>` : ""}
        </div>
      </section>` : ""}
      <section class="section">
        <div class="container">
          <div class="section-head section-head--split">
            <div>
              <p class="eyebrow">Complete the look</p>
              <h2 class="title-lg">You may <em>also love</em></h2>
            </div>
            <a class="link" href="shop.html${primaryCat ? `?c=${primaryCat}` : ""}">View all</a>
          </div>
          <div class="product-grid" data-related></div>
        </div>
      </section>
      <div class="lightbox" data-lightbox role="dialog" aria-label="Afbeelding vergroot">
        <button class="close-btn" type="button" data-lb-close aria-label="Sluiten">${ICONS.close}</button>
        <img src="" alt="${esc(p.name)}">
        <div class="lightbox__nav">
          <button class="rail-btn" type="button" data-lb="-1" aria-label="Vorige">${ICONS.prev}</button>
          <button class="rail-btn" type="button" data-lb="1" aria-label="Volgende">${ICONS.next}</button>
        </div>
      </div>`;

    // Related products: same category first, then the rest of the Forever line
    const related = CATALOG.filter((x) => x.id !== p.id && x.inStock)
      .map((x) => ({ x, score: x.categories.filter((c) => p.categories.includes(c) && c !== "forever-line").length * 2 + (x.bestseller ? 1 : 0) }))
      .sort((a, b) => b.score - a.score).slice(0, 4).map(({ x }) => x);
    $("[data-related]").innerHTML = related.map((x) => cardHTML(x)).join("");

    // Gallery
    const gallery = $("[data-gallery]");
    const thumbBtns = $$("[data-thumb]");
    const dots = $$(".gallery-pdp__dots span");
    const setActive = (i) => {
      thumbBtns.forEach((b, k) => b.setAttribute("aria-current", String(k === i)));
      dots.forEach((d, k) => d.classList.toggle("is-active", k === i));
    };
    thumbBtns.forEach((b) => b.addEventListener("click", () => {
      const i = Number(b.dataset.thumb);
      const slide = $(`[data-slide="${i}"]`, gallery);
      setActive(i);
      if (getComputedStyle(gallery).overflowX === "auto") gallery.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
      else window.scrollTo({ top: slide.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" });
    }));
    gallery.addEventListener("scroll", () => {
      setActive(Math.round(gallery.scrollLeft / gallery.clientWidth));
    }, { passive: true });
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting && getComputedStyle(gallery).overflowX !== "auto") setActive(Number(en.target.dataset.slide));
      }), { threshold: 0.6 });
      $$("[data-slide]", gallery).forEach((s) => io.observe(s));
    }
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

    // Options, quantity, add to bag
    let qty = 1;
    root.addEventListener("click", (e) => {
      const opt = e.target.closest("[data-opt]");
      if (opt) {
        state[opt.dataset.opt] = opt.dataset.val;
        $$(`[data-opt="${CSS.escape(opt.dataset.opt)}"]`, root).forEach((b) => b.setAttribute("aria-checked", String(b === opt)));
        $(`[data-option-value="${CSS.escape(opt.dataset.opt)}"]`, root).textContent = opt.dataset.val;
      }
      const step = e.target.closest("[data-step]");
      if (step) {
        qty = Math.max(1, Math.min(10, qty + Number(step.dataset.step)));
        $("[data-qty-out]", root).textContent = qty;
        $("[data-add]", root).textContent = `Add to bag — ${money(p.price * qty)}`;
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
  renderMasthead();
  renderFooter();
  bindChrome();
  bindBag();
  bindQuickAdd();
  renderBag();
  if (page === "home") initHome();
  if (page === "shop") initShop();
  if (page === "product") initProduct();
  if (page === "contact") initContact();
  bindReveal();
})();
