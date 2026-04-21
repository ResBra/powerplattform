"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SiteLayoutClient from "@/components/SiteLayoutClient";
import AuthGuard from "@/components/AuthGuard";
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Box, 
  ShoppingBag, 
  Euro, 
  Clock, 
  Database,
  ArrowUpRight,
  Zap,
  Globe
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { getAnalyticsDataAction, DashboardStats } from "./actions";

// MOCK HISTORY DATA FOR THE CHART (Since we just started tracking)
const MOCK_REVENUE_HISTORY = [
  { name: "01.04.", revenue: 1200, users: 45 },
  { name: "05.04.", revenue: 2100, users: 80 },
  { name: "10.04.", revenue: 1800, users: 65 },
  { name: "15.04.", revenue: 3400, users: 120 },
  { name: "20.04.", revenue: 2900, users: 110 },
  { name: "Heute", revenue: 4200, users: 155 },
];

const COLORS = ["#2eb64a", "#4ade80", "#166534", "#064e3b"];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getAnalyticsDataAction();
      setStats(data);
      setLoading(false);
    }
    loadData();
    // Refresh every 30 seconds for "Live" feel
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <AuthGuard>
        <SiteLayoutClient activePage="analytics">
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="flex flex-col items-center gap-6">
               <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
               <p className="font-black italic uppercase tracking-[0.3em] text-foreground/40 animate-pulse">Syncing Cloud Node...</p>
            </div>
          </div>
        </SiteLayoutClient>
      </AuthGuard>
    );
  }

  const kpis = [
    { label: "Total Revenue", value: `${stats.market.totalRevenue.toFixed(2)} €`, icon: <Euro />, color: "text-primary", sub: "Market Earnings" },
    { label: "Active Nodes", value: stats.qloud.totalGroups, icon: <Box />, color: "text-blue-400", sub: "Qloud Networks" },
    { label: "Platform Users", value: stats.qloud.totalMembers, icon: <Users />, color: "text-amber-400", sub: "Registered Entities" },
    { label: "System Load", value: "Optimal", icon: <Activity />, color: "text-green-500", sub: "Latency < 24ms" },
  ];

  const pieData = [
    { name: "Market Listings", value: stats.market.listingCount },
    { name: "Shared Media", value: stats.qloud.totalMediaCount },
    { name: "Orders", value: stats.market.orderCount },
  ];

  return (
    <AuthGuard>
      <SiteLayoutClient activePage="analytics">
        <div className="space-y-10 pb-32">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-primary/10 rounded-xl text-primary animate-pulse"><Zap size={24} /></div>
                   <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-foreground">
                      Command <span className="text-primary">Center.</span>
                   </h1>
                </div>
                <p className="text-[10px] md:text-xs font-black uppercase text-foreground/40 italic tracking-[0.4em] ml-1">Universal Platform Intelligence • Live Stream v4.2</p>
             </div>
             
             <div className="flex items-center gap-4 bg-foreground/5 p-4 rounded-2xl border border-white/5">
                <div className="w-3 h-3 bg-primary rounded-full animate-ping"></div>
                <div className="text-right">
                   <p className="text-[8px] font-black uppercase text-foreground/30 italic">Server Location</p>
                   <p className="text-[10px] font-black italic text-foreground uppercase tracking-widest flex items-center gap-2">Berlin / Node-01 <Globe size={10} /></p>
                </div>
             </div>
          </div>

          {/* KPI GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {kpis.map((kpi, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-card border border-white/5 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group hover:border-primary/20 transition-all"
                >
                   <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-125 duration-500">
                      {React.cloneElement(kpi.icon as React.ReactElement, { size: 100 } as any)}
                   </div>
                   <div className={`p-4 bg-foreground/5 rounded-2xl w-fit mb-6 ${kpi.color}`}>
                      {React.cloneElement(kpi.icon as React.ReactElement, { size: 24 } as any)}
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-foreground/30 italic tracking-widest">{kpi.label}</p>
                      <h4 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">{kpi.value}</h4>
                      <p className="text-[8px] font-black uppercase text-primary italic tracking-widest pt-2 flex items-center gap-2">
                         <ArrowUpRight size={10} /> {kpi.sub}
                      </p>
                   </div>
                </motion.div>
             ))}
          </div>

          {/* CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             
             {/* MAIN AREA CHART */}
             <div className="lg:col-span-8 bg-card border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl space-y-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0"></div>
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <h3 className="text-2xl font-black italic uppercase text-foreground">Revenue Projection</h3>
                      <p className="text-[10px] font-black uppercase text-foreground/30 italic tracking-widest">Financial Performance Index</p>
                   </div>
                   <div className="px-6 py-3 bg-primary/10 border border-primary/20 rounded-xl text-primary font-black italic uppercase text-[10px] tracking-widest">
                      Live Updates Active
                   </div>
                </div>

                <div className="h-[400px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_REVENUE_HISTORY}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2eb64a" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#2eb64a" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 900 }} 
                        />
                        <YAxis 
                          hide 
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', fontWeight: 900 }} 
                          itemStyle={{ color: '#2eb64a' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#2eb64a" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>

             {/* PIE CHART / CATEGORIES */}
             <div className="lg:col-span-4 bg-card border border-white/5 rounded-[3rem] p-8 md:p-10 shadow-2xl flex flex-col items-center justify-center space-y-10">
                <div className="text-center space-y-1">
                   <h3 className="text-xl font-black italic uppercase text-foreground text-center">Data Distribution</h3>
                   <p className="text-[10px] font-black uppercase text-foreground/30 italic tracking-widest text-center">Entity Allocation</p>
                </div>
                
                <div className="h-[250px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={10}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', fontWeight: 900 }}
                        />
                      </PieChart>
                   </ResponsiveContainer>
                </div>

                <div className="w-full space-y-4">
                   {pieData.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-foreground/[0.02] border border-white/5 rounded-2xl">
                         <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                            <span className="text-[10px] font-black uppercase italic text-foreground/60">{d.name}</span>
                         </div>
                         <span className="text-xs font-black italic text-foreground">{d.value}</span>
                      </div>
                   ))}
                </div>
             </div>

          </div>

          {/* RECENT ACTIVITY & SYSTEM LOGS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             
             {/* ACTIVITY FEED */}
             <div className="lg:col-span-12 bg-card border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl space-y-8">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Clock size={20} /></div>
                      <h3 className="text-2xl font-black italic uppercase text-foreground">Recent Activity</h3>
                   </div>
                   <button className="text-[10px] font-black uppercase text-primary italic tracking-widest hover:underline transition-all">Export Log Data</button>
                </div>

                <div className="grid gap-4">
                   {stats.recentActivity.map((item, i) => (
                      <div key={i} className="p-6 bg-foreground/[0.03] border border-white/5 rounded-[2rem] flex items-center justify-between group hover:bg-foreground/[0.05] transition-all">
                         <div className="flex items-center gap-6">
                            <div className={`p-4 rounded-2xl ${item.type === 'ORDER' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                               {item.type === 'ORDER' ? <ShoppingBag size={20} /> : <Database size={20} />}
                            </div>
                            <div>
                               <p className="text-lg font-black italic uppercase text-foreground">{item.title}</p>
                               <p className="text-[8px] font-black uppercase text-foreground/30 italic tracking-widest mt-1">Processed by {item.userName} • {new Date(item.time).toLocaleTimeString()}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            {item.amount && <p className="text-xl font-black italic text-primary">{item.amount.toFixed(2)} €</p>}
                            <p className="text-[8px] font-black uppercase text-foreground/20 italic tracking-tighter">Status: Authorized</p>
                         </div>
                      </div>
                   ))}
                   {stats.recentActivity.length === 0 && (
                      <div className="py-20 text-center space-y-4">
                         <Activity size={48} className="mx-auto text-foreground/10 animate-pulse" />
                         <p className="text-[10px] font-black uppercase text-foreground/20 italic tracking-widest">No recent data sequences captured.</p>
                      </div>
                   )}
                </div>
             </div>

          </div>

        </div>
      </SiteLayoutClient>
    </AuthGuard>
  );
}
