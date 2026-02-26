import React from "react";
import { motion } from "framer-motion";
import {
  Play,
  Layers,
  Map as MapIcon,
  Building2,
  Sparkles,
  Wand2,
  Film,
  SlidersHorizontal,
  Eye,
  ChevronRight,
  Globe2,
  Cpu,
} from "lucide-react";
import Orb from "./Orb";
import CardNav from "./CardNav";
import { accentMap } from "@/features/simulator";

export function LandingPage({ onLaunchSimulator }) {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Framer Motion Variants ---
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const slideUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const features = [
    {
      title: "Procedural Terrain",
      icon: <Globe2 className="w-5 h-5 text-cyan-400" />,
      accent: "cyan",
      desc: "Domain Warping + Fractional Brownian Motion via Simplex Noise carves realistic continents, deep oceans, and jagged mountain ranges.",
    },
    {
      title: "Urban Gravity",
      icon: <Building2 className="w-5 h-5 text-indigo-400" />,
      accent: "indigo",
      desc: "The 'Highlander' rule: new cities suppress the growth of immediate neighbors, forcing organic spacing and realistic sprawl.",
    },
    {
      title: "Agglomeration",
      icon: <Layers className="w-5 h-5 text-violet-400" />,
      accent: "violet",
      desc: "Rich get richer: core cities grow exponentially faster when surrounded and fed by rural farm tiles.",
    },
    {
      title: "Trade Nodes",
      icon: <MapIcon className="w-5 h-5 text-blue-400" />,
      accent: "blue",
      desc: "Megacities (Lv 7+) only emerge at strategic coastal or riverside locations — mimicking real historical trade routes.",
    },
    {
      title: "AI World Dreamer",
      icon: <Wand2 className="w-5 h-5 text-fuchsia-400" />,
      accent: "fuchsia",
      desc: "Powered by Google Gemini. The Oracle invents a world name, founding myth, and culture — then physically shapes the terrain to match.",
    },
    {
      title: "Cinematic Transitions",
      icon: <Film className="w-5 h-5 text-amber-400" />,
      accent: "amber",
      desc: "Battle flash ⚔️, growth glow ✨, and sprawl fade-in 🌱 — an rAF interpolation engine renders smooth animated transitions at 60fps.",
    },
  ];

  const stats = [
    { value: "160 × 100", label: "Grid Resolution" },
    { value: "80", label: "Simulated Epochs" },
    { value: "5", label: "Faction Colors" },
    { value: "3", label: "View Modes" },
  ];

  const steps = [
    {
      num: "01",
      icon: <SlidersHorizontal className="w-6 h-6" />,
      title: "Generate",
      desc: "Dial sea level and factions, then click Rebuild — or let the AI Oracle dream the world for you.",
    },
    {
      num: "02",
      icon: <Cpu className="w-6 h-6" />,
      title: "Simulate",
      desc: "Watch 80 epochs of civilisation history unfold: tribes settle, cities cluster, borders clash.",
    },
    {
      num: "03",
      icon: <Eye className="w-6 h-6" />,
      title: "Explore",
      desc: "Scrub the timeline, switch between Terrain / Heatmap / City views, and study the emergent empires.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white flex flex-col overflow-x-hidden">
      {/* ── NAV ── */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <CardNav
          scrolled={isScrolled}
          onLaunch={onLaunchSimulator}
          items={[
            {
              label: "Explore",
              icon: <Layers className="w-5 h-5" />,
              bgColor: "rgba(30, 41, 59, 1)", // slate-800
              textColor: "#f1f5f9",
              links: [
                { label: "Features", href: "#features" },
                { label: "How It Works", href: "#how-it-works" },
                { label: "Stats", href: "#stats" },
              ],
            },
            {
              label: "Learn",
              icon: <Wand2 className="w-5 h-5" />,
              bgColor: "rgba(30, 41, 59, 1)", // slate-800
              textColor: "#f1f5f9",
              links: [
                { label: "Logic Explanation", href: "#" },
                { label: "Documentation", href: "#" },
                { label: "Wiki", href: "#" },
              ],
            },
            {
              label: "Community",
              icon: <Globe2 className="w-5 h-5" />,
              bgColor: "rgba(30, 41, 59, 1)", // slate-800
              textColor: "#f1f5f9",
              links: [
                { label: "GitHub Repository", href: "#" },
                { label: "Discord Server", href: "#" },
                { label: "Twitter / X", href: "#" },
              ],
            },
          ]}
        />
      </motion.div>

      {/* ── HERO ── */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 sm:py-32 relative overflow-hidden">
        {/* Background Gradients & Effects */}
        <div className="absolute inset-0 bg-[#020617]">
          {/* Animated Orb Base */}
          <div className="absolute inset-0 opacity-70">
            <Orb
              hoverIntensity={0.5}
              rotateOnHover={true}
              hue={250}
              forceHoverState={false}
              backgroundColor="#020617"
            />
          </div>
          {/* subtle radial center glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(67,56,202,0.15),transparent_60%)] pointer-events-none" />
        </div>

        {/* Animated Grid overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none mask-[linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #818cf8 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <motion.div
          className="relative z-10 max-w-5xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Badge */}
          <motion.div
            variants={staggerItem}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-10 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            Now with Cinematic Animation Engine
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={staggerItem}
            className="text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white tracking-tighter leading-none mb-7"
          >
            Procedural History
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-cyan-300 to-violet-400">
              Written in Code
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={staggerItem}
            className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            A physics-based civilization simulator powered by Cellular Automata
            and Google Gemini. Watch tribes settle fertile lands, wage border
            wars, and evolve into megacities — all with cinematic 60fps
            transitions.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={staggerItem}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
          >
            <button
              onClick={onLaunchSimulator}
              className="cursor-pointer group flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl text-base font-bold transition-all duration-200 shadow-xl shadow-indigo-900/50 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
            >
              <Play size={18} fill="currentColor" />
              Launch Simulation
              <ChevronRight
                size={16}
                className="opacity-60 group-hover:translate-x-0.5 transition-transform"
              />
            </button>
            <a
              href="#features"
              className="cursor-pointer flex items-center gap-2 text-slate-400 hover:text-white px-8 py-4 rounded-xl text-base font-medium border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-200 backdrop-blur-sm"
            >
              Explore Features
            </a>
          </motion.div>
        </motion.div>
      </main>

      {/* ── STATS BAR ── */}
      <motion.div
        id="stats"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="border-y border-slate-800/60 bg-slate-900/40 backdrop-blur-sm py-6 relative z-10"
      >
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <motion.div key={s.label} variants={staggerItem}>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {s.value}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mt-1 font-medium">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-indigo-950/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={slideUp}
            className="text-center mb-16"
          >
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">
              Engine Features
            </p>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">
              Built like a real simulator
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              Every system is grounded in real urban geography and historical
              patterns.
            </p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={`group relative bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:shadow-xl backdrop-blur-sm cursor-default transition-colors duration-300 ${accentMap[f.accent]}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-slate-800/80">{f.icon}</div>
                  <h3 className="font-bold text-white text-sm">{f.title}</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how-it-works"
        className="py-24 px-6 border-t border-slate-800/40"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={slideUp}
            className="text-center mb-16"
          >
            <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3">
              How It Works
            </p>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">
              Three steps to civilisation
            </h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          >
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-linear-to-r from-indigo-500/20 via-cyan-500/40 to-violet-500/20" />
            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="relative flex flex-col items-center text-center gap-4"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-900/20 group-hover:border-indigo-500/40 transition-colors">
                    {step.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA FOOTER BANNER ── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={slideUp}
        className="py-24 px-6"
      >
        <div className="max-w-4xl mx-auto relative">
          {/* Glow blob */}
          <div className="absolute inset-0 bg-indigo-600/10 rounded-3xl blur-3xl" />
          <div className="relative bg-linear-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-12 text-center overflow-hidden">
            {/* Inner grid */}
            <div
              className="absolute inset-0 opacity-[0.04] rounded-3xl"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #818cf8 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tighter mb-4">
                Ready to rewrite history?
              </h2>
              <p className="text-slate-400 text-lg mb-9 max-w-xl mx-auto">
                No install. No sign-up. Just open the simulator and watch
                civilisations emerge in seconds.
              </p>
              <button
                onClick={onLaunchSimulator}
                className="cursor-pointer inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-xl text-base font-bold transition-all duration-200 shadow-2xl shadow-indigo-900/60 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                <Play size={18} fill="currentColor" />
                Launch Simulation — It's Free
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800/40 py-8 px-6 text-center text-xs text-slate-600">
        <span>
          CitySim.AI v2.5 · Built with React, HTML5 Canvas, Cellular Automata
          &amp; Google Gemini
        </span>
      </footer>
    </div>
  );
}
