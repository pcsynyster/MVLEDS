/* Aplicação principal MV LEDs */

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  /* Preferências de movimento e ponteiro */
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduceMotion = () => motionQuery.matches;
  const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";

  /* Regras de preço por par (unidade avulsa x par com desconto) */
  const PAIR_RULES = {
    "led-projetor": { unitVariant: "unidade", pairVariant: "par", pairPrice: 280 },
  };

  const CART_GOAL = Object.assign(
    { threshold: 0, reward: "" },
    typeof CONFIG !== "undefined" ? CONFIG.CART_GOAL : null
  );

  /* Itens rápidos de combo (Upsell) */
  const quickAddItems = [
    { id: "pingo-t10-silicone", name: "Par Pingo T10 Silicone (Farolete)", price: "Consultar via WhatsApp" },
    { id: "led-placa-t10", name: "Par LED Luz de Placa", price: "Consultar via WhatsApp" },
    { id: "kit-interno-teto", name: "Kit LED Cortesia / Teto", price: "Consultar via WhatsApp" },
  ];

  const KELVIN_DATA = {
    3000: {
      hud: "3000K · AMARELO",
      title: "3000K — Amarelo Ouro (Penetração Máxima)",
      desc: "Projetada para quebrar o reflexo de gotículas de água e partículas em suspensão. É a opção técnica definitiva para chuva pesada, neblina e asfalto molhado.",
      app: "Faróis de neblina/milha e veículos de viagem/estrada frequente.",
      contrast: "Penetração superior em mau tempo, sem rebater a luz contra os olhos.",
    },
    4300: {
      hud: "4300K · BRANCO QUENTE",
      title: "4300K — Branco Quente (Padrão Original de Fábrica)",
      desc: "A mesma tonalidade dos faróis de xênon e LED originais de montadora. Proporciona iluminação com excelente índice de reprodução de cor, discreta e sem chamar atenção em fiscalizações.",
      app: "Farol principal de quem busca máxima discrição com alta eficiência.",
      contrast: "Excelente leitura de relevo e buracos em asfalto escuro.",
    },
    6000: {
      hud: "6000K · BRANCO PURO",
      title: "6000K — Branco Puro (O Mais Procurado)",
      desc: "É a escolha mais popular e moderna. Oferece visual esportivo de alta definição, realçando placas reflexivas e faixas de trânsito em vias pavimentadas sem esforço visual.",
      app: "Uso urbano, rodovias bem pavimentadas e estética esportiva moderna.",
      contrast: "Alto realce de placas de sinalização e olhos de gato.",
    },
  };

  const ICONS = {
    plus: '<svg class="i-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    check: '<svg class="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M17.6 6.32A8.86 8.86 0 0 0 12 4.1a8.94 8.94 0 0 0-7.75 13.4L3 21l3.6-1.2a8.9 8.9 0 0 0 5.4 1.82h.02A8.94 8.94 0 0 0 21 12.75a8.87 8.87 0 0 0-3.4-6.43zm-5.6 13.7a7.4 7.4 0 0 1-3.78-1.04l-.27-.16-2.8.94.75-2.73-.18-.28a7.42 7.42 0 1 1 13.8-3.9 7.43 7.43 0 0 1-7.52 7.17zm4.07-5.56c-.22-.11-1.32-.65-1.53-.73-.2-.08-.35-.11-.5.11-.15.22-.57.73-.7.88-.13.15-.26.16-.48.05a6.1 6.1 0 0 1-1.8-1.11 6.7 6.7 0 0 1-1.24-1.55c-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.08-.15.04-.28-.02-.39-.06-.11-.5-1.2-.68-1.65-.18-.43-.36-.37-.5-.38h-.43a.83.83 0 0 0-.6.28 2.5 2.5 0 0 0-.79 1.87c0 1.1.8 2.16.91 2.31.11.15 1.57 2.4 3.8 3.36.53.23.94.37 1.27.47.53.17 1.01.15 1.4.09.43-.06 1.32-.54 1.5-1.06.19-.52.19-.96.13-1.06-.06-.1-.2-.15-.42-.26z"/></svg>',
  };

  const state = {
    activeCategory: "todos",
    cart: [], // { lineId, productId, variantId, qty, isCustom, customName }
    lastAddedLine: null,
    justUpsold: null,
    goalUnlocked: false,
  };

  const $ = (id) => document.getElementById(id);

  const els = {
    header: $("siteHeader"),
    navToggle: $("navToggle"),
    mainNav: $("mainNav"),
    filters: $("filters"),
    grid: $("productGrid"),
    cartToggle: $("cartToggle"),
    cartCount: $("cartCount"),
    overlay: $("overlay"),
    drawer: $("cartDrawer"),
    cartCloseBtn: $("cartCloseBtn"),
    cartGoal: $("cartGoal"),
    cartGoalText: $("cartGoalText"),
    cartGoalTrack: $("cartGoalTrack"),
    cartGoalFill: $("cartGoalFill"),
    cartBody: $("cartBody"),
    cartFooter: $("cartFooter"),
    cartUpsell: $("cartUpsell"),
    upsellList: $("upsellList"),
    modal: $("productModal"),
    modalPanel: $("modalPanel"),
    modalCloseBtn: $("modalCloseBtn"),
    modalImg: $("modalImg"),
    modalInfo: $("modalInfo"),
    toast: $("toast"),
    toastText: $("toastText"),
    toastAction: $("toastAction"),
    floatWaBtn: $("floatWaBtn"),
    contactWaBtn: $("contactWaBtn"),
    contactPhoneDisplay: $("contactPhoneDisplay"),
    year: $("year"),
  };

  /* Helpers */
  function formatBRL(value) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function findProduct(productId) {
    return PRODUCTS.find((p) => p.id === productId);
  }

  function getVariant(product, variantId) {
    if (!product || !product.variants) return null;
    return product.variants.find((v) => v.id === variantId) || product.variants[0];
  }

  function unitPrice(product, variantId) {
    if (!product) return 0;
    if (product.variants) {
      const v = getVariant(product, variantId);
      return v ? v.price : 0;
    }
    if (product.priceOnRequest || product.price == null) return 0;
    return product.price;
  }

  function isPriceKnown(product) {
    if (!product) return false;
    return !!product.variants || (!product.priceOnRequest && product.price != null);
  }

  function categoryLabel(product) {
    return CATEGORIES.find((c) => c.key === product.category)?.label || product.category;
  }

  function formatPhoneDisplay(number) {
    const digits = number.replace(/\D/g, "");
    const ddi = digits.slice(0, 2);
    const ddd = digits.slice(2, 4);
    const rest = digits.slice(4);
    let localFmt = rest;
    if (rest.length === 9) localFmt = rest.slice(0, 5) + "-" + rest.slice(5);
    else if (rest.length === 8) localFmt = rest.slice(0, 4) + "-" + rest.slice(4);
    return `+${ddi} (${ddd}) ${localFmt}`;
  }

  function waLink(message) {
    return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, reduceMotion() ? 0 : ms));
  }

  function animate(el, keyframes, options) {
    if (!el || !el.animate || reduceMotion()) return null;
    return el.animate(keyframes, options);
  }

  function bump(el, amount = 1.18) {
    animate(el, [{ scale: 1 }, { scale: amount }, { scale: 1 }], { duration: 420, easing: EASE_OUT });
  }

  function cardPulse(card) {
    animate(card, [{ scale: 1 }, { scale: 0.97 }, { scale: 1.015 }, { scale: 1 }], {
      duration: 480,
      easing: EASE_OUT,
    });
  }

  /* Troca de conteúdo com fade curto (sai, atualiza, entra) */
  function swapContent(el, update) {
    if (!el || reduceMotion() || !el.animate) {
      update();
      return;
    }
    el.getAnimations().forEach((a) => a.cancel());
    const out = el.animate(
      [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(6px)" }],
      { duration: 140, easing: "ease-in", fill: "forwards" }
    );
    out.finished
      .then(() => {
        update();
        el.animate(
          [{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }],
          { duration: 320, easing: EASE_OUT }
        );
        out.cancel();
      })
      .catch(() => {});
  }

  /* Preço de cada linha do carrinho, já com regra de par */
  function linePricing(line) {
    const empty = { known: false, total: 0, original: 0, saving: 0, pairHint: 0 };
    if (line.isCustom) return empty;

    const product = findProduct(line.productId);
    if (!isPriceKnown(product)) return empty;

    let total = unitPrice(product, line.variantId) * line.qty;
    let original = total;
    let pairHint = 0;

    const rule = PAIR_RULES[line.productId];
    if (rule && product.variants) {
      const single = getVariant(product, rule.unitVariant).price;
      const variantId = line.variantId || rule.unitVariant;

      if (variantId === rule.unitVariant) {
        total = Math.floor(line.qty / 2) * rule.pairPrice + (line.qty % 2) * single;
        if (line.qty % 2 === 1) pairHint = single * 2 - rule.pairPrice;
      } else if (variantId === rule.pairVariant) {
        original = single * 2 * line.qty;
      }
    }

    return { known: true, total, original, saving: original - total, pairHint };
  }

  function cartTotals() {
    return state.cart.reduce(
      (acc, line) => {
        const p = linePricing(line);
        acc.itemCount += line.qty;
        if (!p.known) acc.hasOnRequest = true;
        acc.subtotal += p.total;
        acc.saving += p.saving;
        return acc;
      },
      { subtotal: 0, saving: 0, itemCount: 0, hasOnRequest: false }
    );
  }

  /* Revelação no scroll */
  const reveal = (() => {
    const supported = "IntersectionObserver" in window;
    const io = supported
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            });
          },
          { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
        )
      : null;

    function observe(el) {
      if (!io || reduceMotion()) {
        el.classList.add("is-visible");
        return;
      }
      io.observe(el);
    }

    function init() {
      document.querySelectorAll("[data-reveal-stagger]").forEach((group) => {
        group.querySelectorAll(":scope > [data-reveal]").forEach((el, i) => {
          el.style.setProperty("--reveal-delay", `${i * 90}ms`);
        });
      });
      document.querySelectorAll("[data-reveal]").forEach(observe);
    }

    return { init, observe };
  })();

  /* Filtros */
  function renderFilters() {
    els.filters.innerHTML = CATEGORIES.map(
      (cat) =>
        `<button type="button" class="filter-chip" data-filter="${cat.key}" aria-pressed="${
          cat.key === state.activeCategory
        }">${cat.label}<span class="filter-count">${
          cat.key === "todos" ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === cat.key).length
        }</span></button>`
    ).join("");
  }

  function initFilters() {
    els.filters.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn || btn.dataset.filter === state.activeCategory) return;
      state.activeCategory = btn.dataset.filter;
      els.filters.querySelectorAll("[data-filter]").forEach((b) => {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      renderGrid();
    });
  }

  /* Grid de produtos */
  function productPriceMarkup(product) {
    if (product.variants) {
      const cheapest = Math.min(...product.variants.map((v) => v.price));
      return `
        <div class="price">
          <span class="price-label">A partir de</span>
          <span class="price-value">${formatBRL(cheapest)}</span>
        </div>`;
    }
    if (product.priceOnRequest || product.price == null) {
      return `
        <div class="price">
          <span class="price-label">Valor</span>
          <span class="price-value on-request">Sob consulta</span>
        </div>`;
    }
    const unit = product.priceUnit ? `<span>/ ${product.priceUnit}</span>` : "";
    return `
      <div class="price">
        <span class="price-label">${product.priceLabel || "Preço"}</span>
        <span class="price-value">${formatBRL(product.price)} ${unit}</span>
      </div>`;
  }

  const MAX_POWER = Math.max(...PRODUCTS.map((p) => p.power || 0));

  function powerMarkup(product) {
    if (!product.power) return "";
    return `
      <div class="power" style="--power:${(product.power / MAX_POWER).toFixed(3)}">
        <span class="power-label">Potência</span>
        <span class="power-track" aria-hidden="true"><i></i></span>
        <span class="power-value">${product.power} mil lm</span>
      </div>`;
  }

  function highlightsMarkup(product) {
    if (!product.highlights?.length) return "";
    return `<ul class="product-chips">${product.highlights
      .map((h) => `<li>${h}</li>`)
      .join("")}</ul>`;
  }

  function powerCompareMarkup(product) {
    if (!product.power) return "";
    const line = PRODUCTS.filter((p) => p.power).sort((a, b) => a.power - b.power);
    return `
      <div class="power-compare">
        <span class="field-label">Compare a linha LED</span>
        ${line
          .map(
            (p) => `
          <button type="button" class="power-row${p.id === product.id ? " is-current" : ""}" data-open="${p.id}" ${
              p.id === product.id ? 'aria-current="true"' : ""
            }>
            <span class="power-row-name">${p.power} mil lm</span>
            <span class="power-track" style="--power:${(p.power / MAX_POWER).toFixed(3)}" aria-hidden="true"><i></i></span>
            <span class="power-row-price">${
              p.variants ? formatBRL(Math.min(...p.variants.map((v) => v.price))) : "Consulta"
            }</span>
          </button>`
          )
          .join("")}
      </div>`;
  }

  function productCardMarkup(product) {
    return `
      <div class="product-media">
        <span class="product-tag">${categoryLabel(product)}</span>
        ${product.badge ? `<span class="product-badge product-badge--${product.badge.tone || "red"}">${product.badge.text}</span>` : ""}
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        <span class="card-glow" aria-hidden="true"></span>
      </div>
      <div class="product-body">
        <h3 class="product-name">
          <button type="button" class="card-open" data-id="${product.id}" aria-haspopup="dialog">${product.name}</button>
        </h3>
        <p class="product-desc">${product.shortDesc}</p>
        ${highlightsMarkup(product)}
        ${powerMarkup(product)}
      </div>
      <div class="product-body product-body--footer">
        <div class="product-footer">
          <div class="price-block">
            ${productPriceMarkup(product)}
            ${product.priceNote ? `<span class="price-note">${product.priceNote}</span>` : ""}
          </div>
          ${
            product.variants
              ? `<button type="button" class="choose-btn" data-choose="${product.id}" aria-label="Escolher opção de ${product.name}">
                  <span class="choose-text">Escolher</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>
                </button>`
              : `<button type="button" class="add-btn" data-quick-add="${product.id}" aria-label="Adicionar ${product.name} ao carrinho">
                  ${ICONS.plus}${ICONS.check}<span class="spinner" aria-hidden="true"></span>
                </button>`
          }
        </div>
      </div>`;
  }

  function renderGrid() {
    const list =
      state.activeCategory === "todos"
        ? PRODUCTS
        : PRODUCTS.filter((p) => p.category === state.activeCategory);

    els.grid.innerHTML = "";

    if (list.length === 0) {
      els.grid.innerHTML = `<p style="color:var(--steel)">Nenhum produto nessa categoria ainda.</p>`;
      return;
    }

    const fragment = document.createDocumentFragment();
    list.forEach((product, i) => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.dataset.reveal = "";
      card.style.setProperty("--reveal-delay", `${(i % 4) * 70}ms`);
      card.innerHTML = productCardMarkup(product);
      fragment.appendChild(card);
    });
    els.grid.appendChild(fragment);
    els.grid.querySelectorAll("[data-reveal]").forEach(reveal.observe);
  }

  async function quickAdd(btn) {
    const product = findProduct(btn.dataset.quickAdd);
    if (!product || btn.classList.contains("is-loading")) return;

    const variant = product.variants ? product.variants[0] : null;
    btn.classList.add("is-loading");
    btn.setAttribute("aria-busy", "true");

    await wait(420);
    addToCart(product.id, variant ? variant.id : null, 1);
    btn.classList.replace("is-loading", "is-done");
    btn.removeAttribute("aria-busy");
    cardPulse(btn.closest(".product-card"));
    showToast(`${product.name}${variant ? ` (${variant.label})` : ""} adicionado`);

    await wait(1100);
    btn.classList.remove("is-done");
  }

  function initGrid() {
    els.grid.addEventListener("click", (e) => {
      const chooseBtn = e.target.closest("[data-choose]");
      if (chooseBtn) {
        openModal(chooseBtn.dataset.choose);
        return;
      }
      const addBtn = e.target.closest("[data-quick-add]");
      if (addBtn) {
        quickAdd(addBtn);
        return;
      }
      const openBtn = e.target.closest(".card-open");
      if (openBtn) openModal(openBtn.dataset.id);
    });

    if (!finePointer.matches) return;

    /* Glare de farol que acompanha o cursor (só transform, via rAF) */
    let frame = 0;
    let pending = null;
    els.grid.addEventListener("pointermove", (e) => {
      const media = e.target.closest(".product-card")?.querySelector(".product-media");
      if (!media) return;
      const rect = media.getBoundingClientRect();
      pending = { media, x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        pending.media.style.setProperty("--gx", `${pending.x}px`);
        pending.media.style.setProperty("--gy", `${pending.y}px`);
        frame = 0;
      });
    });
  }

  /* Camadas (modal / drawer): foco, scroll e teclado */
  const layers = {
    stack: [],
    lastFocus: new Map(),

    open(el, focusTarget) {
      if (this.stack.includes(el)) return;
      this.lastFocus.set(el, document.activeElement);
      this.stack.push(el);
      el.inert = false;
      this.lockScroll(true);
      requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }));
    },

    close(el) {
      const index = this.stack.indexOf(el);
      if (index === -1) return false;
      this.stack.splice(index, 1);
      el.inert = true;
      if (!this.stack.length) this.lockScroll(false);
      const previous = this.lastFocus.get(el);
      if (previous && document.contains(previous)) previous.focus({ preventScroll: true });
      return true;
    },

    top() {
      return this.stack[this.stack.length - 1] || null;
    },

    lockScroll(lock) {
      const gap = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = lock && gap > 0 ? `${gap}px` : "";
      document.body.classList.toggle("is-locked", lock);
    },
  };

  function trapFocus(e) {
    const container = layers.top();
    if (!container || e.key !== "Tab") return;
    const focusables = [
      ...container.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea'
      ),
    ].filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* Modal de produto */
  let modalState = { productId: null, variantId: null, qty: 1 };

  function openModal(productId) {
    const product = findProduct(productId);
    if (!product) return;

    modalState = {
      productId: product.id,
      variantId: product.variants ? product.variants[0].id : null,
      qty: 1,
    };

    els.modalImg.src = product.image;
    els.modalImg.alt = product.name;
    renderModalInfo();

    els.modal.classList.add("is-open");
    layers.open(els.modal, els.modalCloseBtn);
  }

  function closeModal() {
    if (!layers.close(els.modal)) return;
    els.modal.classList.remove("is-open");
  }

  function modalQuestionLink(product) {
    const variant = product.variants ? getVariant(product, modalState.variantId) : null;
    const name = `${product.name}${variant ? ` (${variant.label})` : ""}`;
    return waLink(`Olá! Vim pelo site da MV LEDs e tenho uma dúvida sobre o produto "${name}". Ele é compatível com o meu veículo?`);
  }

  function renderModalInfo() {
    const product = findProduct(modalState.productId);

    const variantMarkup = product.variants
      ? `
        <div class="variant-picker">
          <span class="field-label">Opção</span>
          <div class="variant-options">
            ${product.variants
              .map(
                (v) => `
              <button type="button" class="variant-option" data-variant="${v.id}" aria-pressed="${v.id === modalState.variantId}">
                ${v.label} · ${formatBRL(v.price)}
              </button>`
              )
              .join("")}
          </div>
        </div>`
      : "";

    const specsMarkup = product.specs?.length
      ? `<div class="spec-list">
          ${product.specs
            .map(
              (s) => `
            <div class="spec-row">
              <span class="label">${s.label}</span>
              <span class="value">${s.value}</span>
            </div>`
            )
            .join("")}
        </div>`
      : "";

    const priceRowMarkup = isPriceKnown(product)
      ? `
        <div class="price">
          <span class="price-label">${product.variants ? "Preço selecionado" : product.priceLabel || "Preço"}</span>
          <span class="price-value" id="modalPriceValue">${formatBRL(unitPrice(product, modalState.variantId))}${
          product.priceUnit ? ` <span>/ ${product.priceUnit}</span>` : ""
        }</span>
        </div>`
      : `
        <div class="price">
          <span class="price-label">Valor</span>
          <span class="price-value on-request">Sob consulta</span>
        </div>`;

    els.modalInfo.innerHTML = `
      <span class="product-tag">${categoryLabel(product)}</span>
      <h3 id="modalTitle">${product.name}</h3>
      <p class="modal-desc">${product.description || product.shortDesc}</p>
      ${specsMarkup}
      ${powerCompareMarkup(product)}
      ${variantMarkup}

      <div class="modal-price-row">
        ${priceRowMarkup}
        <div class="modal-qty">
          <button type="button" data-step="-1" aria-label="Diminuir quantidade">−</button>
          <span id="modalQtyValue" aria-live="polite">${modalState.qty}</span>
          <button type="button" data-step="1" aria-label="Aumentar quantidade">+</button>
        </div>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn btn-primary btn-block btn-add-modal" id="modalAddBtn">
          <span class="spinner" aria-hidden="true"></span>${ICONS.check}
          <span class="btn-text">Adicionar ao carrinho</span>
        </button>
        <a class="modal-ask" id="modalAskLink" href="${modalQuestionLink(product)}" target="_blank" rel="noopener">
          ${ICONS.whatsapp} Tirar dúvida sobre o encaixe no WhatsApp
        </a>
      </div>
    `;
  }

  function initModalUI() {
    els.modalCloseBtn.addEventListener("click", closeModal);
    els.modal.addEventListener("click", (e) => {
      if (e.target === els.modal) closeModal();
    });

    els.modalInfo.addEventListener("click", async (e) => {
      const product = findProduct(modalState.productId);
      if (!product) return;

      const openBtn = e.target.closest("[data-open]");
      if (openBtn) {
        if (openBtn.dataset.open !== product.id) {
          openModal(openBtn.dataset.open);
          els.modalPanel.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      const variantBtn = e.target.closest("[data-variant]");
      if (variantBtn) {
        modalState.variantId = variantBtn.dataset.variant;
        els.modalInfo.querySelectorAll("[data-variant]").forEach((b) => {
          b.setAttribute("aria-pressed", String(b === variantBtn));
        });
        const priceEl = $("modalPriceValue");
        if (priceEl) {
          swapContent(priceEl, () => {
            priceEl.textContent = formatBRL(unitPrice(product, modalState.variantId));
          });
        }
        $("modalAskLink").href = modalQuestionLink(product);
        return;
      }

      const stepBtn = e.target.closest("[data-step]");
      if (stepBtn) {
        modalState.qty = Math.max(1, modalState.qty + parseInt(stepBtn.dataset.step, 10));
        const qtyEl = $("modalQtyValue");
        qtyEl.textContent = modalState.qty;
        bump(qtyEl, 1.25);
        return;
      }

      const addBtn = e.target.closest("#modalAddBtn");
      if (addBtn && !addBtn.classList.contains("is-loading")) {
        const label = addBtn.querySelector(".btn-text");
        addBtn.classList.add("is-loading");
        label.textContent = "Adicionando…";

        await wait(450);
        addToCart(product.id, modalState.variantId, modalState.qty);
        addBtn.classList.replace("is-loading", "is-done");
        label.textContent = "Adicionado ao carrinho";
        showToast(`${product.name} adicionado ao carrinho`);

        await wait(700);
        closeModal();
      }
    });
  }

  /* Carrinho — dados */
  function lineId(productId, variantId) {
    return variantId ? `${productId}::${variantId}` : productId;
  }

  function commitCart() {
    renderCart();
    updateCartCount();
  }

  function addToCart(productId, variantId, qty) {
    const id = lineId(productId, variantId);
    const existing = state.cart.find((l) => l.lineId === id);
    if (existing) existing.qty += qty;
    else state.cart.push({ lineId: id, productId, variantId, qty });
    state.lastAddedLine = id;
    commitCart();
    bump(els.cartCount, 1.4);
    bump(els.cartToggle, 1.08);
  }

  function addQuickUpsellItem(itemId) {
    const item = quickAddItems.find((i) => i.id === itemId);
    if (!item || state.cart.some((l) => l.lineId === item.id)) return;

    state.cart.push({
      lineId: item.id,
      productId: item.id,
      variantId: null,
      qty: 1,
      isCustom: true,
      customName: item.name,
    });
    state.lastAddedLine = item.id;
    state.justUpsold = item.id;
    commitCart();
    bump(els.cartCount, 1.4);
    showToast(`${item.name} adicionado`, { action: false });
  }

  function setLineQty(id, qty) {
    const line = state.cart.find((l) => l.lineId === id);
    if (!line) return;
    if (qty <= 0) state.cart = state.cart.filter((l) => l.lineId !== id);
    else line.qty = qty;
    commitCart();
  }

  function removeLine(id) {
    state.cart = state.cart.filter((l) => l.lineId !== id);
    commitCart();
  }

  function updateCartCount() {
    const { itemCount } = cartTotals();
    els.cartCount.textContent = String(itemCount);
    els.cartCount.dataset.empty = String(itemCount === 0);
    els.cartToggle.setAttribute(
      "aria-label",
      itemCount ? `Abrir carrinho (${itemCount} ${itemCount === 1 ? "item" : "itens"})` : "Abrir carrinho"
    );
  }

  /* Barra de vantagem */
  function renderGoal(subtotal) {
    const { threshold, reward } = CART_GOAL;
    if (!threshold || !reward) {
      els.cartGoal.hidden = true;
      return;
    }

    const ratio = Math.min(subtotal / threshold, 1);
    const missing = Math.max(threshold - subtotal, 0);
    const unlocked = missing === 0;

    els.cartGoalFill.style.transform = `scaleX(${ratio})`;
    els.cartGoalTrack.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
    els.cartGoal.classList.toggle("is-unlocked", unlocked);
    els.cartGoalText.innerHTML = unlocked
      ? `<strong>Benefício liberado:</strong> ${reward} no seu pedido.`
      : subtotal === 0
      ? `Pedidos a partir de <strong>${formatBRL(threshold)}</strong> ganham ${reward}.`
      : `Faltam <strong>${formatBRL(missing)}</strong> para ganhar ${reward}.`;

    if (unlocked && !state.goalUnlocked) {
      animate(els.cartGoal, [{ transform: "scale(1)" }, { transform: "scale(1.025)" }, { transform: "scale(1)" }], {
        duration: 500,
        easing: EASE_OUT,
      });
    }
    state.goalUnlocked = unlocked;
  }

  /* Upsell */
  function renderCartUpsell() {
    if (!state.cart.length) {
      els.cartUpsell.hidden = true;
      return;
    }
    els.cartUpsell.hidden = false;

    const inCart = new Set(state.cart.map((l) => l.lineId));

    els.upsellList.innerHTML = quickAddItems
      .map((item) => {
        const included = inCart.has(item.id);
        const priceDisplay =
          typeof item.price === "number" ? `+ ${formatBRL(item.price)}` : item.price;
        const classes = [
          "upsell-card",
          included && "is-included",
          state.justUpsold === item.id && "is-just-added",
        ]
          .filter(Boolean)
          .join(" ");

        return `
        <div class="${classes}">
          <div class="upsell-info">
            <span class="upsell-name">${item.name}</span>
            <span class="upsell-price">${priceDisplay}</span>
          </div>
          <button type="button" class="btn-upsell-add" data-upsell-id="${item.id}" ${
          included ? 'disabled aria-label="' + item.name + ' já incluído"' : ""
        }>
            <span class="upsell-btn-add">+ Adicionar</span>
            <span class="upsell-btn-done">${ICONS.check} Incluído</span>
          </button>
        </div>`;
      })
      .join("");

    state.justUpsold = null;
  }

  /* Render do drawer */
  function cartItemMarkup(line, index) {
    const p = linePricing(line);
    const isNew = state.lastAddedLine === line.lineId;
    let media;
    let name;
    let variantLabel = "";

    if (line.isCustom) {
      media = `<div class="cart-item-media cart-item-media--custom">${ICONS.sun}</div>`;
      name = line.customName;
      variantLabel = "Combo adicional";
    } else {
      const product = findProduct(line.productId);
      const variant = product.variants ? getVariant(product, line.variantId) : null;
      media = `<div class="cart-item-media"><img src="${product.image}" alt="" /></div>`;
      name = product.name;
      variantLabel = variant ? variant.label : "";
    }

    let priceMarkup;
    if (!p.known) {
      priceMarkup = `<span class="cart-item-price">${line.isCustom ? "Sob consulta" : "Valor a combinar"}</span>`;
    } else if (p.saving > 0) {
      priceMarkup = `
        <span class="cart-item-price"><s>${formatBRL(p.original)}</s><strong>${formatBRL(p.total)}</strong></span>
        <span class="save-badge">Desconto par · −${formatBRL(p.saving)}</span>`;
    } else {
      priceMarkup = `<span class="cart-item-price">${formatBRL(p.total)}</span>`;
    }

    if (p.pairHint) {
      priceMarkup += `<button type="button" class="pair-hint" data-qty-step="1">Leve o par e economize ${formatBRL(p.pairHint)}</button>`;
    }

    return `
      <div class="cart-item${isNew ? " is-new" : ""}" data-line="${line.lineId}" style="--i:${index}">
        ${media}
        <div class="cart-item-info">
          <span class="cart-item-name">${name}</span>
          ${variantLabel ? `<span class="cart-item-variant">${variantLabel}</span>` : ""}
          ${priceMarkup}
          <div class="qty-stepper">
            <button type="button" data-qty-step="-1" aria-label="Diminuir quantidade de ${name}">−</button>
            <span>${line.qty}</span>
            <button type="button" data-qty-step="1" aria-label="Aumentar quantidade de ${name}">+</button>
          </div>
        </div>
        <div class="cart-item-remove">
          <button type="button" data-remove aria-label="Remover ${name}">${ICONS.trash}</button>
        </div>
      </div>`;
  }

  function renderCart() {
    const totals = cartTotals();
    renderGoal(totals.subtotal);

    if (!state.cart.length) {
      els.cartBody.innerHTML = `
        <div class="cart-empty">
          ${ICONS.cart}
          <p>Seu carrinho está vazio.</p>
        </div>`;
      els.cartFooter.innerHTML = "";
      renderCartUpsell();
      return;
    }

    els.cartBody.innerHTML = state.cart.map(cartItemMarkup).join("");
    state.lastAddedLine = null;

    els.cartFooter.innerHTML = `
      <div class="summary-row">
        <span>Itens</span>
        <span>${totals.itemCount}</span>
      </div>
      ${
        totals.saving > 0
          ? `<div class="summary-row saving"><span>Você economiza</span><span>−${formatBRL(totals.saving)}</span></div>`
          : ""
      }
      <div class="summary-row total">
        <span>Subtotal</span>
        <span>${formatBRL(totals.subtotal)}</span>
      </div>
      ${
        totals.hasOnRequest
          ? `<span class="summary-note">+ itens com valor a combinar (confirme com a loja)</span>`
          : ""
      }
      <div class="drawer-footer-actions">
        <a href="${waLink(buildWhatsAppMessage(totals))}" id="checkoutBtn" class="btn btn-whatsapp btn-block" target="_blank" rel="noopener">
          ${ICONS.whatsapp}
          Finalizar pedido pelo WhatsApp
        </a>
        <button type="button" class="link-clear" id="clearCartBtn">Limpar carrinho</button>
      </div>
    `;

    renderCartUpsell();
  }

  /* Mensagem de WhatsApp */
  function buildWhatsAppMessage(totals = cartTotals()) {
    const lines = [`Olá, ${CONFIG.OWNER_NAME}! Gostaria de fazer um pedido na ${CONFIG.STORE_NAME}:`, ""];

    state.cart.forEach((line) => {
      if (line.isCustom) {
        lines.push(`• ${line.qty}x ${line.customName} — valor sob consulta`);
        return;
      }

      const product = findProduct(line.productId);
      const variant = product.variants ? getVariant(product, line.variantId) : null;
      const p = linePricing(line);

      let itemLine = `• ${line.qty}x ${product.name}`;
      if (variant) itemLine += ` (${variant.label})`;
      if (!p.known) itemLine += " — valor a combinar";
      else itemLine += ` — ${formatBRL(p.total)}${p.saving > 0 ? " (com desconto de par)" : ""}`;
      lines.push(itemLine);
    });

    lines.push("");
    if (totals.saving > 0) lines.push(`Economia: ${formatBRL(totals.saving)}`);
    lines.push(`Total: ${formatBRL(totals.subtotal)}${totals.hasOnRequest ? " + itens a combinar" : ""}`);
    if (state.goalUnlocked) lines.push(`Benefício do site: ${CART_GOAL.reward}`);
    lines.push("");
    lines.push("Gostaria de saber a disponibilidade e como posso realizar a compra.");

    return lines.join("\n");
  }

  function initCartBody() {
    els.cartBody.addEventListener("click", (e) => {
      const item = e.target.closest(".cart-item");
      if (!item) return;
      const id = item.dataset.line;
      const line = state.cart.find((l) => l.lineId === id);
      if (!line) return;

      const stepBtn = e.target.closest("[data-qty-step]");
      if (stepBtn) {
        setLineQty(id, line.qty + parseInt(stepBtn.dataset.qtyStep, 10));
        return;
      }

      if (e.target.closest("[data-remove]")) {
        const anim = animate(
          item,
          [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(24px)" }],
          { duration: 220, easing: "ease-in", fill: "forwards" }
        );
        if (anim) anim.finished.then(() => removeLine(id)).catch(() => removeLine(id));
        else removeLine(id);
      }
    });

    els.cartFooter.addEventListener("click", (e) => {
      if (e.target.closest("#clearCartBtn")) {
        state.cart = [];
        commitCart();
      }
    });

    els.upsellList.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-upsell-id]");
      if (!btn || btn.disabled) return;
      btn.disabled = true;
      btn.closest(".upsell-card").classList.add("is-included");
      await wait(380);
      addQuickUpsellItem(btn.dataset.upsellId);
    });
  }

  /* Drawer */
  function openDrawer() {
    if (els.drawer.classList.contains("is-open")) return;
    renderCart();
    els.drawer.classList.add("is-open", "is-entering");
    els.overlay.classList.add("is-open");
    els.cartToggle.setAttribute("aria-expanded", "true");
    layers.open(els.drawer, els.cartCloseBtn);
    setTimeout(() => els.drawer.classList.remove("is-entering"), 900);
  }

  function closeDrawer() {
    if (!layers.close(els.drawer)) return;
    els.drawer.classList.remove("is-open", "is-entering");
    els.overlay.classList.remove("is-open");
    els.cartToggle.setAttribute("aria-expanded", "false");
  }

  function initCartUI() {
    els.cartToggle.addEventListener("click", openDrawer);
    els.cartCloseBtn.addEventListener("click", closeDrawer);
    els.overlay.addEventListener("click", closeDrawer);
  }

  /* Toast */
  let toastTimer = null;

  function showToast(text, { action = true } = {}) {
    els.toastText.textContent = text;
    els.toastAction.hidden = !action || els.drawer.classList.contains("is-open");
    els.toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove("is-visible"), 3200);
  }

  function initToast() {
    els.toastAction.addEventListener("click", () => {
      els.toast.classList.remove("is-visible");
      openDrawer();
    });
    els.toast.addEventListener("pointerenter", () => clearTimeout(toastTimer));
    els.toast.addEventListener("pointerleave", () => {
      toastTimer = setTimeout(() => els.toast.classList.remove("is-visible"), 1600);
    });
  }

  /* Header e navegação */
  function initHeaderScroll() {
    let ticking = false;
    const update = () => {
      els.header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    };
    update();
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );
  }

  function initNavToggle() {
    const setOpen = (open) => {
      els.mainNav.classList.toggle("is-open", open);
      els.navToggle.setAttribute("aria-expanded", String(open));
      els.navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    };
    els.navToggle.addEventListener("click", () => {
      setOpen(!els.mainNav.classList.contains("is-open"));
    });
    els.mainNav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
  }

  function initKeyboard() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (layers.top() === els.modal) closeModal();
        else if (layers.top() === els.drawer) closeDrawer();
        else if (els.mainNav.classList.contains("is-open")) els.navToggle.click();
      }
      trapFocus(e);
    });
  }

  function initWhatsAppButtons() {
    const link = waLink(CONFIG.WHATSAPP_DEFAULT_MESSAGE);
    els.floatWaBtn.href = link;
    els.contactWaBtn.href = link;
    els.contactPhoneDisplay.textContent = formatPhoneDisplay(CONFIG.WHATSAPP_NUMBER);
  }

  /* Simulador Kelvin */
  function initKelvin() {
    const group = document.querySelector(".kelvin-buttons");
    if (!group) return;

    const buttons = [...group.querySelectorAll(".k-btn")];
    const beamsWrap = $("kelvinBeams");
    const beams = beamsWrap.querySelectorAll(".kelvin-beam");
    const sweep = $("kelvinSweep");
    const display = $("kelvinDisplay");
    const hud = $("hudValue");
    const info = $("kelvinInfo");

    function select(btn) {
      const k = btn.dataset.kelvin;
      const data = KELVIN_DATA[k];
      if (!data || display.dataset.k === k) return;

      buttons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      group.style.setProperty("--k-index", buttons.indexOf(btn));
      display.dataset.k = k;
      beams.forEach((beam) => beam.classList.toggle("is-active", beam.dataset.k === k));

      animate(
        sweep,
        [
          { transform: "translateX(-100%)", opacity: 0 },
          { opacity: 1, offset: 0.35 },
          { transform: "translateX(100%)", opacity: 0 },
        ],
        { duration: 900, easing: "cubic-bezier(0.65, 0, 0.35, 1)" }
      );
      animate(beamsWrap, [{ opacity: 1 }, { opacity: 0.55 }, { opacity: 0.95 }, { opacity: 0.8 }, { opacity: 1 }], {
        duration: 420,
        easing: "linear",
      });

      swapContent(hud, () => {
        hud.textContent = data.hud;
      });
      swapContent(info, () => {
        $("infoTitle").textContent = data.title;
        $("infoDesc").textContent = data.desc;
        $("infoSpecs").innerHTML = `
          <li><strong>Aplicação recomendada:</strong> ${data.app}</li>
          <li><strong>Contraste:</strong> ${data.contrast}</li>`;
      });
    }

    group.addEventListener("click", (e) => {
      const btn = e.target.closest(".k-btn");
      if (btn) select(btn);
    });

    /* Setas do teclado alternam entre as temperaturas */
    group.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const current = buttons.findIndex((b) => b.classList.contains("active"));
      const next = (current + (e.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus();
      select(buttons[next]);
      e.preventDefault();
    });
  }

  /* Inclinação 3D com luz interna nos cards de garantia */
  function initTilt() {
    if (!finePointer.matches || reduceMotion()) return;

    document.querySelectorAll("[data-tilt]").forEach((card) => {
      let frame = 0;
      let values = null;

      card.addEventListener("pointerenter", () => card.classList.add("is-tilting"));

      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        values = {
          rx: (0.5 - py) * 7,
          ry: (px - 0.5) * 9,
          lx: e.clientX - rect.left,
          ly: e.clientY - rect.top,
        };
        if (frame) return;
        frame = requestAnimationFrame(() => {
          card.style.setProperty("--rx", `${values.rx.toFixed(2)}deg`);
          card.style.setProperty("--ry", `${values.ry.toFixed(2)}deg`);
          card.style.setProperty("--lx", `${values.lx}px`);
          card.style.setProperty("--ly", `${values.ly}px`);
          frame = 0;
        });
      });

      card.addEventListener("pointerleave", () => {
        cancelAnimationFrame(frame);
        frame = 0;
        card.classList.remove("is-tilting");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* FAQ com abertura suave (um item aberto por vez) */
  /* Reel da loja no hero: toca mudo, som sob demanda, pausa fora da tela */
  function initHeroReel() {
    const wrap = $("heroReel");
    const video = $("reelVideo");
    const soundBtn = $("reelSound");
    if (!wrap || !video || !soundBtn) return;

    const label = soundBtn.querySelector(".reel-sound-label");
    const bar = $("reelProgress");
    const saveData = navigator.connection && navigator.connection.saveData;
    let userPaused = reduceMotion() || saveData;
    let inView = false;
    let frame = 0;

    function setPaused(paused) {
      wrap.classList.toggle("is-paused", paused);
    }

    function tick() {
      if (video.duration) bar.style.transform = `scaleX(${(video.currentTime / video.duration).toFixed(4)})`;
      frame = video.paused ? 0 : requestAnimationFrame(tick);
    }

    function play() {
      const attempt = video.play();
      if (attempt && attempt.catch) attempt.catch(() => setPaused(true));
    }

    video.addEventListener("play", () => {
      setPaused(false);
      if (!frame) frame = requestAnimationFrame(tick);
    });
    video.addEventListener("pause", () => setPaused(true));

    function setSound(on) {
      video.muted = !on;
      soundBtn.setAttribute("aria-pressed", String(on));
      label.textContent = on ? "Som ligado" : "Ativar som";
      if (on) {
        video.volume = 0;
        const start = performance.now();
        const fade = (now) => {
          const t = Math.min(Math.max((now - start) / 500, 0), 1);
          video.volume = t;
          if (t < 1 && !video.muted) requestAnimationFrame(fade);
        };
        requestAnimationFrame(fade);
        userPaused = false;
        play();
      }
    }

    soundBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setSound(video.muted);
    });

    wrap.querySelector(".reel-frame").addEventListener("click", () => {
      if (video.paused) {
        userPaused = false;
        play();
      } else {
        userPaused = true;
        video.pause();
      }
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        (entries) => {
          inView = entries[0].isIntersecting;
          if (inView && !userPaused) play();
          else if (!inView) video.pause();
        },
        { threshold: 0.35 }
      ).observe(wrap);
    } else if (!userPaused) {
      play();
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) video.pause();
      else if (inView && !userPaused) play();
    });

    setPaused(userPaused);
  }

  function initFaq() {
    const items = [...document.querySelectorAll(".faq-item")];
    const DURATION = 420;

    function expand(item) {
      clearTimeout(item._faqTimer);
      item.open = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => item.classList.add("is-expanded"));
      });
    }

    function collapse(item) {
      item.classList.remove("is-expanded");
      clearTimeout(item._faqTimer);
      item._faqTimer = setTimeout(
        () => {
          if (!item.classList.contains("is-expanded")) item.open = false;
        },
        reduceMotion() ? 0 : DURATION
      );
    }

    items.forEach((item) => {
      if (item.open) item.classList.add("is-expanded");
      item.querySelector("summary").addEventListener("click", (e) => {
        e.preventDefault();
        if (item.classList.contains("is-expanded")) {
          collapse(item);
          return;
        }
        items.forEach((other) => {
          if (other !== item && other.classList.contains("is-expanded")) collapse(other);
        });
        expand(item);
      });
    });
  }

  /* Inicialização */
  function init() {
    els.year.textContent = new Date().getFullYear();
    renderFilters();
    renderGrid();
    renderCart();
    updateCartCount();

    initFilters();
    initGrid();
    initHeaderScroll();
    initNavToggle();
    initCartUI();
    initCartBody();
    initModalUI();
    initToast();
    initKeyboard();
    initWhatsAppButtons();
    initKelvin();
    initTilt();
    initFaq();
    initHeroReel();
    reveal.init();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
