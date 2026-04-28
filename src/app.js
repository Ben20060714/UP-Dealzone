const WHATSAPP_NUMBER = "243820433981";
const STORAGE_KEY = "udbl-prod-cart";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  updateCartCounters();
}

function buildMessage(names) {
  return `salut, ces articles (${names.join(", ")})  m'interessent`;
}

function normalizeWhatsAppNumber(phone) {
  return String(phone ?? "").replace(/\D+/g, "");
}

function flattenNames(cart) {
  return cart.flatMap((item) => Array.from({ length: item.quantity }, () => item.name));
}

function openWhatsApp(phone, names) {
  const destination = normalizeWhatsAppNumber(phone) || WHATSAPP_NUMBER;
  const text = encodeURIComponent(buildMessage(names));
  window.open(`https://wa.me/${destination}?text=${text}`, "_blank", "noopener,noreferrer");
}

function updateCartCounters() {
  const total = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = String(total);
  });
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.name === product.name);

  if (existing) {
    existing.quantity += 1;
    existing.price = product.price;
    existing.category = product.category;
    existing.image = product.image;
    existing.description = product.description;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
}

function collectCardTags(card) {
  return Array.from(card.querySelectorAll(".mt-5 span"))
    .map((tag) => tag.textContent?.trim())
    .filter(Boolean);
}

function ensurePreviewModal() {
  const pageHasCards = document.querySelector("[data-product-name]");
  if (!pageHasCards) return null;

  const existing = document.getElementById("product-preview-modal");
  if (existing) return existing;

  const modal = document.createElement("div");
  modal.id = "product-preview-modal";
  modal.className = "fixed inset-0 z-50 hidden items-center justify-center overflow-y-auto bg-black/80 px-4 py-8 backdrop-blur-xl";
  modal.innerHTML = `
    <div class="absolute inset-0" data-close-modal></div>
    <section role="dialog" aria-modal="true" class="relative z-10 flex w-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/95 shadow-panel lg:grid-cols-[1.05fr_0.95fr]">
      <div class="relative min-h-[26rem] overflow-hidden bg-slate-900">
        <img data-modal-image src="" alt="" class="h-full w-full rounded-2xl object-cover">
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"></div>
        <div class="absolute inset-x-0 bottom-0 p-6">
          <p data-modal-category class="text-xs font-extrabold uppercase tracking-[0.3em] text-coral-soft"></p>
          <h2 data-modal-title class="mt-3 font-display text-4xl leading-none text-white md:text-5xl"></h2>
        </div>
      </div>
      <div class="relative flex min-h-[26rem] flex-col gap-6 p-6 md:p-8">
        <button type="button" data-close-modal class="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-white/10 text-xl font-bold text-white transition hover:bg-white/20">×</button>
        <div class="mt-4 flex flex-wrap gap-3 hidden">
          <button type="button" data-modal-view="preview" class="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-bold text-white">Aperçu</button>
          <button type="button" data-modal-view="demo" class="rounded-full border border-white/12 bg-transparent px-4 py-2 text-sm font-bold text-paper/72">Demo</button>
        </div>

        <div data-modal-panel="preview" class="mt-4 space-y-6">
          <div class="flex flex-wrap items-center gap-3">
            <span data-modal-price class="rounded-full bg-coral/14 px-4 py-2 text-sm font-extrabold text-coral-soft"></span>
            <span class="rounded-full border border-white/12 px-4 py-2 text-sm font-bold text-paper/70">Disponibilité en vitrine</span>
          </div>
          <div class="rounded-[1.7rem] border border-white/10 bg-white/5 p-5">
            <p data-modal-description class="text-sm leading-7 text-paper/72"></p>
          </div>
          <div data-modal-tags class="flex flex-wrap gap-2"></div>
        </div>

        <div data-modal-panel="demo" class="mt-4 hidden space-y-6">
          <div class="rounded-[1.7rem] border border-white/10 bg-white/5 p-5">
            <p class="text-xs font-extrabold uppercase tracking-[0.3em] text-violet-soft">présentation</p>
            <p data-modal-demo-copy class="mt-4 text-sm leading-7 text-paper/72"></p>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-[1.4rem] border border-white/10 bg-slate-900/70 p-4">
              <p class="text-xs font-extrabold uppercase tracking-[0.2em] text-paper/50">Catégorie</p>
              <p data-modal-demo-category class="mt-2 text-lg font-extrabold text-white"></p>
            </div>
            <div class="rounded-[1.4rem] border border-white/10 bg-slate-900/70 p-4">
              <p class="text-xs font-extrabold uppercase tracking-[0.2em] text-paper/50">Prix</p>
              <p data-modal-demo-price class="mt-2 text-lg font-extrabold text-white"></p>
            </div>
          </div>
        </div>

        <div class="mt-auto flex flex-wrap justify-center gap-3 sm:grid-cols-2">
          <button type="button" data-modal-order class="rounded-2xl bg-green-600 px-5 py-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-green-500">Commander</button>
          <button type="button" data-modal-cart class="rounded-2xl border border-white/12 bg-white/10 px-5 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/12">Ajouter au panier</button>
        </div>
      </div>
    </section>
  `;

  document.body.appendChild(modal);
  return modal;
}

function bindPreviewModal() {
  const modal = ensurePreviewModal();
  if (!modal) return;

  const imageNode = modal.querySelector("[data-modal-image]");
  const categoryNode = modal.querySelector("[data-modal-category]");
  const titleNode = modal.querySelector("[data-modal-title]");
  const priceNode = modal.querySelector("[data-modal-price]");
  const descriptionNode = modal.querySelector("[data-modal-description]");
  const tagsNode = modal.querySelector("[data-modal-tags]");
  const demoCopyNode = modal.querySelector("[data-modal-demo-copy]");
  const demoCategoryNode = modal.querySelector("[data-modal-demo-category]");
  const demoPriceNode = modal.querySelector("[data-modal-demo-price]");
  const panels = modal.querySelectorAll("[data-modal-panel]");
  const viewButtons = modal.querySelectorAll("[data-modal-view]");
  const orderButton = modal.querySelector("[data-modal-order]");
  const cartButton = modal.querySelector("[data-modal-cart]");

  let activeProduct = null;

  function setActiveView(view) {
    panels.forEach((panel) => {
      panel.classList.toggle("hidden", panel.dataset.modalPanel !== view);
    });

    viewButtons.forEach((button) => {
      const isActive = button.dataset.modalView === view;
      button.classList.toggle("bg-white/10", isActive);
      button.classList.toggle("text-white", isActive);
      button.classList.toggle("bg-transparent", !isActive);
      button.classList.toggle("text-paper/72", !isActive);
    });
  }

  function closeModal() {
    modal.classList.replace("flex", "hidden");
    modal.classList.remove("flex");
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }

  function openModal(product) {
    activeProduct = product;
    imageNode.src = product.image || "";
    imageNode.alt = product.name || "Prévisualisation de produit";
    categoryNode.textContent = product.category || "";
    titleNode.textContent = product.name || "";
    priceNode.textContent = product.price || "";
    descriptionNode.textContent = product.description || "";
    demoCopyNode.textContent = product.name
      ? `${product.name} se prete a une presentation vitrine, un partage catalogue ou une demonstration directe au client avant commande.`
      : "";
    demoCategoryNode.textContent = product.category || "";
    demoPriceNode.textContent = product.price || "";
    tagsNode.innerHTML = Array.isArray(product.tags)
      ? product.tags
          .map((tag) => `<span class="rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-paper/70">${escapeHtml(tag)}</span>`)
          .join("")
      : "";

    setActiveView("preview");
    modal.classList.replace("hidden", "flex");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.classList.add("overflow-hidden");
  }

  document.querySelectorAll("[data-product-name]").forEach((card) => {
    card.querySelector("[data-open-preview]")?.addEventListener("click", () => {
      openModal({
        name: card.dataset.productName,
        price: card.dataset.productPrice,
        category: card.dataset.productCategory,
        image: card.dataset.productImage,
        description: card.dataset.productDescription,
        phone: card.dataset.productPhone,
        tags: collectCardTags(card)
      });
    });
  });

  modal.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.hasAttribute("data-close-modal")) {
      closeModal();
    }
  });

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveView(button.dataset.modalView);
    });
  });

  orderButton?.addEventListener("click", () => {
    if (!activeProduct) return;
    openWhatsApp(activeProduct.phone, [activeProduct.name]);
  });

  cartButton?.addEventListener("click", () => {
    if (!activeProduct) return;
    addToCart(activeProduct);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("flex")) {
      closeModal();
    }
  });
}

function bindProductCards() {
  document.querySelectorAll("[data-product-name]").forEach((card) => {
    const product = {
      name: card.dataset.productName,
      price: card.dataset.productPrice,
      category: card.dataset.productCategory,
      image: card.dataset.productImage,
      description: card.dataset.productDescription,
      phone: card.dataset.productPhone,
      tags: collectCardTags(card)
    };

    card.querySelector("[data-add-to-cart]")?.addEventListener("click", () => {
      addToCart(product);
    });

    card.querySelector("[data-order-now]")?.addEventListener("click", () => {
      openWhatsApp(product.phone, [product.name]);
    });
  });
}

function renderCartImage(item) {
  if (!item.image) {
    return `
      <div class="grid h-24 w-24 place-items-center rounded-[1.4rem] border border-white/10 bg-white/6 text-xs font-extrabold uppercase tracking-[0.2em] text-paper/45">
        UDBL
      </div>
    `;
  }

  return `
    <div class="h-24 w-24 overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/6">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="h-full w-full object-cover">
    </div>
  `;
}

function renderCartPage() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  const emptyState = document.getElementById("cart-empty-state");
  const totalNode = document.getElementById("cart-total-items");
  const previewNode = document.getElementById("cart-message-preview");
  const sendButton = document.getElementById("send-cart-whatsapp");
  const clearButton = document.getElementById("clear-cart");
  const cart = getCart();
  const names = flattenNames(cart);
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);

  totalNode.textContent = String(total);
  previewNode.textContent = buildMessage(names);
  container.innerHTML = "";

  if (cart.length === 0) {
    emptyState.classList.remove("hidden");
    sendButton.disabled = true;
    sendButton.classList.add("opacity-50", "cursor-not-allowed");
    return;
  }

  emptyState.classList.add("hidden");
  sendButton.disabled = false;
  sendButton.classList.remove("opacity-50", "cursor-not-allowed");

  cart.forEach((item) => {
    const row = document.createElement("article");
    row.className = "grid gap-4 rounded-[1.7rem] border border-white/10 bg-black/20 p-5 lg:grid-cols-[1fr_auto]";
    row.innerHTML = `
      <div class="flex items-start gap-4">
        ${renderCartImage(item)}
        <div class="min-w-0">
          <p class="text-xs font-extrabold uppercase tracking-[0.2em] text-paper/50">${escapeHtml(item.category || "Produit")}</p>
          <h3 class="mt-2 text-xl font-extrabold text-white">${escapeHtml(item.name)}</h3>
          <p class="mt-2 text-sm text-paper/60">${escapeHtml(item.price || "")} · ${item.quantity} article(s)</p>
          ${item.description ? `<p class="mt-3 text-sm leading-6 text-paper/62">${escapeHtml(item.description)}</p>` : ""}
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2 lg:justify-end">
        <button data-action="decrease" data-name="${escapeHtml(item.name)}" class="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/8 text-lg font-extrabold text-white">-</button>
        <span class="min-w-10 text-center text-lg font-extrabold text-white">${item.quantity}</span>
        <button data-action="increase" data-name="${escapeHtml(item.name)}" class="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/8 text-lg font-extrabold text-white">+</button>
        <button data-action="remove" data-name="${escapeHtml(item.name)}" class="rounded-full bg-coral/15 px-4 py-2 text-sm font-bold text-coral-soft">Retirer</button>
      </div>
    `;
    container.appendChild(row);
  });

  container.onclick = (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    const button = event.target.closest("button");
    if (!button) return;

    const cartState = getCart();
    const item = cartState.find((entry) => entry.name === button.dataset.name);
    if (!item) return;

    if (button.dataset.action === "increase") item.quantity += 1;
    if (button.dataset.action === "decrease") item.quantity -= 1;
    if (button.dataset.action === "remove") item.quantity = 0;

    const nextCart = cartState.filter((entry) => entry.quantity > 0);
    saveCart(nextCart);
    renderCartPage();
  };

  sendButton.onclick = () => {
    const currentNames = flattenNames(getCart());
    if (currentNames.length) openWhatsApp(currentNames);
  };

  clearButton.onclick = () => {
    saveCart([]);
    renderCartPage();
  };
}

updateCartCounters();
bindProductCards();
bindPreviewModal();
bindMobileMenu();
renderCartPage();

function bindMobileMenu() {
  const menuButton = document.querySelector("[data-mobile-menu-button]");
  const mobileMenu = document.getElementById("mobile-menu");
  if (!menuButton || !mobileMenu) return;

  const closeMobileMenu = () => {
    mobileMenu.classList.add("hidden");
    menuButton.setAttribute("aria-expanded", "false");
  };

  menuButton.addEventListener("click", () => {
    const isHidden = mobileMenu.classList.toggle("hidden");
    menuButton.setAttribute("aria-expanded", String(!isHidden));
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  document.addEventListener("click", (event) => {
    if (mobileMenu.classList.contains("hidden")) return;
    if (!(event.target instanceof HTMLElement)) return;
    if (event.target.closest("#mobile-menu") || event.target.closest("[data-mobile-menu-button]")) return;
    closeMobileMenu();
  });
}
