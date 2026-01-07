# HKI Navigation Card

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/jimz011/hki-navigation-card)
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/custom-components/hacs)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, highly customizable navigation card for Home Assistant with fixed-position buttons and advanced styling options.

> **Note:** This is a standalone card that can be used independently or as part of the Homekit Infused ecosystem.

---

## 🎯 Key Features

### Core Features
- 🎨 **Fixed-position floating buttons** - Stay visible while scrolling
- 📱 **Responsive design** - Automatic sidebar detection and responsive positioning
- 🎯 **Multiple layouts** - Corner, center, and spread positioning options
- 🔄 **Dynamic visibility** - Show/hide buttons based on conditions
- ⚡ **Template support** - Use Jinja2 templates for dynamic content
- 🎭 **Advanced styling** - Custom colors, shadows, backgrounds, and more

### Button Features
- 🔘 **Multiple button types** - Icon, pill, or icon+label combinations
- 🎨 **Customizable appearance** - Per-button backgrounds, colors, and opacity
- 📏 **Flexible sizing** - Adjustable button sizes and gaps
- 🏷️ **Smart labels** - Auto-show on hover with customizable styling
- 🎯 **Action support** - Tap, hold, and double-tap actions

### Layout Options
- 🎯 **Bottom right** - Classic floating action button position
- 🎯 **Bottom left** - Alternative corner positioning
- 🎯 **Bottom center** - Centered navigation bar
- 📐 **Center spread** - Distribute buttons across the full width
- 🔀 **Horizontal & vertical** - Organize buttons in rows and columns

### Advanced Features
- 🎨 **Bottom bar overlay** - Optional backdrop behind buttons (experimental)
- 📱 **Screen-size overrides** - Different offsets for mobile/tablet/desktop
- 🎭 **Label customization** - Full control over label styling and positioning
- 🔄 **Base button** - Always-visible anchor button with expandable groups
- 🎯 **Z-index control** - Precise layering control

---

## 📸 Screenshots

> Add your screenshots here showing different configurations and layouts

---

## 📚 Documentation

### Quick Links
- [Installation Guide](docs/installation.md) - HACS and manual installation
- [Quick Start Guide](docs/quick-start.md) - Get up and running in 5 minutes
- [Configuration Guide](docs/configuration.md) - Complete configuration reference
- [Button Configuration](docs/buttons.md) - All about buttons and styling
- [Layout & Positioning](docs/layout.md) - Layout options and positioning
- [Bottom Bar Guide](docs/bottom-bar.md) - Backdrop customization (experimental)
- [Advanced Usage](docs/advanced.md) - Templates, conditions, and advanced features
- [Examples](docs/examples.md) - Real-world configuration examples
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions
- [Changelog](CHANGELOG.md) - Version history

---

## ⚡ Quick Start

### Installation via HACS (Recommended)

1. Open HACS in Home Assistant
2. Click on "Frontend"
3. Click the "+" button in the bottom right
4. Search for "HKI Navigation Card"
5. Click "Download"
6. Restart Home Assistant

### Basic Configuration

```yaml
type: custom:hki-navigation-card
position: bottom-right
offset_x: 12
offset_y: 20
base:
  button:
    icon: mdi:home
    tooltip: Home
    tap_action:
      action: navigate
      navigation_path: /lovelace/0
horizontal:
  enabled: true
  columns: 6
  buttons:
    - icon: mdi:floor-plan
      tooltip: Floor Plan
      tap_action:
        action: navigate
        navigation_path: /lovelace/floorplan
    - icon: mdi:view-grid
      tooltip: Overview
      tap_action:
        action: navigate
        navigation_path: /lovelace/overview
```

See the [Quick Start Guide](docs/quick-start.md) for more details.

---

## 🎨 Configuration Overview

### Layout Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `position` | string | `bottom-right` | Button position: `bottom-left`, `bottom-center`, or `bottom-right` |
| `offset_x` | number | `12` | Horizontal offset from edge (px) |
| `offset_y` | number | `20` | Vertical offset from bottom (px) |
| `button_size` | number | `50` | Button diameter (px) |
| `gap` | number | `12` | Horizontal gap between buttons (px) |
| `vertical_gap` | number | `12` | Vertical gap between buttons (px) |
| `z_index` | number | `5` | Stacking order (higher = on top) |

### Button Groups

| Group | Description |
|-------|-------------|
| `base.button` | Always-visible anchor button |
| `horizontal.buttons` | Horizontal button row(s) |
| `vertical.buttons` | Vertical button column(s) |

### Button Properties

| Property | Type | Description |
|----------|------|-------------|
| `icon` | string | MDI icon (e.g., `mdi:home`) |
| `tooltip` | string | Hover tooltip text |
| `label` | string | Button label (supports templates) |
| `button_type` | string | `icon`, `pill`, or `icon-label` |
| `background` | string | Custom background color/gradient |
| `icon_color` | string | Icon color |
| `entity` | string | Entity to track state |
| `tap_action` | object | Action on tap |
| `hold_action` | object | Action on long press |
| `double_tap_action` | object | Action on double tap |
| `conditions` | array | Show/hide conditions |

See the [Configuration Guide](docs/configuration.md) for complete details.

---

## 🎯 Common Use Cases

### Classic FAB Menu
Fixed-position button in bottom-right corner that expands to show navigation options.

```yaml
position: bottom-right
offset_x: 12
offset_y: 20
```

### Bottom Navigation Bar
Center-aligned navigation bar spanning the full width.

```yaml
position: bottom-center
center_spread: true
offset_x: 0
offset_y: 20
```

### Corner Navigation
Multiple buttons arranged in a corner with backdrop.

```yaml
position: bottom-right
offset_x: 12
offset_y: 20
bottom_bar_enabled: true
bottom_bar_full_width: false
```

See the [Examples Guide](docs/examples.md) for more configurations.

---

## 🎨 Styling Options

### Global Styling
- `default_background` - Default button background
- `default_button_opacity` - Default button opacity
- `default_icon_color` - Default icon color
- `default_button_type` - Default button type
- `button_box_shadow` - Button shadow
- `button_box_shadow_hover` - Button shadow on hover

### Label Styling
- `font_size` - Label font size
- `font_weight` - Label font weight
- `color` - Label text color
- `background` - Label background color
- `border_radius` - Label border radius
- `backdrop_blur` - Label backdrop blur amount

See the [Button Configuration Guide](docs/buttons.md) for details.

---

## 🚀 Advanced Features

### Templates
Use Jinja2 templates for dynamic content:

```yaml
buttons:
  - icon: mdi:lightbulb
    label: >-
      {{ states('sensor.lights_on') }} lights on
    tooltip: >-
      {% if is_state('light.living_room', 'on') %}Turn off{% else %}Turn on{% endif %}
```

### Conditions
Show/hide buttons based on state:

```yaml
buttons:
  - icon: mdi:bell
    tooltip: Notifications
    conditions:
      - entity: sensor.notifications
        state_not: "0"
```

### Multiple Actions
Configure tap, hold, and double-tap actions:

```yaml
buttons:
  - icon: mdi:light-switch
    tap_action:
      action: toggle
      entity: light.living_room
    hold_action:
      action: more-info
      entity: light.living_room
    double_tap_action:
      action: call-service
      service: scene.turn_on
      service_data:
        entity_id: scene.movie_time
```

See the [Advanced Usage Guide](docs/advanced.md) for more features.

---

## 🐛 Troubleshooting

### Buttons not showing?
- Check that the card type is `custom:hki-navigation-card`
- Verify the card is properly loaded in your resources
- Check browser console for errors (F12)

### Buttons not positioned correctly?
- Adjust `offset_x` and `offset_y` values
- Check `position` setting is correct
- Try different `z_index` values if buttons are hidden

### Sidebar overlap issues?
- The card automatically adjusts for sidebar
- If not working, check `offset_x` value
- See [Layout Guide](docs/layout.md) for details

See the [Troubleshooting Guide](docs/troubleshooting.md) for more solutions.

---

## 📝 Version Information

**Current Version:** 1.0.0

Check the [Changelog](CHANGELOG.md) for version history and breaking changes.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Areas for Contribution
- 🎨 New themes and styling examples
- 📚 Documentation improvements
- 🐛 Bug fixes
- ✨ Feature requests and implementations
- 🌍 Translations

---

## 💬 Support

### Community Support
- [Home Assistant Community Forum](https://community.home-assistant.io/) - Search for "HKI Navigation Card"
- [GitHub Issues](https://github.com/jimz011/hki-navigation-card/issues) - Report bugs or request features

### Before Asking for Help
1. Check the [documentation](docs/)
2. Search [existing issues](https://github.com/jimz011/hki-navigation-card/issues)
3. Check the [troubleshooting guide](docs/troubleshooting.md)
4. Include your configuration and error messages when reporting issues

---

## ☕ Support the Project

If you find this card useful, consider supporting development:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow.svg)](https://www.buymeacoffee.com/YOUR_USERNAME)
[![PayPal](https://img.shields.io/badge/PayPal-Donate-blue.svg)](https://paypal.me/YOUR_USERNAME)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

Created by [jimz011](https://github.com/jimz011) with assistance from Claude AI.

### Inspiration
This card was inspired by:
- Material Design's Floating Action Button (FAB)
- iOS bottom navigation patterns
- The Homekit Infused project

### Special Thanks
- The Home Assistant community
- HACS for making distribution easy
- All contributors and testers

---

## 📱 Related Projects

- [Homekit Infused](https://github.com/jimz011/homekit-infused) - Complete dashboard framework
- [HKI Header Card](https://github.com/jimz011/hki-header-card) - Companion header card

---

**Made with ❤️ for the Home Assistant community**
