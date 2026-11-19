/*
 * "Busy workshop": simulated workers and clients so the demo keeps moving.
 * Workers start and finish pieces, quality control sends one back now and then,
 * clients approve drawings, and a new quote turns into an order when the shop runs dry.
 * Only one open tab drives it.
 */
(function () {
  const D = window.FS_DATA;
  const S = STORE;
  const me = S.uid();
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const SEC = 1000;

  function lead() {
    let mine = false;
    S.update((s) => { const p = s.pilot; if (!p || p.tab === me || Date.now() - p.at > 8 * SEC) { s.pilot = { tab: me, at: Date.now() }; mine = true; } });
    return mine;
  }

  function step() {
    const s = S.get();
    if (!s.autopilot || !lead()) return;
    const now = Date.now();
    const live = s.orders.filter((o) => o.status === "production" || o.status === "installation");
    const jobs = [];
    live.forEach((o) => o.articles.forEach((a) => { if (!S.done(a)) jobs.push({ o, a }); }));

    // Clients approve drawings after a little while.
    for (const o of s.orders) for (const a of o.articles) {
      const d = a.drawings.find((x) => x.status === "pending" && now - x.at > 35 * SEC);
      if (d && o.status !== "quote") {
        S.update((st) => { const ar = st.orders.find((x) => x.id === o.id).articles.find((x) => x.id === a.id); ar.drawings.forEach((x) => { x.status = x.rev === d.rev ? "approved" : x.status === "approved" ? "superseded" : x.status; }); });
        return;
      }
    }
    const working = jobs.filter((x) => x.a.phase === "working");
    const finishable = working.filter((x) => now - (x.a.startedAt || 0) > 14 * SEC);
    const busyAt = {}; working.forEach((x) => { const st = S.station(x.a); busyAt[st] = (busyAt[st] || 0) + 1; });
    const startable = jobs.filter((x) => x.a.phase === "queued" && !S.blocked(x.a) && (busyAt[S.station(x.a)] || 0) < 2);

    if (finishable.length && Math.random() < 0.6) {
      const { o, a } = pick(finishable);
      const qcFail = S.station(a) === "qc" && a.rejects === 0 && Math.random() < 0.15;
      S.update((st) => S.act(st, o.id, a.id, qcFail ? "reject" : "finish", null, qcFail ? D.L("Weld marks on the front edge", "Traces de soudure sur le chant avant", "آثار لحام على الحافة الأمامية").en : null));
      return;
    }
    if (startable.length) { const { o, a } = pick(startable); S.update((st) => S.act(st, o.id, a.id, "start", pick(D.WORKERS))); return; }
    // The shop is running dry: the oldest quote is accepted.
    if (jobs.length < 6) {
      const q = s.orders.filter((o) => o.status === "quote").sort((a, b) => a.createdAt - b.createdAt)[0];
      if (q && now - q.createdAt > 45 * SEC) S.update((st) => { const o = st.orders.find((x) => x.id === q.id); o.status = "production"; o.createdAt = Date.now(); o.due = Date.now() + 21 * S.DAY; o.no = o.no.replace(/^Q-/, "FW-"); S.reserve(st, o); });
    }
  }
  setInterval(step, 3500);
})();
