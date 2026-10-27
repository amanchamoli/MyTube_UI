import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AuthModal from '../auth/AuthModal';
import UploadVideoModal from '../video/UploadVideoModal';

export default function Layout({ children, hideSidebar = false }) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <div className="app-container">
      <Navbar onToggleSidebar={toggleSidebar} />
      <div className="layout-content">
        {!hideSidebar && <Sidebar collapsed={collapsed} />}
        <main className="main-viewport">{children}</main>
      </div>
      <AuthModal />
      <UploadVideoModal />
    </div>
  );
}
