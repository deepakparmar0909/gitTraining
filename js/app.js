(function () {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const rupee = (n) => "₹" + n.toLocaleString("en-IN");
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const waLink = (text) => `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(text)}`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- Cart state (saved in the browser) ----------
  const CART_KEY = "mns_cart_v1";
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch (e) { cart = {}; }
  // Drop items that no longer exist in the catalogue
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

  // ---------- Shop info into the page ----------
  $$("[data-shop]").forEach((el) => { el.textContent = SHOP[el.dataset.shop]; });
  $("#year").textContent = new Date().getFullYear();
  const greet = `Namaste ${SHOP.name} 🙏 `;
  $("#waFloat").href = waLink(greet + "I want to place an order.");
  $("#waContact").href = waLink(greet);
  $("#customKitBtn").href = waLink(greet + "I want a custom pooja samagri kit. My list is:\n");
  $("#askBtn").href = waLink(greet + "Do you have ");
  $("#callBtn").href = `tel:+91${SHOP.phone}`;
  $("#phoneLink").href = `tel:+91${SHOP.phone}`;
  $("#phoneLink").textContent = `+91 ${SHOP.phone.slice(0, 5)} ${SHOP.phone.slice(5)}`;
  const mapQ = encodeURIComponent(`${SHOP.name}, ${SHOP.address}`);
  $("#mapFrame").src = `https://maps.google.com/maps?q=${encodeURIComponent(SHOP.address)}&z=15&output=embed`;
  $("#dirBtn").href = `https://www.google.com/maps/search/?api=1&query=${mapQ}`;
  if (!SHOP.upiId) $("#upiOpt").remove();

  // ---------- Categories ----------
  $("#catGrid").innerHTML = CATEGORIES.map((c) => `
    <button class="cat" data-cat="${c.id}">
      <div class="ci">${c.icon}</div>
      <b>${esc(c.name)}</b><small>${esc(c.hi)}</small>
    </button>`).join("");
  $("#catGrid").addEventListener("click", (e) => {
    const b = e.target.closest(".cat");
    if (!b) return;
    if (b.dataset.cat === "kits") { $("#kits").scrollIntoView(); return; }
    setFilter(b.dataset.cat);
    $("#shop").scrollIntoView();
  });

  // ---------- Product cards ----------
  function cardHTML(p) {
    const off = p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
    const q = cart[p.id] || 0;
    const ctrl = q
      ? `<div class="qty"><button data-dec="${p.id}" aria-label="Decrease">−</button><span>${q}</span><button data-inc="${p.id}" aria-label="Increase">+</button></div>`
      : `<button class="add-btn" data-add="${p.id}">ADD</button>`;
    return `
      <article class="card" data-cat="${p.cat}" data-id="${p.id}">
        ${off ? `<span class="badge">${off}% OFF</span>` : ""}
        ${p.tag ? `<span class="tag">${esc(p.tag)}</span>` : ""}
        <div class="card-img">${p.icon}</div>
        <div class="card-body">
          <h3>${esc(p.name)}</h3>
          <span class="hi">${esc(p.hi)}</span>
          <span class="unit">${esc(p.unit)}</span>
          <div class="price-row">
            <div class="price"><b>${rupee(p.price)}</b>${off ? `<s>${rupee(p.mrp)}</s>` : ""}</div>
            <div class="ctrl">${p.stock === false ? `<small>Out of stock</small>` : ctrl}</div>
          </div>
        </div>
      </article>`;
  }

  function refreshControls() {
    $$(".card").forEach((card) => {
      const p = byId[card.dataset.id];
      if (p.stock === false) return;
      const q = cart[p.id] || 0;
      $(".ctrl", card).innerHTML = q
        ? `<div class="qty"><button data-dec="${p.id}" aria-label="Decrease">−</button><span>${q}</span><button data-inc="${p.id}" aria-label="Increase">+</button></div>`
        : `<button class="add-btn" data-add="${p.id}">ADD</button>`;
    });
  }

  // Kits section
  $("#kitGrid").innerHTML = PRODUCTS.filter((p) => p.cat === "kits").map(cardHTML).join("");

  // Shop section with filter / search / sort
  let filter = "all";
  $("#chips").innerHTML =
    `<button class="chip active" data-f="all">All Products</button>` +
    CATEGORIES.map((c) => `<button class="chip" data-f="${c.id}">${c.icon} ${esc(c.name)}</button>`).join("");

  function setFilter(f) {
    filter = f;
    $$(".chip").forEach((c) => c.classList.toggle("active", c.dataset.f === f));
    renderShop();
  }
  $("#chips").addEventListener("click", (e) => { const c = e.target.closest(".chip"); if (c) setFilter(c.dataset.f); });

  function renderShop() {
    const q = $("#search").value.trim().toLowerCase();
    let list = PRODUCTS.filter((p) =>
      (filter === "all" || p.cat === filter) &&
      (!q || (p.name + " " + p.hi + " " + p.cat).toLowerCase().includes(q))
    );
    const sort = $("#sort").value;
    const disc = (p) => (p.mrp - p.price) / p.mrp;
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    if (sort === "discount") list.sort((a, b) => disc(b) - disc(a));
    $("#productGrid").innerHTML = list.map(cardHTML).join("");
    $("#emptyMsg").hidden = list.length > 0;
  }
  $("#search").addEventListener("input", () => { if (filter !== "all" && $("#search").value) setFilter("all"); else renderShop(); });
  $("#sort").addEventListener("change", renderShop);

  // Add / + / − buttons anywhere on the page
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-add],[data-inc],[data-dec]");
    if (!t) return;
    if (t.dataset.add) {
      setQty(t.dataset.add, 1);
      toast(`✅ ${byId[t.dataset.add].name} added to cart`);
      const cc = $("#cartCount"); cc.classList.remove("bump"); void cc.offsetWidth; cc.classList.add("bump");
    }
    if (t.dataset.inc) setQty(t.dataset.inc, (cart[t.dataset.inc] || 0) + 1);
    if (t.dataset.dec) setQty(t.dataset.dec, (cart[t.dataset.dec] || 0) - 1);
  });

  // ---------- Cart drawer ----------
  function renderCart() {
    const t = totals();
    $("#cartCount").textContent = t.items;
    const ids = Object.keys(cart);
    $("#cartItems").innerHTML = ids.length
      ? ids.map((id) => {
          const p = byId[id], q = cart[id];
          return `
            <div class="cart-item">
              <div class="ci-img">${p.icon}</div>
              <div class="ci-info"><b>${esc(p.name)}</b><small>${esc(p.unit)} · ${rupee(p.price)}</small></div>
              <div class="qty"><button data-dec="${id}" aria-label="Decrease">−</button><span>${q}</span><button data-inc="${id}" aria-label="Increase">+</button></div>
              <div class="ci-price">${rupee(p.price * q)}</div>
            </div>`;
        }).join("")
      : `<div class="cart-empty"><span>🛒</span>Your cart is empty.<br/>Add some pooja samagri or groceries.</div>`;
    $("#cartFoot").hidden = !ids.length;
    $("#subTotal").textContent = rupee(t.sub);
    $("#delCharge").textContent = t.delivery ? rupee(t.delivery) : "FREE";
    $("#grandTotal").textContent = rupee(t.total);
    const left = SHOP.freeDeliveryAbove - t.sub;
    $("#freeFill").style.width = Math.min(100, (t.sub / SHOP.freeDeliveryAbove) * 100) + "%";
    $("#freeMsg").textContent = left > 0
      ? `Add ${rupee(left)} more for FREE delivery 🚚`
      : `🎉 You get FREE delivery!${t.saved > 0 ? ` You save ${rupee(t.saved)}.` : ""}`;
    const btn = $("#checkoutBtn");
    btn.disabled = t.sub < SHOP.minOrder;
    btn.textContent = btn.disabled ? `Minimum order ${rupee(SHOP.minOrder)}` : "Proceed to Checkout →";
  }

  function refreshAll() { refreshControls(); renderCart(); renderSummary(); }

  const drawer = $("#drawer"), overlay = $("#overlay");
  function openCart() { drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); overlay.hidden = false; }
  function closeCart() { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); overlay.hidden = true; }
  $("#openCart").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);

  // Mobile menu
  $("#menuBtn").addEventListener("click", () => $("#nav").classList.toggle("open"));
  $$("#nav a").forEach((a) => a.addEventListener("click", () => $("#nav").classList.remove("open")));

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

  $("#checkoutBtn").addEventListener("click", () => { closeCart(); renderSummary(); modal.hidden = false; form.name.focus(); });
  $("#closeCheckout").addEventListener("click", () => closeDone());
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

    // Show a "Send on WhatsApp" button (a real link works everywhere; pop-ups are often blocked)
    $("#orderNo").textContent = orderNo;
    $("#sendOrder").href = waLink(msg);
    form.hidden = true;
    $("#orderDone").hidden = false;
  });

  $("#sendOrder").addEventListener("click", () => {
    cart = {}; save(); refreshAll();
    setTimeout(closeDone, 300);
    toast("🙏 Thank you! Please press Send in WhatsApp to confirm your order.", 5000);
  });
  function closeDone() { modal.hidden = true; form.hidden = false; $("#orderDone").hidden = true; }
  $("#doneClose").addEventListener("click", closeDone);

  // ---------- Toast ----------
  let toastTimer;
  function toast(text, ms = 2200) {
    const el = $("#toast");
    el.textContent = text; el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), ms);
  }

  renderShop();
  refreshAll();
})();
