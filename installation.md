# Installation Guide

This guide covers all installation methods for the HKI Navigation Card.

---

## Table of Contents

- [Requirements](#requirements)
- [Installation via HACS (Recommended)](#installation-via-hacs-recommended)
- [Manual Installation](#manual-installation)
- [Verification](#verification)
- [Updating](#updating)
- [Troubleshooting Installation](#troubleshooting-installation)

---

## Requirements

### Home Assistant
- **Minimum version:** 2023.1.0 or newer
- **Recommended:** Latest stable version

### Dependencies
- None! This is a standalone card with no external dependencies

### Browser Compatibility
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Home Assistant Mobile App

---

## Installation via HACS (Recommended)

HACS (Home Assistant Community Store) is the easiest way to install and update the card.

### Step 1: Install HACS

If you don't have HACS installed:

1. Visit [https://hacs.xyz](https://hacs.xyz)
2. Follow the installation instructions
3. Restart Home Assistant

### Step 2: Add HKI Navigation Card

1. Open HACS in Home Assistant
2. Click on **"Frontend"** in the HACS menu
3. Click the **"+ Explore & Download Repositories"** button (bottom right)
4. Search for **"HKI Navigation Card"**
5. Click on the card in the search results
6. Click **"Download"**
7. Select the latest version
8. Click **"Download"** again to confirm

### Step 3: Restart Home Assistant

```bash
# Developer Tools → YAML → Restart
# Or use the Services tab:
service: homeassistant.restart
```

### Step 4: Clear Browser Cache

**Important:** Clear your browser cache to ensure you're loading the new card.

**Chrome/Edge:**
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

**Firefox:**
- Windows/Linux: `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Safari:**
- `Cmd + Option + R`

**Home Assistant App:**
- Go to Settings → Companion App → Debugging → Reset frontend cache

---

## Manual Installation

For advanced users or if HACS is not available.

### Step 1: Download the Card

1. Go to the [latest release](https://github.com/jimz011/hki-navigation-card/releases/latest)
2. Download `hki-navigation-card.js`

### Step 2: Copy to Config Directory

Place the file in your Home Assistant config directory:

```
/config/www/hki-navigation-card.js
```

**Note:** Create the `www` folder if it doesn't exist.

### Step 3: Add Resource

Add the card as a resource in Home Assistant:

#### Via UI (Recommended)

1. Go to **Settings → Dashboards**
2. Click the **⋮** (three dots) in the top right
3. Select **"Resources"**
4. Click **"+ Add Resource"** (bottom right)
5. Enter the URL: `/local/hki-navigation-card.js`
6. Select resource type: **JavaScript Module**
7. Click **"Create"**

#### Via YAML

Edit your `configuration.yaml`:

```yaml
lovelace:
  mode: storage # or yaml
  resources:
    - url: /local/hki-navigation-card.js
      type: module
```

**Note:** If you're using lovelace mode: yaml, resources must be defined in `ui-lovelace.yaml` instead.

### Step 4: Restart Home Assistant

```bash
service: homeassistant.restart
```

### Step 5: Clear Browser Cache

Clear your browser cache as described above.

---

## Verification

### Check Installation

1. Open browser console (F12)
2. Look for: `hki-navigation-card v1.0.0`
3. If you see this message, installation is successful!

### Add Test Card

Try adding a simple card to verify:

1. Go to any dashboard
2. Click **"Edit Dashboard"**
3. Click **"+ Add Card"**
4. Scroll down to **"Custom: HKI Navigation Card"**
5. If you see it, installation is working!

Alternatively, switch to YAML mode and add:

```yaml
type: custom:hki-navigation-card
position: bottom-right
base:
  button:
    icon: mdi:home
    tooltip: Test
    tap_action:
      action: none
```

If you see a floating button in the bottom-right corner, success! 🎉

---

## Updating

### Via HACS

1. Open HACS
2. Go to **"Frontend"**
3. Find **"HKI Navigation Card"**
4. Click **"Update"** if available
5. Restart Home Assistant
6. Clear browser cache

### Manual Update

1. Download the latest `hki-navigation-card.js`
2. Replace the existing file in `/config/www/`
3. Restart Home Assistant
4. Clear browser cache

**Important:** Always read the [Changelog](../CHANGELOG.md) before updating to check for breaking changes!

---

## Troubleshooting Installation

### Card Not Showing in Custom Cards List

**Problem:** Can't find "HKI Navigation Card" when adding a card.

**Solutions:**
1. Verify the resource is added correctly
2. Check the URL path is correct (`/local/` not `/www/`)
3. Restart Home Assistant
4. Clear browser cache (hard refresh)
5. Check browser console for errors (F12)

### Console Error: "hki-navigation-card.js" Failed to Load

**Problem:** Browser console shows resource loading error.

**Solutions:**
1. Verify file exists at `/config/www/hki-navigation-card.js`
2. Check file permissions (should be readable)
3. Verify the resource URL is `/local/hki-navigation-card.js`
4. Try accessing directly: `http://YOUR_HA_IP:8123/local/hki-navigation-card.js`

### Console Error: "Custom element doesn't exist"

**Problem:** Card type not recognized.

**Solutions:**
1. Ensure the resource type is set to **"JavaScript Module"** not "JavaScript"
2. Restart Home Assistant
3. Clear browser cache completely
4. Try a different browser to rule out caching issues

### Card Shows "Custom element doesn't exist: hki-navigation-card"

**Problem:** Card not registered properly.

**Solutions:**
1. Check console for loading errors
2. Verify you're using `type: custom:hki-navigation-card` (with `custom:` prefix)
3. Reload resources: Settings → Dashboards → ⋮ → Resources → Reload resources
4. Restart Home Assistant

### Updates Not Applying

**Problem:** Still seeing old version after update.

**Solutions:**
1. **Clear browser cache completely** (most common issue)
2. Use hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
3. Check browser console for version number
4. Try incognito/private mode to test
5. Clear Home Assistant app cache (mobile)

### HACS Shows "No repository found"

**Problem:** Can't find card in HACS.

**Solutions:**
1. Update HACS to latest version
2. Reload HACS: Settings → HACS → ⋮ → Reload repositories
3. Try searching for variations: "HKI", "Navigation", etc.
4. Check if the repository is archived or moved
5. Try manual installation instead

---

## Getting Help

If you're still having issues:

1. Check browser console (F12) for error messages
2. Include your Home Assistant version
3. Include your browser and version
4. Share your configuration (remove sensitive data)
5. Share console error messages
6. Post on [GitHub Issues](https://github.com/jimz011/hki-navigation-card/issues)

---

## Next Steps

✅ Installation complete!

Now you're ready to:
- Read the [Quick Start Guide](quick-start.md)
- Explore [Configuration Options](configuration.md)
- Check out [Examples](examples.md)

---

[← Back to README](../README.md) | [Next: Quick Start →](quick-start.md)
