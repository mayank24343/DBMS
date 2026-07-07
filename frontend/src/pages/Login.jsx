import React, { useState } from 'react';
import { authAPI } from '../services/api';
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
            const data = await authAPI.login(identifier, password, role);

            onLogin(data);

            if (data.role === 'citizen') {
                navigate('/citizen/dashboard');
            } else if (data.role === 'worker') {
                navigate('/facility-dashboard');
            } else if (data.role === 'admin') {
                navigate('/admin');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border">

                <div className="text-center mb-6">
                    <ShieldPlus className="mx-auto text-blue-600" size={40} />
                    <h1 className="text-2xl font-bold mt-2">Integrated National Health Information System</h1>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">

                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full p-3 border rounded-xl"
                    >
                        <option value="citizen">Citizen</option>
                        <option value="worker">Healthcare Worker</option>
                        <option value="admin">Department of Health</option>
                    </select>

                    <input
                        type="text"
                        placeholder={
                            role === 'citizen'
                                ? 'Citizen ID or Aadhar'
                                : role === 'admin'
                                    ? 'Admin ID'
                                    : 'Worker ID'
                        }
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full p-3 border rounded-xl"
                        required
                    />

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
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default Login;