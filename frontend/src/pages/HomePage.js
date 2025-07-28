import React, { useState } from 'react';
import DocumentManager from '../components/DocumentManager';
import PDFViewer from '../components/PDFViewer';

const HomePage = () => {
  const [currentFileId, setCurrentFileId] = useState(null);

  const handleViewDocument = (fileId) => {
    setCurrentFileId(fileId);
  };

  const handleCloseViewer = () => {
    setCurrentFileId(null);
  };

  return (
    <div className="home-page">
      {currentFileId ? (
        <PDFViewer 
          fileId={currentFileId} 
          onClose={handleCloseViewer}
        />
      ) : (
        <DocumentManager onViewDocument={handleViewDocument} />
      )}
    </div>
  );
};

export default HomePage;