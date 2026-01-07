# Button Configuration Guide

Complete guide to configuring buttons in HKI Navigation Card.

---

## Table of Contents

- [Button Types](#button-types)
- [Button Properties](#button-properties)
- [Actions](#actions)
- [Entity Integration](#entity-integration)
- [Styling Options](#styling-options)
- [Label Configuration](#label-configuration)
- [State-Based Appearance](#state-based-appearance)
- [Best Practices](#best-practices)

---

## Button Types

The card supports three button display types.

### Icon Type (Default)

Icon only, label shows on hover.

```yaml
buttons:
  - icon: mdi:home
    label: Home
    button_type: icon  # or omit (default)
    tooltip: Go to Home
```

**When to use:**
- Clean, minimal design
- Limited space
- Icons are self-explanatory
- Want hover-reveal labels

**Behavior:**
- Shows icon only
- Label appears on hover (if set)
- Tooltip shows on hover

---

### Pill Type

Icon with always-visible label below.

```yaml
buttons:
  - icon: mdi:lightbulb
    label: Lights
    button_type: pill
    tooltip: Control Lights
```

**When to use:**
- Labels are important
- Better accessibility needed
- Navigation bars
- Buttons need clear identification

**Behavior:**
- Icon above, label below
- Label always visible
- Best for bottom navigation bars

---

### Icon-Label Type

Icon and label side-by-side.

```yaml
buttons:
  - icon: mdi:thermostat
    label: Climate
    button_type: icon-label
    tooltip: Climate Control
```

**When to use:**
- Horizontal space available
- Text is important
- More button-like appearance
- Desktop-focused layouts

**Behavior:**
- Icon left, label right
- Both always visible
- Wider than other types

---

## Button Properties

### Required Properties

**icon** - MDI icon identifier

```yaml
icon: mdi:home              # Required
icon: mdi:lightbulb
icon: mdi:cog
```

Find icons at [Material Design Icons](https://materialdesignicons.com/)

---

### Optional Properties

**tooltip** - Hover text (highly recommended)

```yaml
tooltip: "Go to Home"
tooltip: "Toggle all lights"
tooltip: "Open settings"
```

**label** - Button label text

```yaml
label: "Home"
label: "Lights"
label: "{{ states('sensor.lights_on') }} lights"  # Template
```

**button_type** - Display type

```yaml
button_type: icon        # Default
button_type: pill        # Icon + label below
button_type: icon-label  # Icon + label side-by-side
```

---

## Actions

Buttons support three action types: tap, hold, and double-tap.

### Action Types

**Available actions:**
- `navigate` - Navigate to a view
- `toggle` - Toggle an entity
- `call-service` - Call a service
- `more-info` - Open entity details
- `url` - Open a URL
- `none` - No action

---

### Navigate Action

Navigate to a dashboard view.

```yaml
tap_action:
  action: navigate
  navigation_path: /lovelace/lights
```

**Properties:**
- `navigation_path` - Path to navigate to (required)

**Examples:**

```yaml
# Navigate to view
tap_action:
  action: navigate
  navigation_path: /lovelace/0

# Navigate to config
tap_action:
  action: navigate
  navigation_path: /config

# Navigate to addon
tap_action:
  action: navigate
  navigation_path: /hassio/addon/core_configurator
```

---

### Toggle Action

Toggle an entity on/off.

```yaml
tap_action:
  action: toggle
  entity: light.living_room
```

**Properties:**
- `entity` - Entity to toggle (required)

**Works with:**
- Lights
- Switches
- Input booleans
- Covers
- Fans
- Locks
- And more...

**Example:**

```yaml
- icon: mdi:lightbulb
  tooltip: Living Room
  entity: light.living_room
  tap_action:
    action: toggle
    entity: light.living_room
```

---

### Call Service Action

Call any Home Assistant service.

```yaml
tap_action:
  action: call-service
  service: scene.turn_on
  service_data:
    entity_id: scene.movie_time
```

**Properties:**
- `service` - Service to call (required)
- `service_data` - Service parameters (optional)
- `target` - Service target (optional)

**Examples:**

```yaml
# Turn on scene
tap_action:
  action: call-service
  service: scene.turn_on
  service_data:
    entity_id: scene.evening

# Set climate temperature
tap_action:
  action: call-service
  service: climate.set_temperature
  service_data:
    entity_id: climate.living_room
    temperature: 22

# Start vacuum
tap_action:
  action: call-service
  service: vacuum.start
  target:
    entity_id: vacuum.robot

# Notify
tap_action:
  action: call-service
  service: notify.mobile_app
  service_data:
    message: "Button pressed!"
    title: "Notification"
```

---

### More Info Action

Open entity details dialog.

```yaml
tap_action:
  action: more-info
  entity: light.living_room
```

**Properties:**
- `entity` - Entity to show (required)

**Use cases:**
- Quick entity access
- View entity attributes
- Access entity controls
- See entity history

**Example:**

```yaml
- icon: mdi:thermostat
  tooltip: Climate
  entity: climate.living_room
  tap_action:
    action: more-info
    entity: climate.living_room
```

---

### URL Action

Open a URL in new tab.

```yaml
tap_action:
  action: url
  url_path: https://www.home-assistant.io
```

**Properties:**
- `url_path` - URL to open (required)

**Examples:**

```yaml
# External URL
tap_action:
  action: url
  url_path: https://www.google.com

# Internal URL
tap_action:
  action: url
  url_path: /local/floorplan.html

# API endpoint
tap_action:
  action: url
  url_path: http://192.168.1.100/api/status
```

---

### None Action

No action when pressed.

```yaml
tap_action:
  action: none
```

**Use cases:**
- Display-only buttons
- Disabled states
- Placeholder buttons

---

### Multiple Actions

Configure different actions for tap, hold, and double-tap.

```yaml
- icon: mdi:lightbulb
  tooltip: Living Room Light
  entity: light.living_room
  
  # Single tap - toggle
  tap_action:
    action: toggle
    entity: light.living_room
  
  # Long press - more info
  hold_action:
    action: more-info
    entity: light.living_room
  
  # Double tap - brightness scene
  double_tap_action:
    action: call-service
    service: scene.turn_on
    service_data:
      entity_id: scene.living_room_bright
```

**Best practices:**
- Tap: Primary action
- Hold: More info or alternate action
- Double-tap: Advanced/less common action

---

## Entity Integration

Link buttons to entities for state tracking.

### Basic Entity Binding

```yaml
- icon: mdi:lightbulb
  tooltip: Living Room
  entity: light.living_room
  tap_action:
    action: toggle
    entity: light.living_room
```

**What happens:**
- Button tracks entity state
- Background color changes when on/off
- Icon can change based on state (with templates)

---

### Entity State Colors

Buttons automatically style based on entity state:

**For lights, switches, etc:**
- **On** - Primary color background
- **Off** - Dim/gray background

**For binary sensors:**
- **On** - Primary color
- **Off** - Dim/gray

**For other entities:**
- Uses state-based theming

**Override with:**

```yaml
- icon: mdi:lightbulb
  entity: light.living_room
  background: "#FF5722"  # Custom color (ignores state)
```

---

### State-Based Icons

Use templates for dynamic icons:

```yaml
- icon: >-
    {% if is_state('light.living_room', 'on') %}
      mdi:lightbulb-on
    {% else %}
      mdi:lightbulb-off
    {% endif %}
  tooltip: Living Room
  entity: light.living_room
```

---

## Styling Options

### Background Colors

**Solid colors:**

```yaml
- icon: mdi:home
  background: "#2196F3"
  background: "rgb(33, 150, 243)"
  background: "rgba(33, 150, 243, 0.8)"
```

**Theme colors:**

```yaml
- icon: mdi:home
  background: rgba(var(--rgb-primary-color), 1)
  background: var(--primary-color)
```

**Gradients:**

```yaml
- icon: mdi:home
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
  background: linear-gradient(to right, #f093fb, #f5576c)
  background: radial-gradient(circle, #43e97b, #38f9d7)
```

---

### Icon Colors

```yaml
- icon: mdi:lightbulb
  icon_color: "#FFFFFF"
  icon_color: "rgb(255, 255, 255)"
  icon_color: var(--primary-text-color)
```

**State-based colors:**

```yaml
- icon: mdi:lightbulb
  entity: light.living_room
  icon_color: >-
    {% if is_state('light.living_room', 'on') %}
      #FFD700
    {% else %}
      #757575
    {% endif %}
```

---

### Opacity

```yaml
- icon: mdi:home
  button_opacity: 1      # Fully opaque
  button_opacity: 0.8    # Semi-transparent
  button_opacity: 0.5    # Half transparent
```

**State-based opacity:**

```yaml
- icon: mdi:lightbulb
  entity: light.living_room
  button_opacity: >-
    {{ 1 if is_state('light.living_room', 'on') else 0.5 }}
```

---

## Label Configuration

### Label Position

```yaml
- icon: mdi:home
  label: Home
  label_position: bottom  # Default for pill type
  label_position: top
  label_position: left
  label_position: right
```

**Position behavior:**
- `bottom` - Below icon (pill type default)
- `top` - Above icon
- `left` - Left of icon
- `right` - Right of icon (icon-label type default)

---

### Show/Hide Labels

**Per-button control:**

```yaml
- icon: mdi:home
  label: Home
  show_label: true   # Always show
  show_label: false  # Never show (even on hover)
```

**Global default:**

```yaml
# In card config (not button config)
default_show_label: false
```

---

### Dynamic Labels

Use templates for dynamic content:

```yaml
- icon: mdi:lightbulb
  label: >-
    {{ states('sensor.lights_on') }} lights on
  entity: light.all_lights

- icon: mdi:thermometer
  label: >-
    {{ states('sensor.temperature') }}°C

- icon: mdi:gauge
  label: >-
    {{ states('sensor.power') }}W
```

---

## State-Based Appearance

### Conditional Visibility

Show/hide buttons based on conditions:

```yaml
- icon: mdi:door-open
  label: Door Open
  tooltip: Close the door
  conditions:
    - entity: binary_sensor.front_door
      state: "on"

- icon: mdi:alarm-bell
  label: Alarm
  conditions:
    - entity: alarm_control_panel.home
      state_not: disarmed
```

**Multiple conditions (AND logic):**

```yaml
- icon: mdi:robot-vacuum
  label: Vacuum Done
  conditions:
    - entity: vacuum.robot
      state: "docked"
    - entity: sensor.vacuum_battery
      state_not: "100"
```

See [Advanced Usage - Conditions](advanced.md#conditional-visibility) for more.

---

### Dynamic Styling

Combine templates and entity states:

```yaml
- icon: >-
    {% if is_state('alarm_control_panel.home', 'armed_away') %}
      mdi:shield-lock
    {% elif is_state('alarm_control_panel.home', 'armed_home') %}
      mdi:shield-home
    {% else %}
      mdi:shield-off
    {% endif %}
  background: >-
    {% if is_state('alarm_control_panel.home', 'disarmed') %}
      #4CAF50
    {% else %}
      #F44336
    {% endif %}
  label: >-
    {% if is_state('alarm_control_panel.home', 'armed_away') %}
      Armed Away
    {% elif is_state('alarm_control_panel.home', 'armed_home') %}
      Armed Home
    {% else %}
      Disarmed
    {% endif %}
  entity: alarm_control_panel.home
```

---

## Best Practices

### Icon Selection

✅ **Do:**
- Use recognizable icons
- Be consistent across similar buttons
- Use outline vs filled appropriately
- Consider color blind users

❌ **Don't:**
- Mix icon styles randomly
- Use overly complex icons
- Rely solely on color for meaning

---

### Tooltips

✅ **Do:**
- Always add tooltips
- Keep them concise
- Describe the action
- Use sentence case

❌ **Don't:**
- Skip tooltips (bad for accessibility)
- Use generic text ("Button", "Click here")
- Write paragraphs

**Examples:**

```yaml
# Good
tooltip: "Navigate to lights"
tooltip: "Toggle all lights"
tooltip: "Open climate controls"

# Bad
tooltip: "Button"
tooltip: "This button will navigate to the lights page where you can control all your lights"
```

---

### Actions

✅ **Do:**
- Use tap for primary action
- Use hold for more-info
- Keep double-tap for advanced actions
- Test on mobile devices

❌ **Don't:**
- Rely only on double-tap (hard on mobile)
- Use multiple actions with no clear purpose
- Forget to test hold duration

---

### Labels

✅ **Do:**
- Keep labels short (1-2 words)
- Use dynamic labels for status
- Consider label position
- Test on different screen sizes

❌ **Don't:**
- Write long labels (they'll truncate)
- Use labels when icons are clear enough
- Forget about mobile users

---

### Styling

✅ **Do:**
- Use consistent color schemes
- Match your theme
- Test contrast for accessibility
- Use shadows sparingly

❌ **Don't:**
- Go overboard with gradients
- Use low-contrast colors
- Apply different styles to similar buttons
- Forget hover states

---

### Performance

✅ **Do:**
- Limit template complexity
- Cache sensor values if possible
- Use simple conditions
- Test with many buttons

❌ **Don't:**
- Create complex template loops
- Update labels every second
- Use expensive computations
- Ignore performance warnings

---

## Examples

### Complete Button Examples

**Navigation button:**

```yaml
- icon: mdi:home
  tooltip: Home Dashboard
  button_type: icon
  tap_action:
    action: navigate
    navigation_path: /lovelace/0
```

**Light toggle with state:**

```yaml
- icon: mdi:lightbulb
  tooltip: Living Room Light
  label: Living Room
  entity: light.living_room
  tap_action:
    action: toggle
    entity: light.living_room
  hold_action:
    action: more-info
    entity: light.living_room
```

**Scene activation:**

```yaml
- icon: mdi:movie
  tooltip: Movie Time
  label: Movie
  background: "#4A148C"
  icon_color: "#FFFFFF"
  tap_action:
    action: call-service
    service: scene.turn_on
    service_data:
      entity_id: scene.movie_time
```

**Conditional button:**

```yaml
- icon: mdi:bell-ring
  tooltip: You have notifications
  label: >-
    {{ states('sensor.notifications') }} alerts
  conditions:
    - entity: sensor.notifications
      state_not: "0"
  tap_action:
    action: navigate
    navigation_path: /lovelace/notifications
```

---

## See Also

- [Configuration Guide](configuration.md) - All config options
- [Advanced Usage](advanced.md) - Templates and conditions
- [Examples](examples.md) - Ready-to-use button configs

---

[← Back to Documentation Index](INDEX.md)
