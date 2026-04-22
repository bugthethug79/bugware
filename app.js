// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  CONFIGURE YOUR PRICES HERE
//  Set any tier value to null to hide it for that game.
//  Add/remove objects inside `games` to add/remove games.
//  Add/remove objects inside PROGRAMS to add/remove clients.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PROGRAMS = [
  {
    name: "Matcha",
    games: [
      {
        name: "Rivals",
        prices: {
          "Legit":        "$5.00",
          "Semi Legit":   "$5.00",
          "Closet":       "$5.00",
          "Semi Blatant": "$5.00",
          "Blatant":      "$5.00",
          "Config Pack":  "$18.00",
        }
      },
    ]
  },
  {
    name: "Matrix",
    games: [
      {
        name: "Rivals Leaks",
        prices: {
          "Xorfee": "$5.00",
          "Whaqo":  "$5.00",
          "Iced":   "$5.00",
          "Binkle": "$5.00",
          "Ricky":  "$5.00",
        }
      },
    ]
  },
  {
    name: "Unnamed Enhancements",
    games: [
      {
        name: "Rivals",
        prices: {
          "Rage":  "$10.00",
          "Legit": "$5.00",
        }
      },
    ]
  },
  {
    name: "Kiciahook Premium",
    games: [
      {
        name: "Rivals",
        prices: {
          "Rage":  "$10.00",
          "Legit": "$5.00",
        }
      },
    ]
  },
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
