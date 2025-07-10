import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <nav className="sidebar bg-white shadow-lg h-full w-64 p-4">
      <h2 className="text-xl font-bold text-green-600 mb-4">EcoSentinel AI</h2>
      <ul className="space-y-2">
        <li>
          <Link to="/" className="block p-2 text-gray-700 hover:bg-green-100 rounded">
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/air-quality" className="block p-2 text-gray-700 hover:bg-green-100 rounded">
            Air Quality
          </Link>
        </li>
        <li>
          <Link to="/flood-risk" className="block p-2 text-gray-700 hover:bg-green-100 rounded">
            Flood Risk
          </Link>
        </li>
        <li>
          <Link to="/heatwave" className="block p-2 text-gray-700 hover:bg-green-100 rounded">
            Heatwave
          </Link>
        </li>
        <li>
          <Link to="/biodiversity" className="block p-2 text-gray-700 hover:bg-green-100 rounded">
            Biodiversity
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;