/* =========================================================
   Bugware — Prowl
   app.js: shared chrome + page behaviour
   ========================================================= */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const body = document.body;

  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- eyelids: open on load, close on the way out ---------- */

  requestAnimationFrame(() => requestAnimationFrame(() => body.classList.add("is-open")));

  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      body.classList.remove("is-leaving");
      body.classList.add("is-open");
    }
  });

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    const samePage = url.pathname === location.pathname && url.search === location.search;
    if (samePage) {
      closeNav();
      return;
    }
    if (reduce) return;
    e.preventDefault();
    body.classList.add("is-leaving");
    setTimeout(() => (location.href = url.href), 480);
  });

  /* ---------- HUD ---------- */

  const hud = $(".hud");
  const onScroll = () => hud && hud.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const nav = $("[data-nav]");
  const toggle = $("[data-nav-toggle]");
  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle?.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeNav());

  /* ---------- paw prints follow the pointer ---------- */

  const paws = $("[data-paws]");
  if (paws && finePointer && !reduce) {
    let lx = null;
    let ly = null;
    let acc = 0;
    let side = 1;
    window.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse") return;
        if (lx === null) {
          lx = e.clientX;
          ly = e.clientY;
          return;
        }
        const dx = e.clientX - lx;
        const dy = e.clientY - ly;
        acc += Math.hypot(dx, dy);
        if (acc < 120) return;
        acc = 0;
        const ang = Math.atan2(dy, dx);
        side *= -1;
        const p = document.createElement("span");
        p.className = "paw";
        p.style.left = `${e.clientX - Math.sin(ang) * 7 * side}px`;
        p.style.top = `${e.clientY + Math.cos(ang) * 7 * side}px`;
        p.style.transform = `rotate(${ang + Math.PI / 2}rad)`;
        paws.appendChild(p);
        p.addEventListener("animationend", () => p.remove());
        lx = e.clientX;
        ly = e.clientY;
      },
      { passive: true }
    );
  }

  /* ---------- radio line types itself out ---------- */

  $$("[data-radio]").forEach((el) => {
    const text = el.textContent.trim();
    if (reduce) return;
    el.textContent = "";
    const out = document.createElement("span");
    const caret = document.createElement("span");
    caret.className = "caret";
    el.append(out, caret);
    let i = 0;
    const type = () => {
      out.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(type, 40 + Math.random() * 70);
    };
    setTimeout(type, 700);
  });

  /* ---------- reveal on scroll ---------- */

  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        io.unobserve(en.target);
      }),
    { threshold: 0.2, rootMargin: "0px 0px -6% 0px" }
  );
  $$("[data-reveal]").forEach((el) => io.observe(el));

  function onceVisible(el, fn, threshold = 0.4) {
    const o = new IntersectionObserver(
      ([en]) => {
        if (!en.isIntersecting) return;
        o.disconnect();
        fn();
      },
      { threshold }
    );
    o.observe(el);
  }

  /* ---------- count-up ---------- */

  $$("[data-count-to]").forEach((el) => {
    const to = Number(el.dataset.countTo);
    onceVisible(el, () => {
      if (reduce) return (el.textContent = to);
      const t0 = performance.now();
      const step = (now) => {
        const k = clamp((now - t0) / 1400, 0, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  });

  /* ---------- nine lives: all accounted for ---------- */

  const lives = $("[data-lives]");
  if (lives) {
    const grid = $("[data-lives-grid]", lives);
    const num = $("[data-lives-num]", lives);
    const head =
      '<svg viewBox="0 0 44 40"><path class="life-head" d="M5 37C3 26 3.5 14 7 3l9.5 8.2c3.8-1.3 7.2-1.3 11 0L37 3c3.5 11 4 23 2 34z"/>' +
      '<path class="life-ear" d="M9.3 8.6l5 4.4-4.6 3.3zM34.7 8.6l-5 4.4 4.6 3.3z"/>' +
      '<g class="life-eyes"><ellipse cx="15.5" cy="24" rx="4.2" ry="3"/><ellipse cx="28.5" cy="24" rx="4.2" ry="3"/></g></svg>';
    for (let i = 0; i < 9; i++) {
      const life = document.createElement("span");
      life.className = "life";
      life.style.setProperty("--i", i);
      life.innerHTML = head;
      grid.appendChild(life);
    }
    const all = $$(".life", grid);

    onceVisible(lives, () => {
      lives.classList.add("awake");
      if (reduce) {
        lives.classList.add("settled");
        return (num.textContent = 9);
      }
      setTimeout(() => lives.classList.add("settled"), 2200);
      // count up in step with each pair of eyes opening
      all.forEach((_, i) => setTimeout(() => (num.textContent = i + 1), 300 + i * 140));
      // now and then one of them squints at a passing light — and keeps its life
      setInterval(() => {
        const life = all[(Math.random() * all.length) | 0];
        life.classList.add("squint");
        setTimeout(() => life.classList.remove("squint"), 900);
      }, 2600);
    });
  }

  /* ---------- services: the shell game ---------- */

  const shell = $("[data-shell]");
  if (shell) {
    const boxes = $$("[data-box]", shell);
    const btn = $("[data-shuffle]");
    let busy = false;

    const wide = () => window.innerWidth > 760;

    boxes.forEach((b) => b.addEventListener("click", () => {
      b.classList.add("is-up");
      setTimeout(() => b.classList.remove("is-up"), 1100);
    }));

    async function run() {
      if (busy || reduce || !wide()) return;
      busy = true;
      if (btn) btn.disabled = true;
      shell.classList.add("is-shuffling");

      // drop in from above
      await Promise.all(
        boxes.map((b, i) =>
          b.animate(
            [
              { transform: "translateY(-160px) rotate(-8deg)", opacity: 0 },
              { transform: "translateY(10px) rotate(2deg)", opacity: 1, offset: 0.7 },
              { transform: "none", opacity: 1 },
            ],
            { duration: 620, delay: i * 110, easing: "cubic-bezier(.3,.7,.4,1)", fill: "backwards" }
          ).finished
        )
      );

      const xs = boxes.map((b) => b.getBoundingClientRect().left);
      const where = boxes.map((_, i) => i); // which slot each box is in
      const off = boxes.map(() => 0);

      for (let n = 0; n < 7; n++) {
        const a = Math.floor(Math.random() * 3);
        let b = Math.floor(Math.random() * 2);
        if (b >= a) b++;
        const ia = where.indexOf(a);
        const ib = where.indexOf(b);
        const dur = 300 + (n === 0 ? 120 : 0);
        const moves = [
          [ia, xs[b] - xs[a], -38],
          [ib, xs[a] - xs[b], 22],
        ].map(([bi, dx, lift]) => {
          const from = off[bi];
          const to = from + dx;
          off[bi] = to;
          return boxes[bi].animate(
            [
              { transform: `translate(${from}px, 0)` },
              { transform: `translate(${(from + to) / 2}px, ${lift}px) rotate(${lift > 0 ? 3 : -4}deg)` },
              { transform: `translate(${to}px, 0)` },
            ],
            { duration: dur, easing: "cubic-bezier(.65,0,.35,1)", fill: "forwards" }
          ).finished;
        });
        where[ia] = b;
        where[ib] = a;
        await Promise.all(moves);
      }

      // boxes are identical while stamps are hidden: snap home, unseen
      boxes.forEach((b) => b.getAnimations().forEach((an) => an.cancel()));
      await new Promise((r) => setTimeout(r, 120));
      shell.classList.remove("is-shuffling");

      // somebody's under one of these
      const peek = boxes[Math.floor(Math.random() * boxes.length)];
      setTimeout(() => {
        peek.classList.add("is-up");
        setTimeout(() => peek.classList.remove("is-up"), 1300);
      }, 450);

      busy = false;
      if (btn) btn.disabled = false;
    }

    onceVisible(shell, run, 0.45);
    btn?.addEventListener("click", run);
  }

  /* ---------- why bugware: a paw trail walks the three points ---------- */

  const why = $("[data-why]");
  if (why) {
    const trail = $("[data-trail]", why);
    const steps = 24;
    for (let i = 0; i < steps; i++) {
      const p = document.createElement("i");
      p.style.left = `${(i / (steps - 1)) * 100}%`;
      p.style.setProperty("--d", `${i * 70}ms`);
      if (i % 2) p.classList.add("up");
      trail.appendChild(p);
    }
    $$(".why-item", why).forEach((item, i) => item.style.setProperty("--d", `${(i * 2 + 1) * (steps / 6) * 70}ms`));
    onceVisible(why, () => why.classList.add("walking"), 0.35);
  }

  /* ---------- call to action: she peeks over the ledge ---------- */

  const cta = $("[data-cta]");
  if (cta) onceVisible(cta, () => cta.classList.add("in"), 0.5);

  /* ---------- home: live buyer rating from reviews.xml ---------- */

  const ratingBig = $("[data-rating-big]");
  if (ratingBig) {
    const ratingText = $("[data-rating-text]");
    fetch("reviews.xml", { cache: "no-cache" })
      .then((res) => (res.ok ? res.text() : Promise.reject()))
      .then((source) => {
        const xml = new DOMParser().parseFromString(source, "application/xml");
        const ratings = $$("review", xml)
          .filter((n) => n.querySelector("text")?.textContent.trim())
          .map((n) => Number(n.querySelector("rating")?.textContent.trim()))
          .filter((r) => Number.isInteger(r) && r >= 1 && r <= 5);
        if (!ratings.length) {
          ratingText.firstElementChild.textContent = "Be one of the first to leave a review";
          return;
        }
        const avg = ratings.reduce((t, r) => t + r, 0) / ratings.length;
        ratingBig.innerHTML = `<b>${avg.toFixed(1)}</b>/5`;
        ratingText.firstElementChild.textContent = `Average across ${ratings.length} buyer review${ratings.length === 1 ? "" : "s"}`;
      })
      .catch(() => {});
  }

  /* ---------- toast ---------- */

  const toastEl = $("[data-toast]");
  let toastT = 0;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("show"), 2400);
  }

  /* ---------- scripts: the stash ---------- */

  const loot = $("[data-loot]");
  if (loot) {
    const items = $$(".loot-item", loot);
    const d = {
      root: $("[data-dossier]"),
      file: $("[data-d-file]"),
      price: $("[data-d-price]"),
      name: $("[data-d-name]"),
      kind: $("[data-d-kind]"),
      desc: $("[data-d-desc]"),
      code: $("[data-d-code]"),
      copy: $("[data-d-copy]"),
      soon: $("[data-d-soon]"),
      alert: $("[data-alert]"),
    };
    let current = items[0];
    let scrambleT = 0;

    // loader text decrypts itself into place
    function scramble(el, text) {
      clearInterval(scrambleT);
      if (reduce) return (el.textContent = text);
      const glyphs = "!<>-_\\/[]{}=+*^?#ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜ01";
      let frame = 0;
      const total = 22;
      scrambleT = setInterval(() => {
        frame++;
        const k = frame / total;
        el.textContent = [...text]
          .map((c, i) => (c === " " || i / text.length < k ? c : glyphs[(Math.random() * glyphs.length) | 0]))
          .join("");
        if (frame >= total) {
          clearInterval(scrambleT);
          el.textContent = text;
        }
      }, 28);
    }

    function select(item, focus) {
      current = item;
      items.forEach((it) => {
        const on = it === item;
        it.setAttribute("aria-selected", String(on));
        it.tabIndex = on ? 0 : -1;
      });
      if (focus) item.focus();
      const ds = item.dataset;
      d.file.textContent = ds.file;
      d.price.textContent = ds.price;
      d.name.textContent = ds.name;
      d.kind.textContent = ds.kind;
      d.desc.textContent = ds.desc;
      const paid = Boolean(ds.soon);
      d.copy.hidden = paid;
      d.soon.hidden = !paid;
      if (paid) d.soon.href = ds.soon;
      scramble(d.code, paid ? "-- paid script. access is handled through Discord." : ds.loader);
      d.root.classList.remove("is-swapping");
      void d.root.offsetWidth;
      d.root.classList.add("is-swapping");
    }

    items.forEach((it, i) => {
      it.tabIndex = i === 0 ? 0 : -1;
      it.addEventListener("click", () => select(it));
      it.addEventListener("pointermove", (e) => {
        const r = it.getBoundingClientRect();
        it.style.setProperty("--x", `${e.clientX - r.left}px`);
        it.style.setProperty("--y", `${e.clientY - r.top}px`);
      });
    });

    loot.addEventListener("keydown", (e) => {
      const i = items.indexOf(current);
      let next = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") next = items[(i + 1) % items.length];
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = items[(i - 1 + items.length) % items.length];
      if (e.key === "Home") next = items[0];
      if (e.key === "End") next = items[items.length - 1];
      if (next) {
        e.preventDefault();
        select(next, true);
      }
    });

    async function copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        let ok = false;
        try {
          ok = document.execCommand("copy");
        } catch {
          ok = false;
        }
        ta.remove();
        return ok;
      }
    }

    d.copy.addEventListener("click", async () => {
      const ok = await copyText(current.dataset.loader);
      if (ok) {
        d.alert.classList.remove("pop");
        void d.alert.offsetWidth;
        d.alert.classList.add("pop");
        toast("Loader copied. Nobody saw that.");
      } else {
        toast("Couldn't copy. Select the loader and copy it manually.");
      }
    });
  }

  /* ---------- reviews: word on the street ---------- */

  const list = $("[data-review-list]");
  if (list) {
    const statusEl = $("[data-review-status]");
    const sortEl = $("[data-review-sort]");
    const searchEl = $("[data-review-search]");
    const shownEl = $("[data-review-shown]");
    const avgEl = $("[data-review-average]");
    const countEl = $("[data-review-count]");
    const eyesEl = $("[data-review-eyes]");
    const distRows = $$(".dist-row", $("[data-review-dist]"));
    let reviews = [];

    const setStatus = (msg) => (statusEl.textContent = msg);

    function eyes(value, small) {
      const wrap = document.createElement("span");
      wrap.className = small ? "eyes-rating sm" : "eyes-rating";
      for (let i = 1; i <= 5; i++) {
        const e = document.createElement("i");
        e.className = "er";
        if (value < i - 0.75) e.classList.add("shut");
        else if (value < i - 0.25) e.classList.add("half");
        wrap.appendChild(e);
      }
      return wrap;
    }

    function empty(title, text) {
      list.innerHTML = "";
      const box = document.createElement("div");
      box.className = "review-empty";
      box.innerHTML = '<span class="sleepy" aria-hidden="true"><i></i><i></i><b>z z</b></span>';
      const h = document.createElement("h2");
      h.textContent = title;
      const p = document.createElement("p");
      p.textContent = text;
      box.append(h, p);
      list.appendChild(box);
    }

    function render() {
      const q = (searchEl?.value || "").trim().toLowerCase();
      let items = reviews.filter(
        (r) => !q || r.username.toLowerCase().includes(q) || r.text.toLowerCase().includes(q)
      );
      if (sortEl?.value === "high") items = [...items].sort((a, b) => b.rating - a.rating || a.index - b.index);
      if (sortEl?.value === "low") items = [...items].sort((a, b) => a.rating - b.rating || a.index - b.index);

      list.innerHTML = "";
      items.forEach((review, i) => {
        const card = document.createElement("article");
        card.className = "review";
        card.style.animationDelay = `${Math.min(i, 10) * 60}ms`;

        const head = document.createElement("div");
        head.className = "review-head";
        const avatar = document.createElement("span");
        avatar.className = "review-avatar";
        avatar.setAttribute("aria-hidden", "true");
        // first real letter or digit; NFKC turns styled names like 𝖍𝖆𝖚𝖓𝖙𝖊𝖉 into plain "h"
        const initial = [...review.username.normalize("NFKC")].find((c) => /[\p{L}\p{N}]/u.test(c));
        avatar.textContent = (initial || "?").toUpperCase();
        const who = document.createElement("div");
        who.className = "review-who";
        const name = document.createElement("span");
        name.className = "review-name";
        name.textContent = review.username;
        const rating = eyes(review.rating, true);
        rating.setAttribute("role", "img");
        rating.setAttribute("aria-label", `${review.rating} out of 5`);
        who.append(name, rating);
        head.append(avatar, who);

        const text = document.createElement("p");
        text.textContent = review.text;
        card.append(head, text);
        list.appendChild(card);
      });

      if (shownEl) shownEl.textContent = reviews.length ? `${items.length} of ${reviews.length} shown` : "";
      if (reviews.length && !items.length) setStatus("No reviews match that search.");
      else if (reviews.length) setStatus("");
    }

    function summarize() {
      const count = reviews.length;
      const avg = count ? reviews.reduce((t, r) => t + r.rating, 0) / count : 0;
      avgEl.textContent = count ? avg.toFixed(1) : "?";
      countEl.textContent = count;
      eyesEl.replaceChildren(...eyes(avg, false).childNodes);
      distRows.forEach((row) => {
        const value = Number(row.firstElementChild.textContent);
        const n = reviews.filter((r) => r.rating === value).length;
        row.querySelector("b").textContent = n;
        requestAnimationFrame(() => {
          row.querySelector(".dist-bar i").style.width = count ? `${(n / count) * 100}%` : "0%";
        });
      });
    }

    sortEl?.addEventListener("change", render);
    searchEl?.addEventListener("input", render);
    summarize();

    fetch("reviews.xml", { cache: "no-cache" })
      .then((res) => {
        if (!res.ok) throw new Error("http");
        return res.text();
      })
      .then((source) => {
        const xml = new DOMParser().parseFromString(source, "application/xml");
        if (xml.querySelector("parsererror")) throw new Error("parse");
        reviews = $$("review", xml)
          .map((node, index) => ({
            index,
            username: node.querySelector("username")?.textContent.trim() || "Anonymous",
            text: node.querySelector("text")?.textContent.trim() || "",
            rating: Number(node.querySelector("rating")?.textContent.trim()),
          }))
          .filter((r) => r.text && Number.isInteger(r.rating) && r.rating >= 1 && r.rating <= 5);

        summarize();
        if (!reviews.length) {
          setStatus("");
          empty("Quiet out here.", "No reviews yet. Check back soon.");
          return;
        }
        render();
      })
      .catch((err) => {
        setStatus("");
        empty(
          "Lost the signal.",
          err.message === "parse"
            ? "The reviews file could not be read."
            : "Reviews couldn't be loaded. If you opened this file directly, serve the folder over HTTP instead."
        );
      });
  }
})();
