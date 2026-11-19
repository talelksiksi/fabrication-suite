/* The demo's front page: every screen side by side and the simulated workshop. */
(function () {
  const { h, qrSvg, modal } = window.UI;
  const { t } = window.I18N;
  const T = (key, tag = "span", attrs = {}) => h(tag, Object.assign({ "data-t": key }, attrs), t(key));

  document.body.append(UI.bar("🏭", "suite", h("a", { class: "btn ghost", href: "../", style: "min-height:34px;padding:6px 10px" }, h("span", { class: "flip", "aria-hidden": "true" }, "←"), " ", T("backPortfolio"))));
  const pilot = h("input", { type: "checkbox", id: "pilot", onchange: (e) => STORE.update((s) => { s.autopilot = e.target.checked; }) });
  const kiosk = STORE.get().orders.find((o) => o.no === "FW-2611-034");
  const trackUrl = new URL("track.html?o=" + (kiosk ? kiosk.token : ""), location.href).href;

  document.body.append(h("section", { class: "hub-head" },
    h("div", {}, T("demoTag", "div", { class: "eyebrow" }), T("hubTitle", "h1"), T("hubLede", "p"), T("hubHow", "p"),
      h("div", { style: "display:flex;gap:8px;flex-wrap:wrap;margin-top:14px" },
        h("a", { class: "btn primary", href: "office.html", target: "_blank", rel: "noopener" }, "🏭 ", T("office")),
        h("a", { class: "btn", href: "workshop.html?station=welding", target: "_blank", rel: "noopener" }, "🛠️ ", T("workshop")),
        h("a", { class: "btn", href: trackUrl, target: "_blank", rel: "noopener" }, "📱 ", T("tracking")),
        h("a", { class: "btn", href: "site.html", target: "_blank", rel: "noopener" }, "🌐 ", T("website")))),
    h("aside", { class: "card hub-panel" },
      h("div", { class: "switch" }, h("label", { for: "pilot" }, T("autopilot", "b"), h("br"), T("autopilotTip", "span", { class: "small muted" })), pilot),
      h("div", { class: "qr-try" }, qrSvg(trackUrl), h("div", {}, T("scanTrack", "b", { class: "small" }), T("scanNote", "p", { class: "small muted", style: "margin:4px 0 0" }))),
      h("ul", { class: "feat" }, ["feat1", "feat2", "feat3", "feat4"].map((k) => T(k, "li"))),
      h("button", { class: "btn", type: "button", onclick: () => modal(t("reset"), h("p", {}, t("resetQ")), [[t("reset"), () => STORE.reset(), "primary"]]) }, T("reset")))));

  const frame = (cls, title, src, inner) => h("section", { class: "card screen " + cls },
    h("header", {}, h("h2", {}, title), h("span", { class: "grow" }), h("a", { href: src, target: "_blank", rel: "noopener" }, T("openTab"), " ↗")),
    inner || h("iframe", { src, title: src, loading: "lazy" }));
  document.body.append(h("main", { class: "screens" },
    frame("office", T("office"), "office.html"),
    frame("shopf", T("workshop"), "workshop.html?station=welding"),
    frame("phone", T("tracking"), trackUrl, h("div", { class: "phone-frame" }, h("iframe", { src: trackUrl, title: "tracking", loading: "lazy" }))),
    frame("sitef", T("website"), "site.html")));
  document.body.append(h("section", { class: "hub-foot" }, h("p", { style: "margin:0" }, T("builtWith"), " · ", h("a", { href: "https://cictnardc.net" }, "cictnardc.net"))));

  UI.live((s) => { pilot.checked = !!s.autopilot; });
  I18N.onChange(() => I18N.apply());
})();
