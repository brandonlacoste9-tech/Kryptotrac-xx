## 2024-05-23 - [APEX Skeleton-Tech UI]
**Learning:**
Accessibility in complex, stylized UIs (like "Cyber" or "Skeleton" themes) requires extra care.
- **Challenge:** Heavy use of transparent backgrounds (`backdrop-blur`) and neon text (`#00f3ff`) can compromise readability if contrast ratios aren't checked.
- **Solution:** Used high-contrast borders and semi-transparent backgrounds (`bg-[#0a0b1e]/85`) to ensure text remains legible against the page content.
- **Detail:** When replacing icon-only buttons with stylized versions, `aria-label` and `title` attributes become even more critical because the visual affordance might be more abstract (e.g., a "screw" or "circuit node").

**Action:**
When applying heavy visual themes (Cyberpunk, Steampunk, etc.):
1. Always maintain semantic HTML structure beneath the CSS.
2. Ensure `aria-label`s describe the *function*, not the *style* (e.g., "Close chat", not "Click the red bolt").
3. Use `backdrop-blur` cautiously; it looks cool but needs a solid enough opacity to prevent text vibration.
