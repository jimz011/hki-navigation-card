# Changelog

All notable changes to HKI Navigation Card will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-01-07

### 🎉 Initial Release

The first stable release of HKI Navigation Card!

### ✨ Features

#### Core Features
- Fixed-position floating action buttons
- Multiple layout modes (corner, center, spread)
- Responsive positioning with automatic sidebar detection
- Three button groups: base, horizontal, and vertical
- Flexible button arrangement in rows and columns

#### Button Features
- Multiple button types: icon, pill, icon-label
- Customizable per-button styling (background, colors, opacity)
- Template support for dynamic labels and tooltips
- Entity integration with state tracking
- Three action types: tap, hold, double-tap
- Conditional visibility based on entity states
- Icon, label, and tooltip customization

#### Layout Features
- Three position modes: bottom-left, bottom-center, bottom-right
- Center spread mode for full-width distribution
- Adjustable button sizes and gaps (horizontal and vertical)
- Screen-size-specific offset overrides (mobile/tablet/desktop)
- Automatic sidebar/panel detection and adjustment
- Z-index control for precise layering

#### Styling Features
- Global default styling (background, opacity, colors)
- Per-button style overrides
- Customizable button shadows (normal and hover)
- Advanced label styling system
  - Font customization (size, weight, spacing, transform)
  - Background and text colors
  - Border radius and padding
  - Backdrop blur effect
  - Max width control

#### Experimental Features
- Bottom bar backdrop (cosmetic overlay)
  - Full-width or button-wrapping modes
  - Customizable height, color, and opacity
  - Border styling (width, style, color, radius)
  - Inset margins for fine-tuning
  - Box shadow support

### 🎨 User Interface
- Visual editor support in Home Assistant
- Clear section organization in configuration
- Helpful tooltips and hints
- Experimental feature warnings
- Collapsible advanced sections

### 🔧 Technical
- Written in vanilla JavaScript (no dependencies)
- Efficient rendering and update cycle
- Console logging for debugging
- Version identifier in console
- Clean, organized code structure

### 📚 Documentation
- Comprehensive README with feature overview
- Detailed installation guide (HACS and manual)
- Quick start guide for new users
- Complete configuration reference
- Button configuration guide
- Layout and positioning guide
- Bottom bar guide (experimental feature)
- Advanced usage guide (templates, conditions)
- Examples library
- Troubleshooting guide
- Documentation index for easy navigation

### 🐛 Bug Fixes
- N/A (initial release)

### 🚨 Breaking Changes
- N/A (initial release)

### 📝 Notes
- Bottom bar feature is marked as experimental
- Sidebar detection works automatically
- Template syntax follows Home Assistant standards
- Condition syntax follows standard card patterns

---

## Version History

### Versioning Guide

**Format:** MAJOR.MINOR.PATCH

- **MAJOR:** Breaking changes that require configuration updates
- **MINOR:** New features added (backward compatible)
- **PATCH:** Bug fixes and small improvements

### Release Notes Location

Release notes for each version include:
- ✨ New features
- 🐛 Bug fixes
- 🚨 Breaking changes
- 📝 Migration guides (when needed)

---

## Planned Features

### Future Enhancements Under Consideration

These are potential future features (not committed):

- 🎯 Layout presets (pre-configured styles)
- 🎨 Theme integration (match HA themes automatically)
- 📱 Gesture support (swipe actions)
- 🔔 Notification badges on buttons
- 🎭 Animation options
- 🌐 Multi-language support
- 🎯 Quick action shortcuts
- 📊 Integration with HA statistics

**Note:** These are ideas only. No ETA or commitment. Feature requests welcome on GitHub!

---

## Upgrade Guide

### From Future Versions

When new versions are released, upgrade guides will be provided here.

### Current Version

You're on the latest version! No upgrade needed.

---

## Deprecation Notices

### Current Deprecations

None at this time.

### Future Deprecations

Any features planned for deprecation will be announced here at least one major version in advance.

---

## Contributing

### Reporting Issues

When reporting bugs or requesting features, please include:
- Your Home Assistant version
- HKI Navigation Card version (check console)
- Browser and version
- Your configuration (remove sensitive data)
- Steps to reproduce (for bugs)
- Expected vs actual behavior

### Submitting Changes

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Links

- [GitHub Repository](https://github.com/jimz011/hki-navigation-card)
- [Issues](https://github.com/jimz011/hki-navigation-card/issues)
- [Discussions](https://github.com/jimz011/hki-navigation-card/discussions)
- [Documentation](docs/INDEX.md)

---

**Thank you for using HKI Navigation Card!** ❤️
