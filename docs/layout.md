# Layout & Positioning Guide

Complete guide to positioning and layout options.

---

## Table of Contents

- [Position Modes](#position-modes)
- [Offset Configuration](#offset-configuration)
- [Sidebar Awareness](#sidebar-awareness)
- [Screen-Size Overrides](#screen-size-overrides)
- [Z-Index Control](#z-index-control)
- [Center Spread Mode](#center-spread-mode)
- [Button Arrangement](#button-arrangement)
- [Best Practices](#best-practices)

---

## Position Modes

The card supports three position modes for placing buttons.

### Bottom-Right (Default)

Classic floating action button position.

```yaml
position: bottom-right
offset_x: 12
offset_y: 20
```

**When to use:**
- FAB-style menus
- Quick actions
- Right-handed users
- Standard mobile pattern

**Behavior:**
- Buttons fixed to bottom-right corner
- Automatically adjusts for right sidebar
- `offset_x` measured from right edge
- `offset_y` measured from bottom edge

---

### Bottom-Left

Alternative corner positioning.

```yaml
position: bottom-left
offset_x: 12
offset_y: 20
```

**When to use:**
- Left-handed users
- Balance with right-side content
- Alternative navigation style

**Behavior:**
- Buttons fixed to bottom-left corner
- Automatically adjusts for left sidebar
- `offset_x` measured from left edge
- `offset_y` measured from bottom edge

---

### Bottom-Center

Centered navigation bar style.

```yaml
position: bottom-center
offset_x: 0      # Usually 0 for centered
offset_y: 20
```

**When to use:**
- Navigation bars
- iOS-style bottom navigation
- Balanced button distribution
- Multiple equally-important actions

**Behavior:**
- Buttons centered horizontally
- `offset_x` usually 0 (can add offset if needed)
- `offset_y` measured from bottom edge
- Works with `center_spread` for full-width distribution

---

## Offset Configuration

### Offset X - Horizontal Position

Distance from the edge (left/right) or center.

**For bottom-left and bottom-right:**
```yaml
offset_x: 12    # 12px from edge
offset_x: 30    # 30px from edge
offset_x: 0     # Flush with edge
```

**For bottom-center:**
```yaml
offset_x: 0     # Centered (typical)
offset_x: 50    # 50px offset from center (unusual)
```

**Range:** Any integer
**Default:** 12px
**Units:** Pixels

---

### Offset Y - Vertical Position

Distance from bottom of viewport.

```yaml
offset_y: 20    # 20px from bottom (default)
offset_y: 10    # Closer to bottom
offset_y: 50    # Further from bottom
offset_y: 0     # Flush with bottom
```

**Range:** Any integer
**Default:** 20px
**Units:** Pixels

**Common values:**
- `10-15px` - Compact spacing
- `20-30px` - Comfortable spacing (recommended)
- `40-60px` - Spacious

---

### Offset Examples

**Close to corner:**
```yaml
position: bottom-right
offset_x: 8
offset_y: 12
```

**Standard spacing:**
```yaml
position: bottom-right
offset_x: 12
offset_y: 20
```

**More space:**
```yaml
position: bottom-right
offset_x: 24
offset_y: 32
```

---

## Sidebar Awareness

The card automatically detects and adjusts for Home Assistant's sidebar and panels.

### How It Works

**Bottom-right position:**
- Detects right panel width
- Adds panel width to `offset_x`
- Buttons stay visible with correct spacing

**Bottom-left position:**
- Detects left sidebar width
- Adds sidebar width to `offset_x`
- Buttons move with sidebar open/close

**Example behavior:**

```yaml
# Your configuration
position: bottom-left
offset_x: 12

# Sidebar closed (256px)
# Buttons at: 12px from left edge

# Sidebar opens (256px wide)
# Buttons automatically move to: 268px (12 + 256)
```

---

### Manual Testing

To verify sidebar awareness:

1. Configure card with `position: bottom-left` or `bottom-right`
2. Set `offset_x: 50`
3. Open/close sidebar
4. Buttons should maintain 50px spacing from content edge

---

### Disabling Sidebar Adjustment

You cannot disable automatic sidebar adjustment. This is by design to ensure buttons remain accessible.

**Workaround** if needed:
- Use `bottom-center` position (no sidebar adjustment)
- Manually calculate offset including sidebar width

---

## Screen-Size Overrides

Configure different offsets for mobile, tablet, and desktop.

### Configuration

```yaml
# Base offset (fallback)
offset_x: 12

# Screen-size overrides (optional)
offset_x_mobile: 8      # < 768px
offset_x_tablet: 16     # 768px - 1024px
offset_x_desktop: 24    # > 1024px
```

### Breakpoints

| Screen Size | Width Range | Override Field |
|-------------|-------------|----------------|
| Mobile | < 768px | `offset_x_mobile` |
| Tablet | 768px - 1024px | `offset_x_tablet` |
| Desktop | > 1024px | `offset_x_desktop` |

---

### When To Use

✅ **Use overrides when:**
- Mobile needs closer buttons
- Desktop has more screen space
- Different devices have different needs
- Optimizing for specific layouts

❌ **Don't use when:**
- Same offset works everywhere
- You haven't tested on different devices
- Overcomplicating simple layouts

---

### Examples

**Closer on mobile:**
```yaml
position: bottom-right
offset_x: 24        # Desktop/tablet default
offset_x_mobile: 12 # Closer on mobile
```

**Different per device:**
```yaml
position: bottom-right
offset_x: 16          # Fallback
offset_x_mobile: 8    # Compact on mobile
offset_x_tablet: 16   # Standard on tablet
offset_x_desktop: 32  # Spacious on desktop
```

**Only override one size:**
```yaml
position: bottom-right
offset_x: 12
offset_x_desktop: 24  # Only different on desktop
# Mobile and tablet use base offset_x (12)
```

---

### Important Notes

- Overrides only affect `offset_x`, not `offset_y`
- If override is `null`, uses base `offset_x`
- Sidebar adjustment still applies automatically
- Test on actual devices, not just resizing browser

---

## Z-Index Control

Control button stacking order relative to other page elements.

### Understanding Z-Index

Z-index determines which elements appear "on top" when they overlap.

**Higher z-index = appears on top**

```yaml
z_index: 1     # Behind most content
z_index: 5     # Default, above content
z_index: 10    # Above most elements
z_index: 100   # Above almost everything
```

---

### Common Z-Index Values

| Value | Layer | Use Case |
|-------|-------|----------|
| 1 | Low | Behind floating panels |
| 5 | Normal | Default, above content |
| 10 | High | Above panels |
| 100 | Very High | Above modals |
| 999 | Maximum | Above everything (rare) |

---

### When To Adjust

**Increase z-index when:**
- Buttons appear behind content
- Other elements cover buttons
- Buttons hidden by modals/overlays

**Decrease z-index when:**
- Buttons appear above sidebar inappropriately
- Buttons block important dialogs
- Buttons overlap menus unexpectedly

---

### Examples

**Default (recommended):**
```yaml
z_index: 5
```

**Above sidebar:**
```yaml
z_index: 10
```

**Behind panels:**
```yaml
z_index: 1
```

---

### Troubleshooting Z-Index

**Problem:** Buttons behind content
**Solution:** Increase z_index (try 10, then 20, etc.)

**Problem:** Buttons block sidebar
**Solution:** Decrease z_index (try 3, then 1)

**Problem:** Buttons appear/disappear randomly
**Solution:** Check for conflicting z-index on other cards

---

## Center Spread Mode

Distribute buttons evenly across viewport width.

### Basic Usage

```yaml
position: bottom-center
center_spread: true
offset_y: 20

horizontal:
  enabled: true
  columns: 5
  buttons:
    - icon: mdi:home
    # ... more buttons
```

---

### Behavior

**When enabled:**
- Buttons spread across full width
- Even spacing between buttons
- Automatically adjusts to screen size
- Works only with `position: bottom-center`

**When disabled (default):**
- Buttons grouped together
- Standard gap spacing used
- Centered as a group

---

### Visual Comparison

**center_spread: false (default):**
```
        [btn] [btn] [btn] [btn] [btn]
```

**center_spread: true:**
```
[btn]    [btn]    [btn]    [btn]    [btn]
```

---

### Use Cases

✅ **Use center spread for:**
- iOS-style navigation bars
- Full-width button arrays
- Equal importance buttons
- Maximum screen utilization

❌ **Don't use for:**
- FAB-style menus
- Grouped actions
- Corner positioning (won't work)
- Few buttons (wastes space)

---

### Examples

**Full-width navigation:**
```yaml
position: bottom-center
center_spread: true
offset_y: 20

horizontal:
  enabled: true
  columns: 5
  buttons:
    - icon: mdi:home
      label: Home
    - icon: mdi:lightbulb
      label: Lights
    - icon: mdi:thermostat
      label: Climate
    - icon: mdi:cctv
      label: Cameras
    - icon: mdi:cog
      label: Settings
```

---

## Button Arrangement

### Horizontal Group

Buttons flow left-to-right, wrapping to new rows.

```yaml
horizontal:
  enabled: true
  columns: 4    # Max per row
  buttons:
    - icon: mdi:home
    - icon: mdi:lightbulb
    - icon: mdi:thermostat
    - icon: mdi:cctv
    - icon: mdi:cog    # Wraps to row 2
```

**Layout:**
```
[1] [2] [3] [4]
[5]
```

---

### Vertical Group

Buttons stack top-to-bottom, wrapping to new columns.

```yaml
vertical:
  enabled: true
  rows: 3       # Max per column
  buttons:
    - icon: mdi:home
    - icon: mdi:lightbulb
    - icon: mdi:thermostat
    - icon: mdi:cctv    # Wraps to column 2
```

**Layout:**
```
[1] [4]
[2]
[3]
```

---

### Combined Layout

Both horizontal and vertical groups together.

```yaml
horizontal:
  enabled: true
  columns: 4
  buttons:
    # ... horizontal buttons

vertical:
  enabled: true
  rows: 3
  buttons:
    # ... vertical buttons
```

**Position relative to each other:**
```
[H] [H] [H] [H]  [V]
                 [V]
                 [V]
```

Where H = horizontal, V = vertical

---

### Gap Spacing

**gap** - Horizontal spacing (default: 12px)
```yaml
gap: 12   # Space between horizontal buttons
```

**vertical_gap** - Vertical spacing (default: 12px)
```yaml
vertical_gap: 12   # Space between vertical buttons
```

**Examples:**

```yaml
# Compact
gap: 8
vertical_gap: 8

# Spacious
gap: 20
vertical_gap: 20
```

---

## Best Practices

### Position Selection

✅ **Do:**
- Use bottom-right for FAB menus (most common)
- Use bottom-center for navigation bars
- Consider user handedness
- Test on actual devices

❌ **Don't:**
- Use bottom-left without testing
- Forget mobile users
- Ignore sidebar interaction
- Overcomplicate positioning

---

### Offset Values

✅ **Do:**
- Start with defaults (12px / 20px)
- Adjust based on actual use
- Test with sidebar open/closed
- Keep values reasonable (8-50px)

❌ **Don't:**
- Use 0px (too close to edge)
- Use huge values (>100px)
- Set different values without testing
- Forget about different screen sizes

---

### Screen Overrides

✅ **Do:**
- Test on real devices first
- Use only if needed
- Keep values logical
- Document why you're using them

❌ **Don't:**
- Add overrides "just in case"
- Use wildly different values
- Forget to test all sizes
- Over-engineer simple layouts

---

### Z-Index

✅ **Do:**
- Start with default (5)
- Only change if problems occur
- Test sidebar interaction
- Document why you changed it

❌ **Don't:**
- Set to 999 by default
- Ignore visual stacking issues
- Forget about modal dialogs
- Use arbitrary values

---

## Troubleshooting

### Buttons Not Visible

**Possible causes:**
- Wrong position setting
- Offsets too large
- Z-index too low
- Hidden by other elements

**Solutions:**
1. Check `position` value
2. Reduce `offset_x` and `offset_y`
3. Increase `z_index`
4. Inspect with browser dev tools (F12)

---

### Buttons in Wrong Place

**Possible causes:**
- Incorrect position mode
- Wrong offset values
- Sidebar not detected
- Screen override conflict

**Solutions:**
1. Verify `position` setting
2. Check `offset_x` / `offset_y` values
3. Test with sidebar open/closed
4. Check screen-size overrides

---

### Buttons Move Unexpectedly

**Possible causes:**
- Sidebar opening/closing (expected)
- Screen size changing
- Z-index conflicts

**Solutions:**
1. This is normal sidebar behavior
2. Check screen-size overrides
3. Adjust z-index if needed

---

### Buttons Behind Content

**Cause:** Z-index too low

**Solution:**
```yaml
z_index: 10  # Increase from default 5
```

---

### Buttons Above Sidebar

**Cause:** Z-index too high

**Solution:**
```yaml
z_index: 3   # Decrease from default 5
```

---

## Examples

### Complete Position Configs

**FAB in bottom-right:**
```yaml
position: bottom-right
offset_x: 12
offset_y: 20
z_index: 5
```

**Navigation bar:**
```yaml
position: bottom-center
center_spread: true
offset_y: 20
z_index: 5
```

**Left corner with sidebar awareness:**
```yaml
position: bottom-left
offset_x: 12
offset_y: 20
z_index: 5
# Automatically adjusts when sidebar opens
```

**Responsive offsets:**
```yaml
position: bottom-right
offset_x: 16
offset_x_mobile: 8
offset_x_desktop: 24
offset_y: 20
z_index: 5
```

---

## See Also

- [Configuration Guide](configuration.md) - All config options
- [Button Configuration](buttons.md) - Button setup
- [Examples](examples.md) - Real-world layouts

---

[← Back to Documentation Index](INDEX.md)
