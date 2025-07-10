import React from 'react';

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-blue-500 text-white">
      <h1 className="text-2xl font-bold">EcoSentinel AI</h1>
      <div className="flex items-center space-x-4">
        <button className="bg-white text-green-500 px-3 py-1 rounded hover:bg-gray-200 transition">
          EN
        </button>
        <button className="bg-white text-green-500 px-3 py-1 rounded hover:bg-gray-200 transition">
          SW
        </button>
        <button className="bg-white text-green-500 p-2 rounded-full hover:bg-gray-200 transition" title="Voice Assistant">
          <i className="fas fa-microphone"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;