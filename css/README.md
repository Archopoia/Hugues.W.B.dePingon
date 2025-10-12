# CSS Modules Directory

This directory contains all the modular CSS files for the Hugues de Pingon portfolio website.

## Module Index

### 🎨 Foundation
- **`base.css`** - CSS variables, resets, global styles, scrollbar styling

### 🏗️ Structure
- **`layout.css`** - Character sheet container, content areas, decorative backgrounds

### 👤 Header
- **`header.css`** - Character header, portrait frame, name, stats, Easter egg interactions

### 🧭 Navigation
- **`navigation.css`** - Tab navigation, education nav, portfolio nav, skills nav, language switcher

### 📄 Content Sections
- **`profile.css`** - About tab content, mission, expertise, journey, interests
- **`education.css`** - Academic stats, education cards, timelines, certifications, works
- **`experience.css`** - Experience cards, progression timeline, skills used
- **`portfolio.css`** - Project cards, hero cards, ribbons, tech tags, modals
- **`skills.css`** - Attribute wheels, skill groups, skill bars, languages
- **`contact.css`** - Quest forms, contact methods, social platforms

### ✨ Effects & Interactions
- **`animations.css`** - All @keyframes animations (fadeIn, pulse, spin, etc.)
- **`achievements.css`** - Secret achievements, Konami code, particle effects

### 📱 Responsive
- **`responsive.css`** - All @media queries for tablets and mobile devices

## Import Order

The modules are imported in this specific order in the main `styles.css`:

1. base.css
2. layout.css
3. header.css
4. navigation.css
5. profile.css
6. education.css
7. experience.css
8. portfolio.css
9. skills.css
10. contact.css
11. animations.css
12. achievements.css
13. responsive.css

## Quick Reference

| Need to edit... | Open file... |
|----------------|--------------|
| Colors or CSS variables | `base.css` |
| Page layout | `layout.css` |
| Header or portrait | `header.css` |
| Navigation menus | `navigation.css` |
| About section | `profile.css` |
| Education section | `education.css` |
| Experience section | `experience.css` |
| Portfolio/Projects | `portfolio.css` |
| Skills section | `skills.css` |
| Contact form | `contact.css` |
| Animations | `animations.css` |
| Easter eggs | `achievements.css` |
| Mobile/tablet styles | `responsive.css` |

## File Sizes

- **Total modules:** 13 files
- **Total lines:** ~5,204 lines
- **Total size:** ~111 KB (unminified)
- **Average file:** ~8-9 KB each

## Notes

- All modules use CSS variables defined in `base.css`
- Animations are centralized in `animations.css`
- Responsive breakpoints are consolidated in `responsive.css`
- Each module is self-contained and focused on its specific feature

---

**Last Updated:** October 12, 2025
**Architecture:** Modular CSS with @import
**Browser Support:** Modern browsers (Chrome, Firefox, Safari, Edge)

