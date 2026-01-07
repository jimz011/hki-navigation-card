# Quick Start Guide

Get up and running with HKI Navigation Card in 5 minutes!

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Your First Card](#your-first-card)
- [Basic Configurations](#basic-configurations)
- [Common Customizations](#common-customizations)
- [Next Steps](#next-steps)

---

## Prerequisites

Before you start, make sure you've:

✅ Installed the card (see [Installation Guide](installation.md))  
✅ Restarted Home Assistant  
✅ Cleared your browser cache  

---

## Your First Card

### Step 1: Add the Card

1. Edit your dashboard
2. Add a new card (any section/view)
3. Search for "HKI Navigation Card" or use YAML mode

### Step 2: Basic Configuration

Paste this minimal configuration:

```yaml
type: custom:hki-navigation-card
position: bottom-right
base:
  button:
    icon: mdi:home
    tooltip: Home
    tap_action:
      action: navigate
      navigation_path: /lovelace/0
```

### Step 3: See the Result

You should see a single floating button in the bottom-right corner! Click it to navigate to your home dashboard.

---

## Basic Configurations

### Configuration 1: Simple Navigation Menu

A button that opens to show navigation options:

```yaml
type: custom:hki-navigation-card
position: bottom-right
offset_x: 12
offset_y: 20
button_size: 50
gap: 12

base:
  button:
    icon: mdi:menu
    tooltip: Menu
    background: rgba(var(--rgb-primary-color), 1)

horizontal:
  enabled: true
  columns: 6
  buttons:
    - icon: mdi:home
      tooltip: Home
      tap_action:
        action: navigate
        navigation_path: /lovelace/0
    
    - icon: mdi:floor-plan
      tooltip: Floor Plan
      tap_action:
        action: navigate
        navigation_path: /lovelace/floorplan
    
    - icon: mdi:lightbulb-group
      tooltip: Lights
      tap_action:
        action: navigate
        navigation_path: /lovelace/lights
    
    - icon: mdi:thermometer
      tooltip: Climate
      tap_action:
        action: navigate
        navigation_path: /lovelace/climate
```

**What this does:**
- Shows a menu button in bottom-right
- Expands to show 4 navigation buttons horizontally
- Each button navigates to a different dashboard

---

### Configuration 2: Bottom Navigation Bar

A navigation bar centered at the bottom:

```yaml
type: custom:hki-navigation-card
position: bottom-center
offset_y: 20
button_size: 50
gap: 20
center_spread: false

horizontal:
  enabled: true
  columns: 5
  buttons:
    - icon: mdi:home
      tooltip: Home
      tap_action:
        action: navigate
        navigation_path: /lovelace/0
    
    - icon: mdi:lightbulb
      tooltip: Lights
      tap_action:
        action: navigate
        navigation_path: /lovelace/lights
    
    - icon: mdi:thermostat
      tooltip: Climate
      tap_action:
        action: navigate
        navigation_path: /lovelace/climate
    
    - icon: mdi:cctv
      tooltip: Cameras
      tap_action:
        action: navigate
        navigation_path: /lovelace/cameras
    
    - icon: mdi:cog
      tooltip: Settings
      tap_action:
        action: navigate
        navigation_path: /config
```

**What this does:**
- Creates a centered navigation bar at the bottom
- Shows 5 buttons with equal spacing
- Classic mobile app navigation style

---

### Configuration 3: Quick Actions

Toggle buttons for quick control:

```yaml
type: custom:hki-navigation-card
position: bottom-right
offset_x: 12
offset_y: 20
button_size: 50

base:
  button:
    icon: mdi:lightning-bolt
    tooltip: Quick Actions

horizontal:
  enabled: true
  columns: 4
  buttons:
    - icon: mdi:lightbulb
      tooltip: All Lights
      entity: light.all_lights
      tap_action:
        action: toggle
        entity: light.all_lights
    
    - icon: mdi:fan
      tooltip: Living Room Fan
      entity: fan.living_room
      tap_action:
        action: toggle
        entity: fan.living_room
    
    - icon: mdi:lock
      tooltip: Front Door
      entity: lock.front_door
      tap_action:
        action: toggle
        entity: lock.front_door
    
    - icon: mdi:robot-vacuum
      tooltip: Start Vacuum
      tap_action:
        action: call-service
        service: vacuum.start
        service_data:
          entity_id: vacuum.robot
```

**What this does:**
- Shows a lightning bolt button
- Expands to show 4 control buttons
- Buttons toggle entities or call services
- Button colors reflect entity states

---

## Common Customizations

### Change Position

```yaml
# Bottom-right corner (default)
position: bottom-right
offset_x: 12
offset_y: 20

# Bottom-left corner
position: bottom-left
offset_x: 12
offset_y: 20

# Bottom-center
position: bottom-center
offset_y: 20
```

---

### Change Button Size

```yaml
# Small buttons (40px)
button_size: 40
gap: 8

# Default buttons (50px)
button_size: 50
gap: 12

# Large buttons (60px)
button_size: 60
gap: 16
```

---

### Add Colors

```yaml
buttons:
  # Primary color button
  - icon: mdi:home
    tooltip: Home
    background: rgba(var(--rgb-primary-color), 1)
    tap_action:
      action: navigate
      navigation_path: /lovelace/0
  
  # Custom color button
  - icon: mdi:lightbulb
    tooltip: Lights
    background: "#FFA500"
    icon_color: "#FFFFFF"
    tap_action:
      action: toggle
      entity: light.living_room
  
  # Gradient button
  - icon: mdi:weather-sunset
    tooltip: Scenes
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    tap_action:
      action: navigate
      navigation_path: /lovelace/scenes
```

---

### Add Button Labels

```yaml
buttons:
  # Icon with label (shows on hover by default)
  - icon: mdi:home
    label: Home
    tooltip: Go to Home
    button_type: icon  # Label shows on hover
    tap_action:
      action: navigate
      navigation_path: /lovelace/0
  
  # Pill button (always shows label)
  - icon: mdi:lightbulb
    label: Lights
    button_type: pill
    tap_action:
      action: navigate
      navigation_path: /lovelace/lights
  
  # Icon + label side-by-side
  - icon: mdi:thermometer
    label: Climate
    button_type: icon-label
    tap_action:
      action: navigate
      navigation_path: /lovelace/climate
```

---

### Add Shadows and Effects

```yaml
# Global shadow for all buttons
button_box_shadow: 0 8px 24px rgba(0, 0, 0, 0.35)
button_box_shadow_hover: 0 10px 30px rgba(0, 0, 0, 0.42)

# Per-button effects
horizontal:
  buttons:
    - icon: mdi:home
      tooltip: Home
      background: "rgba(var(--rgb-primary-color), 1)"
      # This button will use the global shadow
      tap_action:
        action: navigate
        navigation_path: /lovelace/0
```

---

### Change Stacking Order

```yaml
# If buttons appear behind other elements
z_index: 10

# If buttons appear in front of sidebar (too high)
z_index: 5  # Default

# If buttons appear behind content
z_index: 1
```

---

## Testing Your Configuration

### Check Console for Errors

1. Open browser console (F12)
2. Look for red error messages
3. You should see: `hki-navigation-card v1.0.0`

### Common Issues

**Buttons don't appear:**
- Check `position` value is correct
- Try adjusting `offset_x` and `offset_y`
- Verify button configuration has required fields

**Buttons behind other elements:**
- Increase `z_index` value
- Check if other cards have high z-index

**Actions don't work:**
- Check `tap_action` syntax
- Verify entity IDs exist
- Check browser console for errors

---

## Next Steps

Now that you have a working card, explore more features:

### Read the Guides

- 📘 [Configuration Guide](configuration.md) - All configuration options
- 🎨 [Button Configuration](buttons.md) - Advanced button styling
- 📐 [Layout & Positioning](layout.md) - Layout options
- 🎭 [Advanced Usage](advanced.md) - Templates, conditions, and more
- 📚 [Examples](examples.md) - Real-world configurations

### Try Advanced Features

- Add dynamic labels with templates
- Use conditions to show/hide buttons
- Create vertical button columns
- Add a backdrop bar behind buttons
- Customize label styling

---

## Getting Help

If you're stuck:

1. Check the [Troubleshooting Guide](troubleshooting.md)
2. Review the [Examples](examples.md) for inspiration
3. Ask on [GitHub Discussions](https://github.com/jimz011/hki-navigation-card/discussions)
4. Report bugs on [GitHub Issues](https://github.com/jimz011/hki-navigation-card/issues)

---

**Happy customizing!** 🎉

---

[← Back to Installation](installation.md) | [Next: Full Configuration →](configuration.md)
