import React from 'react';
import { motion } from 'framer-motion';
import { Search, Info } from 'lucide-react';

const commonSigns = [
  { sign: "Hello", emoji: "👋", description: "All fingers extended, open hand", category: "greeting" },
  { sign: "Thumbs Up", emoji: "👍", description: "Thumb up, fingers closed", category: "response" },
  { sign: "Thumbs Down", emoji: "👎", description: "Thumb down, fingers closed", category: "response" },
  { sign: "Fist", emoji: "✊", description: "All fingers closed into a fist", category: "response" },
  { sign: "OK", emoji: "👌", description: "Thumb + index tips touching, others up", category: "response" },
  { sign: "Peace", emoji: "✌️", description: "Index + middle up, rest closed", category: "expression" },
  { sign: "I Love You", emoji: "🤟", description: "Thumb + index + pinky extended", category: "expression" },
  { sign: "Rock On", emoji: "🤘", description: "Index + pinky up, no thumb", category: "expression" },
  { sign: "Call Me", emoji: "🤙", description: "Thumb + pinky extended like a phone", category: "expression" },
  { sign: "Vulcan Salute", emoji: "🖖", category: "expression", description: "Spock's greeting, split between middle and ring" },
  { sign: "One", emoji: "1️⃣", description: "Only index finger up", category: "number" },
  { sign: "Two", emoji: "2️⃣", description: "Index + middle up", category: "number" },
  { sign: "Three", emoji: "3️⃣", description: "Index + middle + ring up", category: "number" },
  { sign: "Four", emoji: "4️⃣", description: "All fingers up, thumb closed", category: "number" },
  { sign: "Five", emoji: "5️⃣", description: "All fingers up including thumb", category: "number" },
  { sign: "Point Up", emoji: "☝️", description: "Index finger pointing upwards", category: "direction" },
  { sign: "Point Right", emoji: "👉", description: "Index finger pointing to the right", category: "direction" },
  { sign: "Point Left", emoji: "👈", description: "Index finger pointing to the left", category: "direction" },
];

export function SignLanguageLibrary() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sign Library</h2>
          <p className="text-slate-600">Explore common signs and their meanings</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search signs..." 
            className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {commonSigns.map((item, i) => (
          <motion.div
            key={item.sign}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl">
                {item.emoji}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{item.sign}</h3>
                <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">{item.category}</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed flex items-start gap-2">
              <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
