// HKI Navigation Card

// Global Cache for LitElement to avoid repeated lookups
let _litCache = null;
const _getLit = () => {
  if (_litCache) return _litCache;
  const base =
    customElements.get("hui-masonry-view") ||
    customElements.get("ha-panel-lovelace") ||
    customElements.get("ha-app");
  const LitElement = base ? Object.getPrototypeOf(base) : window.LitElement;
  const html = LitElement?.prototype?.html || window.html;
  const css = LitElement?.prototype?.css || window.css;
  _litCache = { LitElement, html, css };
  return _litCache;
};

const { LitElement, html, css } = _getLit();

const CARD_TYPE = "hki-navigation-card";
const VERSION = "1.2.0"; // Added action cleanup, minimal config, validation, better nesting, auto-migration

console.info(
    '%c HKI-NAVIGATION-CARD %c v' + VERSION + ' ',
    'color: white; background: #2e7d32; font-weight: bold;',
    'color: #2e7d32; background: white; font-weight: bold;'
);

const CARD_TAG = "hki-navigation-card";
const EDITOR_TAG = "hki-navigation-card-editor";

const INHERIT = "__inherit__";
const MIN_PILL_WIDTH = 85;

// Static Constants
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
  { value: "perform-action", label: "Perform action" },
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

// Utilities
const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

function _uid() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `id_${Date.now()}_${(Math.random() * 1e9) >>> 0}`;
}

function safeString(v) {
  return (v === null || v === undefined) ? "" : String(v);
}

function deepClone(obj) {
  return obj ? JSON.parse(JSON.stringify(obj)) : obj;
}

// Simplified hash (djb2) + cache key for template result caching
function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(16);
}

function cacheKey(raw, vars) {
  return `hkiTpl:${hashStr(raw + (vars ? JSON.stringify(vars) : ""))}`;
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
      cancelable: options.cancelable ?? false,
    })
  );
}

// Action conflict mapping - when one action is set, these should be removed
const ACTION_CONFLICTS = {
  navigate: ['url', 'url_path', 'entity', 'service', 'data', 'target', 'mode'],
  url: ['navigation_path', 'entity', 'service', 'data', 'target', 'mode'],
  toggle: ['navigation_path', 'url', 'url_path', 'service', 'data', 'target', 'mode'],
  'more-info': ['navigation_path', 'url', 'url_path', 'service', 'data', 'target', 'mode'],
  'perform-action': ['navigation_path', 'url', 'url_path', 'entity', 'mode', 'target'],
  'toggle-group': ['navigation_path', 'url', 'url_path', 'entity', 'service', 'data'],
  back: ['navigation_path', 'url', 'url_path', 'entity', 'service', 'data', 'target', 'mode'],
  none: ['navigation_path', 'url', 'url_path', 'entity', 'service', 'data', 'target', 'mode'],
};

// Helper to cleanup conflicting action properties
function cleanupActionConflicts(actionObj) {
  if (!actionObj || !actionObj.action) return actionObj;
  
  const conflicts = ACTION_CONFLICTS[actionObj.action];
  if (!conflicts) return actionObj;
  
  const cleaned = { ...actionObj };
  conflicts.forEach(key => {
    if (key in cleaned) {
      delete cleaned[key];
    }
  });
  
  return cleaned;
}

// Helper to remove default values from config
function removeDefaults(obj, defaults) {
  if (!obj || !defaults) return obj;
  
  const cleaned = {};
  for (const key in obj) {
    const value = obj[key];
    const defaultValue = defaults[key];
    
    // Skip if value matches default
    if (JSON.stringify(value) === JSON.stringify(defaultValue)) {
      continue;
    }
    
    // Recursively clean nested objects
    if (value && typeof value === 'object' && !Array.isArray(value) && defaultValue && typeof defaultValue === 'object') {
      const cleanedNested = removeDefaults(value, defaultValue);
      if (Object.keys(cleanedNested).length > 0) {
        cleaned[key] = cleanedNested;
      }
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

// Helper to migrate old flat config to new nested structure
function migrateConfig(config) {
  if (!config) return config;
  
  const migrated = { ...config };
  
  // Migrate bottom bar styles to nested structure
  if (migrated.bottom_bar_background || migrated.bottom_bar_border_radius !== undefined || 
      migrated.bottom_bar_height !== undefined || migrated.bottom_bar_gap !== undefined ||
      migrated.bottom_bar_padding_x !== undefined || migrated.bottom_bar_padding_y !== undefined) {
    
    if (!migrated.bottom_bar) migrated.bottom_bar = {};
    
    if (migrated.bottom_bar_background !== undefined) {
      migrated.bottom_bar.background = migrated.bottom_bar_background;
      delete migrated.bottom_bar_background;
    }
    if (migrated.bottom_bar_border_radius !== undefined) {
      migrated.bottom_bar.border_radius = migrated.bottom_bar_border_radius;
      delete migrated.bottom_bar_border_radius;
    }
    if (migrated.bottom_bar_height !== undefined) {
      migrated.bottom_bar.height = migrated.bottom_bar_height;
      delete migrated.bottom_bar_height;
    }
    if (migrated.bottom_bar_gap !== undefined) {
      migrated.bottom_bar.gap = migrated.bottom_bar_gap;
      delete migrated.bottom_bar_gap;
    }
    if (migrated.bottom_bar_padding_x !== undefined) {
      migrated.bottom_bar.padding_x = migrated.bottom_bar_padding_x;
      delete migrated.bottom_bar_padding_x;
    }
    if (migrated.bottom_bar_padding_y !== undefined) {
      migrated.bottom_bar.padding_y = migrated.bottom_bar_padding_y;
      delete migrated.bottom_bar_padding_y;
    }
  }
  
  // Migrate button default styles to nested structure
  const styleKeys = ['default_button_background', 'default_button_background_opacity', 'default_icon_color',
                     'default_border_radius', 'default_border_width', 'default_border_style', 'default_border_color'];
  
  const hasStyleKeys = styleKeys.some(key => migrated[key] !== undefined);
  
  if (hasStyleKeys) {
    if (!migrated.button_defaults) migrated.button_defaults = {};
    if (!migrated.button_defaults.style) migrated.button_defaults.style = {};
    
    if (migrated.default_button_background !== undefined) {
      migrated.button_defaults.style.background = migrated.default_button_background;
      delete migrated.default_button_background;
    }
    if (migrated.default_button_background_opacity !== undefined) {
      migrated.button_defaults.style.background_opacity = migrated.default_button_background_opacity;
      delete migrated.default_button_background_opacity;
    }
    if (migrated.default_icon_color !== undefined) {
      migrated.button_defaults.style.icon_color = migrated.default_icon_color;
      delete migrated.default_icon_color;
    }
    if (migrated.default_border_radius !== undefined) {
      migrated.button_defaults.style.border_radius = migrated.default_border_radius;
      delete migrated.default_border_radius;
    }
    if (migrated.default_border_width !== undefined) {
      migrated.button_defaults.style.border_width = migrated.default_border_width;
      delete migrated.default_border_width;
    }
    if (migrated.default_border_style !== undefined) {
      migrated.button_defaults.style.border_style = migrated.default_border_style;
      delete migrated.default_border_style;
    }
    if (migrated.default_border_color !== undefined) {
      migrated.button_defaults.style.border_color = migrated.default_border_color;
      delete migrated.default_border_color;
    }
  }
  
  // Migrate label_style if it exists at top level (should be in button_defaults.label)
  if (migrated.label_style && !migrated.button_defaults?.label) {
    if (!migrated.button_defaults) migrated.button_defaults = {};
    migrated.button_defaults.label = migrated.label_style;
    delete migrated.label_style;
  }
  
  return migrated;
}

// Helper to clean up config - remove duplicates and unused properties
function cleanupConfig(config) {
  if (!config) return config;
  
  const cleaned = deepClone(config);
  
  // Clean up button actions
  const cleanButtons = (buttons) => {
    if (!Array.isArray(buttons)) return buttons;
    return buttons.map(btn => {
      const cleanedBtn = { ...btn };
      
      // Clean up tap_action
      if (cleanedBtn.tap_action) {
        cleanedBtn.tap_action = cleanupActionConflicts(cleanedBtn.tap_action);
      }
      
      // Clean up hold_action
      if (cleanedBtn.hold_action) {
        cleanedBtn.hold_action = cleanupActionConflicts(cleanedBtn.hold_action);
      }
      
      // Clean up double_tap_action
      if (cleanedBtn.double_tap_action) {
        cleanedBtn.double_tap_action = cleanupActionConflicts(cleanedBtn.double_tap_action);
      }
      
      return cleanedBtn;
    });
  };
  
  // Clean base button
  if (cleaned.base?.button) {
    const btn = cleaned.base.button;
    if (btn.tap_action) btn.tap_action = cleanupActionConflicts(btn.tap_action);
    if (btn.hold_action) btn.hold_action = cleanupActionConflicts(btn.hold_action);
    if (btn.double_tap_action) btn.double_tap_action = cleanupActionConflicts(btn.double_tap_action);
  }
  
  // Clean horizontal buttons
  if (cleaned.horizontal?.buttons) {
    cleaned.horizontal.buttons = cleanButtons(cleaned.horizontal.buttons);
  }
  
  // Clean vertical buttons
  if (cleaned.vertical?.buttons) {
    cleaned.vertical.buttons = cleanButtons(cleaned.vertical.buttons);
  }
  
  return cleaned;
}

const DEFAULTS = {
  bottom_bar: {
    background: "",
    border_radius: 0,
    height: 64,
    gap: 6,
    padding_x: 8,
    padding_y: 8,
  },
  button_defaults: {
    style: {
      background: "",
      background_opacity: 0.12,
      icon_color: "",
      border_radius: 999,
      border_width: 0,
      border_style: "solid",
      border_color: "",
    },
    label: {
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
    },
  },
  base: {
    enabled: true,
    button: null,
  },
  horizontal: {
    enabled: true,
    columns: 6,
    buttons: [],
  },
  vertical: {
    enabled: false,
    rows: 6,
    buttons: [],
  },
};

function DEFAULT_BUTTON() {
  return {
    uid: _uid(),
    icon: "",
    label: "",
    tooltip: "",
    entity: "",
    button_type: "icon",
    tap_action: { action: "none" },
    hold_action: { action: "none" },
    double_tap_action: { action: "none" },
    conditions: [],
  };
}

// Template Rendering
async function renderTemplate(hass, raw, vars = {}) {
  if (!raw || typeof raw !== "string") return safeString(raw);
  
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{{") && !trimmed.startsWith("{%")) {
    return trimmed;
  }
  
  const key = cacheKey(raw, vars);
  const cached = sessionStorage.getItem(key);
  if (cached !== null) return cached;
  
  try {
    const resp = await hass.callWS({
      type: "render_template",
      template: raw,
      variables: vars,
      strict: false,
    });
    const result = safeString(resp);
    sessionStorage.setItem(key, result);
    return result;
  } catch {
    return trimmed;
  }
}

// Condition Evaluation
function evaluateConditions(conditions, hass, panel, entityId) {
  if (!conditions || !Array.isArray(conditions) || conditions.length === 0) return true;
  
  for (const cond of conditions) {
    if (!cond.type) continue;
    
    if (cond.type === "entity") {
      if (!cond.entity || !hass.states[cond.entity]) continue;
      const state = hass.states[cond.entity];
      const stateVal = state.state;
      const operator = cond.operator || "equals";
      const expected = cond.state_value || "";
      
      if (operator === "equals" && stateVal !== expected) return false;
      if (operator === "not_equals" && stateVal === expected) return false;
      if (operator === "above") {
        const num = parseFloat(stateVal);
        const exp = parseFloat(expected);
        if (isNaN(num) || isNaN(exp) || num <= exp) return false;
      }
      if (operator === "below") {
        const num = parseFloat(stateVal);
        const exp = parseFloat(expected);
        if (isNaN(num) || isNaN(exp) || num >= exp) return false;
      }
      if (operator === "includes" && !stateVal.includes(expected)) return false;
      if (operator === "not_includes" && stateVal.includes(expected)) return false;
      if (operator === "exists" && !hass.states[cond.entity]) return false;
      if (operator === "not_exists" && hass.states[cond.entity]) return false;
    }
    
    if (cond.type === "user") {
      if (!cond.users || !Array.isArray(cond.users) || cond.users.length === 0) continue;
      const currentUser = hass.user?.name || hass.user?.id || "";
      if (!cond.users.includes(currentUser)) return false;
    }
    
    if (cond.type === "view") {
      if (!cond.views || !Array.isArray(cond.views) || cond.views.length === 0) continue;
      const currentView = panel?.config?.path || window.location.pathname.split("/").pop() || "";
      if (!cond.views.some(v => currentView.includes(v))) return false;
    }
    
    if (cond.type === "screen") {
      const mediaQuery = cond.media_query || "";
      if (mediaQuery && !window.matchMedia(mediaQuery).matches) return false;
    }
  }
  
  return true;
}

// Action Handler
function handleAction(card, action, entityId) {
  if (!action || action.action === "none") return;
  
  const hass = card._hass;
  if (!hass) return;
  
  switch (action.action) {
    case "navigate":
      if (action.navigation_path) {
        window.history.pushState(null, "", action.navigation_path);
        fireEvent(window, "location-changed");
      }
      break;
    case "url":
      if (action.url_path) {
        window.open(action.url_path, "_blank");
      }
      break;
    case "toggle":
      if (action.entity || entityId) {
        hass.callService("homeassistant", "toggle", { entity_id: action.entity || entityId });
      }
      break;
    case "more-info":
      if (action.entity || entityId) {
        fireEvent(card, "hass-more-info", { entityId: action.entity || entityId });
      }
      break;
    case "perform-action":
      if (action.service) {
        const [domain, service] = action.service.split(".", 2);
        const serviceData = { ...action.data };
        if (action.target) {
          serviceData.target = action.target;
        }
        hass.callService(domain, service, serviceData);
      }
      break;
    case "toggle-group":
      const target = action.target || "horizontal";
      const mode = action.mode || "toggle";
      const stateKey = target === "both" ? "bothHidden" : target === "horizontal" ? "horizontalHidden" : "verticalHidden";
      
      if (mode === "toggle") {
        card[stateKey] = !card[stateKey];
      } else if (mode === "show") {
        card[stateKey] = false;
      } else if (mode === "hide") {
        card[stateKey] = true;
      }
      
      if (target === "both") {
        card.horizontalHidden = card.bothHidden;
        card.verticalHidden = card.bothHidden;
      }
      
      card.requestUpdate();
      break;
    case "back":
      window.history.back();
      break;
  }
}

// Main Card Component
class HkiNavigationCard extends LitElement {
  static get properties() {
    return {
      _hass: { type: Object },
      _config: { type: Object },
      horizontalHidden: { type: Boolean },
      verticalHidden: { type: Boolean },
      bothHidden: { type: Boolean },
    };
  }

  constructor() {
    super();
    this._hass = null;
    this._config = null;
    this.horizontalHidden = false;
    this.verticalHidden = false;
    this.bothHidden = false;
  }

  setConfig(inputConfig) {
    if (!inputConfig) throw new Error("Invalid configuration");
    
    // Migrate old config to new structure
    let config = migrateConfig(inputConfig);
    
    // Clean up the config
    config = cleanupConfig(config);
    
    // Merge with defaults (deep merge)
    this._config = this._deepMerge(deepClone(DEFAULTS), config);
  }

  _deepMerge(target, source) {
    const output = { ...target };
    if (source && typeof source === 'object') {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
            output[key] = this._deepMerge(target[key], source[key]);
          } else {
            output[key] = source[key];
          }
        } else {
          output[key] = source[key];
        }
      }
    }
    return output;
  }

  set hass(hass) {
    this._hass = hass;
  }

  getCardSize() {
    return 1;
  }

  render() {
    if (!this._hass || !this._config) return html``;

    const c = this._config;
    const bottomBar = c.bottom_bar || {};
    const buttonDefaults = c.button_defaults || {};
    const styleDefaults = buttonDefaults.style || {};
    const labelDefaults = buttonDefaults.label || {};

    return html`
      <ha-card>
        <div class="nav-container">
          ${this._renderBase()}
          ${this._renderHorizontal()}
          ${this._renderVertical()}
        </div>
      </ha-card>
    `;
  }

  _renderBase() {
    const c = this._config;
    if (!c.base?.enabled || !c.base.button) return html``;
    
    const btn = c.base.button;
    const panel = this._hass?.panels?.[this._hass?.panelUrl] || null;
    
    if (!evaluateConditions(btn.conditions, this._hass, panel, btn.entity)) {
      return html``;
    }
    
    return html`<div class="base-button">${this._renderButton(btn, "base")}</div>`;
  }

  _renderHorizontal() {
    const c = this._config;
    if (!c.horizontal?.enabled || this.horizontalHidden) return html``;
    
    const buttons = c.horizontal.buttons || [];
    const panel = this._hass?.panels?.[this._hass?.panelUrl] || null;
    
    const visibleButtons = buttons.filter(btn => 
      evaluateConditions(btn.conditions, this._hass, panel, btn.entity)
    );
    
    if (visibleButtons.length === 0) return html``;
    
    return html`
      <div class="horizontal-group" style="grid-template-columns: repeat(${c.horizontal.columns || 6}, 1fr);">
        ${visibleButtons.map(btn => this._renderButton(btn, "horizontal"))}
      </div>
    `;
  }

  _renderVertical() {
    const c = this._config;
    if (!c.vertical?.enabled || this.verticalHidden) return html``;
    
    const buttons = c.vertical.buttons || [];
    const panel = this._hass?.panels?.[this._hass?.panelUrl] || null;
    
    const visibleButtons = buttons.filter(btn => 
      evaluateConditions(btn.conditions, this._hass, panel, btn.entity)
    );
    
    if (visibleButtons.length === 0) return html``;
    
    return html`
      <div class="vertical-group" style="grid-template-rows: repeat(${c.vertical.rows || 6}, 1fr);">
        ${visibleButtons.map(btn => this._renderButton(btn, "vertical"))}
      </div>
    `;
  }

  _renderButton(btn, group) {
    const buttonDefaults = this._config.button_defaults || {};
    const styleDefaults = buttonDefaults.style || {};
    
    const bgColor = btn.background || styleDefaults.background || "";
    const bgOpacity = btn.background_opacity ?? styleDefaults.background_opacity ?? 0.12;
    const iconColor = btn.icon_color || styleDefaults.icon_color || "";
    const borderRadius = btn.border_radius ?? styleDefaults.border_radius ?? 999;
    const borderWidth = btn.border_width ?? styleDefaults.border_width ?? 0;
    const borderStyle = btn.border_style || styleDefaults.border_style || "solid";
    const borderColor = btn.border_color || styleDefaults.border_color || "";
    
    const style = `
      background: ${bgColor ? `rgba(${bgColor}, ${bgOpacity})` : `rgba(var(--rgb-primary-text-color), ${bgOpacity})`};
      color: ${iconColor || 'var(--primary-text-color)'};
      border-radius: ${borderRadius}px;
      border: ${borderWidth}px ${borderStyle} ${borderColor || 'var(--divider-color)'};
    `;
    
    return html`
      <button
        class="nav-button ${btn.button_type || 'icon'}"
        style="${style}"
        title="${btn.tooltip || ''}"
        @click="${() => handleAction(this, btn.tap_action, btn.entity)}"
        @dblclick="${() => handleAction(this, btn.double_tap_action, btn.entity)}"
      >
        ${btn.icon ? html`<ha-icon icon="${btn.icon}"></ha-icon>` : ''}
        ${btn.label && btn.button_type !== 'icon' ? html`<span class="label">${btn.label}</span>` : ''}
      </button>
    `;
  }

  static get styles() {
    return css`
      :host { display: block; }
      ha-card { overflow: visible; }
      .nav-container { display: flex; flex-direction: column; }
      .base-button, .horizontal-group, .vertical-group { display: grid; gap: 6px; padding: 8px; }
      .nav-button { 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        gap: 8px; 
        padding: 12px; 
        cursor: pointer; 
        border: none;
        transition: all 0.2s;
      }
      .nav-button:hover { transform: scale(1.05); }
      .nav-button ha-icon { --mdc-icon-size: 24px; }
      .label { font-weight: 600; white-space: nowrap; }
    `;
  }
}

// Editor Component
class HkiNavigationCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      _config: { type: Object },
    };
  }

  setConfig(config) {
    // Migrate and clean config before editing
    let cleaned = migrateConfig(config);
    cleaned = cleanupConfig(cleaned);
    this._config = this._deepMerge(deepClone(DEFAULTS), cleaned);
  }

  _deepMerge(target, source) {
    const output = { ...target };
    if (source && typeof source === 'object') {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
            output[key] = this._deepMerge(target[key], source[key]);
          } else {
            output[key] = source[key];
          }
        } else {
          output[key] = source[key];
        }
      }
    }
    return output;
  }

  _configChanged(newConfig) {
    // Remove defaults before saving to keep config minimal
    const minimal = removeDefaults(newConfig, DEFAULTS);
    
    // Clean up the config
    const cleaned = cleanupConfig(minimal);
    
    this._config = newConfig;
    fireEvent(this, "config-changed", { config: cleaned });
  }

  _updateConfig(updates) {
    const newConfig = { ...this._config, ...updates };
    this._configChanged(newConfig);
  }

  _setBottomBarProperty(prop, value) {
    const bottomBar = { ...this._config.bottom_bar, [prop]: value };
    this._updateConfig({ bottom_bar: bottomBar });
  }

  _setButtonDefaultStyleProperty(prop, value) {
    const buttonDefaults = { ...this._config.button_defaults };
    const style = { ...buttonDefaults.style, [prop]: value };
    buttonDefaults.style = style;
    this._updateConfig({ button_defaults: buttonDefaults });
  }

  _setButtonDefaultLabelProperty(prop, value) {
    const buttonDefaults = { ...this._config.button_defaults };
    const label = { ...buttonDefaults.label, [prop]: value };
    buttonDefaults.label = label;
    this._updateConfig({ button_defaults: buttonDefaults });
  }

  _setActionProperty(groupType, buttonIndex, actionType, prop, value) {
    const config = deepClone(this._config);
    const group = groupType === 'base' ? config.base : config[groupType];
    const button = groupType === 'base' ? group.button : group.buttons[buttonIndex];
    
    if (!button[actionType]) {
      button[actionType] = { action: 'none' };
    }
    
    button[actionType][prop] = value;
    
    // Clean up conflicts when action type changes
    if (prop === 'action') {
      button[actionType] = cleanupActionConflicts(button[actionType]);
    }
    
    this._configChanged(config);
  }

  render() {
    if (!this._config) return html``;

    return html`
      <div class="editor">
        <div class="section">
          <div class="section-title">Bottom Bar</div>
          <div class="grid2">
            <ha-textfield
              label="Background color"
              .value="${this._config.bottom_bar?.background || ''}"
              @change="${(e) => this._setBottomBarProperty('background', e.target.value)}"
            ></ha-textfield>
            <ha-textfield
              type="number"
              label="Border radius (px)"
              .value="${String(this._config.bottom_bar?.border_radius ?? DEFAULTS.bottom_bar.border_radius)}"
              @change="${(e) => this._setBottomBarProperty('border_radius', Number(e.target.value))}"
            ></ha-textfield>
            <ha-textfield
              type="number"
              label="Height (px)"
              .value="${String(this._config.bottom_bar?.height ?? DEFAULTS.bottom_bar.height)}"
              @change="${(e) => this._setBottomBarProperty('height', Number(e.target.value))}"
            ></ha-textfield>
            <ha-textfield
              type="number"
              label="Gap (px)"
              .value="${String(this._config.bottom_bar?.gap ?? DEFAULTS.bottom_bar.gap)}"
              @change="${(e) => this._setBottomBarProperty('gap', Number(e.target.value))}"
            ></ha-textfield>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Button Defaults</div>
          <div class="subsection">
            <div class="subheader">Style</div>
            <div class="grid2">
              <ha-textfield
                label="Background"
                .value="${this._config.button_defaults?.style?.background || ''}"
                @change="${(e) => this._setButtonDefaultStyleProperty('background', e.target.value)}"
              ></ha-textfield>
              <ha-textfield
                type="number"
                label="Background opacity"
                .value="${String(this._config.button_defaults?.style?.background_opacity ?? DEFAULTS.button_defaults.style.background_opacity)}"
                @change="${(e) => this._setButtonDefaultStyleProperty('background_opacity', Number(e.target.value))}"
              ></ha-textfield>
              <ha-textfield
                label="Icon color"
                .value="${this._config.button_defaults?.style?.icon_color || ''}"
                @change="${(e) => this._setButtonDefaultStyleProperty('icon_color', e.target.value)}"
              ></ha-textfield>
              <ha-textfield
                type="number"
                label="Border radius (px)"
                .value="${String(this._config.button_defaults?.style?.border_radius ?? DEFAULTS.button_defaults.style.border_radius)}"
                @change="${(e) => this._setButtonDefaultStyleProperty('border_radius', Number(e.target.value))}"
              ></ha-textfield>
            </div>
          </div>
          
          <div class="subsection">
            <div class="subheader">Label</div>
            <div class="grid2">
              <ha-textfield
                type="number"
                label="Font size (px)"
                .value="${String(this._config.button_defaults?.label?.font_size ?? DEFAULTS.button_defaults.label.font_size)}"
                @change="${(e) => this._setButtonDefaultLabelProperty('font_size', Number(e.target.value))}"
              ></ha-textfield>
              <ha-textfield
                type="number"
                label="Font weight"
                .value="${String(this._config.button_defaults?.label?.font_weight ?? DEFAULTS.button_defaults.label.font_weight)}"
                @change="${(e) => this._setButtonDefaultLabelProperty('font_weight', Number(e.target.value))}"
              ></ha-textfield>
              <ha-textfield
                label="Color"
                .value="${this._config.button_defaults?.label?.color || ''}"
                @change="${(e) => this._setButtonDefaultLabelProperty('color', e.target.value)}"
              ></ha-textfield>
              <ha-textfield
                label="Background"
                .value="${this._config.button_defaults?.label?.background || ''}"
                @change="${(e) => this._setButtonDefaultLabelProperty('background', e.target.value)}"
              ></ha-textfield>
            </div>
          </div>
        </div>

        <div class="hint">
          Note: This editor is simplified. Use YAML mode for full button configuration.
          Your config will be automatically cleaned and optimized when saved.
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      .editor { display: flex; flex-direction: column; gap: 16px; padding: 16px; }
      .section { 
        padding: 14px; 
        border-radius: 14px; 
        background: var(--card-background-color); 
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2); 
        display: flex; 
        flex-direction: column; 
        gap: 12px; 
      }
      .section-title { font-weight: 800; }
      .subsection { 
        margin-top: 6px; 
        padding-top: 10px; 
        border-top: 1px solid rgba(0, 0, 0, 0.14); 
        display: flex; 
        flex-direction: column; 
        gap: 10px; 
      }
      .subheader { font-weight: 700; opacity: 0.9; }
      .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .grid2 > * { min-width: 0; }
      .hint { font-size: 12px; opacity: 0.7; padding: 8px; }
      ha-textfield { width: 100%; }
      @media (max-width: 640px) { .grid2 { grid-template-columns: 1fr; } }
    `;
  }
}

customElements.define(CARD_TAG, HkiNavigationCard);
customElements.define(EDITOR_TAG, HkiNavigationCardEditor);

HkiNavigationCard.getConfigElement = () => document.createElement(EDITOR_TAG);
HkiNavigationCard.getStubConfig = () => ({
  base: { 
    enabled: true,
    button: { 
      ...DEFAULT_BUTTON(), 
      icon: "mdi:home", 
      tooltip: "Home", 
      button_type: "icon", 
      tap_action: { action: "navigate", navigation_path: "/lovelace/0" } 
    } 
  },
  horizontal: { 
    enabled: true, 
    columns: 6, 
    buttons: [
      { ...DEFAULT_BUTTON(), icon: "mdi:view-grid", tooltip: "Overview", button_type: "icon", tap_action: { action: "navigate", navigation_path: "/" } },
      { ...DEFAULT_BUTTON(), icon: "mdi:menu", tooltip: "Menu", button_type: "pill", label: "Menu", double_tap_action: { action: "toggle-group", target: "both", mode: "show" } },
    ] 
  },
  vertical: { 
    enabled: false, 
    rows: 6, 
    buttons: [
      { ...DEFAULT_BUTTON(), icon: "mdi:cog", tooltip: "Settings", button_type: "pill", label: "Settings", tap_action: { action: "navigate", navigation_path: "/config" } }
    ] 
  },
});

window.customCards = window.customCards || [];
window.customCards.push({
  type: CARD_TYPE,
  name: "HKI Navigation Card",
  description: "Highly Customizable Navigation Bar with improved config management.",
  preview: false,
  documentationURL: "https://github.com/jimz011/hki-navigation-card",
});
