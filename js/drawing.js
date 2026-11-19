/*
 * Shop drawings, drawn on the fly as SVG: plan and front view with dimensions and a
 * title block. In the real system this is the PDF exported next to each .dwg file;
 * here it stands in for it so the workshop tablet and the client page have
 * something real to look at.
 */
(function () {
  const D = window.FS_DATA;
  const W = 840, H = 594, INK = "#1b2a2e", DIM = "#3d6d78", FAINT = "#9fb0b2";

  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const line = (x1, y1, x2, y2, c = INK, w = 1.4, dash) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
  const rect = (x, y, w, h, c = INK, sw = 1.6, fill = "none") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${c}" stroke-width="${sw}"/>`;
  const text = (x, y, s, size = 11, c = INK, anchor = "middle", extra = "") => `<text x="${x}" y="${y}" font-size="${size}" fill="${c}" text-anchor="${anchor}" font-family="JetBrains Mono, Consolas, monospace" ${extra}>${esc(s)}</text>`;
  const arrow = (x, y, dir) => { const s = 5; const pts = { l: `${x},${y} ${x + s},${y - 2.5} ${x + s},${y + 2.5}`, r: `${x},${y} ${x - s},${y - 2.5} ${x - s},${y + 2.5}`, u: `${x},${y} ${x - 2.5},${y + s} ${x + 2.5},${y + s}`, d: `${x},${y} ${x - 2.5},${y - s} ${x + 2.5},${y - s}` }[dir]; return `<polygon points="${pts}" fill="${DIM}"/>`; };
  function hdim(x1, x2, y, label) { return line(x1, y, x2, y, DIM, 0.9) + line(x1, y - 6, x1, y + 6, DIM, 0.9) + line(x2, y - 6, x2, y + 6, DIM, 0.9) + arrow(x1, y, "l") + arrow(x2, y, "r") + text((x1 + x2) / 2, y - 4, label, 10.5, DIM); }
  function vdim(y1, y2, x, label) { return line(x, y1, x, y2, DIM, 0.9) + line(x - 6, y1, x + 6, y1, DIM, 0.9) + line(x - 6, y2, x + 6, y2, DIM, 0.9) + arrow(x, y1, "u") + arrow(x, y2, "d") + text(x - 5, (y1 + y2) / 2, label, 10.5, DIM, "middle", `transform="rotate(-90 ${x - 5} ${(y1 + y2) / 2})"`); }

  /** Fit a w×h (mm) box inside an area, keeping proportions. */
  function fit(w, h, area) { const k = Math.min(area.w / w, area.h / h); return { k, x: area.x + (area.w - w * k) / 2, y: area.y + (area.h - h * k) / 2, w: w * k, h: h * k }; }

  function planView(kind, w, d, b) {
    let s = rect(b.x, b.y, b.w, b.h);
    if (kind === "sink") { const bw = b.w * 0.27, bh = b.h * 0.6; [0.2, 0.53].forEach((p) => { s += rect(b.x + b.w * p, b.y + b.h * 0.2, bw, bh, INK, 1.1); s += `<circle cx="${b.x + b.w * p + bw / 2}" cy="${b.y + b.h * 0.2 + bh / 2}" r="3" fill="none" stroke="${INK}"/>`; }); }
    if (kind === "hood") for (let i = 1; i < 5; i++) s += line(b.x + (b.w * i) / 5, b.y + 4, b.x + (b.w * i) / 5, b.y + b.h - 4, FAINT, 1);
    if (kind === "drain") for (let i = 1; i < 40; i++) s += line(b.x + (b.w * i) / 40, b.y + 2, b.x + (b.w * i) / 40, b.y + b.h - 2, FAINT, 0.8);
    if (kind === "kiosk") { s += rect(b.x + 8, b.y + 8, b.w * 0.8, b.h * 0.22, INK, 1.1); s += rect(b.x + 8, b.y + 8, b.w * 0.2, b.h * 0.8, INK, 1.1); }
    if (kind === "counter" || kind === "table" || kind === "cabinet" || kind === "display") s += line(b.x, b.y + b.h * 0.12, b.x + b.w, b.y + b.h * 0.12, FAINT, 1, "4 3");
    return s;
  }
  function frontView(kind, w, h, b) {
    let s = "";
    const legs = (n = 2) => { for (let i = 0; i < n; i++) { const x = b.x + 10 + (i * (b.w - 26)) / (n - 1); s += rect(x, b.y + b.h * 0.06, 6, b.h * 0.94); } };
    if (kind === "table" || kind === "sink") { s += rect(b.x, b.y, b.w, b.h * 0.06); legs(kind === "sink" ? 3 : 3); s += line(b.x + 10, b.y + b.h * 0.8, b.x + b.w - 10, b.y + b.h * 0.8, INK, 2); if (kind === "sink") s += rect(b.x + b.w * 0.15, b.y - b.h * 0.12, b.w * 0.7, b.h * 0.12, INK, 1.1); }
    else if (kind === "counter" || kind === "cabinet") { s += rect(b.x, b.y, b.w, b.h); const n = Math.max(2, Math.round(w / 600)); for (let i = 1; i < n; i++) s += line(b.x + (b.w * i) / n, b.y + b.h * 0.08, b.x + (b.w * i) / n, b.y + b.h); for (let i = 0; i < n; i++) s += line(b.x + (b.w * (i + 0.5)) / n - 8, b.y + b.h * 0.2, b.x + (b.w * (i + 0.5)) / n + 8, b.y + b.h * 0.2, INK, 2); s += line(b.x, b.y + b.h * 0.08, b.x + b.w, b.y + b.h * 0.08); }
    else if (kind === "hood") { s += `<polygon points="${b.x},${b.y + b.h} ${b.x + b.w},${b.y + b.h} ${b.x + b.w * 0.9},${b.y} ${b.x + b.w * 0.1},${b.y}" fill="none" stroke="${INK}" stroke-width="1.6"/>`; s += line(b.x + 6, b.y + b.h * 0.7, b.x + b.w - 6, b.y + b.h * 0.7, FAINT); }
    else if (kind === "shelf") { [0.1, 0.9].forEach((p) => { s += rect(b.x, b.y + b.h * p - 3, b.w, 6); }); s += line(b.x + 10, b.y, b.x + 10, b.y + b.h, INK, 1); s += line(b.x + b.w - 10, b.y, b.x + b.w - 10, b.y + b.h, INK, 1); }
    else if (kind === "trolley") { s += rect(b.x, b.y, b.w, b.h * 0.93); for (let i = 1; i < 15; i++) s += line(b.x + 3, b.y + (b.h * 0.93 * i) / 15, b.x + b.w - 3, b.y + (b.h * 0.93 * i) / 15, FAINT, 1); [0.12, 0.88].forEach((p) => { s += `<circle cx="${b.x + b.w * p}" cy="${b.y + b.h * 0.965}" r="${b.h * 0.035}" fill="none" stroke="${INK}" stroke-width="1.4"/>`; }); }
    else if (kind === "drain") { s += rect(b.x, b.y, b.w, b.h); s += line(b.x, b.y + 3, b.x + b.w, b.y + 3, FAINT); }
    else if (kind === "kiosk") { s += rect(b.x, b.y, b.w, b.h * 0.12, INK, 1.6, "rgba(61,109,120,.08)"); s += rect(b.x + 6, b.y + b.h * 0.12, 8, b.h * 0.88); s += rect(b.x + b.w - 14, b.y + b.h * 0.12, 8, b.h * 0.88); s += rect(b.x + 14, b.y + b.h * 0.6, b.w - 28, b.h * 0.4); s += line(b.x + 14, b.y + b.h * 0.66, b.x + b.w - 14, b.y + b.h * 0.66, FAINT); }
    else if (kind === "display") { s += rect(b.x, b.y, b.w, b.h); const n = 4; for (let i = 1; i < n; i++) s += line(b.x + 4, b.y + (b.h * i) / n, b.x + b.w - 4, b.y + (b.h * i) / n, INK, 1.2); s += rect(b.x + 4, b.y + 4, b.w - 8, b.h * 0.72, FAINT, 1, "rgba(150,200,210,.12)"); }
    return s;
  }

  /** The SVG for one article at one revision. `status` adds the right stamp. */
  function svg(order, a, rev, status) {
    const t = D.A[a.tpl];
    const [w, d, h] = t.dims;
    const plan = fit(w, d, { x: 70, y: 70, w: 330, h: 300 });
    const front = fit(w, h, { x: 470, y: 70, w: 300, h: 300 });
    const client = D.CLIENTS[order.client];
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Drawing ${esc(order.no)} ${esc(a.code)} rev ${rev}">`;
    s += `<rect width="${W}" height="${H}" fill="#fff"/>` + rect(12, 12, W - 24, H - 24, INK, 1.2) + rect(18, 18, W - 36, H - 36, INK, 0.6);
    s += text(235, 48, "PLAN / مسقط", 11, INK) + text(620, 48, "FRONT ELEVATION / واجهة", 11, INK);
    s += planView(t.kind, w, d, plan) + hdim(plan.x, plan.x + plan.w, plan.y + plan.h + 26, `${w}`) + vdim(plan.y, plan.y + plan.h, plan.x - 26, `${d}`);
    s += frontView(t.kind, w, h, front) + hdim(front.x, front.x + front.w, front.y + front.h + 26, `${w}`) + vdim(front.y, front.y + front.h, front.x - 26, `${h}`);
    s += line(front.x - 40, front.y + front.h, front.x + front.w + 20, front.y + front.h, FAINT, 1, "8 4");
    // title block
    const tb = { x: 430, y: 430, w: 392, h: 146 };
    s += rect(tb.x, tb.y, tb.w, tb.h, INK, 1.2) + line(tb.x, tb.y + 30, tb.x + tb.w, tb.y + 30, INK, 0.8) + line(tb.x, tb.y + 82, tb.x + tb.w, tb.y + 82, INK, 0.8) + line(tb.x + 300, tb.y + 82, tb.x + 300, tb.y + tb.h, INK, 0.8);
    s += text(tb.x + 10, tb.y + 20, D.SHOP.name.en.toUpperCase(), 12, INK, "start", 'font-weight="700"') + text(tb.x + tb.w - 10, tb.y + 20, D.SHOP.name.ar, 12, INK, "end");
    s += text(tb.x + 10, tb.y + 50, `${client.name.en} · ${order.project.en}`.slice(0, 52), 10.5, INK, "start") + text(tb.x + 10, tb.y + 70, `${a.code}  ${t.name.en}`.slice(0, 52), 10.5, INK, "start", 'font-weight="700"');
    s += text(tb.x + 10, tb.y + 102, `ORDER ${order.no}   QTY ${a.qty}`, 10, INK, "start") + text(tb.x + 10, tb.y + 120, `SS ${t.grade} · ${t.t} mm · MM`, 10, INK, "start") + text(tb.x + 10, tb.y + 138, `SCALE NTS · DRAWN: ENG. DEPT`, 9.5, FAINT, "start");
    s += text(tb.x + 346, tb.y + 104, "REV", 10, INK) + text(tb.x + 346, tb.y + 134, rev, 26, INK, "middle", 'font-weight="700"');
    // revision table
    s += rect(30, 430, 380, 146, INK, 0.8) + text(40, 450, "REV  DATE        DESCRIPTION", 10, INK, "start", 'font-weight="700"');
    a.drawings.forEach((dr, i) => { s += text(40, 472 + i * 18, `${dr.rev.padEnd(4)} ${new Date(dr.at).toISOString().slice(0, 10)}  ${i === 0 ? "First issue" : "Revised: " + (dr.note ? (dr.note.en || dr.note) : "client comments")}`.slice(0, 54), 9.5, dr.rev === rev ? INK : FAINT, "start"); });
    if (status === "pending") s += `<g transform="rotate(-8 640 300)"><rect x="520" y="270" width="240" height="44" rx="6" fill="none" stroke="#c08a2c" stroke-width="3"/>${text(640, 299, "FOR APPROVAL / للاعتماد", 15, "#c08a2c", "middle", 'font-weight="700"')}</g>`;
    if (status === "superseded") s += `<g transform="rotate(-8 640 300)"><rect x="520" y="270" width="240" height="44" rx="6" fill="none" stroke="#b5473a" stroke-width="3"/>${text(640, 299, "SUPERSEDED / ملغى", 15, "#b5473a", "middle", 'font-weight="700"')}</g>`;
    s += text(W / 2, H - 22, "DEMO DRAWING · SAMPLE DATA", 8.5, FAINT);
    return s + "</svg>";
  }

  /** Small preview for lists. */
  function thumb(order, a) {
    const cur = a.drawings.filter((d) => d.status !== "superseded").slice(-1)[0] || a.drawings[a.drawings.length - 1];
    return svg(order, a, cur.rev, cur.status);
  }

  window.DRAWING = { svg, thumb };
})();
