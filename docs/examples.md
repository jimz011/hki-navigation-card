# Configuration Examples

Real-world configurations you can copy and customize.

---

## Table of Contents

- [Navigation Examples](#navigation-examples)
- [Quick Action Examples](#quick-action-examples)
- [Advanced Examples](#advanced-examples)
- [Styling Examples](#styling-examples)
- [Integration Examples](#integration-examples)

---

## Navigation Examples

### Example 1: Simple FAB Menu

Classic floating action button in bottom-right corner.

```yaml
type: custom:hki-navigation-card
position: bottom-right
offset_x: 12
offset_y: 20
button_size: 50
gap: 12
z_index: 5

base:
  button:
    icon: mdi:menu
    tooltip: Menu
    background: rgba(var(--rgb-primary-color), 1)

horizontal:
  enabled: true
  columns: 5
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
    
    - icon: mdi:thermostat
      tooltip: Climate
      tap_action:
        action: navigate
        navigation_path: /lovelace/climate
    
    - icon: mdi:cog
      tooltip: Settings
      tap_action:
        action: navigate
        navigation_path: /config
```

---

### Example 2: Bottom Navigation Bar

iOS-style navigation bar at bottom center.

```yaml
type: custom:hki-navigation-card
position: bottom-center
offset_y: 20
button_size: 50
gap: 20
z_index: 5

# Enable bottom bar for backdrop
bottom_bar_enabled: true
bottom_bar_full_width: true
bottom_bar_height: 70
bottom_bar_color: rgb(var(--rgb-card-background-color))
bottom_bar_opacity: 0.95

horizontal:
  enabled: true
  columns: 5
  buttons:
    - icon: mdi:home
      label: Home
      button_type: pill
      tap_action:
        action: navigate
        navigation_path: /lovelace/0
    
    - icon: mdi:lightbulb
      label: Lights
      button_type: pill
      tap_action:
        action: navigate
        navigation_path: /lovelace/lights
    
    - icon: mdi:thermostat
      label: Climate
      button_type: pill
      tap_action:
        action: navigate
        navigation_path: /lovelace/climate
    
    - icon: mdi:video
      label: Cameras
      button_type: pill
      tap_action:
        action: navigate
        navigation_path: /lovelace/cameras
    
    - icon: mdi:cog
      label: Settings
      button_type: pill
      tap_action:
        action: navigate
        navigation_path: /config
```

---

### Example 3: Multi-Level Navigation

Base button with horizontal and vertical buttons.

```yaml
type: custom:hki-navigation-card
position: bottom-right
offset_x: 12
offset_y: 20
button_size: 50
gap: 12
vertical_gap: 12
z_index: 5

base:
  button:
    icon: mdi:apps
    tooltip: Apps
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)

horizontal:
  enabled: true
  columns: 4
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

vertical:
  enabled: true
  rows: 3
  buttons:
    - icon: mdi:robot-vacuum
      tooltip: Vacuum
      tap_action:
        action: navigate
        navigation_path: /lovelace/vacuum
    
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

---

## Quick Action Examples

### Example 4: Light Controls

Toggle and control lights quickly.

```yaml
type: custom:hki-navigation-card
position: bottom-right
offset_x: 12
offset_y: 20
button_size: 50
gap: 12

base:
  button:
    icon: mdi:lightbulb
    tooltip: Lights
    entity: light.all_lights

horizontal:
  enabled: true
  columns: 4
  buttons:
    - icon: mdi:lightbulb
      label: All Lights
      entity: light.all_lights
      tap_action:
        action: toggle
        entity: light.all_lights
      hold_action:
        action: more-info
        entity: light.all_lights
    
    - icon: mdi:sofa
      label: Living Room
      entity: light.living_room
      tap_action:
        action: toggle
        entity: light.living_room
      hold_action:
        action: more-info
        entity: light.living_room
    
    - icon: mdi:bed
      label: Bedroom
      entity: light.bedroom
      tap_action:
        action: toggle
        entity: light.bedroom
      hold_action:
        action: more-info
        entity: light.bedroom
    
    - icon: mdi:silverware-fork-knife
      label: Kitchen
      entity: light.kitchen
      tap_action:
        action: toggle
        entity: light.kitchen
      hold_action:
        action: more-info
        entity: light.kitchen
```

---

### Example 5: Scene Activation

Quick scene switcher with custom colors.

```yaml
type: custom:hki-navigation-card
position: bottom-right
offset_x: 12
offset_y: 20
button_size: 55
gap: 14

base:
  button:
    icon: mdi:palette
    tooltip: Scenes
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)

horizontal:
  enabled: true
  columns: 4
  buttons:
    - icon: mdi:white-balance-sunny
      label: Bright
      background: "#FFD700"
      icon_color: "#FFFFFF"
      tap_action:
        action: call-service
        service: scene.turn_on
        service_data:
          entity_id: scene.bright
    
    - icon: mdi:movie
      label: Movie
      background: "#4A148C"
      icon_color: "#FFFFFF"
      tap_action:
        action: call-service
        service: scene.turn_on
        service_data:
          entity_id: scene.movie_time
    
    - icon: mdi:weather-sunset
      label: Evening
      background: "#FF6F00"
      icon_color: "#FFFFFF"
      tap_action:
        action: call-service
        service: scene.turn_on
        service_data:
          entity_id: scene.evening
    
    - icon: mdi:moon-waning-crescent
      label: Night
      background: "#1A237E"
      icon_color: "#FFFFFF"
      tap_action:
        action: call-service
        service: scene.turn_on
        service_data:
          entity_id: scene.goodnight
```

---

### Example 6: Climate Quick Controls

Temperature and HVAC shortcuts.

```yaml
type: custom:hki-navigation-card
position: bottom-right
offset_x: 12
offset_y: 20
button_size: 50
gap: 12

base:
  button:
    icon: mdi:thermostat
    tooltip: Climate
    entity: climate.living_room

horizontal:
  enabled: true
  columns: 4
  buttons:
    - icon: mdi:snowflake
      label: Cool
      background: "#039BE5"
      icon_color: "#FFFFFF"
      tap_action:
        action: call-service
        service: climate.set_hvac_mode
        service_data:
          entity_id: climate.living_room
          hvac_mode: cool
    
    - icon: mdi:fire
      label: Heat
      background: "#EF5350"
      icon_color: "#FFFFFF"
      tap_action:
        action: call-service
        service: climate.set_hvac_mode
        service_data:
          entity_id: climate.living_room
          hvac_mode: heat
    
    - icon: mdi:fan
      label: Fan
      background: "#66BB6A"
      icon_color: "#FFFFFF"
      tap_action:
        action: call-service
        service: climate.set_hvac_mode
        service_data:
          entity_id: climate.living_room
          hvac_mode: fan_only
    
    - icon: mdi:power
      label: Off
      background: "#757575"
      icon_color: "#FFFFFF"
      tap_action:
        action: call-service
        service: climate.turn_off
        service_data:
          entity_id: climate.living_room
```

---

## Advanced Examples

### Example 7: Conditional Buttons

Show different buttons based on states.

```yaml
type: custom:hki-navigation-card
position: bottom-right
offset_x: 12
offset_y: 20
button_size: 50
gap: 12

base:
  button:
    icon: mdi:bell
    tooltip: Notifications
    # Show badge if there are notifications
    entity: sensor.notification_count

horizontal:
  enabled: true
  columns: 4
  buttons:
    # Only show if someone is home
    - icon: mdi:home-account
      label: Welcome Home
      tap_action:
        action: call-service
        service: script.welcome_home
      conditions:
        - entity: binary_sensor.someone_home
          state: "on"
    
    # Only show if alarm is armed
    - icon: mdi:shield-home
      label: Disarm
      background: "#EF5350"
      tap_action:
        action: call-service
        service: alarm_control_panel.alarm_disarm
        service_data:
          entity_id: alarm_control_panel.home
      conditions:
        - entity: alarm_control_panel.home
          state_not: disarmed
    
    # Only show if doors/windows open
    - icon: mdi:door-open
      label: Close All
      tap_action:
        action: call-service
        service: script.close_all_doors
      conditions:
        - entity: binary_sensor.doors_open
          state: "on"
    
    # Only show if washing machine is done
    - icon: mdi:washing-machine
      label: Done!
      background: "#4CAF50"
      tap_action:
        action: call-service
        service: notify.mobile_app
        service_data:
          message: Laundry is done!
      conditions:
        - entity: sensor.washing_machine
          state: "complete"
```

---

### Example 8: Template-Based Buttons

Dynamic labels using templates.

```yaml
type: custom:hki-navigation-card
position: bottom-right
offset_x: 12
offset_y: 20
button_size: 50
gap: 12

base:
  button:
    icon: mdi:information
    tooltip: Info
    # Dynamic label with count
    label: >-
      {{ states('sensor.active_lights') }} lights

horizontal:
  enabled: true
  columns: 3
  buttons:
    - icon: mdi:lightbulb
      # Show count of lights on
      label: >-
        {{ states('sensor.lights_on') }} on
      tooltip: >-
        {% if states('sensor.lights_on')|int > 0 %}
          Turn off {{ states('sensor.lights_on') }} lights
        {% else %}
          All lights are off
        {% endif %}
      entity: light.all_lights
      tap_action:
        action: toggle
        entity: light.all_lights
    
    - icon: mdi:thermometer
      # Show current temperature
      label: >-
        {{ states('sensor.living_room_temperature') }}°
      tooltip: Living Room Climate
      entity: climate.living_room
      tap_action:
        action: more-info
        entity: climate.living_room
    
    - icon: mdi:gauge
      # Show energy usage
      label: >-
        {{ states('sensor.power_consumption') }} W
      tooltip: Current power usage
      entity: sensor.power_consumption
      tap_action:
        action: navigate
        navigation_path: /lovelace/energy
```

---

## Styling Examples

### Example 9: Gradient Buttons

Beautiful gradient backgrounds.

```yaml
type: custom:hki-navigation-card
position: bottom-right
offset_x: 12
offset_y: 20
button_size: 55
gap: 14
button_box_shadow: 0 8px 24px rgba(0, 0, 0, 0.35)
button_box_shadow_hover: 0 10px 30px rgba(0, 0, 0, 0.42)

base:
  button:
    icon: mdi:apps
    tooltip: Apps
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)

horizontal:
  enabled: true
  columns: 4
  buttons:
    - icon: mdi:home
      tooltip: Home
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)
      tap_action:
        action: navigate
        navigation_path: /lovelace/0
    
    - icon: mdi:lightbulb
      tooltip: Lights
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)
      tap_action:
        action: navigate
        navigation_path: /lovelace/lights
    
    - icon: mdi:thermostat
      tooltip: Climate
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)
      tap_action:
        action: navigate
        navigation_path: /lovelace/climate
    
    - icon: mdi:video
      tooltip: Cameras
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)
      tap_action:
        action: navigate
        navigation_path: /lovelace/cameras
```

---

### Example 10: Custom Label Styling

Advanced label customization.

```yaml
type: custom:hki-navigation-card
position: bottom-center
offset_y: 20
button_size: 50
gap: 20

# Custom label styling
label_style:
  font_size: 11
  font_weight: 600
  letter_spacing: 0.5
  text_transform: uppercase
  color: "#FFFFFF"
  background: rgba(0, 0, 0, 0.8)
  background_opacity: 0.8
  padding_x: 12
  padding_y: 6
  border_radius: 16
  backdrop_blur: 10
  max_width: 120

horizontal:
  enabled: true
  columns: 5
  buttons:
    - icon: mdi:home
      label: Home
      button_type: pill
      tap_action:
        action: navigate
        navigation_path: /lovelace/0
    
    - icon: mdi:lightbulb
      label: Lights
      button_type: pill
      tap_action:
        action: navigate
        navigation_path: /lovelace/lights
    
    - icon: mdi:thermostat
      label: Climate
      button_type: pill
      tap_action:
        action: navigate
        navigation_path: /lovelace/climate
    
    - icon: mdi:video
      label: Security
      button_type: pill
      tap_action:
        action: navigate
        navigation_path: /lovelace/cameras
    
    - icon: mdi:cog
      label: Settings
      button_type: pill
      tap_action:
        action: navigate
        navigation_path: /config
```

---

## Integration Examples

### Example 11: Complete Smart Home Control

All-in-one control panel.

```yaml
type: custom:hki-navigation-card
position: bottom-right
offset_x: 12
offset_y: 20
button_size: 50
gap: 12
vertical_gap: 12
z_index: 5

base:
  button:
    icon: mdi:home-assistant
    tooltip: Smart Home
    background: rgba(var(--rgb-primary-color), 1)

horizontal:
  enabled: true
  columns: 5
  buttons:
    # Navigation
    - icon: mdi:view-dashboard
      tooltip: Dashboard
      tap_action:
        action: navigate
        navigation_path: /lovelace/0
    
    # Lights with state
    - icon: mdi:lightbulb
      label: >-
        {{ states('sensor.lights_on') }}
      tooltip: Lights
      entity: light.all_lights
      tap_action:
        action: toggle
        entity: light.all_lights
      hold_action:
        action: navigate
        navigation_path: /lovelace/lights
    
    # Climate with temperature
    - icon: mdi:thermostat
      label: >-
        {{ states('sensor.average_temperature') }}°
      tooltip: Climate
      entity: climate.living_room
      tap_action:
        action: more-info
        entity: climate.living_room
    
    # Security status
    - icon: >-
        {% if is_state('alarm_control_panel.home', 'armed_away') %}
          mdi:shield-lock
        {% elif is_state('alarm_control_panel.home', 'armed_home') %}
          mdi:shield-home
        {% else %}
          mdi:shield-off
        {% endif %}
      tooltip: >-
        {% if is_state('alarm_control_panel.home', 'armed_away') %}
          Armed Away
        {% elif is_state('alarm_control_panel.home', 'armed_home') %}
          Armed Home
        {% else %}
          Disarmed
        {% endif %}
      entity: alarm_control_panel.home
      tap_action:
        action: more-info
        entity: alarm_control_panel.home
    
    # Media
    - icon: mdi:play
      tooltip: Media
      entity: media_player.living_room
      tap_action:
        action: more-info
        entity: media_player.living_room

vertical:
  enabled: true
  rows: 2
  buttons:
    # Vacuum with status
    - icon: mdi:robot-vacuum
      label: >-
        {{ states('vacuum.robot') }}
      tooltip: Vacuum
      entity: vacuum.robot
      tap_action:
        action: more-info
        entity: vacuum.robot
    
    # Cameras
    - icon: mdi:cctv
      tooltip: Cameras
      tap_action:
        action: navigate
        navigation_path: /lovelace/cameras
```

---

See [Documentation Index](INDEX.md) for more guides!

---

[← Back to Quick Start](quick-start.md)
