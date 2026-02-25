import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Volume2, ShieldAlert, HeartPulse, Flame, Siren, UserRound, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmergencySign {
  label: string;
  emoji: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const emergencySigns: EmergencySign[] = [
  {
    label: "I need help",
    emoji: "🆘",
    description: "General emergency assistance required",
    icon: <AlertCircle className="w-6 h-6" />,
    color: "bg-red-500"
  },
  {
    label: "Medical Emergency",
    emoji: "🚑",
    description: "Need an ambulance or doctor immediately",
    icon: <HeartPulse className="w-6 h-6" />,
    color: "bg-rose-600"
  },
  {
    label: "Fire",
    emoji: "🔥",
    description: "Fire emergency detected",
    icon: <Flame className="w-6 h-6" />,
    color: "bg-orange-600"
  },
  {
    label: "Police",
    emoji: "👮",
    description: "Need police assistance",
    icon: <ShieldAlert className="w-6 h-6" />,
    color: "bg-blue-600"
  },
  {
    label: "I am in pain",
    emoji: "😫",
    description: "Experiencing severe physical pain",
    icon: <Siren className="w-6 h-6" />,
    color: "bg-amber-600"
  },
  {
    label: "Choking",
    emoji: "🤢",
    description: "Difficulty breathing or choking",
    icon: <UserRound className="w-6 h-6" />,
    color: "bg-emerald-600"
  },
  {
    label: "Call Family",
    emoji: "📞",
    description: "Need to contact emergency contacts",
    icon: <PhoneCall className="w-6 h-6" />,
    color: "bg-indigo-600"
  },
  {
    label: "Allergic Reaction",
    emoji: "🤧",
    description: "Severe allergic response",
    icon: <AlertCircle className="w-6 h-6" />,
    color: "bg-purple-600"
  }
];

export function EmergencySigns() {
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in your browser.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Siren className="w-7 h-7 text-red-600" />
            Emergency Quick-Signs
          </h2>
          <p className="text-slate-600">One-tap emergency communication with voice output</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {emergencySigns.map((sign, i) => (
          <motion.div
            key={sign.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -5 }}
            className="group relative bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-red-100 transition-all cursor-pointer overflow-hidden"
            onClick={() => speak(sign.label)}
          >
            {/* Background Accent */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 transition-transform group-hover:scale-150 ${sign.color}`}></div>
            
            <div className="relative z-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg ${sign.color}`}>
                {sign.icon}
              </div>
              
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{sign.emoji}</span>
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{sign.label}</h3>
              </div>
              
              <p className="text-sm text-slate-500 mb-6 line-clamp-2">
                {sign.description}
              </p>

              <Button 
                variant="outline" 
                className="w-full gap-2 rounded-xl border-slate-200 group-hover:bg-red-50 group-hover:text-red-600 group-hover:border-red-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(sign.label);
                }}
              >
                <Volume2 className="w-4 h-4" />
                Speak Now
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-red-50 border border-red-100 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-red-200">
          <Siren className="w-8 h-8 text-white animate-pulse" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-lg font-bold text-red-900 mb-1">Emergency Protocol</h4>
          <p className="text-red-700 text-sm">
            These signs are designed for rapid communication during critical moments. 
            Tapping any card will instantly broadcast the message using your device's voice synthesizer.
          </p>
        </div>
        <Button 
          variant="hero" 
          className="bg-red-600 hover:bg-red-700 shadow-red-200"
          onClick={() => speak("This is an emergency. I need immediate assistance.")}
        >
          Broadcast Emergency
        </Button>
      </div>
    </div>
  );
}
