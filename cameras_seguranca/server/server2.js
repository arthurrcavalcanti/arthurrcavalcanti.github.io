// Load environment variables
require('dotenv').config();

const express = require('express');
const basicAuth = require('express-basic-auth');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------
// CORS CONFIGURATION
// ---------------------
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5500', 'http://localhost'];  // Default allowed origin

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl) or in development mode
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
  optionsSuccessStatus: 204,
  maxAge: 86400
}));

// Explicitly handle OPTIONS preflight for all routes
app.options('*', (req, res) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.sendStatus(204);
});

// ---------------------
// BASIC AUTHENTICATION (Skip OPTIONS requests)
// ---------------------
if (process.env.AUTH_USERNAME && process.env.AUTH_PASSWORD) {
  const users = {};
  users[process.env.AUTH_USERNAME] = process.env.AUTH_PASSWORD;
  // Optionally add more users:
  // users['wp'] = 'matteo17';
  
  // Only apply basicAuth middleware if the request method is not OPTIONS
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      return next();
    }
    return basicAuth({
      users: users,
      challenge: true,
      realm: 'Servidor de vídeo de segurança'
    })(req, res, next);
  });
  console.log('Basic authentication enabled', { users });
} else {
  console.warn('WARNING: Basic authentication disabled. Set AUTH_USERNAME and AUTH_PASSWORD in your .env file.');
}

// ---------------------
// SHARED FOLDER SETUP
// ---------------------
const SHARED_FOLDER = process.env.SHARED_FOLDER || './shared';

// Ensure the shared folder exists
if (!fs.existsSync(SHARED_FOLDER)) {
  fs.mkdirSync(SHARED_FOLDER, { recursive: true });
}

// ---------------------
// HELPER FUNCTIONS
// ---------------------

// Recursively builds the folder structure and lists video files.
function getFolderStructure(dirPath, basePath = '') {
  const result = {
    name: path.basename(dirPath),
    path: basePath || '/',
    type: 'directory',
    children: []
  };

  try {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const relativePath = path.join(basePath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        result.children.push(getFolderStructure(itemPath, relativePath));
      } else if (isVideoFile(item)) {
        result.children.push({
          name: item,
          path: relativePath,
          type: 'file',
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        });
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
  }

  return result;
}

// Determines if a file is a supported video file based on its extension.
function isVideoFile(fileName) {
  const videoExtensions = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm'];
  return videoExtensions.includes(path.extname(fileName).toLowerCase());
}

// ---------------------
// ENDPOINTS
// ---------------------

// GET /list-videos - Returns the folder structure of videos
app.get('/list-videos', (req, res) => {
  console.log('Handling GET request for /list-videos');
  try {
    const folderStructure = getFolderStructure(SHARED_FOLDER);
    const origin = req.headers.origin || '*';
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    res.json(folderStructure);
    console.log('Folder structure sent successfully.');
  } catch (error) {
    console.error('Error retrieving folder structure:', error);
    res.status(500).json({
      error: 'Failed to retrieve folder structure',
      message: error.message
    });
  }
});

// GET /video/path=* - Streams the video file specified by the path parameter
app.get('/video/path=*', (req, res) => {
  const videoPathParam = req.params[0] || '';
  const videoPath = path.join(SHARED_FOLDER, videoPathParam);
  const origin = req.headers.origin || '*';

  console.log(`Handling GET request for video: ${videoPath}`);

  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: 'Video not found' });
  }
  const stats = fs.statSync(videoPath);
  if (!stats.isFile()) {
    return res.status(400).json({ error: 'Not a valid file' });
  }

  // Set content type (assuming mp4; consider detecting based on file extension)
  const contentType = 'video/mp4';

  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
    const chunkSize = (end - start) + 1;

    res.status(206).set({
      'Content-Range': `bytes ${start}-${end}/${stats.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true'
    });
    const stream = fs.createReadStream(videoPath, { start, end });
    stream.pipe(res);
  } else {
    res.set({
      'Content-Length': stats.size,
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true'
    });
    fs.createReadStream(videoPath).pipe(res);
  }
});

// ---------------------
// START THE SERVER
// ---------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
