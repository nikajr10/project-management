import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { useNavigate } from 'react-router-dom';
import { Layout, ArrowRight, Lock, User } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await client.post('/auth/login', { username, password });
      login(res.data.token);
      navigate('/');
    } catch { 
      alert('Invalid credentials. Please try again.'); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-10">
        
        {/* Top Header - Pure White Theme with Black Text */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-6 shadow-inner border border-blue-100">
            <Layout className="text-blue-600 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">SmartBiz</h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">Sign in to your workspace</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Username Input */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <input 
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-gray-900 font-medium shadow-sm hover:border-gray-300" 
                placeholder="Enter your username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <input 
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-gray-900 font-medium shadow-sm hover:border-gray-300" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Submit Button */}
          <button className="w-full bg-blue-600 text-white mt-4 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex justify-center items-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]">
            Sign In <ArrowRight size={18}/>
          </button>
          
        </form>
      </div>
    </div>
  );
}