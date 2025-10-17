// API Base URL
const API_URL = '/api/drive';

// DOM Elements
const authSection = document.getElementById('authSection');
const getAuthUrlBtn = document.getElementById('getAuthUrlBtn');
const authUrlDisplay = document.getElementById('authUrlDisplay');
const authUrl = document.getElementById('authUrl');
const uploadForm = document.getElementById('uploadForm');
const refreshBtn = document.getElementById('refreshBtn');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const filesList = document.getElementById('filesList');
const statusMessage = document.getElementById('statusMessage');

// Get Authorization URL
getAuthUrlBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_URL}/auth-url`);
        const data = await response.json();
        
        if (data.authUrl) {
            authUrl.href = data.authUrl;
            authUrlDisplay.classList.remove('hidden');
            showStatus('Authorization URL generated. Click the link to authorize.', 'info');
        }
    } catch (error) {
        showStatus('Error getting authorization URL: ' + error.message, 'error');
    }
});

// Upload File
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(uploadForm);
    
    try {
        showStatus('Uploading file...', 'info');
        
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showStatus('File uploaded successfully!', 'success');
            uploadForm.reset();
            loadFiles(); // Refresh the file list
        } else {
            showStatus('Upload failed: ' + data.error, 'error');
        }
    } catch (error) {
        showStatus('Error uploading file: ' + error.message, 'error');
    }
});

// Load Files
async function loadFiles(query = null) {
    try {
        filesList.innerHTML = '<p class="loading">Loading files...</p>';
        
        let url = `${API_URL}/files?pageSize=20`;
        if (query) {
            url += `&query=name contains '${query}'`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
            displayFiles(data.files || []);
        } else {
            filesList.innerHTML = '<p class="loading">Error loading files: ' + data.error + '</p>';
        }
    } catch (error) {
        filesList.innerHTML = '<p class="loading">Error loading files: ' + error.message + '</p>';
        showStatus('Error loading files: ' + error.message, 'error');
    }
}

// Display Files
function displayFiles(files) {
    if (files.length === 0) {
        filesList.innerHTML = '<p class="loading">No files found.</p>';
        return;
    }
    
    filesList.innerHTML = '';
    
    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileSize = file.size ? formatBytes(file.size) : 'N/A';
        const createdDate = new Date(file.createdTime).toLocaleDateString();
        const modifiedDate = new Date(file.modifiedTime).toLocaleDateString();
        
        fileItem.innerHTML = `
            <div class="file-header">
                <div class="file-name">${file.name}</div>
                <div class="file-actions">
                    <button class="btn btn-download" onclick="downloadFile('${file.id}', '${file.name}')">📥 Download</button>
                    <button class="btn btn-info" onclick="viewFile('${file.webViewLink}')">👁️ View</button>
                    <button class="btn btn-danger" onclick="deleteFile('${file.id}')">🗑️ Delete</button>
                </div>
            </div>
            <div class="file-meta">
                <span>📊 Type: ${file.mimeType}</span>
                <span>💾 Size: ${fileSize}</span>
                <span>📅 Created: ${createdDate}</span>
                <span>🔄 Modified: ${modifiedDate}</span>
            </div>
        `;
        
        filesList.appendChild(fileItem);
    });
}

// Download File
async function downloadFile(fileId, fileName) {
    try {
        showStatus('Downloading file...', 'info');
        
        const response = await fetch(`${API_URL}/files/${fileId}?download=true`);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showStatus('File downloaded successfully!', 'success');
        } else {
            const data = await response.json();
            showStatus('Download failed: ' + data.error, 'error');
        }
    } catch (error) {
        showStatus('Error downloading file: ' + error.message, 'error');
    }
}

// View File
function viewFile(webViewLink) {
    if (webViewLink) {
        window.open(webViewLink, '_blank');
    } else {
        showStatus('No view link available for this file', 'error');
    }
}

// Delete File
async function deleteFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) {
        return;
    }
    
    try {
        showStatus('Deleting file...', 'info');
        
        const response = await fetch(`${API_URL}/files/${fileId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showStatus('File deleted successfully!', 'success');
            loadFiles(); // Refresh the file list
        } else {
            showStatus('Delete failed: ' + data.error, 'error');
        }
    } catch (error) {
        showStatus('Error deleting file: ' + error.message, 'error');
    }
}

// Show Status Message
function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = type;
    statusMessage.classList.remove('hidden');
    
    setTimeout(() => {
        statusMessage.classList.add('hidden');
    }, 5000);
}

// Format Bytes
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Event Listeners
refreshBtn.addEventListener('click', () => loadFiles());

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    loadFiles(query);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        loadFiles(query);
    }
});

// Initial load
console.log('Google Drive Manager loaded');

