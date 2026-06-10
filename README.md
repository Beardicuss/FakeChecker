<div align="center">
  <img src="src/assets/icons/verity-icon.png" alt="Fake Checker Ministry Logo" width="200" />
</div>

# Fake Checker

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/bundler-Vite-purple)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow)

> Prove your loyalty to the Ministry. Analyze the packages. Filter the truth.

Fake Checker is a retro-futuristic simulation game built with React. Step into the shoes of an agent working at the Ministry of Verity, tasked with reviewing incoming intelligence and approving or rejecting information based on ever-shifting Ministry directives. Navigate a meticulously crafted CRT terminal interface while balancing your processing quota against the Ministry's strict trust metrics.

---

## 📋 Table of Contents

- [Overview](#overview)
- [✨ Features](#-features)
- [📦 Installation](#-installation)
- [🚀 Quick Start](#-quick-start)
- [📖 Documentation](#-documentation)
- [🔧 Configuration](#-configuration)
- [🏗️ Architecture](#️-architecture)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [🛣️ Roadmap](#️-roadmap)
- [📄 License](#-license)
- [👥 Credits & Acknowledgements](#-credits--acknowledgements)
- [💬 Support](#-support)

---

## Overview

In a world where truth is subjective and the State is absolute, the Ministry relies on human operators to review "Information Packages" before public broadcast. Fake Checker puts you in the driver's seat of this oppressive bureaucracy. Every decision impacts your Ministry Trust score, and making too many mistakes—or working too slowly—results in immediate termination.

This project exists as a high-fidelity vertical slice demonstrating advanced React state management, custom audio controllers, and CSS-driven atmospheric visual effects (like CRT scanlines and chromatic aberration) without relying on heavy game engines or Canvas-based rendering.

**Target Audience:**
React developers interested in building game-like UIs, and players who enjoy dystopian bureaucracy simulators (e.g., *Papers, Please*).

---

## ✨ Features

- **📺 Authentic CRT Aesthetic:** Custom CSS overlays delivering scanlines, screen curve, phosphor glow, animated backgrounds, and randomized visual glitches.
- **🛠️ Resolution Auto-Scaler:** A fully dynamic viewport scaler that maintains pixel-perfect 1920x1080 design integrity across all mobile and desktop layouts.
- **🎧 Dynamic Audio Engine:** Immersive terminal soundscapes, reactive click SFX, and independent music/SFX volume scaling across all game states.
- **💼 Narrative Progression:** Multi-phased shifts featuring randomized case queues, interactive email overlays, and shifting Ministry directives.
- **⚡ Emergency Minigames:** Workstation anomalies (Fan Cleaning, Cable Splicing, Generator Cranking, Terminal Rebooting) dynamically trigger during your shift, requiring instant reflexes to avoid severe time penalties.
- **🏗️ Upgrade System:** Spend accumulated shift-credits via the deep-terminal Upgrade node to purchase automated validators, quota reducers, or extended timers.
- **🧩 Extensible Data Layer:** Drop your own JSON packages into `cases.json` to instantly expand the game's narrative.

---

## 📦 Installation

To play the game locally or to contribute to development, you'll need Node.js (v18+) installed.

```bash
# 1. Clone the repository
git clone https://github.com/DanTe/FakeChecker.git

# 2. Navigate to the project directory
cd FakeChecker

# 3. Install dependencies using npm
npm install
```

---

## 🚀 Quick Start

Once dependencies are installed, spin up the local Vite development server:

```bash
# Start the development server
npm run dev
```

Your terminal will output a local URL (usually `http://localhost:5173`). Open this in your browser.
Click through the boot sequence, enter the password `VERITY`, accept the Ministry Directive, and begin your shift!

---

## 📖 Documentation

Because the project is entirely self-contained, everything you need is heavily commented within the source code.

- **Data Models:** JSON structures for the game logic are located in `src/data/`.
- **Game State Logic:** The core simulation loop is driven by custom hooks in `src/state/`.
- **Minigames:** Standalone modular interaction components exist under `src/components/minigames/`.

---

## 🔧 Configuration

The game logic relies entirely on static JSON configuration files. Modifying these files allows you to instantly alter the game's content and difficulty without writing any React code.

**`src/data/cases.json`**
```json
[
  {
    "id": "PKG-001",
    "source": "REBEL TRANSMISSION",
    "headline": "City Sector 4 Without Power for Third Day",
    "body": "Residents are protesting the ongoing blackout...",
    "objectiveVerdict": "real",
    "ministryVerdict": "fake"
  }
]
```

---

## 🏗️ Architecture

Fake Checker uses a modular, "many small scripts" pattern. It avoids monolithic files, isolating logic into granular hooks and components.

```text
src/
├── main.jsx          # Entry Point
├── App.jsx           # Master Screen Router & Global Audio Controller
├── state/            # Custom Hooks (Case Queues, Timers, Score Tracking)
├── components/       # Reusable UI (CRT overlays, Trust Meters, Mailbox)
├── screens/          # Primary Game Views (Boot, Login, Workstation, Report)
├── data/             # JSON Configuration (Cases, Directives)
└── assets/           # Soundtracks, SFX, Pixel Art, and Built Media
```

---

## 🧪 Testing

While Fake Checker relies heavily on manual visual verification due to its rich UI, the project maintains strict code purity and cleanliness using Vite's React 18 ESLint flat configs:

```bash
# Run code linter across all components
npm run lint

# Build the project to verify no compiler errors exist
npm run build
```

---

## 🤝 Contributing

We welcome additions to the Ministry! Whether you're adding new case loads, improving the CRT visual effects, or fixing bugs, your help is appreciated. 

Please read our [Contributing Guide](.github/CONTRIBUTING.md) to get started. By participating, you are expected to uphold our [Code of Conduct](.github/CODE_OF_CONDUCT.md).

---

## 🛣️ Roadmap

- **Days 2 & 3:** Escalating narrative difficulty featuring increasingly Orwellian directives.
- **Expanded Audio Integration:** Voice hooks and dynamically pitched SFX.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
*Permission is hereby granted, free of charge, to any person obtaining a copy of this software.*

---

## 👥 Credits & Acknowledgements

Created in a matter of days for a 2026 Game Jam in Georgia.

**Project Personnel:**
- **Giorgi Talakhadze** — Game Designer
- **Archil Berozashvili** — Developer & Systems Engineer

**Inspirations:**
- Inspired by Lucas Pope's visionary work (*Papers, Please*).
- Typography powered by standard VT323 terminal fonts.

---

## 💬 Support

If you run into issues launching the simulation, or if you spot a bug in the code, please don't hesitate to open an issue via the [GitHub Issue Tracker](https://github.com/DanTe/FakeChecker/issues).

**The Ministry acknowledges your contribution to the preservation of informational order.**
