// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  CONFIGURE YOUR PRICES HERE
//  Set any tier value to null to hide it for that game.
//  Add/remove objects inside `games` to add/remove games.
//  Add/remove objects inside PROGRAMS to add/remove clients.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PROGRAMS = [
  {
    "name": "Matcha",
    "games": [
      {
        "name": "Rivals",
        "prices": {
          "Legit": "$5.00",
          "Semi Legit": "$5.00",
          "Closet": "$5.00",
          "Semi Blatant": "$5.00",
          "Blatant": "$5.00",
          "Config Pack": "$18.00",
        }
      },
      {
        "name": "Phantom Forces",
        "prices": {
          "Legit": "$5.00",
          "Semi Legit": "$5.00",
          "Closet": "$5.00",
          "Semi Blatant": "$5.00",
          "Blatant": "$5.00",
          "Config Pack": "$18.00",
        }
      }
    ]
  },
  {
    "name": "Matrix",
    "games": [
      {
        "name": "Rivals Leaks",
        "prices": {
          "1Xorfee": "$5.00",
          "Airwu": "$5.00",
          "Whaqo": "$5.00",
          "Binkle": "$5.00",
          "Ricky": "$5.00",
          "Jynqs": "$5.00",
          "Oduck": "$5.00",
          "Akfla": "$5.00",
        }
      },
      {
        "name": "Da Hood",
        "prices": {
          "Legit": "$5.00",
          "Semi Legit": "$5.00",
          "Closet": "$5.00",
          "Semi Blatant": "$5.00",
          "Blatant": "$5.00",
          "Legit Silent": "$5.00"
        }
      },
      {
        "name": "Phantom Forces",
        "prices": {
          "Legit": "$5.00",
          "Semi Legit": "$5.00",
          "Closet": "$5.00",
          "Semi Blatant": "$5.00",
          "Blatant": "$5.00",
          "Legit Silent": "$5.00"
        }
      }
    ]
  },
  {
    "name": "UE",
    "games": [
      {
        "name": "Rivals",
        "prices": {
          "Rage": "$10.00",
          "Closet": "$5.00",
          "Legit": "$5.00"
        }
      }
    ]
  },
  {
    "name": "Kiciahook Premium",
    "games": [
      {
        "name": "Rivals",
        "prices": {
          "Rage": "$10.00",
          "Legit": "$5.00"
        }
      }
    ]
  },
  {
    "name": "Alt Generator",
    "games": [
      {
        "name": "View Plans",
        "prices": {
          "Lifetime": "$10.00",
          "Monthly": "$5.00"
        }
      }
    ]
  },
  {
    "name": "Scripts",
    "games": [
      {
        "name": "Bugware Premium",
        "prices": {
          "Lifetime": "$10.00",
          "Monthly": "$5.00"
        }
      },
      {
        "name": "Bugware Private",
        "prices": {
          "Lifetime": "Contact Staff"
        }
      }
    ]
  }
];

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
