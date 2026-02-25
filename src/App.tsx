/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SignLanguageRecognition } from './components/SignLanguageRecognition';
import { ProjectAbstract } from './components/ProjectAbstract';
import { 
  Hand, 
  Mic2, 
  Stethoscope, 
  Activity, 
  Cpu, 
  Globe, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  ShieldAlert,
  MessageSquareText,
  Smartphone,
  Hospital,
  Scan,
  FileText
} from 'lucide-react';

const Section = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <section className={`py-20 px-6 ${className}`}>
    <div className="max-w-6xl mx-auto">
      {children}
    </div>
  </section>
);

const Card = ({ title, description, icon: Icon, delay = 0 }: { title: string, description: string, icon: any, delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
  >
    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
      <Icon className="w-6 h-6 text-emerald-600" />
    </div>
    <h3 className="text-xl font-semibold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </motion.div>
);

export default function App() {
  const [view, setView] = useState<'landing' | 'recognition' | 'abstract'>('landing');

  if (view === 'recognition') {
    return (
      <AnimatePresence mode="wait">
        <SignLanguageRecognition onBack={() => setView('landing')} />
      </AnimatePresence>
    );
  }

  if (view === 'abstract') {
    return (
      <AnimatePresence mode="wait">
        <ProjectAbstract onBack={() => setView('landing')} />
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"></div>
        
        <Section className="relative pt-32 pb-40">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-8"
            >
              <Activity className="w-4 h-4" />
              <span>Assistive Technology Project</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8"
            >
              Sign-to-Speech <br />
              <span className="text-emerald-600">Bridge (SSB)</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto"
            >
              A real-time assistive communication system for Indian Sign Language (ISL) users, 
              bridging the gap in healthcare and emergency scenarios.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <button 
                onClick={() => setView('recognition')}
                className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2"
              >
                Launch Recognition Tool <Scan className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setView('abstract')}
                className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> View Abstract
              </button>
            </motion.div>
          </div>
        </Section>
      </header>

      {/* Project Overview */}
      <Section className="bg-white">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Project Overview</h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              The SSB project is designed to empower deaf individuals by providing a seamless 
              communication channel with non-signing people, particularly in critical environments 
              like hospitals.
            </p>
            <ul className="space-y-4">
              {[
                "Real-time ISL recognition system",
                "Optimized for healthcare & emergency scenarios",
                "Uses standard webcam hardware",
                "Lightweight ML model for edge execution"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-slate-100"
          >
            <img 
              src="https://picsum.photos/seed/signlanguage/800/450" 
              alt="Sign Language Illustration" 
              className="object-cover w-full h-full"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </motion.div>
        </div>
      </Section>

      {/* Core Technologies */}
      <Section>
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Core Technologies</h2>
          <p className="text-slate-600">Built with modern tools for efficiency and accuracy.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          <Card 
            icon={Hand} 
            title="MediaPipe" 
            description="Hand landmark detection with 21 key points for precise gesture tracking." 
            delay={0.1}
          />
          <Card 
            icon={Cpu} 
            title="Neural Networks" 
            description="Custom-built models optimized for real-time gesture recognition." 
            delay={0.2}
          />
          <Card 
            icon={Mic2} 
            title="Text-to-Speech" 
            description="Instant voice output for recognized gestures to facilitate interaction." 
            delay={0.3}
          />
          <Card 
            icon={Globe} 
            title="Regional Support" 
            description="Support for both English alphabets and Malayalam characters." 
            delay={0.4}
          />
        </div>
      </Section>

      {/* Scope Section */}
      <Section className="bg-slate-900 text-white rounded-[3rem] mx-6 my-10">
        <div className="grid md:grid-cols-2 gap-20">
          <div>
            <h2 className="text-3xl font-bold mb-10 flex items-center gap-3">
              <Zap className="text-emerald-400" /> Current Scope
            </h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <span className="font-bold text-emerald-400">01</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Alphabet Recognition</h4>
                  <p className="text-slate-400">Accurate detection of selected English and Malayalam characters.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <span className="font-bold text-emerald-400">02</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Healthcare Vocabulary</h4>
                  <p className="text-slate-400">Essential words like "Help", "Pain", and "Doctor" are pre-programmed.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <span className="font-bold text-emerald-400">03</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Emergency Sentences</h4>
                  <p className="text-slate-400">Generation of critical 2-3 word emergency phrases for rapid response.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold mb-10 flex items-center gap-3">
              <ArrowRight className="text-emerald-400" /> Future Scope
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: MessageSquareText, text: "Advanced NLP Sentence Generation" },
                { icon: Smartphone, text: "Mobile Application Deployment" },
                { icon: Hospital, text: "Hospital & Public Service Integration" },
                { icon: ShieldAlert, text: "Edge Optimization with TF Lite" }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <item.icon className="w-6 h-6 text-emerald-400 mb-4" />
                  <p className="font-medium">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Outcomes */}
      <Section className="bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Project Outcomes</h2>
          <p className="text-slate-600">The impact and technical achievements of our prototype.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 bg-slate-50 rounded-3xl">
            <h3 className="text-xl font-bold mb-4 text-emerald-600">Functional</h3>
            <p className="text-slate-600 leading-relaxed">
              Successful conversion of hand gestures into text and speech, supporting regional 
              accessibility through Malayalam letter recognition.
            </p>
          </div>
          <div className="p-8 bg-slate-50 rounded-3xl">
            <h3 className="text-xl font-bold mb-4 text-emerald-600">Technical</h3>
            <p className="text-slate-600 leading-relaxed">
              Implementation of a lightweight ML model that runs efficiently on standard laptop 
              hardware without requiring specialized GPUs.
            </p>
          </div>
          <div className="p-8 bg-slate-50 rounded-3xl">
            <h3 className="text-xl font-bold mb-4 text-emerald-600">Impact</h3>
            <p className="text-slate-600 leading-relaxed">
              Provides a practical foundation for future assistive tools in healthcare, improving 
              communication accessibility for the hearing-impaired.
            </p>
          </div>
        </div>
      </Section>

      {/* Team Section */}
      <Section className="bg-slate-50">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">The Team</h2>
          <p className="text-slate-600">Vidya Academy of Science and Technology</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            "Aaron Thalakkottor Sooraj",
            "Abhinav N",
            "Adithya Binesh",
            "Alwin Thomas V"
          ].map((name, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm border border-slate-200">
                <Users className="w-10 h-10 text-slate-400" />
              </div>
              <h4 className="font-semibold text-slate-900">{name}</h4>
              <p className="text-sm text-slate-500">Project Member</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">SSB Bridge</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 Vidya Academy of Science and Technology. All rights reserved.
          </p>
          <div className="flex gap-6">
            <button 
              onClick={() => setView('abstract')}
              className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium"
            >
              Project Abstract
            </button>
            <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
