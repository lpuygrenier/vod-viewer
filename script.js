let selectedVideo = null;
let videos = [];

const volumeControl = document.getElementById('volume-control');
const timeline = document.getElementById('timeline3');

function importVideos() {
    const input = document.getElementById('video-import');
    const files = input.files;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const videoURL = URL.createObjectURL(file);
        addVideo(videoURL);
    }
}

function addVideo(videoURL) {
    const video = document.createElement('video');
    video.src = videoURL;
    video.preload = 'auto';

    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container unfocused';
    videoContainer.appendChild(video);

    videoContainer.addEventListener('click', () => updateFocus(video));

    updateFocus(video);

    videos.push(video);
    initializeVideo(video, timeline);
}

function togglePlay() {
    const allPaused = videos.every(video => video.paused);
    videos.forEach(video => allPaused ? video.play() : video.pause());
}

function goBack() {
    videos.forEach(video => video.currentTime = Math.max(video.currentTime - 10, 0));
}

function goForward() {
    videos.forEach(video => video.currentTime = Math.min(video.currentTime + 10, video.duration));
}

function updateTimeline(video, timeline) {
    timeline.value = video.currentTime;
}

function initializeVideo(video, timeline) {
    video.addEventListener('loadedmetadata', () => {
        timeline.max = video.duration;
    });
    video.addEventListener('timeupdate', () => updateTimeline(video, timeline));
}

function resetVolumes() {
    videos.forEach(video => video.volume = 0);
}

function updateFocus(clickedVideo) {
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

timeline.addEventListener('input', function() {
    if (selectedVideo) {
        selectedVideo.currentTime = (this.value / this.max) * selectedVideo.duration;
    }
});

window.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        togglePlay();
    } else if (event.code === 'ArrowRight') {
        event.preventDefault();
        goForward();
    } else if (event.code === 'ArrowLeft') {
        event.preventDefault();
        goBack();
    }
});
  