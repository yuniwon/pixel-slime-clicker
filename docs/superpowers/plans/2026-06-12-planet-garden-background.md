# Planet Garden Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first-pass “small planet + spaceship garden” stage backdrop behind the slime so friends, guests, decor, crystal bed, and coin pile feel physically placed.

**Architecture:** Add one non-interactive backdrop layer inside `#game-area`, behind existing gameplay actors. Build the first version with CSS pixel-art pieces so layout, z-index, and mobile readability can be playtested before replacing pieces with generated PNG assets.

**Tech Stack:** Single-file HTML/CSS/JS browser game, CSS positioned layers, existing browser `launchCheck()`, Playwright/Chromium smoke screenshots.

---

### Task 1: Add The Backdrop Layer

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Insert the backdrop root**

Add the backdrop as the first child of `#game-area`:

```html
<div id="stage-backdrop" aria-hidden="true">
  <div class="pg-orbit"></div>
  <div class="pg-planet">
    <i class="pg-grass pg-grass-left"></i>
    <i class="pg-grass pg-grass-right"></i>
  </div>
  <div class="pg-deck">
    <i class="pg-deck-light"></i>
    <i class="pg-deck-light"></i>
    <i class="pg-deck-light"></i>
  </div>
  <div class="pg-dome"></div>
  <div class="pg-antenna"></div>
  <div class="pg-planter pg-planter-left"></div>
  <div class="pg-planter pg-planter-right"></div>
</div>
```

- [ ] **Step 2: Verify DOM order**

Run:

```powershell
rg -n "stage-backdrop|decor-layer|friends-layer|slime-wrap" index.html
```

Expected: `stage-backdrop` appears before `decor-layer`, `friends-layer`, and `slime-wrap`.

### Task 2: Style The Planet Garden

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add z-index boundaries**

Add CSS so the backdrop never blocks clicks and existing actors remain above it:

```css
#game-area > * {
  position: relative;
  z-index: 2;
}
#stage-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
#decor-layer,
#friends-layer {
  z-index: 1;
}
```

- [ ] **Step 2: Add the CSS pixel-art pieces**

Add CSS for `#stage-backdrop`, `.pg-orbit`, `.pg-planet`, `.pg-deck`, `.pg-dome`, `.pg-antenna`, and `.pg-planter*`. Use clamp-based dimensions so the stage scales on desktop and mobile.

- [ ] **Step 3: Keep mobile readable**

Inside the existing `@media (max-width: 760px)` block, reduce the planet/deck size and opacity:

```css
#stage-backdrop { opacity: .82; }
.pg-planet { width: min(76vw, 300px); }
.pg-deck { width: min(56vw, 220px); }
```

### Task 3: Verify In Browser

**Files:**
- Read: `index.html`
- Create: `.codex-playtest/planet-garden/*.png`

- [ ] **Step 1: Syntax check**

Run:

```powershell
node -e "const fs=require('fs'); const html=fs.readFileSync('index.html','utf8'); const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).join('\n'); new Function(scripts); console.log('inline script syntax ok');"
```

Expected: `inline script syntax ok`.

- [ ] **Step 2: Run local browser smoke test**

Serve the project with Python HTTP server and open Chromium at `http://127.0.0.1:<port>/`.

Expected:
- `launchCheck()` is callable.
- No fatal console errors or page errors.
- `#stage-backdrop` exists.
- `#slime-wrap`, `#golden-star`, `#raincloud`, `#starlet`, `#crystal-bed`, and `#coin-pile` remain clickable or pointer-safe.

- [ ] **Step 3: Capture screenshots**

Capture:
- `.codex-playtest/planet-garden/desktop.png`
- `.codex-playtest/planet-garden/mobile.png`

Expected: the planet garden sits behind the slime, does not cover UI text, and leaves room for friends/decor.
