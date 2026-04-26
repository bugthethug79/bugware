// ── PRODUCT CATALOG ─────────────────────────────────────
// Each product has: slug, name, description, type, tag (optional badge),
// gradient (CSS gradient string for the card accent), accentColor (hex),
// and games[] with their prices tiers.
// ─────────────────────────────────────────────────────────

const CATALOG = [
  {
    slug: "matcha",
    name: "Matcha",
    description: "Premium configs for the most competitive Roblox titles. Tuned across every playstyle from full legit to blatant — includes Config Packs for power buyers.",
    type: "Config Client",
    tag: null,
    gradient: "linear-gradient(135deg, #2d6a4f 0%, #1b4332 50%, #0a0a0a 100%)",
    accentColor: "#52b788",
    games: [
      { name: "Rivals", prices: { Legit: "$5.00", "Semi Legit": "$5.00", Closet: "$5.00", "Semi Blatant": "$5.00", Blatant: "$5.00", "Config Pack": "$18.00" } },
      { name: "Phantom Forces", prices: { Legit: "$5.00", "Semi Legit": "$5.00", Closet: "$5.00", "Semi Blatant": "$5.00", Blatant: "$5.00", "Config Pack": "$18.00" } },
      { name: "Da Hood", prices: { Legit: "$5.00", "Semi Legit": "$5.00", Closet: "$5.00", "Semi Blatant": "$5.00", Blatant: "$5.00", "Legit Silent": "$5.00" } },
      { name: "BloxStrike", prices: { Legit: "$5.00", "Semi Legit": "$5.00", Closet: "$5.00", "Semi Blatant": "$5.00", Blatant: "$5.00", "Config Pack": "$18.00" } },
      { name: "Operation One", prices: { Legit: "$5.00", "Semi Legit": "$5.00", Closet: "$5.00", "Semi Blatant": "$5.00", Blatant: "$5.00", "Config Pack": "$18.00" } },
      { name: "Sniper Duels", prices: { Legit: "$5.00", "Semi Legit": "$5.00", Closet: "$5.00", "Semi Blatant": "$5.00", Blatant: "$5.00", "Config Pack": "$18.00" } },
      { name: "Hypershot", prices: { Legit: "$5.00", "Semi Legit": "$5.00", Closet: "$5.00", "Semi Blatant": "$5.00", Blatant: "$5.00", "Config Pack": "$18.00" } },
      { name: "Criminality", prices: { Legit: "$5.00", "Semi Legit": "$5.00", Closet: "$5.00", "Semi Blatant": "$5.00", Blatant: "$5.00", "Config Pack": "$18.00" } }
    ]
  },
  {
    slug: "matrix",
    name: "Matrix",
    description: "Exclusive leaked configs and precision-tuned builds for Matrix. Includes rare Rivals leak configs from top players.",
    type: "Config Client",
    tag: null,
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0a0a0a 100%)",
    accentColor: "#4cc9f0",
    games: [
      { name: "Rivals Leaks", prices: { "1Xorfee": "$5.00", Airwu: "$5.00", Whaqo: "$5.00", Binkle: "$5.00", Ricky: "$5.00", Jynqs: "$5.00", Oduck: "$5.00", Akfla: "$5.00" } },
      { name: "Da Hood", prices: { Legit: "$5.00", "Semi Legit": "$5.00", Closet: "$5.00", "Semi Blatant": "$5.00", Blatant: "$5.00", "Legit Silent": "$5.00" } },
      { name: "Phantom Forces", prices: { Legit: "$5.00", "Semi Legit": "$5.00", Closet: "$5.00", "Semi Blatant": "$5.00", Blatant: "$5.00", "Legit Silent": "$5.00" } },
      { name: "Operation One", prices: { Legit: "$5.00", "Semi Legit": "$5.00", Closet: "$5.00", "Semi Blatant": "$5.00", Blatant: "$5.00", "Config Pack": "$18.00" } }
    ]
  },
  {
    slug: "ue",
    name: "UE",
    description: "Unnamed Enhancements configs built for Rivals. Covers closet to full rage — tuned for competitive play.",
    type: "Config Client",
    tag: null,
    gradient: "linear-gradient(135deg, #3a0ca3 0%, #240046 50%, #0a0a0a 100%)",
    accentColor: "#7b2ff7",
    games: [
      { name: "Rivals", prices: { Rage: "$10.00", Closet: "$5.00", Legit: "$5.00" } }
    ]
  },
  {
    slug: "kiciahook-premium",
    name: "Kiciahook Premium",
    description: "High-tier Kiciahook configs optimized for Rivals. Rage and legit builds ready to deploy.",
    type: "Config Client",
    tag: "PREMIUM",
    gradient: "linear-gradient(135deg, #7f0000 0%, #3d0000 50%, #0a0a0a 100%)",
    accentColor: "#e63946",
    games: [
      { name: "Rivals", prices: { Rage: "$10.00", Legit: "$5.00" } }
    ]
  },
  {
    slug: "modern-client",
    name: "Modern Client",
    description: "Full-spectrum Rivals configs for Modern Client. Every playstyle from squeaky clean legit to blatant.",
    type: "Config Client",
    tag: null,
    gradient: "linear-gradient(135deg, #0d3b66 0%, #051923 50%, #0a0a0a 100%)",
    accentColor: "#00b4d8",
    games: [
      { name: "Rivals", prices: { Legit: "$5.00", "Semi Legit": "$5.00", Closet: "$5.00", "Semi Blatant": "$5.00", Blatant: "$5.00" } }
    ]
  },
  {
    slug: "alt-generator",
    name: "Alt Generator",
    description: "Instantly generate fresh Roblox alt accounts via the Bloxgen API. Flexible monthly and lifetime plans.",
    type: "Generator",
    tag: "HOT",
    gradient: "linear-gradient(135deg, #f77f00 0%, #7c3a00 50%, #0a0a0a 100%)",
    accentColor: "#f77f00",
    games: [
      { name: "View Plans", prices: { Lifetime: "$10.00", Monthly: "$5.00" } }
    ]
  },
  {
    slug: "scripts",
    name: "Scripts",
    description: "Bugware executor scripts — Premium for public access, Private for elite buyers. Lua-based, executor-ready.",
    type: "Executor Script",
    tag: "EXCLUSIVE",
    gradient: "linear-gradient(135deg, #212529 0%, #111111 50%, #0a0a0a 100%)",
    accentColor: "#adb5bd",
    games: [
      { name: "Bugware Premium", prices: { Lifetime: "$10.00", Monthly: "$5.00" } },
      { name: "Bugware Private", prices: { Lifetime: "Contact Staff" } }
    ]
  },
  {
    slug: "lifetime-subs",
    name: "Lifetime Subs",
    description: "Lifetime subscription accounts for the most popular streaming, gaming, and VPN services — all at $5.",
    type: "Account",
    tag: null,
    gradient: "linear-gradient(135deg, #4a0e8f 0%, #1a0533 50%, #0a0a0a 100%)",
    accentColor: "#b48be4",
    games: [
      { name: "Netflix", prices: { Lifetime: "$5.00" } },
      { name: "HBO Max", prices: { Lifetime: "$5.00" } },
      { name: "NBA", prices: { Lifetime: "$5.00" } },
      { name: "Crunchyroll", prices: { Lifetime: "$5.00" } },
      { name: "Disney+", prices: { Lifetime: "$5.00" } },
      { name: "Paramount+", prices: { Lifetime: "$5.00" } },
      { name: "Spotify Premium", prices: { Lifetime: "$5.00" } },
      { name: "NordVPN", prices: { Lifetime: "$5.00" } },
      { name: "IP Vanish", prices: { Lifetime: "$5.00" } },
      { name: "Mullvad VPN", prices: { Lifetime: "$5.00" } }
    ]
  },
  {
    slug: "discord-services",
    name: "Discord Services",
    description: "Server boosts and Nitro promo codes at unbeatable prices. Instant delivery via ticket.",
    type: "Discord",
    tag: null,
    gradient: "linear-gradient(135deg, #23272a 0%, #5865f2 120%)",
    accentColor: "#5865f2",
    games: [
      { name: "14x Server Boost (1 Month)", prices: { Price: "$5.00" } },
      { name: "14x Server Boost (3 Month)", prices: { Price: "$5.00" } },
      { name: "Nitro Promo Code (1 Month)", prices: { Price: "$5.00" } },
      { name: "Nitro Promo Code (3 Month)", prices: { Price: "$5.00" } }
    ]
  }
];

// ── HELPERS ─────────────────────────────────────────────
function getPriceRange(product) {
  const nums = [];
  product.games.forEach(g => {
    Object.values(g.prices).forEach(v => {
      const n = parseFloat(String(v).replace('$', ''));
      if (!isNaN(n)) nums.push(n);
    });
  });
  if (!nums.length) return null;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return min === max
    ? `$${min.toFixed(2)}`
    : `$${min.toFixed(2)} – $${max.toFixed(2)}`;
}

function getProductBySlug(slug) {
  return CATALOG.find(p => p.slug === slug) || null;
}

// ── RENDER ────────────────────────────────────────────────
const grid = document.getElementById('progGrid');

PROGRAMS.forEach(prog => {
  const card = document.createElement('div');
  card.className = 'prog';

  const gameRows = prog.games.map(game => {
    const rows = Object.entries(game.prices)
      .filter(([, v]) => v !== null)
      .map(([tier, price]) => `
        <div class="p-row">
          <span class="p-tier">${tier}</span>
          <span class="p-val">${price}</span>
        </div>
      `).join('');

    return `
      <div class="game">
        <button class="game-btn" onclick="toggle(this)">
          ${game.name}
          <svg class="chev" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="prices">${rows}</div>
      </div>
    `;
  }).join('');

  card.innerHTML = `
    <div class="prog-head">
      <span class="prog-name">${prog.name}</span>
      <span class="prog-badge">Client</span>
    </div>
    <div class="games">${gameRows}</div>
  `;

  grid.appendChild(card);
});

// ── REVIEWS ──────────────────────────────────────────────
const STAR_SRC = 'assets/extras/reviewstar.png';

function renderStars(n, total = 5) {
  let html = '';
  for (let i = 0; i < total; i++) {
    const filled = i < n ? 'filled' : 'empty';
    html += `<img src="${STAR_SRC}" alt="" class="star ${filled}" onerror="this.style.display='none'" />`;
  }
  return html;
}

fetch('reviews.json', { cache: 'no-store' })
  .then(r => r.json())
  .then(data => {
    const list = (data.reviews || []).filter(r => r && typeof r.rating === 'number');
    const grid = document.getElementById('reviewsGrid');
    const summary = document.getElementById('reviewsSummary');
    if (!grid || !summary) return;

    if (!list.length) {
      summary.innerHTML = `<div class="rs-empty">No reviews yet.</div>`;
      return;
    }

    const total = list.length;
    const avg = list.reduce((s, r) => s + r.rating, 0) / total;
    const avgRounded = Math.round(avg);

    summary.innerHTML = `
      <div class="rs-num">${avg.toFixed(1)}<span>/5</span></div>
      <div class="rs-meta">
        <div class="rs-stars">${renderStars(avgRounded)}</div>
        <div class="rs-count">${total} ${total === 1 ? 'review' : 'reviews'}</div>
      </div>
    `;

    grid.innerHTML = list.map(r => `
      <div class="review">
        <div class="review-head">
          <span class="review-name">${escapeHTML(r.username || 'Anonymous')}</span>
          <span class="review-stars">${renderStars(r.rating)}</span>
        </div>
        <p class="review-msg">${escapeHTML(r.message || '')}</p>
      </div>
    `).join('');
  })
  .catch(err => {
    console.error('Failed to load reviews:', err);
    const summary = document.getElementById('reviewsSummary');
    if (summary) summary.innerHTML = `<div class="rs-empty">Reviews unavailable.</div>`;
  });

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function toggle(btn) {
  const isOpen = btn.classList.contains('open');
  const card = btn.closest('.prog');
  card.querySelectorAll('.game-btn').forEach(b => b.classList.remove('open'));
  card.querySelectorAll('.prices').forEach(p => p.classList.remove('open'));
  if (!isOpen) {
    btn.classList.add('open');
    btn.nextElementSibling.classList.add('open');
  }
}
