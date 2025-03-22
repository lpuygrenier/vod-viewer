import * as domUtils from './domUtils.js';

export class MultiVideoPlayer {
    constructor(cloneVideoElementId, volumeControlElementId, timelineElementId) {
        this.videos = [];
        this.videoCount = 1;
        this.selectedVideo = null;
        this.isLoading = false;
        this.INITIAL_VOLUME = 0.5;
        this.cloneVideo = document.getElementById(cloneVideoElementId);
        this.volumeControl = document.getElementById(volumeControlElementId);
        this.timeline = document.getElementById(timelineElementId);

        this.volumeControl.addEventListener("input", (event) => {
            if (this.selectedVideo) {
                this.selectedVideo.volume = parseFloat(event.target.value);
            }
        });

        this.timeline.addEventListener('input', () => {
            if (!this.selectedVideo) return;
            const time = (this.timeline.value / 100) * this.selectedVideo.duration;
            this.selectedVideo.currentTime = time;
            this.syncVideo();
        });

        this.cloneVideo.addEventListener('timeupdate', () => {
            if (!this.selectedVideo) return;
            const progress = (this.selectedVideo.currentTime / this.selectedVideo.duration) * 100;
            this.timeline.value = progress;
        });
    }

    removeHUDWelcome() {
        const videoLayout = document.querySelector(".video-layout");
        videoLayout.classList.remove("hide");

        const welcomeLayout = document.querySelector(".welcome-layout");
        welcomeLayout.classList.add("hide");
    }

    importVideos(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const videoURL = URL.createObjectURL(file);
            this.addVideo(videoURL, file.name);
        }

        this.removeHUDWelcome();
    }

    addVideo(videoURL, videoName) {
        const video = document.createElement("video");
        video.src = videoURL;
        video.preload = "auto";
        video.controls = false;
        video.volume = 0;

        if (!this.cloneVideo.srcObject) {
            const stream = video.captureStream();
            this.cloneVideo.srcObject = stream;
            this.cloneVideo.play();
            this.cloneVideo.muted = true;
            this.selectedVideo = video;
            video.volume = this.INITIAL_VOLUME;
        }

        const videoWrapper = document.createElement("div");
        videoWrapper.className = "video-wrapper unfocused";
        videoWrapper.style.position = "relative";
        videoWrapper.appendChild(video);

        const label = document.createElement("small");
        label.textContent = videoName;
        videoWrapper.appendChild(label);

        const numberLabel = document.createElement("div");
        numberLabel.className = "video-number";
        numberLabel.textContent = this.videoCount;
        videoWrapper.appendChild(numberLabel);

        const unfocused = document.querySelector(".unfocused-videos");
        unfocused.appendChild(videoWrapper);

        this.videos.push({
            video: video,
            videoCount: this.videoCount,
            delay: 0
        });

        video.dataset.videoCount = this.videoCount;
        video.dataset.delay = 0;

        this.videoCount++;

        video.addEventListener("loadstart", () => {
            this.isLoading = true;
            this.pauseOtherVideos(video);
        });

        video.addEventListener("canplay", () => {
            this.isLoading = false;
        });
    }

    pauseOtherVideos(currentVideo) {
        this.videos.forEach((item) => {
            if (item.video !== currentVideo) {
                item.video.pause();
            }
        });
    }

    togglePlay() {
        const allPaused = this.videos.every((item) => item.video.paused);

        this.videos.forEach((item) => (allPaused ? item.video.play() : item.video.pause()));
        if (allPaused) {
            this.cloneVideo.play();
        } else {
            this.cloneVideo.pause();
        }
    }

    pauseAllVideos() {
        this.videos.forEach((item) => item.video.pause());
        this.cloneVideo.pause();
    }

    playAllVideos() {
        this.videos.forEach((item) => item.video.play());
        this.cloneVideo.play();
    }

    goBack(seconds) {
        this.pauseAllVideos();
        this.videos.forEach((item) => (item.video.currentTime = item.video.currentTime - seconds));
    }

    goForward(seconds) {
        this.pauseAllVideos();
        this.videos.forEach((item) => (item.video.currentTime = item.video.currentTime + seconds));
    }

    resetVolumes() {
        this.videos.forEach((item) => (item.video.volume = 0));
        this.cloneVideo.volume = 0;
    }

    updateFocus(clickedVideo) {
        this.resetZoom();

        if (typeof clickedVideo === "number") {
            const videoToFocus = this.videos.find(
                (item) => item.videoCount == clickedVideo
            );
            if (videoToFocus) {
                clickedVideo = videoToFocus.video;
            } else {
                return;
            }
        }

        const stream = clickedVideo.captureStream();
        this.cloneVideo.srcObject = stream;
        this.cloneVideo.currentTime = clickedVideo.currentTime;
        this.cloneVideo[clickedVideo.paused ? 'pause' : 'play']();

        const volume = this.selectedVideo ? this.selectedVideo.volume : 0.5;
        this.resetVolumes();
        this.selectedVideo = clickedVideo;
        this.selectedVideo.volume = volume;
        this.volumeControl.value = volume;
    }

    toggleZoom() {
        const zoom = document.querySelector("#zoom");

        let currentScale = parseFloat(
            getComputedStyle(this.cloneVideo).transform.split("(")[1]
        );
        const newScale = currentScale === 1 ? 2.3 : 1;

        // update icon
        zoom.innerHTML = currentScale === 1 ? "zoom_out" : "zoom_in";

        this.cloneVideo.style.transformOrigin = "left top";
        this.cloneVideo.style.transform = `scale(${newScale})`;
    }

    resetZoom() {
        this.cloneVideo.style.transformOrigin = "left top";
        this.cloneVideo.style.transform = `scale(1)`;

        // Update icon
        const zoom = document.querySelector("#zoom");
        zoom.innerHTML = "zoom_in";
    }

    syncVideo() {
        if (!this.selectedVideo) return;
        const videosElements = document.querySelectorAll('.unfocused.video-wrapper video');
        videosElements.forEach((video) => {
            const delay = parseInt(video.dataset.delay);
            video.currentTime = this.selectedVideo.currentTime + delay;
        });
    }

    handleDelayChange(event, videoElement) {
        const delayValue = parseInt(event.target.value);
        videoElement.dataset.delay = delayValue;
        this.syncVideo();
    }

    toggleSync() {
        const videoWrappers = document.querySelectorAll('.unfocused.video-wrapper');

        const hasExistingInputs = Array.from(videoWrappers).some(
            wrapper => wrapper.querySelector('input[name="delay"]')
        );

        if (hasExistingInputs) {
            videoWrappers.forEach(videoWrapper => { domUtils.removeSyncInput(videoWrapper) });
        } else {
            videoWrappers.forEach(videoWrapper => domUtils.addSyncInput(videoWrapper, this.handleDelayChange.bind(this)));
        }

        const syncIcon = document.querySelector("#sync-mode");
        syncIcon.classList.toggle("contrast");
    }
}
