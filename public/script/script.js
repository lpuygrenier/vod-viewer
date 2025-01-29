let selectedVideo = null;
let videos = [];
let isLoading = false;
let videoCount = 0;
const volumeControl = document.getElementById('volume-control');
const timeline = document.getElementById('timeline');

function addVideo(videoURL) {
    const video = document.createElement('video');
    video.src = videoURL;
    video.preload = 'auto';
    video.controls = true;

    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container unfocused';
    videoContainer.style.position = 'relative';
    videoContainer.appendChild(video);

    const numberLabel = document.createElement('div');
    numberLabel.className = 'video-number';
    numberLabel.textContent = videoCount;
    videoContainer.appendChild(numberLabel);
    videoCount++;

    // videoContainer.addEventListener('click', () => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     updateFocus(video);
    // });

    updateFocus(video);

    videos.push(video);
    initializeVideo(video, timeline);

    video.addEventListener('loadstart', () => {
        isLoading = true;
        pauseOtherVideos(video);
    });

    video.addEventListener('canplay', () => {
        isLoading = false;
    });

    const focusedVideosContainer = document.querySelector('.focused-video');
    if (focusedVideosContainer) {
        focusedVideosContainer.appendChild(videoContainer);
        document.querySelector('.video-layout').classList.remove('hide');
        document.querySelector('.welcome-layout').classList.add('hide');
    } else {
        console.error('Unfocused videos container not found');
    }   
}

function pauseOtherVideos(currentVideo) {
    videos.forEach(video => {
        if (video !== currentVideo) {
            video.pause();
        }
    });
}

function togglePlay() {
    const allPaused = videos.every(video => video.paused);
    videos.forEach(video => allPaused ? video.play() : video.pause());
}


function goBack(seconds) {
    const minTime = Math.min(...videos.map(video => video.currentTime));
    const newTime = Math.max(minTime - seconds, 0);
    videos.forEach(video => video.currentTime = newTime);
}

function goForward(seconds) {
    const maxTime = Math.max(...videos.map(video => video.currentTime));
    const minDuration = Math.min(...videos.map(video => video.duration));
    const newTime = Math.min(maxTime + seconds, minDuration);
    videos.forEach(video => video.currentTime = newTime);
}

function initializeVideo(video, timeline) {
    video.addEventListener('loadedmetadata', () => {
        timeline.max = video.duration;
    });
}

function resetVolumes() {
    videos.forEach(video => video.volume = 0);
}

function updateFocus(clickedVideo) {
    if (typeof clickedVideo === 'number') {
        const videoToFocus = videos.find((video, index) => 
            video.closest('.video-container').querySelector('.video-number').textContent == clickedVideo
        );
        if (videoToFocus) {
            clickedVideo = videoToFocus;
        } else {
            return;
        }
    }

    const focusedVideoContainer = document.querySelector('.focused-video');
    const unfocusedVideosContainer = document.querySelector('.unfocused-videos');

    videos.forEach(video => {
        const videoContainer = video.closest('.video-container') || video.parentElement;
        if (videoContainer.parentElement !== unfocusedVideosContainer) {
            unfocusedVideosContainer.appendChild(videoContainer);
        }
        videoContainer.classList.remove('focused');
        videoContainer.classList.add('unfocused');
    });

    const clickedVideoContainer = clickedVideo.closest('.video-container') || clickedVideo.parentElement;
    focusedVideoContainer.innerHTML = '';
    focusedVideoContainer.appendChild(clickedVideoContainer);
    clickedVideoContainer.classList.remove('unfocused');
    clickedVideoContainer.classList.add('focused');

    const volume = selectedVideo ? selectedVideo.volume : 0.5;
    resetVolumes();
    selectedVideo = clickedVideo;
    selectedVideo.volume = volume;
    volumeControl.value = volume;
}

volumeControl.addEventListener('input', (event) => {
    if (selectedVideo) {
        selectedVideo.volume = parseFloat(event.target.value);
    }
});

window.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        togglePlay();
    } else if (event.code === 'ArrowRight') {
        event.preventDefault();
        goForward(10);
    } else if (event.code === 'ArrowLeft') {
        event.preventDefault();
        goBack(10);
    } else if (event.code.startsWith('Digit') || event.code.startsWith('Numpad')) {
        const digit = parseInt(event.key);
        if (digit >= 0 && digit <= 9) {
            event.preventDefault();
            updateFocus(digit);
        }
    }
});

const progressBar = document.createElement('progress');
progressBar.max = 100;
document.getElementById('uploadProgress').appendChild(progressBar);
const uploadProgress = document.getElementById('uploadProgress')

function showProgressBar() {
    uploadProgress.classList.remove('hide');
}
  
function hideProgressBar() {
    uploadProgress.classList.add('hide');
}

function toggleRowSelection(row) {
    console.log('hello');
    row.classList.toggle('selected');
}



document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);
    showProgressBar();
    
    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            progressBar.value = percentComplete;
            progressBar.textContent = `${percentComplete.toFixed(2)}%`;
        }
    };
    xhr.onload = function() {
        if (xhr.status === 200) {
            document.getElementById('uploadMessage').textContent = 'File uploaded successfully';
            updateFileList();
        } else {
            document.getElementById('uploadMessage').textContent = 'Error uploading file';
        }
        hideProgressBar();
    };
    
    xhr.send(formData);
});

function updateFileList() {
    fetch('/uploads')
        .then(response => response.json())
        .then(files => {
            const fileList = document.getElementById('fileList');
            fileList.innerHTML = '';
            
            files.forEach(file => {
                if (file.name !== '.gitkeep') {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${file.name}</td>
                        <td>
                            <button onclick="reviewVideo('${file.url}')">Review</button>
                            <button onclick="downloadFile('${file.url}', '${file.name}')">Download</button>
                        </td>
                    `;
                    tr.addEventListener('click', function(event) {
                        if (event.target.tagName !== 'BUTTON') {
                            toggleRowSelection(this);
                        }
                    });
                    fileList.appendChild(tr);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching file list:', error);
        });
}

function reviewVideo(videoURL) {
    fetch(videoURL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(blob => {
            const objectURL = URL.createObjectURL(blob);
            addVideo(objectURL);
        })
        .catch(error => {
            console.error('Error fetching video:', error);
        });
}


function downloadFile(url, fileName) {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(link.href);
        })
        .catch(error => {
            console.error('Error downloading file:', error);
        });
}

  