# Features Agent - Documentation Checklist

Use this checklist after completing a feature to ensure all documentation stays in sync.

## Files to Update

| File | Purpose | When to Update |
|------|---------|----------------|
| `CLAUDE.md` | AI coding instructions | Always - add to Current Features, update Important Files |
| `.github/copilot-instructions.md` | Copilot context | Keep in sync with CLAUDE.md |
| `CHANGELOG.md` | Version history | Always - add under Unreleased |
| `src/docs/*.md` | User-facing docs | When feature affects user experience |

## Documentation Pages Reference

| Doc File | Topics | Update When... |
|----------|--------|----------------|
| `src/docs/getting-started.md` | Overview, requirements, quick start | Major features, UI changes |
| `src/docs/images.md` | Image properties, borders, corners | Image element changes |
| `src/docs/speech-bubbles.md` | Bubble styles, text editing | Speech bubble changes |
| `src/docs/text.md` | Text elements, fonts, colors | Text element changes |
| `src/docs/text-effects.md` | POW/BAM effects | Text effect changes |
| `src/docs/project-settings.md` | Default settings for elements | Settings changes |
| `src/docs/page-settings.md` | Page dimensions, background | Page setting changes |
| `src/docs/canvas.md` | Zoom, pan, grid, rulers | Canvas/tool changes |
| `src/docs/shortcuts.md` | Keyboard shortcuts | New shortcuts added |
| `src/docs/exporting.md` | Export formats, ZIP download | Export changes |

## Update Guidelines

### CLAUDE.md Updates

1. **Current Features** - Add bullet point describing the feature
2. **Important Files** - Add new files to the table if created
3. **State Management** - Update if new store actions added
4. **Phase Number** - Increment for major milestones

### CHANGELOG.md Updates

Use [Keep a Changelog](https://keepachangelog.com/) format:

- **Added** - New features
- **Changed** - Changes to existing functionality
- **Fixed** - Bug fixes
- **Removed** - Removed features
- **Security** - Security fixes

### Docs Page Updates

1. Identify which page(s) relate to the feature
2. Add clear, user-friendly descriptions
3. Include examples where helpful
4. Update any tables or lists
5. Keep consistent formatting with existing content

## Checklist Template

When completing a feature, go through this checklist:

- [ ] Identify what was changed/added
- [ ] Update CLAUDE.md Current Features
- [ ] Update CLAUDE.md Important Files (if new files)
- [ ] Update relevant src/docs/*.md page(s)
- [ ] Add CHANGELOG.md entry under Unreleased
- [ ] Sync copilot-instructions.md if needed
