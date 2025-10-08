# Character Sheet Design Extraction - Complete Guide

This collection of files contains a comprehensive analysis and practical toolkit extracted from your TTRPG character sheet (`sheet/HTML.html` and `sheet/CSS.css`). These resources will help you create personal webpages with the same level of interactivity, aesthetics, and visual appeal.

---

## 📁 Files Created

### 1. `character-sheet-design-analysis.md`
**Purpose:** Comprehensive design documentation

**What's inside:**
- Complete color palette (17 themed color sets)
- Typography specifications
- Shape language and border patterns
- Box shadow system (multi-layer effects)
- Interactive element patterns
- Animation specifications
- Layout structures
- Reveal/hide mechanics
- Content mapping guide (TTRPG → Personal Page)
- Implementation checklist
- Design principles

**Use this for:** Understanding the "why" behind design decisions and getting a complete overview of all design elements.

---

### 2. `character-sheet-quick-reference.css`
**Purpose:** Ready-to-use CSS snippets

**What's inside:**
- 20 organized sections of reusable CSS
- CSS custom properties (variables) for easy theming
- Pre-styled components:
  - Buttons (page tabs, action buttons)
  - Form inputs (text, number, textarea)
  - Custom checkboxes and radio buttons
  - Attribute cards with 3D text effects
  - Section headers
  - Reveal/hide boxes
  - Grid layouts
  - Animations (fade-in, swing-in, wiggle, slide-in)
  - Scrollbar customization
  - Gradient dividers
  - Popout panels
  - Theme variants (red, yellow, green, teal)
  - Utility classes

**Use this for:** Copy-paste CSS classes directly into your projects.

---

### 3. `character-sheet-template.html`
**Purpose:** Working example/template

**What's inside:**
- Complete HTML page demonstrating all CSS classes
- Practical examples:
  - Hero section with animated header
  - Tab navigation system
  - Attribute display grid (like character stats)
  - Skills section with reveal mechanics
  - Experience points/stats counters
  - Bio/background section
  - Contact buttons
- Simple JavaScript for tab switching
- Auto-demonstrates reveal functionality

**Use this for:** Starting point for your own character-sheet-styled webpage. See all components in action.

---

## 🚀 Quick Start Guide

### Option 1: Use the Template As-Is

1. Open `character-sheet-template.html` in your browser
2. Customize the content:
   - Change "YOUR NAME" to your name
   - Update attribute values (STR, DEX, INT, WIS)
   - Modify skill names and specialties
   - Edit the bio/background text
   - Update contact buttons
3. Adjust colors using CSS variables in `character-sheet-quick-reference.css`
4. Deploy to your hosting service

### Option 2: Build From Scratch

1. Start with your own HTML structure
2. Link `character-sheet-quick-reference.css`:
   ```html
   <link rel="stylesheet" href="character-sheet-quick-reference.css">
   ```
3. Use the classes from the quick reference:
   ```html
   <button class="btn-character-sheet">Click Me</button>
   <div class="attribute-card theme-red">
       <h3>Your Stat</h3>
   </div>
   ```
4. Refer to `character-sheet-design-analysis.md` for design principles
5. Check `character-sheet-template.html` for implementation examples

### Option 3: Extract Specific Components

Use `character-sheet-design-analysis.md` as a reference to understand specific components, then grab only the CSS classes you need from `character-sheet-quick-reference.css`.

---

## 🎨 Customization Guide

### Changing the Color Scheme

All colors are defined as CSS variables at the top of `character-sheet-quick-reference.css`:

```css
:root {
  /* Change these to customize your entire color scheme */
  --parchment-bg: #9c8e72;
  --text-dark: #4d3000;
  --red-theme: #643030;
  --yellow-theme: #776c48;
  --green-theme: #567251;
  --teal-theme: #517c78;
  /* ... etc */
}
```

**Example:** For a darker, gothic theme:
```css
:root {
  --parchment-bg: #2a2520;
  --text-dark: #ffffff;
  --red-theme: #8b0000;
  --yellow-theme: #c9a11f;
}
```

### Changing Fonts

Replace the Google Fonts import at the top of the CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=YourFont&display=swap');

* {
  font-family: 'YourFont', cursive;
}
```

### Adjusting Animation Speeds

Change the transition speed variable:

```css
:root {
  --transition-speed: 0.4s; /* Make faster: 0.2s, slower: 0.8s */
}
```

### Removing the Background Texture

In your CSS, comment out or remove:

```css
body {
  /* background-image: url("..."); */
  background-color: var(--parchment-bg);
}
```

---

## 📋 Component Reference

### Buttons
- `.btn-character-sheet` - Standard button with hover effects
- `.tab-button` - Navigation tab style
- `.tab-button.active` - Active/selected tab state

### Cards & Containers
- `.attribute-card` - Circular stat display with 3D text
- `.reveal-box` - Hidden until checkbox is checked
- `.parchment-decorated` - Ornate patterned background
- `.popout-panel` - Dropdown/tooltip style panel

### Form Elements
- Standard `input[type=text]`, `input[type=number]`, `textarea` - All pre-styled
- Custom checkboxes and radio buttons (automatic X pattern when checked)

### Layout
- `.grid-2-columns`, `.grid-4-columns`, `.grid-8-columns` - Responsive grids

### Animations
- `.animate-fade-in` - Fade in from bottom
- `.animate-swing-in` - Swing in rotation effect
- `.animate-slide-elliptic` - Dramatic slide-in with rotation and scale
- `.animate-wiggle` - Subtle wobble on hover

### Text & Effects
- `.text-shadow-3d` - Deep 3D text shadow effect
- `.glow-multi-layer`, `.glow-inner`, `.glow-combined` - Various glow effects
- `.scale-hover`, `.scale-active` - Transform on interaction

### Themes
- `.theme-red`, `.theme-yellow`, `.theme-green`, `.theme-teal` - Color-coded sections

### Dividers
- `.divider-red-yellow`, `.divider-green-teal` - Gradient separators

---

## 🎯 Common Use Cases

### Personal Portfolio
- Use attribute cards for skill proficiency levels
- Tab navigation for different sections (About, Projects, Contact)
- Reveal boxes for project details
- Stats counters for years of experience, projects completed, etc.

### Resume/CV
- Attributes = Core competencies
- Skills section with specialties that reveal on hover/click
- Timeline can use the gradient dividers
- Contact section with styled buttons

### About Me Page
- Hero section with your name as the main header
- Attributes showing personality traits (Creativity: 95, Teamwork: 88, etc.)
- Bio in the parchment-decorated container
- Social links as character sheet "equipment"

### Project Showcase
- Each project as a reveal box (hidden until clicked)
- Project stats (duration, team size, technologies) as attribute cards
- Navigation tabs for different project categories

---

## 🔧 Technical Notes

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge) fully supported
- Uses CSS Grid (IE11 not supported)
- Custom scrollbars work in Chrome/Edge/Safari (fallback in Firefox)

### Performance
- Animations use `transform` and `opacity` for GPU acceleration
- Box shadows can be intensive; reduce layers on low-end devices if needed

### Accessibility
- Maintain high contrast ratios when changing colors
- Ensure interactive elements are keyboard accessible
- Add ARIA labels for screen readers where appropriate

### Responsive Design
- Template includes basic mobile breakpoints
- Adjust grid columns for smaller screens
- Consider reducing animation complexity on mobile

---

## 📖 Learning Path

1. **Start by viewing:** Open `character-sheet-template.html` in a browser
2. **Understand the design:** Read `character-sheet-design-analysis.md` sections 1-10
3. **Customize the template:** Edit the HTML content while keeping the structure
4. **Experiment with colors:** Modify CSS variables in the quick reference
5. **Add your own components:** Reference the analysis for patterns
6. **Deep dive:** Study sections 11-17 of the analysis for advanced techniques

---

## 🎨 Design Philosophy Summary

Your original character sheet follows these core principles:

1. **Organic Shapes** - No harsh rectangles, everything has rounded corners
2. **Layered Depth** - Multiple shadow layers create realism
3. **Color Coding** - Consistent thematic colors for related elements
4. **Smooth Feedback** - Every interaction responds visually (0.4s transitions)
5. **Progressive Reveal** - Information appears on demand, not all at once
6. **Medieval Aesthetic** - Parchment textures, warm tones, traditional typography
7. **High Contrast** - Dark text on light backgrounds ensures readability
8. **Tactile Feel** - Hover states that make elements feel clickable/touchable

---

## 💡 Tips & Best Practices

### Do's
✅ Keep the parchment aesthetic consistent across all pages
✅ Use color themes to group related information
✅ Animate entrances but keep transitions smooth (not jarring)
✅ Maintain the 0.4s transition timing for cohesion
✅ Use reveal mechanics sparingly (for secondary info only)
✅ Scale elements on hover to indicate interactivity

### Don'ts
❌ Don't mix too many different animation speeds
❌ Don't use pure white or pure black (use cream and dark brown instead)
❌ Don't create rectangles without border-radius
❌ Don't add too many layers of shadow (3-4 max)
❌ Don't override the font family in random places
❌ Don't make everything wiggle/animate constantly

---

## 🔄 Future Enhancements

Ideas to expand on this foundation:

- [ ] Add dark mode variant (preserve parchment feel with darker palette)
- [ ] Create additional animation presets (bounce, rotate, pulse)
- [ ] Build a character creator tool (choose your own stats/skills)
- [ ] Develop additional components (progress bars, badges, tooltips)
- [ ] Create themed variations (sci-fi, modern, steampunk)
- [ ] Add print stylesheet for printer-friendly "character sheets"
- [ ] Build React/Vue component library based on these styles

---

## 📞 Support

If you need to reference the original source material:
- Original HTML: `sheet/HTML.html` (27,159 lines)
- Original CSS: `sheet/CSS.css` (6,073 lines)

These files contain the complete, production-ready character sheet with all advanced features, calculations, and game mechanics.

---

## 🙏 Credits

Design extracted from your custom TTRPG character sheet.
Font: Quintessential by Astigmatic (Google Fonts)
Parchment texture: Light brown parchment (imgur.com)

---

**Happy coding! May your webpages have the same level of craft and care as your character sheet. 🎲✨**

