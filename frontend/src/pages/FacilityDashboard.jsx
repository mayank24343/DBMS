import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBedAvailability, getLowStockAlerts, getNearExpiryAlerts } from '../services/api';
import { Building2, Bed, AlertTriangle, Clock, PackageX, PlusCircle } from 'lucide-react';

const FacilityDashboard = () => {
    const { facId } = useParams();
    const [wards, setWards] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [expiring, setExpiring] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all three endpoints simultaneously 
        Promise.all([
            getBedAvailability(facId),
            getLowStockAlerts(facId),
            getNearExpiryAlerts(facId)
        ])
        .then(([wardsData, stockData, expiryData]) => {
            setWards(wardsData);
            setLowStock(stockData);
            setExpiring(expiryData);
            setLoading(false);
        })
        .catch(err => {
            console.error("Error loading facility data:", err);
            setLoading(false);
        });
    }, [facId]);

    const handleOrder = (itemName, shortfall) => {
        alert(`Initiating automated Supplier Order for ${shortfall} units of ${itemName}...`);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64 text-indigo-600 font-bold animate-pulse">Synchronizing Facility Data...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <Building2 className="text-indigo-600 w-8 h-8" />
                        Facility Operations Center
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Managing Facility ID: {facId}</p>
                </div>
                <Link 
                    to={`/worker/${facId}/new-visit`} 
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-colors"
                >
                    <PlusCircle className="w-5 h-5" /> Log Patient Visit
                </Link>
            </div>

            {/* SECTION 1: Bed Management */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Bed className="text-blue-500 w-5 h-5" /> Live Ward Capacity
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="px-6 py-3">Ward Type</th>
                                <th className="px-6 py-3">Capacity</th>
                                <th className="px-6 py-3">Occupied</th>
                                <th className="px-6 py-3">Available Status</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {wards.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">No ward data configured.</td></tr>
                            ) : (
                                wards.map((ward) => (
                                    <tr key={ward.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900">{ward.type}</td>
                                        <td className="px-6 py-4 text-gray-600">{ward.total}</td>
                                        <td className="px-6 py-4 text-gray-600">{ward.occupied}</td>
                                        <td className="px-6 py-4">
                                            {ward.available === 0 ? (
                                                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold text-xs">FULL (0)</span>
                                            ) : ward.available <= 2 ? (
                                                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold text-xs">CRITICAL ({ward.available})</span>
                                            ) : (
                                                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold text-xs">AVAILABLE ({ward.available})</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                disabled={ward.available === 0}
                                                className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors ${ward.available === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'}`}
                                            >
                                                Admit Patient
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SECTION 2: Supply Chain (Split Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Low Stock Alerts */}
                <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
                    <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
                            <PackageX className="text-red-600 w-5 h-5" /> Critical Shortages
                        </h2>
                    </div>
                    <ul className="divide-y divide-gray-100 p-2">
                        {lowStock.length === 0 ? (
                            <li className="p-6 text-center text-gray-500 italic">Inventory levels nominal.</li>
                        ) : (
                            lowStock.map((item) => (
                                <li key={item.id} className="p-4 flex items-center justify-between hover:bg-red-50/50 rounded-xl transition-colors">
                                    <div>
                                        <p className="font-bold text-gray-900">{item.item_name}</p>
                                        <p className="text-xs text-gray-500 mt-1">Type: {item.item_type} | Threshold: {item.threshold}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xl font-black text-red-600">{item.quantity}</p>
                                            <p className="text-xs font-bold text-red-400 uppercase tracking-wider">In Stock</p>
                                        </div>
                                        <button 
                                            onClick={() => handleOrder(item.item_name, item.shortfall)}
                                            className="bg-gray-900 hover:bg-black text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors"
                                        >
                                            Order
                                        </button>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {/* Expiring Soon */}
                <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
                    <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                            <Clock className="text-amber-600 w-5 h-5" /> Expiring &lt; 30 Days
                        </h2>
                    </div>
                    <ul className="divide-y divide-gray-100 p-2">
                        {expiring.length === 0 ? (
                            <li className="p-6 text-center text-gray-500 italic">No items expiring soon.</li>
                        ) : (
                            expiring.map((item) => {
                                const isExpired = new Date(item.expiry) < new Date();
                                return (
                                    <li key={item.id} className="p-4 flex items-center justify-between hover:bg-amber-50/50 rounded-xl transition-colors">
                                        <div>
                                            <p className="font-bold text-gray-900">{item.item_name}</p>
                                            <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${isExpired ? 'text-red-600' : 'text-amber-600'}`}>
                                                {item.expiry}
                                            </p>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                {isExpired ? 'EXPIRED' : 'Expires On'}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default FacilityDashboard;