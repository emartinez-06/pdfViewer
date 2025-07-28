import os
import io
import base64
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import fitz  # PyMuPDF
from PIL import Image
import tempfile
import uuid

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Store open documents in memory for session management
open_documents = {}

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'pdf-processor'})

@app.route('/upload', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are allowed'}), 400
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    filename = f"{file_id}.pdf"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    try:
        file.save(filepath)
        
        # Open document with PyMuPDF
        doc = fitz.open(filepath)
        page_count = doc.page_count
        
        # Extract metadata
        metadata = doc.metadata
        
        # Store document reference
        open_documents[file_id] = {
            'filepath': filepath,
            'doc': doc,
            'page_count': page_count,
            'filename': file.filename
        }
        
        return jsonify({
            'file_id': file_id,
            'filename': file.filename,
            'page_count': page_count,
            'metadata': metadata
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/document/<file_id>/info', methods=['GET'])
def get_document_info(file_id):
    if file_id not in open_documents:
        return jsonify({'error': 'Document not found'}), 404
    
    doc_info = open_documents[file_id]
    return jsonify({
        'file_id': file_id,
        'filename': doc_info['filename'],
        'page_count': doc_info['page_count']
    })

@app.route('/document/<file_id>/page/<int:page_num>/render', methods=['GET'])
def render_page(file_id, page_num):
    if file_id not in open_documents:
        return jsonify({'error': 'Document not found'}), 404
    
    doc_info = open_documents[file_id]
    doc = doc_info['doc']
    
    if page_num < 1 or page_num > doc.page_count:
        return jsonify({'error': 'Invalid page number'}), 400
    
    try:
        # Get page (0-indexed)
        page = doc[page_num - 1]
        
        # Get zoom factor from query params (default 1.0)
        zoom = float(request.args.get('zoom', 1.0))
        
        # Create transformation matrix
        mat = fitz.Matrix(zoom, zoom)
        
        # Render page to pixmap
        pix = page.get_pixmap(matrix=mat)
        
        # Convert to PIL Image
        img_data = pix.tobytes("png")
        
        # Return as base64 encoded image
        img_b64 = base64.b64encode(img_data).decode('utf-8')
        
        return jsonify({
            'page_num': page_num,
            'image_data': f"data:image/png;base64,{img_b64}",
            'width': pix.width,
            'height': pix.height
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/document/<file_id>/page/<int:page_num>/text', methods=['GET'])
def extract_text(file_id, page_num):
    if file_id not in open_documents:
        return jsonify({'error': 'Document not found'}), 404
    
    doc_info = open_documents[file_id]
    doc = doc_info['doc']
    
    if page_num < 1 or page_num > doc.page_count:
        return jsonify({'error': 'Invalid page number'}), 400
    
    try:
        page = doc[page_num - 1]
        text = page.get_text()
        
        return jsonify({
            'page_num': page_num,
            'text': text
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/document/<file_id>/search', methods=['POST'])
def search_document(file_id):
    if file_id not in open_documents:
        return jsonify({'error': 'Document not found'}), 404
    
    data = request.get_json()
    if not data or 'query' not in data:
        return jsonify({'error': 'Search query required'}), 400
    
    query = data['query']
    doc_info = open_documents[file_id]
    doc = doc_info['doc']
    
    results = []
    
    try:
        for page_num in range(doc.page_count):
            page = doc[page_num]
            text_instances = page.search_for(query)
            
            if text_instances:
                for inst in text_instances:
                    results.append({
                        'page_num': page_num + 1,
                        'bbox': list(inst),
                        'text': query
                    })
        
        return jsonify({
            'query': query,
            'results': results,
            'total_matches': len(results)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/merge', methods=['POST'])
def merge_documents():
    data = request.get_json()
    if not data or 'file_ids' not in data:
        return jsonify({'error': 'File IDs required'}), 400
    
    file_ids = data['file_ids']
    
    # Validate all file IDs exist
    for file_id in file_ids:
        if file_id not in open_documents:
            return jsonify({'error': f'Document {file_id} not found'}), 404
    
    try:
        # Create new document for merge
        merged_doc = fitz.open()
        
        for file_id in file_ids:
            source_doc = open_documents[file_id]['doc']
            merged_doc.insert_pdf(source_doc)
        
        # Save merged document
        merge_id = str(uuid.uuid4())
        merged_filepath = os.path.join(app.config['PROCESSED_FOLDER'], f"merged_{merge_id}.pdf")
        merged_doc.save(merged_filepath)
        
        # Store merged document
        open_documents[merge_id] = {
            'filepath': merged_filepath,
            'doc': merged_doc,
            'page_count': merged_doc.page_count,
            'filename': f"merged_{merge_id}.pdf"
        }
        
        return jsonify({
            'merge_id': merge_id,
            'page_count': merged_doc.page_count,
            'filename': f"merged_{merge_id}.pdf"
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/document/<file_id>/download', methods=['GET'])
def download_document(file_id):
    if file_id not in open_documents:
        return jsonify({'error': 'Document not found'}), 404
    
    doc_info = open_documents[file_id]
    filepath = doc_info['filepath']
    filename = doc_info['filename']
    
    return send_file(filepath, as_attachment=True, download_name=filename)

@app.route('/documents', methods=['GET'])
def list_documents():
    docs = []
    for file_id, doc_info in open_documents.items():
        docs.append({
            'file_id': file_id,
            'filename': doc_info['filename'],
            'page_count': doc_info['page_count']
        })
    
    return jsonify({'documents': docs})

@app.route('/document/<file_id>', methods=['DELETE'])
def delete_document(file_id):
    if file_id not in open_documents:
        return jsonify({'error': 'Document not found'}), 404
    
    try:
        doc_info = open_documents[file_id]
        doc_info['doc'].close()
        
        # Remove file if it exists
        if os.path.exists(doc_info['filepath']):
            os.remove(doc_info['filepath'])
        
        del open_documents[file_id]
        
        return jsonify({'message': 'Document deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)