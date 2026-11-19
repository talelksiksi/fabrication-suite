/*
 * Shared state for every screen: orders, articles moving through the stations,
 * drawings and revisions, stock and payments. Same pattern as the restaurant
 * suite: localStorage plus a BroadcastChannel here, the venue's server and
 * SignalR in the real system.
 */
(function () {
  const KEY = "fs-state-v1";
  const D = window.FS_DATA;
  const chan = "BroadcastChannel" in window ? new BroadcastChannel("fs-suite") : null;
  const listeners = [];
  let state = null, memory = null;
  const DAY = 86400000, HOUR = 3600000;
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36));

  const load = () => { try { const r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch {} return memory; };
  const save = (s) => { memory = s; try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} };
  // Clients added from the website's quote form live in the state, next to the sample ones.
  const merge = () => { if (state && state.clients) Object.assign(D.CLIENTS, state.clients); };
  const emit = () => merge() || listeners.forEach((f) => { try { f(state); } catch (e) { console.error(e); } });

  function update(fn) {
    state = load() || state || seed();
    fn(state);
    state.rev = (state.rev || 0) + 1;
    save(state);
    if (chan) chan.postMessage(state.rev);
    emit();
    return state;
  }
  function refresh() { const s = load(); if (s && (!state || s.rev !== state.rev)) { state = s; emit(); } }

  if (chan) chan.onmessage = refresh;
  window.addEventListener("storage", (e) => { if (e.key === KEY) refresh(); });

  // ---------------------------------------------------------------- articles
  /** An article line: one template, a quantity, its route through the shop and its drawings. */
  function article(code, tpl, qty, extra) {
    const t = D.A[tpl];
    return Object.assign({ id: uid(), code, tpl, qty, route: D.ROUTES[t.kind], idx: 0, phase: "queued", worker: null, history: [], drawings: [{ rev: "A", status: "approved", at: Date.now() - 12 * DAY }], rejects: 0, note: "" }, extra || {});
  }
  const station = (a) => a.route[a.idx] || null;
  const done = (a) => a.idx >= a.route.length;
  const approved = (a) => a.drawings.some((d) => d.status === "approved") && !a.drawings.some((d) => d.status === "pending");
  /** Steps finished over steps in total, counting a step in progress as half. */
  const progress = (a) => Math.min(1, (a.idx + (a.phase === "working" ? 0.5 : 0)) / a.route.length);
  const orderProgress = (o) => o.articles.length ? o.articles.reduce((x, a) => x + progress(a), 0) / o.articles.length : 0;
  const blocked = (a) => a.idx === 0 && a.phase === "queued" && !approved(a);

  function setAt(a, idx, phase, ageH) {
    // Fill the history as if the article had already moved through the first stations.
    const now = Date.now();
    a.idx = idx; a.phase = phase;
    for (let i = 0; i < idx; i++) a.history.push({ station: a.route[i], start: now - (ageH - i * 6) * HOUR, end: now - (ageH - i * 6 - 4) * HOUR, worker: D.WORKERS[(i + a.code.length) % D.WORKERS.length] });
    if (phase === "working") { a.worker = D.WORKERS[(idx * 3) % D.WORKERS.length]; a.startedAt = now - 2 * HOUR; }
    return a;
  }

  // ---------------------------------------------------------------- seed
  function seed() {
    const now = Date.now();
    const s = { v: 1, rev: 1, seq: 41, orders: [], stock: {}, log: [], autopilot: true, created: now };
    D.MATERIALS.forEach((m) => { s.stock[m.id] = { onHand: m.onHand, reserved: 0 }; });
    const pay = (paid) => [
      { key: "advance", pct: 50, status: "paid" },
      { key: "delivery", pct: 40, status: paid >= 2 ? "paid" : paid === 1.5 ? "invoiced" : "due" },
      { key: "install", pct: 10, status: paid >= 3 ? "paid" : "due" },
    ];
    const order = (no, client, type, project, site, days, articles, extra) => Object.assign({
      id: uid(), no, client, type, project, site, createdAt: now - days * DAY, due: now + (21 - days) * DAY, status: "production",
      token: Math.random().toString(36).slice(2, 10), articles, payments: pay(0), activity: [],
    }, extra || {});

    s.orders.push(order("FW-2611-027", "greenbite", "kitchen",
      D.L("Branch kitchen, Al Yasmin", "Cuisine de l'agence Al Yasmin", "مطبخ فرع الياسمين"), D.L("Al Yasmin, Riyadh", "Al Yasmin, Riyad", "حي الياسمين، الرياض"), 24, [
        setAt(article("A01", "prep", 3), 7, "working", 120), setAt(article("A02", "sink2", 1), 7, "queued", 120),
        setAt(article("A03", "hood", 1), 8, "queued", 130), setAt(article("A04", "shelf", 4), 6, "queued", 110),
      ], { status: "installation", payments: pay(1.5), installAt: now + 1 * DAY, due: now + 2 * DAY }));

    const centralArticles = [
      setAt(article("A01", "prep", 6), 4, "working", 60), setAt(article("A02", "sink2", 2), 3, "queued", 50),
      setAt(article("A03", "hood", 1), 2, "working", 40), setAt(article("A04", "shelf", 8), 3, "queued", 44),
      setAt(article("A05", "trolley", 10), 1, "working", 20), setAt(article("A06", "pass", 1), 1, "queued", 18),
      setAt(article("A07", "drain", 2), 0, "working", 6), setAt(article("A08", "blast", 2), 0, "queued", 0),
    ];
    s.orders.push(order("FW-2611-031", "greenbite", "production",
      D.L("Central production kitchen", "Cuisine centrale de production", "المطبخ المركزي للإنتاج"), D.L("Al Malqa, Riyadh", "Al Malqa, Riyad", "حي الملقا، الرياض"), 12, centralArticles));

    const kiosk = [article("A01", "kioskFrame", 1), article("A02", "kioskCounter", 1)];
    kiosk[0].drawings = [{ rev: "A", status: "superseded", at: now - 9 * DAY }, { rev: "B", status: "approved", at: now - 3 * DAY }];
    setAt(kiosk[0], 2, "working", 30);
    kiosk[1].drawings = [{ rev: "A", status: "superseded", at: now - 9 * DAY }, { rev: "B", status: "pending", at: now - 5 * HOUR, note: D.L("Glass height 350 → 420 mm", "Hauteur de vitre 350 → 420 mm", "ارتفاع الزجاج 350 ← 420 مم") }];
    s.orders.push(order("FW-2611-034", "waha", "kiosk",
      D.L("Fresh juice kiosk, ground floor", "Kiosque à jus, rez-de-chaussée", "كشك عصائر، الطابق الأرضي"), D.L("Al Waha Mall, Riyadh", "Al Waha Mall, Riyad", "الواحة مول، الرياض"), 8, kiosk));

    s.orders.push(order("FW-2611-036", "datey", "event",
      D.L("Exhibition stand, 6 × 4 m", "Stand d'exposition, 6 × 4 m", "جناح معرض 6×4 م"), D.L("Riyadh Front exhibition hall", "Hall d'exposition Riyadh Front", "قاعة معارض واجهة الرياض"), 3,
      [setAt(article("A01", "standCounter", 2), 0, "working", 2), article("A02", "standDisplay", 4)], { due: now + 9 * DAY }));

    s.orders.push(order("Q-2611-040", "qamra", "cafe",
      D.L("Café bar, new Olaya branch", "Bar du nouveau café d'Olaya", "بار الفرع الجديد في العليا"), D.L("Al Olaya, Riyadh", "Al Olaya, Riyad", "حي العليا، الرياض"), 1,
      [article("A01", "barCounter", 1), article("A02", "backBar", 1), article("A03", "shelf", 3)], { status: "quote", due: now + 30 * DAY }));

    // Recent workshop activity, rebuilt from each article's history.
    s.orders.forEach((o) => { o.activity = o.articles.flatMap((a) => a.history.map((x) => ({ at: x.end, code: a.code, station: x.station, kind: "done" }))).filter((x) => x.at < now).sort((a, b) => b.at - a.at).slice(0, 12); });
    // Reserve material for every confirmed order.
    s.orders.filter((o) => o.status !== "quote").forEach((o) => reserve(s, o));
    return s;
  }

  /** Material each order needs, from the templates' bill of materials. */
  function needs(o) {
    const out = {};
    o.articles.forEach((a) => Object.entries(D.A[a.tpl].bom).forEach(([m, q]) => { out[m] = (out[m] || 0) + q * a.qty; }));
    Object.keys(out).forEach((k) => { out[k] = Math.ceil(out[k]); });
    return out;
  }
  function reserve(s, o) { Object.entries(needs(o)).forEach(([m, q]) => { s.stock[m].reserved += q; }); o.reserved = true; }

  /** Move an article on: start at its station, finish it, or send it back after a failed check. */
  function act(s, orderId, articleId, what, worker, note) {
    const o = s.orders.find((x) => x.id === orderId); if (!o) return;
    const a = o.articles.find((x) => x.id === articleId); if (!a || done(a)) return;
    const st = station(a);
    if (what === "start") { a.phase = "working"; a.worker = worker || D.WORKERS[0]; a.startedAt = Date.now(); }
    if (what === "finish") {
      a.history.push({ station: st, start: a.startedAt || Date.now(), end: Date.now(), worker: a.worker });
      a.idx += 1; a.phase = "queued"; a.worker = null; a.startedAt = null;
      o.activity.unshift({ at: Date.now(), code: a.code, station: st, kind: "done" });
      if (st === "cutting") { /* material is consumed once cutting is done */
        Object.entries(D.A[a.tpl].bom).forEach(([m, q]) => { const n = Math.ceil(q * a.qty); s.stock[m].onHand = Math.max(0, s.stock[m].onHand - n); s.stock[m].reserved = Math.max(0, s.stock[m].reserved - n); });
      }
    }
    if (what === "reject") {
      a.history.push({ station: st, start: a.startedAt || Date.now(), end: Date.now(), worker: a.worker, rejected: true, note });
      a.idx = a.route.indexOf("welding") >= 0 ? a.route.indexOf("welding") : Math.max(0, a.idx - 1);
      a.phase = "queued"; a.worker = null; a.rejects += 1; a.note = note || "";
      o.activity.unshift({ at: Date.now(), code: a.code, station: st, kind: "rejected", note });
    }
    o.activity = o.activity.slice(0, 30);
    // The order's stage follows its articles.
    if (o.status === "production" && o.articles.every((x) => done(x) || station(x) === "install")) o.status = "installation";
    if (o.articles.every(done)) { o.status = "done"; o.payments.forEach((p) => { if (p.key !== "advance" && p.status === "due") p.status = "invoiced"; }); }
    if (o.articles.every((x) => done(x) || ["packing", "install"].includes(station(x)))) { const p = o.payments.find((x) => x.key === "delivery"); if (p && p.status === "due") p.status = "invoiced"; }
  }

  // Indicative selling prices (SAR) per piece, by kind of article, for the demo's order values.
  const PRICE = { table: 2400, sink: 3800, hood: 9500, shelf: 650, trolley: 1900, counter: 7800, drain: 2600, cabinet: 6400, kiosk: 38000, display: 5200 };
  const value = (o) => o.articles.reduce((x, a) => x + PRICE[D.A[a.tpl].kind] * a.qty, 0);
  const nextRev = (a) => String.fromCharCode(Math.max(...a.drawings.map((d) => d.rev.charCodeAt(0))) + 1);

  function reset() { state = seed(); save(state); if (chan) chan.postMessage(-1); emit(); }
  /** A quote request from the public website: a new client and draft articles for the office to price. */
  const STARTER = { kitchen: ["prep", "sink2", "shelf"], production: ["prep", "trolley", "drain", "blast"], kiosk: ["kioskFrame", "kioskCounter"], event: ["standCounter", "standDisplay"], cafe: ["barCounter", "backBar"] };
  function quoteRequest(s, f) {
    const cid = "web-" + uid().slice(0, 8);
    const nm = f.company || f.name || "New client";
    s.clients = s.clients || {};
    s.clients[cid] = { name: { en: nm, fr: nm, ar: nm }, sector: { en: f.city || "", fr: f.city || "", ar: f.city || "" }, contact: f.name, web: true };
    s.seq += 1;
    const proj = f.msg ? f.msg.slice(0, 60) : "";
    const o = {
      id: uid(), no: "Q-2611-0" + s.seq, client: cid, type: f.type, status: "quote", fromWeb: true,
      project: proj ? { en: proj, fr: proj, ar: proj } : D.TYPES[f.type], site: { en: f.city || "Riyadh", fr: f.city || "Riyad", ar: f.city || "الرياض" },
      createdAt: Date.now(), due: Date.now() + 30 * DAY, token: Math.random().toString(36).slice(2, 10), payments: [{ key: "advance", pct: 50, status: "due" }, { key: "delivery", pct: 40, status: "due" }, { key: "install", pct: 10, status: "due" }], activity: [],
      articles: STARTER[f.type].map((tpl, i) => { const a = article("A0" + (i + 1), tpl, 1 + (i % 2)); a.drawings = [{ rev: "A", status: "pending", at: Date.now() }]; return a; }),
    };
    s.orders.push(o);
    return o;
  }

  state = load();
  if (!state || state.v !== 1) { state = seed(); save(state); }
  merge();

  window.STORE = { get: () => state, update, reset, subscribe: (f) => listeners.push(f), uid, article, station, done, approved, progress, orderProgress, blocked, needs, reserve, act, value, nextRev, quoteRequest, DAY, HOUR };
})();
