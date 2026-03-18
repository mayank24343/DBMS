import React, { useEffect, useState } from 'react';
import { getDiseaseTrends } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ShieldAlert, Users, TrendingUp, Map } from 'lucide-react';

const AdminDashboard = () => {
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Tracking Disease ID 12 (COVID-19 based on your earlier seed data)
    const diseaseIdToTrack = 12; 

    useEffect(() => {
        getDiseaseTrends(diseaseIdToTrack)
            .then(data => {
                const formattedData = data.map(item => ({
                    monthName: new Date(2024, item.month - 1, 1).toLocaleString('default', { month: 'short' }),
                    cases: item.avg_daily_cases
                }));
                setTrendData(formattedData);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // Custom Tooltip for the Chart to make it look premium
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-700">
                    <p className="font-bold mb-1">{label}</p>
                    <p className="text-blue-400">
                        <span className="text-gray-300">Avg Daily Cases: </span>
                        {payload[0].value.toFixed(1)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <Activity className="text-blue-600 w-8 h-8" />
                        Epidemiology Command Center
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">National Health System Data Aggregation</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-bold text-sm border border-blue-200 shadow-sm">
                    Live Surveillance Mode
                </div>
            </div>

            {/* KPI Top Row (Structural Placeholders for visual layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                    <div className="bg-emerald-100 p-3 rounded-xl"><Users className="text-emerald-600 w-6 h-6" /></div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total Screened</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-1">1.2M</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                    <div className="bg-red-100 p-3 rounded-xl"><ShieldAlert className="text-red-600 w-6 h-6" /></div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Active Outbreaks</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-1">3 Regions</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                    <div className="bg-purple-100 p-3 rounded-xl"><Map className="text-purple-600 w-6 h-6" /></div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Facilities Online</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-1">142</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                    <div className="bg-amber-100 p-3 rounded-xl"><TrendingUp className="text-amber-600 w-6 h-6" /></div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">System Load</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-1">84%</h3>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        Disease Transmission Trends (ID: {diseaseIdToTrack})
                    </h2>
                    <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 font-medium">
                        <option>Past 12 Months</option>
                        <option>Past 6 Months</option>
                    </select>
                </div>
                
                <div className="h-96 w-full">
                    {loading ? (
                        <div className="flex h-full items-center justify-center text-blue-500 font-bold animate-pulse">
                            Aggregating national data...
                        </div>
                    ) : trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="monthName" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }} dx={-10} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="cases" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorCases)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 font-medium">
                            No aggregate data available for this timeline.
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;