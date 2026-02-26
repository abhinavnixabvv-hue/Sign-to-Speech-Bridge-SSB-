import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Type, Play, RotateCcw, MessageSquare, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SignLanguage = 'ASL' | 'ISL';

const aslAlphabet: Record<string, string> = {
  'A': '✊', 'B': '✋', 'C': '🤏', 'D': '☝️', 'E': '✊',
  'F': '👌', 'G': '🤏', 'H': '✌️', 'I': '☝️', 'J': '🤙',
  'K': '✌️', 'L': '☝️', 'M': '✊', 'N': '✊', 'O': '👌',
  'P': '✌️', 'Q': '🤏', 'R': '🤞', 'S': '✊', 'T': '✊',
  'U': '✌️', 'V': '✌️', 'W': '✋', 'X': '☝️', 'Y': '🤙', 'Z': '☝️',
  ' ': ' '
};

const islAlphabet: Record<string, string> = {
  'A': '☝️', 'B': '✋', 'C': '🤏', 'D': '☝️', 'E': '✊',
  'F': '👌', 'G': '✊', 'H': '✋', 'I': '☝️', 'J': '🤙',
  'K': '✌️', 'L': '☝️', 'M': '✋', 'N': '✌️', 'O': '👌',
  'P': '☝️', 'Q': '🤏', 'R': '✌️', 'S': '✊', 'T': '☝️',
  'U': '✌️', 'V': '✌️', 'W': '✋', 'X': '☝️', 'Y': '🤙', 'Z': '☝️',
  ' ': ' '
};

// Common words mapping
const wordSigns: Record<string, string> = {
  'HELLO': '👋',
  'HELP': '🆘',
  'PAIN': '😫',
  'DOCTOR': '👨‍⚕️',
  'YES': '👍',
  'NO': '👎',
  'OK': '👌',
  'LOVE': '🤟',
  'PEACE': '✌️',
  'THANKS': '🙏',
  'PLEASE': '🙏',
  'MEDICINE': '💊',
  'HOSPITAL': '🏥',
  'EMERGENCY': '🚨',
  'NURSE': '👩‍⚕️',
  'FEVER': '🤒',
  'WATER': '💧',
  'FOOD': '🍱',
  'FIRE': '🔥',
  'POLICE': '👮',
  'CHOKING': '🤢',
  'FAMILY': '📞',
  'ALLERGY': '🤧'
};

export function TextToSign() {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [displayMode, setDisplayMode] = useState<'sequence' | 'animated'>('sequence');
  const [language, setLanguage] = useState<SignLanguage>('ASL');

  const words = text.toUpperCase().split(/\s+/).filter(w => w.length > 0);
  
  const getSignForChar = (char: string) => {
    const alphabet = language === 'ASL' ? aslAlphabet : islAlphabet;
    return alphabet[char] || '❓';
  };
  const getSignForWord = (word: string) => wordSigns[word] || null;

  // Process text into a mix of words and characters for display
  const getDisplayItems = () => {
    const items: { type: 'word' | 'char', value: string, sign: string }[] = [];
    const rawWords = text.toUpperCase().split(/(\s+)/);
    
    rawWords.forEach(part => {
      if (part.trim().length === 0) {
        if (part.length > 0) items.push({ type: 'char', value: ' ', sign: ' ' });
        return;
      }
      
      const wordSign = getSignForWord(part);
      if (wordSign) {
        items.push({ type: 'word', value: part, sign: wordSign });
      } else {
        part.split('').forEach(char => {
          items.push({ type: 'char', value: char, sign: getSignForChar(char) });
        });
      }
    });
    return items;
  };

  const displayItems = getDisplayItems();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentIndex < displayItems.length - 1) {
      timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 1000);
    } else if (currentIndex === displayItems.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, displayItems]);

  const handlePlay = () => {
    if (text.length === 0) return;
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(-1);
    setText('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Text to Sign</h2>
          <p className="text-slate-600">Convert your text into sign language gestures</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {/* Language Selector */}
          <div className="flex gap-2 bg-emerald-100/50 p-1 rounded-xl border border-emerald-200">
            <button
              onClick={() => setLanguage('ASL')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                language === 'ASL' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              ASL
            </button>
            <button
              onClick={() => setLanguage('ISL')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                language === 'ISL' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              ISL
            </button>
          </div>

          <div className="flex gap-2 bg-slate-200 p-1 rounded-xl">
            <button
              onClick={() => setDisplayMode('sequence')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                displayMode === 'sequence' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Sequence
            </button>
            <button
              onClick={() => setDisplayMode('animated')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                displayMode === 'animated' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Animated
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Type className="w-4 h-4 text-emerald-600" />
              Enter Text ({language})
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Type something in ${language}...`}
              className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none transition-all"
            />
            <div className="mt-4 flex gap-2">
              <Button 
                onClick={handlePlay} 
                disabled={isPlaying || text.length === 0}
                className="flex-1 gap-2"
                variant="hero"
              >
                <Play className="w-4 h-4" /> Play
              </Button>
              <Button 
                onClick={handleReset} 
                variant="outline"
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </Button>
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
            <h4 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" /> {language} Mode
            </h4>
            <ul className="text-xs text-emerald-700 space-y-2">
              <li>• Currently showing {language === 'ASL' ? 'American' : 'Indian'} Sign Language.</li>
              <li>• Common words like "HELP" or "HELLO" have special icons.</li>
              <li>• Other words will be spelled out letter by letter.</li>
            </ul>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-2xl p-8 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden shadow-xl border-2 border-slate-800">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
            
            <AnimatePresence mode="wait">
              {displayMode === 'animated' ? (
                <div className="flex flex-col items-center gap-8">
                  <motion.div
                    key={currentIndex}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="text-9xl filter drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                  >
                    {currentIndex >= 0 ? displayItems[currentIndex].sign : '⌨️'}
                  </motion.div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-white tracking-widest">
                      {currentIndex >= 0 ? displayItems[currentIndex].value : 'READY'}
                    </p>
                    <div className="mt-4 flex gap-1 justify-center">
                      {displayItems.map((item, i) => (
                        <div 
                          key={i} 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === currentIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-wrap justify-center gap-6 content-center">
                  {displayItems.length > 0 ? (
                    displayItems.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`group relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                          i === currentIndex ? 'bg-emerald-600 border-emerald-400 scale-110 shadow-lg shadow-emerald-900/50' : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <span className="text-5xl">{item.sign}</span>
                        <span className={`text-xs font-bold ${i === currentIndex ? 'text-white' : 'text-slate-500'}`}>
                          {item.value === ' ' ? 'SPACE' : item.value}
                        </span>
                        {item.type === 'word' && (
                          <div className="absolute -top-2 -right-2 bg-emerald-500 text-[10px] text-white px-1.5 py-0.5 rounded-full font-bold">WORD</div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center">
                      <Type className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">Your sign sequence will appear here</p>
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>

            {isPlaying && (
              <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Playing
              </div>
            )}
          </div>

          {/* Word Matching Section */}
          <div className="mt-8">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Detected Words</h4>
            <div className="flex flex-wrap gap-3">
              {words.map((word, i) => {
                const sign = getSignForWord(word);
                return sign ? (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm"
                  >
                    <span className="text-2xl">{sign}</span>
                    <span className="font-bold text-slate-900">{word}</span>
                  </motion.div>
                ) : null;
              })}
              {words.every(w => !getSignForWord(w)) && text.length > 0 && (
                <p className="text-xs text-slate-400 italic">No common words matched. Spelling out letter by letter.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
