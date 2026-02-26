import React from 'react';
import { motion } from 'framer-motion';
import { Search, Info } from 'lucide-react';

type SignLanguage = 'ASL' | 'ISL';

const aslSigns = [
  { sign: "A", emoji: "✊", description: "Fist, thumb on side", category: "alphabet" },
  { sign: "B", emoji: "✋", description: "Open hand, fingers together", category: "alphabet" },
  { sign: "C", emoji: "🤏", description: "Curved hand like a C", category: "alphabet" },
  { sign: "D", emoji: "☝️", description: "Index finger up, others touch thumb", category: "alphabet" },
  { sign: "E", emoji: "✊", description: "Fist, fingers curled over thumb", category: "alphabet" },
  { sign: "F", emoji: "👌", description: "OK sign, thumb and index touch", category: "alphabet" },
  { sign: "G", emoji: "🤏", description: "Index and thumb pointing forward", category: "alphabet" },
  { sign: "H", emoji: "✌️", description: "Index and middle pointing forward", category: "alphabet" },
  { sign: "I", emoji: "☝️", description: "Pinky finger up", category: "alphabet" },
  { sign: "K", emoji: "✌️", description: "Index and middle up, thumb touches middle", category: "alphabet" },
  { sign: "L", emoji: "☝️", description: "L shape with thumb and index", category: "alphabet" },
  { sign: "M", emoji: "✊", description: "Thumb under three fingers", category: "alphabet" },
  { sign: "N", emoji: "✊", description: "Thumb under two fingers", category: "alphabet" },
  { sign: "O", emoji: "👌", description: "Circle with all fingers and thumb", category: "alphabet" },
  { sign: "P", emoji: "✌️", description: "K sign pointing downwards", category: "alphabet" },
  { sign: "Q", emoji: "🤏", description: "G sign pointing downwards", category: "alphabet" },
  { sign: "R", emoji: "🤞", description: "Index and middle crossed", category: "alphabet" },
  { sign: "S", emoji: "✊", description: "Fist, thumb over fingers", category: "alphabet" },
  { sign: "T", emoji: "✊", description: "Thumb under index finger", category: "alphabet" },
  { sign: "U", emoji: "✌️", description: "Index and middle up and together", category: "alphabet" },
  { sign: "V", emoji: "✌️", description: "Index and middle up and apart", category: "alphabet" },
  { sign: "W", emoji: "✋", description: "Index, middle, and ring fingers up", category: "alphabet" },
  { sign: "X", emoji: "☝️", description: "Index finger hooked", category: "alphabet" },
  { sign: "Y", emoji: "🤙", description: "Thumb and pinky extended", category: "alphabet" },
  { sign: "Z", emoji: "☝️", description: "Index finger draws a Z", category: "alphabet" },
  { sign: "HELP", emoji: "🆘", description: "Thumb up with middle finger extended", category: "emergency" },
  { sign: "FIRE", emoji: "🔥", description: "Index finger draws a flame or use fire emoji", category: "emergency" },
  { sign: "POLICE", emoji: "👮", description: "Index finger to forehead like a salute", category: "emergency" },
  { sign: "PAIN", emoji: "😫", description: "Twisting index fingers near the area of pain", category: "emergency" },
  { sign: "HELLO", emoji: "👋", description: "Open hand, all fingers extended", category: "greeting" },
  { sign: "Thumbs Up / YES", emoji: "👍", description: "Thumb up, fingers closed", category: "response" },
  { sign: "Thumbs Down / NO", emoji: "👎", description: "Thumb down, fingers closed", category: "response" },
  { sign: "I Love You", emoji: "🤟", description: "Thumb + index + pinky extended", category: "expression" },
  { sign: "Rock On", emoji: "🤘", description: "Index + pinky up, no thumb", category: "expression" },
  { sign: "Vulcan Salute", emoji: "🖖", category: "expression", description: "Spock's greeting, split between middle and ring" },
  { sign: "Three", emoji: "3️⃣", description: "Index + middle + ring up", category: "number" },
  { sign: "Four", emoji: "4️⃣", description: "All fingers up, thumb closed", category: "number" },
];

const islSigns = [
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
];

export function SignLanguageLibrary({ language = 'ASL' }: { language?: SignLanguage }) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const signs = language === 'ASL' ? aslSigns : islSigns;

  const filteredSigns = signs.filter(item => 
    item.sign.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{language} Sign Library</h2>
          <p className="text-slate-600">Explore common {language} signs and their meanings</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search signs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-64 transition-all"
          />
        </div>
      </div>

      {filteredSigns.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSigns.map((item, i) => (
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
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">No signs found</h3>
          <p className="text-slate-500">Try adjusting your search query</p>
        </div>
      )}
    </div>
  );
}
