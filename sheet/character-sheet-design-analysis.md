# TTRPG Character Sheet Design Analysis
## Core Fundamental Aspects for Future Personal Webpages

This document extracts all the essential design elements, aesthetics, interactions, and motions from your TTRPG character sheet to guide the creation of character-sheet-styled personal webpages.

---

## 1. COLOR PALETTE

### Primary Parchment & Background Colors
- **Main Background**: `#9c8e72` (light brown parchment)
- **Background Image**: Light brown parchment texture (`https://i.imgur.com/U9nCBCy.jpg`)
- **Primary Text**: `#4d3000` (dark brown)
- **Secondary Text**: `#F3E2A9` (cream/beige)
- **Container Background**: Transparent (`#00000000`)

### Accent Colors (Themed Sections)
- **Red/Maroon Theme** (FOR, Fatigues, Blessures, Mutismes):
  - `#643030` / `#643030b9` (dark red-brown with transparency)
  - `#820402` (deep red)
  - `#896565` (muted red)

- **Yellow/Gold Theme** (DEX, Combat):
  - `#776c48` / `#776c48b9` (olive yellow-brown)
  - `rgb(118, 97, 18)` (dark gold)
  - `#897638de` (muted yellow-green)

- **Green Theme** (AGI, Inconforts):
  - `#567251` / `#567251b9` (forest green)
  - `#597448` (olive green)
  - `#668b60b9` (sage green)

- **Teal/Cyan Theme** (CON, EMP, Disettes, Addictions):
  - `#517c78` / `#517c78b9` (teal-grey)
  - `#3e6f7e` (deeper teal)
  - `#42ffd6` (bright cyan - highlight)
  - `rgb(104, 255, 222)` (mint cyan)

### Border & Shadow Colors
- **Primary Border**: `#ceb68d` (tan/beige)
- **Secondary Border**: `#a18b64` (darker tan)
- **Dark Border**: `#674B1B` (dark brown)
- **Shadow Base**: `#574b35` (deep brown)
- **Inner Shadow**: `#493f2e` (very dark brown)
- **Glow Effects**: `#ffebc6`, `#ffeece`, `#F3E2A9` (cream/golden glows)

### Interactive State Colors
- **Hover Background**: `#fff6df` (very light cream)
- **Active/Selected**: `#dfc79d` (medium tan)
- **Disabled**: `#998663` (muted brown)
- **Focus Glow**: `#eacb66` (golden yellow)

---

## 2. TYPOGRAPHY

### Fonts
```css
@import url('https://fonts.googleapis.com/css2?family=MedievalSharp&family=Quintessential&display=swap');

font-family: 'Quintessential';  /* Primary font for all content */
```

### Text Styling Patterns
- **Headers (H3)**:
  - Text shadow with depth: `0 1px black, 0 2px rgb(19,19,19), 0 3px rgb(30,30,30)...`
  - Creates 3D embossed effect

- **Font Sizes**:
  - Large headers: `50px - 60px`
  - Section titles: `20px`
  - Regular buttons: `16px - 20px`
  - Small details: `8px - 11px` (specialty items)

---

## 3. SHAPE LANGUAGE & BORDERS

### Border Radius Patterns
- **Circular Elements**: `border-radius: 50%` (attribute displays, checkboxes)
- **Soft Rounded**: `border-radius: 10% - 30%` (most inputs and containers)
- **Heavy Rounded Corners**: `border-radius: 40%` (section headers)
- **Asymmetric Rounding**: Different radii for each corner
  ```css
  border-top-left-radius: 40%;
  border-top-right-radius: 10%;
  ```

### Complex Backgrounds
Intricate gradient patterns with geometric designs:
```css
background:
  radial-gradient(#6100001f 3px, transparent 4px),
  radial-gradient(#6100001f 3px, transparent 4px),
  linear-gradient(#fff5d3 4px, transparent 0),
  linear-gradient(45deg, transparent 74px, #78c9a3 75px...),
  linear-gradient(-45deg, transparent 75px, #78c9a3 76px...),
  #fff5d3;
```

---

## 4. BOX SHADOW SYSTEM

### Multi-Layer Shadow Effects
The sheet uses complex layered shadows for depth:

#### **Inset Shadows** (recessed elements)
```css
box-shadow: 0px 0px 15px 3px #574b35 inset;
box-shadow: 0px -10px 13px 2px #643030b3 inset;
```

#### **Outer Glow Effects**
```css
box-shadow:
  0 0 10px 5px #ffebc6,
  0 0 20px 10px #72522f28,
  0 0 30px 15px rgba(95, 50, 23, 0.185);
```

#### **Combined Inner + Outer**
```css
box-shadow:
  0 0 10px 5px #ffebc6,           /* outer glow */
  0 0 20px 10px #72522f28,        /* mid glow */
  0 0 30px 15px rgba(95,50,23,.185), /* far glow */
  0px 0px 10px 1px #421212 inset; /* inner shadow */
```

#### **Highlight/Focus States**
```css
box-shadow:
  0px 0px 10px 5px #ffeece,      /* close glow */
  0px 0px 60px 20px #42ffd6,     /* far cyan glow */
  0px 0px 0px 20px #000000 inset; /* deep inset */
```

---

## 5. INTERACTIVE ELEMENTS

### Input Styling

#### **Number Inputs**
- Default: Light cream (`#fff6df`) with inset shadow
- Hover: Brighter with golden glow, scales up
- Disabled: Muted brown (`#998663`) with deep inset

#### **Text Inputs**
- Default: Dark background with cream text (`#F3E2A9`)
- `border-radius: 30%` for organic feel
- Hover: Inverts to light background with dark text
- Transition: `transition-duration: 0.4s`

#### **Textareas** (Different Themes)
```css
.sheet-TechniquesText { background: #421212; }   /* Red theme */
.sheet-TechniquesText2 { background: #33412b; }  /* Green theme */
.sheet-TechniquesText3 { background: #2e454d; }  /* Blue theme */
```

### Checkboxes
Custom styled with X marks:
```css
input[type=checkbox]:checked {
  background:
    linear-gradient(to top left, ...),
    linear-gradient(to top right, ...);
  /* Creates X pattern */
}
```

### Radio Buttons
- Semi-transparent circles
- Hover: Bright glow effect
- Checked: Changes to diagonal cross pattern

### Buttons

#### **Page Navigation Buttons**
```css
.sheet-Page1, .sheet-Page2, .sheet-Page3, .sheet-Page4 {
  box-shadow: 0px 0px 10px 1px #421212 inset;
  background: #ffebc6;
  color: #674B1B;
  border: solid 3px #674B1B;
  font-size: 20px;
  transform: scale(1,1);
}
```

#### **Aptitude Buttons** (Color-coded)
Different colored top shadows for different attributes:
```css
.sheet-APT1, .sheet-APT8 { /* Red */
  box-shadow: 0px -10px 13px 2px #643030b3 inset;
}
.sheet-APT2, .sheet-APT7 { /* Yellow */
  box-shadow: 0px -10px 13px 2px #897638de inset;
}
.sheet-APT3, .sheet-APT6 { /* Green */
  box-shadow: 0px -10px 13px 2px #567251d0 inset;
}
.sheet-APT4, .sheet-APT5 { /* Teal */
  box-shadow: 0px -10px 13px 2px #517c78b0 inset;
}
```

#### **Hover Effects** (Universal Pattern)
- Scale transformation: `transform: scale(1.1, 1.1)` or `scale(2, 2)` for emphasis
- Background lightens to `#fff6df`
- Border glow increases
- Smooth transition: `transition-duration: 0.4s`

---

## 6. ANIMATIONS & MOTIONS

### Keyframe Animations

#### **Fade In Bottom**
```css
@keyframes fade-in-bottom {
  0% {
    transform: translateY(50px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
animation: fade-in-bottom 1s cubic-bezier(.39,.575,.565,1.000) both;
```

#### **Swing In**
```css
@keyframes swing-in-bottom-bck {
  0% {
    transform: rotateX(-70deg);
    transform-origin: bottom;
    opacity: 0;
  }
  100% {
    transform: rotateX(0);
    transform-origin: bottom;
    opacity: 1;
  }
}
```

#### **Slide In Elliptic**
```css
@keyframes slide-a-in-elliptic-bottom-bck {
  0% {
    transform: translateY(600px) rotateX(-30deg) scale(6.5);
    transform-origin: 50% -100%;
    opacity: 0;
  }
  100% {
    transform: translateY(0) rotateX(0) scale(1);
    transform-origin: 50% 500px;
    opacity: 1;
  }
}
animation: slide-a-in-elliptic-bottom-bck 0.7s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
```

#### **Wiggle Effects** (Complex multi-step)
```css
@keyframes wiggle-rightB {
  /* Creates subtle wobble effect with rotation and translation */
  55% { transform: translateX(-20px) rotate(-1deg) scale(1.1,1.1) translateY(10px); }
  57% { transform: translateX(25px) rotate(11deg) scale(1.1,1.1) translateY(10px); }
  59% { transform: translateX(-5px) rotate(1.4deg) scale(1.1,1.1) translateY(10px); }
  /* ... continues with diminishing oscillation */
}
```

### Transform Patterns
- **Hover Scale**: `transform: scale(1.1, 1.1)` or `scale(2, 2)` for major emphasis
- **Translation**: `translateY()`, `translateX()` for positioning
- **Rotation**: Subtle rotations (1-11 degrees) for organic feel
- **Centered Positioning**: `transform: translate(-50%, -50%)`

---

## 7. SCROLLBAR CUSTOMIZATION

### Firefox
```css
* {
  scrollbar-width: auto;
  scrollbar-color: #874040 #78c09f;
}
```

### Chrome/Edge/Safari
```css
*::-webkit-scrollbar {
  width: 15px;
}

*::-webkit-scrollbar-track {
  background: #91ffcd;
  box-shadow: 0px 0px 10px 2px #55a07e inset;
  border-bottom-left-radius: 20%;
  border-bottom-right-radius: 20%;
  border: 1px solid #574b35;
}

*::-webkit-scrollbar-thumb {
  background-color: #874040;
  box-shadow:
    0 0 5px 1px #ffebc6a4,
    0 0 10px 5px #72522f28,
    0px 0px 5px 2px #461010 inset;
  border-bottom-left-radius: 50%;
  border-bottom-right-radius: 50%;
  border: 1px solid #F3E2A9;
}
```

---

## 8. LAYOUT STRUCTURE

### Grid Systems

#### **Attribute Grid**
```css
.attr-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  column-gap: 0px;
}
```

#### **Four Columns**
```css
.fourcolumnsB-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
```

#### **Two Column**
```css
.two-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
```

### Positioning Patterns
- Heavy use of `position: relative` with precise `left`, `top` offsets
- Layered z-index system (from `z-index: 1` to `z-index: 99999999999`)
- Negative margins for overlap effects: `margin-bottom: -200px`

---

## 9. REVEAL/HIDE MECHANICS

### Checkbox-Based Toggles
```css
/* Hidden by default */
.sheet-maitrise_check {
  opacity: 0.1;
  transition-duration: 0.4s;
}

/* Revealed when checkbox is checked */
.NineRows-grid input[type=checkbox]:checked + .sheet-maitrise_check {
  opacity: 1;
  transition-duration: 1s;
}
```

### Hover Reveal
```css
/* Hidden until hover */
.sheet-reveal {
  /* Positioned absolutely, appears on hover */
  position: absolute;
  top: 40px;
  left: -10px;
  z-index: 999999999;
}
```

### Radio Button Page Switching
```css
.sheet-character-sheet {
  display: none;
}

.sheet-isPC:checked ~ .sheet-pc,
.sheet-isNPC:checked ~ .sheet-npc {
  display: block;
}
```

---

## 10. SPECIAL VISUAL EFFECTS

### Attribute Wobble Animation Classes
```css
.sheet-AttrWobble1, .sheet-AttrWobble2, .sheet-AttrWobble3, .sheet-AttrWobble4
```
Each has slightly different margin-left values for staggered visual rhythm

### Trailing Effects
```css
.sheet-AttrTrail {
  /* Creates trailing shadow effect on buttons */
}
```

### Pop-out Panels
```css
.sheet-PopOut2, .sheet-PopOut_M {
  position: absolute;
  /* Appears over content with high z-index */
  z-index: 99999999999;
  transform: scale(1);
}
```

### Gradient Dividers
Creates visual separation between sections:
```css
.sheet-Maux_Aptitude_1 {
  background: linear-gradient(90deg, #643030b9 33%, #776c48b9 66%);
  height: 5px;
  box-shadow: 0px 0px 3px 1px #5e5441, 0px 0px 5px 1px #ffe3b0;
}
```

---

## 11. INTERACTION PATTERNS

### Hover States (Universal Principles)
1. **Color Shift**: Dark → Light (or vice versa)
2. **Scale Up**: `transform: scale(1.1)` minimum
3. **Shadow Enhancement**: More layers, brighter, further reach
4. **Border Changes**: Often to brighter color or more defined
5. **Z-index Boost**: Brings element forward (`z-index: 9999`)
6. **Smooth Transition**: Always `transition-duration: 0.4s`

### Active/Focus States
- Even more dramatic: `transform: scale(2, 2)`
- Bright cyan (`#42ffd6`) highlights
- Animation triggers (wiggle, slide, fade)

### Disabled States
- Opacity maintained but darker palette
- No hover effects
- Muted colors (`#998663`, `#FCEEC2`)

---

## 12. DETAILED COMPONENT EXAMPLES

### Skill/Mastery Boxes
```css
.sheet-maitrise_check {
  opacity: 0.1;
  position: relative;
  border-radius: 10%;
  box-shadow: 0px 0px 10px 1px #421212 inset;
  background-color: #dfc79d;
  border: solid 3px #ceb68d;
  width: 145px;
  transition-duration: 0.4s;
}

/* On hover when checked */
input[type=checkbox]:checked + .sheet-maitrise_check:hover {
  box-shadow:
    0 0 15px 8px #ffebc6,
    0 0 30px 15px #72522f75,
    0 0 60px 30px rgba(82, 50, 31, 0.658),
    0px 0px 10px 1px #eacb66 inset;
  background: #fff6df;
  transform: scale(1.1);
}
```

### Attribute Display Numbers
```css
.sheet-attr1 {
  height: 50px;
  width: 80px;
  font-size: large;
  /* Shows calculated attribute value */
}
```

### Cycle Tracking (Visual Progress)
Uses hidden spans that appear based on state:
```html
<span class="sheet-Marques_Cycle_0">... ... ... ... ...</span>
<span class="sheet-Marques_Cycle_1">▣ ... ... ... ...</span>
<span class="sheet-Marques_Cycle_2">▣▣ ... ... ...</span>
<!-- etc. -->
```

---

## 13. MOBILE/RESPONSIVE CONSIDERATIONS

The current sheet is fixed-width (`795px` main, `750px` container). For personal webpages:
- Consider making widths responsive with `max-width` and percentages
- Use media queries for mobile adaptations
- Maintain aspect ratios for parchment feel

---

## 14. THEMATIC CONSISTENCY RULES

### Four Main Attribute Categories (Color-Coded)
1. **Physical Power** (Red): FOR, Combat-related
2. **Skill/Finesse** (Yellow/Gold): DEX, Precision
3. **Nature/Balance** (Green): AGI, Natural abilities
4. **Mind/Spirit** (Teal): CON, EMP, Mental fortitude

### Visual Hierarchy
1. **Page-level navigation**: Largest, most prominent
2. **Section headers**: Medium scale, color-coded
3. **Attributes**: Circular, 3D embossed text
4. **Skills/Masteries**: Rectangular, reveal on interaction
5. **Details**: Smallest, appears on hover/click

---

## 15. IMPLEMENTATION CHECKLIST FOR PERSONAL WEBPAGE

When creating a character-sheet-styled personal webpage, include:

- [ ] Parchment texture background
- [ ] Custom Google Font (Quintessential or similar medieval/elegant font)
- [ ] Earthy color palette (browns, creams, golds)
- [ ] Multi-layered box-shadow system
- [ ] Rounded/organic border-radius patterns
- [ ] Custom styled form elements (inputs, checkboxes, buttons)
- [ ] Hover states with scale transforms
- [ ] Smooth transitions (0.4s duration)
- [ ] Page/section navigation tabs
- [ ] Reveal/hide mechanics for details
- [ ] Color-coded sections by category
- [ ] Custom scrollbar styling
- [ ] Gradient backgrounds and dividers
- [ ] Entrance animations (fade-in, slide-in)
- [ ] Interactive elements that pop out on hover
- [ ] Checkbox or radio-based state management
- [ ] High z-index layering for popups
- [ ] Asymmetric border-radius for visual interest
- [ ] Text shadows for depth on headers
- [ ] Inset shadows for recessed elements
- [ ] Glow effects for focus/active states

---

## 16. KEY DESIGN PRINCIPLES

1. **Organic Shapes**: Use varied border-radius, never pure rectangles
2. **Depth Through Shadow**: Multiple shadow layers create realism
3. **Color Coding**: Consistent theme colors for related content
4. **Smooth Interactions**: All transitions at 0.4s for cohesive feel
5. **Scale for Emphasis**: Hover = 1.1x, Active = 2x
6. **Layered Complexity**: Visual richness through gradient overlays
7. **Hidden Details**: Reveal information progressively on interaction
8. **Medieval Aesthetic**: Parchment texture, warm tones, traditional fonts
9. **Accessibility**: High contrast maintained even with decorative styling
10. **Feedback**: Every interaction has visual response

---

## 17. CONTENT MAPPING (TTRPG → Personal Page)

For adapting to a personal webpage about YOU:

| TTRPG Element | Personal Page Equivalent |
|---------------|-------------------------|
| Attributes (FOR, DEX, etc.) | Skills/Strengths |
| Maux (Afflictions) | Challenges/Weaknesses |
| Masteries | Expertise Areas |
| Specialties | Specific Projects |
| Page Tabs | Portfolio Sections |
| Cycle Tracking | Progress Bars |
| Equipment | Tools/Technologies |
| Character Description | About Me / Bio |
| Stats | Metrics/Achievements |

---

This analysis captures the essence of your character sheet's design language. Use these principles to create personal webpages that have the same tactile, interactive, medieval-fantasy aesthetic while presenting modern content in an engaging character-sheet format.

