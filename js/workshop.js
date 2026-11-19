/* Workshop tablet: one station at a time, the approved drawing, start and done. */
(function () {
  const D = window.FS_DATA;
  const { h, toast, modal, svgNode } = window.UI;
  const { t, L } = window.I18N;
  const S = STORE;
  const q = new URLSearchParams(location.search);
  let station = D.STATIONS[q.get("station")] ? q.get("station") : "welding";

  document.body.classList.add("shop");
  const head = h("nav", { class: "shop-head", "aria-label": t("pickStation") });
  const body = h("main", { class: "shop-body" });
  document.body.append(UI.bar("🛠️", "workshop", null), head, body);

  const client = (o) => L(D.CLIENTS[o.client].name);
  const approvedRev = (a) => a.drawings.filter((d) => d.status === "approved").slice(-1)[0];

  function jobsAt(s, st) {
    const out = [];
    s.orders.filter((o) => o.status === "production" || o.status === "installation").forEach((o) => o.articles.forEach((a) => { if (S.station(a) === st) out.push({ o, a }); }));
    return out.sort((x, y) => x.o.due - y.o.due);
  }

  function showDrawing(o, a) {
    const r = approvedRev(a) || a.drawings[a.drawings.length - 1];
    const m = modal(`${o.no} · ${a.code} · ${t("rev")} ${r.rev}`, h("div", { class: "drawing-box" }, svgNode(DRAWING.svg(o, a, r.rev, r.status))));
    m.el.querySelector(".box").classList.add("wide");
  }

  function startJob(o, a) {
    const pick = h("div", { class: "opts" }, D.WORKERS.map((w) => h("button", { class: "opt", type: "button", onclick: () => { S.update((s) => S.act(s, o.id, a.id, "start", w)); m.close(); toast(`${a.code} · ${w}`); } }, "👷 " + w)));
    const m = modal(t("who"), pick, [[t("cancel"), null]]);
  }
  function reject(o, a) {
    const input = h("input", { type: "text", placeholder: t("rejectPh"), maxlength: "90" });
    modal(t("rejectWhy"), h("label", { class: "field" }, h("span", {}, `${o.no} · ${a.code}`), input), [[t("cancel"), null], [t("reject"), () => { S.update((s) => S.act(s, o.id, a.id, "reject", null, input.value.trim() || t("reworkNote"))); }, "primary"]]);
  }

  function job({ o, a }) {
    const tp = D.A[a.tpl];
    const blocked = S.blocked(a);
    const next = a.route[a.idx + 1];
    const r = approvedRev(a);
    const acts = [];
    if (blocked) acts.push(h("span", { class: "chip amber" }, "⏳ " + t("blockedDrawing")));
    else if (a.phase === "queued") acts.push(h("button", { class: "btn primary big", type: "button", onclick: () => startJob(o, a) }, "▶ " + t("start")));
    else if (station === "qc") acts.push(h("button", { class: "btn primary big", type: "button", onclick: () => S.update((s) => S.act(s, o.id, a.id, "finish")) }, "✓ " + t("pass")), h("button", { class: "btn big", type: "button", onclick: () => reject(o, a) }, "↩ " + t("reject")));
    else acts.push(h("button", { class: "btn primary big", type: "button", onclick: () => { S.update((s) => S.act(s, o.id, a.id, "finish")); toast(`${a.code} → ${next ? L(D.STATIONS[next].name) : t("finished")}`); } }, "✓ " + t("finish")));
    return h("article", { class: "job " + (a.phase === "working" ? "work" : blocked ? "block" : "") },
      h("button", { class: "thumb", type: "button", "aria-label": t("openDrawing"), onclick: () => showDrawing(o, a) }, svgNode(DRAWING.thumb(o, a))),
      h("div", { class: "info" },
        h("div", { class: "top" }, h("b", { class: "code" }, a.code), h("span", { class: "mono small muted" }, o.no), h("span", { class: "small muted" }, "· " + client(o))),
        h("div", { class: "nm" }, L(tp.name)),
        h("div", { class: "specs" }, h("span", { class: "chip teal" }, `× ${a.qty} ${t("pieces")}`), h("span", { class: "chip" }, h("bdi", {}, tp.dims.join(" × "))), h("span", { class: "chip" }, `${t("grade")} ${tp.grade} · ${tp.t} mm`), r ? h("span", { class: "chip pine" }, `${t("approvedRev")} ${r.rev}`) : null),
        a.note && a.rejects ? h("div", { class: "note" }, `↩ ${t("reworkNote")}: ${a.note}`) : null,
        a.phase === "working" ? h("div", { class: "small muted" }, `👷 ${a.worker} · ${t("since")} ${I18N.clock(a.startedAt)}`) : null,
        next ? h("div", { class: "small muted" }, `${t("nextStation")}: ${D.STATIONS[next].icon} ${L(D.STATIONS[next].name)}`) : null,
        h("div", { class: "acts" }, acts)));
  }

  function render(s) {
    UI.put(head, ...Object.keys(D.STATIONS).map((st) => h("a", { href: `?station=${st}`, "aria-current": st === station ? "page" : null, onclick: (e) => { e.preventDefault(); station = st; history.replaceState(null, "", `?station=${st}`); render(S.get()); } },
      D.STATIONS[st].icon, " ", L(D.STATIONS[st].name), h("span", { class: "c" }, String(jobsAt(s, st).length)))));
    const jobs = jobsAt(s, station);
    const working = jobs.filter((x) => x.a.phase === "working");
    const queued = jobs.filter((x) => x.a.phase !== "working");
    UI.put(body, 
      h("section", {}, h("h2", {}, h("span", {}, t("inProgress")), h("span", {}, String(working.length))), working.length ? working.map(job) : h("p", { class: "muted small" }, t("noneHere"))),
      h("section", {}, h("h2", {}, h("span", {}, t("queue")), h("span", {}, String(queued.length))), queued.length ? queued.map(job) : h("p", { class: "muted small" }, t("nothingQueued"))));
  }
  UI.live(render);
})();
