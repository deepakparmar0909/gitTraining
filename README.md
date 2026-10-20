# Mangilal Nanuram & Sons – Online Store

Website for **Mangilal Nanuram & Sons**, Agar Malwa (MP), a grocery shop that specialises in **Pooja Samagri**.

Customers browse products, add them to the cart and place the order on **WhatsApp**. The order arrives in the shop's WhatsApp with the item list, total, name, phone number and address. You don't need a server, a database or any monthly fees.

## Features
- Pooja Samagri is the first thing customers see, with ready **festival pooja kits** (Diwali, Satyanarayan, Navratri, Griha Pravesh, Rudrabhishek, Hawan, Vivah)
- Full grocery catalogue: ghee & oil, atta/rice/dal, masale, dry fruits, daily essentials, snacks
- Search (English or Hindi), category filters, sorting, discount badges
- Cart that stays in the browser, a free-delivery progress bar and a minimum order amount
- Checkout: home delivery or store pickup, time slot, Cash on Delivery or UPI. The order is sent on WhatsApp.
- "Send your pandit ji's list" button for custom kits
- Floating WhatsApp button, click-to-call, Google Map and directions
- Works on mobile, with Hindi and English text

## ⚠️ Before going live, edit `js/config.js`
| Setting | What to put |
|---|---|
| `phone` | Shop mobile number (10 digits) |
| `whatsapp` | Same number with `91` in front, e.g. `919876543210` |
| `address` | Full shop address (also used for the map) |
| `hours` | Shop timings |
| `upiId` | UPI ID like `shopname@okaxis` (leave `""` to hide the UPI option) |
| `deliveryCharge`, `freeDeliveryAbove`, `minOrder` | Delivery rules in ₹ |

## Updating products / prices
Edit `js/products.js`. Each line is one product:
```js
{ id: 2, cat: "pooja", name: "Kapoor (Camphor) Tablets", hi: "कपूर", unit: "100 g", price: 95, mrp: 120, icon: "🤍", tag: "Bestseller" },
```
- `price` = selling price, `mrp` = printed price (the % OFF badge is calculated automatically)
- `tag` is optional ("Bestseller", "Festival Special", …)
- Add `stock: false` to show an item as out of stock
- Every product needs a unique `id`

The prices in the file are **sample prices**. Please check them against the shop's real rates.

## Run locally
Open `index.html` in any browser.

## Publish free on GitHub Pages
1. Merge this branch into `main`.
2. Go to the repository's **Settings → Pages** and choose **Deploy from a branch → main → / (root)**.
3. The site will be live at `https://<username>.github.io/<repo>/`. You can also connect a custom domain such as `mangilalnanuram.in`.

## Tips to get more sales
- Create a free **Google Business Profile** for the shop and put the website link in it.
- Share the website link in local WhatsApp groups and set it as your WhatsApp Business catalogue link.
- Before every festival (Navratri, Diwali, Shravan), update the kit prices and share the link again.
- Print a QR code of the website on bills and on a board at the shop counter.
