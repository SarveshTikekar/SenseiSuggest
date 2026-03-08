import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Make sure you import all your page components
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import AnimeDetailPage from './pages/AnimeDetail'; // Make sure this component is correctly named and exported
import AdminPage from './pages/AdminPage';
import BrowseAnimePage from './pages/BrowseAnime'
import { AuthProvider } from './context/AuthContext'; // Ensure this is imported
import RecommendationPage from './pages/Recommendations';
import UserProfilePage from './pages/UserProfile';

function App() {
  return (
    <Router>
      <AuthProvider> {/* Ensure AuthProvider wraps the parts that need authentication context */}
        <div className="flex flex-col min-h-screen bg-anime-bg">
          <Navbar />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/all-anime" element={<BrowseAnimePage />} />
            <Route path="/anime/details/:animeName" element={<AnimeDetailPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/get_recommendations/" element={<RecommendationPage />}/>
            <Route path="/profile/:userId" element={<UserProfilePage />}/>
            <Route path="*" element={<p className="text-center text-anime-error text-2xl my-12">404: Page Not Found</p>} />
          </Routes>

          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;