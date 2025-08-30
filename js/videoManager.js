class VideoManager {
  constructor() {
    this.videos = [];
    this.selectedVideo = null;
    this.isLoading = false;
    this.videoCount = 1;
    this.cloneVideo = document.getElementById('cloneVideo');
    this.INITIAL_VOLUME = 0.5;
  }

  addVideo(videoURL, videoName) {
    const video = document.createElement("video");
    video.src = videoURL;
    video.preload = "auto";
    video.controls = false;
    video.volume = 0;
    video.dataset.videoCount = this.videoCount;
    video.dataset.delay = 0;
    video.dataset.name = videoName;

    if (!this.cloneVideo.srcObject) {
      const stream = video.captureStream();
      this.cloneVideo.srcObject = stream;
      this.cloneVideo.play();
      this.cloneVideo.muted = true;
      this.updateSelectedVideo(video);
      video.volume = this.INITIAL_VOLUME;
    }

    this.videos.push({
      video: video,
      videoCount: this.videoCount,
      delay: 0
    });

    this.videoCount++;

    video.addEventListener("loadstart", () => {
      this.isLoading = true;
      this.pauseOtherVideos(video);
    });

    video.addEventListener("canplay", () => {
      this.isLoading = false;
    });

    return video;
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

  async seek(isForward, seconds) {
    if (!Number.isFinite(seconds)) {
      throw new Error('Seconds must be a valid number');
    }

    const wasPlaying = !this.cloneVideo.paused;
    if (wasPlaying) {
      this.pauseAllVideos();
    }

    const seekPromises = this.videos.map(video => {
      return new Promise((resolve, reject) => {
        video.video.addEventListener('seeked', () => resolve(), { once: true });

        try {
          const newTime = isForward ?
            Math.min(video.video.currentTime + seconds, video.video.duration) :
            Math.max(0, video.video.currentTime - seconds);

          video.video.currentTime = newTime;
        } catch (error) {
          reject(new Error(`Failed to seek video: ${error.message}`));
        }
      });
    });

    try {
      await Promise.all(seekPromises);
      if (wasPlaying) {
        this.playAllVideos();
      }
    } catch (error) {
      console.error('Video seek failed:', error);
    }
  }

  resetVolumes() {
    this.videos.forEach((item) => (item.video.volume = 0));
    this.cloneVideo.volume = 0;
  }

  updateFocus(clickedVideo) {
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
    this.updateSelectedVideo(clickedVideo);
    this.selectedVideo.volume = volume;
  }

  syncVideo() {
    const videosElements = document.querySelectorAll('.unfocused.video-wrapper video');
    videosElements.forEach((video) => {
      const delay = parseInt(video.dataset.delay);
      video.currentTime = this.selectedVideo.currentTime + delay;
    });
  }

  updateSelectedVideo(video) {
    this.selectedVideo = video;
  }

  getSelectedVideo() {
    return this.selectedVideo;
  }

  getVideos() {
    return this.videos;
  }

  getCloneVideo() {
    return this.cloneVideo;
  }
}