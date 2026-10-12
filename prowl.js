/* =========================================================
   Bugware — Prowl
   prowl.js: the dark room (searchlights + eyes)
   ========================================================= */

(() => {
  "use strict";

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

  /* ---------------------------------------------------------
     THE DARK ROOM
     moderators sweep searchlights across a brick wall. the
     mascot is just two eyes and a grin in the dark, and she
     shuts her eyes whenever a light passes over her.
     --------------------------------------------------------- */

  function room(el) {
    const canvas = el.querySelector("[data-room-canvas]");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const mask = document.createElement("canvas");
    const mctx = mask.getContext("2d");
    const tex = document.createElement("canvas");
    const tctx = tex.getContext("2d");
    const short = el.classList.contains("room-short");
    const say = el.querySelector("[data-say]");

    let w = 0;
    let h = 0;
    let dpr = 1;
    let s = 1;
    let lights = [];
    let eye = { x: 0, y: 0 };

    const state = {
      open: 1,
      grin: 0,
      px: 0,
      py: 0,
      pdx: 0,
      pdy: 0,
      hidden: false,
      blinkUntil: 0,
      nextBlink: 2,
      near: false,
      hasPointer: false,
    };

    // letters that duck when the light hits them
    const title = el.querySelector("[data-duck]");
    let letters = [];
    if (title) {
      const text = title.textContent;
      title.textContent = "";
      text.split(" ").forEach((word, i, all) => {
        const w = document.createElement("span");
        w.className = "w";
        w.setAttribute("aria-hidden", "true");
        [...word].forEach((c) => {
          const ch = document.createElement("span");
          ch.className = "ch";
          ch.textContent = c;
          w.appendChild(ch);
          letters.push({ el: ch, x: 0, y: 0, lit: false });
        });
        title.appendChild(w);
        if (i < all.length - 1) title.appendChild(document.createTextNode(" "));
      });
    }

    function measureLetters() {
      const r = el.getBoundingClientRect();
      letters.forEach((l) => {
        const b = l.el.getBoundingClientRect();
        l.x = b.left - r.left + b.width / 2;
        l.y = b.top - r.top + b.height / 2;
      });
    }

    // seeded random so the wall looks the same every resize
    function rng(seed) {
      return () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
    }

    function drawTexture() {
      tex.width = mask.width = canvas.width;
      tex.height = mask.height = canvas.height;
      const t = tctx;
      t.setTransform(dpr, 0, 0, dpr, 0, 0);
      t.clearRect(0, 0, w, h);

      // the light itself: cold, slightly blue
      t.fillStyle = "rgba(196, 206, 255, 0.17)";
      t.fillRect(0, 0, w, h);

      // bricks
      const r = rng(7);
      const bh = 30 * s + 8;
      const bw = 84 * s + 22;
      for (let y = 0, row = 0; y < h; y += bh, row++) {
        const off = row % 2 ? -bw / 2 : 0;
        for (let x = off; x < w; x += bw) {
          const k = r();
          if (k > 0.7) {
            t.fillStyle = `rgba(255,255,255,${0.02 + (k - 0.7) * 0.12})`;
            t.fillRect(x + 1, y + 1, bw - 2, bh - 2);
          }
          t.strokeStyle = "rgba(255,255,255,0.10)";
          t.lineWidth = 1;
          t.strokeRect(x + 0.5, y + 0.5, bw, bh);
        }
      }

      // graffiti — only readable when a light finds it
      const big = clamp(w * 0.05, 26, 72);
      t.save();
      t.translate(w * (short ? 0.46 : 0.4), h * (short ? 0.36 : 0.15));
      t.rotate(-0.07);
      t.font = `${big}px "Dela Gothic One", sans-serif`;
      t.fillStyle = "rgba(232, 161, 169, 0.75)";
      const lines = (el.dataset.graffiti || "NOBODY SAW|ANYTHING.").split("|");
      if (lines.length === 1) t.font = `${big * 1.25}px "Dela Gothic One", sans-serif`;
      lines.forEach((ln, i) => t.fillText(ln, big * 0.4 * i, big * 1.05 * i));
      t.restore();

      t.save();
      t.translate(w * 0.7, h * 0.86);
      t.rotate(-0.04);
      t.font = `${big * 0.42}px "DotGothic16", monospace`;
      t.fillStyle = "rgba(245, 197, 66, 0.8)";
      t.fillText("Bugsawe was here", 0, 0);
      t.restore();

      // a little cat doodle
      t.save();
      t.translate(w * (short ? 0.18 : 0.72), h * (short ? 0.26 : 0.6));
      t.rotate(-0.12);
      const c = big * 0.9;
      t.strokeStyle = "rgba(245, 197, 66, 0.8)";
      t.lineWidth = Math.max(2, c * 0.06);
      t.lineCap = "round";
      t.lineJoin = "round";
      t.beginPath();
      t.moveTo(-c * 0.5, -c * 0.1);
      t.lineTo(-c * 0.42, -c * 0.62);
      t.lineTo(-c * 0.12, -c * 0.34);
      t.quadraticCurveTo(0, -c * 0.4, c * 0.12, -c * 0.34);
      t.lineTo(c * 0.42, -c * 0.62);
      t.lineTo(c * 0.5, -c * 0.1);
      t.quadraticCurveTo(c * 0.52, c * 0.42, 0, c * 0.42);
      t.quadraticCurveTo(-c * 0.52, c * 0.42, -c * 0.5, -c * 0.1);
      t.stroke();
      t.beginPath();
      t.moveTo(-c * 0.24, 0);
      t.lineTo(-c * 0.1, -c * 0.04);
      t.moveTo(c * 0.24, 0);
      t.lineTo(c * 0.1, -c * 0.04);
      t.moveTo(-c * 0.12, c * 0.16);
      t.quadraticCurveTo(-c * 0.06, c * 0.24, 0, c * 0.16);
      t.quadraticCurveTo(c * 0.06, c * 0.24, c * 0.12, c * 0.16);
      t.stroke();
      t.restore();
    }

    function layout() {
      const r = el.getBoundingClientRect();
      w = r.width;
      h = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      s = clamp(w / 1400, 0.62, 1.1);

      const narrow = w < 760;
      eye = narrow
        ? { x: w * 0.7, y: Math.max(140, h * (short ? 0.26 : 0.2)) }
        : { x: w * 0.8, y: h * (short ? 0.3 : 0.26) };

      lights = narrow
        ? [
            { ox: w * 0.1, per: 9.5, ph: 3.4, amp: 0.75 },
            { ox: w * 0.95, per: 11.5, ph: 2.6, amp: 0.35 },
          ]
        : [
            { ox: w * 0.12, per: 10.5, ph: 0, amp: 0.55 },
            { ox: w * 0.5, per: 13, ph: 0.2, amp: 0.95 },
            { ox: w * 0.97, per: 8.8, ph: 4.2, amp: 0.42 },
          ];
      lights.forEach((l) => {
        l.oy = -30;
        l.half = 0.13;
        l.len = Math.hypot(w, h) * 1.15;
        l.a = Math.PI / 2;
      });

      if (!state.hasPointer) {
        state.px = w * 0.4;
        state.py = h * 0.6;
      }
      drawTexture();
      measureLetters();
      placeSay();
    }

    // "hello there, moderators." — said from the dark, next to her eyes
    function placeSay() {
      if (!say) return;
      const bw = say.offsetWidth;
      const bh = say.offsetHeight;
      const below = w < 760;
      say.classList.toggle("say-below", below);
      say.classList.add("placed");
      if (below) {
        const left = clamp(eye.x - bw / 2, 16, w - bw - 16);
        say.style.left = `${left}px`;
        say.style.top = `${eye.y + 92 * s}px`;
        say.style.setProperty("--tail", `${clamp(eye.x - left, 18, bw - 18)}px`);
      } else {
        say.style.left = `${eye.x - 110 * s - bw}px`;
        say.style.top = `${eye.y - bh / 2}px`;
      }
    }

    // is a point (with a radius of slack) inside any light cone?
    function lit(x, y, pad = 0) {
      for (const l of lights) {
        const dx = x - l.ox;
        const dy = y - l.oy;
        const d = Math.hypot(dx, dy);
        if (d > l.len) continue;
        const diff = Math.abs(wrapAngle(Math.atan2(dy, dx) - l.a));
        if (diff < l.half + Math.atan2(pad, d)) return true;
      }
      return false;
    }

    function wedge(c, l, spread, alpha) {
      const g = c.createRadialGradient(l.ox, l.oy, 0, l.ox, l.oy, l.len);
      g.addColorStop(0, `rgba(255,255,255,${alpha})`);
      g.addColorStop(0.55, `rgba(255,255,255,${alpha * 0.6})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(l.ox, l.oy);
      c.arc(l.ox, l.oy, l.len, l.a - spread, l.a + spread);
      c.closePath();
      c.fill();
    }

    function drawEye(cx, cy, side) {
      const W = 50 * s;
      const H = 30 * s;
      const hw = W / 2;
      const hh = (H / 2) * state.open;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(side * -0.14);

      if (hh < 1) {
        if (!state.hidden) {
          // mid-blink: a thin lash line
          ctx.strokeStyle = "rgba(245,197,66,0.65)";
          ctx.lineWidth = 2 * s;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(-hw, 0);
          ctx.quadraticCurveTo(0, 6 * s, hw, 0);
          ctx.stroke();
        }
        ctx.restore();
        return;
      }

      ctx.beginPath();
      ctx.moveTo(-hw, 0);
      ctx.quadraticCurveTo(0, -hh * 2, hw, 0);
      ctx.quadraticCurveTo(0, hh * 1.6, -hw, 0);
      ctx.closePath();

      const g = ctx.createRadialGradient(0, hh * 0.3, 0, 0, 0, hw);
      g.addColorStop(0, "#ffe98f");
      g.addColorStop(0.6, "#f5c542");
      g.addColorStop(1, "#c88d10");
      ctx.shadowColor = "rgba(245,197,66,0.85)";
      ctx.shadowBlur = 26 * s;
      ctx.fillStyle = g;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.clip();

      // slit pupil, widens when she's interested
      const pw = (state.near ? 7 : 4.5) * s;
      ctx.fillStyle = "#140f05";
      ctx.beginPath();
      ctx.ellipse(state.pdx, state.pdy, pw, 15 * s, 0, 0, TAU);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.beginPath();
      ctx.arc(state.pdx + 7 * s, state.pdy - 5 * s, 3.4 * s, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(state.pdx - 6 * s, state.pdy + 5 * s, 1.6 * s, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    function drawGrin() {
      const g = state.grin * state.open;
      if (g < 0.02) return;
      const mw = 40 * s;
      const my = eye.y + 64 * s;
      ctx.save();
      ctx.fillStyle = `rgba(255,250,240,${0.95 * g})`;
      ctx.shadowColor = `rgba(255,250,240,${0.4 * g})`;
      ctx.shadowBlur = 14 * s;
      ctx.beginPath();
      ctx.moveTo(eye.x - mw, my - 6 * s);
      ctx.quadraticCurveTo(eye.x, my + 34 * s * g, eye.x + mw, my - 6 * s);
      ctx.quadraticCurveTo(eye.x, my + 12 * s * g, eye.x - mw, my - 6 * s);
      ctx.fill();
      ctx.restore();
    }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // lights → mask, then let the wall texture show through
      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mctx.globalCompositeOperation = "source-over";
      mctx.clearRect(0, 0, w, h);
      lights.forEach((l) => {
        wedge(mctx, l, l.half * 1.6, 0.28);
        wedge(mctx, l, l.half, 0.95);
      });
      mctx.globalCompositeOperation = "source-in";
      mctx.setTransform(1, 0, 0, 1, 0, 0);
      mctx.drawImage(tex, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(mask, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // lamp heads
      lights.forEach((l) => {
        const hx = l.ox + Math.cos(l.a) * 34;
        const hy = l.oy + Math.sin(l.a) * 34;
        const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 26);
        g.addColorStop(0, "rgba(235,240,255,0.95)");
        g.addColorStop(1, "rgba(235,240,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(hx, hy, 26, 0, TAU);
        ctx.fill();
      });

      const gap = 46 * s;
      drawEye(eye.x - gap, eye.y, -1);
      drawEye(eye.x + gap, eye.y, 1);
      drawGrin();
    }

    let last = performance.now();
    let running = false;
    let raf = 0;

    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      lights.forEach((l) => {
        l.a = Math.PI / 2 + l.amp * Math.sin((t / l.per) * TAU + l.ph);
      });

      const gap = 46 * s;
      const pad = 30 * s;
      const wasHidden = state.hidden;
      state.hidden = lit(eye.x - gap, eye.y, pad) || lit(eye.x + gap, eye.y, pad);
      if (state.hidden !== wasHidden && say) say.classList.toggle("hush", state.hidden);

      const dx = state.px - eye.x;
      const dy = state.py - eye.y;
      const dist = Math.hypot(dx, dy);
      state.near = state.hasPointer && dist < 230 * s;

      if (t > state.nextBlink) {
        state.blinkUntil = t + 0.14;
        state.nextBlink = t + 2.2 + Math.random() * 4;
      }
      const blinking = t < state.blinkUntil;
      const target = state.hidden ? 0 : blinking ? 0.04 : state.near ? 0.56 : 1;
      state.open = lerp(state.open, target, Math.min(1, dt * (state.hidden ? 18 : 12)));
      state.grin = lerp(state.grin, state.near && !state.hidden ? 1 : 0, Math.min(1, dt * 6));

      const k = Math.min(1, dist / 320);
      const tx = dist ? (dx / dist) * k * 10 * s : 0;
      const ty = dist ? (dy / dist) * k * 4 * s : 0;
      state.pdx = lerp(state.pdx, tx, Math.min(1, dt * 10));
      state.pdy = lerp(state.pdy, ty, Math.min(1, dt * 10));

      letters.forEach((l) => {
        const on = lit(l.x, l.y, 4);
        if (on !== l.lit) {
          l.lit = on;
          l.el.classList.toggle("lit", on);
        }
      });

      draw();
      if (running) raf = requestAnimationFrame(tick);
    }

    function start() {
      if (running || reduce) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    window.addEventListener(
      "pointermove",
      (e) => {
        const r = el.getBoundingClientRect();
        state.px = e.clientX - r.left;
        state.py = e.clientY - r.top;
        state.hasPointer = e.pointerType === "mouse" || state.hasPointer;
      },
      { passive: true }
    );

    // poke the eyes
    el.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (Math.hypot(x - eye.x, y - eye.y) > 140 * s) return;
      state.blinkUntil = performance.now() / 1000 + 0.22;
      const n = document.createElement("span");
      n.className = "nya";
      n.textContent = "ニャ!!";
      n.style.left = `${eye.x}px`;
      n.style.top = `${eye.y - 70 * s}px`;
      el.appendChild(n);
      n.addEventListener("animationend", () => n.remove());
    });

    let resizeT = 0;
    window.addEventListener("resize", () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        layout();
        if (reduce) draw();
      }, 120);
    });

    layout();
    if (reduce) {
      lights.forEach((l, i) => (l.a = Math.PI / 2 + (i - 1) * 0.35));
      draw();
    }
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
      layout();
      if (reduce) {
        lights.forEach((l, i) => (l.a = Math.PI / 2 + (i - 1) * 0.35));
        draw();
      }
    });

    new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop())).observe(el);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  }

  document.querySelectorAll("[data-room]").forEach(room);
})();
