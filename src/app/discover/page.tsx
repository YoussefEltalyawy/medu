import React from 'react';

const DiscoverPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Discover</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Content Card Component */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Content Card</h2>
          <p className="text-gray-600">Design for various content types (podcasts, videos, songs, etc.).</p>
        </div>

        {/* Static Feed */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Static Feed</h2>
          <p className="text-gray-600">Display of curated content.</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filters</h2>
          <p className="text-gray-600">Implement filters for type and difficulty level.</p>
        </div>

        {/* Today's Picks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Picks</h2>
          <p className="text-gray-600">Section for daily recommended content.</p>
        </div>

        {/* Trending Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Trending</h2>
          <p className="text-gray-600">Section for trending content.</p>
        </div>

        {/* Save Content Button */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Save Content</h2>
          <p className="text-gray-600">Button to save content for later.</p>
        </div>

        {/* Add-to-vocab functionality */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add to Vocabulary</h2>
          <p className="text-gray-600">Functionality to add words from content to vocabulary.</p>
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;