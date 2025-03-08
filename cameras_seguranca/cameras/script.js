import { getVideoList, getVideoStreamUrl } from './api.js';
const API_BASE_URL = 'http://arthurrc-server.duckdns.org:8080';
const AUTH_USERNAME = 'admin';  // Replace with your actual username
const AUTH_PASSWORD = 'admin';  // Replace with your actual password
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM LOADED TRYING TO LOAD VIDEOS");
    loadVideos();
    
    // Close modal when clicking the close button
    document.querySelector('.close-button').addEventListener('click', () => {
        closeVideoModal();
    });
    
    // Close modal when clicking outside the modal content
    document.getElementById('video-player-modal').addEventListener('click', (event) => {
        if (event.target === document.getElementById('video-player-modal')) {
            closeVideoModal();
        }
    });
});

async function loadVideos() {
    try {
        const folders = await getVideoList();
        
        if (folders && folders.length > 0) {
            displayFolders(folders);
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('folders-container').classList.remove('hidden');
        } else {
            showError('No videos found');
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        showError('Failed to load videos');
    }
}

function displayFolders(folders) {
    const foldersContainer = document.getElementById('folders-container');
    foldersContainer.innerHTML = '';
    
    folders.forEach(folder => {
        const folderElement = document.createElement('div');
        folderElement.className = 'folder';
        
        const folderHeader = document.createElement('div');
        folderHeader.className = 'folder-header';
        folderHeader.innerHTML = `
            <h2>${folder.name}</h2>
            <span class="video-count">${folder.videos.length} videos</span>
        `;
        
        const videosContainer = document.createElement('div');
        videosContainer.className = 'videos-container';
        
        folder.videos.forEach(video => {
            const videoCard = createVideoCard(video, folder.path);
            videosContainer.appendChild(videoCard);
        });
        
        folderElement.appendChild(folderHeader);
        folderElement.appendChild(videosContainer);
        foldersContainer.appendChild(folderElement);
    });
}

function createVideoCard(video, folderPath) {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    
    // Format the dates
    const createdDate = new Date(video.created).toLocaleString();
    const modifiedDate = new Date(video.modified).toLocaleString();
    
    // Format the size (convert to KB or MB as appropriate)
    let formattedSize;
    if (video.size < 1024) {
        formattedSize = `${video.size} bytes`;
    } else if (video.size < 1024 * 1024) {
        formattedSize = `${(video.size / 1024).toFixed(2)} KB`;
    } else {
        formattedSize = `${(video.size / (1024 * 1024)).toFixed(2)} MB`;
    }
    
    videoCard.innerHTML = `
        <div class="video-thumbnail">
            <img src="video-thumbnail.png" alt="${video.name}">
            <div class="play-button">▶</div>
        </div>
        <div class="video-info">
            <h3 class="video-title">${video.name}</h3>
            <p class="video-metadata">Size: ${formattedSize}</p>
            <p class="video-metadata">Created: ${createdDate}</p>
            <p class="video-metadata">Modified: ${modifiedDate}</p>
        </div>
    `;
    
    videoCard.addEventListener('click', () => {
        openVideoModal(video, folderPath);
    });
    
    return videoCard;
}

function openVideoModal(video, folderPath) {
    const modal = document.getElementById('video-player-modal');
    const videoPlayer = document.getElementById('video-player');
    const videoTitle = document.getElementById('modal-video-title');
    const videoMetadata = document.getElementById('video-metadata');
    
    // Set video title
    videoTitle.textContent = video.name;
    
    // Set video source
    const videoPath = `${folderPath}/${video.name}`;
    videoPlayer.src = getVideoStreamUrl(videoPath);
    
    // Format dates
    const createdDate = new Date(video.created).toLocaleString();
    const modifiedDate = new Date(video.modified).toLocaleString();
    
    // Format size
    let formattedSize;
    if (video.size < 1024) {
        formattedSize = `${video.size} bytes`;
    } else if (video.size < 1024 * 1024) {
        formattedSize = `${(video.size / 1024).toFixed(2)} KB`;
    } else {
        formattedSize = `${(video.size / (1024 * 1024)).toFixed(2)} MB`;
    }
    
    // Display metadata
    videoMetadata.innerHTML = `
        <p>Size: ${formattedSize}</p>
        <p>Created: ${createdDate}</p>
        <p>Modified: ${modifiedDate}</p>
    `;
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Start playing the video
    videoPlayer.play();
}

function closeVideoModal() {
    const modal = document.getElementById('video-player-modal');
    const videoPlayer = document.getElementById('video-player');
    
    // Pause video
    videoPlayer.pause();
    
    // Hide modal
    modal.classList.add('hidden');
}

function showError(message) {
    document.getElementById('loading').classList.add('hidden');
    const errorElement = document.getElementById('error');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

