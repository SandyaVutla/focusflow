import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {

  return (
    <div className="app-container">
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column">
        <main className="flex-grow-1 p-4">
          <div className="container-fluid">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;