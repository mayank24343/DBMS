import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
    const [diseaseId, setDiseaseId] = useState(12);
    const [trendData, setTrendData] = useState([]);
    const [geoData, setGeoData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const trendRes = await fetch(
                    `http://127.0.0.1:8000/api/stats/disease/${diseaseId}/trends/`
                );
                const trendJson = await trendRes.json();

                const geoRes = await fetch(
                    `http://127.0.0.1:8000/api/stats/disease/${diseaseId}/geo/`
                );
                const geoJson = await geoRes.json();

                // 🔥 safe formatting
                const formattedTrend = (trendJson || []).map(item => ({
                    month: item.month,
                    cases: Number(item.avg_daily_cases || 0)
                }));

                setTrendData(formattedTrend);
                setGeoData(geoJson || []);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [diseaseId]);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">

            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">
                    Disease Analytics
                </h1>

                <select
                    value={diseaseId}
                    onChange={(e) => setDiseaseId(Number(e.target.value))}
                    className="border px-3 py-2 rounded"
                >
                    <option value={12}>COVID</option>
                    <option value={6}>Tuberculosis</option>
                    <option value={7}>Malaria</option>
                    <option value={16}>Dengue</option>
                </select>
            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded shadow">
                <h2 className="mb-4 font-semibold">Monthly Trends</h2>

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="cases"
                                    stroke="#2563eb"
                                    fill="#3b82f6"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Geo Table */}
            <div className="bg-white p-6 rounded shadow">
                <h2 className="mb-4 font-semibold">Cases by Region</h2>

                {loading ? (
                    <p>Loading...</p>
                ) : geoData.length === 0 ? (
                    <p>No data</p>
                ) : (
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 border">State</th>
                                <th className="p-2 border">City</th>
                                <th className="p-2 border">Cases</th>
                            </tr>
                        </thead>
                        <tbody>
                            {geoData.map((row, i) => (
                                <tr key={i}>
                                    <td className="p-2 border">{row.state}</td>
                                    <td className="p-2 border">{row.city}</td>
                                    <td className="p-2 border font-bold">
                                        {row.case_count}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

        </div>
    );
};

export default AdminDashboard;