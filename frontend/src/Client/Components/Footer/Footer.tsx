import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white px-4 sm:px-6 md:px-12 py-6 mt-auto w-full font-sans z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
          {/* Footer Left Section */}
          <div>
            <h1 className="text-lg md:text-xl font-extrabold text-blue-400">PG Management System</h1>
            <p className="text-xs text-slate-400 mt-1">Smart accommodation, mess, & staff management platform.</p>
          </div>

          {/* Footer Right Section */}
          <div className="text-xs text-slate-400">
            <p>© {new Date().getFullYear()} PG Management System. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;