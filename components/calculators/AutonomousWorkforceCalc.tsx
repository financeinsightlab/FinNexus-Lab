'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Brain, Cpu, TrendingUp, DollarSign, Activity, Zap } from 'lucide-react';

export default function AutonomousWorkforceCalc({ slug, isPremiumUser }: { slug: string; isPremiumUser?: boolean }) {
  // Inputs
  const [currentHeadcount, setCurrentHeadcount] = useState(50);
  const [avgLoadedSalary, setAvgLoadedSalary] = useState(95000);
  
  const [replacementRatio, setReplacementRatio] = useState(4); // 1 agent replaces 4 humans
  const [apiCostPerAgent, setApiCostPerAgent] = useState(12000); // Annual inference/compute cost
  const [upfrontCapex, setUpfrontCapex] = useState(250000); // Build/Integration
  const [severanceMonths, setSeveranceMonths] = useState(3); // Severance package

  const [currentMultiple, setCurrentMultiple] = useState(4.5); // Traditional Service Co multiple
  const [projectedMultiple, setProjectedMultiple] = useState(9.0); // Tech/Software multiple

  const [isLocked, setIsLocked] = useState(false);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Paywall / Gating Logic
  useEffect(() => {
    if (isPremiumUser) {
      setIsLocked(false);
      return;
    }
    const key = `used_tool_${slug}`;
    const firstUsed = localStorage.getItem(key);
    if (!firstUsed) {
      localStorage.setItem(key, Date.now().toString());
    } else {
      const msSinceFirstUse = Date.now() - parseInt(firstUsed);
      if (msSinceFirstUse > 30 * 60 * 1000) setIsLocked(true);
    }
  }, [slug, isPremiumUser]);

  // Calculations
  const calculations = useMemo(() => {
    // 1. Legacy Human Baseline Calculate
    const legacyAnnualRunRate = currentHeadcount * avgLoadedSalary;
    
    // 2. Swarm Economics
    const requiredAgents = Math.ceil(currentHeadcount / replacementRatio);
    const swarmAnnualRunRate = requiredAgents * apiCostPerAgent;
    
    // 3. Restructuring Hit
    const severanceCostPerEmployee = (avgLoadedSalary / 12) * severanceMonths;
    const totalSeverance = currentHeadcount * severanceCostPerEmployee;
    const totalRestructuringCapex = upfrontCapex + totalSeverance;

    // 4. Financial Arbitrage
    const annualEbitdaExpansion = legacyAnnualRunRate - swarmAnnualRunRate;
    const grossMarginExpansion = ((legacyAnnualRunRate - swarmAnnualRunRate) / legacyAnnualRunRate) * 100;

    // 5. Valuation Re-rating (Enterprise Value Delta)
    const legacyEvContribution = legacyAnnualRunRate * currentMultiple; // Approximate value assigned to this org output
    const swarmEvContribution = legacyAnnualRunRate * projectedMultiple; // Tech multiplier on same output
    const valueCreation = swarmEvContribution - legacyEvContribution;

    const paybackMonths = (totalRestructuringCapex / (annualEbitdaExpansion / 12));

    // Time-series mapping (60 months / 5 years)
    const chartData = [];
    let cumLegacyCost = 0;
    let cumSwarmCost = totalRestructuringCapex; // Month 0 shock
    
    for (let m = 0; m <= 60; m+=3) { // Quarterly visualization essentially, plotted by month
       if (m === 0) {
         chartData.push({ month: `Mo 0`, legacyCost: 0, swarmCost: totalRestructuringCapex / 1000000 });
       } else {
         cumLegacyCost += (legacyAnnualRunRate / 12) * 3;
         cumSwarmCost += (swarmAnnualRunRate / 12) * 3;
         chartData.push({ 
           month: `Mo ${m}`, 
           legacyCost: cumLegacyCost / 1000000, 
           swarmCost: cumSwarmCost / 1000000 
         });
       }
    }

    return {
      legacyAnnualRunRate,
      swarmAnnualRunRate,
      requiredAgents,
      totalRestructuringCapex,
      annualEbitdaExpansion,
      grossMarginExpansion,
      valueCreation,
      paybackMonths,
      chartData
    };

  }, [currentHeadcount, avgLoadedSalary, replacementRatio, apiCostPerAgent, upfrontCapex, severanceMonths, currentMultiple, projectedMultiple]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tag: `unlocked_${slug}` }),
      });
      if (response.ok) {
        localStorage.setItem(`unlocked_${slug}`, 'true');
        setIsLocked(false);
        setShowEmailGate(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-10 relative text-gray-300 font-sans">
      <div className="wrap max-w-7xl mx-auto">
        
        {/* Futuristic Header */}
        <div className="mb-10 text-center lg:text-left relative">
           <div className="absolute top-0 right-0 lg:-right-20 -z-10 opacity-20 pointer-events-none">
              <Cpu className="w-64 h-64 text-cyan-500 animate-pulse" />
           </div>
          <p className="text-cyan-400 font-mono tracking-widest text-sm mb-3">⬡ NEURAL ENTERPRISE MODEL ⬡</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md">
            Autonomous Swarm Restructuring
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl">
            Simulate the catastrophic margin expansion and valuation re-rating achieved by replacing a human department with an Autonomous Agent Swarm.
          </p>
        </div>

        {/* About Tool Box */}
        <div className="bg-gray-900/80 backdrop-blur-md p-6 rounded-2xl border-l-4 border-l-cyan-500 border-y border-r border-gray-800 shadow-sm mb-10 flex gap-5 max-w-5xl relative z-10">
          <div className="text-3xl pt-1">🔮</div>
          <div>
            <h3 className="font-bold text-white mb-2 text-lg font-mono tracking-tight">What this simulator actually does</h3>
            <p className="text-sm text-gray-400 leading-relaxed font-sans">
              This advanced model simulates a total enterprise restructuring event. Instead of calculating the ROI of a single AI tool, it calculates what happens when an entire department (like Customer Support or SDRs) is fired and replaced by a highly efficient, intercommunicating swarm of autonomous AI agents. By modeling severance costs, API compute, and the resulting margin expansion, it proves how traditional service companies can engineer an aggressive valuation re-rating by transforming into high-margin software-like entities.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 relative z-10">
          
          {/* Inputs Sidebar (Cyberpunk styled) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-900/80 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-[0_0_15px_rgba(34,211,238,0.05)]">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-800">
                <Brain className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-lg">System Parameters</h3>
              </div>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">Legacy Headcount</label>
                    <span className="text-cyan-400 font-mono text-xs">{currentHeadcount} FTEs</span>
                  </div>
                  <input type="range" min="5" max="500" value={currentHeadcount} onChange={e => setCurrentHeadcount(Number(e.target.value))} className="w-full accent-cyan-500 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer" />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Avg Loaded Salary</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 font-mono focus:text-cyan-400 transition-colors">$</span>
                    <input type="number" className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-8 p-2 text-white font-mono text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none" value={avgLoadedSalary} onChange={e => setAvgLoadedSalary(Number(e.target.value))} />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Agent Replacement Ratio</label>
                  <div className="flex items-center gap-4 bg-gray-950 p-2 rounded-lg border border-gray-800">
                     <span className="text-xs text-gray-500 font-mono whitespace-nowrap">1 Agent =</span>
                     <input type="number" step="0.5" className="w-full bg-transparent text-cyan-400 font-bold font-mono text-right outline-none" value={replacementRatio} onChange={e => setReplacementRatio(Number(e.target.value))} />
                     <span className="text-xs text-gray-500 font-mono">Humans</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Agent API Cost / Yr</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 font-mono focus:text-cyan-400 transition-colors">$</span>
                    <input type="number" className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-8 p-2 text-white font-mono text-sm focus:border-cyan-500 outline-none" value={apiCostPerAgent} onChange={e => setApiCostPerAgent(Number(e.target.value))} />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-4">Transition Cost & Capital Re-rating</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Upfront Build Capex ($)</label>
                      <input type="number" className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 px-3 text-white font-mono text-sm outline-none" value={upfrontCapex} onChange={e => setUpfrontCapex(Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Human Severance (Months)</label>
                      <input type="number" className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 px-3 text-white font-mono text-sm outline-none" value={severanceMonths} onChange={e => setSeveranceMonths(Number(e.target.value))} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <div>
                         <label className="block text-[10px] text-gray-500 mb-1">Service Multiple (x)</label>
                         <input type="number" step="0.5" className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 px-3 text-gray-300 font-mono text-sm outline-none" value={currentMultiple} onChange={e => setCurrentMultiple(Number(e.target.value))} />
                       </div>
                       <div>
                         <label className="block text-[10px] text-cyan-500 mb-1">Tech Multiple (x)</label>
                         <input type="number" step="0.5" className="w-full bg-gray-950 border border-cyan-900/50 rounded-lg p-2 px-3 text-cyan-300 font-mono text-sm outline-none focus:border-cyan-500" value={projectedMultiple} onChange={e => setProjectedMultiple(Number(e.target.value))} />
                       </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
            {/* Swarm State Monitor */}
            <div className="bg-gray-950 p-5 rounded-2xl border border-gray-800/50 flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-mono text-gray-500 uppercase">Active Swarm Protocol</p>
                 <p className="text-lg text-white font-mono font-bold">{calculations.requiredAgents} Autonomous Agents</p>
              </div>
              <Activity className="w-8 h-8 text-cyan-500/50" />
            </div>
          </div>

          {/* Results Main Pane */}
          <div className={`lg:col-span-8 space-y-6 ${isLocked ? 'blur-md pointer-events-none select-none opacity-40' : ''} transition-all duration-700`}>
            
            {/* High Impact KPIs */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-6 rounded-2xl border border-cyan-900/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />
                <Zap className="w-6 h-6 text-cyan-400 mb-3" />
                <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Annual EBITDA Expansion</p>
                <h4 className="text-4xl font-extrabold text-white tracking-tight font-mono">
                  +${(calculations.annualEbitdaExpansion / 1000000).toFixed(2)}M
                </h4>
                <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950 border border-cyan-900 rounded font-mono text-xs text-cyan-400">
                  <TrendingUp className="w-3 h-3" />
                  {calculations.grossMarginExpansion.toFixed(1)}% Operating Margin Arbitrage
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-6 rounded-2xl border border-emerald-900/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />
                <DollarSign className="w-6 h-6 text-emerald-400 mb-3" />
                <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Valuation Re-rating Value</p>
                <h4 className="text-4xl font-extrabold text-white tracking-tight font-mono">
                  +${(calculations.valueCreation / 1000000).toFixed(1)}M
                </h4>
                <p className="mt-4 text-xs font-mono text-gray-500">
                  Created via shift from {currentMultiple}x to {projectedMultiple}x multiple.
                </p>
              </div>
            </div>

            {/* Sub-metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                 <p className="text-[10px] text-gray-500 font-mono uppercase mb-1">Restructuring Shock</p>
                 <p className="text-lg text-red-400 font-mono font-bold">${(calculations.totalRestructuringCapex / 1000).toFixed(0)}k</p>
               </div>
               <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                 <p className="text-[10px] text-gray-500 font-mono uppercase mb-1">Capital Payback</p>
                 <p className="text-lg text-white font-mono font-bold">{calculations.paybackMonths.toFixed(1)} Mo</p>
               </div>
               <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                 <p className="text-[10px] text-gray-500 font-mono uppercase mb-1">Human OPEX / Yr</p>
                 <p className="text-lg text-gray-400 font-mono font-bold">${(calculations.legacyAnnualRunRate / 1000000).toFixed(2)}M</p>
               </div>
               <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                 <p className="text-[10px] text-gray-500 font-mono uppercase mb-1">Swarm OPEX / Yr</p>
                 <p className="text-lg text-cyan-400 font-mono font-bold">${(calculations.swarmAnnualRunRate / 1000).toFixed(0)}k</p>
               </div>
            </div>

            {/* Visualizer */}
            <div className="bg-gray-900/80 p-6 rounded-2xl border border-gray-800 shadow-xl relative z-10">
              <h3 className="font-mono text-sm tracking-widest text-gray-400 uppercase mb-6">⬡ 60-Month Trajectory: Legacy vs Swarm Cum. Cost</h3>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={calculations.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLegacy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSwarm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                    <XAxis dataKey="month" stroke="#4b5563" tick={{fontSize: 11, fill: '#6b7280', fontFamily: 'monospace'}} tickMargin={10} minTickGap={30} />
                    <YAxis tickFormatter={(val) => `$${val}M`} stroke="#4b5563" tick={{fontSize: 11, fill: '#6b7280', fontFamily: 'monospace'}} width={60} />
                    <Tooltip 
                      formatter={(value: any, name: any) => {
                        return [`$${Number(value).toFixed(2)}M`, name === 'legacyCost' ? 'Legacy Human System' : 'Autonomous Swarm'];
                      }}
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#f3f4f6', fontFamily: 'monospace', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="legacyCost" stroke="#ef4444" fillOpacity={1} fill="url(#colorLegacy)" strokeWidth={2} />
                    <Area type="monotone" dataKey="swarmCost" stroke="#06b6d4" fillOpacity={1} fill="url(#colorSwarm)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
          </div>

          {/* Paywall Overlay */}
          {isLocked && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pt-20">
              <div className="bg-gray-900 border border-gray-800 p-10 rounded-2xl shadow-2xl max-w-lg text-center relative z-50 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-gray-900 to-gray-900 pointer-events-none"></div>
                <div className="w-16 h-16 bg-cyan-900/30 text-cyan-400 rounded-full flex items-center justify-center mb-6 mx-auto border border-cyan-500/30">
                  <Brain className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight font-mono">Simulation Paused</h3>
                <p className="text-gray-400 mb-8 text-sm">
                  Full programmatic access to the Autonomous Restructuring model requires Level 2 clearance. Subscribe to unlock the deep-tech finance suite.
                </p>
                
                {!showEmailGate ? (
                  <button onClick={() => setShowEmailGate(true)} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(8,145,178,0.3)]">
                    INITIALIZE CLEARANCE
                  </button>
                ) : (
                  <form onSubmit={handleSubscribe} className="w-full space-y-4">
                    <input 
                      type="email" 
                      placeholder="ENTER ENTERPRISE IDENTIFIER..." 
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-4 text-white font-mono text-sm outline-none focus:border-cyan-500 transition-colors placeholder:text-gray-600"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                    <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(8,145,178,0.3)] disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? <Activity className="w-5 h-5 animate-spin" /> : 'AUTHORIZE CONNECTION'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Educational Glossary Section */}
        <div className="mt-16 bg-gray-900/80 p-8 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.02)] border border-gray-800 relative z-10">
          <h2 className="text-2xl font-bold text-white mb-6 font-mono tracking-tight">Terminology & Core Concepts</h2>
          <p className="text-gray-400 mb-8 font-sans">Understanding the aggressive economic theories driving this deep-tech financial model.</p>
          
          <div className="grid md:grid-cols-2 gap-8 font-sans">
            <div className="space-y-3">
              <h4 className="font-bold text-cyan-400 text-base flex items-center gap-2"><span className="text-xl">🧬</span> Agent Replacement Ratio</h4>
              <p className="text-sm text-gray-400 leading-relaxed"><strong>What it is:</strong> A measure of AI autonomy. Unlike "copilots" that make humans faster, autonomous agents work independently. If an agent swarm runs 24/7 without sleep or HR issues, a 1:4 ratio means one computational agent handles the output of four full-time humans.</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-cyan-400 text-base flex items-center gap-2"><span className="text-xl">📉</span> Operating Margin Arbitrage</h4>
              <p className="text-sm text-gray-400 leading-relaxed"><strong>What it is:</strong> The massive, permanent expansion in EBITDA margins created by decoupling revenue growth from headcount growth. Human OPEX scales linearly with revenue; Swarm OPEX (API tokens) scales fractionally, creating sheer arbitrage.</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-cyan-400 text-base flex items-center gap-2"><span className="text-xl">💥</span> Restructuring Shock (Capex)</h4>
              <p className="text-sm text-gray-400 leading-relaxed"><strong>What it is:</strong> The harsh reality of corporate transition. You must swallow a massive one-time financial hit consisting of heavy capital expenditure (to build or license the agent infrastructure) plus the cash required for massive human severance packages.</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-cyan-400 text-base flex items-center gap-2"><span className="text-xl">📈</span> Valuation Re-rating (Multiple Arbitrage)</h4>
              <p className="text-sm text-gray-400 leading-relaxed"><strong>What it is:</strong> The ultimate prize. Private Equity and public markets value low-margin, human-heavy companies at low multiples (e.g., 4x EBITDA). High-margin, highly automated tech companies trade at extremely high multiples (e.g., 9x-15x EBITDA). Successfully deploying a swarm doesn't just cut costs; it forcefully re-rates how Wall Street values your entire company.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
