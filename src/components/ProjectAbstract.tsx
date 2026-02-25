import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  FileText, 
  Target, 
  Zap, 
  Cpu, 
  TrendingUp, 
  CheckCircle, 
  Award,
  BookOpen,
  Users,
  Download,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AbstractSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  delay?: number;
}

const AbstractSection = ({ title, icon: Icon, children, delay = 0 }: AbstractSectionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="mb-12"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-emerald-100 rounded-lg">
        <Icon className="w-5 h-5 text-emerald-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    </div>
    <div className="pl-12">
      {children}
    </div>
  </motion.div>
);

export function ProjectAbstract({ onBack }: { onBack: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const downloadPDF = async () => {
    if (!contentRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Handle multi-page if content is too long
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('SSB_Project_Abstract.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>
          <div className="flex items-center gap-4">
            <Button 
              variant="hero" 
              size="sm" 
              onClick={downloadPDF} 
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isGenerating ? 'Generating...' : 'Download PDF'}
            </Button>
            <div className="hidden md:flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-slate-900">Project Abstract</span>
            </div>
          </div>
        </div>
      </nav>

      <div ref={contentRef} className="max-w-4xl mx-auto px-6 pt-16 bg-white">
        {/* Title Block */}
        <header className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
          >
            Sign-to-Speech Bridge (SSB)
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6 text-slate-600 font-medium"
          >
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Vidya Academy of Science and Technology</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Assistive Technology / Accessibility</span>
            </div>
          </motion.div>
        </header>

        {/* Team Members */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-50 rounded-2xl p-8 mb-16 border border-slate-100"
        >
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Users className="w-4 h-4" /> Team Members
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Aaron Thalakkottor Sooraj",
              "Abhinav N",
              "Adithya Binesh",
              "Alwin Thomas V"
            ].map((member, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-800 font-medium">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                {member}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Abstract Content */}
        <div className="space-y-4">
          <AbstractSection title="Project Overview" icon={BookOpen} delay={0.4}>
            <p className="text-lg text-slate-600 leading-relaxed mb-4">
              A real-time assistive communication system for Indian Sign Language (ISL) users, 
              specifically designed for healthcare and emergency communication scenarios.
            </p>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                <span>Bridges the communication gap between deaf individuals and non-signing people.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                <span>Uses a standard webcam and lightweight machine learning model for accessibility.</span>
              </li>
            </ul>
          </AbstractSection>

          <AbstractSection title="Functional Outcomes" icon={Zap} delay={0.5}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 text-slate-600">
                <p>• Accurate recognition of selected English alphabets (A–Z).</p>
                <p>• Recognition of a basic set of Malayalam letters for regional accessibility.</p>
              </div>
              <div className="space-y-3 text-slate-600">
                <p>• Conversion of gestures into individual letters, words, and simple sentences.</p>
                <p>• Real-time display of output text on the screen.</p>
              </div>
            </div>
          </AbstractSection>

          <AbstractSection title="Technical Outcomes" icon={Cpu} delay={0.6}>
            <ul className="space-y-4 text-slate-600">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2.5 shrink-0" />
                <span>Implementation of MediaPipe Hands for efficient hand landmark detection.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2.5 shrink-0" />
                <span>Development of a lightweight machine learning model suitable for real-time performance.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2.5 shrink-0" />
                <span>Stable prediction using simple filtering to avoid rapid output changes.</span>
              </li>
            </ul>
          </AbstractSection>

          <AbstractSection title="Impact Outcomes" icon={TrendingUp} delay={0.7}>
            <p className="text-slate-600 leading-relaxed">
              Demonstrates a practical assistive communication tool for hearing- and speech-impaired individuals, 
              providing a foundation for future expansion into healthcare and public service environments.
            </p>
          </AbstractSection>

          <AbstractSection title="Core Technologies Used" icon={Cpu} delay={0.8}>
            <div className="flex flex-wrap gap-3">
              {[
                "MediaPipe (21 Hand Landmarks)",
                "Custom Neural Network",
                "Python-based Implementation",
                "Text-to-Speech Module"
              ].map((tech, i) => (
                <span key={i} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-100">
                  {tech}
                </span>
              ))}
            </div>
          </AbstractSection>

          <AbstractSection title="Current Implementation Scope" icon={Target} delay={0.9}>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-slate-600 text-sm">
                <li>• Recognition of selected English alphabets</li>
                <li>• Recognition of basic Malayalam characters</li>
                <li>• Essential healthcare words (Help, Pain, Doctor)</li>
                <li>• Predefined emergency sentences</li>
                <li>• Real-time text display with audio output</li>
                <li>• Optimized for simple execution</li>
              </ul>
            </div>
          </AbstractSection>

          <AbstractSection title="Future Scope" icon={TrendingUp} delay={1.0}>
            <ul className="space-y-3 text-slate-600">
              <li>• Complete English and Malayalam sign recognition.</li>
              <li>• Advanced sentence generation using NLP.</li>
              <li>• Mobile application deployment and edge optimization.</li>
              <li>• Deployment in hospitals and public service centers.</li>
            </ul>
          </AbstractSection>

          <AbstractSection title="Conclusion" icon={CheckCircle} delay={1.1}>
            <div className="bg-emerald-600 text-white rounded-3xl p-8 shadow-xl shadow-emerald-200">
              <p className="text-lg leading-relaxed opacity-90">
                The SSB project has successfully developed a functional prototype for basic Sign-to-Text 
                communication. By leveraging MediaPipe and lightweight models, it provides a stable foundation 
                for future enhancements in Assistive Technology, ultimately aiming to improve communication 
                accessibility in critical social environments.
              </p>
            </div>
          </AbstractSection>
        </div>
      </div>
    </div>
  );
}
