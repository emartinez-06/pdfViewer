import React from 'react';

const HomePage = () => {
  return (
    <div className="home-page">
      <header className="app-header">
        <h1>PDF Viewer</h1>
        <p>Upload and view PDF documents</p>
      </header>
      <main>
        <div className="upload-section">
          <p>Select a PDF file to get started</p>
        </div>
      </main>
    </div>
  );
};

export default HomePage;