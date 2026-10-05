// ============================================================
//  PRODUCT CATALOGUE — add / edit / remove items here.
//  price = selling price, mrp = printed price (for discount badge)
//  Set "stock: false" to show an item as out of stock.
// ============================================================
const CATEGORIES = [
  { id: "pooja",    name: "Pooja Samagri",     hi: "पूजा सामग्री",   icon: "🪔" },
  { id: "kits",     name: "Festival Kits",     hi: "पूजा किट",       icon: "🎁" },
  { id: "ghee",     name: "Ghee & Oil",        hi: "घी और तेल",      icon: "🫙" },
  { id: "staples",  name: "Atta, Rice & Dal",  hi: "आटा, चावल, दाल", icon: "🌾" },
  { id: "masala",   name: "Masale",            hi: "मसाले",          icon: "🌶️" },
  { id: "dryfruit", name: "Dry Fruits",        hi: "मेवे",           icon: "🥜" },
  { id: "daily",    name: "Daily Essentials",  hi: "रोज़मर्रा",       icon: "🧼" },
  { id: "snacks",   name: "Snacks & Sweets",   hi: "नमकीन, मिठाई",   icon: "🍪" },
];

const PRODUCTS = [
  // ---------- Pooja Samagri (main USP) ----------
  { id: 1,  cat: "pooja", name: "Pure Desi Ghee Diya Batti (100 pcs)", hi: "घी बत्ती", unit: "1 pack", price: 60, mrp: 80, icon: "🪔", tag: "Bestseller" },
  { id: 2,  cat: "pooja", name: "Kapoor (Camphor) Tablets", hi: "कपूर", unit: "100 g", price: 95, mrp: 120, icon: "🤍", tag: "Bestseller" },
  { id: 3,  cat: "pooja", name: "Agarbatti – Chandan", hi: "अगरबत्ती चंदन", unit: "100 sticks", price: 45, mrp: 55, icon: "🕯️" },
  { id: 4,  cat: "pooja", name: "Dhoop Batti – Guggal", hi: "गुग्गल धूप", unit: "1 box", price: 40, mrp: 50, icon: "💨" },
  { id: 5,  cat: "pooja", name: "Roli (Kumkum)", hi: "रोली / कुमकुम", unit: "100 g", price: 30, mrp: 40, icon: "🔴" },
  { id: 6,  cat: "pooja", name: "Chandan Powder", hi: "चंदन पाउडर", unit: "50 g", price: 70, mrp: 90, icon: "🟤" },
  { id: 7,  cat: "pooja", name: "Kalawa / Mauli Dhaga", hi: "कलावा / मौली", unit: "5 rolls", price: 25, mrp: 30, icon: "🧶" },
  { id: 8,  cat: "pooja", name: "Janeu (Yagyopavit)", hi: "जनेऊ", unit: "2 pcs", price: 20, mrp: 25, icon: "🪢" },
  { id: 9,  cat: "pooja", name: "Hawan Samagri", hi: "हवन सामग्री", unit: "500 g", price: 80, mrp: 100, icon: "🔥", tag: "Pure" },
  { id: 10, cat: "pooja", name: "Gangajal", hi: "गंगाजल", unit: "250 ml", price: 35, mrp: 45, icon: "💧" },
  { id: 11, cat: "pooja", name: "Mitti ke Diye (Clay Diya)", hi: "मिट्टी के दीये", unit: "12 pcs", price: 30, mrp: 40, icon: "🪔" },
  { id: 12, cat: "pooja", name: "Supari (Pooja)", hi: "पूजा सुपारी", unit: "100 g", price: 50, mrp: 60, icon: "🌰" },
  { id: 13, cat: "pooja", name: "Abir Gulal (Mixed)", hi: "अबीर गुलाल", unit: "4 × 50 g", price: 60, mrp: 80, icon: "🌈" },
  { id: 14, cat: "pooja", name: "Sindoor", hi: "सिंदूर", unit: "50 g", price: 25, mrp: 30, icon: "🟥" },
  { id: 15, cat: "pooja", name: "Haldi Gaanth (Whole)", hi: "हल्दी गांठ", unit: "100 g", price: 30, mrp: 40, icon: "🟡" },
  { id: 16, cat: "pooja", name: "Panchmeva Prasad Mix", hi: "पंचमेवा", unit: "200 g", price: 160, mrp: 200, icon: "🥥" },
  { id: 17, cat: "pooja", name: "Nariyal (Pooja Coconut)", hi: "नारियल", unit: "1 pc", price: 35, mrp: 40, icon: "🥥" },
  { id: 18, cat: "pooja", name: "Laal Chunari (Mata Ji)", hi: "लाल चुनरी", unit: "1 pc", price: 50, mrp: 70, icon: "🧣" },
  { id: 19, cat: "pooja", name: "Brass Pooja Thali Set", hi: "पीतल पूजा थाली", unit: "1 set", price: 449, mrp: 599, icon: "🍽️", tag: "Premium" },
  { id: 20, cat: "pooja", name: "Rudraksha Mala (108 beads)", hi: "रुद्राक्ष माला", unit: "1 pc", price: 199, mrp: 299, icon: "📿" },

  // ---------- Festival / Pooja Kits ----------
  { id: 101, cat: "kits", name: "Diwali Lakshmi Pooja Complete Kit", hi: "दीपावली लक्ष्मी पूजा किट", unit: "35+ items", price: 551, mrp: 750, icon: "🪔", tag: "Festival Special" },
  { id: 102, cat: "kits", name: "Satyanarayan Katha Samagri Kit", hi: "सत्यनारायण कथा किट", unit: "30+ items", price: 451, mrp: 600, icon: "📖", tag: "Popular" },
  { id: 103, cat: "kits", name: "Navratri / Durga Pooja Kit", hi: "नवरात्रि पूजा किट", unit: "25+ items", price: 401, mrp: 550, icon: "🔱" },
  { id: 104, cat: "kits", name: "Griha Pravesh Pooja Kit", hi: "गृह प्रवेश पूजा किट", unit: "40+ items", price: 751, mrp: 999, icon: "🏠" },
  { id: 105, cat: "kits", name: "Rudrabhishek / Shiv Pooja Kit", hi: "रुद्राभिषेक किट", unit: "25+ items", price: 451, mrp: 599, icon: "🕉️" },
  { id: 106, cat: "kits", name: "Hawan Complete Kit", hi: "हवन किट", unit: "20+ items", price: 351, mrp: 450, icon: "🔥" },
  { id: 107, cat: "kits", name: "Daily Pooja Monthly Kit", hi: "मासिक नित्य पूजा किट", unit: "1 month", price: 249, mrp: 320, icon: "🙏", tag: "Value Pack" },
  { id: 108, cat: "kits", name: "Vivah / Shaadi Pooja Kit", hi: "विवाह पूजा किट", unit: "50+ items", price: 1499, mrp: 1999, icon: "💐" },

  // ---------- Ghee & Oil ----------
  { id: 201, cat: "ghee", name: "Amul Pure Ghee", hi: "अमूल घी", unit: "1 L", price: 610, mrp: 650, icon: "🧈" },
  { id: 202, cat: "ghee", name: "Fortune Soyabean Oil", hi: "सोयाबीन तेल", unit: "1 L", price: 145, mrp: 165, icon: "🫗" },
  { id: 203, cat: "ghee", name: "Kachi Ghani Mustard Oil", hi: "सरसों तेल", unit: "1 L", price: 170, mrp: 190, icon: "🫗" },
  { id: 204, cat: "ghee", name: "Til Oil (Pooja / Deepak)", hi: "तिल का तेल", unit: "500 ml", price: 140, mrp: 170, icon: "🛢️" },

  // ---------- Atta, Rice & Dal ----------
  { id: 301, cat: "staples", name: "Sharbati Gehu Atta", hi: "शरबती आटा", unit: "10 kg", price: 420, mrp: 480, icon: "🌾", tag: "Local MP" },
  { id: 302, cat: "staples", name: "Basmati Rice", hi: "बासमती चावल", unit: "1 kg", price: 110, mrp: 140, icon: "🍚" },
  { id: 303, cat: "staples", name: "Toor Dal", hi: "तुअर दाल", unit: "1 kg", price: 160, mrp: 180, icon: "🫘" },
  { id: 304, cat: "staples", name: "Moong Dal", hi: "मूंग दाल", unit: "1 kg", price: 130, mrp: 150, icon: "🫘" },
  { id: 305, cat: "staples", name: "Chana Dal", hi: "चना दाल", unit: "1 kg", price: 95, mrp: 110, icon: "🫘" },
  { id: 306, cat: "staples", name: "Sugar", hi: "शक्कर", unit: "1 kg", price: 46, mrp: 50, icon: "🧂" },
  { id: 307, cat: "staples", name: "Besan", hi: "बेसन", unit: "1 kg", price: 95, mrp: 110, icon: "🟨" },

  // ---------- Masale ----------
  { id: 401, cat: "masala", name: "Haldi Powder", hi: "हल्दी", unit: "200 g", price: 50, mrp: 60, icon: "🟡" },
  { id: 402, cat: "masala", name: "Lal Mirch Powder", hi: "लाल मिर्च", unit: "200 g", price: 70, mrp: 85, icon: "🌶️" },
  { id: 403, cat: "masala", name: "Dhaniya Powder", hi: "धनिया", unit: "200 g", price: 45, mrp: 55, icon: "🌿" },
  { id: 404, cat: "masala", name: "Garam Masala", hi: "गरम मसाला", unit: "100 g", price: 65, mrp: 80, icon: "🧆" },
  { id: 405, cat: "masala", name: "Jeera (Cumin)", hi: "जीरा", unit: "200 g", price: 90, mrp: 110, icon: "🌱" },

  // ---------- Dry Fruits ----------
  { id: 501, cat: "dryfruit", name: "Kaju (Cashew) W320", hi: "काजू", unit: "250 g", price: 230, mrp: 280, icon: "🥜" },
  { id: 502, cat: "dryfruit", name: "Badam (Almonds)", hi: "बादाम", unit: "250 g", price: 210, mrp: 260, icon: "🌰" },
  { id: 503, cat: "dryfruit", name: "Kishmish (Raisins)", hi: "किशमिश", unit: "250 g", price: 90, mrp: 120, icon: "🍇" },
  { id: 504, cat: "dryfruit", name: "Makhana", hi: "मखाना", unit: "100 g", price: 110, mrp: 140, icon: "⚪" },
  { id: 505, cat: "dryfruit", name: "Mishri (Prasad)", hi: "मिश्री", unit: "250 g", price: 40, mrp: 50, icon: "💎" },

  // ---------- Daily Essentials ----------
  { id: 601, cat: "daily", name: "Tata Salt", hi: "नमक", unit: "1 kg", price: 28, mrp: 30, icon: "🧂" },
  { id: 602, cat: "daily", name: "Tea (Chai Patti)", hi: "चाय पत्ती", unit: "500 g", price: 240, mrp: 280, icon: "🍵" },
  { id: 603, cat: "daily", name: "Bathing Soap (Pack of 4)", hi: "नहाने का साबुन", unit: "4 × 100 g", price: 160, mrp: 200, icon: "🧼" },
  { id: 604, cat: "daily", name: "Detergent Powder", hi: "डिटर्जेंट", unit: "1 kg", price: 110, mrp: 130, icon: "🫧" },
  { id: 605, cat: "daily", name: "Matchbox (Pack of 10)", hi: "माचिस", unit: "10 pcs", price: 20, mrp: 20, icon: "🔥" },

  // ---------- Snacks & Sweets ----------
  { id: 701, cat: "snacks", name: "Ratlami Sev", hi: "रतलामी सेव", unit: "400 g", price: 90, mrp: 110, icon: "🥨", tag: "Malwa Special" },
  { id: 702, cat: "snacks", name: "Indori Namkeen Mix", hi: "इंदौरी नमकीन", unit: "400 g", price: 95, mrp: 115, icon: "🥣" },
  { id: 703, cat: "snacks", name: "Biscuits Family Pack", hi: "बिस्कुट", unit: "1 pack", price: 50, mrp: 60, icon: "🍪" },
  { id: 704, cat: "snacks", name: "Soan Papdi", hi: "सोन पापड़ी", unit: "500 g", price: 120, mrp: 150, icon: "🍬" },
];
