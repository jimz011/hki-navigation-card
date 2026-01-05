/* HKI Navigation Card
 * Highly Customizable Navigation Bar
 *
 * - Fixed-position FAB style navigation/action buttons
 * - Base button is mandatory and always visible
 * - Horizontal + Vertical groups
 * - Center position: vertical always hidden
 * - Groups can be temporarily opened via actions; auto-close after any non-toggle-group action
 * - Supports button types including pill buttons
 * - Service calls support YAML (no external jsyaml needed)
 * - Robust tap handling: tap / double-tap / hold
 * - Sidebar-aware auto offset for bottom-left
 * - Conditions: entity/user/view/screen (core-like)
 * - Editor: expansion panels, entity pickers, demo mode preview
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
const CARD_TAG = "hki-navigation-card";
const EDITOR_TAG = "hki-navigation-card-editor";

const INHERIT = "__inherit__";

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

function _uid() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `id_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
}

function safeString(v) {
  if (v === null || v === undefined) return "";
  return String(v);
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
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.trunc(n));
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
  if (x === undefined || x === null) return false;
  if (typeof x === "number") return Number.isFinite(x);
  if (typeof x === "string") {
    const t = x.trim();
    if (t === "") return false;
    const n = Number(t);
    return Number.isFinite(n);
  }
  return false;
}
function _toNumber(x) {
  if (typeof x === "number") return x;
  if (typeof x === "string") return Number(x.trim());
  return NaN;
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

  const pickStr = (key) =>
    typeof b[key] === "string" && b[key].trim() !== "" ? b[key] : g[key];

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
  if (BUTTON_TYPES.some((t) => t.value === type)) return type;
  return fallback;
}

/* -------------------- Minimal YAML parser (no external deps) --------------------
 * Supports:
 * - mappings, nested mappings via indentation
 * - lists via "-"
 * - scalars: string, number, boolean, null
 * - inline JSON for convenience: {a:1} / [1,2]
 *
 * This is intentionally small but robust enough for typical HA service_data.
 */
function _stripYamlComment(line) {
  // remove # comments unless inside quotes (simple heuristic)
  let inS = false;
  let inD = false;
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

  if ((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
    try {
      return JSON.parse(s);
    } catch (_) {
      // fall through
    }
  }

  const lower = s.toLowerCase();
  if (lower === "null" || lower === "~") return null;
  if (lower === "true" || lower === "yes" || lower === "on") return true;
  if (lower === "false" || lower === "no" || lower === "off") return false;

  // number
  if (/^-?\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    if (Number.isFinite(n)) return n;
  }

  // quoted
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }

  return s;
}

function parseYamlLite(yamlStr) {
  const src = safeString(yamlStr);
  const lines = src.split("\n");

  // Precompute next non-empty line index for lookahead
  const nextNonEmpty = new Array(lines.length).fill(-1);
  let next = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
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
    if (kind === "list") parent[key] = [];
    else parent[key] = {};
    return parent[key];
  };

  const setInMap = (map, key, value) => {
    map[key] = value;
  };

  for (let i = 0; i < lines.length; i++) {
    let rawLine = _stripYamlComment(lines[i]);
    if (!rawLine.trim()) continue;

    const indent = rawLine.match(/^\s*/)[0].length;
    const line = rawLine.trim();

    popToIndent(indent);
    const top = stack[stack.length - 1];

    // list item
    if (line.startsWith("-")) {
      // Ensure current container is a list
      if (top.kind !== "list") {
        // Convert empty map placeholder into list if possible
        // If it's root map but user started with "-", treat root as list
        if (stack.length === 1) {
          stack[0] = { indent: -1, kind: "list", value: [] };
        } else {
          // if parent is map, we cannot infer key here reliably -> error
          throw new Error("YAML: list item found where a mapping was expected.");
        }
      }

      const list = stack[stack.length - 1].value;
      const itemRest = line.replace(/^-/, "").trim();

      if (itemRest === "") {
        // decide container by lookahead
        const ni = nextNonEmpty[i];
        const nextLine = ni >= 0 ? _stripYamlComment(lines[ni]).trim() : "";
        const nextIndent = ni >= 0 ? _stripYamlComment(lines[ni]).match(/^\s*/)[0].length : -1;
        if (ni >= 0 && nextIndent > indent && nextLine.startsWith("-")) {
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

      // inline "- key: val" mapping support
      const colonIdx = itemRest.indexOf(":");
      if (colonIdx > -1) {
        const k = itemRest.slice(0, colonIdx).trim();
        const vRaw = itemRest.slice(colonIdx + 1).trim();
        if (vRaw === "") {
          const ni = nextNonEmpty[i];
          const nextLine = ni >= 0 ? _stripYamlComment(lines[ni]).trim() : "";
          const nextIndent = ni >= 0 ? _stripYamlComment(lines[ni]).match(/^\s*/)[0].length : -1;
          const child = {};
          child[k] = (ni >= 0 && nextIndent > indent && nextLine.startsWith("-")) ? [] : {};
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

      // plain scalar list item
      list.push(_parseScalar(itemRest));
      continue;
    }

    // mapping key: value
    const idx = line.indexOf(":");
    if (idx === -1) throw new Error(`YAML: expected "key: value" but got "${line}"`);

    const key = line.slice(0, idx).trim();
    let vRaw = line.slice(idx + 1).trim();

    // Ensure top is map
    if (stack[stack.length - 1].kind !== "map") {
      throw new Error("YAML: mapping entry found where a list was expected.");
    }

    const map = stack[stack.length - 1].value;

    if (vRaw === "") {
      // Lookahead to decide if this becomes a list or map
      const ni = nextNonEmpty[i];
      const nextLine = ni >= 0 ? _stripYamlComment(lines[ni]).trim() : "";
      const nextIndent = ni >= 0 ? _stripYamlComment(lines[ni]).match(/^\s*/)[0].length : -1;

      if (ni >= 0 && nextIndent > indent && nextLine.startsWith("-")) {
        const child = ensureContainerForKey(map, key, "list");
        stack.push({ indent, kind: "map", value: map });
        stack.push({ indent: indent + 2, kind: "list", value: child });
      } else if (ni >= 0 && nextIndent > indent) {
        const child = ensureContainerForKey(map, key, "map");
        stack.push({ indent, kind: "map", value: map });
        stack.push({ indent: indent + 2, kind: "map", value: child });
      } else {
        setInMap(map, key, null);
      }
    } else {
      setInMap(map, key, _parseScalar(vRaw));
    }
  }

  // If root was converted to list
  if (Array.isArray(stack[0].value)) return stack[0].value;
  return root;
}

/* -------------------------- Defaults -------------------------- */

const DEFAULT_BUTTON = () => ({
  id: _uid(),
  icon: "mdi:floor-plan",
  tooltip: "",
  label: "",
  entity: "",

  button_type: "",

  // Button style overrides
  background: "",
  background_opacity: "", // per-button override (0..1)
  icon_color: "",

  // Label style overrides
  label_style: {},

  // Optional per-button pill width override
  pill_width: "",

  // Visibility conditions
  conditions_mode: "all",
  conditions: [],

  // Actions
  tap_action: { action: "navigate", navigation_path: "/" },
  hold_action: { action: "none" },
  double_tap_action: { action: "none" },
});

const DEFAULTS = {
  type: `custom:${CARD_TYPE}`,

  // Requested defaults
  position: "bottom-right",
  offset_x: 70,
  offset_y: 20,
  button_size: 50,
  gap: 12,
  z_index: 5,

  base: { button: DEFAULT_BUTTON() }, // mandatory

  horizontal: { enabled: true, columns: 6, buttons: [] },
  vertical: { enabled: false, rows: 6, buttons: [] },

  // Theme-following defaults (blank => theme vars)
  default_background: "",
  default_button_opacity: 1, // NEW global button opacity
  default_icon_color: "",

  default_button_type: "icon",

  // Global label style
  label_style: { ...DEFAULT_LABEL_STYLE },

  // Global pill width; used when pill type selected; 0=auto
  pill_width: 0,

  // Center options
  center_spread: false,

  // Sidebar awareness
  sidebar_offset_mode: "auto", // auto | manual
  // bottom-right (kept for back-compat, but auto doesn't shift right)
  offset_x_sidebar_closed: 70,
  offset_x_sidebar_open: 260,
  // bottom-left (new)
  offset_x_sidebar_closed_left: 70,
  offset_x_sidebar_open_left: 260,

  // Back-compat
  buttons: undefined,
  default_label_position: undefined,
  default_show_label: undefined,
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

    // normalize condition objects
    const conds = Array.isArray(b.conditions) ? b.conditions : [];
    let local = false;
    const nextConds = conds.map((c) => {
      if (!c || typeof c !== "object") return c;
      const cc = { ...c };
      if (!cc.id) {
        cc.id = _uid();
        local = true;
      }
      // back-compat: type missing => entity
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
  if (btn?.button_type && BUTTON_TYPES.some((t) => t.value === btn.button_type)) return btn.button_type;

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
  // Remove base conditions (always visible)
  delete base.button.conditions;
  delete base.button.conditions_mode;

  const horizontal = { ...DEFAULTS.horizontal, ...(raw.horizontal || {}) };
  const vertical = { ...DEFAULTS.vertical, ...(raw.vertical || {}) };

  // Back-compat: single buttons list
  const hasNewLists =
    (Array.isArray(horizontal.buttons) && horizontal.buttons.length > 0) ||
    (Array.isArray(vertical.buttons) && vertical.buttons.length > 0);

  if (!hasNewLists && Array.isArray(raw.buttons)) {
    const h = [];
    const v = [];
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
  c.z_index = clampNum(c.z_index, DEFAULTS.z_index);

  c.default_button_opacity = Math.max(0, Math.min(1, clampNum(c.default_button_opacity, DEFAULTS.default_button_opacity)));

  c.horizontal.enabled = !!c.horizontal.enabled;
  c.horizontal.columns = Math.max(1, clampInt(c.horizontal.columns, DEFAULTS.horizontal.columns, 1));
  c.horizontal.buttons = Array.isArray(c.horizontal.buttons) ? c.horizontal.buttons : [];

  c.vertical.enabled = !!c.vertical.enabled;
  c.vertical.rows = Math.max(1, clampInt(c.vertical.rows, DEFAULTS.vertical.rows, 1));
  c.vertical.buttons = Array.isArray(c.vertical.buttons) ? c.vertical.buttons : [];

  c.default_button_type = normalizeButtonType(c.default_button_type, DEFAULTS.default_button_type);

  // Back-compat default label settings
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
  c.center_spread = !!c.center_spread;

  c.sidebar_offset_mode = c.sidebar_offset_mode === "manual" ? "manual" : "auto";
  c.offset_x_sidebar_closed = clampNum(c.offset_x_sidebar_closed, c.offset_x);
  c.offset_x_sidebar_open = clampNum(c.offset_x_sidebar_open, DEFAULTS.offset_x_sidebar_open);
  c.offset_x_sidebar_closed_left = clampNum(c.offset_x_sidebar_closed_left, c.offset_x);
  c.offset_x_sidebar_open_left = clampNum(c.offset_x_sidebar_open_left, DEFAULTS.offset_x_sidebar_open_left);

  // Ensure ids + normalize condition ids/types
  {
    const [hb] = ensureButtonIdsInList(c.horizontal.buttons);
    const [vb] = ensureButtonIdsInList(c.vertical.buttons);
    c.horizontal.buttons = hb;
    c.vertical.buttons = vb;

    const [hb2] = ensureConditionIdsInList(c.horizontal.buttons);
    const [vb2] = ensureConditionIdsInList(c.vertical.buttons);
    c.horizontal.buttons = hb2;
    c.vertical.buttons = vb2;
  }

  return c;
}

/* -------------------------- Color helpers -------------------------- */

function clamp01(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 1;
  return Math.max(0, Math.min(1, x));
}

// background-only opacity for any css color/var using color-mix
function applyBgOpacity(color, opacity01) {
  const o = clamp01(opacity01);
  if (o >= 1) return color;
  if (o <= 0) return "transparent";
  const pct = Math.round(o * 1000) / 10; // 0.1%
  // Works with vars in modern browsers used by HA
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
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

    // Drawer state (sidebar)
    this._drawerOpen = false;
    this._drawerWidth = 0;
    this._drawerObs = null;

    // Tap handling
    this._tapState = { lastId: null, lastTime: 0, singleTimer: null };
    this._holdTimers = new Map();

    // Dynamic measured layout
    this._layout = { ready: false, slots: {} };
    this._measureRaf = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._setupDrawerObserver();
    window.addEventListener("resize", this._onResize);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("resize", this._onResize);
    try { this._drawerObs?.disconnect?.(); } catch (_) {}
    this._drawerObs = null;
    if (this._measureRaf) cancelAnimationFrame(this._measureRaf);
  }

  _onResize = () => {
    this._readDrawerState();
    this._layout = { ready: false, slots: {} };
    this.requestUpdate();
    this._scheduleMeasure();
  };

  updated(changedProps) {
    super.updated?.(changedProps);
    this._scheduleMeasure();
  }

  _scheduleMeasure() {
    if (!this._config) return;
    // only measure in corner modes (fixed grid)
    if (this._config.position === "bottom-center") return;

    if (this._measureRaf) cancelAnimationFrame(this._measureRaf);
    this._measureRaf = requestAnimationFrame(() => this._measureAndLayout());
  }

  _findDrawer() {
    const direct = document.querySelector("ha-drawer");
    if (direct) return direct;

    const ha = document.querySelector("home-assistant");
    const sr1 = ha?.shadowRoot;
    const d1 = sr1?.querySelector("ha-drawer");
    if (d1) return d1;

    const main = sr1?.querySelector("home-assistant-main");
    const sr2 = main?.shadowRoot;
    const d2 = sr2?.querySelector("ha-drawer");
    if (d2) return d2;

    return null;
  }

  _readDrawerState() {
    const drawer = this._findDrawer();
    if (!drawer) {
      this._drawerOpen = false;
      this._drawerWidth = 0;
      return;
    }

    const open =
      drawer.hasAttribute("open") ||
      drawer.hasAttribute("opened") ||
      drawer.opened === true ||
      drawer.open === true ||
      drawer.classList?.contains("opened");

    this._drawerOpen = !!open;

    try {
      const rect = drawer.getBoundingClientRect();
      this._drawerWidth = rect?.width ? rect.width : 0;
    } catch (_) {
      this._drawerWidth = 0;
    }
  }

  _setupDrawerObserver() {
    this._readDrawerState();

    const drawer = this._findDrawer();
    if (!drawer) return;

    try {
      this._drawerObs = new MutationObserver(() => {
        this._readDrawerState();
        this.requestUpdate();
      });
      this._drawerObs.observe(drawer, { attributes: true, attributeFilter: ["open", "opened", "class", "style"] });
    } catch (_) {}
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = normalizeConfig(config);
    this._layout = { ready: false, slots: {} };
    this.requestUpdate();
    this._scheduleMeasure();
  }

  getCardSize() {
    return 0;
  }

  _getButtonType(btn) {
    const c = this._config;
    const t = safeString(btn?.button_type);
    if (t && BUTTON_TYPES.some((x) => x.value === t)) return t;
    return inferButtonTypeFromLegacy(btn, c.default_button_type);
  }

  _getLabelText(btn) {
    return btn?.label || btn?.tooltip || "";
  }

  _getPillWidth(btn) {
    const per = btn?.pill_width;
    if (_hasMeaningfulNumber(per)) {
      const n = _toNumber(per);
      return n > 0 ? n : 0;
    }
    const g = clampNum(this._config.pill_width, 0);
    return g > 0 ? g : 0;
  }

  _buttonOpacity(btn) {
    if (_hasMeaningfulNumber(btn?.background_opacity)) return clamp01(_toNumber(btn.background_opacity));
    return clamp01(this._config.default_button_opacity);
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

    const bg =
      merged.background && merged.background !== ""
        ? applyBgOpacity(merged.background, clamp01(merged.background_opacity))
        : `rgba(var(--rgb-card-background-color, 0, 0, 0), ${clamp01(merged.background_opacity)})`;

    const color =
      merged.color && merged.color !== ""
        ? merged.color
        : "var(--text-primary-color, var(--primary-text-color))";

    return [
      `font-size:${merged.font_size}px`,
      `font-weight:${merged.font_weight}`,
      `letter-spacing:${merged.letter_spacing}px`,
      `text-transform:${merged.text_transform}`,
      `color:${color}`,
      `background:${bg}`,
      `padding:${merged.padding_y}px ${merged.padding_x}px`,
      `border-radius:${merged.border_radius}px`,
      `max-width:${merged.max_width}px`,
      `backdrop-filter:blur(${merged.backdrop_blur}px)`,
      `-webkit-backdrop-filter:blur(${merged.backdrop_blur}px)`,
    ].join(";");
  }

  _pillTextStyle(btn) {
    const merged = mergeLabelStyle(this._config.label_style, btn?.label_style);
    const color =
      merged.color && merged.color !== ""
        ? merged.color
        : "currentColor";

    return [
      `font-size:${merged.font_size}px`,
      `font-weight:${merged.font_weight}`,
      `letter-spacing:${merged.letter_spacing}px`,
      `text-transform:${merged.text_transform}`,
      `color:${color}`,
    ].join(";");
  }

  /* -------------------------- Conditions (core-like) -------------------------- */

  _evalCondition(cond) {
    const hass = this.hass;
    if (!hass) return true;
    if (!cond || typeof cond !== "object") return true;

    const type = cond.type || "entity";
    let result = true;

    if (type === "entity") {
      const entityId = cond.entity;
      if (!entityId) return true;

      const operator = cond.operator || "equals";
      const stateObj = hass.states?.[entityId];

      if (operator === "exists") result = !!stateObj;
      else if (operator === "not_exists") result = !stateObj;
      else {
        if (!stateObj) result = false;
        else {
          const actual = cond.attribute ? stateObj.attributes?.[cond.attribute] : stateObj.state;
          const actualStr = safeString(actual);
          const valueStr = safeString(cond.value);

          if (operator === "equals") result = actualStr === valueStr;
          else if (operator === "not_equals") result = actualStr !== valueStr;
          else if (operator === "above") {
            const a = Number(actual);
            const v = Number(cond.value);
            result = Number.isFinite(a) && Number.isFinite(v) ? a > v : false;
          } else if (operator === "below") {
            const a = Number(actual);
            const v = Number(cond.value);
            result = Number.isFinite(a) && Number.isFinite(v) ? a < v : false;
          } else if (operator === "includes") {
            if (Array.isArray(actual)) result = actual.map(safeString).includes(valueStr);
            else result = actualStr.includes(valueStr);
          } else if (operator === "not_includes") {
            if (Array.isArray(actual)) result = !actual.map(safeString).includes(valueStr);
            else result = !actualStr.includes(valueStr);
          }
        }
      }
    } else if (type === "user") {
      const userName = hass.user?.name || "";
      const list = Array.isArray(cond.users) ? cond.users : [];
      result = list.length === 0 ? true : list.includes(userName);
    } else if (type === "view") {
      const path = window.location?.pathname || "";
      const list = Array.isArray(cond.views) ? cond.views : [];
      // match exact or suffix for convenience
      result = list.length === 0 ? true : list.some((v) => v === path || path.endsWith(v));
    } else if (type === "screen") {
      const mode = cond.mode || "mobile"; // mobile | desktop
      const isMobile = window.matchMedia?.("(max-width: 800px)")?.matches ?? false;
      result = mode === "mobile" ? isMobile : !isMobile;
    }

    if (cond.invert) result = !result;
    return result;
  }

  _isButtonVisible(btn) {
    const conds = Array.isArray(btn?.conditions) ? btn.conditions : [];
    if (conds.length === 0) return true;

    const mode = btn.conditions_mode === "any" ? "any" : "all";
    const results = conds.map((c) => this._evalCondition(c));
    return mode === "any" ? results.some(Boolean) : results.every(Boolean);
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

      if (next === baseEnabled) this._groupOverride[key] = null;
      else this._groupOverride[key] = next;
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

  /* -------------------------- Sidebar offsets -------------------------- */

  _computeOffsetX() {
    const c = this._config;

    // auto affects bottom-left only (to avoid being hidden behind sidebar)
    if (c.sidebar_offset_mode === "manual") {
      if (c.position === "bottom-left") {
        return this._drawerOpen ? c.offset_x_sidebar_open_left : c.offset_x_sidebar_closed_left;
      }
      if (c.position === "bottom-right") {
        return this._drawerOpen ? c.offset_x_sidebar_open : c.offset_x_sidebar_closed;
      }
      return c.offset_x;
    }

    // auto
    if (c.position === "bottom-left") {
      const extra = this._drawerOpen ? (this._drawerWidth || 0) : 0;
      if (extra > 40) return c.offset_x + extra;
      return c.offset_x;
    }

    // bottom-right & center: do not shift
    return c.offset_x;
  }

  /* -------------------------- Dynamic layout measurement -------------------------- */

  _measureAndLayout() {
    const c = this._config;
    if (!c || c.position === "bottom-center") return;

    const root = this.shadowRoot;
    if (!root) return;

    const slotEls = Array.from(root.querySelectorAll(".abs-slot"));
    if (!slotEls.length) return;

    const slotMeta = slotEls.map((el) => {
      const slotId = el.getAttribute("data-slot-id") || "";
      const fab = el.querySelector(".fab");
      const w = fab ? fab.getBoundingClientRect().width : c.button_size;
      const h = fab ? fab.getBoundingClientRect().height : c.button_size;
      return { slotId, w: Math.max(w, 1), h: Math.max(h, 1) };
    });

    // Build slot plan consistent with renderCornerSlots()
    const plan = this._cornerSlotPlan();
    if (!plan) return;

    // Map widths by key
    const widthByKey = {};
    for (const m of slotMeta) widthByKey[m.slotId] = m.w;

    const gap = c.gap;
    const stepY = c.button_size + gap;
    const dir = c.position === "bottom-right" ? -1 : 1;

    // Determine max columns used in horizontal block (including base col 0)
    const maxHCols = Math.max(1, plan.hColsTotal);

    // Compute column widths for horizontal grid by max per column
    const colWidths = new Array(maxHCols).fill(c.button_size);
    for (const s of plan.slots) {
      if (s.area !== "h") continue;
      const w = widthByKey[s.key] ?? c.button_size;
      colWidths[s.col] = Math.max(colWidths[s.col], w);
    }
    // base width is col 0
    if (plan.baseKey) {
      const bw = widthByKey[plan.baseKey] ?? c.button_size;
      colWidths[0] = Math.max(colWidths[0], bw);
    }

    // prefix sums
    const colX = new Array(maxHCols).fill(0);
    for (let i = 1; i < maxHCols; i++) {
      colX[i] = colX[i - 1] + colWidths[i - 1] + gap;
    }
    const hBlockWidth = colX[maxHCols - 1] + colWidths[maxHCols - 1];

    // Vertical wrap columns widths
    const vWrapWidths = new Array(plan.vWrapCols).fill(c.button_size);
    for (const s of plan.slots) {
      if (s.area !== "v") continue;
      const w = widthByKey[s.key] ?? c.button_size;
      vWrapWidths[s.wrapCol] = Math.max(vWrapWidths[s.wrapCol], w);
    }
    // prefix sums for wrap cols
    const vWrapX = new Array(plan.vWrapCols).fill(0);
    for (let i = 1; i < plan.vWrapCols; i++) {
      vWrapX[i] = vWrapX[i - 1] + vWrapWidths[i - 1] + gap;
    }

    const positions = {};

    // Base at 0,0
    if (plan.baseKey) positions[plan.baseKey] = { x: 0, y: 0 };

    // Horizontal positions: col determines x by colX, row determines y
    for (const s of plan.slots) {
      if (s.area !== "h") continue;
      const x = dir * colX[s.col];
      const y = -s.row * stepY;
      positions[s.key] = { x, y };
    }

    // Vertical positions: wrapCol 0 at x=0; wrapCol>0 placed beyond horizontal block
    for (const s of plan.slots) {
      if (s.area !== "v") continue;
      let x = 0;
      if (s.wrapCol === 0) x = 0;
      else {
        x = dir * (hBlockWidth + gap + vWrapX[s.wrapCol]);
      }
      const y = -s.row * stepY;
      positions[s.key] = { x, y };
    }

    // Update layout if changed
    this._layout = { ready: true, slots: positions };
    this.requestUpdate();
  }

  _cornerSlotPlan() {
    const c = this._config;
    if (!c || c.position === "bottom-center") return null;

    const baseBtn = c.base?.button;
    const baseKey = baseBtn ? `base:${baseBtn.id}` : null;

    const horizontalVisible = this._isGroupVisible("horizontal");
    const verticalVisible = this._isGroupVisible("vertical");

    const hButtons = horizontalVisible
      ? (c.horizontal.buttons || []).filter((b) => this._isButtonVisible(b))
      : [];

    const vButtons = verticalVisible
      ? (c.vertical.buttons || []).filter((b) => this._isButtonVisible(b))
      : [];

    const slots = [];
    const cols = Math.max(1, c.horizontal.columns);
    const rows = Math.max(1, c.vertical.rows);

    // Horizontal grid: base occupies col 0 row 0
    // Horizontal buttons occupy col 1..cols, wrap row++
    for (let i = 0; i < hButtons.length; i++) {
      const row = Math.floor(i / cols);
      const col = 1 + (i % cols);
      const key = `h:${hButtons[i].id}`;
      slots.push({ area: "h", key, row, col });
    }

    const hColsTotal = 1 + cols; // base col + configured cols

    // Vertical grid: first column (wrapCol 0) above base (row 1..rows)
    // wrapCol>0 shifts right/left beyond horizontal block
    let vWrapCols = 0;
    for (let j = 0; j < vButtons.length; j++) {
      const r = 1 + (j % rows);
      const wrapCol = Math.floor(j / rows);
      vWrapCols = Math.max(vWrapCols, wrapCol + 1);
      const key = `v:${vButtons[j].id}`;
      slots.push({ area: "v", key, row: r, wrapCol });
    }

    return { baseKey, slots, hColsTotal, vWrapCols };
  }

  /* -------------------------- Actions (tap/dbl/hold) -------------------------- */

  _handleAction(btn, which) {
    const hass = this.hass;
    if (!hass) return;

    const action = (btn && btn[which]) || btn?.tap_action || { action: "none" };
    const type = action?.action || "none";
    if (type === "none") return;

    if (type === "toggle-group") {
      const target = action.target || "vertical";
      const mode = action.mode || "toggle";
      this._toggleGroup(target, mode);
      return;
    }

    if (type === "back") {
      history.back();
      setTimeout(() => fireEvent(window, "location-changed", {}), 0);
      this._autoCloseTempMenus();
      return;
    }

    if (type === "navigate") {
      const path = action.navigation_path || "/";
      history.pushState(null, "", path);
      fireEvent(window, "location-changed", {});
      this._autoCloseTempMenus();
      return;
    }

    if (type === "url") {
      const url = action.url_path;
      if (!url) return;
      window.open(url, action.new_tab === false ? "_self" : "_blank", "noreferrer");
      this._autoCloseTempMenus();
      return;
    }

    if (type === "toggle") {
      if (!btn?.entity) return;
      hass.callService("homeassistant", "toggle", { entity_id: btn.entity });
      this._autoCloseTempMenus();
      return;
    }

    if (type === "more-info") {
      if (!btn?.entity) return;
      fireEvent(this, "hass-more-info", { entityId: btn.entity });
      this._autoCloseTempMenus();
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
        // runtime: do not crash; just call without data
        // eslint-disable-next-line no-console
        console.warn("[HKI Navigation Card] Service data YAML parse failed:", err);
        data = {};
      }

      hass.callService(domain, service, data || {});
      this._autoCloseTempMenus();
      return;
    }

    this._autoCloseTempMenus();
  }

  _onPointerDown(e, btn) {
    e.stopPropagation();
    // right click handled by contextmenu
    if (e.button === 2) return;

    const key = `${btn.id}:${e.pointerId}`;
    // hold
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
      // hold already fired
      return;
    }

    const now = Date.now();
    const dblWindow = 280;

    // double-tap detection
    if (this._tapState.lastId === btn.id && (now - this._tapState.lastTime) < dblWindow) {
      if (this._tapState.singleTimer) clearTimeout(this._tapState.singleTimer);
      this._tapState = { lastId: null, lastTime: 0, singleTimer: null };
      this._handleAction(btn, "double_tap_action");
      return;
    }

    // schedule single tap to allow double
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
    // treat as hold
    this._handleAction(btn, "hold_action");
  }

  /* -------------------------- Render helpers -------------------------- */

  _isPillType(type) {
    return type === "pill" || type === "pill_label";
  }

  _renderButton(btn, context = "h") {
    const c = this._config;
    const type = this._getButtonType(btn);

    const labelText = this._getLabelText(btn);
    const hasLabel = !!labelText;

    const isPill = this._isPillType(type);
    const showIcon =
      type === "icon" ||
      type === "icon_label_below" ||
      type === "icon_label_left" ||
      type === "icon_label_right" ||
      type === "pill";

    const showBubbleBelow = type === "icon_label_below" && hasLabel;
    const showBubbleLeft = type === "icon_label_left" && hasLabel;
    const showBubbleRight = type === "icon_label_right" && hasLabel;

    const showPillText = isPill && hasLabel;

    const bg = this._buttonBg(btn);
    const iconColor = this._buttonIconColor(btn);

    const act = btn?.tap_action?.action;
    const icon =
      (btn.icon && btn.icon.trim()) ? btn.icon :
      (act === "back" ? "mdi:chevron-left" : "mdi:circle");

    const pillWidth = isPill ? this._getPillWidth(btn) : 0;
    const pillFixed = isPill && pillWidth > 0;

    const btnStyleParts = [`background:${bg}`, `color:${iconColor}`];
    if (pillFixed) btnStyleParts.push(`width:${pillWidth}px`);

    // IMPORTANT: left/right labels must not shift button position.
    // We render them as floating bubbles around the button.
    const floatGap = 10;
    const floatSide = showBubbleLeft ? "left" : (showBubbleRight ? "right" : null);

    return html`
      <div class="item ${showBubbleBelow ? "item-v" : "item-float"}" data-context=${context}>
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
            ${showIcon
              ? html`<ha-icon class="fab-icon" .icon=${icon}></ha-icon>`
              : html``}

            ${showPillText
              ? html`<span class="pill-text" style="${this._pillTextStyle(btn)}">${labelText}</span>`
              : html``}
          </button>

          ${floatSide === "left"
            ? html`<div class="label label-float" style="${this._labelBubbleStyle(btn)}; right: calc(100% + ${floatGap}px); top: 50%; transform: translateY(-50%);">${labelText}</div>`
            : html``}
          ${floatSide === "right"
            ? html`<div class="label label-float" style="${this._labelBubbleStyle(btn)}; left: calc(100% + ${floatGap}px); top: 50%; transform: translateY(-50%);">${labelText}</div>`
            : html``}
        </div>

        ${showBubbleBelow
          ? html`<div class="label" style="${this._labelBubbleStyle(btn)}">${labelText}</div>`
          : html``}
      </div>
    `;
  }

  render() {
    if (!this._config) return html``;
    const c = this._config;

    const offsetX = this._computeOffsetX();
    const offsetY = c.offset_y;

    const anchorStyle = (() => {
      if (c.position === "bottom-center") {
        if (c.center_spread) return `left:0px; right:0px; bottom:${offsetY}px;`;
        return `left:50%; transform:translateX(-50%); bottom:${offsetY}px;`;
      }
      if (c.position === "bottom-left") return `left:${offsetX}px; bottom:${offsetY}px;`;
      return `right:${offsetX}px; bottom:${offsetY}px;`;
    })();

    const baseBtn = c.base?.button;
    // base always shown
    const base = baseBtn;

    // Center mode: vertical always hidden
    if (c.position === "bottom-center") {
      const horizontalVisible = this._isGroupVisible("horizontal");
      const hButtons = horizontalVisible
        ? (c.horizontal.buttons || []).filter((b) => this._isButtonVisible(b))
        : [];

      const all = [base, ...hButtons];

      const justify = c.center_spread ? "space-between" : "center";
      const pad = c.center_spread ? `${offsetX}px` : "0px";

      return html`
        <div
          class="fab-anchor"
          style="${anchorStyle} z-index:${c.z_index}; --hki-size:${c.button_size}px; --hki-gap:${c.gap}px;"
        >
          <div class="center-wrap" style="padding:0 ${pad}; justify-content:${justify};">
            ${all.map((btn) => this._renderButton(btn, "center"))}
          </div>
        </div>
      `;
    }

    // Corner mode: absolute slots + measured positions
    const plan = this._cornerSlotPlan();
    const horizontalVisible = this._isGroupVisible("horizontal");
    const verticalVisible = this._isGroupVisible("vertical");

    const hButtons = horizontalVisible
      ? (c.horizontal.buttons || []).filter((b) => this._isButtonVisible(b))
      : [];
    const vButtons = verticalVisible
      ? (c.vertical.buttons || []).filter((b) => this._isButtonVisible(b))
      : [];

    const slots = [];
    const baseKey = `base:${base.id}`;
    slots.push({ key: baseKey, btn: base, area: "base", row: 0, col: 0, wrapCol: 0 });

    // Horizontal slots
    const cols = Math.max(1, c.horizontal.columns);
    for (let i = 0; i < hButtons.length; i++) {
      const row = Math.floor(i / cols);
      const col = 1 + (i % cols);
      slots.push({ key: `h:${hButtons[i].id}`, btn: hButtons[i], area: "h", row, col, wrapCol: 0 });
    }

    // Vertical slots
    const rows = Math.max(1, c.vertical.rows);
    for (let j = 0; j < vButtons.length; j++) {
      const row = 1 + (j % rows);
      const wrapCol = Math.floor(j / rows);
      slots.push({ key: `v:${vButtons[j].id}`, btn: vButtons[j], area: "v", row, col: 0, wrapCol });
    }

    const gap = c.gap;
    const fallbackStep = c.button_size + gap;

    return html`
      <div
        class="fab-anchor"
        style="${anchorStyle} z-index:${c.z_index}; --hki-size:${c.button_size}px; --hki-gap:${c.gap}px;"
      >
        <div class="abs-grid">
          ${slots.map((s) => {
            const pos = this._layout?.slots?.[s.key];
            const tx = pos ? pos.x : (c.position === "bottom-right" ? -1 : 1) * (s.col * fallbackStep);
            const ty = pos ? pos.y : (-s.row * fallbackStep);

            const ctx = s.area === "v" ? "v" : (s.area === "h" ? "h" : "base");

            return html`
              <div class="abs-slot" data-slot-id="${s.key}" style="transform: translate(${tx}px, ${ty}px);">
                ${this._renderButton(s.btn, ctx)}
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
        height: 0;
        min-height: 0;
        overflow: visible;
      }

      .fab-anchor {
        position: fixed;
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

      .center-wrap {
        pointer-events: none;
        display: flex;
        align-items: center;
        gap: var(--hki-gap);
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

        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
        filter: saturate(1.05);
        touch-action: manipulation;
      }

      .fab:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.42);
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
        min-width: var(--hki-size);
        padding: 0 calc(var(--hki-size) * 0.32);
        gap: calc(var(--hki-size) * 0.14);
        justify-content: center;
        border-radius: 999px;
      }

      .pill-fixed {
        padding: 0 calc(var(--hki-size) * 0.24);
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
      _demo: { state: true },
    };
  }

  constructor() {
    super();
    this._expanded = {};
    this._yamlErrors = {};
    this._demo = false;
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

  _anyButtonHasOverride(keyPath) {
    const c = this._c;
    const all = [
      ...(c.horizontal.buttons || []),
      ...(c.vertical.buttons || []),
      c.base?.button,
    ].filter(Boolean);

    const get = (btn) => {
      if (keyPath.startsWith("label_style.")) {
        const k = keyPath.split(".")[1];
        return btn.label_style?.[k];
      }
      if (keyPath === "pill_width") return btn.pill_width;
      if (keyPath === "background") return btn.background;
      if (keyPath === "background_opacity") return btn.background_opacity;
      if (keyPath === "icon_color") return btn.icon_color;
      return undefined;
    };

    return all.some((b) => {
      const v = get(b);
      if (v === undefined || v === null) return false;
      if (typeof v === "string") return v.trim() !== "";
      return true;
    });
  }

  _clearOverridesEverywhere(keyPath) {
    const cfg = deepClone(this._c);

    const clearOnBtn = (btn) => {
      const b = { ...btn };
      if (keyPath.startsWith("label_style.")) {
        const k = keyPath.split(".")[1];
        const ls = { ...(b.label_style || {}) };
        delete ls[k];
        b.label_style = ls;
        return b;
      }
      if (keyPath === "pill_width") {
        b.pill_width = "";
        return b;
      }
      if (keyPath === "background") {
        b.background = "";
        return b;
      }
      if (keyPath === "background_opacity") {
        b.background_opacity = "";
        return b;
      }
      if (keyPath === "icon_color") {
        b.icon_color = "";
        return b;
      }
      return b;
    };

    cfg.horizontal.buttons = (cfg.horizontal.buttons || []).map(clearOnBtn);
    cfg.vertical.buttons = (cfg.vertical.buttons || []).map(clearOnBtn);

    // base included (even though it has no conditions; can still have label overrides)
    cfg.base.button = clearOnBtn(cfg.base.button);

    this._emit(cfg);
  }

  _maybeAskOverrideAndApply(keyPath, applyFn) {
    const has = this._anyButtonHasOverride(keyPath);
    applyFn();
    if (!has) return;

    const ok = window.confirm(
      "You changed a global setting.\n\nDo you want to clear per-button overrides for this setting so all buttons inherit the new global value?"
    );
    if (ok) this._clearOverridesEverywhere(keyPath);
  }

  _setValue(key, value) {
    const cfg = deepClone(this._c);
    cfg[key] = value;
    this._emit(cfg);
  }

  _setNum(key, value) {
    const cfg = deepClone(this._c);
    cfg[key] = Number(value);
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
    this._maybeAskOverrideAndApply(`label_style.${key}`, () => {
      const cfg = deepClone(this._c);
      cfg.label_style = cfg.label_style || {};
      cfg.label_style[key] = value;
      this._emit(cfg);
    });
  }

  _setDefaultBackground(value) {
    this._maybeAskOverrideAndApply("background", () => {
      const cfg = deepClone(this._c);
      cfg.default_background = value;
      this._emit(cfg);
    });
  }

  _setDefaultIconColor(value) {
    this._maybeAskOverrideAndApply("icon_color", () => {
      const cfg = deepClone(this._c);
      cfg.default_icon_color = value;
      this._emit(cfg);
    });
  }

  _setDefaultButtonOpacity(value) {
    this._maybeAskOverrideAndApply("background_opacity", () => {
      const cfg = deepClone(this._c);
      cfg.default_button_opacity = Math.max(0, Math.min(1, Number(value)));
      this._emit(cfg);
    });
  }

  _setGlobalPillWidth(value) {
    this._maybeAskOverrideAndApply("pill_width", () => {
      const cfg = deepClone(this._c);
      cfg.pill_width = Number(value);
      this._emit(cfg);
    });
  }

  _listKey(group) {
    return group === "vertical" ? "vertical" : "horizontal";
  }

  _getButtons(group) {
    const g = this._listKey(group);
    return (this._c[g]?.buttons || []);
  }

  _setButtons(group, nextButtons) {
    const cfg = deepClone(this._c);
    const g = this._listKey(group);
    cfg[g].buttons = nextButtons;
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
    if (customElements.get("ha-entity-picker")) {
      return html`
        <ha-entity-picker
          .hass=${this.hass}
          .label=${label}
          .value=${value || ""}
          allow-custom-entity
          @value-changed=${(e) => onChange(e.detail?.value ?? e.target?.value ?? "")}
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

    if (customElements.get("ha-code-editor")) {
      return html`
        <div class="code-wrap">
          <div class="code-label">${label}</div>
          <ha-code-editor
            .mode=${"yaml"}
            .value=${value || ""}
            @value-changed=${(e) => {
              const v = e.detail?.value ?? e.target?.value ?? "";
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

  _autoSetBackIcon(btn, setBtnFn) {
    const tap = btn?.tap_action?.action;
    if (tap !== "back") return;

    const icon = safeString(btn.icon).trim();
    // only auto-set if empty or default-ish
    if (icon === "" || icon === "mdi:circle" || icon === "mdi:home-outline") {
      setBtnFn({ ...btn, icon: "mdi:chevron-left" });
    }
  }

  _renderActionEditor(btn, setBtnFn, which, title, errorKeyPrefix) {
    const act = btn?.[which] || { action: "none" };
    const type = act.action || "none";
    const errorKey = `${errorKeyPrefix}:${which}`;

    const update = (patch) => {
      const current = btn?.[which] || { action: "none" };
      const next = { ...btn, [which]: { ...current, ...patch } };
      setBtnFn(next);

      // auto icon for back on tap_action
      if (which === "tap_action" && patch.action === "back") {
        // update icon unless already custom
        const icon = safeString(next.icon).trim();
        if (icon === "" || icon === "mdi:circle") {
          setBtnFn({ ...next, icon: "mdi:chevron-left" });
        }
      }
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
          ? html`
              <ha-textfield
                .label=${"Navigation path"}
                .value=${act.navigation_path || ""}
                placeholder="/lovelace/0"
                @change=${(e) => update({ navigation_path: e.target.value })}
              ></ha-textfield>
            `
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

              ${this._renderCodeEditor("Service data (YAML)", act.service_data || "", (v) => {
                update({ service_data: v });
              }, errorKey)}
            `
          : html``}

        ${type === "toggle" || type === "more-info"
          ? html`<div class="hint">Uses the button’s <b>Entity</b> field.</div>`
          : html``}

        ${type === "back"
          ? html`<div class="hint">Goes back using browser history. (Icon auto-sets to mdi:chevron-left on Tap)</div>`
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
      safeString(s)
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

    const csvString = (arr) => (Array.isArray(arr) ? arr.join(", ") : "");

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
                        ${ENTITY_OPERATORS.map(
                          (o) => html`<mwc-list-item .value=${o.value}>${o.label}</mwc-list-item>`
                        )}
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
                    <div class="hint">Matches the logged-in Home Assistant user’s display name.</div>
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
                    <div class="hint">Matches the current URL path. Suffix matches also work.</div>
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
                    <div class="hint">Mobile is detected using max-width: 800px.</div>
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
      if (v && BUTTON_TYPES.some((t) => t.value === v)) return v;
      return INHERIT;
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

      ${pillTypeSelected
        ? html`
            <div class="grid2">
              <ha-textfield
                type="number"
                .label=${"Pill width override (px) — blank = inherit global / auto"}
                .value=${btn.pill_width ?? ""}
                @change=${(e) => setBtnFn({ ...btn, pill_width: e.target.value })}
              ></ha-textfield>
              <div class="hint">
                Fixed width prevents pill overlap and keeps buttons aligned. Long labels will truncate.
              </div>
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
            const next =
              e.detail?.value ??
              e.detail?.expanded ??
              e.target?.expanded ??
              false;
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
            ${this._renderButtonPanel(btn, setBtn, "base", /* allowConditions */ false)}
          </div>
        </ha-expansion-panel>
      </div>
    `;
  }

  _renderGroup(group) {
    const c = this._c;
    const gKey = group === "vertical" ? "vertical" : "horizontal";
    const enabled = !!c[gKey].enabled;
    const buttons = this._getButtons(group);

    const centerHidden =
      c.position === "bottom-center" && group === "vertical";

    const tip = html`
      <ha-alert alert-type="info">
        Tip: If you disable this group, you can still configure its buttons and open it temporarily using the
        <b>Show/Hide Group</b> action. It auto-closes after a button is pressed.
      </ha-alert>
    `;

    const centerWarn = centerHidden
      ? html`<ha-alert alert-type="warning">
          Vertical group is <b>always hidden</b> when Position is <b>Bottom center</b>.
          You can still configure it, but it won’t be displayed.
        </ha-alert>`
      : html``;

    return html`
      <div class="section">
        <div class="section-title row">
          <span>${group === "vertical" ? "Vertical group" : "Horizontal group"}</span>
          <mwc-button @click=${() => this._addButton(group)} outlined>
            <ha-icon icon="mdi:plus"></ha-icon>&nbsp;Add button
          </mwc-button>
        </div>

        ${tip}
        ${centerWarn}

        <div class="grid2">
          <ha-formfield .label=${"Enabled"}>
            <ha-switch
              .checked=${!!enabled}
              @change=${(e) => this._setBool(`${gKey}.enabled`, e.target.checked)}
            ></ha-switch>
          </ha-formfield>

          ${group === "horizontal"
            ? html`
                <ha-textfield
                  type="number"
                  .label=${"Columns"}
                  .value=${String(c.horizontal.columns)}
                  @change=${(e) => {
                    const cfg = deepClone(this._c);
                    cfg.horizontal.columns = Math.max(1, Number(e.target.value));
                    this._emit(cfg);
                  }}
                ></ha-textfield>
              `
            : html`
                <ha-textfield
                  type="number"
                  .label=${"Rows"}
                  .value=${String(c.vertical.rows)}
                  @change=${(e) => {
                    const cfg = deepClone(this._c);
                    cfg.vertical.rows = Math.max(1, Number(e.target.value));
                    this._emit(cfg);
                  }}
                ></ha-textfield>
              `}
        </div>

        ${buttons.length === 0
          ? html`<div class="empty">No buttons yet — click “Add button”.</div>`
          : html``}

        ${buttons.map((btn, idx) => {
          const btnId = btn.id || "no_id";
          const key = `${group}:${btnId}`;
          const title = btn.label || btn.tooltip || `Button`;
          const expanded = !!this._expanded[key];

          const setBtn = (nextBtn) => this._setButtonById(group, btnId, nextBtn);

          return html`
            <ha-expansion-panel
              .expanded=${expanded}
              @expanded-changed=${(e) => {
                const next =
                  e.detail?.value ??
                  e.detail?.expanded ??
                  e.target?.expanded ??
                  false;
                this._expanded[key] = !!next;
                this.requestUpdate();
              }}
            >
              <div slot="header" class="btn-header">
                <ha-icon .icon=${btn.icon || "mdi:circle"}></ha-icon>
                <div class="btn-header-text">
                  <div class="btn-title">${title}</div>
                  <div class="btn-sub">${btn.icon || ""}${btn.entity ? ` • ${btn.entity}` : ""}</div>
                </div>
                <div class="btn-actions">
                  <mwc-icon-button
                    title="Move up"
                    ?disabled=${idx === 0}
                    @click=${(e) => {
                      e.stopPropagation();
                      this._moveButtonById(group, btnId, -1);
                    }}
                  >
                    <ha-icon icon="mdi:chevron-up"></ha-icon>
                  </mwc-icon-button>

                  <mwc-icon-button
                    title="Move down"
                    ?disabled=${idx === buttons.length - 1}
                    @click=${(e) => {
                      e.stopPropagation();
                      this._moveButtonById(group, btnId, 1);
                    }}
                  >
                    <ha-icon icon="mdi:chevron-down"></ha-icon>
                  </mwc-icon-button>

                  <mwc-icon-button
                    title="Delete"
                    @click=${(e) => {
                      e.stopPropagation();
                      this._removeButtonById(group, btnId);
                    }}
                  >
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
      </div>
    `;
  }

  _renderDemoPreview() {
    if (!this._demo) return html``;

    const c = this._c;
    const base = c.base.button;
    const h = (c.horizontal.buttons || []).slice(0, 5);
    const v = (c.vertical.buttons || []).slice(0, 5);

    const pos = c.position;
    const center = pos === "bottom-center";
    const showV = !center;

    const label = `Preview (${pos}${center && c.center_spread ? ", spread" : ""})`;

    // Minimal preview (not interactive)
    const size = Math.max(36, clampNum(c.button_size, 50));
    const gap = Math.max(0, clampNum(c.gap, 12));

    return html`
      <div class="section">
        <div class="section-title">${label}</div>
        <div class="preview-stage" style="--psize:${size}px; --pgap:${gap}px;">
          <div class="preview-anchor ${pos} ${center && c.center_spread ? "spread" : ""}">
            <div class="preview-row">
              ${this._previewBtn(base)}
              ${h.map((b) => this._previewBtn(b))}
            </div>
            ${showV ? html`
              <div class="preview-col">
                ${v.map((b) => this._previewBtn(b))}
              </div>
            ` : html``}
          </div>
        </div>
        <div class="hint">This is a visual preview only (not clickable).</div>
      </div>
    `;
  }

  _previewBtn(btn) {
    const type = btn.button_type || this._c.default_button_type;
    const isPill = type === "pill" || type === "pill_label";
    const bg = btn.background || this._c.default_background || "var(--accent-color, var(--primary-color))";
    const opacity = _hasMeaningfulNumber(btn.background_opacity) ? clamp01(_toNumber(btn.background_opacity)) : clamp01(this._c.default_button_opacity);
    const bg2 = applyBgOpacity(bg, opacity);
    const color = btn.icon_color || this._c.default_icon_color || "var(--text-primary-color, var(--primary-text-color))";

    const icon = safeString(btn.icon).trim() || "mdi:circle";
    const label = btn.label || btn.tooltip || "";

    return html`
      <div class="pbtn ${isPill ? "pill" : ""}" style="background:${bg2}; color:${color};">
        <ha-icon class="picon" .icon=${icon}></ha-icon>
        ${isPill && label ? html`<span class="plabel">${label}</span>` : html``}
      </div>
    `;
  }

  render() {
    if (!this.hass || !this._config) return html``;

    const c = this._c;
    const showCenterOptions = c.position === "bottom-center";
    const showPillWidthGlobal = c.default_button_type === "pill" || c.default_button_type === "pill_label";

    return html`
      <div class="editor">
        <ha-alert alert-type="warning" class="doc">
          <div class="doc-title">Warning</div>
          <div>
            This card uses fixed positions on the sections dashboard. If you need to edit it, remember where you have
            placed this card so that you can find the edit button as it will stay on the location where you have put it.
            It will be a transparent bar with an edit symbol which can be hard to find.<br><br>
            It is recommended to put this either as first or as last card on your dashboard so you won't forget where the card is.<br><br>
            Please read the documentation at github.com/jimz011/hki-navigation-card to set up this card.<br><br>
            This card may contain bugs. Use at your own risk!
          </div>
        </ha-alert>

        <div class="section">
          <div class="section-title row">
            <span>Editor</span>
            <ha-formfield .label=${"Demo mode (preview)"}>
              <ha-switch
                .checked=${!!this._demo}
                @change=${(e) => { this._demo = e.target.checked; }}
              ></ha-switch>
            </ha-formfield>
          </div>
          ${this._renderDemoPreview()}
        </div>

        <div class="section">
          <div class="section-title">Layout</div>

          <div class="grid2">
            <ha-select
              .label=${"Position"}
              .value=${c.position}
              @selected=${(e) => this._setValue("position", e.target.value)}
              @closed=${(e) => e.stopPropagation()}
            >
              <mwc-list-item value="bottom-left">Bottom left</mwc-list-item>
              <mwc-list-item value="bottom-center">Bottom center</mwc-list-item>
              <mwc-list-item value="bottom-right">Bottom right</mwc-list-item>
            </ha-select>

            <ha-textfield
              type="number"
              .label=${"Offset X (px)"}
              .value=${String(c.offset_x)}
              @change=${(e) => this._setValue("offset_x", Number(e.target.value))}
            ></ha-textfield>

            <ha-textfield
              type="number"
              .label=${"Offset Y (px)"}
              .value=${String(c.offset_y)}
              @change=${(e) => this._setValue("offset_y", Number(e.target.value))}
            ></ha-textfield>

            <ha-textfield
              type="number"
              .label=${"Button size (px)"}
              .value=${String(c.button_size)}
              @change=${(e) => this._setValue("button_size", Number(e.target.value))}
            ></ha-textfield>

            <ha-textfield
              type="number"
              .label=${"Gap (px)"}
              .value=${String(c.gap)}
              @change=${(e) => this._setValue("gap", Number(e.target.value))}
            ></ha-textfield>

            <ha-textfield
              type="number"
              .label=${"Z-index"}
              .value=${String(c.z_index)}
              @change=${(e) => this._setValue("z_index", Number(e.target.value))}
            ></ha-textfield>
          </div>

          ${showCenterOptions
            ? html`
                <div class="subsection">
                  <div class="subheader">Center options</div>
                  <div class="grid2">
                    <ha-formfield .label=${"Spread buttons across width"}>
                      <ha-switch
                        .checked=${!!c.center_spread}
                        @change=${(e) => this._setValue("center_spread", e.target.checked)}
                      ></ha-switch>
                    </ha-formfield>
                    <div class="hint">
                      When enabled, the base + horizontal buttons spread across the full width.
                    </div>
                  </div>
                </div>
              `
            : html``}

          <div class="subsection">
            <div class="subheader">Sidebar offset</div>
            <div class="grid2">
              <ha-select
                .label=${"Sidebar offset mode"}
                .value=${c.sidebar_offset_mode}
                @selected=${(e) => this._setValue("sidebar_offset_mode", e.target.value)}
                @closed=${(e) => e.stopPropagation()}
              >
                <mwc-list-item value="auto">Auto</mwc-list-item>
                <mwc-list-item value="manual">Manual</mwc-list-item>
              </ha-select>

              ${c.sidebar_offset_mode === "manual" && c.position === "bottom-left"
                ? html`
                    <ha-textfield
                      type="number"
                      .label=${"Offset X when sidebar closed"}
                      .value=${String(c.offset_x_sidebar_closed_left)}
                      @change=${(e) => this._setValue("offset_x_sidebar_closed_left", Number(e.target.value))}
                    ></ha-textfield>

                    <ha-textfield
                      type="number"
                      .label=${"Offset X when sidebar open"}
                      .value=${String(c.offset_x_sidebar_open_left)}
                      @change=${(e) => this._setValue("offset_x_sidebar_open_left", Number(e.target.value))}
                    ></ha-textfield>
                  `
                : html``}

              ${c.sidebar_offset_mode === "manual" && c.position === "bottom-right"
                ? html`
                    <ha-textfield
                      type="number"
                      .label=${"Offset X when sidebar closed"}
                      .value=${String(c.offset_x_sidebar_closed)}
                      @change=${(e) => this._setValue("offset_x_sidebar_closed", Number(e.target.value))}
                    ></ha-textfield>

                    <ha-textfield
                      type="number"
                      .label=${"Offset X when sidebar open"}
                      .value=${String(c.offset_x_sidebar_open)}
                      @change=${(e) => this._setValue("offset_x_sidebar_open", Number(e.target.value))}
                    ></ha-textfield>
                  `
                : html``}

              ${c.sidebar_offset_mode === "auto"
                ? html`<div class="hint">Auto shifts Bottom-left buttons away from the sidebar when it’s open.</div>`
                : html``}
            </div>
          </div>

          <div class="subsection">
            <div class="subheader">Defaults</div>
            <div class="grid2">
              <ha-select
                .label=${"Default Button Type"}
                .value=${c.default_button_type}
                @selected=${(e) => this._setValue("default_button_type", e.target.value)}
                @closed=${(e) => e.stopPropagation()}
              >
                ${BUTTON_TYPES.map((t) => html`<mwc-list-item .value=${t.value}>${t.label}</mwc-list-item>`)}
              </ha-select>

              ${showPillWidthGlobal
                ? html`
                    <ha-textfield
                      type="number"
                      .label=${"Global pill width (px) — 0 = auto"}
                      .value=${String(c.pill_width || 0)}
                      @change=${(e) => this._setGlobalPillWidth(Number(e.target.value))}
                    ></ha-textfield>
                  `
                : html`<div class="hint">Global pill width appears when Default Button Type is a pill type.</div>`}

              <ha-textfield
                .label=${"Default background (optional override)"}
                .value=${c.default_background || ""}
                placeholder="(blank = theme accent/primary)"
                @change=${(e) => this._setDefaultBackground(e.target.value)}
              ></ha-textfield>

              <ha-textfield
                type="number"
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
              <ha-textfield
                type="number"
                .label=${"Font size (px)"}
                .value=${String(c.label_style?.font_size ?? DEFAULT_LABEL_STYLE.font_size)}
                @change=${(e) => this._setLabelStyleGlobal("font_size", Number(e.target.value))}
              ></ha-textfield>

              <ha-select
                .label=${"Font weight"}
                .value=${String(c.label_style?.font_weight ?? DEFAULT_LABEL_STYLE.font_weight)}
                @selected=${(e) => this._setLabelStyleGlobal("font_weight", Number(e.target.value))}
                @closed=${(e) => e.stopPropagation()}
              >
                ${FONT_WEIGHTS.map((fw) => html`<mwc-list-item .value=${String(fw.value)}>${fw.label}</mwc-list-item>`)}
              </ha-select>

              <ha-textfield
                type="number"
                .label=${"Letter spacing (px)"}
                .value=${String(c.label_style?.letter_spacing ?? DEFAULT_LABEL_STYLE.letter_spacing)}
                @change=${(e) => this._setLabelStyleGlobal("letter_spacing", Number(e.target.value))}
              ></ha-textfield>

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

              <ha-textfield
                .label=${"Text color (optional)"}
                .value=${c.label_style?.color ?? ""}
                placeholder="(blank = theme/currentColor)"
                @change=${(e) => this._setLabelStyleGlobal("color", e.target.value)}
              ></ha-textfield>

              <ha-textfield
                .label=${"Label background (optional)"}
                .value=${c.label_style?.background ?? ""}
                placeholder="(blank = theme card rgba)"
                @change=${(e) => this._setLabelStyleGlobal("background", e.target.value)}
              ></ha-textfield>

              <ha-textfield
                type="number"
                .label=${"Label background opacity"}
                .value=${String(c.label_style?.background_opacity ?? DEFAULT_LABEL_STYLE.background_opacity)}
                @change=${(e) => this._setLabelStyleGlobal("background_opacity", Number(e.target.value))}
              ></ha-textfield>
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
      .editor {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .doc {
        border-radius: 14px;
      }
      .doc-title {
        font-weight: 800;
        margin-bottom: 8px;
      }

      .section {
        padding: 14px;
        border-radius: 14px;
        background: var(--card-background-color);
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .section-title {
        font-weight: 800;
        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: space-between;
      }

      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .grid2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .empty {
        opacity: 0.7;
        padding: 8px 2px;
      }

      ha-expansion-panel {
        border-radius: 14px;
        overflow: hidden;
        margin-top: 10px;
        background: rgba(0, 0, 0, 0.06);
      }

      .btn-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding-right: 8px;
      }

      .btn-header-text {
        flex: 1;
        min-width: 0;
      }

      .btn-title {
        font-weight: 800;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .btn-sub {
        opacity: 0.75;
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .btn-actions {
        display: flex;
        align-items: center;
        gap: 2px;
      }

      .panel {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .subsection {
        margin-top: 6px;
        padding-top: 10px;
        border-top: 1px solid rgba(0, 0, 0, 0.14);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .subheader {
        font-weight: 800;
        opacity: 0.9;
      }

      .hint {
        font-size: 12px;
        opacity: 0.7;
      }

      .cond {
        border-radius: 12px;
        padding: 10px;
        background: rgba(0, 0, 0, 0.06);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .cond-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .cond-title {
        font-weight: 700;
        font-size: 12px;
        opacity: 0.9;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .code-wrap {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .code-label {
        font-weight: 700;
        opacity: 0.85;
      }
      ha-code-editor {
        border-radius: 12px;
        overflow: hidden;
      }

      /* Demo preview */
      .preview-stage {
        height: 190px;
        border-radius: 14px;
        border: 1px dashed rgba(255,255,255,0.2);
        background: rgba(0,0,0,0.25);
        position: relative;
        overflow: hidden;
      }

      .preview-anchor {
        position: absolute;
        bottom: 16px;
        pointer-events: none;
      }

      .preview-anchor.bottom-left { left: 16px; }
      .preview-anchor.bottom-right { right: 16px; }
      .preview-anchor.bottom-center { left: 50%; transform: translateX(-50%); }
      .preview-anchor.bottom-center.spread { left: 16px; right: 16px; transform: none; }

      .preview-row {
        display: flex;
        align-items: center;
        gap: var(--pgap);
      }

      .preview-col {
        display: flex;
        flex-direction: column;
        gap: var(--pgap);
        margin-top: var(--pgap);
      }

      .pbtn {
        width: var(--psize);
        height: var(--psize);
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 0 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.35);
      }
      .pbtn.pill { width: auto; }
      .picon {
        --mdc-icon-size: calc(var(--psize) * 0.48);
      }
      .plabel {
        font-weight: 700;
        white-space: nowrap;
        max-width: 160px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      @media (max-width: 640px) {
        .grid2 {
          grid-template-columns: 1fr;
        }
      }
    `;
  }
}

customElements.define(CARD_TAG, HkiNavigationCard);
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
        button_type: "icon",
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
        button_type: "icon_label_left",
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
});
