"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import EchoBlob from "@/components/EchoBlob";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-y-auto overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
          <span className="text-lg font-semibold tracking-wide">Roam</span>
        </div>
        <Link
          href="/app"
          className="px-5 py-2 bg-amber-500 text-black text-sm font-semibold rounded-full hover:bg-amber-400 transition-colors"
        >
          Try it free
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-amber-500/3 to-transparent blur-[80px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-center text-center max-w-3xl"
        >
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400"
          >
            A walking companion, not a fitness app
          </motion.div>

          {/* Echo blob */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", damping: 15 }}
            className="mb-10"
          >
            <EchoBlob state="idle" size={130} />
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
            A friend to walk with
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              when no one else is around
            </span>
          </h1>

          {/* Subhead */}
          <p className="text-lg sm:text-xl text-gray-400 max-w-xl mb-10 leading-relaxed">
            Open the app. Tap one button. Echo greets you by voice and walks
            with you. It chats, notices things, asks how your day was. Your city
            slowly uncovers as a map of every walk you&apos;ve ever taken
            together.
          </p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              href="/app"
              className="px-8 py-4 bg-amber-500 text-black text-lg font-semibold rounded-full shadow-lg shadow-amber-500/20 hover:bg-amber-400 hover:shadow-amber-400/30 transition-all"
            >
              Start walking with Echo
            </Link>
            <span className="text-sm text-gray-500">
              No account needed. No download.
            </span>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold text-center mb-16"
        >
          How it works
        </motion.h2>

        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Tap \"Let's go\"",
              desc: "One button. No account, no setup, no tutorial. Echo says hi the moment you start.",
              icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                </svg>
              ),
            },
            {
              step: "02",
              title: "Walk and talk",
              desc: "Echo chats with you by voice. It asks about your day, notices new streets, and keeps you company.",
              icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              ),
            },
            {
              step: "03",
              title: "Your city remembers",
              desc: "Every walk reveals more of the map. Frequent routes glow warmer. After a month, you can see your life.",
              icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                </svg>
              ),
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8"
            >
              <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-5">
                {item.icon}
              </div>
              <div className="text-xs text-amber-400/60 font-mono mb-2">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* The emotional pitch */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-8">
              Not a fitness app.
              <br />
              <span className="text-gray-500">Not a wellness app.</span>
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto mb-6">
              We&apos;re not going to tell you to hit 10,000 steps or log your
              workouts. Roam is the friend you walk with when no one else is
              around, and the reason to put your shoes on when nothing else is
              working.
            </p>
            <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
              You&apos;re probably tired. Your to-do list never ends. You
              haven&apos;t been outside today for any reason that wasn&apos;t an
              errand. Echo is the small, gentle reason to put shoes on. That&apos;s
              it. That&apos;s the whole thing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features row */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              title: "Echo talks to you",
              desc: "A warm voice companion powered by AI. Not a coach. Not a therapist. A friend who asks what you ate today.",
              gradient: "from-amber-500/20 to-orange-500/5",
            },
            {
              title: "Your city as a heat map",
              desc: "Streets you've never walked are hidden in fog. Frequent routes glow golden. Your map is uniquely yours.",
              gradient: "from-violet-500/20 to-blue-500/5",
            },
            {
              title: "No account needed",
              desc: "Open the app and start walking. No signup, no login, no email. Your data stays on your device.",
              gradient: "from-emerald-500/20 to-teal-500/5",
            },
            {
              title: "Built for real people",
              desc: "Overworked. Screen-saturated. Lonely. You don't need another to-do. You need a reason to go outside.",
              gradient: "from-rose-500/20 to-pink-500/5",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${item.gradient} border border-white/[0.06] rounded-2xl p-8`}
            >
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <EchoBlob state="idle" size={90} className="mx-auto mb-8" />
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to go?
          </h2>
          <p className="text-lg text-gray-400 mb-10">
            Echo&apos;s waiting. One tap and you&apos;re walking.
          </p>
          <Link
            href="/app"
            className="inline-block px-10 py-4 bg-amber-500 text-black text-lg font-semibold rounded-full shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all"
          >
            Start walking with Echo
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
            <span className="text-sm font-medium text-gray-400">Roam</span>
          </div>
          <p className="text-sm text-gray-600">
            A voice-first walking companion. Made for the UW iStartup Launch Sprint 2026.
          </p>
        </div>
      </footer>
    </div>
  );
}
