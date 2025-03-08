const API_BASE_URL = 'http://arthurrc-server.duckdns.org:8080';
const AUTH_USERNAME = 'admin';  // Replace with your actual username
const AUTH_PASSWORD = 'admin';  // Replace with your actual password
/**
* Fetches the list of videos from the backend
* @returns {Promise<Array>} Promise resolving to the video list
*/
export const getVideoList = async () => {
    try {
        console.log('Initiating API fetch request to:', `${API_BASE_URL}/list-videos`);
        
        const response = await fetch(`${API_BASE_URL}/list-videos`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`${AUTH_USERNAME}:${AUTH_PASSWORD}`)
            },
            credentials: 'include'
        });
        
        console.log('Received API response:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries([...response.headers.entries()]),
            type: response.type,
            url: response.url
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch videos: ${response.status} ${response.statusText}`);
        }
        
        // Check if response is empty
        const clone = response.clone();
        const rawText = await clone.text();
        console.log('Raw response body length:', rawText.length);
        if (!rawText || rawText.trim() === '') {
            console.error('Empty response received from API');
            throw new Error('Empty response received from API');
        }

            console.log('Parsing response to JSON...');
            let data;
            try {
                data = JSON.parse(rawText);
                console.log('Successfully parsed JSON data:', data);
            } catch (error) {
                console.error('Error parsing JSON response:', error);
                console.log('Response that failed to parse:', rawText);
                throw new Error(`Failed to parse API response: ${error.message}`);
            }

            // Transform the API response to the format expected by the Vue component
            const transformedData = [];

            // Check if the root directory has children (folders)
            if (data && data.children && Array.isArray(data.children)) {
                // Process each directory in the root's children
                data.children.forEach(directory => {
                    // Create a folder object
                    const folder = {
                        path: directory.path,
                        name: directory.name,
                        videos: []
                    };
                    
                    // Process video files in the directory
                    if (directory.children && Array.isArray(directory.children)) {
                        // Add each video file to the folder's videos array
                        directory.children.forEach(video => {
                            folder.videos.push({
                                path: video.path,
                                name: video.name,
                                size: video.size, // Use sizeBytes for numeric size value
                                created: video.created,
                                modified: video.modified // Changed from lastModified to modified
                            });
                        });
                    }
                    
                    transformedData.push(folder);
                });
            }

            return transformedData;
    } catch (error) {
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        console.debug('API request failed:', {
            url: `${API_BASE_URL}/list-videos`,
            baseUrl: API_BASE_URL,
            error: error
        });
    }
};

/**
* Generates the URL for streaming a video
* @param {string} path - The path to the video file
* @returns {string} The URL for streaming the video
*/
export const getVideoStreamUrl = (path) => {
    if (!path) {
        throw new Error('Video path is required');
    }

    // Encode the path parameter to handle special characters
    const encodedPath = encodeURIComponent(path);
    return `${API_BASE_URL}/video/path=${encodedPath}`;
};

/**
* Creates standardized headers for API requests
* @param {Object} additionalHeaders - Additional headers to include
* @returns {Object} Headers object with standard and additional headers
*/
export const createHeaders = (additionalHeaders = {}) => {
    return {
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...additionalHeaders
    };
};
