/* HKI Navigation Card
 * Highly Customizable Navigation Bar
 */

const _getLit = () => {
  const base =
    customElements.get("hui-masonry-view") ||
    customElements.get("ha-panel-lovelace") ||
    customElements.get("ha-app");
  const LitElement = base ? Object.getPrototypeOf(base) : window.LitElement;
  const html = LitElement?.prototype?.html || window.html;
  const css = LitElement?.prototype?.css || window.css;
  return { LitElement, html, css };
};

const { LitElement, html, css } = _getLit();

const CARD_TYPE = "hki-navigation-card";
const EDITOR_TAG = "hki-navigation-card-editor";

console.info(
  '%c HKI-NAVIGATION-CARD %c v1.0.1 ',
  'color: white; background: #2e7d32; font-weight: bold;',
  'color: #2e7d32; background: white; font-weight: bold;'
);

const INHERIT = "__inherit__";
const MIN_PILL_WIDTH = 85;

const BUTTON_TYPES = [
  { value: "icon", label: "Icon Only" },
  { value: "icon_label_below", label: "Icon + Label Below" },
  { value: "icon_label_left", label: "Icon + Label Left" },
  { value: "icon_label_right", label: "Icon + Label Right" },
  { value: "pill", label: "Pill Button (Icon + Label)" },
  { value: "pill_label", label: "Pill Button (Label Only)" },
];

const FONT_WEIGHTS = [
  { value: 300, label: "Light (300)" },
  { value: 400, label: "Regular (400)" },
  { value: 500, label: "Medium (500)" },
  { value: 600, label: "Semibold (600)" },
  { value: 700, label: "Bold (700)" },
  { value: 800, label: "Extra Bold (800)" },
];

const ACTIONS = [
  { value: "navigate", label: "Navigate" },
  { value: "url", label: "Open URL" },
  { value: "toggle", label: "Toggle entity" },
  { value: "more-info", label: "More info" },
  { value: "call-service", label: "Call service" },
  { value: "back", label: "Back" },
  { value: "toggle-group", label: "Show/Hide Group" },
  { value: "none", label: "None" },
];

const GROUP_ACTIONS = [
  { value: "toggle", label: "Toggle" },
  { value: "show", label: "Show" },
  { value: "hide", label: "Hide" },
];

const GROUP_TARGETS = [
  { value: "horizontal", label: "Horizontal group" },
  { value: "vertical", label: "Vertical group" },
  { value: "both", label: "Both groups" },
];

const CONDITION_TYPES = [
  { value: "entity", label: "Entity state" },
  { value: "user", label: "User" },
  { value: "view", label: "View" },
  { value: "screen", label: "Screen size" },
];

const ENTITY_OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not equals" },
  { value: "above", label: "Above (numeric)" },
  { value: "below", label: "Below (numeric)" },
  { value: "includes", label: "Includes" },
  { value: "not_includes", label: "Not includes" },
  { value: "exists", label: "Entity exists" },
  { value: "not_exists", label: "Entity does not exist" },
];

const DEFAULT_LABEL_STYLE = {
  font_size: 12,
  font_weight: 600,
  letter_spacing: 0,
  text_transform: "none",
  color: "",
  background: "",
  background_opacity: 0.72,
  padding_x: 10,
  padding_y: 6,
  border_radius: 999,
  backdrop_blur: 8,
  max_width: 220,
};

// Pre-compute button type values for faster lookup
const BUTTON_TYPE_VALUES = new Set(BUTTON_TYPES.map(t => t.value));

function _uid() {
  return window.crypto?.randomUUID?.() ?? `id_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
}

function safeString(v) {
  return v == null ? "" : String(v);
}

function deepClone(obj) {
  return obj ? JSON.parse(JSON.stringify(obj)) : obj;
}

function clampNum(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clampInt(v, fallback, min = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(min, Math.trunc(n)) : fallback;
}

function fireEvent(node, type, detail, options = {}) {
  node.dispatchEvent(
    new CustomEvent(type, {
      detail,
      bubbles: options.bubbles ?? true,
      composed: options.composed ?? true,
    })
  );
}

function _hasMeaningfulNumber(x) {
  if (x == null) return false;
  if (typeof x === "number") return Number.isFinite(x);
  if (typeof x === "string") {
    const t = x.trim();
    return t !== "" && Number.isFinite(Number(t));
  }
  return false;
}

function _toNumber(x) {
  return typeof x === "number" ? x : Number(String(x).trim());
}

function normalizeLabelStyle(style) {
  const s = style && typeof style === "object" ? style : {};
  return {
    font_size: clampNum(s.font_size, DEFAULT_LABEL_STYLE.font_size),
    font_weight: clampNum(s.font_weight, DEFAULT_LABEL_STYLE.font_weight),
    letter_spacing: clampNum(s.letter_spacing, DEFAULT_LABEL_STYLE.letter_spacing),
    text_transform: typeof s.text_transform === "string" ? s.text_transform : DEFAULT_LABEL_STYLE.text_transform,
    color: typeof s.color === "string" ? s.color : "",
    background: typeof s.background === "string" ? s.background : "",
    background_opacity: clampNum(s.background_opacity, DEFAULT_LABEL_STYLE.background_opacity),
    padding_x: clampNum(s.padding_x, DEFAULT_LABEL_STYLE.padding_x),
    padding_y: clampNum(s.padding_y, DEFAULT_LABEL_STYLE.padding_y),
    border_radius: clampNum(s.border_radius, DEFAULT_LABEL_STYLE.border_radius),
    backdrop_blur: clampNum(s.backdrop_blur, DEFAULT_LABEL_STYLE.backdrop_blur),
    max_width: clampNum(s.max_width, DEFAULT_LABEL_STYLE.max_width),
  };
}

function mergeLabelStyle(globalStyle, buttonStyle) {
  const g = normalizeLabelStyle(globalStyle);
  const b = buttonStyle && typeof buttonStyle === "object" ? buttonStyle : {};

  const pickStr = (key) => {
    const val = b[key];
    return typeof val === "string" && val.trim() !== "" ? val : g[key];
  };

  const pickNum = (key) =>
    _hasMeaningfulNumber(b[key]) ? _toNumber(b[key]) : g[key];

  return {
    font_size: pickNum("font_size"),
    font_weight: pickNum("font_weight"),
    letter_spacing: pickNum("letter_spacing"),
    text_transform: pickStr("text_transform"),
    color: pickStr("color"),
    background: pickStr("background"),
    background_opacity: pickNum("background_opacity"),
    padding_x: pickNum("padding_x"),
    padding_y: pickNum("padding_y"),
    border_radius: pickNum("border_radius"),
    backdrop_blur: pickNum("backdrop_blur"),
    max_width: pickNum("max_width"),
  };
}

function normalizeButtonType(type, fallback) {
  return BUTTON_TYPE_VALUES.has(type) ? type : fallback;
}

/* -------------------- Minimal YAML parser -------------------- */
function _stripYamlComment(line) {
  let inS = false, inD = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "'" && !inD) inS = !inS;
    else if (ch === '"' && !inS) inD = !inD;
    else if (ch === "#" && !inS && !inD) return line.slice(0, i);
  }
  return line;
}

function _parseScalar(raw) {
  const s = raw.trim();
  if (s === "") return null;

  if ((s[0] === "{" && s[s.length - 1] === "}") || (s[0] === "[" && s[s.length - 1] === "]")) {
    try { return JSON.parse(s); } catch (_) {}
  }

  const lower = s.toLowerCase();
  if (lower === "null" || lower === "~") return null;
  if (lower === "true" || lower === "yes" || lower === "on") return true;
  if (lower === "false" || lower === "no" || lower === "off") return false;

  if (/^-?\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    if (Number.isFinite(n)) return n;
  }

  if ((s[0] === '"' && s[s.length - 1] === '"') || (s[0] === "'" && s[s.length - 1] === "'")) {
    return s.slice(1, -1);
  }

  return s;
}

function parseYamlLite(yamlStr) {
  const src = safeString(yamlStr);
  const lines = src.split("\n");
  const lineCount = lines.length;

  const nextNonEmpty = new Array(lineCount).fill(-1);
  let next = -1;
  for (let i = lineCount - 1; i >= 0; i--) {
    const l = _stripYamlComment(lines[i]).trim();
    if (l !== "") next = i;
    nextNonEmpty[i] = next;
  }

  const root = {};
  const stack = [{ indent: -1, kind: "map", value: root }];

  const popToIndent = (indent) => {
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
  };

  const ensureContainerForKey = (parent, key, kind) => {
    parent[key] = kind === "list" ? [] : {};
    return parent[key];
  };

  for (let i = 0; i < lineCount; i++) {
    let rawLine = _stripYamlComment(lines[i]);
    if (!rawLine.trim()) continue;

    const indent = rawLine.match(/^\s*/)[0].length;
    const line = rawLine.trim();

    popToIndent(indent);
    const top = stack[stack.length - 1];

    if (line[0] === "-") {
      if (top.kind !== "list") {
        if (stack.length === 1) {
          stack[0] = { indent: -1, kind: "list", value: [] };
        } else {
          throw new Error("YAML: list item found where a mapping was expected.");
        }
      }

      const list = stack[stack.length - 1].value;
      const itemRest = line.slice(1).trim();

      if (itemRest === "") {
        const ni = nextNonEmpty[i];
        const nextLine = ni >= 0 ? _stripYamlComment(lines[ni]).trim() : "";
        const nextIndent = ni >= 0 ? _stripYamlComment(lines[ni]).match(/^\s*/)[0].length : -1;

        if (ni >= 0 && nextIndent > indent && nextLine[0] === "-") {
          const child = [];
          list.push(child);
          stack.push({ indent, kind: "list", value: child });
        } else if (ni >= 0 && nextIndent > indent) {
          const child = {};
          list.push(child);
          stack.push({ indent, kind: "map", value: child });
        } else {
          list.push(null);
        }
        continue;
      }

      const colonIdx = itemRest.indexOf(":");
      if (colonIdx > -1) {
        const k = itemRest.slice(0, colonIdx).trim();
        const vRaw = itemRest.slice(colonIdx + 1).trim();
        if (vRaw === "") {
          const ni = nextNonEmpty[i];
          const nextLine = ni >= 0 ? _stripYamlComment(lines[ni]).trim() : "";
          const nextIndent = ni >= 0 ? _stripYamlComment(lines[ni]).match(/^\s*/)[0].length : -1;

          const child = {};
          child[k] = (ni >= 0 && nextIndent > indent && nextLine[0] === "-") ? [] : {};
          list.push(child);
          stack.push({ indent, kind: "map", value: child });
          stack.push({ indent: indent + 2, kind: Array.isArray(child[k]) ? "list" : "map", value: child[k] });
        } else {
          const child = {};
          child[k] = _parseScalar(vRaw);
          list.push(child);
        }
        continue;
      }

      list.push(_parseScalar(itemRest));
      continue;
    }

    const idx = line.indexOf(":");
    if (idx === -1) throw new Error(`YAML: expected "key: value" but got "${line}"`);

    const key = line.slice(0, idx).trim();
    const vRaw = line.slice(idx + 1).trim();

    if (stack[stack.length - 1].kind !== "map") {
      throw new Error("YAML: mapping entry found where a list was expected.");
    }

    const map = stack[stack.length - 1].value;

    if (vRaw === "") {
      const ni = nextNonEmpty[i];
      const nextLine = ni >= 0 ? _stripYamlComment(lines[ni]).trim() : "";
      const nextIndent = ni >= 0 ? _stripYamlComment(lines[ni]).match(/^\s*/)[0].length : -1;

      if (ni >= 0 && nextIndent > indent && nextLine[0] === "-") {
        const child = ensureContainerForKey(map, key, "list");
        stack.push({ indent: indent + 2, kind: "list", value: child });
      } else if (ni >= 0 && nextIndent > indent) {
        const child = ensureContainerForKey(map, key, "map");
        stack.push({ indent: indent + 2, kind: "map", value: child });
      } else {
        map[key] = null;
      }
    } else {
      map[key] = _parseScalar(vRaw);
    }
  }

  return Array.isArray(stack[0].value) ? stack[0].value : root;
}

/* -------------------------- Defaults -------------------------- */

const DEFAULT_BUTTON = () => ({
  id: _uid(),
  icon: "mdi:floor-plan",
  tooltip: "",
  label: "",
  entity: "",
  button_type: "",
  background: "",
  background_opacity: "",
  icon_color: "",
  label_style: {},
  pill_width: "",
  conditions_mode: "all",
  conditions: [],
  tap_action: { action: "navigate", navigation_path: "/" },
  hold_action: { action: "none" },
  double_tap_action: { action: "none" },
});

const DEFAULTS = {
  type: `custom:${CARD_TYPE}`,
  position: "bottom-right",
  offset_x: 12,
  offset_y: 20,
  button_size: 50,
  gap: 12,
  vertical_gap: 12,
  z_index: 5,
  base: { button: DEFAULT_BUTTON() },
  horizontal: { enabled: true, columns: 6, buttons: [] },
  vertical: { enabled: false, rows: 6, buttons: [] },
  default_background: "",
  default_button_opacity: 1,
  default_icon_color: "",
  button_box_shadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
  button_box_shadow_hover: "0 10px 30px rgba(0, 0, 0, 0.42)",
  default_button_type: "icon",
  label_style: { ...DEFAULT_LABEL_STYLE },
  pill_width: 0,
  center_spread: false,
  offset_x_mobile: null,
  offset_x_tablet: null,
  offset_x_desktop: null,
  bottom_bar_enabled: false,
  bottom_bar_height: 85,
  bottom_bar_color: "rgb(var(--rgb-card-background-color, 0,0,0))",
  bottom_bar_opacity: 0.85,
  bottom_bar_full_width: false,
  bottom_bar_border_radius: 0,
  bottom_bar_box_shadow: "",
  bottom_bar_bottom_offset: 0,
  bottom_bar_margin_left: 0,
  bottom_bar_margin_right: 0,
  bottom_bar_border_width: 0,
  bottom_bar_border_style: "solid",
  bottom_bar_border_color: "",
};

function ensureButtonIdsInList(list) {
  const arr = Array.isArray(list) ? list : [];
  let changed = false;
  const next = arr.map((b) => {
    if (b && typeof b === "object" && !b.id) {
      changed = true;
      return { ...b, id: _uid() };
    }
    return b;
  });
  return [next, changed];
}

function ensureConditionIdsInList(list) {
  const arr = Array.isArray(list) ? list : [];
  let changed = false;
  const next = arr.map((b) => {
    if (!b || typeof b !== "object") return b;

    const conds = Array.isArray(b.conditions) ? b.conditions : [];
    let local = false;
    const nextConds = conds.map((c) => {
      if (!c || typeof c !== "object") return c;
      const cc = { ...c };
      if (!cc.id) { cc.id = _uid(); local = true; }
      if (!cc.type) cc.type = "entity";
      return cc;
    });

    if (local) {
      changed = true;
      return { ...b, conditions: nextConds };
    }
    return b;
  });
  return [next, changed];
}

function inferButtonTypeFromLegacy(btn, configDefaultType) {
  if (btn?.button_type && BUTTON_TYPE_VALUES.has(btn.button_type)) return btn.button_type;

  const lp = btn?.label_position;
  if (lp === "inside") return "pill";
  if (lp === "below") return "icon_label_below";
  if (lp === "left") return "icon_label_left";
  if (lp === "right") return "icon_label_right";
  if (lp === "none") return "icon";

  if (btn?.show_label === true) return configDefaultType || "icon_label_below";
  if (btn?.show_label === false) return "icon";

  return configDefaultType || "icon";
}

function normalizeConfig(cfg) {
  const raw = { ...DEFAULTS, ...(cfg || {}) };

  const base = { ...(raw.base || {}) };
  base.button = { ...DEFAULT_BUTTON(), ...(base.button || {}) };
  if (!base.button.id) base.button.id = _uid();
  delete base.button.conditions;
  delete base.button.conditions_mode;

  const horizontal = { ...DEFAULTS.horizontal, ...(raw.horizontal || {}) };
  const vertical = { ...DEFAULTS.vertical, ...(raw.vertical || {}) };

  const hasNewLists =
    (Array.isArray(horizontal.buttons) && horizontal.buttons.length > 0) ||
    (Array.isArray(vertical.buttons) && vertical.buttons.length > 0);

  if (!hasNewLists && Array.isArray(raw.buttons)) {
    const h = [], v = [];
    for (const b of raw.buttons) {
      if (b?.group === "vertical") v.push({ ...b });
      else h.push({ ...b });
    }
    horizontal.buttons = h;
    vertical.buttons = v;
  }

  const c = {
    ...raw,
    base,
    horizontal,
    vertical,
    label_style: normalizeLabelStyle(raw.label_style),
  };

  c.position = ["bottom-left", "bottom-center", "bottom-right"].includes(c.position) ? c.position : "bottom-right";
  c.offset_x = clampNum(c.offset_x, DEFAULTS.offset_x);
  c.offset_y = clampNum(c.offset_y, DEFAULTS.offset_y);
  c.button_size = Math.max(36, clampNum(c.button_size, DEFAULTS.button_size));
  c.gap = Math.max(0, clampNum(c.gap, DEFAULTS.gap));
  c.vertical_gap = Math.max(0, clampNum(c.vertical_gap, c.gap));
  c.z_index = clampNum(c.z_index, DEFAULTS.z_index);

  c.bottom_bar_enabled = !!raw.bottom_bar_enabled;
  c.bottom_bar_full_width = !!raw.bottom_bar_full_width;
  c.bottom_bar_height = Math.max(0, clampInt(raw.bottom_bar_height, DEFAULTS.bottom_bar_height, 0));
  c.bottom_bar_color = typeof raw.bottom_bar_color === "string" ? raw.bottom_bar_color : DEFAULTS.bottom_bar_color;
  c.bottom_bar_opacity = Math.max(0, Math.min(1, clampNum(raw.bottom_bar_opacity, DEFAULTS.bottom_bar_opacity)));
  c.bottom_bar_border_radius = Math.max(0, clampNum(raw.bottom_bar_border_radius, DEFAULTS.bottom_bar_border_radius));
  c.bottom_bar_bottom_offset = clampNum(raw.bottom_bar_bottom_offset, DEFAULTS.bottom_bar_bottom_offset);
  c.bottom_bar_box_shadow = typeof raw.bottom_bar_box_shadow === "string" ? raw.bottom_bar_box_shadow : DEFAULTS.bottom_bar_box_shadow;
  c.bottom_bar_margin_left = clampNum(raw.bottom_bar_margin_left, DEFAULTS.bottom_bar_margin_left);
  c.bottom_bar_margin_right = clampNum(raw.bottom_bar_margin_right, DEFAULTS.bottom_bar_margin_right);
  c.bottom_bar_border_width = Math.max(0, clampNum(raw.bottom_bar_border_width, DEFAULTS.bottom_bar_border_width));
  c.bottom_bar_border_style = typeof raw.bottom_bar_border_style === "string" ? raw.bottom_bar_border_style : DEFAULTS.bottom_bar_border_style;
  c.bottom_bar_border_color = typeof raw.bottom_bar_border_color === "string" ? raw.bottom_bar_border_color : DEFAULTS.bottom_bar_border_color;

  c.button_box_shadow = typeof raw.button_box_shadow === "string" ? raw.button_box_shadow : DEFAULTS.button_box_shadow;
  c.button_box_shadow_hover = typeof raw.button_box_shadow_hover === "string" ? raw.button_box_shadow_hover : DEFAULTS.button_box_shadow_hover;

  c.default_button_opacity = Math.max(0, Math.min(1, clampNum(c.default_button_opacity, DEFAULTS.default_button_opacity)));

  c.horizontal.enabled = !!c.horizontal.enabled;
  c.horizontal.columns = Math.max(1, clampInt(c.horizontal.columns, DEFAULTS.horizontal.columns, 1));
  c.horizontal.buttons = Array.isArray(c.horizontal.buttons) ? c.horizontal.buttons : [];

  c.vertical.enabled = !!c.vertical.enabled;
  c.vertical.rows = Math.max(1, clampInt(c.vertical.rows, DEFAULTS.vertical.rows, 1));
  c.vertical.buttons = Array.isArray(c.vertical.buttons) ? c.vertical.buttons : [];

  c.default_button_type = normalizeButtonType(c.default_button_type, DEFAULTS.default_button_type);

  if (!cfg?.default_button_type && (cfg?.default_label_position || cfg?.default_show_label !== undefined)) {
    if (cfg?.default_show_label) {
      const lp = cfg.default_label_position;
      if (lp === "inside") c.default_button_type = "pill";
      else if (lp === "left") c.default_button_type = "icon_label_left";
      else if (lp === "right") c.default_button_type = "icon_label_right";
      else c.default_button_type = "icon_label_below";
    } else {
      c.default_button_type = "icon";
    }
  }

  c.pill_width = clampNum(c.pill_width, 0);
  if (c.pill_width > 0 && c.pill_width < MIN_PILL_WIDTH) c.pill_width = MIN_PILL_WIDTH;

  c.center_spread = !!c.center_spread;

  c.offset_x_mobile = raw.offset_x_mobile != null && raw.offset_x_mobile !== "" ? Number(raw.offset_x_mobile) : null;
  c.offset_x_tablet = raw.offset_x_tablet != null && raw.offset_x_tablet !== "" ? Number(raw.offset_x_tablet) : null;
  c.offset_x_desktop = raw.offset_x_desktop != null && raw.offset_x_desktop !== "" ? Number(raw.offset_x_desktop) : null;

  const [hb] = ensureButtonIdsInList(c.horizontal.buttons);
  const [vb] = ensureButtonIdsInList(c.vertical.buttons);
  c.horizontal.buttons = hb;
  c.vertical.buttons = vb;

  const [hb2] = ensureConditionIdsInList(c.horizontal.buttons);
  const [vb2] = ensureConditionIdsInList(c.vertical.buttons);
  c.horizontal.buttons = hb2;
  c.vertical.buttons = vb2;

  return c;
}

/* -------------------------- Color helpers -------------------------- */

function clamp01(n) {
  const x = Number(n);
  return Number.isFinite(x) ? Math.max(0, Math.min(1, x)) : 1;
}

function applyBgOpacity(color, opacity01) {
  const o = clamp01(opacity01);
  if (o >= 1) return color;
  if (o <= 0) return "transparent";
  return `color-mix(in srgb, ${color} ${Math.round(o * 1000) / 10}%, transparent)`;
}

/* -------------------------- Card -------------------------- */

class HkiNavigationCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      _config: { state: true },
      _layout: { state: true },
    };
  }

  constructor() {
    super();
    this._groupOverride = { horizontal: null, vertical: null };
    this._tapState = { lastId: null, lastTime: 0, singleTimer: null };
    this._holdTimers = new Map();
    this._layout = { ready: false, slots: {}, meta: {} };
    this._measureRaf = null;
    this._bottomBarMeasureRaf = null;
    this._bottomBarBounds = null;
    this._contentLeftMargin = 0;
    this._contentRightMargin = 0;
    this._contentEl = null;
    this._rightPanelWidth = 0;
    this._rightPanelEl = null;
    this._uiObservers = [];
    this._resizeObservers = [];

    this._onResize = () => {
      this._refreshUiState();
      this._layout = { ready: false, slots: {}, meta: {} };
      this.requestUpdate();
      this._scheduleMeasure();
      this._scheduleMeasureBottomBar();
    };
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("resize", this._onResize);
    this._refreshUiState(true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("resize", this._onResize);

    for (const o of this._uiObservers) {
      try { o.disconnect(); } catch (_) {}
    }
    this._uiObservers = [];

    for (const ro of this._resizeObservers) {
      try { ro.disconnect(); } catch (_) {}
    }
    this._resizeObservers = [];

    if (this._measureRaf) cancelAnimationFrame(this._measureRaf);
    if (this._bottomBarMeasureRaf) cancelAnimationFrame(this._bottomBarMeasureRaf);
  }

  updated() {
    super.updated?.();
    this._refreshUiState(false, true);
    this._scheduleMeasure();
    this._scheduleMeasureBottomBar();
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = normalizeConfig(config);
    this._layout = { ready: false, slots: {}, meta: {} };
    this._refreshUiState(true);
    this.requestUpdate();
    this._scheduleMeasure();
  }

  getCardSize() {
    return 0;
  }

  _scheduleMeasure() {
    const c = this._config;
    if (!c || c.position === "bottom-center") return;

    if (this._measureRaf) cancelAnimationFrame(this._measureRaf);
    this._measureRaf = requestAnimationFrame(() => this._measureAndLayout());
  }

  _scheduleMeasureBottomBar() {
    const c = this._config;
    if (!c || !c.bottom_bar_enabled || c.bottom_bar_full_width) {
      if (this._bottomBarBounds) {
        this._bottomBarBounds = null;
        this.requestUpdate();
      }
      return;
    }

    if (this._bottomBarMeasureRaf) cancelAnimationFrame(this._bottomBarMeasureRaf);
    this._bottomBarMeasureRaf = requestAnimationFrame(() => this._measureBottomBarBounds());
  }

  _measureBottomBarBounds() {
    const c = this._config;
    if (!c || !c.bottom_bar_enabled || c.bottom_bar_full_width) return;
    if (c.position !== "bottom-center") return;

    const root = this.shadowRoot;
    if (!root) return;

    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    if (vw <= 0) return;

    const fabs = root.querySelectorAll(".fab-anchor .fab");
    if (!fabs.length) return;

    const rects = [];
    for (const el of fabs) {
      try {
        const r = el.getBoundingClientRect();
        if (r && r.width > 0 && r.height > 0) rects.push(r);
      } catch (_) {}
    }
    if (!rects.length) return;

    const maxBottom = Math.max(...rects.map((r) => r.bottom));
    const tol = 2;
    const bottomRow = rects.filter((r) => r.bottom >= maxBottom - tol);
    if (!bottomRow.length) return;

    const centerX = vw / 2;
    const threshold = vw * 0.4;
    const mainCluster = bottomRow.filter(r => {
      const buttonCenterX = (r.left + r.right) / 2;
      return Math.abs(buttonCenterX - centerX) <= threshold;
    });

    if (!mainCluster.length) return;

    const minLeft = Math.min(...mainCluster.map((r) => r.left));
    const maxRight = Math.max(...mainCluster.map((r) => r.right));

    const next = {
      left: Math.max(0, Math.round(minLeft)),
      right: Math.max(0, Math.round(vw - maxRight)),
    };

    const cur = this._bottomBarBounds;
    if (!cur || cur.left !== next.left || cur.right !== next.right) {
      this._bottomBarBounds = next;
      this.requestUpdate();
    }
  }

  _isEditMode() {
    try {
      const qs = new URLSearchParams(window.location.search || "");
      if (qs.get("edit") === "1") return true;
    } catch (_) {}
    const bodyClasses = document.body?.classList;
    return bodyClasses?.contains("edit-mode") || bodyClasses?.contains("edit") || false;
  }

  _queryDeep(selector, root = document, maxDepth = 12) {
    const results = [];
    const visited = new Set();

    const walk = (node, depth) => {
      if (!node || depth > maxDepth || visited.has(node)) return;
      visited.add(node);

      try {
        if (node.querySelectorAll) {
          const found = node.querySelectorAll(selector);
          for (let i = 0; i < found.length; i++) results.push(found[i]);
        }
      } catch (_) {}

      const sr = node.shadowRoot;
      if (sr) walk(sr, depth + 1);

      const children = node instanceof ShadowRoot ? node.host?.children : node.children;
      if (children) {
        for (let i = 0; i < children.length; i++) walk(children[i], depth + 1);
      }
    };

    walk(root, 0);
    return results;
  }

  _findVisibleBest(elements, predicate = null) {
    let best = null;
    let bestScore = 0;
    for (const el of elements) {
      try {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        if (rect.width <= 0 || rect.height <= 0) continue;
        if (predicate && !predicate(el, rect)) continue;
        const score = rect.width * rect.height;
        if (score > bestScore) {
          bestScore = score;
          best = el;
        }
      } catch (_) {}
    }
    return best;
  }

  _measureContentMargins() {
    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    const predicate = (_el, rect) => rect.width >= 200 && rect.height >= 200;

    const preferred = [
      ...this._queryDeep("hui-sections-view"),
      ...this._queryDeep("hui-view"),
      ...this._queryDeep("hui-masonry-view"),
    ];

    let el = this._findVisibleBest(preferred, predicate);

    if (!el) {
      el = this._findVisibleBest(this._queryDeep("ha-panel-lovelace"), predicate);
    }

    this._contentEl = el || null;

    if (!el || vw <= 0) {
      this._contentLeftMargin = 0;
      this._contentRightMargin = 0;
      return;
    }

    const rect = el.getBoundingClientRect();
    this._contentLeftMargin = Math.max(0, rect.left);
    this._contentRightMargin = Math.max(0, vw - rect.right);
  }

  _refreshUiState(forceRehook = false, softRehook = false) {
    const viewW = window.innerWidth || document.documentElement.clientWidth || 0;

    // Measure right edit panel
    const vw = viewW;
    const rightCandidates = [
      ...this._queryDeep("ha-drawer"),
      ...this._queryDeep("mwc-drawer"),
      ...this._queryDeep("app-drawer-layout"),
    ];
    const rightEl = this._findVisibleBest(rightCandidates, (_el, rect) => {
      if (vw <= 0) return false;
      return rect.right >= vw - 2 && rect.left >= vw * 0.55 && rect.width >= 120;
    });

    this._rightPanelEl = rightEl || null;
    this._rightPanelWidth = rightEl ? (rightEl.getBoundingClientRect().width || 0) : 0;

    this._measureContentMargins();

    if (forceRehook || softRehook) {
      for (const o of this._uiObservers) {
        try { o.disconnect(); } catch (_) {}
      }
      this._uiObservers = [];
      for (const ro of this._resizeObservers) {
        try { ro.disconnect(); } catch (_) {}
      }
      this._resizeObservers = [];

      const observeElAttrs = (el, attrs = []) => {
        if (!el) return;
        try {
          const mo = new MutationObserver(() => {
            this._measureContentMargins();
            this.requestUpdate();
            this._scheduleMeasure();
          });
          mo.observe(el, { attributes: true, attributeFilter: attrs.length ? attrs : undefined });
          this._uiObservers.push(mo);
        } catch (_) {}
      };

      observeElAttrs(this._rightPanelEl, ["open", "opened", "style", "class"]);
      observeElAttrs(document.body, ["class", "style"]);
      observeElAttrs(this._contentEl, ["style", "class"]);

      if (window.ResizeObserver) {
        const hookResize = (el) => {
          if (!el) return;
          try {
            const ro = new ResizeObserver(() => {
              this._measureContentMargins();
              this.requestUpdate();
              this._scheduleMeasure();
            });
            ro.observe(el);
            this._resizeObservers.push(ro);
          } catch (_) {}
        };
        hookResize(this._rightPanelEl);
        hookResize(this._contentEl);
      }
    }
  }

  _getButtonType(btn) {
    const t = safeString(btn?.button_type);
    return (t && BUTTON_TYPE_VALUES.has(t)) ? t : inferButtonTypeFromLegacy(btn, this._config.default_button_type);
  }

  _getLabelText(btn) {
    return btn?.label || btn?.tooltip || "";
  }

  _getPillWidth(btn) {
    const per = btn?.pill_width;
    if (_hasMeaningfulNumber(per)) {
      const n = _toNumber(per);
      return n <= 0 ? 0 : Math.max(MIN_PILL_WIDTH, n);
    }
    const g = clampNum(this._config.pill_width, 0);
    return g > 0 ? Math.max(MIN_PILL_WIDTH, g) : 0;
  }

  _buttonOpacity(btn) {
    return _hasMeaningfulNumber(btn?.background_opacity)
      ? clamp01(_toNumber(btn.background_opacity))
      : clamp01(this._config.default_button_opacity);
  }

  _buttonBg(btn) {
    const base = btn?.background || this._config.default_background || "var(--accent-color, var(--primary-color))";
    return applyBgOpacity(base, this._buttonOpacity(btn));
  }

  _buttonIconColor(btn) {
    return btn?.icon_color || this._config.default_icon_color || "var(--text-primary-color, var(--primary-text-color))";
  }

  _labelBubbleStyle(btn) {
    const merged = mergeLabelStyle(this._config.label_style, btn?.label_style);
    const bg = merged.background && merged.background !== ""
      ? applyBgOpacity(merged.background, clamp01(merged.background_opacity))
      : `rgba(var(--rgb-card-background-color, 0, 0, 0), ${clamp01(merged.background_opacity)})`;
    const color = merged.color && merged.color !== "" ? merged.color : "var(--text-primary-color, var(--primary-text-color))";

    return `font-size:${merged.font_size}px;font-weight:${merged.font_weight};letter-spacing:${merged.letter_spacing}px;text-transform:${merged.text_transform};color:${color};background:${bg};padding:${merged.padding_y}px ${merged.padding_x}px;border-radius:${merged.border_radius}px;max-width:${merged.max_width}px;backdrop-filter:blur(${merged.backdrop_blur}px);-webkit-backdrop-filter:blur(${merged.backdrop_blur}px)`;
  }

  _pillTextStyle(btn) {
    const merged = mergeLabelStyle(this._config.label_style, btn?.label_style);
    const color = merged.color && merged.color !== "" ? merged.color : "currentColor";
    return `font-size:${merged.font_size}px;font-weight:${merged.font_weight};letter-spacing:${merged.letter_spacing}px;text-transform:${merged.text_transform};color:${color}`;
  }

  /* -------------------------- Conditions -------------------------- */

  _evalCondition(cond) {
    const hass = this.hass;
    if (!hass || !cond || typeof cond !== "object") return true;

    const type = cond.type || "entity";
    let result = true;

    if (type === "entity") {
      const entityId = cond.entity;
      if (!entityId) return true;

      const operator = cond.operator || "equals";
      const stateObj = hass.states?.[entityId];

      if (operator === "exists") result = !!stateObj;
      else if (operator === "not_exists") result = !stateObj;
      else if (!stateObj) result = false;
      else {
        const actual = cond.attribute ? stateObj.attributes?.[cond.attribute] : stateObj.state;
        const actualStr = safeString(actual);
        const valueStr = safeString(cond.value);

        switch (operator) {
          case "equals": result = actualStr === valueStr; break;
          case "not_equals": result = actualStr !== valueStr; break;
          case "above": {
            const a = Number(actual), v = Number(cond.value);
            result = Number.isFinite(a) && Number.isFinite(v) && a > v;
            break;
          }
          case "below": {
            const a = Number(actual), v = Number(cond.value);
            result = Number.isFinite(a) && Number.isFinite(v) && a < v;
            break;
          }
          case "includes":
            result = Array.isArray(actual) ? actual.map(safeString).includes(valueStr) : actualStr.includes(valueStr);
            break;
          case "not_includes":
            result = Array.isArray(actual) ? !actual.map(safeString).includes(valueStr) : !actualStr.includes(valueStr);
            break;
        }
      }
    } else if (type === "user") {
      const userName = hass.user?.name || "";
      const list = Array.isArray(cond.users) ? cond.users : [];
      result = list.length === 0 || list.includes(userName);
    } else if (type === "view") {
      const path = window.location?.pathname || "";
      const list = Array.isArray(cond.views) ? cond.views : [];
      result = list.length === 0 || list.some((v) => v === path || path.endsWith(v));
    } else if (type === "screen") {
      const mode = cond.mode || "mobile";
      const isMobile = window.matchMedia?.("(max-width: 800px)")?.matches ?? false;
      result = mode === "mobile" ? isMobile : !isMobile;
    }

    return cond.invert ? !result : result;
  }

  _isButtonVisible(btn) {
    const conds = Array.isArray(btn?.conditions) ? btn.conditions : [];
    if (conds.length === 0) return true;

    const mode = btn.conditions_mode === "any" ? "any" : "all";
    return mode === "any"
      ? conds.some((c) => this._evalCondition(c))
      : conds.every((c) => this._evalCondition(c));
  }

  /* -------------------------- Group visibility -------------------------- */

  _isGroupVisible(groupKey) {
    const c = this._config;
    if (c.position === "bottom-center" && groupKey === "vertical") return false;

    const baseEnabled = groupKey === "horizontal" ? !!c.horizontal.enabled : !!c.vertical.enabled;
    const override = this._groupOverride[groupKey];
    return override === null ? baseEnabled : !!override;
  }

  _wasTempOpened(groupKey) {
    const c = this._config;
    const baseEnabled = groupKey === "horizontal" ? !!c.horizontal.enabled : !!c.vertical.enabled;
    const override = this._groupOverride[groupKey];
    return baseEnabled === false && override === true;
  }

  _autoCloseTempMenus() {
    if (this._wasTempOpened("horizontal")) this._groupOverride.horizontal = null;
    if (this._wasTempOpened("vertical")) this._groupOverride.vertical = null;
    this.requestUpdate();
    this._scheduleMeasure();
  }

  _toggleGroup(target, mode) {
    const c = this._config;

    const applyOne = (key) => {
      if (c.position === "bottom-center" && key === "vertical") return;

      const baseEnabled = key === "horizontal" ? !!c.horizontal.enabled : !!c.vertical.enabled;
      const override = this._groupOverride[key];
      const current = override === null ? baseEnabled : !!override;

      let next = current;
      if (mode === "show") next = true;
      else if (mode === "hide") next = false;
      else next = !current;

      this._groupOverride[key] = next === baseEnabled ? null : next;
    };

    if (target === "both") {
      applyOne("horizontal");
      applyOne("vertical");
    } else {
      applyOne(target);
    }

    this.requestUpdate();
    this._scheduleMeasure();
  }

  /* -------------------------- Screen-size-based offset -------------------------- */

  _computeOffsetX() {
    const c = this._config;
    const vw = window.innerWidth || document.documentElement.clientWidth || 0;

    if (vw < 768 && c.offset_x_mobile != null) return c.offset_x_mobile;
    if (vw >= 768 && vw < 1024 && c.offset_x_tablet != null) return c.offset_x_tablet;
    if (vw >= 1024 && c.offset_x_desktop != null) return c.offset_x_desktop;

    return c.offset_x || 0;
  }

  _renderBottomBar() {
    const c = this._config;
    if (!c?.bottom_bar_enabled) return null;

    const height = Math.max(0, clampInt(c.bottom_bar_height, DEFAULTS.bottom_bar_height, 0));
    if (height <= 0) return null;

    const color = (typeof c.bottom_bar_color === "string" && c.bottom_bar_color.trim()) || DEFAULTS.bottom_bar_color;
    const opacity = Math.max(0, Math.min(1, clampNum(c.bottom_bar_opacity, DEFAULTS.bottom_bar_opacity)));
    const bottom = clampNum(c.bottom_bar_bottom_offset, DEFAULTS.bottom_bar_bottom_offset);
    const radius = Math.max(0, clampNum(c.bottom_bar_border_radius, DEFAULTS.bottom_bar_border_radius));
    const shadow = (typeof c.bottom_bar_box_shadow === "string" && c.bottom_bar_box_shadow.trim()) || "";
    const marginLeft = clampNum(c.bottom_bar_margin_left, DEFAULTS.bottom_bar_margin_left);
    const marginRight = clampNum(c.bottom_bar_margin_right, DEFAULTS.bottom_bar_margin_right);
    const borderWidth = Math.max(0, clampNum(c.bottom_bar_border_width, DEFAULTS.bottom_bar_border_width));
    const borderStyle = (typeof c.bottom_bar_border_style === "string" && c.bottom_bar_border_style.trim()) || DEFAULTS.bottom_bar_border_style;
    const borderColor = (typeof c.bottom_bar_border_color === "string" && c.bottom_bar_border_color.trim()) || "";

    const styleParts = [
      `height:${height}px`,
      `background:${color}`,
      `opacity:${opacity}`,
      `z-index:1`,
      `border-radius:${radius}px`,
      `bottom:${bottom}px`,
    ];

    if (shadow) styleParts.push(`box-shadow:${shadow}`);
    if (borderWidth > 0 && borderColor) {
      styleParts.push(`border:${borderWidth}px ${borderStyle} ${borderColor}`);
    }

    const isFullWidth = c.bottom_bar_full_width || c.position !== "bottom-center";

    if (isFullWidth) {
      styleParts.push(`left:${marginLeft}px`, `right:${marginRight}px`);
    } else {
      this._scheduleMeasureBottomBar();
      if (this._bottomBarBounds) {
        styleParts.push(`left:${this._bottomBarBounds.left - marginLeft}px`, `right:${this._bottomBarBounds.right - marginRight}px`);
      } else {
        const offsetX = this._computeOffsetX();
        styleParts.push(`left:${offsetX - marginLeft}px`, `right:${offsetX - marginRight}px`);
      }
    }

    return html`<div class="bottom-bar" style="${styleParts.join(";")}"></div>`;
  }

  /* -------------------------- Dynamic layout measurement -------------------------- */

  _measureAndLayout() {
    const c = this._config;
    if (!c || c.position === "bottom-center") return;

    const root = this.shadowRoot;
    if (!root) return;

    const slotEls = root.querySelectorAll(".abs-slot");
    if (!slotEls.length) return;

    const widthByKey = {};
    for (const el of slotEls) {
      const slotId = el.getAttribute("data-slot-id") || "";
      const fab = el.querySelector(".fab");
      const rect = fab?.getBoundingClientRect();
      widthByKey[slotId] = rect?.width ? Math.max(rect.width, 1) : c.button_size;
    }

    const plan = this._cornerSlotPlan();
    if (!plan) return;

    const gapX = c.gap;
    const gapY = c.vertical_gap;
    const stepY = c.button_size + gapY;
    const isRight = c.position === "bottom-right";

    const baseW = widthByKey[plan.baseKey] ?? c.button_size;
    const cols = Math.max(1, c.horizontal.columns);
    const hColW = new Array(cols).fill(c.button_size);

    for (const s of plan.slots) {
      if (s.area !== "h") continue;
      const w = widthByKey[s.key] ?? c.button_size;
      const colIdx = s.col - 1;
      if (colIdx >= 0 && colIdx < cols) hColW[colIdx] = Math.max(hColW[colIdx], w);
    }

    const hSpan = baseW + (gapX * cols) + hColW.reduce((a, b) => a + b, 0);

    const vWrapCols = plan.vWrapCols || 0;
    const vWrapW = new Array(vWrapCols).fill(c.button_size);
    for (const s of plan.slots) {
      if (s.area !== "v") continue;
      const w = widthByKey[s.key] ?? c.button_size;
      const wc = s.wrapCol;
      if (wc >= 0 && wc < vWrapCols) vWrapW[wc] = Math.max(vWrapW[wc], w);
    }

    const hPrefix = new Array(cols).fill(0);
    for (let i = 1; i < cols; i++) hPrefix[i] = hPrefix[i - 1] + hColW[i - 1] + gapX;

    const vPrefix = new Array(vWrapCols).fill(0);
    for (let i = 1; i < vWrapCols; i++) vPrefix[i] = vPrefix[i - 1] + vWrapW[i - 1] + gapX;

    const positions = {};
    positions[plan.baseKey] = isRight ? { x: -baseW, y: 0 } : { x: 0, y: 0 };

    for (const s of plan.slots) {
      if (s.area !== "h") continue;
      const w = widthByKey[s.key] ?? c.button_size;
      const colIdx = s.col - 1;
      const y = -s.row * stepY;

      if (isRight) {
        const rightEdge = -(baseW + gapX + (hPrefix[colIdx] || 0));
        positions[s.key] = { x: rightEdge - w, y };
      } else {
        const leftEdge = baseW + gapX + (hPrefix[colIdx] || 0);
        positions[s.key] = { x: leftEdge, y };
      }
    }

    for (const s of plan.slots) {
      if (s.area !== "v") continue;
      const w = widthByKey[s.key] ?? c.button_size;
      const y = -s.row * stepY;

      if (isRight) {
        if (s.wrapCol === 0) {
          positions[s.key] = { x: -w, y };
        } else {
          const rightEdge = -(hSpan + gapX + (vPrefix[s.wrapCol] || 0));
          positions[s.key] = { x: rightEdge - w, y };
        }
      } else {
        if (s.wrapCol === 0) {
          positions[s.key] = { x: 0, y };
        } else {
          const leftEdge = hSpan + gapX + (vPrefix[s.wrapCol] || 0);
          positions[s.key] = { x: leftEdge, y };
        }
      }
    }

    this._layout = { ready: true, slots: positions, meta: { baseW, hSpan, isRight } };
    this.requestUpdate();
  }

  _cornerSlotPlan() {
    const c = this._config;
    if (!c || c.position === "bottom-center") return null;

    const baseBtn = c.base?.button;
    const baseKey = baseBtn ? `base:${baseBtn.id}` : null;

    const horizontalVisible = this._isGroupVisible("horizontal");
    const verticalVisible = this._isGroupVisible("vertical");

    const hButtons = horizontalVisible ? (c.horizontal.buttons || []).filter((b) => this._isButtonVisible(b)) : [];
    const vButtons = verticalVisible ? (c.vertical.buttons || []).filter((b) => this._isButtonVisible(b)) : [];

    const slots = [];
    const cols = Math.max(1, c.horizontal.columns);
    const rows = Math.max(1, c.vertical.rows);

    for (let i = 0; i < hButtons.length; i++) {
      const row = Math.floor(i / cols);
      const col = 1 + (i % cols);
      slots.push({ area: "h", key: `h:${hButtons[i].id}`, row, col });
    }

    let vWrapCols = 0;
    for (let j = 0; j < vButtons.length; j++) {
      const r = 1 + (j % rows);
      const wrapCol = Math.floor(j / rows);
      vWrapCols = Math.max(vWrapCols, wrapCol + 1);
      slots.push({ area: "v", key: `v:${vButtons[j].id}`, row: r, wrapCol });
    }

    return { baseKey, slots, vWrapCols };
  }

  /* -------------------------- Actions -------------------------- */

  _handleAction(btn, which) {
    const hass = this.hass;
    if (!hass) return;

    const action = btn?.[which] || btn?.tap_action || { action: "none" };
    const type = action?.action || "none";
    if (type === "none") return;

    if (type === "toggle-group") {
      this._toggleGroup(action.target || "vertical", action.mode || "toggle");
      return;
    }

    if (type === "back") {
      history.back();
      setTimeout(() => fireEvent(window, "location-changed", {}), 0);
      this._autoCloseTempMenus();
      return;
    }

    if (type === "navigate") {
      history.pushState(null, "", action.navigation_path || "/");
      fireEvent(window, "location-changed", {});
      this._autoCloseTempMenus();
      return;
    }

    if (type === "url") {
      const url = action.url_path;
      if (url) {
        window.open(url, action.new_tab === false ? "_self" : "_blank", "noreferrer");
        this._autoCloseTempMenus();
      }
      return;
    }

    if (type === "toggle") {
      if (btn?.entity) {
        hass.callService("homeassistant", "toggle", { entity_id: btn.entity });
        this._autoCloseTempMenus();
      }
      return;
    }

    if (type === "more-info") {
      if (btn?.entity) {
        fireEvent(this, "hass-more-info", { entityId: btn.entity });
        this._autoCloseTempMenus();
      }
      return;
    }

    if (type === "call-service") {
      const svc = action.service;
      if (!svc || !svc.includes(".")) return;
      const [domain, service] = svc.split(".", 2);

      let data = {};
      try {
        const raw = safeString(action.service_data || "");
        data = raw.trim() ? parseYamlLite(raw) : {};
      } catch (err) {
        console.warn("[HKI Navigation Card] Service data YAML parse failed:", err);
        data = {};
      }

      const targetEntity = safeString(action.target_entity || "").trim();
      if (targetEntity) data = { ...data, entity_id: targetEntity };

      hass.callService(domain, service, data);
      this._autoCloseTempMenus();
      return;
    }

    this._autoCloseTempMenus();
  }

  _onPointerDown(e, btn) {
    e.stopPropagation();
    if (e.button === 2) return;

    const key = `${btn.id}:${e.pointerId}`;
    const t = setTimeout(() => {
      this._holdTimers.delete(key);
      this._handleAction(btn, "hold_action");
    }, 520);
    this._holdTimers.set(key, t);
  }

  _onPointerUp(e, btn) {
    e.stopPropagation();
    if (e.button === 2) return;

    const key = `${btn.id}:${e.pointerId}`;
    const holdTimer = this._holdTimers.get(key);
    if (holdTimer) {
      clearTimeout(holdTimer);
      this._holdTimers.delete(key);
    } else {
      return;
    }

    const now = Date.now();
    const dblWindow = 280;

    if (this._tapState.lastId === btn.id && (now - this._tapState.lastTime) < dblWindow) {
      if (this._tapState.singleTimer) clearTimeout(this._tapState.singleTimer);
      this._tapState = { lastId: null, lastTime: 0, singleTimer: null };
      this._handleAction(btn, "double_tap_action");
      return;
    }

    if (this._tapState.singleTimer) clearTimeout(this._tapState.singleTimer);

    this._tapState.lastId = btn.id;
    this._tapState.lastTime = now;
    this._tapState.singleTimer = setTimeout(() => {
      this._tapState = { lastId: null, lastTime: 0, singleTimer: null };
      this._handleAction(btn, "tap_action");
    }, dblWindow);
  }

  _onPointerCancel(e, btn) {
    const key = `${btn.id}:${e.pointerId}`;
    const holdTimer = this._holdTimers.get(key);
    if (holdTimer) clearTimeout(holdTimer);
    this._holdTimers.delete(key);
  }

  _onContextMenu(e, btn) {
    e.preventDefault();
    e.stopPropagation();
    this._handleAction(btn, "hold_action");
  }

  /* -------------------------- Render helpers -------------------------- */

  _isPillType(type) {
    return type === "pill" || type === "pill_label";
  }

  _renderButton(btn) {
    const type = this._getButtonType(btn);
    const labelText = this._getLabelText(btn);
    const hasLabel = !!labelText;
    const isPill = this._isPillType(type);

    const showIcon = type === "icon" || type === "icon_label_below" || type === "icon_label_left" || type === "icon_label_right" || type === "pill";
    const showBubbleBelow = type === "icon_label_below" && hasLabel;
    const showBubbleLeft = type === "icon_label_left" && hasLabel;
    const showBubbleRight = type === "icon_label_right" && hasLabel;
    const showPillText = isPill && hasLabel;

    const bg = this._buttonBg(btn);
    const iconColor = this._buttonIconColor(btn);
    const isBackTap = btn?.tap_action?.action === "back";
    const icon = isBackTap ? "mdi:chevron-left" : (btn.icon?.trim() || "mdi:circle");

    const pillWidth = isPill ? this._getPillWidth(btn) : 0;
    const pillFixed = isPill && pillWidth > 0;

    const btnStyleParts = [`background:${bg}`, `color:${iconColor}`];
    if (pillFixed) btnStyleParts.push(`width:${pillWidth}px`);

    if (typeof btn.box_shadow === "string" && btn.box_shadow.trim()) {
      btnStyleParts.push(`--hki-button-shadow:${btn.box_shadow.trim()}`);
    }
    if (typeof btn.box_shadow_hover === "string" && btn.box_shadow_hover.trim()) {
      btnStyleParts.push(`--hki-button-shadow-hover:${btn.box_shadow_hover.trim()}`);
    }

    const floatGap = 10;
    const floatSide = showBubbleLeft ? "left" : (showBubbleRight ? "right" : null);

    return html`
      <div class="item ${showBubbleBelow ? "item-v" : "item-float"}">
        <div class="float-wrap">
          <button
            class="fab ${isPill ? "fab-pill" : ""} ${pillFixed ? "pill-fixed" : ""}"
            title="${btn.tooltip || ""}"
            aria-label="${btn.tooltip || btn.label || icon || "button"}"
            style="${btnStyleParts.join(";")}"
            @pointerdown=${(e) => this._onPointerDown(e, btn)}
            @pointerup=${(e) => this._onPointerUp(e, btn)}
            @pointercancel=${(e) => this._onPointerCancel(e, btn)}
            @contextmenu=${(e) => this._onContextMenu(e, btn)}
          >
            ${showIcon ? html`<ha-icon class="fab-icon" .icon=${icon}></ha-icon>` : html``}
            ${showPillText ? html`<span class="pill-text" style="${this._pillTextStyle(btn)}">${labelText}</span>` : html``}
          </button>

          ${floatSide === "left" ? html`<div class="label label-float" style="${this._labelBubbleStyle(btn)}; right: calc(100% + ${floatGap}px); top: 50%; transform: translateY(-50%);">${labelText}</div>` : html``}
          ${floatSide === "right" ? html`<div class="label label-float" style="${this._labelBubbleStyle(btn)}; left: calc(100% + ${floatGap}px); top: 50%; transform: translateY(-50%);">${labelText}</div>` : html``}
        </div>

        ${showBubbleBelow ? html`<div class="label" style="${this._labelBubbleStyle(btn)}">${labelText}</div>` : html``}
      </div>
    `;
  }

  render() {
    if (!this._config) return html``;
    const c = this._config;

    const editMode = this._isEditMode();
    const offsetX = this._computeOffsetX();
    const offsetY = c.offset_y;

    const anchorStyle = (() => {
      if (c.position === "bottom-center") {
        if (c.center_spread) return `left:0px; right:0px; bottom:${offsetY}px;`;

        const lm = this._contentLeftMargin || 0;
        const rm = this._contentRightMargin || 0;
        const shift = (lm - rm) / 2;
        if (Math.abs(shift) > 0.5) {
          return `left:calc(50% + ${shift}px); transform:translateX(-50%); bottom:${offsetY}px;`;
        }
        return `left:50%; transform:translateX(-50%); bottom:${offsetY}px;`;
      }
      if (c.position === "bottom-left") {
        const lm = this._contentLeftMargin || 0;
        return `left:${offsetX + lm}px; bottom:${offsetY}px;`;
      }
      const rm = this._contentRightMargin || 0;
      return `right:${offsetX + rm}px; bottom:${offsetY}px;`;
    })();

    const shadowVars = [];
    if (typeof c.button_box_shadow === "string" && c.button_box_shadow.trim()) {
      shadowVars.push(`--hki-button-shadow:${c.button_box_shadow.trim()}`);
    }
    if (typeof c.button_box_shadow_hover === "string" && c.button_box_shadow_hover.trim()) {
      shadowVars.push(`--hki-button-shadow-hover:${c.button_box_shadow_hover.trim()}`);
    }
    const shadowVarStyle = shadowVars.length ? `; ${shadowVars.join(";")}` : "";

    const base = c.base?.button;

    const placeholder = editMode
      ? html`
          <ha-card class="edit-placeholder">
            <div class="edit-placeholder-inner">
              <ha-icon icon="mdi:gesture-tap-button"></ha-icon>
              <div class="edit-placeholder-text">
                <div class="t1">HKI Navigation Card</div>
                <div class="t2">Fixed-position buttons • This placeholder makes the card easy to select in edit mode</div>
              </div>
            </div>
          </ha-card>
        `
      : html``;

    if (c.position === "bottom-center") {
      const horizontalVisible = this._isGroupVisible("horizontal");
      const hButtons = horizontalVisible ? (c.horizontal.buttons || []).filter((b) => this._isButtonVisible(b)) : [];

      const all = [base, ...hButtons];
      const cols = Math.max(1, clampInt(c.horizontal.columns, DEFAULTS.horizontal.columns, 1));
      const rows = [];
      for (let i = 0; i < all.length; i += cols) rows.push(all.slice(i, i + cols));

      const justify = c.center_spread ? "space-between" : "center";
      const padLeft = c.center_spread ? `${(this._contentLeftMargin || 0) + offsetX}px` : "0px";
      const padRight = c.center_spread ? `${(this._contentRightMargin || 0) + offsetX}px` : "0px";

      return html`
        ${placeholder}
        ${this._renderBottomBar()}
        <div class="fab-anchor" style="${anchorStyle} z-index:${c.z_index}; --hki-size:${c.button_size}px; --hki-gap:${c.gap}px${shadowVarStyle};">
          <div class="center-stack ${c.center_spread ? "spread" : ""}" style="padding:0 ${padRight} 0 ${padLeft}; gap:${c.vertical_gap}px;">
            ${rows.map((row) => html`
              <div class="center-row" style="justify-content:${justify};">
                ${row.map((btn) => this._renderButton(btn))}
              </div>
            `)}
          </div>
        </div>
      `;
    }

    const horizontalVisible = this._isGroupVisible("horizontal");
    const verticalVisible = this._isGroupVisible("vertical");

    const hButtons = horizontalVisible ? (c.horizontal.buttons || []).filter((b) => this._isButtonVisible(b)) : [];
    const vButtons = verticalVisible ? (c.vertical.buttons || []).filter((b) => this._isButtonVisible(b)) : [];

    const slots = [{ key: `base:${base.id}`, btn: base }];
    for (let i = 0; i < hButtons.length; i++) slots.push({ key: `h:${hButtons[i].id}`, btn: hButtons[i] });
    for (let j = 0; j < vButtons.length; j++) slots.push({ key: `v:${vButtons[j].id}`, btn: vButtons[j] });

    return html`
      ${placeholder}
      ${this._renderBottomBar()}
      <div class="fab-anchor" style="${anchorStyle} z-index:${c.z_index}; --hki-size:${c.button_size}px; --hki-gap:${c.gap}px${shadowVarStyle};">
        <div class="abs-grid">
          ${slots.map((s) => {
            const pos = this._layout?.slots?.[s.key];
            const tx = pos ? pos.x : 0;
            const ty = pos ? pos.y : 0;
            return html`
              <div class="abs-slot" data-slot-id="${s.key}" style="transform: translate(${tx}px, ${ty}px);">
                ${this._renderButton(s.btn)}
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        overflow: visible;
      }

      .edit-placeholder {
        border-radius: 14px;
        border: 2px dashed rgba(160, 160, 160, 0.35);
        background: rgba(0,0,0,0.02);
      }
      .edit-placeholder-inner{
        display:flex;
        align-items:center;
        gap:12px;
        padding:12px;
      }
      .edit-placeholder-text{ min-width:0; }
      .t1{ font-weight:800; }
      .t2{ opacity:0.7; font-size:12px; }

      .fab-anchor {
        position: fixed;
        pointer-events: none;
      }

      .bottom-bar {
        position: fixed;
        bottom: 0;
        pointer-events: none;
      }

      .abs-grid,
      .abs-slot,
      .item,
      .label {
        pointer-events: none;
      }

      .abs-grid {
        position: relative;
        width: 0;
        height: 0;
        overflow: visible;
      }

      .abs-slot {
        position: absolute;
        left: 0;
        bottom: 0;
        will-change: transform;
      }

      .center-stack {
        pointer-events: none;
        display: flex;
        flex-direction: column-reverse;
        align-items: stretch;
      }

      .center-row {
        pointer-events: none;
        display: flex;
        align-items: center;
        gap: var(--hki-gap);
        width: fit-content;
        margin: 0 auto;
      }

      .center-stack.spread .center-row {
        width: 100%;
        margin: 0;
      }

      .item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }

      .item-float .float-wrap {
        pointer-events: none;
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .item-v {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }

      .fab {
        pointer-events: auto;
        width: var(--hki-size);
        height: var(--hki-size);
        border-radius: 999px;
        border: none;
        outline: none;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: relative;
        box-shadow: var(--hki-button-shadow, 0 8px 24px rgba(0, 0, 0, 0.35));
        transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
        filter: saturate(1.05);
        touch-action: manipulation;
      }

      .fab:hover {
        transform: translateY(-1px);
        box-shadow: var(--hki-button-shadow-hover, 0 10px 30px rgba(0, 0, 0, 0.42));
      }

      .fab:active {
        transform: translateY(0px) scale(0.98);
      }

      .fab-icon {
        --mdc-icon-size: calc(var(--hki-size) * 0.48);
        width: var(--mdc-icon-size);
        height: var(--mdc-icon-size);
      }

      .fab-pill {
        width: auto;
        min-width: max(var(--hki-size), ${MIN_PILL_WIDTH}px);
        padding: 0 calc(var(--hki-size) * 0.32);
        gap: calc(var(--hki-size) * 0.14);
        justify-content: center;
        border-radius: 999px;
      }

      .pill-fixed {
        padding: 0 calc(var(--hki-size) * 0.24);
        min-width: ${MIN_PILL_WIDTH}px;
      }

      .pill-text {
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 260px;
      }

      .label {
        pointer-events: none;
        line-height: 1.1;
        border-radius: 999px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .label-float {
        position: absolute;
      }
    `;
  }
}

/* -------------------------- Editor -------------------------- */

class HkiNavigationCardEditor extends LitElement {
  static get properties() {
    return {
      hass: {},
      _config: { state: true },
      _expanded: { state: true },
      _yamlErrors: { state: true },
    };
  }

  constructor() {
    super();
    this._expanded = {};
    this._yamlErrors = {};
  }

  setConfig(config) {
    this._config = normalizeConfig(config);
  }

  get _c() {
    return this._config || normalizeConfig({});
  }

  _emit(cfg) {
    this._config = cfg;
    fireEvent(this, "config-changed", { config: cfg });
  }

  _applyGlobalAndClearOverrides(keyPath, mutateFn) {
    const cfg = deepClone(this._c);
    mutateFn(cfg);

    const clearOnBtn = (btn) => {
      const b = { ...btn };

      if (keyPath.startsWith("label_style.")) {
        const k = keyPath.split(".")[1];
        const ls = { ...(b.label_style || {}) };
        delete ls[k];
        b.label_style = ls;
        return b;
      }
      if (keyPath === "pill_width") { b.pill_width = ""; return b; }
      if (keyPath === "background") { b.background = ""; return b; }
      if (keyPath === "background_opacity") { b.background_opacity = ""; return b; }
      if (keyPath === "icon_color") { b.icon_color = ""; return b; }

      return b;
    };

    cfg.horizontal.buttons = (cfg.horizontal.buttons || []).map(clearOnBtn);
    cfg.vertical.buttons = (cfg.vertical.buttons || []).map(clearOnBtn);
    cfg.base.button = clearOnBtn(cfg.base.button);

    this._emit(cfg);
  }

  _setValue(key, value) {
    const cfg = deepClone(this._c);
    cfg[key] = value;
    this._emit(cfg);
  }

  _setBool(path, value) {
    const cfg = deepClone(this._c);
    const parts = path.split(".");
    let obj = cfg;
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
    obj[parts[parts.length - 1]] = !!value;
    this._emit(cfg);
  }

  _setLabelStyleGlobal(key, value) {
    this._applyGlobalAndClearOverrides(`label_style.${key}`, (cfg) => {
      cfg.label_style = cfg.label_style || {};
      cfg.label_style[key] = value;
    });
  }

  _setDefaultBackground(value) {
    this._applyGlobalAndClearOverrides("background", (cfg) => {
      cfg.default_background = value;
    });
  }

  _setDefaultIconColor(value) {
    this._applyGlobalAndClearOverrides("icon_color", (cfg) => {
      cfg.default_icon_color = value;
    });
  }

  _setDefaultButtonOpacity(value) {
    this._applyGlobalAndClearOverrides("background_opacity", (cfg) => {
      cfg.default_button_opacity = Math.max(0, Math.min(1, Number(value)));
    });
  }

  _setGlobalPillWidth(value) {
    this._applyGlobalAndClearOverrides("pill_width", (cfg) => {
      const n = Number(value);
      cfg.pill_width = n <= 0 ? 0 : Math.max(MIN_PILL_WIDTH, n);
    });
  }

  _listKey(group) {
    return group === "vertical" ? "vertical" : "horizontal";
  }

  _getButtons(group) {
    return this._c[this._listKey(group)]?.buttons || [];
  }

  _setButtons(group, nextButtons) {
    const cfg = deepClone(this._c);
    cfg[this._listKey(group)].buttons = nextButtons;
    this._emit(cfg);
  }

  _setButtonById(group, btnId, patch) {
    const buttons = [...this._getButtons(group)];
    const idx = buttons.findIndex((b) => b?.id === btnId);
    if (idx < 0) return;
    buttons[idx] = { ...(buttons[idx] || {}), ...patch };
    this._setButtons(group, buttons);
  }

  _removeButtonById(group, btnId) {
    const buttons = this._getButtons(group).filter((b) => b?.id !== btnId);
    delete this._expanded[`${group}:${btnId}`];
    this._setButtons(group, buttons);
  }

  _moveButtonById(group, btnId, dir) {
    const buttons = [...this._getButtons(group)];
    const i = buttons.findIndex((b) => b?.id === btnId);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= buttons.length) return;
    [buttons[i], buttons[j]] = [buttons[j], buttons[i]];
    this._setButtons(group, buttons);
  }

  _addButton(group) {
    const buttons = [...this._getButtons(group)];
    buttons.push(DEFAULT_BUTTON());
    this._setButtons(group, buttons);
  }

  _renderEntityPicker(label, value, onChange) {
    if (customElements.get("ha-selector")) {
      return html`
        <ha-selector
          .hass=${this.hass}
          .label=${label}
          .selector=${{ entity: {} }}
          .value=${value || ""}
          @value-changed=${(e) => onChange(e.detail?.value ?? "")}
        ></ha-selector>
      `;
    }

    if (customElements.get("ha-entity-picker")) {
      return html`
        <ha-entity-picker
          .hass=${this.hass}
          .label=${label}
          .value=${value || ""}
          allow-custom-entity
          @value-changed=${(e) => onChange(e.detail?.value ?? "")}
        ></ha-entity-picker>
      `;
    }

    return html`
      <ha-textfield
        .label=${label}
        .value=${value || ""}
        placeholder="light.kitchen"
        @change=${(e) => onChange(e.target.value)}
      ></ha-textfield>
    `;
  }

  _renderNavigationPathPicker(label, value, onChange) {
    const val = value || "";

    if (customElements.get("ha-navigation-picker")) {
      return html`
        <ha-navigation-picker
          .hass=${this.hass}
          .label=${label}
          .value=${val}
          @value-changed=${(e) => onChange(e.detail?.value ?? "")}
        ></ha-navigation-picker>
      `;
    }

    if (customElements.get("ha-selector")) {
      return html`
        <ha-selector
          .hass=${this.hass}
          .label=${label}
          .selector=${{ navigation: {} }}
          .value=${val}
          @value-changed=${(e) => onChange(e.detail?.value ?? "")}
        ></ha-selector>
      `;
    }

    return html`
      <ha-textfield
        .label=${label}
        .value=${val}
        placeholder="/lovelace/0"
        @change=${(e) => onChange(e.target.value)}
      ></ha-textfield>
    `;
  }

  _renderCodeEditor(label, value, onChange, errorKey) {
    const showError = !!this._yamlErrors[errorKey];

    const validate = (v) => {
      const t = safeString(v);
      if (!t.trim()) {
        delete this._yamlErrors[errorKey];
        this.requestUpdate();
        return;
      }
      try {
        parseYamlLite(t);
        delete this._yamlErrors[errorKey];
      } catch (e) {
        this._yamlErrors[errorKey] = safeString(e?.message || e);
      }
      this.requestUpdate();
    };

    if (customElements.get("ha-yaml-editor")) {
      return html`
        <div class="code-wrap">
          <div class="code-label">${label}</div>
          <ha-yaml-editor
            .hass=${this.hass}
            .value=${value || ""}
            @value-changed=${(e) => {
              const v = e.detail?.value ?? "";
              onChange(v);
              validate(v);
            }}
          ></ha-yaml-editor>
          ${showError ? html`<ha-alert alert-type="error">YAML error: ${this._yamlErrors[errorKey]}</ha-alert>` : html``}
        </div>
      `;
    }

    if (customElements.get("ha-code-editor")) {
      return html`
        <div class="code-wrap">
          <div class="code-label">${label}</div>
          <ha-code-editor
            .hass=${this.hass}
            .mode=${"yaml"}
            .value=${value || ""}
            @value-changed=${(e) => {
              const v = e.detail?.value ?? "";
              onChange(v);
              validate(v);
            }}
          ></ha-code-editor>
          ${showError ? html`<ha-alert alert-type="error">YAML error: ${this._yamlErrors[errorKey]}</ha-alert>` : html``}
        </div>
      `;
    }

    return html`
      <ha-textarea
        .label=${label}
        .value=${value || ""}
        @change=${(e) => {
          const v = e.target.value;
          onChange(v);
          validate(v);
        }}
      ></ha-textarea>
      ${showError ? html`<ha-alert alert-type="error">YAML error: ${this._yamlErrors[errorKey]}</ha-alert>` : html``}
    `;
  }

  _renderActionEditor(btn, setBtnFn, which, title, errorKeyPrefix) {
    const act = btn?.[which] || { action: "none" };
    const type = act.action || "none";
    const errorKey = `${errorKeyPrefix}:${which}`;

    const update = (patch) => {
      const current = btn?.[which] || { action: "none" };
      const next = { ...btn, [which]: { ...current, ...patch } };

      if (which === "tap_action" && patch.action === "back") {
        next.icon = "mdi:chevron-left";
      }

      setBtnFn(next);
    };

    return html`
      <div class="subsection">
        <div class="subheader">${title}</div>

        <ha-select
          .label=${"Action type"}
          .value=${type}
          @selected=${(e) => update({ action: e.target.value })}
          @closed=${(e) => e.stopPropagation()}
        >
          ${ACTIONS.map((a) => html`<mwc-list-item .value=${a.value}>${a.label}</mwc-list-item>`)}
        </ha-select>

        ${type === "navigate"
          ? html`${this._renderNavigationPathPicker("Navigation path", act.navigation_path || "", (v) => update({ navigation_path: v }))}`
          : html``}

        ${type === "url"
          ? html`
              <ha-textfield
                .label=${"URL"}
                .value=${act.url_path || ""}
                placeholder="https://example.com"
                @change=${(e) => update({ url_path: e.target.value })}
              ></ha-textfield>
              <ha-formfield .label=${"Open in new tab"}>
                <ha-switch
                  .checked=${act.new_tab !== false}
                  @change=${(e) => update({ new_tab: e.target.checked })}
                ></ha-switch>
              </ha-formfield>
            `
          : html``}

        ${type === "toggle-group"
          ? html`
              <div class="grid2">
                <ha-select
                  .label=${"Target group"}
                  .value=${act.target || "vertical"}
                  @selected=${(e) => update({ target: e.target.value })}
                  @closed=${(e) => e.stopPropagation()}
                >
                  ${GROUP_TARGETS.map((g) => html`<mwc-list-item .value=${g.value}>${g.label}</mwc-list-item>`)}
                </ha-select>

                <ha-select
                  .label=${"Mode"}
                  .value=${act.mode || "toggle"}
                  @selected=${(e) => update({ mode: e.target.value })}
                  @closed=${(e) => e.stopPropagation()}
                >
                  ${GROUP_ACTIONS.map((m) => html`<mwc-list-item .value=${m.value}>${m.label}</mwc-list-item>`)}
                </ha-select>
              </div>
              <div class="hint">
                Tip: Disable a group below, then use this action to open it temporarily.
                It auto-closes after pressing any other button.
              </div>
            `
          : html``}

        ${type === "call-service"
          ? html`
              <ha-textfield
                .label=${"Service (domain.service)"}
                .value=${act.service || ""}
                placeholder="light.turn_on"
                @change=${(e) => update({ service: e.target.value })}
              ></ha-textfield>

              ${this._renderEntityPicker("Target entity (optional)", act.target_entity || "", (ent) => {
                update({ target_entity: ent });
              })}

              ${this._renderCodeEditor("Service data (YAML)", act.service_data || "", (v) => {
                update({ service_data: v });
              }, errorKey)}
            `
          : html``}

        ${type === "toggle" || type === "more-info"
          ? html`<div class="hint">Uses the button's <b>Entity</b> field.</div>`
          : html``}

        ${type === "back"
          ? html`<div class="hint">Back uses browser history. (Tap action forces icon to mdi:chevron-left.)</div>`
          : html``}
      </div>
    `;
  }

  _renderConditions(btn, setBtnFn) {
    const conditions = Array.isArray(btn.conditions) ? btn.conditions : [];
    const mode = btn.conditions_mode === "any" ? "any" : "all";

    const add = () => {
      const next = {
        ...btn,
        conditions: [
          ...conditions,
          { id: _uid(), type: "entity", entity: "", attribute: "", operator: "equals", value: "", invert: false },
        ],
      };
      setBtnFn(next);
    };

    const setCond = (id, patch) => {
      const nextConds = conditions.map((c) => (c.id === id ? { ...c, ...patch } : c));
      setBtnFn({ ...btn, conditions: nextConds });
    };

    const remove = (id) => {
      setBtnFn({ ...btn, conditions: conditions.filter((c) => c.id !== id) });
    };

    const parseCsv = (s) =>
      safeString(s).split(",").map((x) => x.trim()).filter(Boolean);

    const csvString = (arr) => Array.isArray(arr) ? arr.join(", ") : "";

    return html`
      <div class="subsection">
        <div class="subheader row">
          <span>Visibility</span>
          <mwc-button outlined @click=${add}>
            <ha-icon icon="mdi:plus"></ha-icon>&nbsp;Add condition
          </mwc-button>
        </div>

        <ha-select
          .label=${"Condition mode"}
          .value=${mode}
          @selected=${(e) => setBtnFn({ ...btn, conditions_mode: e.target.value })}
          @closed=${(e) => e.stopPropagation()}
        >
          <mwc-list-item value="all">All conditions (AND)</mwc-list-item>
          <mwc-list-item value="any">Any condition (OR)</mwc-list-item>
        </ha-select>

        ${conditions.length === 0
          ? html`<div class="hint">No conditions → button is always visible.</div>`
          : html``}

        ${conditions.map((cond) => {
          const type = cond.type || "entity";
          const title =
            type === "entity" ? (cond.entity || "(entity)") :
            type === "user" ? "User" :
            type === "view" ? "View" :
            "Screen";

          return html`
            <div class="cond">
              <div class="cond-head">
                <div class="cond-title">${title}${cond.invert ? " • inverted" : ""}</div>
                <mwc-icon-button title="Remove" @click=${() => remove(cond.id)}>
                  <ha-icon icon="mdi:trash-can-outline"></ha-icon>
                </mwc-icon-button>
              </div>

              <div class="grid2">
                <ha-select
                  .label=${"Condition type"}
                  .value=${type}
                  @selected=${(e) => setCond(cond.id, { type: e.target.value })}
                  @closed=${(e) => e.stopPropagation()}
                >
                  ${CONDITION_TYPES.map((t) => html`<mwc-list-item .value=${t.value}>${t.label}</mwc-list-item>`)}
                </ha-select>

                <ha-formfield .label=${"Invert result"}>
                  <ha-switch
                    .checked=${!!cond.invert}
                    @change=${(e) => setCond(cond.id, { invert: e.target.checked })}
                  ></ha-switch>
                </ha-formfield>
              </div>

              ${type === "entity"
                ? html`
                    <div class="grid2">
                      ${this._renderEntityPicker("Entity", cond.entity || "", (v) => setCond(cond.id, { entity: v }))}

                      <ha-textfield
                        .label=${"Attribute (optional)"}
                        .value=${cond.attribute || ""}
                        placeholder="brightness"
                        @change=${(e) => setCond(cond.id, { attribute: e.target.value })}
                      ></ha-textfield>

                      <ha-select
                        .label=${"Operator"}
                        .value=${cond.operator || "equals"}
                        @selected=${(e) => setCond(cond.id, { operator: e.target.value })}
                        @closed=${(e) => e.stopPropagation()}
                      >
                        ${ENTITY_OPERATORS.map((o) => html`<mwc-list-item .value=${o.value}>${o.label}</mwc-list-item>`)}
                      </ha-select>

                      ${(cond.operator === "exists" || cond.operator === "not_exists")
                        ? html`<div></div>`
                        : html`
                            <ha-textfield
                              .label=${"Value"}
                              .value=${cond.value ?? ""}
                              placeholder="on"
                              @change=${(e) => setCond(cond.id, { value: e.target.value })}
                            ></ha-textfield>
                          `}
                    </div>
                  `
                : html``}

              ${type === "user"
                ? html`
                    <ha-textfield
                      .label=${"Users (comma-separated names)"}
                      .value=${csvString(cond.users)}
                      placeholder="Jimmy Schings, Alex"
                      @change=${(e) => setCond(cond.id, { users: parseCsv(e.target.value) })}
                    ></ha-textfield>
                  `
                : html``}

              ${type === "view"
                ? html`
                    <ha-textfield
                      .label=${"Views (comma-separated paths)"}
                      .value=${csvString(cond.views)}
                      placeholder="/lovelace/0, /lovelace/home"
                      @change=${(e) => setCond(cond.id, { views: parseCsv(e.target.value) })}
                    ></ha-textfield>
                  `
                : html``}

              ${type === "screen"
                ? html`
                    <ha-select
                      .label=${"Screen mode"}
                      .value=${cond.mode || "mobile"}
                      @selected=${(e) => setCond(cond.id, { mode: e.target.value })}
                      @closed=${(e) => e.stopPropagation()}
                    >
                      <mwc-list-item value="mobile">Mobile</mwc-list-item>
                      <mwc-list-item value="desktop">Desktop</mwc-list-item>
                    </ha-select>
                  `
                : html``}
            </div>
          `;
        })}
      </div>
    `;
  }

  _renderButtonPanel(btn, setBtnFn, errorKeyPrefix, allowConditions = true) {
    const hasIconPicker = !!customElements.get("ha-icon-picker");
    const effectiveType = (() => {
      const v = safeString(btn.button_type).trim();
      return v && BUTTON_TYPE_VALUES.has(v) ? v : INHERIT;
    })();

    const pillTypeSelected = effectiveType === "pill" || effectiveType === "pill_label";

    return html`
      ${hasIconPicker
        ? html`
            <ha-icon-picker
              .label=${"Icon"}
              .value=${btn.icon || ""}
              @value-changed=${(e) => setBtnFn({ ...btn, icon: e.detail.value })}
            ></ha-icon-picker>
          `
        : html`
            <ha-textfield
              .label=${"Icon (mdi:...)"}
              .value=${btn.icon || ""}
              placeholder="mdi:home"
              @change=${(e) => setBtnFn({ ...btn, icon: e.target.value })}
            ></ha-textfield>
          `}

      <div class="grid2">
        <ha-select
          .label=${"Button Type"}
          .value=${effectiveType}
          @selected=${(e) => {
            const v = e.target.value;
            setBtnFn({ ...btn, button_type: v === INHERIT ? "" : v });
          }}
          @closed=${(e) => e.stopPropagation()}
        >
          <mwc-list-item .value=${INHERIT}>(inherit default)</mwc-list-item>
          ${BUTTON_TYPES.map((t) => html`<mwc-list-item .value=${t.value}>${t.label}</mwc-list-item>`)}
        </ha-select>

        <ha-textfield
          .label=${"Label (optional)"}
          .value=${btn.label || ""}
          @change=${(e) => setBtnFn({ ...btn, label: e.target.value })}
        ></ha-textfield>

        <ha-textfield
          .label=${"Tooltip (optional)"}
          .value=${btn.tooltip || ""}
          @change=${(e) => setBtnFn({ ...btn, tooltip: e.target.value })}
        ></ha-textfield>

        ${this._renderEntityPicker("Entity (optional)", btn.entity || "", (v) => setBtnFn({ ...btn, entity: v }))}

        <ha-textfield
          .label=${"Background (optional override)"}
          .value=${btn.background || ""}
          placeholder="(blank = theme accent/primary)"
          @change=${(e) => setBtnFn({ ...btn, background: e.target.value })}
        ></ha-textfield>

        <ha-textfield
          type="number"
          step="0.01"
          min="0"
          max="1"
          .label=${"Button background opacity override (0..1) — blank = inherit"}
          .value=${btn.background_opacity ?? ""}
          @change=${(e) => setBtnFn({ ...btn, background_opacity: e.target.value })}
        ></ha-textfield>

        <ha-textfield
          .label=${"Icon color (optional override)"}
          .value=${btn.icon_color || ""}
          placeholder="(blank = theme text color)"
          @change=${(e) => setBtnFn({ ...btn, icon_color: e.target.value })}
        ></ha-textfield>
      </div>

      <div class="grid2">
        <ha-textfield
          .label=${"Box-shadow (optional override)"}
          .value=${btn.box_shadow || ""}
          placeholder="(blank = global/default)"
          @change=${(e) => setBtnFn({ ...btn, box_shadow: e.target.value })}
        ></ha-textfield>

        <ha-textfield
          .label=${"Box-shadow hover (optional override)"}
          .value=${btn.box_shadow_hover || ""}
          placeholder="(blank = global/default)"
          @change=${(e) => setBtnFn({ ...btn, box_shadow_hover: e.target.value })}
        ></ha-textfield>
      </div>

      ${pillTypeSelected
        ? html`
            <div class="grid2">
              <ha-textfield
                type="number"
                .label=${`Pill width override (px) — blank = inherit global / auto (min ${MIN_PILL_WIDTH})`}
                .value=${btn.pill_width ?? ""}
                @change=${(e) => {
                  const v = safeString(e.target.value).trim();
                  if (!v) return setBtnFn({ ...btn, pill_width: "" });
                  const n = Math.max(MIN_PILL_WIDTH, Number(v));
                  setBtnFn({ ...btn, pill_width: String(n) });
                }}
              ></ha-textfield>
              <div class="hint">Fixed width keeps pills aligned and prevents awkward spacing.</div>
            </div>
          `
        : html``}

      <div class="subsection">
        <div class="subheader">Label style overrides (optional)</div>

        <div class="grid2">
          <ha-textfield
            type="number"
            .label=${"Font size (px) — blank = inherit"}
            .value=${btn.label_style?.font_size ?? ""}
            @change=${(e) => {
              const next = { ...(btn.label_style || {}) };
              if (safeString(e.target.value).trim() === "") delete next.font_size;
              else next.font_size = Number(e.target.value);
              setBtnFn({ ...btn, label_style: next });
            }}
          ></ha-textfield>

          <ha-select
            .label=${"Font weight — blank = inherit"}
            .value=${btn.label_style?.font_weight !== undefined ? String(btn.label_style.font_weight) : INHERIT}
            @selected=${(e) => {
              const next = { ...(btn.label_style || {}) };
              if (e.target.value === INHERIT) delete next.font_weight;
              else next.font_weight = Number(e.target.value);
              setBtnFn({ ...btn, label_style: next });
            }}
            @closed=${(e) => e.stopPropagation()}
          >
            <mwc-list-item .value=${INHERIT}>(inherit)</mwc-list-item>
            ${FONT_WEIGHTS.map((fw) => html`<mwc-list-item .value=${String(fw.value)}>${fw.label}</mwc-list-item>`)}
          </ha-select>

          <ha-textfield
            .label=${"Text color — blank = inherit"}
            .value=${btn.label_style?.color ?? ""}
            placeholder="(blank = inherit)"
            @change=${(e) => {
              const next = { ...(btn.label_style || {}) };
              if (safeString(e.target.value).trim() === "") delete next.color;
              else next.color = e.target.value;
              setBtnFn({ ...btn, label_style: next });
            }}
          ></ha-textfield>

          <ha-textfield
            .label=${"Label background — blank = inherit"}
            .value=${btn.label_style?.background ?? ""}
            placeholder="(blank = inherit)"
            @change=${(e) => {
              const next = { ...(btn.label_style || {}) };
              if (safeString(e.target.value).trim() === "") delete next.background;
              else next.background = e.target.value;
              setBtnFn({ ...btn, label_style: next });
            }}
          ></ha-textfield>

          <ha-textfield
            type="number"
            .label=${"Label background opacity — blank = inherit"}
            .value=${btn.label_style?.background_opacity ?? ""}
            @change=${(e) => {
              const next = { ...(btn.label_style || {}) };
              if (safeString(e.target.value).trim() === "") delete next.background_opacity;
              else next.background_opacity = Number(e.target.value);
              setBtnFn({ ...btn, label_style: next });
            }}
          ></ha-textfield>
        </div>
      </div>

      ${this._renderActionEditor(btn, setBtnFn, "tap_action", "Tap", errorKeyPrefix)}
      ${this._renderActionEditor(btn, setBtnFn, "hold_action", "Hold / Right click", errorKeyPrefix)}
      ${this._renderActionEditor(btn, setBtnFn, "double_tap_action", "Double tap", errorKeyPrefix)}

      ${allowConditions ? this._renderConditions(btn, setBtnFn) : html``}
    `;
  }

  _renderBaseButtonPanel() {
    const c = this._c;
    const btn = c.base.button || DEFAULT_BUTTON();

    const key = `base:${btn.id}`;
    const expanded = !!this._expanded[key];

    const setBtn = (nextBtn) => {
      const cfg = deepClone(this._c);
      cfg.base.button = { ...btn, ...nextBtn };
      this._emit(cfg);
    };

    return html`
      <div class="section">
        <div class="section-title">Base button</div>

        <ha-expansion-panel
          .expanded=${expanded}
          @expanded-changed=${(e) => {
            const next = e.detail?.value ?? e.detail?.expanded ?? e.target?.expanded ?? false;
            this._expanded[key] = !!next;
            this.requestUpdate();
          }}
        >
          <div slot="header" class="btn-header">
            <ha-icon .icon=${btn.icon || "mdi:home"}></ha-icon>
            <div class="btn-header-text">
              <div class="btn-title">${btn.label || btn.tooltip || "Base button"}</div>
              <div class="btn-sub">${btn.icon || ""}${btn.entity ? ` • ${btn.entity}` : ""}</div>
            </div>
          </div>

          <div class="panel">
            ${this._renderButtonPanel(btn, setBtn, "base", false)}
          </div>
        </ha-expansion-panel>
      </div>
    `;
  }

  _renderPreview() {
    const c = this._c;
    const base = c.base?.button;
    const hb = c.horizontal?.buttons || [];
    const vb = c.vertical?.buttons || [];

    const size = Math.max(30, Math.min(44, Number(c.button_size || 44)));
    const gapX = Math.max(6, Math.min(14, Number(c.gap || 10)));
    const gapY = Math.max(6, Math.min(14, Number(c.vertical_gap || c.gap || 10)));

    const previewW = 360;
    const previewH = 170;

    const btnWidth = (b) => {
      const t = safeString(b?.button_type || "").trim() || c.default_button_type;
      if (t === "pill" || t === "pill_label") {
        const pw = _hasMeaningfulNumber(b?.pill_width) ? Number(b.pill_width) : Number(c.pill_width || 0);
        if (pw > 0) return Math.max(MIN_PILL_WIDTH, pw) * (size / c.button_size);
        const label = (b.label || b.tooltip || "").trim();
        const approx = Math.max(MIN_PILL_WIDTH, 70 + label.length * 7);
        return approx * (size / c.button_size);
      }
      return size;
    };

    const renderMiniBtn = (b, dim) => {
      const t = safeString(b?.button_type || "").trim() || c.default_button_type;
      const isPill = t === "pill" || t === "pill_label";
      const w = btnWidth(b);
      const icon = (b?.tap_action?.action === "back") ? "mdi:chevron-left" : (b.icon || "mdi:circle");

      return html`
        <div
          class="pbtn ${isPill ? "pbtn-pill" : ""}"
          style="width:${w}px; height:${size}px; opacity:${dim ? 0.35 : 1};"
        >
          <ha-icon class="picon" .icon=${icon}></ha-icon>
          ${(isPill && (b.label || b.tooltip))
            ? html`<div class="plabel">${b.label || b.tooltip}</div>`
            : html``}
        </div>
      `;
    };

    const baseW = btnWidth(base);
    const cols = Math.max(1, c.horizontal.columns || 6);
    const rows = Math.max(1, c.vertical.rows || 6);

    const itemsH = [base, ...hb];
    const itemsV = vb;

    const pos = c.position;
    const children = [];

    if (pos === "bottom-center") {
      const justify = c.center_spread ? "space-between" : "center";
      children.push(html`
        <div class="prow" style="gap:${gapX}px; justify-content:${justify};">
          ${itemsH.map((b, i) => renderMiniBtn(b, i > 0 && !c.horizontal.enabled))}
        </div>
      `);
    } else {
      const isRight = pos === "bottom-right";

      const baseX = isRight ? (previewW - baseW) : 0;
      const baseY = previewH - size;

      children.push(html`<div class="pabs" style="left:${baseX}px; top:${baseY}px;">
        ${renderMiniBtn(base, false)}
      </div>`);

      let hAcc = isRight ? (previewW - baseW - gapX) : (baseW + gapX);
      let rowIdx = 0;
      for (let i = 0; i < hb.length; i++) {
        const b = hb[i];
        const w = btnWidth(b);
        const y = previewH - size - rowIdx * (size + gapY);
        const x = isRight ? (hAcc - w) : hAcc;

        children.push(html`<div class="pabs" style="left:${x}px; top:${y}px;">
          ${renderMiniBtn(b, !c.horizontal.enabled)}
        </div>`);

        if (isRight) {
          hAcc -= (w + gapX);
        } else {
          hAcc += (w + gapX);
        }

        if ((i + 1) % cols === 0) {
          rowIdx++;
          hAcc = isRight ? (previewW - baseW - gapX) : (baseW + gapX);
        }
      }

      let vRowIdx = 1;
      let wrapCol = 0;
      for (let j = 0; j < vb.length; j++) {
        const b = vb[j];
        const w = btnWidth(b);
        const y = previewH - size - vRowIdx * (size + gapY);
        const x = isRight ? (previewW - w - wrapCol * (size + gapX)) : (wrapCol * (size + gapX));

        children.push(html`<div class="pabs" style="left:${x}px; top:${y}px;">
          ${renderMiniBtn(b, !c.vertical.enabled)}
        </div>`);

        vRowIdx++;
        if (vRowIdx > rows) {
          vRowIdx = 1;
          wrapCol++;
        }
      }
    }

    return html`
      <div class="previewbox" style="width:${previewW}px; height:${previewH}px;">
        ${children}
      </div>
    `;
  }

  _renderGroup(group) {
    const c = this._c;
    const g = group === "vertical" ? c.vertical : c.horizontal;
    const buttons = g.buttons || [];
    const enabledKey = `${group}.enabled`;
    const countKey = group === "vertical" ? "rows" : "columns";

    return html`
      <div class="section">
        <div class="section-title row">
          <span>${group === "vertical" ? "Vertical group" : "Horizontal group"}</span>
          <ha-formfield .label=${"Enabled"}>
            <ha-switch
              .checked=${g.enabled}
              @change=${(e) => this._setBool(enabledKey, e.target.checked)}
            ></ha-switch>
          </ha-formfield>
        </div>

        <ha-textfield
          type="number"
          min="1"
          .label=${group === "vertical" ? "Rows per column" : "Columns per row"}
          .value=${String(g[countKey] || 6)}
          @change=${(e) => {
            const cfg = deepClone(this._c);
            cfg[group][countKey] = Math.max(1, Number(e.target.value) || 6);
            this._emit(cfg);
          }}
        ></ha-textfield>

        ${buttons.length === 0
          ? html`<div class="empty">No buttons in this group yet.</div>`
          : buttons.map((btn, idx) => {
              const key = `${group}:${btn.id}`;
              const expanded = !!this._expanded[key];
              const setBtn = (patch) => this._setButtonById(group, btn.id, patch);

              return html`
                <ha-expansion-panel
                  .expanded=${expanded}
                  @expanded-changed=${(e) => {
                    const next = e.detail?.value ?? e.detail?.expanded ?? e.target?.expanded ?? false;
                    this._expanded[key] = !!next;
                    this.requestUpdate();
                  }}
                >
                  <div slot="header" class="btn-header">
                    <ha-icon .icon=${btn.icon || "mdi:circle"}></ha-icon>
                    <div class="btn-header-text">
                      <div class="btn-title">${btn.label || btn.tooltip || `Button ${idx + 1}`}</div>
                      <div class="btn-sub">${btn.icon || ""}${btn.entity ? ` • ${btn.entity}` : ""}</div>
                    </div>
                    <div class="btn-actions">
                      <mwc-icon-button title="Move up" @click=${(e) => { e.stopPropagation(); this._moveButtonById(group, btn.id, -1); }}>
                        <ha-icon icon="mdi:arrow-up"></ha-icon>
                      </mwc-icon-button>
                      <mwc-icon-button title="Move down" @click=${(e) => { e.stopPropagation(); this._moveButtonById(group, btn.id, 1); }}>
                        <ha-icon icon="mdi:arrow-down"></ha-icon>
                      </mwc-icon-button>
                      <mwc-icon-button title="Remove" @click=${(e) => { e.stopPropagation(); this._removeButtonById(group, btn.id); }}>
                        <ha-icon icon="mdi:trash-can-outline"></ha-icon>
                      </mwc-icon-button>
                    </div>
                  </div>

                  <div class="panel">
                    ${this._renderButtonPanel(btn, setBtn, key, true)}
                  </div>
                </ha-expansion-panel>
              `;
            })}

        <mwc-button outlined @click=${() => this._addButton(group)}>
          <ha-icon icon="mdi:plus"></ha-icon>&nbsp;Add button
        </mwc-button>
      </div>
    `;
  }

  render() {
    const c = this._c;

    return html`
      <div class="editor">
        <div class="section doc">
          <div class="doc-title">HKI Navigation Card</div>
          ${this._renderPreview()}
        </div>

        <div class="section">
          <div class="section-title">Layout</div>

          <ha-select
            .label=${"Position"}
            .value=${c.position}
            @selected=${(e) => this._setValue("position", e.target.value)}
            @closed=${(e) => e.stopPropagation()}
          >
            <mwc-list-item value="bottom-left">Bottom Left</mwc-list-item>
            <mwc-list-item value="bottom-center">Bottom Center</mwc-list-item>
            <mwc-list-item value="bottom-right">Bottom Right</mwc-list-item>
          </ha-select>

          <div class="grid2">
            <ha-textfield type="number" .label=${"Offset X"} .value=${String(c.offset_x)}
              @change=${(e) => this._setValue("offset_x", Number(e.target.value))}></ha-textfield>

            <ha-textfield type="number" .label=${"Offset Y"} .value=${String(c.offset_y)}
              @change=${(e) => this._setValue("offset_y", Number(e.target.value))}></ha-textfield>

            <ha-textfield type="number" .label=${"Button size"} .value=${String(c.button_size)}
              @change=${(e) => this._setValue("button_size", Math.max(36, Number(e.target.value)))}></ha-textfield>

            <ha-textfield type="number" .label=${"Gap (horizontal)"} .value=${String(c.gap)}
              @change=${(e) => this._setValue("gap", Math.max(0, Number(e.target.value)))}></ha-textfield>

            <ha-textfield type="number" .label=${"Gap (vertical)"} .value=${String(c.vertical_gap)}
              @change=${(e) => this._setValue("vertical_gap", Math.max(0, Number(e.target.value)))}></ha-textfield>

            <ha-textfield type="number" .label=${"Z-index"} .value=${String(c.z_index)}
              @change=${(e) => this._setValue("z_index", Number(e.target.value))}></ha-textfield>
          </div>

          ${c.position === "bottom-center"
            ? html`
                <ha-formfield .label=${"Spread buttons across full width"}>
                  <ha-switch
                    .checked=${c.center_spread}
                    @change=${(e) => this._setValue("center_spread", e.target.checked)}
                  ></ha-switch>
                </ha-formfield>
              `
            : html``}

          <div class="subsection">
            <div class="subheader">Screen-size offsets (optional overrides)</div>
            <div class="grid2">
              <ha-textfield type="number"
                .label=${"Mobile offset X (< 768px) — blank = use base"}
                .value=${c.offset_x_mobile ?? ""}
                @change=${(e) => {
                  const v = safeString(e.target.value).trim();
                  this._setValue("offset_x_mobile", v === "" ? null : Number(v));
                }}></ha-textfield>

              <ha-textfield type="number"
                .label=${"Tablet offset X (768-1024px) — blank = use base"}
                .value=${c.offset_x_tablet ?? ""}
                @change=${(e) => {
                  const v = safeString(e.target.value).trim();
                  this._setValue("offset_x_tablet", v === "" ? null : Number(v));
                }}></ha-textfield>

              <ha-textfield type="number"
                .label=${"Desktop offset X (> 1024px) — blank = use base"}
                .value=${c.offset_x_desktop ?? ""}
                @change=${(e) => {
                  const v = safeString(e.target.value).trim();
                  this._setValue("offset_x_desktop", v === "" ? null : Number(v));
                }}></ha-textfield>
            </div>
          </div>

          <div class="subsection">
            <div class="subheader">Bottom bar (cosmetic background)</div>
            <div class="grid2">
              <ha-formfield .label=${"Enable bottom bar"}>
                <ha-switch
                  .checked=${c.bottom_bar_enabled}
                  @change=${(e) => this._setValue("bottom_bar_enabled", e.target.checked)}
                ></ha-switch>
              </ha-formfield>

              ${c.bottom_bar_enabled
                ? html`
                    <ha-formfield .label=${"Full width (ignore button bounds)"}>
                      <ha-switch
                        .checked=${c.bottom_bar_full_width}
                        @change=${(e) => this._setValue("bottom_bar_full_width", e.target.checked)}
                      ></ha-switch>
                    </ha-formfield>

                    <ha-textfield type="number" .label=${"Height (px)"} .value=${String(c.bottom_bar_height)}
                      @change=${(e) => this._setValue("bottom_bar_height", Math.max(0, Number(e.target.value)))}></ha-textfield>

                    <ha-textfield .label=${"Color"} .value=${c.bottom_bar_color}
                      @change=${(e) => this._setValue("bottom_bar_color", e.target.value)}></ha-textfield>

                    <ha-textfield type="number" step="0.01" min="0" max="1" .label=${"Opacity"}
                      .value=${String(c.bottom_bar_opacity)}
                      @change=${(e) => this._setValue("bottom_bar_opacity", Math.max(0, Math.min(1, Number(e.target.value))))}></ha-textfield>

                    <ha-textfield type="number" .label=${"Border radius (px)"} .value=${String(c.bottom_bar_border_radius)}
                      @change=${(e) => this._setValue("bottom_bar_border_radius", Math.max(0, Number(e.target.value)))}></ha-textfield>

                    <ha-textfield type="number" .label=${"Bottom offset (px)"} .value=${String(c.bottom_bar_bottom_offset)}
                      @change=${(e) => this._setValue("bottom_bar_bottom_offset", Number(e.target.value))}></ha-textfield>

                    <ha-textfield .label=${"Box shadow (CSS)"} .value=${c.bottom_bar_box_shadow || ""}
                      @change=${(e) => this._setValue("bottom_bar_box_shadow", e.target.value)}></ha-textfield>

                    <ha-textfield type="number" .label=${"Margin left (px)"} .value=${String(c.bottom_bar_margin_left)}
                      @change=${(e) => this._setValue("bottom_bar_margin_left", Number(e.target.value))}></ha-textfield>

                    <ha-textfield type="number" .label=${"Margin right (px)"} .value=${String(c.bottom_bar_margin_right)}
                      @change=${(e) => this._setValue("bottom_bar_margin_right", Number(e.target.value))}></ha-textfield>

                    <ha-textfield type="number" .label=${"Border width (px)"} .value=${String(c.bottom_bar_border_width)}
                      @change=${(e) => this._setValue("bottom_bar_border_width", Math.max(0, Number(e.target.value)))}></ha-textfield>

                    <ha-textfield .label=${"Border style"} .value=${c.bottom_bar_border_style}
                      @change=${(e) => this._setValue("bottom_bar_border_style", e.target.value)}></ha-textfield>

                    <ha-textfield .label=${"Border color"} .value=${c.bottom_bar_border_color || ""}
                      @change=${(e) => this._setValue("bottom_bar_border_color", e.target.value)}></ha-textfield>
                  `
                : html``}
            </div>
          </div>

          <div class="subsection">
            <div class="subheader">Button appearance defaults</div>
            <div class="grid2">
              <ha-select
                .label=${"Default button type"}
                .value=${c.default_button_type}
                @selected=${(e) => this._setValue("default_button_type", e.target.value)}
                @closed=${(e) => e.stopPropagation()}
              >
                ${BUTTON_TYPES.map((t) => html`<mwc-list-item .value=${t.value}>${t.label}</mwc-list-item>`)}
              </ha-select>

              <ha-textfield
                type="number"
                .label=${`Global pill width (px) — 0 = auto (min ${MIN_PILL_WIDTH})`}
                .value=${String(c.pill_width ?? 0)}
                @change=${(e) => this._setGlobalPillWidth(e.target.value)}
              ></ha-textfield>

              <ha-textfield
                .label=${"Button box-shadow (CSS)"}
                .value=${c.button_box_shadow || ""}
                placeholder="0 8px 24px rgba(0,0,0,0.35)"
                @change=${(e) => this._setValue("button_box_shadow", e.target.value)}
              ></ha-textfield>

              <ha-textfield
                .label=${"Button box-shadow hover (CSS)"}
                .value=${c.button_box_shadow_hover || ""}
                placeholder="0 10px 30px rgba(0,0,0,0.42)"
                @change=${(e) => this._setValue("button_box_shadow_hover", e.target.value)}
              ></ha-textfield>

              <ha-textfield
                .label=${"Default button background (optional override)"}
                .value=${c.default_background || ""}
                placeholder="(blank = theme accent/primary)"
                @change=${(e) => this._setDefaultBackground(e.target.value)}
              ></ha-textfield>

              <ha-textfield
                type="number"
                step="0.01"
                min="0"
                max="1"
                .label=${"Default button background opacity (0..1)"}
                .value=${String(c.default_button_opacity ?? 1)}
                @change=${(e) => this._setDefaultButtonOpacity(e.target.value)}
              ></ha-textfield>

              <ha-textfield
                .label=${"Default icon color (optional override)"}
                .value=${c.default_icon_color || ""}
                placeholder="(blank = theme text color)"
                @change=${(e) => this._setDefaultIconColor(e.target.value)}
              ></ha-textfield>
            </div>
          </div>

          <div class="subsection">
            <div class="subheader">Global label style</div>
            <div class="grid2">
              <ha-textfield type="number" .label=${"Font size (px)"} .value=${String(c.label_style?.font_size ?? DEFAULT_LABEL_STYLE.font_size)}
                @change=${(e) => this._setLabelStyleGlobal("font_size", Number(e.target.value))}></ha-textfield>

              <ha-select
                .label=${"Font weight"}
                .value=${String(c.label_style?.font_weight ?? DEFAULT_LABEL_STYLE.font_weight)}
                @selected=${(e) => this._setLabelStyleGlobal("font_weight", Number(e.target.value))}
                @closed=${(e) => e.stopPropagation()}
              >
                ${FONT_WEIGHTS.map((fw) => html`<mwc-list-item .value=${String(fw.value)}>${fw.label}</mwc-list-item>`)}
              </ha-select>

              <ha-textfield type="number" .label=${"Letter spacing (px)"} .value=${String(c.label_style?.letter_spacing ?? DEFAULT_LABEL_STYLE.letter_spacing)}
                @change=${(e) => this._setLabelStyleGlobal("letter_spacing", Number(e.target.value))}></ha-textfield>

              <ha-select
                .label=${"Text transform"}
                .value=${c.label_style?.text_transform ?? "none"}
                @selected=${(e) => this._setLabelStyleGlobal("text_transform", e.target.value)}
                @closed=${(e) => e.stopPropagation()}
              >
                <mwc-list-item value="none">None</mwc-list-item>
                <mwc-list-item value="uppercase">Uppercase</mwc-list-item>
                <mwc-list-item value="lowercase">Lowercase</mwc-list-item>
                <mwc-list-item value="capitalize">Capitalize</mwc-list-item>
              </ha-select>

              <ha-textfield .label=${"Text color (optional)"} .value=${c.label_style?.color ?? ""}
                placeholder="(blank = theme/currentColor)"
                @change=${(e) => this._setLabelStyleGlobal("color", e.target.value)}></ha-textfield>

              <ha-textfield .label=${"Label background (optional)"} .value=${c.label_style?.background ?? ""}
                placeholder="(blank = theme card rgba)"
                @change=${(e) => this._setLabelStyleGlobal("background", e.target.value)}></ha-textfield>

              <ha-textfield type="number" .label=${"Label background opacity"} .value=${String(c.label_style?.background_opacity ?? DEFAULT_LABEL_STYLE.background_opacity)}
                @change=${(e) => this._setLabelStyleGlobal("background_opacity", Number(e.target.value))}></ha-textfield>
            </div>
          </div>
        </div>

        ${this._renderBaseButtonPanel()}
        ${this._renderGroup("horizontal")}
        ${this._renderGroup("vertical")}
      </div>
    `;
  }

  static get styles() {
    return css`
      .editor { display: flex; flex-direction: column; gap: 16px; }

      .doc { border-radius: 14px; }
      .doc-title { font-weight: 800; margin-bottom: 8px; }

      .section {
        padding: 14px;
        border-radius: 14px;
        background: var(--card-background-color);
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .previewbox{
        position:relative;
        border-radius:14px;
        background: rgba(0,0,0,0.03);
        border: 1px solid rgba(0,0,0,0.08);
        overflow:hidden;
      }
      .pabs{ position:absolute; }
      .pbtn{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:10px;
        border-radius:999px;
        background: var(--accent-color, var(--primary-color));
        color: var(--text-primary-color, var(--primary-text-color));
        box-shadow: 0 8px 24px rgba(0,0,0,0.22);
        padding: 0 14px;
      }
      .pbtn-pill{ justify-content:flex-start; }
      .picon{ --mdc-icon-size: 18px; }
      .plabel{
        font-weight:800;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
        max-width:220px;
      }
      .prow{
        position:absolute;
        left:0; right:0;
        bottom:12px;
        display:flex;
        align-items:center;
        padding: 0 12px;
      }

      .section-title { font-weight: 800; display: flex; gap: 10px; align-items: center; justify-content: space-between; }
      .row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }

      .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

      .empty { opacity: 0.7; padding: 8px 2px; }

      ha-expansion-panel {
        border-radius: 14px;
        overflow: hidden;
        margin-top: 10px;
        background: rgba(0, 0, 0, 0.06);
      }

      .btn-header { display: flex; align-items: center; gap: 10px; padding-right: 8px; }
      .btn-header-text { flex: 1; min-width: 0; }
      .btn-title { font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .btn-sub { opacity: 0.75; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .btn-actions { display: flex; align-items: center; gap: 2px; }

      .panel { padding: 12px; display: flex; flex-direction: column; gap: 12px; }

      .subsection { margin-top: 6px; padding-top: 10px; border-top: 1px solid rgba(0, 0, 0, 0.14); display: flex; flex-direction: column; gap: 10px; }
      .subheader { font-weight: 800; opacity: 0.9; }

      .hint { font-size: 12px; opacity: 0.7; }

      .cond {
        border-radius: 12px;
        padding: 10px;
        background: rgba(0, 0, 0, 0.06);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .cond-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
      .cond-title { font-weight: 700; font-size: 12px; opacity: 0.9; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

      .code-wrap { display: flex; flex-direction: column; gap: 8px; }
      .code-label { font-weight: 700; opacity: 0.85; }
      ha-code-editor { border-radius: 12px; overflow: hidden; }

      @media (max-width: 640px) {
        .grid2 { grid-template-columns: 1fr; }
        .previewbox{ width: 100% !important; }
      }
    `;
  }
}

customElements.define(CARD_TYPE, HkiNavigationCard);
customElements.define(EDITOR_TAG, HkiNavigationCardEditor);

HkiNavigationCard.getConfigElement = () => document.createElement(EDITOR_TAG);

HkiNavigationCard.getStubConfig = () => ({
  ...deepClone(DEFAULTS),
  base: {
    button: {
      ...DEFAULT_BUTTON(),
      icon: "mdi:home",
      tooltip: "Home",
      button_type: "icon",
      tap_action: { action: "navigate", navigation_path: "/lovelace/0" },
    },
  },
  horizontal: {
    enabled: true,
    columns: 6,
    buttons: [
      {
        ...DEFAULT_BUTTON(),
        icon: "mdi:view-grid",
        tooltip: "Overview",
        button_type: "icon",
        tap_action: { action: "navigate", navigation_path: "/" },
      },
      {
        ...DEFAULT_BUTTON(),
        icon: "mdi:menu",
        tooltip: "Menu",
        button_type: "pill",
        label: "Menu",
        double_tap_action: { action: "toggle-group", target: "both", mode: "show" },
      },
    ],
  },
  vertical: {
    enabled: false,
    rows: 6,
    buttons: [
      {
        ...DEFAULT_BUTTON(),
        icon: "mdi:cog",
        tooltip: "Settings",
        button_type: "pill",
        label: "Settings",
        tap_action: { action: "navigate", navigation_path: "/config" },
      },
    ],
  },
});

window.customCards = window.customCards || [];
window.customCards.push({
  type: CARD_TYPE,
  name: "HKI Navigation Card",
  description: "Highly Customizable Navigation Bar.",
  preview: false,
  documentationURL: "https://github.com/jimz011/hki-navigation-card",
});