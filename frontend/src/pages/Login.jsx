import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldPlus } from 'lucide-react';

const Login = ({ onLogin }) => {
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
            const res = await fetch("http://127.0.0.1:8000/api/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    identifier,
                    password,
                    role
                })
            });
            console.log(JSON.stringify({
                identifier,
                password,
                role
            }));
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            // 🔥 STORE BASED ON ROLE
            if (data.role === "citizen") {
                localStorage.setItem("citizen_id", data.citizen_id);
                navigate("/dashboard");
            }

            else if (data.role === "worker") {
                localStorage.setItem("worker_id", data.worker_id);
                navigate(`/facility/${data.worker_id}`);
            }

            else if (data.role === "supplier") {
                localStorage.setItem("supplier_id", data.supplier_id);
                navigate(`/supplier/dashboard`);
            }

            else if (data.role === "admin") {
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
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">

                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-600 p-3 rounded-full mb-3">
                        <ShieldPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900">
                        National Health System
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        Secure Portal Access
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            Access Role
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full p-3 border rounded-xl bg-gray-50"
                        >
                            <option value="citizen">Citizen</option>
                            <option value="worker">Healthcare Worker</option>
                            <option value="admin">Dept Admin</option>
                        </select>
                    </div>

                    {/* Identifier */}
                    {role !== 'admin' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                {role === 'citizen'
                                    ? 'Citizen ID or Aadhar'
                                    : 'Worker / Facility ID'}
                            </label>
                            <input
                                type="text"
                                required
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder={
                                    role === 'citizen'
                                        ? 'Enter Citizen ID OR Aadhar'
                                        : 'Enter ID'
                                }
                                className="w-full p-3 border rounded-xl"
                            />
                        </div>
                    )}

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border rounded-xl"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-xl font-bold text-white ${loading
                                ? "bg-blue-400"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {loading ? "Logging in..." : "Secure Login"}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default Login;