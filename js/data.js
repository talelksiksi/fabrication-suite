/* Sample stainless fabricator in Riyadh: commercial kitchens, food production units, mall kiosks and event stands.
   Every company, client and project here is invented. */
(function () {
  const L = (en, fr, ar) => ({ en, fr, ar });

  const SHOP = {
    name: L("Fulath Steel Works", "Fulath Steel Works", "فولاذ للأعمال المعدنية"),
    tagline: L("Stainless steel kitchens, production units, kiosks and stands, made to your drawings in Riyadh.",
      "Cuisines inox, unités de production, kiosques et stands, fabriqués d'après vos plans à Riyad.",
      "مطابخ ستانلس ستيل ووحدات إنتاج وأكشاك وأجنحة معارض، نصنعها وفق مخططاتكم في الرياض."),
    city: L("Second Industrial City, Riyadh", "Deuxième zone industrielle, Riyad", "المدينة الصناعية الثانية، الرياض"),
    phone: "+966 11 000 0000",
    whatsapp: "+966 50 000 0000",
    email: "projects@fulath.example",
  };

  const STATIONS = {
    cutting: { icon: "✂️", name: L("Laser cutting", "Découpe laser", "القص بالليزر") },
    bending: { icon: "📐", name: L("Bending", "Pliage", "الثني") },
    welding: { icon: "🔥", name: L("Welding", "Soudure", "اللحام") },
    polishing: { icon: "✨", name: L("Polishing", "Polissage", "التلميع") },
    assembly: { icon: "🔧", name: L("Assembly", "Assemblage", "التجميع") },
    qc: { icon: "✅", name: L("Quality check", "Contrôle qualité", "فحص الجودة") },
    packing: { icon: "📦", name: L("Packing & dispatch", "Emballage et expédition", "التغليف والشحن") },
    install: { icon: "🏗️", name: L("Site installation", "Pose sur site", "التركيب في الموقع") },
  };
  const FULL = ["cutting", "bending", "welding", "polishing", "assembly", "qc", "packing", "install"];
  const ROUTES = {
    table: FULL, counter: FULL, sink: FULL, hood: FULL, kiosk: FULL, display: FULL, cabinet: FULL,
    shelf: ["cutting", "bending", "polishing", "qc", "packing", "install"],
    trolley: ["cutting", "bending", "welding", "polishing", "assembly", "qc", "packing"],
    drain: ["cutting", "bending", "welding", "polishing", "qc", "packing", "install"],
  };

  const TYPES = {
    production: L("Food production unit", "Unité de production alimentaire", "وحدة إنتاج غذائي"),
    kitchen: L("Restaurant kitchen", "Cuisine de restaurant", "مطبخ مطعم"),
    kiosk: L("Mall kiosk", "Kiosque de centre commercial", "كشك مول"),
    event: L("Event stand", "Stand d'événement", "جناح معرض"),
    cafe: L("Café bar", "Bar de café", "بار مقهى"),
  };

  const MATERIALS = [
    { id: "s304-12", name: L("Sheet 304, 1.2 mm", "Tôle 304, 1,2 mm", "لوح 304، 1.2 مم"), spec: "1250×2500", unit: "sheet", onHand: 120, min: 30 },
    { id: "s304-15", name: L("Sheet 304, 1.5 mm", "Tôle 304, 1,5 mm", "لوح 304، 1.5 مم"), spec: "1250×2500", unit: "sheet", onHand: 70, min: 30 },
    { id: "s304-20", name: L("Sheet 304, 2.0 mm", "Tôle 304, 2,0 mm", "لوح 304، 2.0 مم"), spec: "1500×3000", unit: "sheet", onHand: 24, min: 10 },
    { id: "s316-15", name: L("Sheet 316, 1.5 mm", "Tôle 316, 1,5 mm", "لوح 316، 1.5 مم"), spec: "1250×2500", unit: "sheet", onHand: 18, min: 8 },
    { id: "tube40", name: L("Square tube 304, 40×40", "Tube carré 304, 40×40", "أنبوب مربع 304، 40×40"), spec: "6 m", unit: "bar", onHand: 85, min: 40 },
    { id: "tube38", name: L("Round tube 304, Ø38", "Tube rond 304, Ø38", "أنبوب دائري 304، Ø38"), spec: "6 m", unit: "bar", onHand: 22, min: 25 },
    { id: "feet", name: L("Adjustable feet", "Pieds réglables", "أرجل قابلة للتعديل"), spec: "150 mm", unit: "pc", onHand: 340, min: 120 },
    { id: "bowl", name: L("Sink bowl 500×400", "Cuve d'évier 500×400", "حوض مغسلة 500×400"), spec: "deep 300", unit: "pc", onHand: 24, min: 10 },
    { id: "glass", name: L("Tempered glass 10 mm", "Verre trempé 10 mm", "زجاج مقسّى 10 مم"), spec: "m²", unit: "m2", onHand: 18, min: 12 },
    { id: "castor", name: L("Castor Ø125 with brake", "Roulette Ø125 avec frein", "عجلة Ø125 بفرامل"), spec: "pc", unit: "pc", onHand: 70, min: 40 },
  ];
  const UNITS = { sheet: L("sheets", "tôles", "لوح"), bar: L("bars", "barres", "قضيب"), pc: L("pcs", "pcs", "قطعة"), m2: L("m²", "m²", "م²") };

  // Article templates: name, kind (drawing + route), size in mm, material per piece.
  const A = {
    prep: { kind: "table", name: L("Prep table with undershelf", "Table de préparation avec étagère basse", "طاولة تحضير مع رف سفلي"), dims: [1800, 700, 900], grade: "304", t: 1.2, bom: { "s304-12": 1.2, tube40: 1.5, feet: 6 } },
    sink2: { kind: "sink", name: L("Double-bowl sink unit", "Plonge à deux bacs", "وحدة مغسلة بحوضين"), dims: [1500, 700, 900], grade: "304", t: 1.5, bom: { "s304-15": 1.5, bowl: 2, tube40: 1, feet: 6 } },
    hood: { kind: "hood", name: L("Wall extraction hood with filters", "Hotte murale avec filtres", "شفاط جداري مع فلاتر"), dims: [3000, 1200, 600], grade: "304", t: 1.2, bom: { "s304-12": 4 } },
    shelf: { kind: "shelf", name: L("Wall shelf, two levels", "Étagère murale, deux niveaux", "رف جداري بمستويين"), dims: [1500, 300, 600], grade: "304", t: 1.2, bom: { "s304-12": 0.5 } },
    trolley: { kind: "trolley", name: L("Mobile tray trolley, 15 levels", "Chariot à plateaux, 15 niveaux", "عربة صواني متنقلة 15 مستوى"), dims: [600, 450, 1700], grade: "304", t: 1.2, bom: { tube38: 2, "s304-12": 0.4, castor: 4 } },
    pass: { kind: "counter", name: L("Pass counter with heated well", "Passe avec bain-marie", "كاونتر تقديم مع حوض تسخين"), dims: [2400, 800, 900], grade: "304", t: 1.5, bom: { "s304-15": 2.5, tube40: 2, feet: 8 } },
    drain: { kind: "drain", name: L("Floor drain channel with grating", "Caniveau de sol avec grille", "قناة تصريف أرضية مع شبك"), dims: [6000, 150, 120], grade: "316", t: 1.5, bom: { "s316-15": 1.2 } },
    blast: { kind: "cabinet", name: L("Ingredient cabinet, 316, hinged doors", "Armoire ingrédients 316, portes battantes", "خزانة مكونات 316 بأبواب"), dims: [1200, 600, 1900], grade: "316", t: 1.5, bom: { "s316-15": 2.2, feet: 4 } },
    barCounter: { kind: "counter", name: L("Front bar counter with drop zone", "Comptoir de bar avec zone de dépose", "كاونتر بار أمامي"), dims: [3200, 700, 1050], grade: "304", t: 1.5, bom: { "s304-15": 3, tube40: 3, feet: 8 } },
    backBar: { kind: "cabinet", name: L("Back bar with cup shelves", "Arrière-bar avec étagères à tasses", "بار خلفي مع رفوف أكواب"), dims: [2800, 600, 900], grade: "304", t: 1.2, bom: { "s304-12": 2.5, feet: 8 } },
    kioskFrame: { kind: "kiosk", name: L("Kiosk frame 3 × 3 m with canopy", "Structure de kiosque 3 × 3 m avec auvent", "هيكل كشك 3×3 م مع مظلة"), dims: [3000, 3000, 2600], grade: "304", t: 2.0, bom: { tube40: 14, "s304-20": 3 } },
    kioskCounter: { kind: "display", name: L("Juice counter with glass display", "Comptoir à jus avec vitrine", "كاونتر عصائر مع واجهة زجاجية"), dims: [2400, 700, 1100], grade: "304", t: 1.5, bom: { "s304-15": 2, glass: 2.2, feet: 6 } },
    standDisplay: { kind: "display", name: L("Display tower with lit shelves", "Tour de présentation éclairée", "برج عرض برفوف مضاءة"), dims: [900, 500, 2200], grade: "304", t: 1.2, bom: { "s304-12": 1.5, glass: 1.2 } },
    standCounter: { kind: "counter", name: L("Tasting counter with logo panel", "Comptoir de dégustation avec panneau logo", "كاونتر تذوق مع لوحة الشعار"), dims: [2000, 600, 1050], grade: "304", t: 1.5, bom: { "s304-15": 1.6, feet: 6 } },
  };

  const CLIENTS = {
    greenbite: { name: L("Greenbite Meals", "Greenbite Meals", "جرين بايت ميلز"), sector: L("Healthy meal subscriptions", "Repas sains par abonnement", "اشتراكات الوجبات الصحية") },
    qamra: { name: L("Qamra Café & Kitchen", "Qamra Café & Cuisine", "قمرة كافيه آند كيتشن"), sector: L("Café chain", "Chaîne de cafés", "سلسلة مقاهٍ") },
    waha: { name: L("Al Waha Mall", "Al Waha Mall", "الواحة مول"), sector: L("Shopping mall", "Centre commercial", "مركز تسوق") },
    datey: { name: L("Datey Fine Dates", "Datey Fine Dates", "داتي للتمور الفاخرة"), sector: L("Premium dates", "Dattes haut de gamme", "تمور فاخرة") },
  };

  const WORKERS = ["Ahmed", "Bilel", "Hassen", "Karim", "Walid", "Sami", "Mourad", "Nizar"];

  window.FS_DATA = { SHOP, STATIONS, ROUTES, TYPES, MATERIALS, UNITS, A, CLIENTS, WORKERS, L };
})();
