import React from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { Cpu, Activity, Grid3X3, Zap } from 'lucide-react';

const aslData = {
  accuracy: [
    { epoch: 1, train: 0.8658, val: 0.9893 },
    { epoch: 2, train: 0.9777, val: 0.9838 },
    { epoch: 3, train: 0.9844, val: 0.9774 },
    { epoch: 4, train: 0.9887, val: 1.0000 },
    { epoch: 5, train: 0.9904, val: 0.9993 },
    { epoch: 10, train: 0.9968, val: 0.9960 },
    { epoch: 20, train: 0.9979, val: 0.9989 },
  ],
  loss: [
    { epoch: 1, train: 0.5274, val: 0.0335 },
    { epoch: 2, train: 0.0680, val: 0.0532 },
    { epoch: 3, train: 0.0478, val: 0.0540 },
    { epoch: 4, train: 0.0355, val: 0.0048 },
    { epoch: 20, train: 0.0059, val: 0.0024 },
  ],
  architecture: [
    { layer: "Conv2D (100 filters)", params: 1000, type: "Feature Extraction" },
    { layer: "BatchNormalization", params: 400, type: "Normalization" },
    { layer: "MaxPool2D", params: 0, type: "Downsampling" },
    { layer: "Conv2D (75 filters)", params: 67575, type: "Feature Extraction" },
    { layer: "Dropout (0.5)", params: 0, type: "Regularization" },
    { layer: "Conv2D (50 filters)", params: 33800, type: "Feature Extraction" },
    { layer: "Dense (480 units)", params: 96480, type: "Classification" },
    { layer: "Dense (24 units)", params: 11544, type: "Output" },
  ],
  stats: {
    accuracy: "99.89%",
    params: "211,299",
    classes: "24 ASL",
    latency: "~15ms"
  }
};

const islData = {
  accuracy: [
    { epoch: 1, train: 0.4481, val: 0.8656 },
    { epoch: 2, train: 0.9177, val: 0.9483 },
    { epoch: 5, train: 0.9717, val: 0.9896 },
    { epoch: 10, train: 0.9840, val: 0.9831 },
    { epoch: 20, train: 0.9901, val: 0.9675 },
    { epoch: 26, train: 0.9909, val: 0.9961 },
    { epoch: 50, train: 0.9995, val: 1.0000 },
  ],
  loss: [
    { epoch: 1, train: 1.9940, val: 0.8351 },
    { epoch: 2, train: 0.2570, val: 0.3511 },
    { epoch: 5, train: 0.0960, val: 0.0677 },
    { epoch: 10, train: 0.0539, val: 0.0780 },
    { epoch: 26, train: 0.0352, val: 0.0141 },
    { epoch: 50, train: 0.0040, val: 0.0020 },
  ],
  architecture: [
    { layer: "Conv2D (24 filters)", params: 240, type: "Input" },
    { layer: "BatchNormalization", params: 96, type: "Normalization" },
    { layer: "Conv2D (64 filters)", params: 13888, type: "Feature Extraction" },
    { layer: "Conv2D (128 filters)", params: 147584, type: "Feature Extraction" },
    { layer: "Conv2D (256 filters)", params: 295168, type: "Feature Extraction" },
    { layer: "Dense (2352 units)", params: 552720, type: "Classification" },
    { layer: "Dense (35 units)", params: 82355, type: "Output" },
  ],
  stats: {
    accuracy: "99.95%",
    params: "1,092,051",
    classes: "35 ISL",
    latency: "~22ms"
  }
};

export function ModelInsights({ language = 'ASL' }: { language?: 'ASL' | 'ISL' }) {
  const data = language === 'ASL' ? aslData : islData;

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Test Accuracy", value: data.stats.accuracy, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Params", value: data.stats.params, icon: Cpu, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Classes", value: data.stats.classes, icon: Grid3X3, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Latency", value: data.stats.latency, icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
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
              <LineChart data={data.accuracy}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="epoch" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0.4, 1]} />
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
              <LineChart data={data.loss}>
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
          <h3 className="text-lg font-bold text-slate-900 mb-6">CNN Architecture Summary</h3>
          <div className="space-y-3">
            {data.architecture.map((layer, i) => (
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
