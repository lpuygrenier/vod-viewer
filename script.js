let selectedVideo = document.getElementById('video1');
const videos = [
    document.getElementById('video1'),
    document.getElementById('video2'),
    document.getElementById('video3'),
    document.getElementById('video4')
];

const volumeControl = document.getElementById('volume-control');

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
    timeline.max = video.duration;
    video.addEventListener('timeupdate', () => updateTimeline(video, timeline));
}

function resetVolumes(){
    videos.forEach(video => video.volume = 0);
}

videos.forEach((video, index) => {
    video.addEventListener('click', (event) => {
        const volume = selectedVideo.volume;
        resetVolumes();
        selectedVideo = video;
        selectedVideo.volume = volume;
        console.log(volumeControl);
        updateFocus(video);

    });
});

volumeControl.addEventListener('input', (event) => {
    selectedVideo.volume = parseFloat(event.target.value);
});

function updateFocus(clickedVideo) {
    const focusedVideoContainer = document.querySelector('.focused-video');
    const unfocusedVideosContainer = document.querySelector('.unfocused-videos');

    // First, move all videos to unfocused container
    videos.forEach(video => {
        const videoContainer = video.closest('.video-container') || video.parentElement;
        if (videoContainer.parentElement !== unfocusedVideosContainer) {
            unfocusedVideosContainer.appendChild(videoContainer);
        }
        videoContainer.classList.remove('focused');
        videoContainer.classList.add('unfocused');
    });

    // Then, move the clicked video to focused container
    const clickedVideoContainer = clickedVideo.closest('.video-container') || clickedVideo.parentElement;
    focusedVideoContainer.innerHTML = '';
    focusedVideoContainer.appendChild(clickedVideoContainer);
    clickedVideoContainer.classList.remove('unfocused');
    clickedVideoContainer.classList.add('focused');
}


video1.volume = 0;
video2.volume = 0;
video3.volume = 0;
video4.volume = 0;