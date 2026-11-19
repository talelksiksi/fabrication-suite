/* Interface language (fabrication suite). Shares the "lang" key with the rest of cictnardc.net; ?lang= wins. */
(function () {
  const LANGS = ["en", "fr", "ar"];
  const read = () => { try { return localStorage.getItem("lang"); } catch { return null; } };
  const write = (v) => { try { localStorage.setItem("lang", v); } catch {} };
  const q = new URLSearchParams(location.search).get("lang");
  let lang = LANGS.includes(q) ? q : read();
  if (!LANGS.includes(lang)) lang = (navigator.language || "en").slice(0, 2);
  if (!LANGS.includes(lang)) lang = "en";
  if (LANGS.includes(q)) write(q);

  const S = {
    suite: ["Fabrication Shop Suite", "Suite atelier de fabrication", "منظومة ورش التصنيع"],
    demoTag: ["Demo with sample data", "Démo avec données d'exemple", "نسخة تجريبية ببيانات نموذجية"],
    office: ["Office", "Bureau", "المكتب"],
    workshop: ["Workshop tablet", "Tablette atelier", "جهاز الورشة"],
    tracking: ["Client tracking", "Suivi client", "متابعة العميل"],
    website: ["Public website", "Site public", "الموقع العام"],
    hubTitle: ["From the client's drawing to the installed kitchen, on one system", "Du plan du client à la cuisine posée, dans un seul système", "من مخطط العميل إلى المطبخ المركّب، في نظام واحد"],
    hubLede: ["For stainless steel workshops that build commercial kitchens, food production units, mall kiosks and event stands. The office turns quotes into orders and keeps every AutoCAD drawing with its revisions. Each article moves through the workshop station by station on a tablet. The client follows progress, approves drawings and sees the installation date from one private link, and the public site shows finished work and takes quote requests.", "Pour les ateliers inox qui réalisent cuisines professionnelles, unités de production alimentaire, kiosques de centres commerciaux et stands d'événements. Le bureau transforme les devis en commandes et garde chaque plan AutoCAD avec ses révisions. Chaque article passe d'un poste à l'autre de l'atelier sur tablette. Le client suit l'avancement, valide les plans et voit la date de pose depuis un lien privé, et le site public montre les réalisations et reçoit les demandes de devis.", "لورش الستانلس ستيل التي تنفّذ المطابخ التجارية ووحدات الإنتاج الغذائي وأكشاك المولات وأجنحة المعارض. يحوّل المكتب عروض الأسعار إلى طلبات ويحفظ كل مخطط أوتوكاد بمراجعاته. وينتقل كل صنف بين محطات الورشة محطةً بعد محطة عبر جهاز لوحي. ويتابع العميل التقدم ويعتمد المخططات ويعرف موعد التركيب من رابط خاص واحد، بينما يعرض الموقع العام الأعمال المنجزة ويستقبل طلبات عروض الأسعار."],
    hubHow: ["Everything runs in your browser and stays in sync between tabs. Finish a piece on the workshop tablet and watch the office and the client page move.", "Tout tourne dans votre navigateur et reste synchronisé entre les onglets. Terminez une pièce sur la tablette atelier et regardez le bureau et la page client avancer.", "كل شيء يعمل داخل متصفحك ويبقى متزامناً بين علامات التبويب. أنهِ قطعة على جهاز الورشة وتابع تحرّك المكتب وصفحة العميل."],
    openTab: ["Open in a new tab", "Ouvrir dans un nouvel onglet", "افتح في علامة تبويب جديدة"],
    autopilot: ["Busy workshop", "Atelier en activité", "ورشة في حركة"],
    autopilotTip: ["Simulates workers and clients so the screens keep moving", "Simule ouvriers et clients pour que les écrans avancent", "يحاكي العمال والعملاء لتبقى الشاشات في حركة"],
    reset: ["Reset demo", "Réinitialiser", "إعادة ضبط النسخة التجريبية"],
    resetQ: ["Put every order, drawing and stock level back to the sample data?", "Remettre commandes, plans et stocks aux données d'exemple ?", "إعادة كل الطلبات والمخططات والمخزون إلى البيانات النموذجية؟"],
    backPortfolio: ["Portfolio", "Portfolio", "معرض الأعمال"],
    builtWith: ["Built by Talel Ksiksi, CICTNA RDC", "Réalisé par Talel Ksiksi, CICTNA RDC", "من تطوير طلال كسيكسي، CICTNA RDC"],
    features: ["What the real system adds", "Ce qu'ajoute le vrai système", "ما يضيفه النظام الفعلي"],
    feat1: ["Real .dwg and PDF files stored per article, with every revision kept", "Vrais fichiers .dwg et PDF par article, chaque révision conservée", "حفظ ملفات .dwg وPDF الفعلية لكل صنف مع الاحتفاظ بكل المراجعات"],
    feat2: ["WhatsApp updates to the client at each milestone", "Mises à jour WhatsApp au client à chaque étape", "تحديثات واتساب للعميل عند كل مرحلة"],
    feat3: ["Photos from the workshop and the site attached to each article", "Photos de l'atelier et du chantier jointes à chaque article", "صور من الورشة والموقع مرفقة بكل صنف"],
    feat4: ["Quotes, invoices and ZATCA e-invoicing for B2B clearance", "Devis, factures et facturation ZATCA en dédouanement B2B", "عروض الأسعار والفواتير والفوترة الإلكترونية للمنشآت"],
    scanTrack: ["Scan to open the client tracking page on your phone", "Scannez pour ouvrir la page de suivi client sur votre téléphone", "امسح الرمز لفتح صفحة متابعة العميل على هاتفك"],
    scanNote: ["On your phone the page runs on its own sample data; devices do not share orders in the demo.", "Sur votre téléphone, la page tourne sur ses propres données ; les appareils ne partagent pas les commandes dans la démo.", "على هاتفك تعمل الصفحة ببياناتها الخاصة، فالأجهزة لا تتشارك الطلبات في النسخة التجريبية."],

    orders: ["Orders", "Commandes", "الطلبات"],
    quotes: ["Quotes", "Devis", "عروض الأسعار"],
    board: ["Production board", "Tableau de production", "لوحة الإنتاج"],
    stock: ["Stock", "Stock", "المخزون"],
    order: ["Order", "Commande", "الطلب"],
    quote: ["Quote", "Devis", "عرض سعر"],
    client: ["Client", "Client", "العميل"],
    project: ["Project", "Projet", "المشروع"],
    site: ["Site", "Site", "الموقع"],
    due: ["Due", "Échéance", "التسليم"],
    installOn: ["Installation", "Pose", "التركيب"],
    value: ["Value", "Montant", "القيمة"],
    progress: ["Progress", "Avancement", "التقدم"],
    articles: ["Articles", "Articles", "الأصناف"],
    article: ["Article", "Article", "الصنف"],
    qty: ["Qty", "Qté", "الكمية"],
    size: ["Size (mm)", "Dimensions (mm)", "المقاس (مم)"],
    material: ["Material", "Matière", "الخامة"],
    station: ["Station", "Poste", "المحطة"],
    drawing: ["Drawing", "Plan", "المخطط"],
    drawings: ["Drawings", "Plans", "المخططات"],
    payments: ["Payments", "Paiements", "الدفعات"],
    activity: ["Workshop activity", "Activité de l'atelier", "نشاط الورشة"],
    status_quote: ["Quote", "Devis", "عرض سعر"],
    status_production: ["In production", "En production", "قيد التصنيع"],
    status_installation: ["Installation", "Pose", "التركيب"],
    status_done: ["Completed", "Terminée", "مكتمل"],
    type: ["Type", "Type", "النوع"],
    all: ["All", "Toutes", "الكل"],
    late: ["At risk", "En retard", "متأخر"],
    onTrack: ["On track", "Dans les temps", "في الموعد"],
    daysLeft: ["days left", "jours restants", "يوماً متبقياً"],
    overdue: ["overdue", "en retard", "متأخر"],
    finished: ["Finished", "Terminé", "منتهٍ"],
    waiting: ["Waiting", "En attente", "بالانتظار"],
    working: ["In progress", "En cours", "قيد العمل"],
    blockedDrawing: ["Waiting for drawing approval", "En attente de validation du plan", "بانتظار اعتماد المخطط"],
    rev: ["Rev", "Rév.", "مراجعة"],
    rev_approved: ["Approved", "Validé", "معتمد"],
    rev_pending: ["Awaiting client", "En attente du client", "بانتظار العميل"],
    rev_superseded: ["Superseded", "Remplacé", "مُستبدل"],
    newRev: ["Upload new revision", "Nouvelle révision", "رفع مراجعة جديدة"],
    newRevQ: ["A new revision goes to the client for approval. Articles not yet cut wait for it; pieces already cut keep the approved revision.", "Une nouvelle révision part au client pour validation. Les articles pas encore découpés l'attendent ; les pièces déjà découpées gardent la révision validée.", "تُرسل المراجعة الجديدة إلى العميل لاعتمادها. الأصناف التي لم تُقص بعد تنتظرها، والقطع المقصوصة تبقى على المراجعة المعتمدة."],
    change: ["What changed", "Modification", "ما الذي تغيّر"],
    changePh: ["e.g. width 1800 → 1650 mm", "ex. largeur 1800 → 1650 mm", "مثلاً: العرض 1800 ← 1650 مم"],
    sendClient: ["Send to client", "Envoyer au client", "أرسل إلى العميل"],
    view: ["View", "Voir", "عرض"],
    copyLink: ["Copy client link", "Copier le lien client", "نسخ رابط العميل"],
    openLink: ["Open client page", "Ouvrir la page client", "فتح صفحة العميل"],
    copied: ["Link copied", "Lien copié", "تم نسخ الرابط"],
    accept: ["Client accepted: start production", "Accepté par le client : lancer la production", "وافق العميل: ابدأ التصنيع"],
    accepted: ["Order confirmed. Material reserved and articles sent to cutting.", "Commande confirmée. Matière réservée, articles envoyés à la découpe.", "تم تأكيد الطلب، وحُجزت الخامات، وأُرسلت الأصناف إلى القص."],
    needsMat: ["Material needed", "Matière nécessaire", "الخامات المطلوبة"],
    short: ["short", "manquant", "نقص"],
    pay_advance: ["Advance on order", "Acompte à la commande", "دفعة مقدمة عند الطلب"],
    pay_delivery: ["On delivery", "À la livraison", "عند التسليم"],
    pay_install: ["After installation", "Après la pose", "بعد التركيب"],
    pay_paid: ["Paid", "Payé", "مدفوع"],
    pay_invoiced: ["Invoiced", "Facturé", "صدرت فاتورته"],
    pay_due: ["Not yet due", "Pas encore dû", "لم يحن بعد"],
    onHand: ["On hand", "En stock", "المتوفر"],
    reserved: ["Reserved", "Réservé", "محجوز"],
    available: ["Available", "Disponible", "المتاح"],
    minimum: ["Minimum", "Minimum", "الحد الأدنى"],
    receive: ["Receive", "Réceptionner", "استلام"],
    lowStock: ["Below minimum", "Sous le minimum", "أقل من الحد الأدنى"],
    received: ["received", "réceptionnés", "تم استلامها"],
    noneHere: ["Nothing here.", "Rien ici.", "لا شيء هنا."],
    pickOrder: ["Pick an order to see its articles, drawings and payments.", "Choisissez une commande pour voir ses articles, plans et paiements.", "اختر طلباً لعرض أصنافه ومخططاته ودفعاته."],
    newQuoteFromSite: ["New request from the website", "Nouvelle demande depuis le site", "طلب جديد من الموقع"],

    // workshop
    pickStation: ["Station", "Poste", "المحطة"],
    queue: ["Up next", "À faire", "التالي"],
    inProgress: ["In progress", "En cours", "قيد العمل"],
    start: ["Start", "Commencer", "ابدأ"],
    finish: ["Done, send on", "Terminé, suivant", "تم، أرسل للتالي"],
    pass: ["Pass", "Conforme", "مطابق"],
    reject: ["Send back for rework", "Renvoyer en reprise", "إعادة للإصلاح"],
    rejectWhy: ["What needs fixing?", "Que faut-il reprendre ?", "ما الذي يحتاج إصلاحاً؟"],
    rejectPh: ["e.g. weld seam visible on the front edge", "ex. cordon visible sur le chant avant", "مثلاً: خط اللحام ظاهر على الحافة الأمامية"],
    who: ["Who is working on it?", "Qui s'en occupe ?", "من يعمل عليه؟"],
    nextStation: ["Next", "Ensuite", "التالي"],
    reworkNote: ["Rework", "Reprise", "إعادة عمل"],
    nothingQueued: ["Nothing waiting at this station.", "Rien en attente à ce poste.", "لا شيء بالانتظار في هذه المحطة."],
    openDrawing: ["Drawing", "Plan", "المخطط"],
    approvedRev: ["Approved revision", "Révision validée", "المراجعة المعتمدة"],
    grade: ["Grade", "Nuance", "الدرجة"],
    thickness: ["Thickness", "Épaisseur", "السماكة"],
    pieces: ["pcs", "pcs", "قطعة"],
    since: ["since", "depuis", "منذ"],

    // tracking
    hello: ["Your order", "Votre commande", "طلبك"],
    overall: ["Overall progress", "Avancement global", "التقدم الإجمالي"],
    approve: ["Approve", "Valider", "اعتماد"],
    requestChange: ["Ask for a change", "Demander une modification", "طلب تعديل"],
    approvedThanks: ["Approved. The workshop can start on it.", "Validé. L'atelier peut commencer.", "تم الاعتماد، ويمكن للورشة البدء."],
    changeSent: ["Sent to the project team.", "Envoyé à l'équipe projet.", "أُرسل إلى فريق المشروع."],
    toApprove: ["Drawings waiting for your approval", "Plans en attente de votre validation", "مخططات بانتظار اعتمادك"],
    milestones: ["Milestones", "Étapes", "المراحل"],
    m_confirmed: ["Order confirmed", "Commande confirmée", "تأكيد الطلب"],
    m_production: ["Production", "Production", "التصنيع"],
    m_qc: ["Quality check", "Contrôle qualité", "فحص الجودة"],
    m_delivery: ["Delivery", "Livraison", "التسليم"],
    m_install: ["Installation", "Pose", "التركيب"],
    contactTeam: ["Message the project team", "Écrire à l'équipe projet", "راسل فريق المشروع"],
    privateLink: ["Private link for this order. No account needed.", "Lien privé pour cette commande. Aucun compte nécessaire.", "رابط خاص بهذا الطلب، دون الحاجة إلى حساب."],
    orderNotFound: ["Order not found.", "Commande introuvable.", "الطلب غير موجود."],
    stepOf: ["step", "étape", "المرحلة"],
    of: ["of", "sur", "من"],

    // public site
    navWork: ["Our work", "Réalisations", "أعمالنا"],
    navServices: ["Services", "Services", "خدماتنا"],
    navProcess: ["How we work", "Notre méthode", "طريقة عملنا"],
    navQuote: ["Request a quote", "Demander un devis", "اطلب عرض سعر"],
    heroTitle: ["Stainless steel, built to your drawings", "L'inox, fabriqué d'après vos plans", "ستانلس ستيل يُصنع وفق مخططاتكم"],
    heroSub: ["Commercial kitchens, central production units, mall kiosks and event stands, designed, made and installed by one team.", "Cuisines professionnelles, unités de production centrales, kiosques et stands, conçus, fabriqués et posés par une seule équipe.", "مطابخ تجارية ووحدات إنتاج مركزية وأكشاك وأجنحة معارض، تصميماً وتصنيعاً وتركيباً بفريق واحد."],
    stat1: ["kitchens and units delivered", "cuisines et unités livrées", "مطبخاً ووحدة منفذة"],
    stat2: ["years in the trade", "ans de métier", "عاماً في المهنة"],
    stat3: ["cities across the Kingdom", "villes du Royaume", "مدن في المملكة"],
    svc_kitchen: ["Restaurant and café kitchens", "Cuisines de restaurants et cafés", "مطابخ المطاعم والمقاهي"],
    svc_kitchenT: ["Counters, sinks, hoods, shelving and pass lines, sized to your layout and local hygiene rules.", "Plans de travail, plonges, hottes, étagères et passes, à la mesure de votre plan et des règles d'hygiène.", "كاونترات ومغاسل وشفاطات ورفوف وخطوط تقديم، بمقاسات تناسب مخططكم واشتراطات النظافة."],
    svc_production: ["Central production units", "Unités de production centrales", "وحدات الإنتاج المركزية"],
    svc_productionT: ["Full fit-outs for meal brands and chains: 316 for wet zones, trolleys, drains and cold rooms.", "Équipement complet pour marques de repas et chaînes : 316 en zones humides, chariots, caniveaux et chambres froides.", "تجهيز كامل لعلامات الوجبات والسلاسل: 316 للمناطق الرطبة، وعربات، وقنوات تصريف، وغرف تبريد."],
    svc_kiosk: ["Mall kiosks", "Kiosques de centres commerciaux", "أكشاك المولات"],
    svc_kioskT: ["Juice bars, coffee and dessert kiosks built to mall guidelines, with glass, lighting and branding.", "Bars à jus, kiosques café et desserts selon le cahier du centre, avec vitrage, éclairage et marque.", "أكشاك عصائر وقهوة وحلويات وفق اشتراطات المول، مع الزجاج والإضاءة والهوية."],
    svc_event: ["Event and exhibition stands", "Stands d'événements et salons", "أجنحة الفعاليات والمعارض"],
    svc_eventT: ["Counters, display towers and tasting bars, delivered and assembled on show day.", "Comptoirs, tours de présentation et bars de dégustation, livrés et montés le jour J.", "كاونترات وأبراج عرض وبارات تذوق، تُسلَّم وتُركّب يوم الفعالية."],
    proc1: ["Send your plans", "Envoyez vos plans", "أرسل مخططاتك"],
    proc2: ["Drawings and quote", "Plans et devis", "المخططات وعرض السعر"],
    proc3: ["Made in our workshop", "Fabrication à l'atelier", "التصنيع في ورشتنا"],
    proc4: ["Follow every piece online", "Suivi en ligne de chaque pièce", "تابع كل قطعة عبر الإنترنت"],
    proc5: ["Installed on site", "Pose sur site", "التركيب في الموقع"],
    projectsTitle: ["Recent projects", "Projets récents", "مشاريع حديثة"],
    clientsTitle: ["Brands that trust us", "Ils nous font confiance", "علامات تثق بنا"],
    quoteTitle: ["Tell us about your project", "Parlez-nous de votre projet", "حدّثنا عن مشروعك"],
    quoteLede: ["Attach your AutoCAD or PDF plans if you have them. We reply with drawings and a quote.", "Joignez vos plans AutoCAD ou PDF si vous les avez. Nous répondons avec plans et devis.", "أرفق مخططات أوتوكاد أو PDF إن وُجدت، وسنرد بالمخططات وعرض السعر."],
    f_name: ["Your name", "Votre nom", "الاسم"],
    f_company: ["Company", "Société", "الشركة"],
    f_city: ["City", "Ville", "المدينة"],
    f_type: ["Project type", "Type de projet", "نوع المشروع"],
    f_files: ["Plans (DWG, PDF)", "Plans (DWG, PDF)", "المخططات (DWG، PDF)"],
    f_msg: ["What do you need?", "De quoi avez-vous besoin ?", "ما الذي تحتاجه؟"],
    f_send: ["Send request", "Envoyer la demande", "أرسل الطلب"],
    f_sent: ["Request received. It is now in the office's quotes list.", "Demande reçue. Elle est maintenant dans la liste des devis du bureau.", "وصل طلبك، وهو الآن في قائمة عروض الأسعار لدى المكتب."],
    demoSiteNote: ["Sample company and projects for the demo.", "Société et projets fictifs pour la démo.", "شركة ومشاريع نموذجية لأغراض العرض."],
    footer: ["Workshop", "Atelier", "الورشة"],
  };

  const idx = () => LANGS.indexOf(lang);
  const t = (k) => (S[k] ? S[k][idx()] ?? S[k][0] : k);
  const L = (v) => (v && typeof v === "object" ? v[lang] ?? v.en : v);
  const listeners = [];

  function apply() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-t]").forEach((el) => { el.textContent = t(el.dataset.t); });
    document.querySelectorAll("[data-t-title]").forEach((el) => { el.title = t(el.dataset.tTitle); });
    document.querySelectorAll(".lang-switch button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  }
  function set(next) {
    if (!LANGS.includes(next) || next === lang) return;
    lang = next; write(lang); apply(); listeners.forEach((f) => f(lang));
  }
  function switcher() {
    const box = document.createElement("div");
    box.className = "lang-switch"; box.setAttribute("role", "group"); box.setAttribute("aria-label", "Language");
    [["en", "EN"], ["fr", "FR"], ["ar", "عربي"]].forEach(([code, label]) => {
      const b = document.createElement("button");
      b.type = "button"; b.dataset.lang = code; b.textContent = label; b.lang = code;
      b.addEventListener("click", () => set(code));
      box.appendChild(b);
    });
    return box;
  }
  // Keep frames on the same page in step with each other.
  window.addEventListener("storage", (e) => { if (e.key === "lang" && LANGS.includes(e.newValue) && e.newValue !== lang) { lang = e.newValue; apply(); listeners.forEach((f) => f(lang)); } });

  const money = (n) => {
    const v = Math.round(n).toLocaleString("en-US");
    return lang === "ar" ? `${v} ر.س` : `SAR ${v}`;
  };
  const locale = () => (lang === "ar" ? "ar-SA-u-nu-latn" : lang === "fr" ? "fr-FR" : "en-GB");
  const day = (ts) => new Date(ts).toLocaleDateString(locale(), { day: "numeric", month: "short" });
  const clock = (ts) => new Date(ts).toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit" });

  window.I18N = { t, L, apply, set, switcher, onChange: (f) => listeners.push(f), get lang() { return lang; }, money, clock, day, locale };
  document.addEventListener("DOMContentLoaded", apply);
})();
