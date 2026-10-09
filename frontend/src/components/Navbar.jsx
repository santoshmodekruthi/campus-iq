import React from 'react';

const Navbar = ({ user, onLogout }) => {
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'student':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold tracking-wide text-blue-700">
                CAMPUS IQ
              </h1>
            </div>
            <div className="ml-4 text-sm text-gray-500">
              Student Analytics and Success Platform
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">{user.role === 'student' ? `${user.college} · ${user.registrationNumber}` : user.email}</div>
            </div>
            <span className={`badge ${getRoleBadgeColor(user.role)}`}>
              {user.role === 'admin' ? 'Admin Portal' : 'Student Portal'}
            </span>
            <button
              onClick={onLogout}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;






