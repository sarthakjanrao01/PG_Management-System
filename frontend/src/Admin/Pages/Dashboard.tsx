import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div className="flex-1 px-6 overflow-y-auto">
      {/* Overview Header */}
      <h2 className="text-2xl font-semibold mb-6">Overview</h2>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-bold mb-2">Users</h3>
          <p className="text-gray-600">Total users: 1200</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-bold mb-2">Revenue</h3>
          <p className="text-gray-600">Total Revenue: $5000</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-bold mb-2">Tickets Scanned</h3>
          <p className="text-gray-600">Scanned: 900</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;