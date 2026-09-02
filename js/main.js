/* Aplicação principal MV LEDs */

(function () {
  "use strict";

  /* Estado */
  const state = {
    activeCategory: "todos",
    cart: [], // { lineId, productId, variantId, qty, isCustom, customName }
  };

  /* Itens rápidos de combo (Upsell) */
  const quickAddItems = [
    {
      id: "pingo-t10-silicone",
      name: "Par Pingo T10 Silicone (Farolete)",
      price: "Consultar via WhatsApp",
    },
    {
      id: "led-placa-t10",
      name: "Par LED Luz de Placa",
      price: "Consultar via WhatsApp",
    },
    {
      id: "kit-interno-teto",
      name: "Kit LED Cortesia / Teto",
      price: "Consultar via WhatsApp",
    },
  ];

  const els = {
    header: document.getElementById("siteHeader"),
    navToggle: document.getElementById("navToggle"),
    mainNav: document.getElementById("mainNav"),
    filters: document.getElementById("filters"),
    grid: document.getElementById("productGrid"),
    cartToggle: document.getElementById("cartToggle"),
    cartCount: document.getElementById("cartCount"),
    overlay: document.getElementById("overlay"),
    drawer: document.getElementById("cartDrawer"),
    cartCloseBtn: document.getElementById("cartCloseBtn"),
    cartBody: document.getElementById("cartBody"),
    cartFooter: document.getElementById("cartFooter"),
    cartUpsell: document.getElementById("cartUpsell"),
    upsellList: document.getElementById("upsellList"),
    modal: document.getElementById("productModal"),
    modalPanel: document.getElementById("modalPanel"),
    modalCloseBtn: document.getElementById("modalCloseBtn"),
    modalImg: document.getElementById("modalImg"),
    modalInfo: document.getElementById("modalInfo"),
    toast: document.getElementById("toast"),
    toastText: document.getElementById("toastText"),
    floatWaBtn: document.getElementById("floatWaBtn"),
    contactWaBtn: document.getElementById("contactWaBtn"),
    contactPhoneDisplay: document.getElementById("contactPhoneDisplay"),
    year: document.getElementById("year"),
  };

  let toastTimer = null;

  /* Helpers */
  function formatBRL(value) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function findProduct(productId) {
    return PRODUCTS.find((p) => p.id === productId);
  }

  function getVariant(product, variantId) {
    if (!product || !product.variants) return null;
    return (
      product.variants.find((v) => v.id === variantId) || product.variants[0]
    );
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
    return (!product.priceOnRequest && product.price != null) || !!product.variants;
  }

  function formatPhoneDisplay(number) {
    const digits = number.replace(/\D/g, "");
    const ddi = digits.slice(0, 2);
    const ddd = digits.slice(2, 4);
    const rest = digits.slice(4);
    let localFmt = rest;
    if (rest.length === 9) {
      localFmt = rest.slice(0, 5) + "-" + rest.slice(5);
    } else if (rest.length === 8) {
      localFmt = rest.slice(0, 4) + "-" + rest.slice(4);
    }
    return `+${ddi} (${ddd}) ${localFmt}`;
  }

  function waLink(message) {
    return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;
  }

  function showToast(text) {
    els.toastText.textContent = text;
    els.toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.classList.remove("is-visible");
    }, 2200);
  }

  /* Filtros */
  function renderFilters() {
    els.filters.innerHTML = "";
    CATEGORIES.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "filter-chip";
      btn.type = "button";
      btn.textContent = cat.label;
      btn.setAttribute("aria-pressed", String(cat.key === state.activeCategory));
      btn.addEventListener("click", () => {
        state.activeCategory = cat.key;
        renderFilters();
        renderGrid();
      });
      els.filters.appendChild(btn);
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
    const label = product.priceLabel || "Preço";
    const unit = product.priceUnit ? `<span>/ ${product.priceUnit}</span>` : "";
    return `
      <div class="price">
        <span class="price-label">${label}</span>
        <span class="price-value">${formatBRL(product.price)} ${unit}</span>
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

    list.forEach((product) => {
      const catLabel =
        CATEGORIES.find((c) => c.key === product.category)?.label ||
        product.category;

      const card = document.createElement("article");
      card.className = "product-card";

      card.innerHTML = `
        <button type="button" class="card-open" data-id="${product.id}" style="all:unset;cursor:pointer;display:block;">
          <div class="product-media">
            <span class="product-tag">${catLabel}</span>
            <img src="${product.image}" alt="${product.name}" loading="lazy" />
          </div>
          <div class="product-body">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-desc">${product.shortDesc}</p>
          </div>
        </button>
        <div class="product-body" style="padding-top:0;">
          <div class="product-footer">
            ${productPriceMarkup(product)}
            <button type="button" class="add-btn" data-quick-add="${
              product.id
            }" aria-label="Adicionar ${product.name} ao carrinho">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        </div>
      `;

      els.grid.appendChild(card);
    });

    els.grid.querySelectorAll(".card-open").forEach((btn) => {
      btn.addEventListener("click", () => openModal(btn.dataset.id));
    });

    els.grid.querySelectorAll("[data-quick-add]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const product = findProduct(btn.dataset.quickAdd);
        const variantId = product.variants ? product.variants[0].id : null;
        addToCart(product.id, variantId, 1);
        btn.classList.add("is-added");
        setTimeout(() => btn.classList.remove("is-added"), 900);
        showToast(`${product.name} adicionado ao carrinho`);
      });
    });
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
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    els.modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function renderModalInfo() {
    const product = findProduct(modalState.productId);
    const catLabel =
      CATEGORIES.find((c) => c.key === product.category)?.label ||
      product.category;

    let variantMarkup = "";
    if (product.variants) {
      variantMarkup = `
        <div class="variant-picker">
          <span class="field-label">Encaixe</span>
          <div class="variant-options" id="variantOptions">
            ${product.variants
              .map(
                (v) => `
              <button type="button" class="variant-option" data-variant="${
                v.id
              }" aria-pressed="${v.id === modalState.variantId}">
                ${v.label} · ${formatBRL(v.price)}
              </button>`
              )
              .join("")}
          </div>
        </div>`;
    }

    const specsMarkup =
      product.specs && product.specs.length
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

    const priceKnown =
      !!product.variants || (!product.priceOnRequest && product.price != null);

    const currentUnitPrice = unitPrice(product, modalState.variantId);

    const priceRowMarkup = priceKnown
      ? `
        <div class="price">
          <span class="price-label">${
            product.variants ? "Preço selecionado" : product.priceLabel || "Preço"
          }</span>
          <span class="price-value">${formatBRL(currentUnitPrice)}${
          product.priceUnit ? ` <span>/ ${product.priceUnit}</span>` : ""
        }</span>
        </div>`
      : `
        <div class="price">
          <span class="price-label">Valor</span>
          <span class="price-value on-request">Sob consulta</span>
        </div>`;

    els.modalInfo.innerHTML = `
      <span class="product-tag">${catLabel}</span>
      <h3 id="modalTitle">${product.name}</h3>
      <p class="modal-desc">${product.description || product.shortDesc}</p>
      ${specsMarkup}
      ${variantMarkup}

      <div class="modal-price-row">
        ${priceRowMarkup}
        <div class="modal-qty" id="modalQty">
          <button type="button" data-step="-1" aria-label="Diminuir quantidade">−</button>
          <span id="modalQtyValue">${modalState.qty}</span>
          <button type="button" data-step="1" aria-label="Aumentar quantidade">+</button>
        </div>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn btn-primary btn-block" id="modalAddBtn">
          Adicionar ao carrinho
        </button>
      </div>
    `;

    if (product.variants) {
      els.modalInfo.querySelectorAll("[data-variant]").forEach((btn) => {
        btn.addEventListener("click", () => {
          modalState.variantId = btn.dataset.variant;
          renderModalInfo();
        });
      });
    }

    els.modalInfo.querySelectorAll("[data-step]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const step = parseInt(btn.dataset.step, 10);
        modalState.qty = Math.max(1, modalState.qty + step);
        document.getElementById("modalQtyValue").textContent = modalState.qty;
      });
    });

    document.getElementById("modalAddBtn").addEventListener("click", () => {
      addToCart(product.id, modalState.variantId, modalState.qty);
      showToast(`${product.name} adicionado ao carrinho`);
      closeModal();
    });
  }

  /* Carrinho — dados */
  function lineId(productId, variantId) {
    return variantId ? `${productId}::${variantId}` : productId;
  }

  function addToCart(productId, variantId, qty) {
    const id = lineId(productId, variantId);
    const existing = state.cart.find((l) => l.lineId === id);
    if (existing) {
      existing.qty += qty;
    } else {
      state.cart.push({ lineId: id, productId, variantId, qty });
    }
    renderCart();
    updateCartCount();
  }

  /* Adiciona itens rápidos do upsell */
  function addQuickUpsellItem(itemId) {
    const item = quickAddItems.find((i) => i.id === itemId);
    if (!item) return;

    const existing = state.cart.find((l) => l.lineId === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push({
        lineId: item.id,
        productId: item.id,
        variantId: null,
        qty: 1,
        isCustom: true,
        customName: item.name,
      });
    }

    renderCart();
    updateCartCount();
    showToast(`${item.name} adicionado ao carrinho`);
  }

  function setLineQty(id, qty) {
    const line = state.cart.find((l) => l.lineId === id);
    if (!line) return;
    if (qty <= 0) {
      state.cart = state.cart.filter((l) => l.lineId !== id);
    } else {
      line.qty = qty;
    }
    renderCart();
    updateCartCount();
  }

  function removeLine(id) {
    state.cart = state.cart.filter((l) => l.lineId !== id);
    renderCart();
    updateCartCount();
  }

  function clearCart() {
    state.cart = [];
    renderCart();
    updateCartCount();
  }

  function cartTotals() {
    let subtotal = 0;
    let itemCount = 0;
    let hasOnRequest = false;

    state.cart.forEach((line) => {
      itemCount += line.qty;

      if (line.isCustom) {
        hasOnRequest = true;
        return;
      }

      const product = findProduct(line.productId);
      if (!isPriceKnown(product)) {
        hasOnRequest = true;
        return;
      }
      subtotal += unitPrice(product, line.variantId) * line.qty;
    });

    return { subtotal, itemCount, hasOnRequest };
  }

  function updateCartCount() {
    const { itemCount } = cartTotals();
    els.cartCount.textContent = String(itemCount);
    els.cartCount.dataset.empty = String(itemCount === 0);
  }

  /* Render de combos (Upsell) */
  function renderCartUpsell() {
    if (!els.upsellList || !els.cartUpsell) return;

    if (state.cart.length === 0) {
      els.cartUpsell.style.display = "none";
      return;
    }
    els.cartUpsell.style.display = "block";

    els.upsellList.innerHTML = quickAddItems
      .map((item) => {
        const priceDisplay =
          typeof item.price === "number"
            ? `+ R$ ${item.price.toFixed(2).replace(".", ",")}`
            : item.price;

        return `
        <div class="upsell-card">
          <div class="upsell-info">
            <span class="upsell-name">${item.name}</span>
            <span class="upsell-price">${priceDisplay}</span>
          </div>
          <button type="button" class="btn-upsell-add" data-upsell-id="${item.id}">
            + Adicionar
          </button>
        </div>
      `;
      })
      .join("");

    els.upsellList.querySelectorAll("[data-upsell-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        addQuickUpsellItem(btn.dataset.upsellId);
      });
    });
  }

  /* Render do drawer do carrinho */
  function renderCart() {
    if (state.cart.length === 0) {
      els.cartBody.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <p>Seu carrinho está vazio.</p>
        </div>`;
      els.cartFooter.innerHTML = "";
      renderCartUpsell();
      return;
    }

    els.cartBody.innerHTML = state.cart
      .map((line) => {
        if (line.isCustom) {
          return `
          <div class="cart-item" data-line="${line.lineId}">
            <div class="cart-item-media" style="display:flex;align-items:center;justify-content:center;background:#131316;border:1px solid var(--panel-line);border-radius:var(--radius-sm);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" style="color:var(--red-bright);"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            </div>
            <div class="cart-item-info">
              <span class="cart-item-name">${line.customName}</span>
              <span class="cart-item-variant">Combo adicional</span>
              <span class="cart-item-price">Sob consulta</span>
              <div class="qty-stepper">
                <button type="button" data-qty-step="-1">−</button>
                <span>${line.qty}</span>
                <button type="button" data-qty-step="1">+</button>
              </div>
            </div>
            <div class="cart-item-remove">
              <button type="button" data-remove aria-label="Remover item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </button>
            </div>
          </div>`;
        }

        const product = findProduct(line.productId);
        const variant = product.variants ? getVariant(product, line.variantId) : null;
        const priceKnown = isPriceKnown(product);
        const unit = priceKnown ? unitPrice(product, line.variantId) : 0;

        return `
        <div class="cart-item" data-line="${line.lineId}">
          <div class="cart-item-media">
            <img src="${product.image}" alt="${product.name}" />
          </div>
          <div class="cart-item-info">
            <span class="cart-item-name">${product.name}</span>
            ${
              variant
                ? `<span class="cart-item-variant">${variant.label}</span>`
                : ""
            }
            <span class="cart-item-price">${
              priceKnown ? formatBRL(unit) : "Valor a combinar"
            }</span>
            <div class="qty-stepper">
              <button type="button" data-qty-step="-1">−</button>
              <span>${line.qty}</span>
              <button type="button" data-qty-step="1">+</button>
            </div>
          </div>
          <div class="cart-item-remove">
            <button type="button" data-remove aria-label="Remover ${product.name}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </div>`;
      })
      .join("");

    els.cartBody.querySelectorAll(".cart-item").forEach((el) => {
      const id = el.dataset.line;
      const line = state.cart.find((l) => l.lineId === id);

      el.querySelectorAll("[data-qty-step]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const step = parseInt(btn.dataset.qtyStep, 10);
          setLineQty(id, line.qty + step);
        });
      });

      el.querySelector("[data-remove]").addEventListener("click", () => {
        removeLine(id);
      });
    });

    const { subtotal, itemCount, hasOnRequest } = cartTotals();

    els.cartFooter.innerHTML = `
      <div class="summary-row">
        <span>Itens</span>
        <span>${itemCount}</span>
      </div>
      <div class="summary-row total">
        <span>Subtotal</span>
        <span>${formatBRL(subtotal)}</span>
      </div>
      ${
        hasOnRequest
          ? `<span class="summary-note">+ itens com valor a combinar (confirme com a loja)</span>`
          : ""
      }
      <div class="drawer-footer-actions">
        <a href="#" id="checkoutBtn" class="btn btn-whatsapp btn-block" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.6 6.32A8.86 8.86 0 0 0 12 4.1a8.94 8.94 0 0 0-7.75 13.4L3 21l3.6-1.2a8.9 8.9 0 0 0 5.4 1.82h.02A8.94 8.94 0 0 0 21 12.75a8.87 8.87 0 0 0-3.4-6.43zm-5.6 13.7a7.4 7.4 0 0 1-3.78-1.04l-.27-.16-2.8.94.75-2.73-.18-.28a7.42 7.42 0 1 1 13.8-3.9 7.43 7.43 0 0 1-7.52 7.17zm4.07-5.56c-.22-.11-1.32-.65-1.53-.73-.2-.08-.35-.11-.5.11-.15.22-.57.73-.7.88-.13.15-.26.16-.48.05a6.1 6.1 0 0 1-1.8-1.11 6.7 6.7 0 0 1-1.24-1.55c-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.08-.15.04-.28-.02-.39-.06-.11-.5-1.2-.68-1.65-.18-.43-.36-.37-.5-.38h-.43a.83.83 0 0 0-.6.28 2.5 2.5 0 0 0-.79 1.87c0 1.1.8 2.16.91 2.31.11.15 1.57 2.4 3.8 3.36.53.23.94.37 1.27.47.53.17 1.01.15 1.4.09.43-.06 1.32-.54 1.5-1.06.19-.52.19-.96.13-1.06-.06-.1-.2-.15-.42-.26z"/></svg>
          Finalizar pedido pelo WhatsApp
        </a>
        <button type="button" class="link-clear" id="clearCartBtn">Limpar carrinho</button>
      </div>
    `;

    document.getElementById("checkoutBtn").addEventListener("click", (e) => {
      e.preventDefault();
      const message = buildWhatsAppMessage();
      window.open(waLink(message), "_blank", "noopener");
    });

    document.getElementById("clearCartBtn").addEventListener("click", () => {
      clearCart();
    });

    renderCartUpsell();
  }

  /* Mensagem de WhatsApp */
  function buildWhatsAppMessage() {
    const { subtotal, hasOnRequest } = cartTotals();
    const lines = [`Olá, ${CONFIG.OWNER_NAME}! Gostaria de fazer um pedido na ${CONFIG.STORE_NAME}:`, ""];

    state.cart.forEach((line) => {
      if (line.isCustom) {
        lines.push(`• ${line.qty}x ${line.customName} — valor sob consulta`);
        return;
      }

      const product = findProduct(line.productId);
      const variant = product.variants ? getVariant(product, line.variantId) : null;
      const priceKnown = isPriceKnown(product);
      const unit = priceKnown ? unitPrice(product, line.variantId) : null;

      let itemLine = `• ${line.qty}x ${product.name}`;
      if (variant) itemLine += ` (${variant.label})`;
      if (priceKnown) {
        itemLine += ` — ${formatBRL(unit * line.qty)}`;
      } else {
        itemLine += ` — valor a combinar`;
      }
      lines.push(itemLine);
    });

    lines.push("");
    lines.push(`Total: ${formatBRL(subtotal)}${hasOnRequest ? " + itens a combinar" : ""}`);
    lines.push("");
    lines.push(
      "Gostaria de saber a disponibilidade e como posso realizar a compra."
    );

    return lines.join("\n");
  }

  /* Drawer */
  function openDrawer() {
    els.drawer.classList.add("is-open");
    els.overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    renderCartUpsell();
  }

  function closeDrawer() {
    els.drawer.classList.remove("is-open");
    els.overlay.classList.remove("is-open");
    if (!els.modal.classList.contains("is-open")) {
      document.body.style.overflow = "";
    }
  }

  /* Eventos globais */
  function initHeaderScroll() {
    const onScroll = () => {
      els.header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initNavToggle() {
    els.navToggle.addEventListener("click", () => {
      const isOpen = els.mainNav.classList.toggle("is-open");
      els.navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    els.mainNav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        els.mainNav.classList.remove("is-open");
        els.navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initCartUI() {
    els.cartToggle.addEventListener("click", openDrawer);
    els.cartCloseBtn.addEventListener("click", closeDrawer);
    els.overlay.addEventListener("click", () => {
      closeDrawer();
      closeModal();
    });
  }

  function initModalUI() {
    els.modalCloseBtn.addEventListener("click", closeModal);
    els.modal.addEventListener("click", (e) => {
      if (e.target === els.modal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
        closeDrawer();
      }
    });
  }

  function initWhatsAppButtons() {
    const link = waLink(CONFIG.WHATSAPP_DEFAULT_MESSAGE);
    els.floatWaBtn.href = link;
    els.contactWaBtn.href = link;
    els.contactPhoneDisplay.textContent = formatPhoneDisplay(CONFIG.WHATSAPP_NUMBER);
  }

  /* Inicialização */
  function init() {
    els.year.textContent = new Date().getFullYear();
    renderFilters();
    renderGrid();
    renderCart();
    updateCartCount();
    initHeaderScroll();
    initNavToggle();
    initCartUI();
    initModalUI();
    initWhatsAppButtons();
  }

  document.addEventListener("DOMContentLoaded", init);
})();

/* Simulador Kelvin */
const kelvinData = {
  3000: {
    hud: "3000K · AMARELO",
    title: "3000K — Amarelo Ouro (Penetração Máxima)",
    desc: "Projetada para quebrar o reflexo de gotículas de água e partículas em suspensão. É a opção técnica definitiva para chuva pesada, neblina e asfalto molhado.",
    app: "Faróis de neblina/milha e veículos de viagem/estrada frequente.",
    contrast: "Penetração superior em mau tempo, sem rebater a luz contra os olhos.",
    beam: "radial-gradient(ellipse at bottom, rgba(255, 210, 80, 0.95) 0%, rgba(255, 170, 0, 0.5) 45%, transparent 75%)",
  },
  4300: {
    hud: "4300K · BRANCO QUENTE",
    title: "4300K — Branco Quente (Padrão Original de Fábrica)",
    desc: "A mesma tonalidade dos faróis de xênon e LED originais de montadora. Proporciona iluminação com excelente índice de reprodução de cor, discreta e sem chamar atenção em fiscalizações.",
    app: "Farol principal de quem busca máxima discrição com alta eficiência.",
    contrast: "Excelente leitura de relevo e buracos em asfalto escuro.",
    beam: "radial-gradient(ellipse at bottom, rgba(255, 248, 220, 0.95) 0%, rgba(255, 230, 170, 0.45) 45%, transparent 75%)",
  },
  6000: {
    hud: "6000K · BRANCO PURO",
    title: "6000K — Branco Puro (O Mais Procurado)",
    desc: "É a escolha mais popular e moderna. Oferece visual esportivo de alta definição, realçando placas reflexivas e faixas de trânsito em vias pavimentadas sem esforço visual.",
    app: "Uso urbano, rodovias bem pavimentadas e estética esportiva moderna.",
    contrast: "Alto realce de placas de sinalização e olhos de gato.",
    beam: "radial-gradient(ellipse at bottom, rgba(235, 245, 255, 0.95) 0%, rgba(180, 215, 255, 0.5) 45%, transparent 75%)",
  },
};

const kButtons = document.querySelectorAll(".k-btn");
const kelvinBeam = document.getElementById("kelvinBeam");
const hudValue = document.getElementById("hudValue");
const infoTitle = document.getElementById("infoTitle");
const infoDesc = document.getElementById("infoDesc");
const infoSpecs = document.getElementById("infoSpecs");

kButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    kButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const k = btn.dataset.kelvin;
    const data = kelvinData[k];

    if (!data) return;

    kelvinBeam.style.background = data.beam;
    hudValue.textContent = data.hud;
    infoTitle.textContent = data.title;
    infoDesc.textContent = data.desc;
    infoSpecs.innerHTML = `
      <li><strong>Aplicação recomendada:</strong> ${data.app}</li>
      <li><strong>Contraste:</strong> ${data.contrast}</li>
    `;
  });
});