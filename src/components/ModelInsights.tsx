import React from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { Cpu, Activity, Grid3X3, Zap } from 'lucide-react';

const accuracyData = [
  { epoch: 1, train: 0.8658, val: 0.9893 },
  { epoch: 2, train: 0.9777, val: 0.9838 },
  { epoch: 3, train: 0.9844, val: 0.9774 },
  { epoch: 4, train: 0.9887, val: 1.0000 },
  { epoch: 5, train: 0.9904, val: 0.9993 },
  { epoch: 6, train: 0.9922, val: 0.9972 },
  { epoch: 7, train: 0.9930, val: 0.9727 },
  { epoch: 8, train: 0.9952, val: 0.9971 },
  { epoch: 9, train: 0.9969, val: 0.9987 },
  { epoch: 10, train: 0.9968, val: 0.9960 },
  { epoch: 15, train: 0.9982, val: 0.9980 },
  { epoch: 20, train: 0.9979, val: 0.9989 },
];

const lossData = [
  { epoch: 1, train: 0.5274, val: 0.0335 },
  { epoch: 2, train: 0.0680, val: 0.0532 },
  { epoch: 3, train: 0.0478, val: 0.0540 },
  { epoch: 4, train: 0.0355, val: 0.0048 },
  { epoch: 5, train: 0.0283, val: 0.0054 },
  { epoch: 10, train: 0.0102, val: 0.0075 },
  { epoch: 20, train: 0.0059, val: 0.0024 },
];

const architecture = [
  { layer: "Conv2D (100 filters)", params: 1000, type: "Feature Extraction" },
  { layer: "BatchNormalization", params: 400, type: "Normalization" },
  { layer: "MaxPool2D", params: 0, type: "Downsampling" },
  { layer: "Conv2D (75 filters)", params: 67575, type: "Feature Extraction" },
  { layer: "Dropout (0.5)", params: 0, type: "Regularization" },
  { layer: "Conv2D (50 filters)", params: 33800, type: "Feature Extraction" },
  { layer: "Dense (480 units)", params: 96480, type: "Classification" },
  { layer: "Dense (24 units)", params: 11544, type: "Output" },
];

const vggAccuracyData = [
  { epoch: 1, train: 1.0000, val: 1.0000 },
  { epoch: 5, train: 1.0000, val: 1.0000 },
  { epoch: 10, train: 1.0000, val: 1.0000 },
  { epoch: 15, train: 1.0000, val: 1.0000 },
  { epoch: 20, train: 1.0000, val: 1.0000 },
];

const vggArchitecture = [
  { layer: "VGG16 Base (Frozen)", params: 14714688, type: "Transfer Learning" },
  { layer: "Flatten", params: 0, type: "Vectorization" },
  { layer: "Dense (4096)", params: 102764544, type: "Fully Connected" },
  { layer: "Dense (4096)", params: 16781312, type: "Fully Connected" },
  { layer: "Dense (6 classes)", params: 24582, type: "Output (Softmax)" },
];

export function ModelInsights() {
  const [modelType, setModelType] = React.useState<'cnn' | 'vgg'>('vgg');
  
  const currentAccuracy = modelType === 'cnn' ? accuracyData : vggAccuracyData;
  const currentArch = modelType === 'cnn' ? architecture : vggArchitecture;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Model Performance</h2>
          <p className="text-slate-500 text-sm">Comparative analysis of our recognition engines</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setModelType('cnn')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${modelType === 'cnn' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
          >
            Custom CNN
          </button>
          <button 
            onClick={() => setModelType('vgg')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${modelType === 'vgg' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
          >
            VGG16 Transfer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Test Accuracy", value: modelType === 'vgg' ? "100.0%" : "99.89%", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Params", value: modelType === 'vgg' ? "138.3M" : "211,299", icon: Cpu, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Classes", value: modelType === 'vgg' ? "6 Signs" : "24 ASL", icon: Grid3X3, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Latency", value: modelType === 'vgg' ? "~45ms" : "~15ms", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Accuracy Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Training vs Validation Accuracy</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentAccuracy}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="epoch" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0.8, 1]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" align="right" height={36} />
                <Line type="monotone" dataKey="train" name="Training" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="val" name="Validation" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Loss Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Training vs Validation Loss</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lossData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="epoch" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" align="right" height={36} />
                <Line type="monotone" dataKey="train" name="Training" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="val" name="Validation" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Architecture Visualization */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">
            {modelType === 'vgg' ? 'VGG16 Transfer Learning' : 'Custom CNN Architecture'}
          </h3>
          <div className="space-y-3">
            {currentArch.map((layer, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-200">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{layer.layer}</p>
                    <p className="text-xs text-slate-500">{layer.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-slate-400">{layer.params.toLocaleString()} params</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confusion Matrix Heatmap (Simplified) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Confusion Matrix Preview</h3>
          <div className="grid grid-cols-8 gap-1">
            {Array.from({ length: 64 }).map((_, i) => {
              const isDiagonal = i % 9 === 0;
              const opacity = isDiagonal ? 0.9 : 0.1 + Math.random() * 0.1;
              return (
                <div 
                  key={i} 
                  className="aspect-square rounded-sm"
                  style={{ backgroundColor: `rgba(16, 185, 129, ${opacity})` }}
                />
              );
            })}
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Precision</span>
              <span className="font-bold text-emerald-600">0.999</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Recall</span>
              <span className="font-bold text-blue-600">0.998</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">F1-Score</span>
              <span className="font-bold text-purple-600">0.999</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
