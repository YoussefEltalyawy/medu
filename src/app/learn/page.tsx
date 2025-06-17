import React from 'react';

const LearnPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Learn</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Flashcards Tab */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Flashcards</h2>
          <p className="text-gray-600">SRS review UI with flip, reveal, mark known/unknown.</p>
        </div>

        {/* Vocabulary Tab */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Vocabulary</h2>
          <p className="text-gray-600">Word list grouped by status (Learning / Practicing / Mastered).</p>
        </div>

        {/* Progress Tab */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Progress</h2>
          <p className="text-gray-600">Goal creation and editing, progress bar for goals, reflection journal.</p>
        </div>
      </div>
    </div>
  );
};

export default LearnPage;