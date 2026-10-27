import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import WatchPage from './pages/WatchPage';
import StudioPage from './pages/StudioPage';
import SettingsPage from './pages/SettingsPage';
import ChannelPage from './pages/ChannelPage';
import HistoryPage from './pages/HistoryPage';
import CommunityPage from './pages/CommunityPage';
import LikedVideosPage from './pages/LikedVideosPage';
import PlaylistsPage from './pages/PlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import SubscriptionsPage from './pages/SubscriptionsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Home Page Route */}
          <Route
            path="/"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />

          {/* Public Watch Video Route */}
          <Route
            path="/watch/:videoId"
            element={
              <Layout hideSidebar={true}>
                <WatchPage />
              </Layout>
            }
          />

          {/* Creator Studio & Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <Layout>
                <StudioPage />
              </Layout>
            }
          />
          <Route
            path="/studio"
            element={
              <Layout>
                <StudioPage />
              </Layout>
            }
          />
          <Route
            path="/my-videos"
            element={
              <Layout>
                <StudioPage />
              </Layout>
            }
          />

          {/* Subscriptions Feed Route */}
          <Route
            path="/subscriptions"
            element={
              <Layout>
                <SubscriptionsPage />
              </Layout>
            }
          />

          {/* Community / Tweets Route */}
          <Route
            path="/community"
            element={
              <Layout>
                <CommunityPage />
              </Layout>
            }
          />

          {/* User Channel Profile Route */}
          <Route
            path="/c/:username"
            element={
              <Layout>
                <ChannelPage />
              </Layout>
            }
          />
          <Route
            path="/channel/:username"
            element={
              <Layout>
                <ChannelPage />
              </Layout>
            }
          />

          {/* Settings & Account Management Route */}
          <Route
            path="/settings"
            element={
              <Layout>
                <SettingsPage />
              </Layout>
            }
          />
          <Route
            path="/profile"
            element={
              <Layout>
                <SettingsPage />
              </Layout>
            }
          />

          {/* Watch History Route */}
          <Route
            path="/history"
            element={
              <Layout>
                <HistoryPage />
              </Layout>
            }
          />

          {/* Liked Videos Route */}
          <Route
            path="/liked"
            element={
              <Layout>
                <LikedVideosPage />
              </Layout>
            }
          />

          {/* User Playlists Route */}
          <Route
            path="/playlists"
            element={
              <Layout>
                <PlaylistsPage />
              </Layout>
            }
          />

          {/* Playlist Detail Route */}
          <Route
            path="/playlist/:playlistId"
            element={
              <Layout>
                <PlaylistDetailPage />
              </Layout>
            }
          />

          {/* Redirect all unmatched routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
