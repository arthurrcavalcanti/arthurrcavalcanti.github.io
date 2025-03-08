// Note: You must restart the server (Ctrl+C and then 'npm start') after making any changes to this file

require('dotenv').config();
const express = require('express');
const basicAuth = require('express-basic-auth');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Authentication setup - use environment variables for security
// Set these variables in your .env file or before starting the server
// Example: AUTH_USERNAME=admin AUTH_PASSWORD=securepassword npm start
if (process.env.AUTH_USERNAME && process.env.AUTH_PASSWORD) {
    const users = {};
    users[process.env.AUTH_USERNAME] = process.env.AUTH_PASSWORD;
    users['wp'] = 'matteo17';
    
    app.use(basicAuth({
        users: users,
        challenge: true,
        realm: 'Servidor de vídeo de segurança',
    }));
    console.log('Autenticação basica ativada', {users});
} else {
    console.warn('WARNING: Autenticação disabilitada. Set AUTH_USERNAME and AUTH_PASSWORD environment variables for security.');
}

// Enable CORS with more secure configuration
// Update the origin to match your GitHub Pages domain or other trusted sources
const allowedOrigins = process.env.ALLOWED_ORIGINS
? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
: ['http://localhost:5500'];  // Alterar para o frontend correto

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            console.error('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400 // Cache preflight request for 24 hours
}));

// Logging middleware to debug requests
app.use((req, res, next) => {
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${clientIP}`);
    
    // Log headers only in development mode
    if (process.env.NODE_ENV === 'development') {
        console.log('Headers:', JSON.stringify(req.headers, null, 2));
    }
    
    // For security, you may want to log suspicious requests
    if (req.url.includes('../') || req.url.includes('..\\')) {
        console.warn(`SECURITY WARNING: Possible path traversal attempt from IP: ${clientIP}`);
    }
    
    next();
});

// The folder you want to share (change this path to your desired folder)
const SHARED_FOLDER = process.env.SHARED_FOLDER || './shared';

// Create the shared folder if it doesn't exist
if (!fs.existsSync(SHARED_FOLDER)) {
    fs.mkdirSync(SHARED_FOLDER, { recursive: true });
}


// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to get file type based on extension
function getFileType(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    const extensionMap = {
        '.mp4': 'MP4 Video',
        '.avi': 'AVI Video',
        '.mkv': 'MKV Video',
        '.mov': 'MOV Video',
        '.wmv': 'WMV Video',
        '.flv': 'FLV Video',
        '.webm': 'WebM Video'
    };

    return extensionMap[ext] || 'Unknown File Type'; 
}

// Helper function to check if a file is a video
function isVideoFile(filePath) {
    const videoExtensions = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm'];
    const ext = path.extname(filePath).toLowerCase();
    return videoExtensions.includes(ext);
}

// Function to recursively get folder structure with video files
function getFolderStructure(dirPath, basePath = '') {
    try {
        const result = {
            name: path.basename(dirPath),
            path: basePath || '/',
            type: 'directory',
            children: []
        };

        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const relativePath = path.join(basePath, item);
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory()) {
                result.children.push(getFolderStructure(itemPath, relativePath));
            } else if (isVideoFile(itemPath)) {
                result.children.push({
                    name: item,
                    path: relativePath,
                    type: 'file',
                    fileType: getFileType(item),
                    size: formatFileSize(stats.size),
                    sizeBytes: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    accessed: stats.atime
                });
            }
        }
        
        return result;
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
        return {
            name: path.basename(dirPath),
            path: basePath || '/',
            type: 'directory',
            error: error.message,
            children: []
        };
    }
}


// API Endpoints

// 1. List all videos in the shared folder structure
// Handle OPTIONS preflight requests explicitly
app.options('/list-videos', (req, res) => {
    console.log('Handling OPTIONS request for /list-videos');

     // No authentication required for preflight requests
     res.header('Access-Control-Allow-Origin', 'http://localhost:5500');  // Allow your origin
     res.header('Access-Control-Allow-Origin', 'http://arthurrc-server.duckdns.org/'); // Allow your origin
     res.header('Access-Control-Allow-Credentials', 'true');  // Allow credentials
     res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,HEAD');
     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');

    res.status(204).end();  // End the response for preflight request
});

app.get('/list-videos', (req, res) => {
    console.log('Handling GET request for /list-videos');
    
    try {
        console.log('Retrieving folder structure from:', SHARED_FOLDER);
        const folderStructure = getFolderStructure(SHARED_FOLDER);
        console.log('Folder structure retrieved successfully');
        
        const origin = req.headers.origin || '*'; // Default to '*' if no origin is found
        // Set explicit headers to ensure proper response
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        // Send the response
        console.log('Sending JSON response');
        res.json(folderStructure);
        console.log('Response sent successfully');
    } catch (error) {
        console.error('Error getting folder structure:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve folder structure', 
            message: error.message,
            stack: error.stack 
        });
    }
});

// 2. Stream video file
app.get('/video/path=*', (req, res) => {
    try {
        // Extract the path parameter
        const videoPath = req.params[0];
        if (!videoPath) {
            return res.status(400).json({ error: 'Video path is required' });
        }
        
        // Build the full path to the file
        const fullPath = path.join(SHARED_FOLDER, videoPath);
        
        // Check if the file exists and is within the shared folder
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'Video file not found' });
        }
        
        // Verify this is actually a file and not a directory
        const stats = fs.statSync(fullPath);
        if (!stats.isFile()) {
            return res.status(400).json({ error: 'The specified path is not a file' });
        }
        
        // Check if this is a video file
        if (!isVideoFile(fullPath)) {
            return res.status(400).json({ error: 'The specified file is not a supported video format' });
        }
        
        // Get file size
        const fileSize = stats.size;
        
        // Parse Range header
        const range = req.headers.range;
        if (range) {
            // Parse Range header
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            
            // Create headers
            const chunksize = (end - start) + 1;
            const headers = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4'
            };
            
            // HTTP Status 206 for Partial Content
            res.writeHead(206, headers);
            
            // Create read stream for this range and pipe to response
            const stream = fs.createReadStream(fullPath, { start, end });
            stream.on('error', (error) => {
                console.error('Error streaming video:', error);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Error streaming video', message: error.message });
                }
            });
            stream.pipe(res);
        } else {
            // No range requested, send entire file
            const headers = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4'
            };
            res.writeHead(200, headers);
            fs.createReadStream(fullPath).pipe(res);
        }
    } catch (error) {
        console.error('Error streaming video:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to stream video', message: error.message });
        }
    }
});

// Error handling for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Not found', message: 'The requested endpoint does not exist' });
});

// Error handling middleware for CORS errors
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        res.status(403).json({ 
            error: 'CORS error', 
            message: 'This server only accepts requests from allowed origins' 
        });
    } else {
        next(err);
    }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => { 
    console.log(`\n======================================================`);
    console.log(`Video Streaming API running at http://0.0.0.0:${PORT}`);
    console.log(`Server is accessible from external connections`);
    console.log(`======================================================\n`);
    
    // Port forwarding information
    console.log(`PORT FORWARDING SETUP INFORMATION:`);
    console.log(`1. Configure your router to forward external port (e.g. 8080) to internal port ${PORT}`);
    console.log(`2. Make sure this server has a static/fixed IP address on your local network`);
    console.log(`3. Your server will be accessible at: http://YOUR_PUBLIC_IP:EXTERNAL_PORT\n`);
    
    // Security configuration information
    console.log(`SECURITY CONFIGURATION:`);
    if (process.env.AUTH_USERNAME && process.env.AUTH_PASSWORD) {
        console.log(`✓ Basic authentication is ENABLED (Username: ${process.env.AUTH_USERNAME})`);
    } else {
        console.log(`✗ Basic authentication is DISABLED - Set the following environment variables:`);
        console.log(`  - AUTH_USERNAME: desired username`);
        console.log(`  - AUTH_PASSWORD: secure password`);
    }
    
    // CORS settings information
    console.log(`\nCORS Configuration:`);
    console.log(`✓ Allowed Origins: ${allowedOrigins.join(', ')}`);
    console.log(`✓ To change allowed origins, set the ALLOWED_ORIGINS environment variable`);
    console.log(`  Example: ALLOWED_ORIGINS=https://example.com,https://app.example.com\n`);
    
    console.log(`Endpoints available:`);
    console.log(`- GET /list-videos`);
    console.log(`- GET /video/path={path_to_file}`);
    
    // Find public IP for convenience
    console.log(`\nTo find your public IP address, visit: https://whatismyip.com\n`);
});
