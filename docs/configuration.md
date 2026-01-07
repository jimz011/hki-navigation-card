# Complete Configuration Reference

Detailed documentation of all configuration options.

---

## Table of Contents

- [Card Structure](#card-structure)
- [Layout Settings](#layout-settings)
- [Button Groups](#button-groups)
- [Global Styling](#global-styling)
- [Label Styling](#label-styling)
- [Bottom Bar Settings](#bottom-bar-settings)
- [Configuration Tips](#configuration-tips)

---

## Card Structure

### Basic Structure

```yaml
type: custom:hki-navigation-card

# Layout settings
position: bottom-right
offset_x: 12
offset_y: 20
button_size: 50
gap: 12
vertical_gap: 12
z_index: 5
center_spread: false

# Button groups
base:
  button: { ... }
horizontal:
  enabled: true
  columns: 6
  buttons: [ ... ]
vertical:
  enabled: false
  rows: 6
  buttons: [ ... ]

# Global styling
default_background: ""
default_button_opacity: 1
default_icon_color: ""
default_button_type: icon
button_box_shadow: ""
button_box_shadow_hover: ""

# Label styling
label_style:
  font_size: 12
  font_weight: 600
  # ... more options

# Bottom bar (experimental)
bottom_bar_enabled: false
bottom_bar_full_width: true
# ... more options

# Advanced
offset_x_mobile: null
offset_x_tablet: null
offset_x_desktop: null
```

---

## Layout Settings

### Core Layout Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `position` | string | `bottom-right` | Button position on screen |
| `offset_x` | number | `12` | Horizontal offset from edge (px) |
| `offset_y` | number | `20` | Vertical offset from bottom (px) |
| `button_size` | number | `50` | Button diameter (px) |
| `gap` | number | `12` | Horizontal gap between buttons (px) |
| `vertical_gap` | number | `12` | Vertical gap between buttons (px) |
| `z_index` | number | `5` | CSS z-index for layering |
| `center_spread` | boolean | `false` | Distribute buttons across full width |

---

### Position Options

**Available values:**
- `bottom-left` - Buttons aligned to bottom-left corner
- `bottom-center` - Buttons centered at bottom
- `bottom-right` - Buttons aligned to bottom-right corner (default)

**Behavior:**
- `bottom-left` and `bottom-right` automatically adjust for sidebar/panels
- `bottom-center` centers buttons in the viewport
- All positions respect `offset_x` and `offset_y` values

**Example:**

```yaml
# Bottom-right corner (FAB style)
position: bottom-right
offset_x: 12
offset_y: 20

# Bottom-center (navigation bar)
position: bottom-center
offset_x: 0
offset_y: 20

# Bottom-left corner
position: bottom-left
offset_x: 12
offset_y: 20
```

---

### Offset Options

**offset_x** - Horizontal distance from edge

- **Type:** Number (pixels)
- **Default:** 12
- **Range:** Any integer (positive or negative)
- **Behavior:** 
  - For `bottom-left` and `bottom-right`: Distance from viewport edge
  - Automatically adjusts for sidebar/panels on left/right
  - For `bottom-center`: Additional offset from center (rarely used)

**offset_y** - Vertical distance from bottom

- **Type:** Number (pixels)
- **Default:** 20
- **Range:** Any integer (positive or negative)
- **Behavior:** Distance from bottom of viewport

**Examples:**

```yaml
# Close to edge
offset_x: 12
offset_y: 12

# Further from edge
offset_x: 30
offset_y: 30

# Negative values (off-screen - not recommended)
offset_x: -10
offset_y: -10
```

---

### Button Size and Gaps

**button_size** - Diameter of buttons

- **Type:** Number (pixels)
- **Default:** 50
- **Range:** 30-100 recommended
- **Affects:** Both base and group buttons

**gap** - Horizontal spacing

- **Type:** Number (pixels)
- **Default:** 12
- **Range:** 0-50 recommended
- **Affects:** Space between buttons in horizontal group

**vertical_gap** - Vertical spacing

- **Type:** Number (pixels)
- **Default:** 12
- **Range:** 0-50 recommended
- **Affects:** Space between buttons in vertical group

**Examples:**

```yaml
# Compact
button_size: 40
gap: 8
vertical_gap: 8

# Default
button_size: 50
gap: 12
vertical_gap: 12

# Spacious
button_size: 60
gap: 20
vertical_gap: 20
```

---

### Z-Index Control

**z_index** - Stacking order

- **Type:** Number
- **Default:** 5
- **Range:** 1-999
- **Purpose:** Control layering relative to other elements

**Common z-index values:**
- `1` - Behind most content
- `5` - Default, above content but below header
- `10` - Above most elements
- `100` - Above almost everything
- `999` - Maximum (use sparingly)

**When to adjust:**
- Buttons appear behind content → Increase value
- Buttons appear above sidebar → Decrease value
- Buttons overlap other cards → Adjust as needed

**Example:**

```yaml
# Default
z_index: 5

# Above sidebar
z_index: 10

# Behind certain elements
z_index: 1
```

---

### Center Spread Mode

**center_spread** - Distribute buttons across width

- **Type:** Boolean
- **Default:** false
- **Works with:** `position: bottom-center` only
- **Effect:** Buttons spread evenly across viewport width

**When to use:**
- Creating a full-width navigation bar
- Want buttons distributed evenly
- iOS-style bottom navigation

**Example:**

```yaml
position: bottom-center
center_spread: true
offset_y: 20

horizontal:
  enabled: true
  columns: 5
  buttons:
    - icon: mdi:home
      # ... buttons will spread across width
```

---

## Button Groups

### Base Button

Always-visible anchor button. Optional but recommended.

```yaml
base:
  button:
    icon: mdi:menu
    tooltip: Menu
    label: ""
    button_type: icon
    background: ""
    button_opacity: 1
    icon_color: ""
    entity: ""
    show_label: false
    label_position: bottom
    tap_action:
      action: none
    hold_action:
      action: none
    double_tap_action:
      action: none
    conditions: []
```

**Key properties:**
- Always visible when configured
- Serves as anchor for other buttons
- Can trigger actions independently
- Same styling options as other buttons

---

### Horizontal Group

Buttons arranged in a horizontal row (or multiple rows).

```yaml
horizontal:
  enabled: true          # Show/hide entire group
  columns: 6            # Max buttons per row
  buttons:
    - icon: mdi:home
      tooltip: Home
      # ... button config
    - icon: mdi:lightbulb
      tooltip: Lights
      # ... button config
```

**Properties:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | boolean | `false` | Show/hide horizontal buttons |
| `columns` | number | `6` | Maximum buttons per row |
| `buttons` | array | `[]` | Array of button configurations |

**Behavior:**
- Buttons flow left-to-right
- Wrap to new row after `columns` buttons
- Positioned relative to base button (if present)
- Positioned at `offset_x`/`offset_y` (if no base button)

---

### Vertical Group

Buttons arranged in a vertical column (or multiple columns).

```yaml
vertical:
  enabled: false         # Show/hide entire group
  rows: 6               # Max buttons per column
  buttons:
    - icon: mdi:cog
      tooltip: Settings
      # ... button config
```

**Properties:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | boolean | `false` | Show/hide vertical buttons |
| `rows` | number | `6` | Maximum buttons per column |
| `buttons` | array | `[]` | Array of button configurations |

**Behavior:**
- Buttons stack top-to-bottom
- Wrap to new column after `rows` buttons
- Positioned relative to horizontal group
- Uses `vertical_gap` for spacing

---

### Button Configuration

Each button in a group has these options:

```yaml
- icon: mdi:home              # Required
  tooltip: Home               # Optional but recommended
  label: ""                   # Optional
  button_type: icon           # icon | pill | icon-label
  background: ""              # CSS color/gradient
  button_opacity: 1           # 0-1
  icon_color: ""              # CSS color
  entity: ""                  # Entity to track
  show_label: false           # Override global setting
  label_position: bottom      # top | bottom | left | right
  tap_action: { ... }         # Action on tap
  hold_action: { ... }        # Action on long press
  double_tap_action: { ... }  # Action on double tap
  conditions: []              # Show/hide conditions
```

See [Button Configuration Guide](buttons.md) for detailed button options.

---

## Global Styling

Settings that apply to all buttons by default.

### Default Background

**default_background** - Background for all buttons

- **Type:** String (CSS color)
- **Default:** `""` (uses theme)
- **Accepts:**
  - Named colors: `"red"`, `"blue"`
  - Hex: `"#FF0000"`
  - RGB: `"rgb(255, 0, 0)"`
  - RGBA: `"rgba(255, 0, 0, 0.5)"`
  - Gradients: `"linear-gradient(...)"`
  - CSS variables: `"rgb(var(--rgb-primary-color))"`

**Example:**

```yaml
# Primary theme color
default_background: rgba(var(--rgb-primary-color), 1)

# Custom color
default_background: "#2196F3"

# Gradient
default_background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

---

### Default Button Opacity

**default_button_opacity** - Opacity for all buttons

- **Type:** Number
- **Default:** 1
- **Range:** 0-1
- **Effect:** Button transparency (0 = invisible, 1 = opaque)

**Example:**

```yaml
# Fully opaque (default)
default_button_opacity: 1

# Semi-transparent
default_button_opacity: 0.8

# Very transparent
default_button_opacity: 0.5
```

---

### Default Icon Color

**default_icon_color** - Icon color for all buttons

- **Type:** String (CSS color)
- **Default:** `""` (uses theme)
- **Accepts:** Same as background colors

**Example:**

```yaml
# White icons
default_icon_color: "#FFFFFF"

# Theme color
default_icon_color: rgb(var(--rgb-primary-text-color))

# Custom color
default_icon_color: "#FFC107"
```

---

### Default Button Type

**default_button_type** - Type for all buttons

- **Type:** String
- **Default:** `icon`
- **Options:** `icon`, `pill`, `icon-label`

See [Button Types](buttons.md#button-types) for details.

**Example:**

```yaml
# Icon only (default)
default_button_type: icon

# Icon with label below on hover
default_button_type: pill

# Icon and label side-by-side
default_button_type: icon-label
```

---

### Button Shadows

**button_box_shadow** - Shadow for normal state

- **Type:** String (CSS box-shadow)
- **Default:** `""`
- **Accepts:** Valid CSS box-shadow values

**button_box_shadow_hover** - Shadow for hover state

- **Type:** String (CSS box-shadow)
- **Default:** `""`
- **Accepts:** Valid CSS box-shadow values

**Examples:**

```yaml
# Subtle shadow
button_box_shadow: 0 2px 8px rgba(0, 0, 0, 0.15)
button_box_shadow_hover: 0 4px 12px rgba(0, 0, 0, 0.2)

# Dramatic shadow
button_box_shadow: 0 8px 24px rgba(0, 0, 0, 0.35)
button_box_shadow_hover: 0 10px 30px rgba(0, 0, 0, 0.42)

# No shadow
button_box_shadow: ""
button_box_shadow_hover: ""
```

---

## Label Styling

Global label appearance settings.

```yaml
label_style:
  font_size: 12
  font_weight: 600
  letter_spacing: 0
  text_transform: none
  color: ""
  background: ""
  background_opacity: 0.72
  padding_x: 10
  padding_y: 6
  border_radius: 999
  backdrop_blur: 8
  max_width: 220
```

### Font Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `font_size` | number | `12` | Font size in pixels |
| `font_weight` | number | `600` | Font weight (100-900) |
| `letter_spacing` | number | `0` | Letter spacing in pixels |
| `text_transform` | string | `none` | Text transformation |

**text_transform values:**
- `none` - No transformation
- `uppercase` - ALL CAPS
- `lowercase` - all lowercase
- `capitalize` - Title Case

**Example:**

```yaml
label_style:
  font_size: 11
  font_weight: 700
  letter_spacing: 0.5
  text_transform: uppercase
```

---

### Color Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `color` | string | `""` | Text color |
| `background` | string | `""` | Background color |
| `background_opacity` | number | `0.72` | Background opacity |

**Example:**

```yaml
label_style:
  color: "#FFFFFF"
  background: rgba(0, 0, 0, 0.8)
  background_opacity: 0.8
```

---

### Layout Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `padding_x` | number | `10` | Horizontal padding (px) |
| `padding_y` | number | `6` | Vertical padding (px) |
| `border_radius` | number | `999` | Corner rounding (px) |
| `backdrop_blur` | number | `8` | Backdrop blur amount (px) |
| `max_width` | number | `220` | Maximum label width (px) |

**Example:**

```yaml
label_style:
  padding_x: 12
  padding_y: 8
  border_radius: 16
  backdrop_blur: 10
  max_width: 150
```

---

## Bottom Bar Settings

Experimental backdrop bar behind buttons.

⚠️ **Experimental Feature** - May change in future versions.

```yaml
bottom_bar_enabled: false
bottom_bar_full_width: true
bottom_bar_height: 85
bottom_bar_color: rgb(var(--rgb-card-background-color))
bottom_bar_opacity: 0.85
bottom_bar_border_radius: 0
bottom_bar_box_shadow: ""
bottom_bar_bottom_offset: 0
bottom_bar_margin_left: 0
bottom_bar_margin_right: 0
bottom_bar_border_width: 0
bottom_bar_border_style: solid
bottom_bar_border_color: ""
```

### Basic Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `bottom_bar_enabled` | boolean | `false` | Enable/disable bar |
| `bottom_bar_full_width` | boolean | `true` | Full-width or wrap buttons |
| `bottom_bar_height` | number | `85` | Bar height (px) |
| `bottom_bar_color` | string | theme | Bar background color |
| `bottom_bar_opacity` | number | `0.85` | Bar opacity (0-1) |

### Positioning

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `bottom_bar_bottom_offset` | number | `0` | Offset from bottom (px) |
| `bottom_bar_margin_left` | number | `0` | Left inset (px) |
| `bottom_bar_margin_right` | number | `0` | Right inset (px) |

**Inset behavior:**
- **When wrapping:** Positive values extend bar beyond buttons
- **When full-width:** Positive values shrink bar from edges
- Negative values do the opposite

### Styling

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `bottom_bar_border_radius` | number | `0` | Corner rounding (px) |
| `bottom_bar_box_shadow` | string | `""` | CSS box-shadow |
| `bottom_bar_border_width` | number | `0` | Border width (px) |
| `bottom_bar_border_style` | string | `solid` | Border style |
| `bottom_bar_border_color` | string | `""` | Border color |

See [Bottom Bar Guide](bottom-bar.md) for detailed information.

---

## Advanced Options

### Screen-Size Overrides

Override `offset_x` for different screen sizes.

```yaml
offset_x: 12              # Base value
offset_x_mobile: 8        # < 768px
offset_x_tablet: 16       # 768px - 1024px
offset_x_desktop: 24      # > 1024px
```

**Behavior:**
- If override is `null`, uses base `offset_x`
- Overrides only affect `offset_x`, not `offset_y`
- Sidebar adjustment still applies automatically

**Example:**

```yaml
# Different offsets per screen size
position: bottom-right
offset_x: 12              # Fallback
offset_x_mobile: 8        # Closer on mobile
offset_x_tablet: 16       # Medium on tablet
offset_x_desktop: 24      # Further on desktop
```

---

## Configuration Tips

### Tip 1: Start Simple

Begin with minimal config, then add features:

```yaml
# Start here
type: custom:hki-navigation-card
position: bottom-right
base:
  button:
    icon: mdi:menu

# Then add buttons
horizontal:
  enabled: true
  columns: 4
  buttons:
    - icon: mdi:home

# Then add styling
default_background: rgba(var(--rgb-primary-color), 1)
button_box_shadow: 0 8px 24px rgba(0, 0, 0, 0.35)
```

---

### Tip 2: Use Defaults

Most settings have good defaults. Only specify what you need:

```yaml
# Minimal - uses all defaults
type: custom:hki-navigation-card
position: bottom-right
base:
  button:
    icon: mdi:menu
horizontal:
  enabled: true
  buttons:
    - icon: mdi:home
```

---

### Tip 3: Test Incrementally

Add one feature at a time and test:

1. Add card with base button → Test
2. Add horizontal buttons → Test
3. Add styling → Test
4. Add conditions/templates → Test

---

### Tip 4: Copy Examples

Start with a working example from the [Examples Guide](examples.md), then customize.

---

### Tip 5: Check Console

Watch browser console (F12) for:
- Card version confirmation
- Error messages
- Warnings about invalid config

---

## See Also

- [Button Configuration](buttons.md) - Detailed button options
- [Layout & Positioning](layout.md) - Layout guide
- [Bottom Bar Guide](bottom-bar.md) - Bottom bar details
- [Examples](examples.md) - Ready-to-use configurations

---

[← Back to Documentation Index](INDEX.md)
