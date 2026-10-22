// ── VASTE MOTORMERKEN EN -TYPES ───────────────────────────────────────────────
// Eén centrale lijst voor de hele website. Nieuw merk of type? Voeg het hier toe.
const MOTOR_TYPES = {
  'Honda': ['Cadet', 'Junior', 'Senior'],
  'IAME':  ['X30 Mini', 'X30 Junior', 'X30 Senior', 'Super Shifter'],
};

const MK_ANDER = '__ander__';
const mkNorm = s => String(s || '').toLowerCase().replace(/[\s\-_.]/g, '');
const mkZoekMerk = v => Object.keys(MOTOR_TYPES).find(m => mkNorm(m) === mkNorm(v));
const mkZoekType = (merk, v) => (MOTOR_TYPES[merk] || []).find(t => mkNorm(t) === mkNorm(v));

// Vervangt de tekstvelden voor merk en type door keuzelijsten (+ "Ander…").
// De originele inputs blijven bestaan (verborgen) en bevatten altijd de gekozen waarde,
// dus bestaande code die .value leest of zet blijft gewoon werken.
function motorKeuze(merkId, typeId) {
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
  merkInp.placeholder = 'Ander merk…';
  typeInp.placeholder = 'Ander type…';

  const opties = (lijst, leeg) =>
    `<option value="">${leeg}</option>` +
    lijst.map(x => `<option value="${x.replace(/"/g, '&quot;')}">${x}</option>`).join('') +
    `<option value="${MK_ANDER}">Ander…</option>`;
  merkSel.innerHTML = opties(Object.keys(MOTOR_TYPES), '— Kies merk —');
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
      typeSel.innerHTML = opties(MOTOR_TYPES[merk], '— Kies type —');
      const type = mkZoekType(merk, tv);
      if (type) { typeSel.value = type; if (tv !== type) setV(typeInp, type); }
      else typeSel.value = (tv || anderType) ? MK_ANDER : '';
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
  sync();
}
