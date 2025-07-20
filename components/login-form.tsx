'use client';

import { useState } from 'react';

interface FormData {
  name?: string;
  email: string;
  password: string;
}

export default function LoginForm() {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/signin';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage(data.message || (isSignup ? 'Signup successful' : 'Login successful'));

      if (!isSignup && data.user) {
        console.log('Logged in user:', data.user); // You can use this for auth state
      }

    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-xl shadow-md bg-white">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isSignup ? 'Sign Up' : 'Sign In'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignup && (
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Sign In'}
        </button>
      </form>
      <p className="text-center text-sm mt-4">
        {isSignup ? 'Already have an account?' : "Don't have an account?"}
        <button
          type="button"
          onClick={() => {
            setIsSignup(!isSignup);
            setMessage('');
          }}
          className="text-blue-600 ml-1 underline"
        >
          {isSignup ? 'Sign In' : 'Sign Up'}
        </button>
      </p>

      {message && (
        <p className="mt-4 text-center text-sm text-red-600">{message}</p>
      )}
    </div>
  );
}
