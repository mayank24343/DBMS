import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const diseasesList = [
    { id: 1, name: "Common Cold" },
    { id: 2, name: "Influenza" },
    { id: 3, name: "Asthma" },
    { id: 4, name: "Hypertension" },
    { id: 5, name: "Type 2 Diabetes" },
    { id: 6, name: "Tuberculosis" },
    { id: 7, name: "Malaria" },
    { id: 8, name: "Pneumonia" },
    { id: 9, name: "Appendicitis" },
    { id: 10, name: "Migraine" },
    { id: 11, name: "Anemia" },
    { id: 12, name: "COVID-19" },
    { id: 13, name: "Chronic Kidney Disease" },
    { id: 14, name: "Coronary Artery Disease" },
    { id: 15, name: "Gastroenteritis" },
    { id: 16, name: "Dengue Fever" },
    { id: 17, name: "Meningitis" },
    { id: 18, name: "Osteoarthritis" },
    { id: 19, name: "Peptic Ulcer Disease" },
    { id: 20, name: "Cancer" },
];

const AdminDashboard = () => {
    // --- Global Disease States ---
    const [diseaseId, setDiseaseId] = useState(12);
    const [trendData, setTrendData] = useState([]);
    const [geoData, setGeoData] = useState([]);
    const [loadingDisease, setLoadingDisease] = useState(false);

    // --- Daily Snapshot States ---
    // Default to today's date in YYYY-MM-DD format
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dailyCases, setDailyCases] = useState(null);
    const [loadingDaily, setLoadingDaily] = useState(false);

    // 1. Fetch Monthly & Geo Data
    useEffect(() => {
        const fetchDiseaseData = async () => {
            try {
                setLoadingDisease(true);

                const trendRes = await fetch(`http://127.0.0.1:8000/api/stats/disease/${diseaseId}/monthly/`);
                const trendJson = await trendRes.json();

                const geoRes = await fetch(`http://127.0.0.1:8000/api/stats/disease/${diseaseId}/geo/`);
                const geoJson = await geoRes.json();

                const formattedTrend = (trendJson || []).map(item => ({
                    month: item.month,
                    cases: Number(item.avg_daily_cases || 0)
                }));

                setTrendData(formattedTrend);
                setGeoData(geoJson || []);
            } catch (err) {
                console.error("Error fetching disease data:", err);
            } finally {
                setLoadingDisease(false);
            }
        };

        fetchDiseaseData();
    }, [diseaseId]);

    // 2. Fetch Daily Snapshot Data
    useEffect(() => {
        const fetchDailyData = async () => {
            if (!selectedDate) return;
            try {
                setLoadingDaily(true);
                const res = await fetch(`http://127.0.0.1:8000/api/stats/disease/${diseaseId}/day/?date=${selectedDate}`);
                const json = await res.json();
                
                setDailyCases(json.cases || 0);
            } catch (err) {
                console.error("Error fetching daily data:", err);
                setDailyCases(0);
            } finally {
                setLoadingDaily(false);
            }
        };

        fetchDailyData();
    }, [diseaseId, selectedDate]);

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-8 bg-gray-50 min-h-screen font-sans">

            {/* --- HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-4 sm:mb-0">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        National Disease Analytics
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Monitor disease spread and case trends across regions.
                    </p>
                </div>
                
                <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-gray-600">Select Disease:</label>
                    <select
                        value={diseaseId}
                        onChange={(e) => setDiseaseId(Number(e.target.value))}
                        className="border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg bg-gray-50 hover:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none w-64"
                    >
                        {diseasesList.map((disease) => (
                            <option key={disease.id} value={disease.id}>
                                {disease.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- DAILY SNAPSHOT CARD --- */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Daily Snapshot</h2>
                    <p className="text-sm text-gray-500">View exact case counts for a specific date</p>
                </div>

                <div className="mt-4 sm:mt-0 flex items-center space-x-6">
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-300 text-gray-700 py-2 px-3 rounded-lg bg-gray-50 hover:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm outline-none"
                    />
                    
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cases Recorded</span>
                        {loadingDaily ? (
                            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                        ) : (
                            <span className="text-3xl font-extrabold text-blue-600 leading-none mt-1">
                                {dailyCases !== null ? dailyCases.toLocaleString() : '-'}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT GRID --- */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                
                {/* Trend Chart */}
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col h-[500px]">
                    <div className="mb-6 flex-shrink-0">
                        <h2 className="text-xl font-bold text-gray-800">Monthly Case Trends</h2>
                        <p className="text-sm text-gray-500">Average daily cases recorded per month</p>
                    </div>
                    
                    {loadingDisease ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-pulse flex space-x-2">
                                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="month" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#6b7280', fontSize: 14 }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#6b7280', fontSize: 14 }} 
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="cases" 
                                        stroke="#2563eb" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorCases)" 
                                        activeDot={{ r: 6, fill: '#1e40af', stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Geo Table */}
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col h-[500px]">
                    <div className="mb-6 flex-shrink-0">
                        <h2 className="text-xl font-bold text-gray-800">Cases by Region</h2>
                        <p className="text-sm text-gray-500">Total accumulated cases mapped by state and city</p>
                    </div>

                    {loadingDisease ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-pulse flex space-x-2">
                                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                            </div>
                        </div>
                    ) : geoData.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400 italic">
                            No regional data available for this disease.
                        </div>
                    ) : (
                        <div className="overflow-y-auto flex-1 rounded-lg border border-gray-200 custom-scrollbar">
                            <table className="w-full text-left relative border-collapse">
                                <thead className="sticky top-0 bg-blue-50 z-10 shadow-sm">
                                    <tr>
                                        <th className="p-4 border-b-2 border-blue-100 font-semibold text-blue-900 uppercase text-xs tracking-wider">State</th>
                                        <th className="p-4 border-b-2 border-blue-100 font-semibold text-blue-900 uppercase text-xs tracking-wider">City</th>
                                        <th className="p-4 border-b-2 border-blue-100 font-semibold text-blue-900 uppercase text-xs tracking-wider text-right">Total Cases</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {geoData.map((row, i) => (
                                        <tr key={i} className="hover:bg-blue-50/50 transition-colors group bg-white">
                                            <td className="p-4 text-gray-700 group-hover:text-gray-900 transition-colors">{row.state}</td>
                                            <td className="p-4 text-gray-700 group-hover:text-gray-900 transition-colors">{row.city}</td>
                                            <td className="p-4 font-bold text-blue-600 text-right text-lg">
                                                {row.cases.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;