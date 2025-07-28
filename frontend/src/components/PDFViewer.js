import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PDFViewer.css';

const PDFViewer = ({ fileId, onClose }) => {
  const [documentInfo, setDocumentInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageImage, setPageImage] = useState(null);
  const [zoom, setZoom] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const API_BASE = 'http://localhost:5001';

  useEffect(() => {
    if (fileId) {
      fetchDocumentInfo();
      renderPage(1);
    }
  }, [fileId]);

  const fetchDocumentInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE}/document/${fileId}/info`);
      setDocumentInfo(response.data);
    } catch (error) {
      console.error('Error fetching document info:', error);
    }
  };

  const renderPage = async (pageNum) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/document/${fileId}/page/${pageNum}/render?zoom=${zoom}`
      );
      setPageImage(response.data.image_data);
      setCurrentPage(pageNum);
    } catch (error) {
      console.error('Error rendering page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await axios.post(`${API_BASE}/document/${fileId}/search`, {
        query: searchQuery
      });
      setSearchResults(response.data.results);
    } catch (error) {
      console.error('Error searching document:', error);
    }
  };

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= documentInfo.page_count) {
      renderPage(pageNum);
    }
  };

  const handleZoomChange = (newZoom) => {
    setZoom(newZoom);
    renderPage(currentPage);
  };

  if (!documentInfo) {
    return <div className="pdf-viewer loading">Loading document...</div>;
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-toolbar">
        <button onClick={onClose} className="close-btn">Close</button>
        
        <div className="toolbar-section">
          <span className="document-title">{documentInfo.filename}</span>
        </div>

        <div className="toolbar-section">
          <button 
            onClick={() => goToPage(currentPage - 1)} 
            disabled={currentPage <= 1}
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {currentPage} of {documentInfo.page_count}
          </span>
          
          <button 
            onClick={() => goToPage(currentPage + 1)} 
            disabled={currentPage >= documentInfo.page_count}
          >
            Next
          </button>
        </div>

        <div className="toolbar-section">
          <label>Zoom:</label>
          <select 
            value={zoom} 
            onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
          >
            <option value={0.5}>50%</option>
            <option value={0.75}>75%</option>
            <option value={1.0}>100%</option>
            <option value={1.25}>125%</option>
            <option value={1.5}>150%</option>
            <option value={2.0}>200%</option>
          </select>
        </div>

        <div className="toolbar-section search-section">
          <input
            type="text"
            placeholder="Search in document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>

      <div className="pdf-content">
        <div className="pdf-page-container">
          {loading ? (
            <div className="loading-spinner">Rendering page...</div>
          ) : pageImage ? (
            <img 
              src={pageImage} 
              alt={`Page ${currentPage}`}
              className="pdf-page-image"
            />
          ) : (
            <div className="no-page">No page to display</div>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="search-results">
            <h3>Search Results ({searchResults.length} matches)</h3>
            <ul>
              {searchResults.map((result, index) => (
                <li key={index}>
                  <button 
                    onClick={() => goToPage(result.page_num)}
                    className="search-result-item"
                  >
                    Page {result.page_num}: "{result.text}"
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;