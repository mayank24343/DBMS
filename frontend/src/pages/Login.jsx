import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ShieldPlus } from 'lucide-react';

const Login = ({onLogin}) => {
    const navigate = useNavigate();

    const [role, setRole] = useState('citizen');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post("api/login/", {
                identifier,
                password,
                role
            });
            console.log({
                    identifier,
                    password,
                    role
                });

            // 🔥 FIX: HANDLE HTML ERROR RESPONSE
            const data = res.data;

            if (!res.status || res.status >= 400) throw new Error(data?.error || "Login failed");

            // ================= ROUTING =================

            if (data.role === "citizen") {
                localStorage.setItem("citizen_id", data.citizen_id);
                            
                onLogin({
                    role: "citizen",
                    id: data.citizen_id
                });
            
                navigate('/citizen/dashboard');
            }

            else if (data.role === "worker") {
                console.log('Worker login successful:', data);
                localStorage.setItem("worker_id", data.worker_id);
                localStorage.setItem("facility_id", data.facility_id);
                onLogin({
                    role: "worker",
                    id: data.worker_id,
                    fac_id: data.facility_id
                });

                // 🔥 IMPORTANT: worker → facility
                navigate(`/facility-dashboard`);
            }

            else if (data.role === "supplier") {
                localStorage.setItem("supplier_id", data.supplier_id);
                onLogin({
                    role: "supplier",
                    id: data.supplier_id
                });
                navigate(`/supplier/${data.supplier_id}`);
            }

            else if (data.role === "warehouse") {
                localStorage.setItem("warehouse_id", data.id);
                onLogin({
                    role:"warehouse",
                    id: data.id,
                });
                navigate(`/warehouse-dashboard/`)
                
            }

            else if (data.role === "admin") {
                onLogin({
                    role: "admin",
                });
                navigate("/admin");
            }

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border">

                <div className="text-center mb-6">
                    <ShieldPlus className="mx-auto text-blue-600" size={40} />
                    <h1 className="text-2xl font-bold mt-2">National Health System</h1>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">

                    {/* ROLE */}
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full p-3 border rounded-xl"
                    >
                        <option value="citizen">Citizen</option>
                        <option value="worker">Healthcare Worker</option>
                        <option value="warehouse">Warehouse</option>
                        <option value="admin">Department of Health</option>
                    </select>

                    {/* IDENTIFIER */}
                    {role !== "admin"  && (
                        <input
                            type="text"
                            placeholder={
                                role === "citizen"
                                    ? "Citizen ID or Aadhar"
                                    : "Enter ID"
                            }
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full p-3 border rounded-xl"
                            required
                        />
                    )}

                    {/* PASSWORD */}
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border rounded-xl"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default Login;