/* Office: orders, quotes, drawings and revisions, the production board and stock. */
(function () {
  const D = window.FS_DATA;
  const { h, toast, modal, dueChip, pbar, pct, svgNode } = window.UI;
  const { t, L, money } = window.I18N;
  const S = STORE;

  const q = new URLSearchParams(location.search);
  let tab = q.get("tab") || "orders";
  let selected = null;

  const app = h("div", { class: "off-app" });
  const nav = h("nav", { class: "off-nav" });
  const main = h("main", { class: "off-main" });
  app.append(nav, main);
  document.body.append(UI.bar("🏭", "office", null), app);

  const STATUS_CHIP = { quote: "amber", production: "teal", installation: "dawn", done: "pine" };
  const client = (o) => L(D.CLIENTS[o.client].name);
  const spec = (a) => { const tp = D.A[a.tpl]; return `${tp.dims.join(" × ")} · ${tp.grade} · ${tp.t} mm`; };
  const trackUrl = (o) => new URL(`track.html?o=${o.token}`, location.href).href;
  const currentRev = (a) => a.drawings.filter((d) => d.status !== "superseded").slice(-1)[0];

  function stateText(a) {
    if (S.done(a)) return h("span", { class: "chip pine" }, t("finished"));
    if (S.blocked(a)) return h("span", { class: "chip amber" }, t("blockedDrawing"));
    const st = D.STATIONS[S.station(a)];
    return h("span", { class: "chip " + (a.phase === "working" ? "dawn" : "") }, `${st.icon} ${L(st.name)}`, a.phase === "working" && a.worker ? ` · ${a.worker}` : "");
  }
  const steps = (a) => h("div", { class: "steps", title: `${a.idx}/${a.route.length}` }, a.route.map((st, i) => h("i", { class: i < a.idx ? "done" : i === a.idx ? "now" + (a.phase === "working" ? "" : " wait") : "", title: L(D.STATIONS[st].name) })));

  // ---------------------------------------------------------------- left column
  function renderNav(s) {
    const tabs = h("div", { class: "off-tabs", role: "tablist" }, [["orders", "orders"], ["quotes", "quotes"], ["board", "board"], ["stock", "stock"]].map(([id, key]) =>
      h("button", { type: "button", role: "tab", "aria-selected": String(tab === id), onclick: () => { tab = id; if (id === "quotes") selected = (s.orders.find((o) => o.status === "quote") || {}).id || null; if (id === "orders") selected = null; render(S.get()); } }, t(key),
        id === "quotes" && s.orders.some((o) => o.status === "quote") ? h("span", { class: "chip amber", style: "margin-inline-start:4px;padding:0 6px" }, String(s.orders.filter((o) => o.status === "quote").length)) : null)));
    const list = s.orders.filter((o) => (tab === "quotes" ? o.status === "quote" : o.status !== "quote")).sort((a, b) => (a.status === "done") - (b.status === "done") || a.due - b.due);
    UI.put(nav, tabs, h("div", { class: "olist" }, list.length ? list.map((o) => {
      const p = S.orderProgress(o);
      return h("button", { class: "oitem", type: "button", "aria-current": String(selected === o.id), onclick: () => { selected = o.id; if (tab !== "quotes") tab = "orders"; render(S.get()); } },
        h("div", { class: "top" }, h("b", {}, client(o)), h("span", { class: "no" }, o.no)),
        h("div", { class: "sub2" }, L(o.project)),
        o.status === "quote" ? h("div", { class: "row2" }, h("span", { class: "chip amber" }, t("status_quote")), h("bdi", { class: "num small" }, money(S.value(o))))
          : h("div", { class: "row2" }, pbar(p, o.status === "done" ? "pine" : ""), h("span", { class: "p" }, pct(p)), dueChip(o.due, o.status === "done")));
    }) : h("p", { class: "muted small", style: "padding:8px" }, t("noneHere"))));
  }

  // ---------------------------------------------------------------- drawings
  function openDrawing(orderId, articleId, revWanted) {
    const paint = () => {
      const s = S.get(); const o = s.orders.find((x) => x.id === orderId); const a = o.articles.find((x) => x.id === articleId);
      const cur = revWanted ? a.drawings.find((d) => d.rev === revWanted) : currentRev(a);
      UI.put(body, 
        h("div", { class: "revs" }, a.drawings.map((d) => h("button", { class: "drawchip", type: "button", "aria-pressed": String(d.rev === cur.rev), onclick: () => { revWanted = d.rev; paint(); } },
          `${t("rev")} ${d.rev}`, h("span", { class: "chip " + ({ approved: "pine", pending: "amber", superseded: "" })[d.status] }, t("rev_" + d.status))))),
        cur.note ? h("p", { class: "small muted", style: "margin:0" }, t("change") + ": " + L(cur.note)) : null,
        h("div", { class: "drawing-box" }, svgNode(DRAWING.svg(o, a, cur.rev, cur.status))),
        h("div", { class: "small muted" }, `${a.code}_${o.no}_Rev${cur.rev}.dwg · ${a.code}_${o.no}_Rev${cur.rev}.pdf`));
    };
    const body = h("div", { style: "display:grid;gap:10px" });
    const m = modal(t("drawing"), body, [[t("newRev"), () => { newRevision(orderId, articleId); return true; }], [t("close"), null, "primary"]]);
    m.el.querySelector(".box").classList.add("wide");
    paint();
  }
  function newRevision(orderId, articleId) {
    const input = h("input", { type: "text", placeholder: t("changePh"), maxlength: "90" });
    modal(t("newRev"), [h("p", { class: "small muted", style: "margin:0" }, t("newRevQ")), h("label", { class: "field" }, h("span", {}, t("change")), input)], [[t("cancel"), null], [t("sendClient"), () => {
      S.update((s) => {
        const a = s.orders.find((x) => x.id === orderId).articles.find((x) => x.id === articleId);
        a.drawings.forEach((d) => { if (d.status === "pending") d.status = "superseded"; });
        a.drawings.push({ rev: S.nextRev(a), status: "pending", at: Date.now(), note: input.value.trim() || null });
      });
      toast(t("sendClient") + " ✓");
    }, "primary"]]);
  }

  // ---------------------------------------------------------------- order detail
  function renderOrder(s) {
    const o = s.orders.find((x) => x.id === selected);
    if (!o) { UI.put(main, h("p", { class: "muted" }, t("pickOrder"))); return; }
    const val = S.value(o);
    const p = S.orderProgress(o);
    const isQuote = o.status === "quote";
    const needs = S.needs(o);
    const rows = o.articles.map((a) => {
      const cur = currentRev(a);
      return h("tr", {},
        h("td", { class: "code" }, a.code),
        h("td", {}, h("div", { class: "nm" }, L(D.A[a.tpl].name)), h("div", { class: "md" }, h("bdi", {}, spec(a)), " · ", `${t("qty")} ${a.qty}`), a.rejects ? h("div", { class: "md", style: "color:var(--red)" }, `${t("reworkNote")}: ${a.note}`) : null),
        h("td", {}, h("button", { class: "drawchip", type: "button", onclick: () => openDrawing(o.id, a.id) }, `${t("rev")} ${cur.rev}`, cur.status === "pending" ? h("span", { class: "chip amber" }, "⏳") : h("span", { class: "chip pine" }, "✓"))),
        isQuote ? null : h("td", {}, steps(a), h("div", { style: "margin-top:5px" }, stateText(a))));
    });
    UI.put(main, 
      h("div", { class: "ohead" },
        h("div", {}, h("div", { style: "display:flex;gap:8px;align-items:center;flex-wrap:wrap" }, h("h2", {}, client(o)), h("span", { class: "chip " + STATUS_CHIP[o.status] }, t("status_" + o.status)), h("span", { class: "chip" }, L(D.TYPES[o.type]))),
          h("div", { class: "meta" }, h("span", {}, h("b", {}, L(o.project))), h("span", {}, "📍 " + L(o.site)), h("span", { class: "mono" }, o.no), h("span", {}, t("value") + ": ", h("bdi", { class: "num" }, h("b", {}, money(val)))),
            h("span", {}, t("due") + ": " + I18N.day(o.due)), o.installAt ? h("span", {}, t("installOn") + ": " + I18N.day(o.installAt)) : null)),
        h("div", { class: "acts" }, isQuote ? h("button", { class: "btn primary", type: "button", onclick: () => accept(o.id) }, t("accept"))
          : [h("button", { class: "btn", type: "button", onclick: () => { navigator.clipboard && navigator.clipboard.writeText(trackUrl(o)).catch(() => {}); toast(t("copied")); } }, "🔗 " + t("copyLink")),
            h("a", { class: "btn", href: trackUrl(o), target: "_blank", rel: "noopener" }, t("openLink") + " ↗")])),
      isQuote ? null : h("div", { class: "card panel", style: "margin-bottom:14px;display:flex;align-items:center;gap:14px" }, h("b", {}, t("progress")), h("div", { style: "flex:1" }, pbar(p, "big " + (o.status === "done" ? "pine" : ""))), h("b", { class: "num" }, pct(p)), dueChip(o.due, o.status === "done")),
      h("div", { class: "grid2" },
        h("section", { class: "card panel", style: "overflow:auto" }, h("h3", {}, h("span", {}, t("articles")), h("span", { class: "chip" }, String(o.articles.length))),
          h("table", { class: "art" }, h("thead", {}, h("tr", {}, [t("article"), "", t("drawing"), isQuote ? null : t("station")].filter((x) => x !== null).map((x) => h("th", {}, x)))), h("tbody", {}, rows))),
        h("div", { style: "display:grid;gap:14px" },
          h("section", { class: "card panel" }, h("h3", {}, t("payments")), h("div", { class: "pay" }, o.payments.map((x) => h("div", {},
            h("span", {}, `${t("pay_" + x.key)} · ${x.pct}%`), h("bdi", { class: "num" }, money((val * x.pct) / 100)),
            h("small", {}, h("span", { class: "chip " + ({ paid: "pine", invoiced: "amber", due: "" })[x.status] }, t("pay_" + x.status))))))),
          h("section", { class: "card panel" }, h("h3", {}, t("needsMat")), h("div", { class: "need" }, Object.entries(needs).map(([m, n]) => {
            const mat = D.MATERIALS.find((x) => x.id === m); const st = s.stock[m]; const avail = st.onHand - st.reserved + (o.reserved ? n : 0);
            return h("div", {}, h("span", {}, L(mat.name)), h("span", {}, h("bdi", { class: "num" }, `${n} ${L(D.UNITS[mat.unit])}`), avail < n ? h("span", { class: "chip red", style: "margin-inline-start:6px" }, t("short")) : null));
          }))),
          isQuote ? null : h("section", { class: "card panel" }, h("h3", {}, t("activity")), o.activity.length ? h("div", { class: "feed" }, o.activity.slice(0, 8).map((ev) => h("div", {},
            h("span", { class: "t" }, I18N.clock(ev.at)), h("span", {}, h("b", { class: "mono" }, ev.code), " · ", ev.kind === "approved" ? "" : L(D.STATIONS[ev.station].name), " ", ev.kind === "rejected" ? h("span", { class: "chip red" }, t("reworkNote")) : ev.kind === "approved" ? h("span", { class: "chip amber" }, "✍️ " + t("drawing") + " · " + t("rev_approved")) : h("span", { class: "chip pine" }, "✓"))))) : h("p", { class: "small muted", style: "margin:0" }, t("noneHere"))))));
  }

  function accept(id) {
    S.update((s) => { const o = s.orders.find((x) => x.id === id); o.status = "production"; o.createdAt = Date.now(); o.due = Date.now() + 21 * S.DAY; o.no = o.no.replace(/^Q-/, "FW-"); S.reserve(s, o); });
    tab = "orders"; toast(t("accepted")); render(S.get());
  }

  // ---------------------------------------------------------------- board & stock
  function renderBoard(s) {
    const live = s.orders.filter((o) => o.status === "production" || o.status === "installation");
    UI.put(main, h("h2", { style: "font-size:20px;margin-bottom:12px" }, t("board")), h("div", { class: "kanban" }, Object.keys(D.STATIONS).map((st) => {
      const cards = [];
      live.forEach((o) => o.articles.forEach((a) => { if (S.station(a) === st) cards.push({ o, a }); }));
      cards.sort((x, y) => (y.a.phase === "working") - (x.a.phase === "working") || x.o.due - y.o.due);
      return h("section", { class: "kcol" }, h("h4", {}, h("span", {}, D.STATIONS[st].icon + " " + L(D.STATIONS[st].name)), h("span", { class: "chip" }, String(cards.length))),
        cards.map(({ o, a }) => h("button", { class: "kcard " + (a.phase === "working" ? "work" : S.blocked(a) ? "block" : ""), type: "button", style: "text-align:start", onclick: () => { selected = o.id; tab = "orders"; render(S.get()); } },
          h("span", { class: "no" }, `${o.no} · ${a.code}`), h("b", {}, L(D.A[a.tpl].name)), h("span", {}, `${client(o)} · ×${a.qty}`), a.phase === "working" ? h("span", { class: "chip dawn" }, "👷 " + a.worker) : S.blocked(a) ? h("span", { class: "chip amber" }, t("blockedDrawing")) : null)));
    })));
  }
  function renderStock(s) {
    const STEP = { sheet: 20, bar: 30, pc: 50, m2: 10 };
    UI.put(main, h("h2", { style: "font-size:20px;margin-bottom:12px" }, t("stock")), h("div", { class: "card", style: "overflow:auto" }, h("table", { class: "stk" },
      h("thead", {}, h("tr", {}, [t("material"), "", t("onHand"), t("reserved"), t("available"), t("minimum"), ""].map((x) => h("th", {}, x)))),
      h("tbody", {}, D.MATERIALS.map((m) => {
        const st = s.stock[m.id]; const avail = st.onHand - st.reserved; const u = L(D.UNITS[m.unit]);
        return h("tr", { class: avail < m.min ? "low" : "" }, h("td", {}, h("b", {}, L(m.name)), avail < m.min ? h("div", {}, h("span", { class: "chip red" }, t("lowStock"))) : null), h("td", { class: "muted small" }, h("bdi", {}, m.spec)),
          h("td", { class: "n" }, `${st.onHand}`), h("td", { class: "n" }, `${st.reserved}`), h("td", { class: "n" }, h("b", {}, `${avail}`), " ", u), h("td", { class: "n" }, `${m.min}`),
          h("td", {}, h("button", { class: "btn", type: "button", style: "min-height:32px;padding:4px 10px", onclick: () => { S.update((x) => { x.stock[m.id].onHand += STEP[m.unit]; }); toast(`+${STEP[m.unit]} ${u} ${t("received")}`); } }, "+" + STEP[m.unit] + " " + t("receive"))));
      })))));
  }

  function render(s) {
    if (!selected && tab === "orders") selected = (s.orders.find((o) => o.no === "FW-2611-031") || s.orders.find((o) => o.status !== "quote") || {}).id || null;
    if (tab === "quotes" && !s.orders.some((o) => o.id === selected && o.status === "quote")) selected = (s.orders.find((o) => o.status === "quote") || {}).id || null;
    renderNav(s);
    if (tab === "board") renderBoard(s); else if (tab === "stock") renderStock(s); else renderOrder(s);
  }
  if (q.get("o")) selected = (S.get().orders.find((o) => o.no === q.get("o")) || {}).id || null;
  UI.live(render);
})();
