# Empyrean Intelligence — Public Website

Public website for **Empyrean Intelligence**, Free, open verification tools for Super Intelligence.

---

## Files Created

- `index.html`: Main page containing mission, position, install lines with terminal copy buttons, release measurement cards, five problems list, principles, release cadence, and contact placeholders.
- `tools/gameability.html`: Dedicated documentation for `gameability` v0.2, including the full scoreboard table with intervals, 5-step methodology, example output diff, limits, and reproduction commands.
- `tools/rsi-audit.html`: Dedicated documentation for `rsi-audit` v0.1, detailing the five checks with example outputs, the 12-item card checklist graphic, limits, and audit write-up placeholders.
- `method.html`: Detailed research principles covering pre-registration, two independent routes, measurement vs inference labelling, notifying authors first, and publishing negative results.
- `css/style.css`: Design system based on a lab notebook / instrument panel with light & dark theme CSS custom properties, Newsreader, Inter Tight, and JetBrains Mono typography, measurement card and interval bar graphics, diff blocks, and 12-item checklist.
- `js/main.js`: Plain client-side JavaScript for terminal copy buttons, dark/light theme toggle, and typing animation respecting `prefers-reduced-motion`. Zero tracking or external dependencies.
- `verify-numbers.js`: Automated verification script that audits every number on every page against the authorized content list.

---

## How to Preview Locally

The site is plain static HTML/CSS/JS with zero build steps required.

### Option 1: Python HTTP Server (Already active on port 8000)
```bash
cd turing-site
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

### Option 2: Node.js (npx serve or http-server)
```bash
cd turing-site
npx serve .
```

### Option 3: Direct File
You can also open `index.html` directly in any web browser.

---

## Deploying to GitHub Pages

1. Initialize a git repository and commit the files:
   ```bash
   cd turing-site
   git init
   git add .
   git commit -m "Initial commit of Empyrean Intelligence website"
   ```
2. Push to your GitHub repository:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git branch -M main
   git push -u origin main
   ```
3. In your GitHub repository settings:
   - Navigate to **Settings** &rarr; **Pages**.
   - Under **Build and deployment** &gt; **Source**, select **Deploy from a branch**.
   - Select the `main` branch and root `/` folder.
   - Click **Save**. The site will be live at `https://<your-username>.github.io/<your-repo>/`.
