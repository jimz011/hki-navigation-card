# Documentation Index

Complete documentation for HKI Navigation Card.

---

## Getting Started

### New Users Start Here!

1. **[Installation Guide](installation.md)** - Install the card via HACS or manually
2. **[Quick Start Guide](quick-start.md)** - Get up and running in 5 minutes
3. **[Examples](examples.md)** - Copy and paste real-world configurations

---

## Configuration

### Core Configuration

- **[Configuration Guide](configuration.md)** - Complete configuration reference
  - Layout settings
  - Position and offset
  - Button groups
  - Global styling

- **[Button Configuration](buttons.md)** - Everything about buttons
  - Button types
  - Styling options
  - Actions and interactions
  - Entity integration

- **[Layout & Positioning](layout.md)** - Layout options
  - Position modes
  - Sidebar awareness
  - Screen-size overrides
  - Z-index control

---

## Advanced Features

- **[Bottom Bar Guide](bottom-bar.md)** - Backdrop customization (⚠️ experimental)
  - Enable/disable
  - Full-width vs wrapping
  - Styling and colors
  - Inset margins

- **[Advanced Usage](advanced.md)** - Power user features
  - Jinja2 templates
  - Conditional visibility
  - Multiple actions
  - Dynamic styling
  - State-based appearance

---

## Help & Support

- **[Troubleshooting](troubleshooting.md)** - Common issues and solutions
  - Installation problems
  - Display issues
  - Action problems
  - Performance tips

- **[FAQ](faq.md)** - Frequently asked questions
  - General questions
  - Feature questions
  - Compatibility questions

---

## Reference

- **[Complete API Reference](api-reference.md)** - All options documented
- **[Changelog](../CHANGELOG.md)** - Version history and breaking changes
- **[Examples Library](examples.md)** - Community configurations

---

## By Topic

### I want to...

**...position buttons**
→ [Layout & Positioning Guide](layout.md)

**...style buttons**
→ [Button Configuration Guide](buttons.md)

**...use templates**
→ [Advanced Usage Guide](advanced.md)

**...add a backdrop bar**
→ [Bottom Bar Guide](bottom-bar.md)

**...show/hide buttons conditionally**
→ [Advanced Usage Guide - Conditions](advanced.md#conditional-visibility)

**...create navigation buttons**
→ [Quick Start Guide](quick-start.md)

**...toggle entities**
→ [Button Configuration - Actions](buttons.md#actions)

**...fix display issues**
→ [Troubleshooting Guide](troubleshooting.md)

---

## By Experience Level

### Beginner
1. [Installation](installation.md)
2. [Quick Start](quick-start.md)
3. [Examples](examples.md) - Copy these first!
4. [Configuration basics](configuration.md)

### Intermediate
1. [Button customization](buttons.md)
2. [Layout options](layout.md)
3. [Basic templates](advanced.md#templates)
4. [Conditions](advanced.md#conditional-visibility)

### Advanced
1. [Complete API](api-reference.md)
2. [Complex templates](advanced.md)
3. [Bottom bar](bottom-bar.md)
4. [Custom styling](buttons.md#advanced-styling)

---

## External Resources

- [Home Assistant Templating](https://www.home-assistant.io/docs/configuration/templating/)
- [Material Design Icons](https://materialdesignicons.com/)
- [CSS Gradient Generator](https://cssgradient.io/)
- [Color Picker](https://htmlcolorcodes.com/color-picker/)

---

## Quick Reference

### Minimum Configuration

```yaml
type: custom:hki-navigation-card
position: bottom-right
base:
  button:
    icon: mdi:home
    tap_action:
      action: none
```

### Common Positions

```yaml
position: bottom-right  # Default, FAB style
position: bottom-left   # Alternative corner
position: bottom-center # Navigation bar
```

### Button Types

```yaml
button_type: icon       # Icon only (default)
button_type: pill       # Icon + always-visible label
button_type: icon-label # Icon + label side-by-side
```

---

[← Back to README](../README.md)
