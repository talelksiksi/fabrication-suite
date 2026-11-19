/* Client tracking page: one private link per order, no account. */
(function () {
  const D = window.FS_DATA;
  const { h, toast, modal, svgNode, pct, pbar } = window.UI;
  const { t, L, money } = window.I18N;
  const S = STORE;
  const token = new URLSearchParams(location.search).get("o");

  document.body.classList.add("track");
  const hero = h("header", { class: "tr-hero" });
  const wrap = h("main", { class: "tr-wrap" });
  document.body.append(hero, wrap);

  const find = (s) => s.orders.find((o) => o.token === token) || (!token ? s.orders.find((o) => o.no === "FW-2611-034") : null);

  function ring(p) {
    const r = 38, c = 2 * Math.PI * r;
    return svgNode(`<svg viewBox="0 0 92 92" aria-hidden="true"><circle cx="46" cy="46" r="${r}" fill="none" stroke="#d9e1df" stroke-width="9"/><circle cx="46" cy="46" r="${r}" fill="none" stroke="#2f5a46" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c * p} ${c}" transform="rotate(-90 46 46)"/><text x="46" y="52" text-anchor="middle" font-size="18" font-weight="700" fill="#1f2e2f" font-family="JetBrains Mono, monospace">${Math.round(p * 100)}%</text></svg>`);
  }

  function milestones(o) {
    const past = (st) => o.articles.every((a) => S.done(a) || (a.route.indexOf(st) >= 0 ? a.idx > a.route.indexOf(st) : a.idx >= a.route.length - 1));
    const at = (st) => o.articles.some((a) => S.station(a) === st);
    const started = o.articles.some((a) => a.idx > 0 || a.phase === "working");
    const list = [
      ["m_confirmed", true, false, I18N.day(o.createdAt)],
      ["m_production", started, o.status === "production" && !past("assembly"), ""],
      ["m_qc", past("qc"), at("qc"), ""],
      ["m_delivery", past("packing"), at("packing"), ""],
      ["m_install", o.status === "done", o.status === "installation", o.installAt ? I18N.day(o.installAt) : ""],
    ];
    return h("div", { class: "timeline" }, list.map(([k, on, now, when]) => h("div", { class: on && !now ? "on" : now ? "now" : "" }, h("span", { class: "dotc" }), h("span", {}, t(k)), h("span", { class: "small muted" }, when))));
  }

  function approve(o, a, rev) {
    S.update((s) => {
      const ar = s.orders.find((x) => x.id === o.id).articles.find((x) => x.id === a.id);
      ar.drawings.forEach((d) => { if (d.rev === rev) d.status = "approved"; else if (d.status !== "superseded") d.status = "superseded"; });
      s.orders.find((x) => x.id === o.id).activity.unshift({ at: Date.now(), code: a.code, station: "cutting", kind: "approved" });
    });
    toast(t("approvedThanks"));
  }
  function showDrawing(o, a, d) {
    const m = modal(`${a.code} · ${t("rev")} ${d.rev}`, h("div", { class: "drawing-box" }, svgNode(DRAWING.svg(o, a, d.rev, d.status))),
      d.status === "pending" ? [[t("requestChange"), () => toast(t("changeSent"))], [t("approve"), () => approve(o, a, d.rev), "primary"]] : null);
    m.el.querySelector(".box").classList.add("wide");
  }

  function render(s) {
    const o = find(s);
    if (!o) { UI.put(hero, h("div", { class: "row" }, h("b", {}, L(D.SHOP.name)), h("span", { class: "grow" }), I18N.switcher())); UI.put(wrap, h("div", { class: "card panel" }, t("orderNotFound"))); return; }
    const p = S.orderProgress(o);
    UI.put(hero, 
      h("div", { class: "row" }, h("b", {}, L(D.SHOP.name)), h("span", { class: "grow" }), I18N.switcher()),
      h("h1", {}, L(o.project)), h("p", {}, `${L(D.CLIENTS[o.client].name)} · ${L(o.site)}`), h("p", { class: "mono", style: "margin-top:4px;font-size:12.5px" }, `${t("order")} ${o.no}`));
    const pending = [];
    o.articles.forEach((a) => a.drawings.filter((d) => d.status === "pending").forEach((d) => pending.push({ a, d })));
    const value = S.value(o);
    UI.put(wrap, 
      h("section", { class: "card ring" }, ring(p), h("div", { style: "display:grid;gap:4px" }, h("span", { class: "big" }, t("overall")), h("span", { class: "chip " + ({ production: "teal", installation: "dawn", done: "pine" })[o.status] }, t("status_" + o.status)),
        h("span", { class: "small muted" }, `${t("due")}: ${I18N.day(o.due)}`, o.installAt ? ` · ${t("installOn")}: ${I18N.day(o.installAt)}` : ""))),
      pending.length ? h("section", { class: "approve-card" }, h("b", {}, "✍️ " + t("toApprove")), pending.map(({ a, d }) => h("div", { style: "display:flex;gap:10px;align-items:center;flex-wrap:wrap" },
        h("div", { style: "flex:1;min-width:180px" }, h("div", {}, h("b", { class: "mono" }, a.code), " " + L(D.A[a.tpl].name)), h("div", { class: "small muted" }, `${t("rev")} ${d.rev}`, d.note ? " · " + L(d.note) : "")),
        h("button", { class: "btn", type: "button", onclick: () => showDrawing(o, a, d) }, t("view")), h("button", { class: "btn primary", type: "button", onclick: () => approve(o, a, d.rev) }, t("approve"))))) : null,
      h("section", { class: "card panel" }, h("h3", {}, t("milestones")), milestones(o)),
      h("section", { class: "card panel" }, h("h3", {}, t("articles")), h("div", { class: "tr-list" }, o.articles.map((a) => {
        const st = S.station(a); const done = S.done(a); const ap = a.drawings.filter((d) => d.status === "approved").slice(-1)[0];
        return h("div", { class: "tr-art", style: "border-bottom:1px solid var(--fog)" },
          h("div", { class: "top" }, h("span", { class: "nm" }, h("span", { class: "mono", style: "color:var(--teal-d)" }, a.code), " " + L(D.A[a.tpl].name), h("span", { class: "small muted" }, ` × ${a.qty}`)), h("b", { class: "num small" }, pct(S.progress(a)))),
          pbar(S.progress(a), done ? "pine" : ""),
          h("div", { style: "display:flex;gap:6px;flex-wrap:wrap;align-items:center" },
            done ? h("span", { class: "chip pine" }, "✓ " + t("finished")) : S.blocked(a) ? h("span", { class: "chip amber" }, t("blockedDrawing")) : h("span", { class: "chip " + (a.phase === "working" ? "dawn" : "") }, `${D.STATIONS[st].icon} ${L(D.STATIONS[st].name)} · ${a.phase === "working" ? t("working") : t("waiting")}`),
            h("span", { class: "small muted" }, `${t("stepOf")} ${Math.min(a.idx + 1, a.route.length)} ${t("of")} ${a.route.length}`),
            ap ? h("button", { class: "drawchip", type: "button", onclick: () => showDrawing(o, a, ap) }, `📄 ${t("rev")} ${ap.rev}`) : null));
      }))),
      h("section", { class: "card panel" }, h("h3", {}, t("payments")), h("div", { class: "pay" }, o.payments.map((x) => h("div", {},
        h("span", {}, `${t("pay_" + x.key)} · ${x.pct}%`), h("bdi", { class: "num" }, money((value * x.pct) / 100)), h("small", {}, h("span", { class: "chip " + ({ paid: "pine", invoiced: "amber", due: "" })[x.status] }, t("pay_" + x.status))))))),
      h("button", { class: "btn primary big block", type: "button", onclick: () => toast(D.SHOP.whatsapp + " · demo") }, "💬 " + t("contactTeam")),
      h("p", { class: "small muted", style: "text-align:center;margin:0" }, t("privateLink"), " · ", t("demoSiteNote")));
  }
  UI.live(render);
})();
