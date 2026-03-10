/* ================================================================== */
/*  Galerie du Temps — Central Color System                           */
/*  Single source of truth for all colors in the app.                 */
/* ================================================================== */

/* ---- Base solids ------------------------------------------------- */
export const gold      = '#B08D57'
export const goldLight = '#C9A96E'
export const cream     = '#F0E6D6'
export const dark      = '#0C0A08'
export const panel     = '#1A1410'
export const brown     = '#2C2420'
export const parchment = '#F7F2EB'
export const imageBg   = '#E0D4C0'
export const loss      = '#B5736A'
export const success   = '#7A8B6F'

/* ---- Gradients --------------------------------------------------- */
export const goldGrad    = 'linear-gradient(135deg, #B08D57, #C9A96E)'
export const hoverGrad   = 'linear-gradient(to top, rgba(12,10,8,0.5), transparent 60%)'
export const dividerGrad = 'linear-gradient(90deg, transparent, #B08D57, transparent)'

/* ---- Alpha helpers ----------------------------------------------- */
export const goldA      = (a) => `rgba(176, 141, 87, ${a})`
export const goldLightA = (a) => `rgba(201, 169, 110, ${a})`
export const creamA     = (a) => `rgba(240, 230, 214, ${a})`
export const brownA     = (a) => `rgba(44, 36, 32, ${a})`
export const darkA      = (a) => `rgba(12, 10, 8, ${a})`
export const lossA      = (a) => `rgba(181, 115, 106, ${a})`

/* ---- Pre-computed gold alphas ------------------------------------ */
export const gold05 = goldA(0.05)
export const gold08 = goldA(0.08)
export const gold10 = goldA(0.1)
export const gold12 = goldA(0.12)
export const gold15 = goldA(0.15)
export const gold20 = goldA(0.2)
export const gold25 = goldA(0.25)
export const gold30 = goldA(0.3)
export const gold40 = goldA(0.4)
export const gold50 = goldA(0.5)
export const gold60 = goldA(0.6)

/* ---- Pre-computed goldLight alphas ------------------------------- */
export const goldLight70 = goldLightA(0.7)

/* ---- Pre-computed loss alphas ------------------------------------ */
export const loss60 = lossA(0.6)

/* ---- Pre-computed cream alphas ----------------------------------- */
export const cream02 = creamA(0.02)
export const cream03 = creamA(0.03)
export const cream04 = creamA(0.04)
export const cream05 = creamA(0.05)
export const cream06 = creamA(0.06)
export const cream08 = creamA(0.08)
export const cream10 = creamA(0.1)
export const cream15 = creamA(0.15)
export const cream20 = creamA(0.2)
export const cream25 = creamA(0.25)
export const cream30 = creamA(0.3)
export const cream35 = creamA(0.35)
export const cream40 = creamA(0.4)
export const cream50 = creamA(0.5)
export const cream60 = creamA(0.6)
export const cream70 = creamA(0.7)
export const cream80 = creamA(0.8)

/* ---- Pre-computed brown alphas ----------------------------------- */
export const brown03 = brownA(0.03)
export const brown04 = brownA(0.04)
export const brown06 = brownA(0.06)
export const brown08 = brownA(0.08)
export const brown12 = brownA(0.12)
export const brown15 = brownA(0.15)
export const brown20 = brownA(0.2)
export const brown25 = brownA(0.25)
export const brown30 = brownA(0.3)
export const brown35 = brownA(0.35)
export const brown40 = brownA(0.4)
export const brown50 = brownA(0.5)

/* ---- Common style objects ---------------------------------------- */
export const panelStyle = {
  backgroundColor: panel,
  border: `1px solid ${cream06}`,
  borderRadius: '2px',
}

export const panelStyleGold = {
  backgroundColor: panel,
  border: `1px solid ${gold08}`,
  borderRadius: '2px',
}

export const tooltipStyle = {
  backgroundColor: dark,
  border: `1px solid ${cream10}`,
  borderRadius: '2px',
  color: cream,
  fontSize: '13px',
  fontFamily: 'DM Sans',
}

export const inputStyleDark = {
  backgroundColor: cream05,
  border: `1px solid ${cream08}`,
  borderRadius: '2px',
  color: cream,
}

/* ---- Status / Condition colors ----------------------------------- */
export const STATUS_COLORS = {
  new:     { color: gold,      bg: gold15 },
  read:    { color: cream40,   bg: cream05 },
  replied: { color: success,   bg: 'rgba(122, 139, 111, 0.15)' },
  closed:  { color: cream20,   bg: cream03 },
}

export const CONDITION_COLORS = {
  new:               { color: success, label: 'Новое' },
  excellent:         { color: gold,    label: 'Отличное' },
  good:              { color: '#C9956B', label: 'Хорошее' },
  vintage_character: { color: loss,    label: 'Винтаж' },
}

export const PIE_COLORS = ['#5B3A29', '#B08D57', '#B08D57', '#B08D57', '#0C0A08', '#7A5340']
