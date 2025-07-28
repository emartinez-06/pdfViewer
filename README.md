# MuPDF-Powered PDF Viewer

A unified PDF viewer application built with MuPDF, featuring document upload, viewing, text extraction, search, and document management capabilities.

## Architecture

This application demonstrates the power of MuPDF's cross-language capabilities:

- **Python Backend**: Uses PyMuPDF for PDF processing, rendering, and text extraction
- **React Frontend**: Modern web interface for document management and viewing
- **Node.js API**: Optional API layer for additional backend services
- **Docker**: Containerized deployment for easy setup

## Features

### Core PDF Processing (MuPDF-powered)
- ✅ PDF document upload and storage
- ✅ Page-by-page rendering with zoom control
- ✅ Text extraction from PDF pages
- ✅ Full-text search across documents
- ✅ Document merging capabilities
- ✅ Multi-format support (PDF focus, extensible to XPS, EPUB, etc.)

### User Interface
- ✅ Modern React-based document manager
- ✅ Interactive PDF viewer with navigation controls
- ✅ Search functionality with result highlighting
- ✅ Document selection and batch operations
- ✅ Responsive design for desktop and mobile

### Document Management
- ✅ Upload multiple PDF files
- ✅ View document metadata and page counts
- ✅ Download processed documents
- ✅ Merge multiple documents into one
- ✅ Delete unwanted documents

## Quick Start

### Prerequisites
- Docker and Docker Compose
- 2GB+ RAM available for containers
- Web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pdfViewer
```

2. Start all services:
```bash
docker-compose up --build
```

3. Access the application:
- **Frontend**: http://localhost:80
- **PDF Processor API**: http://localhost:5001
- **Backend API**: http://localhost:3001

## Service Architecture

### PDF Processor Service (Python + PyMuPDF)
**Port: 5001**

Key endpoints:
- `POST /upload` - Upload PDF files
- `GET /document/{id}/page/{num}/render` - Render page as image
- `GET /document/{id}/page/{num}/text` - Extract text from page
- `POST /document/{id}/search` - Search document content
- `POST /merge` - Merge multiple documents
- `GET /documents` - List all documents

### Frontend Service (React)
**Port: 80**

Features:
- Document upload interface
- PDF viewer with zoom and navigation
- Search functionality
- Document management grid
- Responsive design

### Backend Service (Node.js)
**Port: 3001**

Provides additional API endpoints and can be extended for:
- User authentication
- Database integration
- Additional business logic

## API Usage Examples

### Upload a PDF
```bash
curl -X POST -F "file=@document.pdf" http://localhost:5001/upload
```

### Render a page
```bash
curl "http://localhost:5001/document/{file_id}/page/1/render?zoom=1.5"
```

### Search document
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"query":"search term"}' \
  http://localhost:5001/document/{file_id}/search
```

### Merge documents
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"file_ids":["id1","id2","id3"]}' \
  http://localhost:5001/merge
```

## MuPDF Integration Details

This application showcases MuPDF's capabilities through PyMuPDF:

### Document Handling
```python
import fitz  # PyMuPDF

# Open document
doc = fitz.open("document.pdf")
page_count = doc.page_count
metadata = doc.metadata
```

### Page Rendering
```python
# Render page to image
page = doc[page_num - 1]
mat = fitz.Matrix(zoom, zoom)  # Zoom transformation
pix = page.get_pixmap(matrix=mat)
image_data = pix.tobytes("png")
```

### Text Extraction
```python
# Extract text from page
page = doc[page_num - 1]
text = page.get_text()
```

### Search Functionality
```python
# Search for text in page
text_instances = page.search_for(query)
for instance in text_instances:
    bbox = instance  # Bounding box coordinates
```

### Document Merging
```python
# Merge multiple documents
merged_doc = fitz.open()
for source_doc in source_documents:
    merged_doc.insert_pdf(source_doc)
```

## Development

### Local Development Setup

1. **Python Service**:
```bash
cd python_service
pip install -r requirements.txt
python app.py
```

2. **Frontend**:
```bash
cd frontend
npm install
npm start
```

3. **Backend** (optional):
```bash
cd backend
npm install
npm run dev
```

### File Structure
```
pdfViewer/
├── python_service/          # MuPDF-powered PDF processor
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile         # Docker configuration
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # PDF viewer components
│   │   └── pages/         # Application pages
│   └── package.json       # Frontend dependencies
├── backend/               # Node.js API (optional)
└── docker-compose.yml     # Multi-service orchestration
```

## Extending the Application

### Adding New Document Formats
MuPDF supports multiple formats. To add support:

1. Update the upload validation in `python_service/app.py`
2. Modify file type checking to include formats like `.xps`, `.epub`, `.mobi`
3. MuPDF will handle the format detection automatically

### Adding Annotations
```python
# Add annotation support
page = doc[page_num]
annot = page.addHighlightAnnot(bbox)  # Highlight annotation
annot.setInfo(content="My note")
annot.update()
```

### Progressive Loading
For large documents, implement progressive loading:
```python
# Open with stream for progressive loading
stream = fitz.open(stream=data, filetype="pdf")
# Handle FZ_ERROR_TRYLATER for incomplete data
```

## Performance Considerations

- **Memory Management**: Documents are kept in memory for fast access
- **Caching**: Rendered pages could be cached to disk for better performance
- **Concurrent Rendering**: Multiple pages can be rendered in parallel
- **Streaming**: Large files can be processed progressively

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 80, 3001, and 5001 are available
2. **Memory issues**: Increase Docker memory allocation for large PDFs
3. **File upload limits**: Check Flask's MAX_CONTENT_LENGTH setting
4. **CORS issues**: Verify Flask-CORS configuration

### Logs
```bash
# View service logs
docker-compose logs -f pdf-processor
docker-compose logs -f frontend
docker-compose logs -f backend
```

## License

This project demonstrates MuPDF integration. Note that MuPDF is licensed under GNU Affero GPL v3. For commercial use, a commercial license from Artifex Software is required.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## MuPDF Resources

- [MuPDF Documentation](https://mupdf.readthedocs.io/)
- [PyMuPDF Documentation](https://pymupdf.readthedocs.io/)
- [MuPDF GitHub](https://github.com/ArtifexSoftware/mupdf)
- [PyMuPDF Examples](https://github.com/pymupdf/PyMuPDF-Utilities)