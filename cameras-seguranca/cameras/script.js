import { getVideoList, getVideoStreamUrl } from './api.js';

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
    console.log({folders});
    const foldersContainer = document.getElementById('folders-container');
    foldersContainer.innerHTML = '';
    
    folders.forEach(folder => {
        const folderHeader = document.createElement('details');
        folderHeader.className = 'folder-header';

        const name = folder.name.startsWith('4') ? 'Odorico Mendes' : 'Visc. de Cairú';

        folderHeader.innerHTML = `
            <summary>
                <h2>${name}</h2>
                <span class="video-count">${folder.videos.length} videos</span>
            </summary>
        `;
        
        const videosContainer = document.createElement('div');
        videosContainer.className = 'videos-container';
        
        folder.videos.forEach(video => {
            const videoCard = createVideoCard(video);
            videosContainer.appendChild(videoCard);
        });
        
        folderHeader.appendChild(videosContainer);
        foldersContainer.appendChild(folderHeader);
    });
}

function createVideoCard(video) {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    
    // Format the dates
    const createdDate = new Date(video.created).toLocaleString();
    const modifiedDate = new Date(video.modified).toLocaleString();
    
    videoCard.innerHTML = `
        <h3 class="video-title">${video.name}</h3>
        <p class="video-metadata">Tamanho: ${video.size}</p>
        <small class="video-metadata">${createdDate} ~ ${modifiedDate}</small>
    `;
    
    videoCard.addEventListener('click', () => {
        openVideoModal(video, video.path);
    });
    
    return videoCard;
}

function openVideoModal(video, videoPath) {
    const modal = document.getElementById('video-player-modal');
    const videoPlayer = document.getElementById('video-player');
    const videoTitle = document.getElementById('modal-video-title');
    const videoMetadata = document.getElementById('video-metadata');
    
    // Set video title
    videoTitle.textContent = video.name;
    
    // Set video source
    videoPlayer.src = getVideoStreamUrl(videoPath);
    
    // Format dates
    const createdDate = new Date(video.created).toLocaleString();
    const modifiedDate = new Date(video.modified).toLocaleString();
    
    // Display metadata
    videoMetadata.innerHTML = `
        <small>${createdDate} ~ ${modifiedDate}</small>
    `;
    
    // Show modal
    modal.classList.remove('hidden');
    console.log(modal.classList); // Check the modal class to ensure it's showing the modal properly

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

