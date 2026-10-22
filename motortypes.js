// ── VASTE MOTORMERKEN EN -TYPES ───────────────────────────────────────────────
// Eén centrale lijst voor de hele website. Nieuw merk of type? Voeg het hier toe.
const MOTOR_TYPES = {
  'Honda': ['Cadet', 'Junior', 'Senior'],
  'IAME':  ['X30 Mini', 'X30', 'X30 Junior', 'X30 Senior', 'Super Shifter', 'S125', 'KA100'],
  'TM':    ['KZ'],
};

// Motortypes die per sessie in een andere klasse getest worden (DFK-motoren).
// De motor zelf heeft type 'X30'; elke sessie kiest 'X30 Junior' of 'X30 Senior'.
const MOTOR_KLASSEN = {
  'X30': ['X30 Junior', 'X30 Senior'],
};

const MK_ANDER = '__ander__';
const mkNorm = s => String(s || '').toLowerCase().replace(/[\s\-_.]/g, '');
const mkZoekMerk = v => Object.keys(MOTOR_TYPES).find(m => mkNorm(m) === mkNorm(v));
const mkZoekType = (merk, v) => (MOTOR_TYPES[merk] || []).find(t => mkNorm(t) === mkNorm(v));
// 'X30 Junior' → 'X30' (het motortype waartoe een sessieklasse hoort), anders null
const mkBasisType = v => Object.keys(MOTOR_KLASSEN).find(b => MOTOR_KLASSEN[b].some(k => mkNorm(k) === mkNorm(v))) || null;
const mkIsKlasseType = v => Object.keys(MOTOR_KLASSEN).some(b => mkNorm(b) === mkNorm(v));

// Vervangt de tekstvelden voor merk en type door keuzelijsten (+ "Ander…").
// De originele inputs blijven bestaan (verborgen) en bevatten altijd de gekozen waarde,
// dus bestaande code die .value leest of zet blijft gewoon werken.
// opts.sessie: sessieformulier — een type met klassen (X30) moet als Junior/Senior gekozen worden.
// opts.klantId: motorformulier — type X30 enkel voor DFK-motoren; klantmotoren kiezen Junior/Senior.
function motorKeuze(merkId, typeId, opts = {}) {
  const merkInp = document.getElementById(merkId);
  const typeInp = document.getElementById(typeId);
  if (!merkInp || !typeInp || merkInp.dataset.mk) return;
  merkInp.dataset.mk = typeInp.dataset.mk = '1';

  const proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  const getV = el => proto.get.call(el);
  const setV = (el, v) => proto.set.call(el, v);
  const fire = el => { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };

  const maakSelect = inp => {
    const sel = document.createElement('select');
    sel.className = inp.className;
    sel.style.width = '100%';
    inp.parentNode.insertBefore(sel, inp);
    inp.style.marginTop = '6px';
    return sel;
  };
  const merkSel = maakSelect(merkInp);
  const typeSel = maakSelect(typeInp);
  const hint = document.createElement('div');
  hint.style.cssText = 'display:none;font-size:12px;font-weight:600;color:#b45309;margin-top:4px';
  typeInp.parentNode.insertBefore(hint, typeInp.nextSibling);
  const klantInp = opts.klantId ? document.getElementById(opts.klantId) : null;
  const isDfkKlant = v => !String(v || '').trim() || String(v).trim().toLowerCase() === 'dfk';
  const verbergKlasseTypes = () => !!opts.sessie || (!!klantInp && !isDfkKlant(klantInp.value));
  merkInp.placeholder = 'Ander merk…';
  typeInp.placeholder = 'Ander type…';

  const opties = (lijst, leeg) =>
    `<option value="" disabled hidden>${leeg}</option>` +
    lijst.map(x => `<option value="${x.replace(/"/g, '&quot;')}">${x}</option>`).join('') +
    `<option disabled>──────────</option><option value="${MK_ANDER}">Ander…</option>`;
  merkSel.innerHTML = opties(Object.keys(MOTOR_TYPES), 'Kies merk');
  let anderMerk = false, anderType = false; // gebruiker koos zelf "Ander…"

  // Zet de keuzelijsten op basis van de huidige waarden in de inputs
  function sync() {
    const mv = getV(merkInp).trim(), tv = getV(typeInp).trim();
    const merk = mkZoekMerk(mv);
    if (merk) { merkSel.value = merk; if (mv !== merk) setV(merkInp, merk); }
    else merkSel.value = (mv || anderMerk) ? MK_ANDER : '';
    merkInp.style.display = merkSel.value === MK_ANDER ? '' : 'none';

    if (merk) {
      typeSel.style.display = '';
      typeSel.disabled = false;
      const lijst = verbergKlasseTypes() ? MOTOR_TYPES[merk].filter(t => !mkIsKlasseType(t)) : MOTOR_TYPES[merk];
      typeSel.innerHTML = opties(lijst, 'Kies type');
      const klasseNodig = verbergKlasseTypes() && mkIsKlasseType(tv);
      // klasseNodig: waarde (bv. 'X30') blijft staan tot er gekozen wordt, zodat opslaan niets wist
      const klassen = klasseNodig ? MOTOR_KLASSEN[Object.keys(MOTOR_KLASSEN).find(k => mkNorm(k) === mkNorm(tv))] : [];
      hint.textContent = klasseNodig ? `Kies ${klassen.map(k => k.slice(tv.length).trim() || k).join(' of ')}${opts.sessie ? ' voor deze test' : ` (${tv} is enkel voor DFK-motoren)`}` : '';
      hint.style.display = klasseNodig ? '' : 'none';
      typeSel.style.borderColor = klasseNodig ? '#f59e0b' : '';
      const type = klasseNodig ? null : lijst.find(t => mkNorm(t) === mkNorm(tv));
      if (type) { typeSel.value = type; if (tv !== type) setV(typeInp, type); }
      else typeSel.value = (!klasseNodig && (tv || anderType)) ? MK_ANDER : '';
      typeInp.style.display = typeSel.value === MK_ANDER ? '' : 'none';
    } else if (merkSel.value === MK_ANDER) {
      // Onbekend merk: type vrij invullen
      typeSel.style.display = 'none';
      typeInp.style.display = '';
      typeInp.style.marginTop = '0';
    } else {
      typeSel.style.display = '';
      typeSel.disabled = true;
      typeSel.innerHTML = '<option value="">— Kies eerst merk —</option>';
      typeInp.style.display = 'none';
    }
    if (!merk) { hint.style.display = 'none'; typeSel.style.borderColor = ''; }
    if (typeSel.style.display !== 'none') typeInp.style.marginTop = '6px';
  }

  // Code die .value van buitenaf zet (bv. automatisch invullen) houdt de keuzelijsten mee
  [merkInp, typeInp].forEach(inp => Object.defineProperty(inp, 'value', {
    get() { return getV(inp); },
    set(v) { setV(inp, v); anderMerk = anderType = false; sync(); },
    configurable: true,
  }));

  merkSel.addEventListener('change', () => {
    const v = merkSel.value;
    anderMerk = v === MK_ANDER; anderType = false;
    setV(merkInp, v === MK_ANDER ? '' : v);
    if (!mkZoekType(mkZoekMerk(v), getV(typeInp))) setV(typeInp, '');
    sync();
    if (v === MK_ANDER) merkInp.focus();
    fire(merkInp); fire(typeInp);
  });
  typeSel.addEventListener('change', () => {
    const v = typeSel.value;
    anderType = v === MK_ANDER;
    setV(typeInp, v === MK_ANDER ? '' : v);
    sync();
    if (v === MK_ANDER) typeInp.focus();
    fire(typeInp);
  });
  // Vrij getypt merk/type dat toch in de lijst staat (bv. "honda") alsnog herkennen
  [merkInp, typeInp].forEach(inp => inp.addEventListener('blur', () => {
    if (mkZoekMerk(getV(merkInp)) || mkZoekType(mkZoekMerk(getV(merkInp)), getV(typeInp))) { anderMerk = anderType = false; sync(); }
  }));
  // Klant gewijzigd: lijst met types opnieuw opbouwen (X30 enkel bij DFK)
  if (klantInp) ['input', 'change'].forEach(ev => klantInp.addEventListener(ev, () => sync()));
  sync();
}

// ── CARBURATEURS: naam + motortype ────────────────────────────────────────────
// Dezelfde carbunaam op een ander motortype is een andere carbu (bv. "DFK 2" op X30 Mini ≠ op X30).
// X30 Junior en X30 Senior horen bij hetzelfde motortype X30 (zelfde motor, andere klasse).
function mkCarbuType(type) {
  const t = String(type || '').trim();
  if (!t) return '';
  const basis = mkBasisType(t);
  if (basis) return basis;
  for (const merk of Object.keys(MOTOR_TYPES)) { const c = mkZoekType(merk, t); if (c) return c; }
  return t;
}
const mkCarbuSleutel = (naam, type) => String(naam || '').trim() + '|' + mkCarbuType(type);
// Merk bij een (carbu)type, voor labels: 'X30' → 'IAME', 'Cadet' → 'Honda'
const mkMerkVanType = type => Object.keys(MOTOR_TYPES).find(m => mkZoekType(m, type)) || '';

// Gebruik van carbu's in sessies: { sleutel: { naam, type, sessies: Set(id), types: Set(volledig type) } }
// typeVanMotor(motorNummer) geeft het motortype als de sessie er zelf geen heeft.
function mkCarbuGebruik(sessies, typeVanMotor) {
  const res = {};
  (sessies || []).forEach(s => {
    const volledig = (s.motorType || s.motor_type || (typeVanMotor ? typeVanMotor(s.motorNummer || s.motor_nummer) : '') || '').trim();
    const type = mkCarbuType(volledig);
    const namen = new Set([(s.carbu || '').trim(), ...(s.runs || []).map(r => (r.carbu || '').trim())].filter(Boolean));
    namen.forEach(naam => {
      const k = naam + '|' + type;
      const e = (res[k] ??= { naam, type, sessies: new Set(), types: new Set() });
      if (s.id) e.sessies.add(s.id);
      if (volledig) e.types.add(volledig);
    });
  });
  return res;
}

// Welke carbu-records moeten aangemaakt of aangevuld worden zodat elke (naam, type) uit de sessies bestaat.
// dbCarbus: [{id, naam, motorType}]. Een bestaand record zonder type krijgt het type van zijn eerste gebruik.
function mkCarbuSync(dbCarbus, gebruik) {
  const bestaand = new Set(dbCarbus.map(c => mkCarbuSleutel(c.naam, c.motorType)));
  const zonderType = {}; // naam → record zonder motortype dat nog een type mag krijgen
  dbCarbus.forEach(c => { if (!mkCarbuType(c.motorType) && !zonderType[c.naam.trim()]) zonderType[c.naam.trim()] = c; });
  const updates = [], nieuw = [];
  Object.values(gebruik).sort((a, b) => b.sessies.size - a.sessies.size).forEach(g => {
    const k = g.naam + '|' + g.type;
    if (bestaand.has(k)) return;
    if (!g.type) { if (dbCarbus.some(c => c.naam.trim() === g.naam)) return; }
    const vrij = zonderType[g.naam];
    if (vrij && g.type) { updates.push({ id: vrij.id, motor_type: g.type }); delete zonderType[g.naam]; }
    else nieuw.push({ naam: g.naam, motor_type: g.type });
    bestaand.add(k);
  });
  return { updates, nieuw };
}
