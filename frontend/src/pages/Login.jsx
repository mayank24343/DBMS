import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldPlus } from 'lucide-react';

const Login = ({ onLogin }) => {
    const navigate = useNavigate();
    const [role, setRole] = useState('citizen');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState(''); // Just for UI right now

    const handleLogin = (e) => {
        e.preventDefault();
        
        // In a real app, this sends a POST to Django to verify the password.
        // For now, we simulate a successful login and route based on the role.
        const userData = { role, id: identifier };
        onLogin(userData);

        if (role === 'citizen') {
            navigate(`/citizen/${identifier}`);
        } else if (role === 'worker') {
            navigate(`/facility/${identifier}`);
        } else if (role === 'admin') {
            navigate('/admin');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-600 p-3 rounded-full mb-3">
                        <ShieldPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900">National Health System</h1>
                    <p className="text-gray-500 font-medium mt-1">Secure Portal Access</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Access Role</label>
                        <select 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                            <option value="citizen">Citizen</option>
                            <option value="worker">Healthcare Worker</option>
                            <option value="admin">Dept of Health Admin</option>
                        </select>
                    </div>

                    {role !== 'admin' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                {role === 'citizen' ? 'Aadhar Number' : 'Facility ID'}
                            </label>
                            <input 
                                type="text" 
                                required 
                                value={identifier} 
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder={role === 'citizen' ? 'e.g., 123456789012' : 'e.g., 1 or 2'}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter any password for now"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all mt-4"
                    >
                        Secure Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;