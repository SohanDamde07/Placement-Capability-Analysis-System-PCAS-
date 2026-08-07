# Design System Specification: The Intelligent Layer

## 1. Overview & Creative North Star
**Creative North Star: The Cognitive Curator**
This design system moves beyond the "standard SaaS dashboard" to create an environment that feels less like a tool and more like an intelligent partner. We reject the rigid, boxy constraints of traditional enterprise software in favor of **The Cognitive Curator**—a philosophy rooted in high-end editorial layouts, breathing room, and tonal depth.

To break the "template" look, we utilize **Intentional Asymmetry**. Key data points or CTAs should not always be perfectly centered; they should be positioned to guide the eye through a hierarchy of importance. We use overlapping elements and a massive typographic scale to create a sense of "digital paper" layered in a physical space.

---

## 2. Colors: Tonal Sophistication
We are moving away from flat HEX codes toward a system of **Environmental Depth**.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. 
Boundaries must be created exclusively through:
- **Background Color Shifts:** Placing a `surface_container_low` card on a `surface` background.
- **Tonal Transitions:** Using subtle shifts in the gray scale to imply a change in context.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, premium materials. Use the following hierarchy for nesting:
- **Base Layer:** `surface` (#f8f9ff) – The primary canvas.
- **Sectioning:** `surface_container_low` (#eff4ff) – Used for large background regions (e.g., the sidebar background).
- **Primary Content Containers:** `surface_container_lowest` (#ffffff) – Used for high-priority cards and interactive modules to provide a "pop" of clean white against the slightly tinted background.

### The "Glass & Gradient" Rule
To inject "soul" into the AI experience:
- **CTAs:** Use a subtle linear gradient for primary buttons, transitioning from `primary` (#3525cd) to `primary_container` (#4f46e5) at a 135° angle.
- **Floating Elements:** Use Glassmorphism for overlays and dropdowns. Apply `surface_container_lowest` at 80% opacity with a `20px` backdrop-blur.

---

## 3. Typography: Editorial Authority
The interplay between **Manrope** (Display) and **Inter** (Interface) creates a balance between human intuition and machine precision.

*   **Display & Headlines (Manrope):** High-contrast, bold, and authoritative. `display-lg` (3.5rem) should be used sparingly for "Aha!" moments in the AI data visualization.
*   **Body & UI (Inter):** Focused on extreme legibility. Use `body-md` (0.875rem) as the standard for all data density to maintain a professional, compact feel.
*   **Hierarchy Note:** Always pair a `headline-sm` with a `label-md` in `on_surface_variant` (#464555) to create a clear "Title/Caption" relationship that feels curated rather than cluttered.

---

## 4. Elevation & Depth: Tonal Layering
We do not use shadows to create "pop"; we use them to create **Atmosphere**.

*   **The Layering Principle:** Avoid traditional "Drop Shadows." Instead, stack `surface_container` tiers. A `surface_container_highest` element sitting on a `surface_dim` background provides all the visual separation required for high-end UI.
*   **Ambient Shadows:** If an element must "float" (e.g., a modal or a primary action card), use an extra-diffused shadow: `0px 24px 48px rgba(11, 28, 48, 0.06)`. Note the tint: the shadow is a low-opacity version of `on_surface`, not pure black.
*   **The "Ghost Border" Fallback:** If accessibility requirements demand a border, use the `outline_variant` (#c7c4d8) at **15% opacity**. It should be felt, not seen.

---

## 5. Components: The Primitive Set

### Buttons
- **Primary:** Gradient-fill (`primary` to `primary_container`), `DEFAULT` (8px) corners. No border.
- **Secondary:** `surface_container_high` background with `on_surface` text. This creates a "soft" button that integrates with the layout.
- **Tertiary:** Text-only with an underline appearing only on hover.

### Cards & Lists
- **The "No Divider" Rule:** Forbid the use of horizontal rules (`<hr>`). Separate list items using `12px` of vertical whitespace and a `4px` background shift on hover.
- **Structure:** Cards use `md` (0.75rem / 12px) roundedness. They should appear "plump" and soft.

### AI Placement Chips
- Use `secondary_container` (#6bff8f) for "High Match" status.
- **Styling:** Small caps `label-sm`, semi-bold, with a `full` (pill) radius.

### Input Fields
- **Minimalist Form Logic:** No background fill. Use a `Ghost Border` (15% `outline_variant`) that transitions to a `2px` `primary` bottom-border only on focus. This mimics the Notion-style "clean slate" onboarding.

### Sidebar Navigation
- **The "Floating" Sidebar:** The sidebar should not touch the top or bottom of the viewport. It sits as a `surface_container_low` rounded-rect `xl` (1.5rem) floating `16px` from the left edge, creating a sophisticated, non-browser-native aesthetic.

---

## 6. Do’s and Don’ts

### Do
- **Do** use whitespace as a structural element. If in doubt, add 8px more padding.
- **Do** use `surface_bright` to highlight active data points within a `surface_container` card.
- **Do** use `manrope` for any text larger than 24px to maintain the editorial vibe.

### Don't
- **Don't** use pure black (#000000) for text. Use `on_surface` (#0b1c30) to maintain a premium, ink-like softness.
- **Don't** use 100% opaque borders. They create "visual noise" that breaks the intelligent flow.
- **Don't** use standard "Success Green" for primary actions. Green is for "Success" only; Blue (`primary`) is for "Action."