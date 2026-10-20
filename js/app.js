(function () {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const rupee = (n) => "₹" + n.toLocaleString("en-IN");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const catById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
  const waLink = (text) => `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(text)}`;
  const thumb = (p) => p.img
    ? `<img src="${p.img}" alt="${esc(p.name)}" loading="lazy" data-icon="${p.icon}" />`
    : p.icon;

  // Product rows on the home page
  const RAILS = [
    { id: "pooja",    cat: "pooja",    title: "Pooja samagri bestsellers", hi: "पूजा सामग्री", pick: (p) => p.cat === "pooja" },
    { id: "kits",     cat: "kits",     title: "Festival pooja kits",      hi: "पूजा किट",     pick: (p) => p.cat === "kits" },
    { id: "staples",  cat: "staples",  title: "Monthly grocery",          hi: "महीने का राशन", pick: (p) => ["staples", "ghee", "masala"].includes(p.cat) },
    { id: "dryfruit", cat: "dryfruit", title: "Dry fruits & prasad",      hi: "मेवे और प्रसाद", pick: (p) => p.cat === "dryfruit" },
    { id: "snacks",   cat: "snacks",   title: "Namkeen & Malwa specials", hi: "नमकीन",        pick: (p) => p.cat === "snacks" },
  ];

  // ---------- Cart state (saved in the browser) ----------
  const CART_KEY = "mns_cart_v1";
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch (e) { cart = {}; }
  Object.keys(cart).forEach((id) => { if (!byId[id] || cart[id] < 1) delete cart[id]; });
  const save = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} };

  function setQty(id, qty) {
    qty = Math.max(0, Math.min(99, qty));
    if (qty === 0) delete cart[id]; else cart[id] = qty;
    save();
    refreshAll();
  }

  function totals() {
    let items = 0, sub = 0, mrp = 0;
    for (const [id, q] of Object.entries(cart)) {
      const p = byId[id];
      items += q; sub += p.price * q; mrp += (p.mrp || p.price) * q;
    }
    const pickup = $("#checkoutForm input[name=mode]:checked")?.value === "Store Pickup";
    const delivery = items === 0 || pickup || sub >= SHOP.freeDeliveryAbove ? 0 : SHOP.deliveryCharge;
    return { items, sub, mrp, saved: mrp - sub, delivery, total: sub + delivery };
  }

  // Missing product photo -> show the icon instead
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (img.tagName === "IMG" && img.dataset.icon) img.replaceWith(document.createTextNode(img.dataset.icon));
  }, true);

  // ---------- Shop info into the page ----------
  $$("[data-shop]").forEach((el) => { el.textContent = SHOP[el.dataset.shop]; });
  $("#year").textContent = new Date().getFullYear();
  const greet = `Namaste ${SHOP.name} 🙏 `;
  $("#waFloat").href = waLink(greet + "I want to place an order.");
  $("#waHeader").href = waLink(greet + "I need help with an order.");
  $("#waContact").href = waLink(greet);
  $("#customKitBtn").href = waLink(greet + "I want a custom pooja samagri kit. My list is:\n");
  $("#bulkBtn").href = waLink(greet + "I want a bulk pooja order.\nOccasion: \nDate: \nNumber of guests: ");
  $("#askBtn").href = waLink(greet + "Do you have ");
  $("#phoneLink").href = `tel:+91${SHOP.phone}`;
  $("#phoneLink").textContent = `+91 ${SHOP.phone.slice(0, 5)} ${SHOP.phone.slice(5)}`;
  const mapQ = encodeURIComponent(`${SHOP.name}, ${SHOP.address}`);
  const mapFrame = $("#mapFrame");
  if (mapFrame) mapFrame.src = `https://maps.google.com/maps?q=${encodeURIComponent(SHOP.address)}&z=15&output=embed`;
  $("#dirBtn").href = `https://www.google.com/maps/search/?api=1&query=${mapQ}`;
  if (!SHOP.upiId) $("#upiOpt").remove();

  // ---------- Product card ----------
  function ctrlHTML(p) {
    if (p.stock === false) return `<span class="oos">Out of stock</span>`;
    const q = cart[p.id] || 0;
    return q
      ? `<div class="qty"><button data-dec="${p.id}" aria-label="Remove one">−</button><span>${q}</span><button data-inc="${p.id}" aria-label="Add one">+</button></div>`
      : `<button class="add-btn" data-add="${p.id}">ADD</button>`;
  }

  function cardHTML(p) {
    const off = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
    return `
      <article class="card" data-id="${p.id}">
        ${off ? `<span class="off">${off}%<br/>OFF</span>` : ""}
        <div class="card-img tint-${p.cat}">${thumb(p)}</div>
        ${p.tag ? `<span class="card-tag">${esc(p.tag)}</span>` : ""}
        <h3>${esc(p.name)}</h3>
        <span class="hi">${esc(p.hi)}</span>
        <span class="unit">${esc(p.unit)}</span>
        <div class="card-foot">
          <div class="price"><b>${rupee(p.price)}</b>${off ? `<s>${rupee(p.mrp)}</s>` : ""}</div>
          <div class="ctrl">${ctrlHTML(p)}</div>
        </div>
      </article>`;
  }

  function refreshControls() {
    $$(".card").forEach((card) => { $(".ctrl", card).innerHTML = ctrlHTML(byId[card.dataset.id]); });
  }

  // ---------- Categories: header nav, tiles, sidebar, chips, footer ----------
  const count = (id) => PRODUCTS.filter((p) => p.cat === id).length;
  $("#catNav").innerHTML =
    `<a href="#shop" data-f="all">🛍️ All</a>` +
    CATEGORIES.map((c) => `<a href="#shop" data-f="${c.id}">${c.icon} ${esc(c.name)}</a>`).join("");
  $("#catGrid").innerHTML = CATEGORIES.map((c) => `
    <a class="cat" href="#shop" data-f="${c.id}">
      <span class="cat-tile tint-${c.id}">${c.icon}</span>
      <b>${esc(c.name)}</b>
    </a>`).join("");
  $("#sideCats").innerHTML =
    `<button data-f="all"><span class="tint-snacks">🛍️</span>All products</button>` +
    CATEGORIES.map((c) => `<button data-f="${c.id}"><span class="tint-${c.id}">${c.icon}</span>${esc(c.name)} (${count(c.id)})</button>`).join("");
  $("#chips").innerHTML =
    `<button class="chip" data-f="all">All</button>` +
    CATEGORIES.map((c) => `<button class="chip" data-f="${c.id}">${c.icon} ${esc(c.name)}</button>`).join("");
  $("#footCats").innerHTML = CATEGORIES.map((c) => `<a href="#shop" data-f="${c.id}">${esc(c.name)}</a>`).join("");

  // Any element with data-f (category link) filters the catalogue
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-f]");
    if (!t) return;
    $("#search").value = "";
    setFilter(t.dataset.f);
    if (t.tagName === "BUTTON") return; // sidebar / chips are already in the catalogue
    e.preventDefault();
    $("#shop").scrollIntoView({ behavior: "smooth" });
  });

  // ---------- Rails ----------
  $("#rails").innerHTML = RAILS.map((r) => {
    const list = PRODUCTS.filter(r.pick).sort((a, b) => (b.tag ? 1 : 0) - (a.tag ? 1 : 0));
    return `
      <section class="wrap block" id="rail-${r.id}">
        <div class="block-head">
          <h2>${esc(r.title)}<span class="rail-head-sub">${esc(r.hi)}</span></h2>
          <a class="see-all" href="#shop" data-f="${r.cat}">See all ›</a>
        </div>
        <div class="rail-wrap">
          <button class="rail-arrow l" data-scroll="-1" aria-label="Scroll left">‹</button>
          <div class="rail">${list.map(cardHTML).join("")}</div>
          <button class="rail-arrow r" data-scroll="1" aria-label="Scroll right">›</button>
        </div>
      </section>`;
  }).join("");
  $("#rails").addEventListener("click", (e) => {
    const b = e.target.closest("[data-scroll]");
    if (!b) return;
    const rail = $(".rail", b.parentElement);
    rail.scrollBy({ left: Number(b.dataset.scroll) * rail.clientWidth * 0.8, behavior: "smooth" });
  });

  // ---------- Catalogue: filter / search / sort ----------
  let filter = "all";
  function setFilter(f) {
    filter = f;
    $$("#sideCats [data-f], #chips [data-f], #catNav [data-f]").forEach((el) => {
      el.classList.toggle("active", el.dataset.f === f);
    });
    renderShop();
  }

  function renderShop() {
    const q = $("#search").value.trim().toLowerCase();
    let list = PRODUCTS.filter((p) =>
      (q || filter === "all" || p.cat === filter) &&
      (!q || `${p.name} ${p.hi} ${catById[p.cat].name}`.toLowerCase().includes(q))
    );
    const sort = $("#sort").value;
    const disc = (p) => (p.mrp - p.price) / p.mrp;
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    if (sort === "discount") list.sort((a, b) => disc(b) - disc(a));
    $("#shopTitle").textContent = q
      ? `Results for "${$("#search").value.trim()}"`
      : filter === "all" ? "All products" : catById[filter].name;
    $("#productGrid").innerHTML = list.map(cardHTML).join("");
    $("#emptyMsg").hidden = list.length > 0;
  }
  $("#sort").addEventListener("change", renderShop);

  let jumped = false;
  $("#search").addEventListener("input", () => {
    renderShop();
    const top = $("#shop").getBoundingClientRect().top;
    if (!jumped && $("#search").value && (top > innerHeight || top < 0)) {
      $("#shop").scrollIntoView({ behavior: "smooth" });
      jumped = true;
    }
    if (!$("#search").value) jumped = false;
  });

  // Rotating search hint
  const hints = ["kapoor", "ghee batti", "hawan samagri", "atta", "kaju", "दाल", "Diwali kit"];
  let hint = 0;
  setInterval(() => {
    if (document.activeElement === $("#search")) return;
    hint = (hint + 1) % hints.length;
    $("#search").placeholder = `Search "${hints[hint]}"`;
  }, 2500);

  // ---------- Add / + / − anywhere ----------
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-add],[data-inc],[data-dec]");
    if (!t) return;
    if (t.dataset.add) {
      setQty(t.dataset.add, (cart[t.dataset.add] || 0) + 1);
      toast(`✅ ${byId[t.dataset.add].name} added`);
      const cb = $("#openCart"); cb.classList.remove("bump"); void cb.offsetWidth; cb.classList.add("bump");
    }
    if (t.dataset.inc) setQty(t.dataset.inc, (cart[t.dataset.inc] || 0) + 1);
    if (t.dataset.dec) setQty(t.dataset.dec, (cart[t.dataset.dec] || 0) - 1);
  });

  // ---------- Banner slider ----------
  const slides = $("#slides"), n = slides.children.length;
  let cur = 0, timer;
  $("#dots").innerHTML = [...Array(n)].map((_, i) => `<button aria-label="Banner ${i + 1}"></button>`).join("");
  function go(i) {
    cur = (i + n) % n;
    slides.style.transform = `translateX(-${cur * 100}%)`;
    $$("#dots button").forEach((d, j) => d.classList.toggle("on", j === cur));
  }
  const auto = () => { clearInterval(timer); timer = setInterval(() => go(cur + 1), 5000); };
  $("#prevSlide").addEventListener("click", () => { go(cur - 1); auto(); });
  $("#nextSlide").addEventListener("click", () => { go(cur + 1); auto(); });
  $("#dots").addEventListener("click", (e) => {
    const i = $$("#dots button").indexOf(e.target);
    if (i > -1) { go(i); auto(); }
  });
  $("#slider").addEventListener("mouseenter", () => clearInterval(timer));
  $("#slider").addEventListener("mouseleave", auto);
  let x0 = null;
  $("#slider").addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  $("#slider").addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) { go(cur + (dx < 0 ? 1 : -1)); auto(); }
    x0 = null;
  });
  go(0); auto();

  // ---------- Cart drawer ----------
  function renderCart() {
    const t = totals();
    const ids = Object.keys(cart);

    // Header button + mobile bar
    const label = `${t.items} item${t.items === 1 ? "" : "s"}`;
    $("#cartBtnText").innerHTML = t.items ? `${label}<small>${rupee(t.sub)}</small>` : "My Cart";
    $("#cartCount").textContent = t.items;
    $("#cartCount").hidden = !t.items;
    $("#cartBar").hidden = !t.items;
    document.body.classList.toggle("has-cart", t.items > 0);
    $("#cartBarItems").textContent = label;
    $("#cartBarTotal").textContent = rupee(t.sub);

    $("#cartItems").innerHTML = ids.length
      ? ids.map((id) => {
          const p = byId[id], q = cart[id];
          return `
            <div class="cart-item">
              <div class="ci-img tint-${p.cat}">${thumb(p)}</div>
              <div class="ci-info"><b>${esc(p.name)}</b><small>${esc(p.unit)}</small><span class="ci-price">${rupee(p.price * q)}</span></div>
              <div class="qty"><button data-dec="${id}" aria-label="Remove one">−</button><span>${q}</span><button data-inc="${id}" aria-label="Add one">+</button></div>
            </div>`;
        }).join("")
      : `<div class="cart-empty"><span>🛒</span><b>Your cart is empty</b><br/>Add pooja samagri or grocery to get started.</div>`;

    $("#freeBox").hidden = $("#bill").hidden = $("#cartFoot").hidden = !ids.length;
    const left = SHOP.freeDeliveryAbove - t.sub;
    $("#freeFill").style.width = Math.min(100, (t.sub / SHOP.freeDeliveryAbove) * 100) + "%";
    $("#freeMsg").textContent = left > 0 ? `🚚 Add ${rupee(left)} more for FREE delivery` : "🎉 Yay! You get FREE delivery";
    $("#subTotal").textContent = rupee(t.mrp);
    $("#saved").textContent = "−" + rupee(t.saved);
    $("#saveRow").hidden = t.saved <= 0;
    $("#delCharge").textContent = t.delivery ? rupee(t.delivery) : "FREE";
    $("#grandTotal").textContent = rupee(t.total);
    $("#checkoutTotal").textContent = rupee(t.total);
    const btn = $("#checkoutBtn");
    btn.disabled = t.sub < SHOP.minOrder;
    $("#checkoutLabel").textContent = btn.disabled ? `Minimum order ${rupee(SHOP.minOrder)}` : "Proceed to checkout ›";
  }

  function refreshAll() { refreshControls(); renderCart(); renderSummary(); }

  const drawer = $("#drawer"), overlay = $("#overlay");
  function openCart() { drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); overlay.hidden = false; }
  function closeCart() { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); overlay.hidden = true; }
  $("#openCart").addEventListener("click", openCart);
  $("#cartBar").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);

  // ---------- Checkout ----------
  const form = $("#checkoutForm"), modal = $("#checkout");
  try {
    const saved = JSON.parse(localStorage.getItem("mns_customer") || "{}");
    ["name", "phone", "address"].forEach((k) => { if (saved[k]) form[k].value = saved[k]; });
  } catch (e) {}

  function renderSummary() {
    const t = totals();
    $("#summary").innerHTML = `
      <div><span>${t.items} item(s)</span><span>${rupee(t.sub)}</span></div>
      <div><span>Delivery</span><span>${t.delivery ? rupee(t.delivery) : "FREE"}</span></div>
      <div class="total"><span>Total to pay</span><span>${rupee(t.total)}</span></div>`;
  }

  function closeDone() { modal.hidden = true; form.hidden = false; $("#orderDone").hidden = true; }
  $("#checkoutBtn").addEventListener("click", () => { closeCart(); renderSummary(); modal.hidden = false; form.name.focus(); });
  $("#closeCheckout").addEventListener("click", closeDone);
  $("#doneClose").addEventListener("click", closeDone);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeDone(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeDone(); closeCart(); } });

  form.addEventListener("change", (e) => {
    if (e.target.name === "mode") {
      $("#addrWrap").hidden = e.target.value === "Store Pickup";
      renderSummary(); renderCart();
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const err = $("#formErr");
    const fail = (m) => { err.textContent = m; err.hidden = false; };
    err.hidden = true;
    if (!d.name.trim()) return fail("Please enter your name.");
    if (!/^[6-9]\d{9}$/.test(d.phone.trim())) return fail("Please enter a valid 10-digit mobile number.");
    if (d.mode === "Home Delivery" && d.address.trim().length < 8) return fail("Please enter your full delivery address.");
    const t = totals();
    if (!t.items) return fail("Your cart is empty.");

    try { localStorage.setItem("mns_customer", JSON.stringify({ name: d.name, phone: d.phone, address: d.address })); } catch (e) {}

    const orderNo = "MNS" + Date.now().toString().slice(-6);
    const lines = Object.entries(cart).map(([id, q], i) => {
      const p = byId[id];
      return `${i + 1}. ${p.name} (${p.unit}) × ${q} = ${rupee(p.price * q)}`;
    });
    let msg =
      `🛒 *New Order – ${SHOP.name}*\n` +
      `Order No: ${orderNo}\n\n` +
      `*Items:*\n${lines.join("\n")}\n\n` +
      `Items total: ${rupee(t.sub)}\n` +
      `Delivery: ${t.delivery ? rupee(t.delivery) : "FREE"}\n` +
      `*Total: ${rupee(t.total)}*\n\n` +
      `👤 Name: ${d.name.trim()}\n` +
      `📞 Mobile: ${d.phone.trim()}\n` +
      `🚚 ${d.mode}\n` +
      (d.mode === "Home Delivery" ? `📍 Address: ${d.address.trim()}\n` : "") +
      `🕘 Time: ${d.slot}\n` +
      `💳 Payment: ${d.pay}\n` +
      (d.note.trim() ? `📝 Note: ${d.note.trim()}\n` : "");
    if (d.pay === "UPI" && SHOP.upiId) msg += `\nUPI payment to: ${SHOP.upiId}`;

    // A real link works everywhere; pop-ups are often blocked on phones
    $("#orderNo").textContent = orderNo;
    $("#sendOrder").href = waLink(msg);
    form.hidden = true;
    $("#orderDone").hidden = false;
  });

  $("#sendOrder").addEventListener("click", () => {
    cart = {}; save(); refreshAll();
    setTimeout(closeDone, 300);
    toast("🙏 Thank you! Press Send in WhatsApp to confirm your order.", 5000);
  });

  // ---------- Toast ----------
  let toastTimer;
  function toast(text, ms = 2000) {
    const el = $("#toast");
    el.textContent = text; el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), ms);
  }

  setFilter("all");
  refreshAll();
})();
