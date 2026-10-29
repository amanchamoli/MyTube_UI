import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AuthModal from '../auth/AuthModal';
import UploadVideoModal from '../video/UploadVideoModal';

export default function Layout({ children, hideSidebar = false }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.matchMedia('(max-width: 900px)').matches) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="app-container">
      <Navbar onToggleSidebar={toggleSidebar} />
      <div className="layout-content">
        {!hideSidebar && (
          <>
            {mobileOpen && (
              <button
                className="sidebar-backdrop"
                aria-label="Close navigation sidebar"
                onClick={() => setMobileOpen(false)}
              />
            )}
            <Sidebar
              collapsed={mobileOpen ? false : collapsed}
              mobileOpen={mobileOpen}
              onNavigate={() => setMobileOpen(false)}
            />
          </>
        )}
        <main className="main-viewport">{children}</main>
      </div>
      <AuthModal />
      <UploadVideoModal />
    </div>
  );
}
