import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PlatformFilter = ({ selectedPlatform, onPlatformChange }) => {
  const platforms = [
    { key: 'all', label: 'All Platforms', color: 'bg-purple-500' },
    { key: 'youtube', label: 'YouTube', color: 'bg-red-500' },
    { key: 'tiktok', label: 'TikTok', color: 'bg-black' },
    { key: 'twitter', label: 'Twitter', color: 'bg-blue-500' },
    { key: 'instagram', label: 'Instagram', color: 'bg-pink-500' }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      {platforms.map(platform => (
        <button
          key={platform.key}
          onClick={() => onPlatformChange(platform.key)}
          className={`px-4 py-2 rounded-full text-white font-medium transition-all duration-200 ${
            selectedPlatform === platform.key 
              ? `${platform.color} scale-105 shadow-lg` 
              : 'bg-gray-400 hover:bg-gray-500'
          }`}
        >
          {platform.label}
        </button>
      ))}
    </div>
  );
};

const VideoCard = ({ video }) => {
  const getPlatformIcon = (platform) => {
    const icons = {
      youtube: '📺',
      tiktok: '🎵',
      twitter: '🐦',
      instagram: '📷'
    };
    return icons[platform] || '🎬';
  };

  const getPlatformColor = (platform) => {
    const colors = {
      youtube: 'border-red-500',
      tiktok: 'border-black',
      twitter: 'border-blue-500',
      instagram: 'border-pink-500'
    };
    return colors[platform] || 'border-gray-500';
  };

  const formatViews = (views) => {
    if (!views) return 'N/A';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border-t-4 ${getPlatformColor(video.platform)}`}>
      <div className="relative">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/400x225/6B7280/FFFFFF?text=${video.platform.toUpperCase()}`;
          }}
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
          {getPlatformIcon(video.platform)} {video.platform.toUpperCase()}
        </div>
        {video.viral_score && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-sm font-bold">
            🔥 {video.viral_score.toFixed(0)}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
          {video.title}
        </h3>
        
        {video.author && (
          <p className="text-gray-600 text-sm mb-2">
            👤 {video.author}
          </p>
        )}
        
        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
          {video.views && (
            <span className="flex items-center">
              👀 {formatViews(video.views)} views
            </span>
          )}
          {video.likes && (
            <span className="flex items-center">
              ❤️ {formatViews(video.likes)}
            </span>
          )}
        </div>
        
        <a 
          href={video.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium"
        >
          Watch Now 🚀
        </a>
      </div>
    </div>
  );
};

const SubscriptionModal = ({ isOpen, onClose, onSubscribe }) => {
  const [email, setEmail] = useState('');
  const [telegram, setTelegram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [methods, setMethods] = useState([]);

  const handleMethodToggle = (method) => {
    setMethods(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (methods.length === 0) {
      alert('Please select at least one delivery method');
      return;
    }
    
    const subscriptionData = {
      delivery_methods: methods
    };
    
    if (methods.includes('email') && email) subscriptionData.email = email;
    if (methods.includes('telegram') && telegram) subscriptionData.telegram_id = telegram;
    if (methods.includes('whatsapp') && whatsapp) subscriptionData.whatsapp_number = whatsapp;
    
    onSubscribe(subscriptionData);
    setEmail('');
    setTelegram('');
    setWhatsapp('');
    setMethods([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Get Daily Viral Videos 📱</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Choose delivery methods:</label>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={methods.includes('email')}
                  onChange={() => handleMethodToggle('email')}
                  className="mr-2"
                />
                📧 Email
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={methods.includes('telegram')}
                  onChange={() => handleMethodToggle('telegram')}
                  className="mr-2"
                />
                📱 Telegram
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={methods.includes('whatsapp')}
                  onChange={() => handleMethodToggle('whatsapp')}
                  className="mr-2"
                />
                💬 WhatsApp
              </label>
            </div>
          </div>
          
          {methods.includes('email') && (
            <div className="mb-4">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          )}
          
          {methods.includes('telegram') && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Your Telegram username (e.g., @username)"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          )}
          
          {methods.includes('whatsapp') && (
            <div className="mb-4">
              <input
                type="tel"
                placeholder="Your WhatsApp number (+1234567890)"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600"
            >
              Subscribe 🔔
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchVideos = async (platform = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = platform && platform !== 'all' 
        ? `${API}/videos?platform=${platform}&limit=20`
        : `${API}/videos?limit=40`;
      
      const response = await axios.get(url);
      setVideos(response.data.videos || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load viral videos. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (subscriptionData) => {
    try {
      await axios.post(`${API}/subscribe`, subscriptionData);
      alert('Successfully subscribed to daily viral videos! 🎉');
      setShowSubscriptionModal(false);
    } catch (err) {
      console.error('Error subscribing:', err);
      alert('Failed to subscribe. Please try again.');
    }
  };

  useEffect(() => {
    fetchVideos(selectedPlatform);
  }, [selectedPlatform]);

  // Auto-refresh every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchVideos(selectedPlatform);
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedPlatform]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🔥 Viral Daily
              </h1>
              <p className="text-gray-600 mt-2">
                Discover the most viral videos from across the web, updated daily!
              </p>
              {lastUpdated && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {lastUpdated}
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => fetchVideos(selectedPlatform)}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? '🔄 Loading...' : '🔄 Refresh'}
              </button>
              
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                🔔 Subscribe
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Platform Filter */}
        <PlatformFilter 
          selectedPlatform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
        />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-600">Loading viral videos...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => fetchVideos(selectedPlatform)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Videos Grid */}
        {!loading && !error && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedPlatform === 'all' 
                  ? `🌟 Top ${videos.length} Viral Videos Today` 
                  : `📱 Top ${videos.length} ${selectedPlatform.toUpperCase()} Videos`
                }
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video, index) => (
                <VideoCard key={video.id || index} video={video} />
              ))}
            </div>

            {videos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No viral videos found for the selected platform.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={handleSubscribe}
      />

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">🔥 Viral Daily - Your daily dose of viral content</p>
          <p className="text-sm text-gray-400">
            Aggregating the best viral videos from YouTube, TikTok, Twitter, and Instagram
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;