# 🌍 CitySim.AI - Procedural History Engine

**CitySim.AI** is a high-performance, physics-based civilization simulator and procedural world generator built entirely in React and HTML5 Canvas. Watch as ancient tribes settle fertile lands, form distinct urban clusters, wage border wars, and evolve into megacities based on realistic geographical constraints.

---

## ✨ Features

### 🏔️ Procedural Earth Generation

- **Tectonic Physics:** Utilizes Domain Warping, Fractional Brownian Motion (fBm), and Ridged Multi-Fractals via Simplex Noise to generate realistic continents, deep oceans, and jagged mountain ranges.
- **Hydraulic Erosion:** A gravity-based gradient descent algorithm carves winding rivers from mountain peaks down to the ocean.

### 🏙️ Urban Clustering (Cellular Automata)

The simulation utilizes an advanced Cellular Automata engine to model human growth without turning into a homogeneous blob:

- **Carrying Capacity:** Deserts remain scattered rural villages, while fertile plains support sprawling suburbs.
- **Urban Gravity (The Highlander Rule):** New cities suppress the growth of their immediate neighbors, forcing organic spacing and realistic sprawl.
- **Agglomeration:** Core cities grow exponentially faster when surrounded and "fed" by rural farm tiles.
- **Trade Nodes:** Megacities (Density 7-9) can only emerge at strategic locations adjacent to rivers or oceans.
- **Seafaring & Colonization:** Developed coastal cities launch naval expeditions to cross oceans and establish beachheads on new continents.

### 🗺️ Dynamic Administrative Divisions

The engine automatically structures empires into provinces and distinct regions as they grow:

- **Multi-Source BFS + Voronoi Hybrid:** A custom, high-performance algorithm establishes province borders by identifying dense urban centers (density >= 5) and calculating their expanding outward reach simultaneously.
- **Deterministic Border Disputes:** When neighboring cities expand into the same territory, a Voronoi distance override logically assigns tiles to the nearest urban core, resolving conflicts with persistent ID-based tie-breaking.
- **High-Performance Memory Management:** Utilizes specialized typed arrays (`Uint8Array` for simulation densities and `Uint16Array` for regions) allowing the tracking of up to 65,535 unique stable provinces without dropping frames.
- **Dirty-Flag Gating:** Heavy Province BFS expansions only run when triggered by specific density thresholds, bypassing unnecessary calculations to preserve the 60fps simulation engine speed.

### 🧠 The AI "World Dreamer" Oracle

Integrated with the Google Gemini API, the simulator can **"dream."** Instead of random generation, the AI acts as a fantasy historian to invent a unique world name, founding myth, and culture. It then directly controls the procedural engine's geographical parameters (roughness, sea level, rivers) to physically build the world it just wrote a history for.

---

## 🛠️ Tech Stack

- **Frontend:** React.js
- **Rendering:** HTML5 `<canvas>` (60fps grid rendering, 160x100 resolution)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **AI:** Google Gemini API

---

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js and npm installed.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/YOUR_USERNAME/CitySim-AI.git
   ```

2. Navigate to the directory:

   ```bash
   cd CitySim-AI
   ```

3. Install the required dependencies:

   ```bash
   npm install
   npm install lucide-react chart.js
   ```

4. Add your Gemini API Key:
   Open `src/App.jsx`, locate the `dreamWorldWithAI` function, and paste your key into the `apiKey` variable.
5. Start the development server:

   ```bash
   npm run dev
   ```

---

## 🎮 How to Play

- **Generate Manually:** Use the geographic parameter sliders (Sea Level, Factions) on the left sidebar and click "Rebuild".
- **Dream with AI:** Click the "Dream World" button to let the Gemini LLM invent a story and build a matching world.
- **View Modes:** Use the top-right toggle to switch between viewing the raw **Terrain**, the **Heatmap** logic, or the cinematic **City View**.
- **Time Travel:** Press the Play button at the bottom, or drag the timeline slider to scrub through history!
