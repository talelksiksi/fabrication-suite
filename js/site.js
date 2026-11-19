/* The fabricator's public website: services, finished work, clients and a quote request form. */
(function () {
  const D = window.FS_DATA;
  const { h, toast, svgNode } = window.UI;
  const { t, L } = window.I18N;
  document.body.classList.add("site");
  const T = (k, tag = "span", attrs = {}) => h(tag, Object.assign({ "data-t": k }, attrs), t(k));

  // Sample finished projects, drawn with the same renderer the workshop uses.
  const PROJECTS = [
    { tpl: "pass", title: D.L("Central kitchen for a meal subscription brand", "Cuisine centrale pour une marque de repas", "مطبخ مركزي لعلامة اشتراكات وجبات"), place: D.L("Riyadh · 140 pieces", "Riyad · 140 pièces", "الرياض · 140 قطعة") },
    { tpl: "kioskCounter", title: D.L("Juice kiosk, mall ground floor", "Kiosque à jus, centre commercial", "كشك عصائر في مول"), place: D.L("Riyadh · 9 days to open", "Riyad · ouvert en 9 jours", "الرياض · افتتاح خلال 9 أيام") },
    { tpl: "barCounter", title: D.L("Café bar for a coffee chain", "Bar pour une chaîne de cafés", "بار لسلسلة مقاهٍ"), place: D.L("Jeddah · 6 branches", "Djeddah · 6 agences", "جدة · 6 فروع") },
    { tpl: "hood", title: D.L("Hot line and extraction, grill restaurant", "Ligne chaude et extraction, grill", "خط طهي وشفط لمطعم مشويات"), place: D.L("Dammam", "Dammam", "الدمام") },
    { tpl: "standDisplay", title: D.L("Exhibition stand for a dates brand", "Stand d'exposition, marque de dattes", "جناح معرض لعلامة تمور"), place: D.L("Riyadh Front", "Riyadh Front", "واجهة الرياض") },
    { tpl: "trolley", title: D.L("Production line for a bakery group", "Ligne de production, groupe de boulangeries", "خط إنتاج لمجموعة مخابز"), place: D.L("Al Khobar · 60 trolleys", "Al Khobar · 60 chariots", "الخبر · 60 عربة") },
  ];
  const fakeOrder = { no: "FW-2610-118", client: "greenbite", project: { en: "Portfolio", fr: "Portfolio", ar: "معرض" } };
  const art = (tpl) => svgNode(DRAWING.svg(fakeOrder, { code: "A01", tpl, qty: 1, drawings: [{ rev: "C", status: "approved", at: Date.now() - 40 * 86400000 }] }, "C", "approved"));

  const nav = h("header", { class: "s-nav" },
    h("div", { class: "brand" }, h("i", { "aria-hidden": "true" }), h("span", { class: "shop-name" }, L(D.SHOP.name))),
    h("nav", {}, h("a", { href: "#work" }, T("navWork")), h("a", { href: "#services" }, T("navServices")), h("a", { href: "#process" }, T("navProcess"))),
    h("span", { class: "grow" }), I18N.switcher(), h("a", { class: "btn primary", href: "#quote" }, T("navQuote")));

  const hero = h("section", { class: "s-hero" }, h("div", { class: "in" },
    h("div", {}, T("heroTitle", "h1"), T("heroSub", "p"), h("a", { class: "btn accent big", href: "#quote" }, T("navQuote")),
      h("div", { class: "stats" }, [["320+", "stat1"], ["18", "stat2"], ["11", "stat3"]].map(([n, k]) => h("div", {}, h("b", {}, n), T(k))))),
    h("div", { class: "art" }, art("kioskFrame"))));

  const services = h("section", { class: "s-sec", id: "services" }, T("navServices", "h2"), h("div", { class: "svc" },
    [["🍽️", "svc_kitchen"], ["🏭", "svc_production"], ["🛍️", "svc_kiosk"], ["🎪", "svc_event"]].map(([ic, k]) => h("div", { class: "card" }, h("span", { class: "ic", "aria-hidden": "true" }, ic), T(k, "h3"), T(k + "T", "p")))));

  const work = h("section", { class: "s-sec", id: "work" }, T("projectsTitle", "h2"), h("div", { class: "proj" }));
  const process = h("section", { class: "s-sec", id: "process" }, T("navProcess", "h2"), h("div", { class: "procs" }, ["proc1", "proc2", "proc3", "proc4", "proc5"].map((k) => T(k, "div"))));
  const clients = h("section", { class: "s-sec" }, T("clientsTitle", "h2"), h("div", { class: "logos" }, ["GREENBITE", "QAMRA CAFÉ", "AL WAHA MALL", "DATEY", "SAHRA BAKERY", "MARSA SEAFOOD"].map((x) => h("span", {}, x))));

  const f = {};
  const field = (k, el) => h("label", { class: "field" + (k === "msg" || k === "files" ? " full" : "") }, T("f_" + k), el);
  f.name = h("input", { type: "text", required: true, autocomplete: "name" });
  f.company = h("input", { type: "text", autocomplete: "organization" });
  f.city = h("input", { type: "text", value: "Riyadh" });
  f.type = h("select", {});
  f.files = h("input", { type: "file", multiple: true, accept: ".dwg,.dxf,.pdf,.jpg,.png" });
  f.msg = h("textarea", {});
  const fillTypes = () => { const v = f.type.value || "kitchen"; f.type.replaceChildren(...Object.keys(D.TYPES).map((k) => h("option", { value: k, selected: k === v }, L(D.TYPES[k])))); };
  fillTypes();
  const form = h("form", { class: "card qform", onsubmit: (e) => {
    e.preventDefault();
    STORE.update((s) => STORE.quoteRequest(s, { name: f.name.value.trim(), company: f.company.value.trim(), city: f.city.value.trim(), type: f.type.value, msg: f.msg.value.trim() }));
    form.reset(); fillTypes(); toast(t("f_sent"));
  } }, field("name", f.name), field("company", f.company), field("city", f.city), field("type", f.type), field("files", f.files), field("msg", f.msg),
    h("div", { class: "full" }, h("button", { class: "btn primary big", type: "submit" }, T("f_send"))));
  const quote = h("section", { class: "s-sec", id: "quote" }, T("quoteTitle", "h2"), T("quoteLede", "p", { class: "muted", style: "margin:-10px 0 16px" }), form);
  const foot = h("footer", { class: "s-foot" }, h("span", {}, h("b", { class: "shop-name" }, L(D.SHOP.name)), " · ", h("span", { class: "shop-city" }, L(D.SHOP.city))),
    h("bdi", { class: "mono" }, D.SHOP.phone + " · " + D.SHOP.email), T("demoSiteNote"));
  document.body.append(nav, hero, services, work, process, clients, quote, foot);

  function render() {
    work.querySelector(".proj").replaceChildren(...PROJECTS.map((p) => h("article", { class: "card" }, h("div", { class: "pic" }, art(p.tpl)), h("div", { class: "tx" }, h("b", {}, L(p.title)), h("span", {}, L(p.place))))));
    document.querySelectorAll(".shop-name").forEach((el) => { el.textContent = L(D.SHOP.name); });
    document.querySelectorAll(".shop-city").forEach((el) => { el.textContent = L(D.SHOP.city); });
    fillTypes();
  }
  render();
  I18N.onChange(render);
})();
