import React from 'react';

const StatusCard = ({ title, value, status, icon, color }) => {
  const statusClass = status === 'Good' ? 'bg-green-100 text-green-800' : 
                      status === 'Moderate' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800';

  return (
    <div className={`bg-white shadow-lg rounded-lg p-4 flex flex-col items-start`}>
      <div className={`flex items-center mb-2 ${statusClass} p-2 rounded`}>
        <div className={`w-8 h-8 flex items-center justify-center rounded-full ${color}`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold ml-2">{title}</h3>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className={`mt-2 px-2 py-1 rounded ${statusClass}`}>
        {status}
      </div>
    </div>
  );
};

export default StatusCard;