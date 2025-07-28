import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DocumentManager.css';

const DocumentManager = ({ onViewDocument }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [merging, setMerging] = useState(false);

  const API_BASE = 'http://localhost:5001';

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_BASE}/documents`);
      setDocuments(response.data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post(`${API_BASE}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log('Uploaded:', response.data);
      } catch (error) {
        console.error('Error uploading file:', error);
        alert(`Error uploading ${file.name}: ${error.response?.data?.error || error.message}`);
      }
    }
    
    setUploading(false);
    event.target.value = '';
    await fetchDocuments();
  };

  const handleDeleteDocument = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/document/${fileId}`);
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document');
    }
  };

  const handleDownloadDocument = async (fileId, filename) => {
    try {
      const response = await axios.get(`${API_BASE}/document/${fileId}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document');
    }
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleMergeDocuments = async () => {
    if (selectedFiles.length < 2) {
      alert('Please select at least 2 documents to merge');
      return;
    }

    setMerging(true);
    try {
      const response = await axios.post(`${API_BASE}/merge`, {
        file_ids: selectedFiles
      });
      
      console.log('Merged document:', response.data);
      setSelectedFiles([]);
      await fetchDocuments();
      alert(`Documents merged successfully! New document has ${response.data.page_count} pages.`);
    } catch (error) {
      console.error('Error merging documents:', error);
      alert('Error merging documents');
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="document-manager">
      <div className="manager-header">
        <h2>PDF Document Manager</h2>
        <p>Upload, view, and manage your PDF documents</p>
      </div>

      <div className="upload-section">
        <div className="upload-box">
          <input
            type="file"
            id="file-upload"
            multiple
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={uploading}
            className="file-input"
          />
          <label htmlFor="file-upload" className="upload-label">
            {uploading ? 'Uploading...' : 'Choose PDF Files'}
          </label>
          <p className="upload-hint">Select one or more PDF files to upload</p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="merge-section">
          <p>{selectedFiles.length} documents selected for merging</p>
          <button 
            onClick={handleMergeDocuments}
            disabled={merging || selectedFiles.length < 2}
            className="merge-btn"
          >
            {merging ? 'Merging...' : 'Merge Selected Documents'}
          </button>
          <button 
            onClick={() => setSelectedFiles([])}
            className="clear-selection-btn"
          >
            Clear Selection
          </button>
        </div>
      )}

      <div className="documents-grid">
        {documents.length === 0 ? (
          <div className="no-documents">
            <p>No documents uploaded yet</p>
            <p>Upload your first PDF to get started</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div 
              key={doc.file_id} 
              className={`document-card ${selectedFiles.includes(doc.file_id) ? 'selected' : ''}`}
            >
              <div className="document-info">
                <h3 className="document-title">{doc.filename}</h3>
                <p className="document-pages">{doc.page_count} pages</p>
              </div>
              
              <div className="document-actions">
                <button 
                  onClick={() => onViewDocument(doc.file_id)}
                  className="action-btn view-btn"
                >
                  View
                </button>
                
                <button 
                  onClick={() => handleDownloadDocument(doc.file_id, doc.filename)}
                  className="action-btn download-btn"
                >
                  Download
                </button>
                
                <button 
                  onClick={() => toggleFileSelection(doc.file_id)}
                  className={`action-btn select-btn ${selectedFiles.includes(doc.file_id) ? 'selected' : ''}`}
                >
                  {selectedFiles.includes(doc.file_id) ? 'Deselect' : 'Select'}
                </button>
                
                <button 
                  onClick={() => handleDeleteDocument(doc.file_id)}
                  className="action-btn delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentManager;