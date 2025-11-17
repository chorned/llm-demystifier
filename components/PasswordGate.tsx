
import React, { useState } from 'react';
import { CORRECT_PASSWORD_B64 } from '../constants';

interface PasswordGateProps {
  onSuccess: () => void;
}

const PasswordGate: React.FC<PasswordGateProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This is a client-side password check for demonstration purposes only.
    // It is not secure and should not be used in a production environment.
    // The password is Base64 encoded in the code, but this is easily reversible.
    if (password === atob(CORRECT_PASSWORD_B64)) {
      onSuccess();
    } else {
      setError('Invalid password. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-white text-center">Enter Access Code</h2>
        <p className="text-gray-400 mb-6 text-center">This is a demonstration application.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
            autoFocus
          />
          {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordGate;
