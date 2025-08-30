class UIManager {
  constructor(videoManager, nameManager) {
    this.videoManager = videoManager;
    this.nameManager = nameManager;
    this.volumeControl = document.getElementById("volume-control");
    this.timeline = document.getElementById("timeline-control");
    this.drawingCanvas = new DrawingCanvas();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Volume control
    this.volumeControl.addEventListener("input", (event) => {
      const selectedVideo = this.videoManager.getSelectedVideo();
      if (selectedVideo) {
        selectedVideo.volume = parseFloat(event.target.value);
      }
    });

    // Timeline control
    this.timeline.addEventListener('input', () => {
      const selectedVideo = this.videoManager.getSelectedVideo();
      if (!selectedVideo) return;

      const time = (this.timeline.value / 100) * selectedVideo.duration;

      new Promise((resolve, reject) => {
        selectedVideo.addEventListener('seeked', () => {
          resolve();
        }, { once: true });

        try {
          selectedVideo.currentTime = time;
        } catch (error) {
          reject(new Error(`Failed to seek video: ${error.message}`));
        }
      })
        .then(() => {
          return this.videoManager.syncVideo();
        })
        .catch(error => {
          console.error('Timeline seek failed:', error);
        });
    });

    // Clone video timeupdate for timeline
    this.videoManager.getCloneVideo().addEventListener('timeupdate', () => {
      const selectedVideo = this.videoManager.getSelectedVideo();
      if (!selectedVideo) return;

      const progress = (selectedVideo.currentTime / selectedVideo.duration) * 100;
      this.timeline.value = progress;
    });

    // Keyboard shortcuts
    window.addEventListener("keydown", (event) => this.handleKeyDown(event));
  }

  handleKeyDown(event) {
    if (event.code === "Space") {
      event.preventDefault();
      this.videoManager.togglePlay();
    } else if (event.code === "ArrowRight") {
      event.preventDefault();
      this.videoManager.seek(true, 10);
    } else if (event.code === "ArrowLeft") {
      event.preventDefault();
      this.videoManager.seek(false, 10);
    } else if (
      event.code.startsWith("Digit") ||
      event.code.startsWith("Numpad")
    ) {
      const digit = parseInt(event.key);
      if (digit >= 0 && digit <= 9) {
        event.preventDefault();
        this.videoManager.updateFocus(digit);
      }
    } else if (event.code === "KeyD") {
      this.drawingCanvas.toggleCanvas();
    } else if (event.code === "KeyZ") {
      this.toggleZoom();
    } else if (event.code === "KeyS") {
      this.videoManager.syncVideo();
    }
  }

  importVideos() {
    const input = document.getElementById("video-import");
    const files = input.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const videoURL = URL.createObjectURL(file);
      const videoName = this.nameManager.tryFindPlayerName(file.name);
      const video = this.videoManager.addVideo(videoURL, videoName);
      this.createVideoWrapper(video, videoName);
    }

    this.removeHUDWelcome();
  }

  createVideoWrapper(video, videoName) {
    const videoWrapper = document.createElement("div");
    videoWrapper.className = "video-wrapper unfocused";
    videoWrapper.style.position = "relative";
    videoWrapper.appendChild(video);

    const label = document.createElement("small");
    label.textContent = videoName;
    videoWrapper.appendChild(label);

    const numberLabel = document.createElement("div");
    numberLabel.className = "video-number";
    numberLabel.textContent = video.dataset.videoCount;
    videoWrapper.appendChild(numberLabel);

    const unfocused = document.querySelector(".unfocused-videos");
    unfocused.appendChild(videoWrapper);

    video.addEventListener("click", (event) => {
      this.videoManager.updateFocus(event.target);
      this.updateSelectedVideoLabel(video.dataset.name);
    });
  }

  removeHUDWelcome() {
    const videoLayout = document.querySelector(".video-layout");
    videoLayout.classList.remove("hide");

    const welcomeLayout = document.querySelector(".welcome-layout");
    welcomeLayout.classList.add("hide");
  }

  toggleZoom() {
    const zoom = document.querySelector("#zoom");
    const cloneVideo = this.videoManager.getCloneVideo();

    let currentScale = parseFloat(
      getComputedStyle(cloneVideo).transform.split("(")[1]
    );
    const newScale = currentScale === 1 ? 2.3 : 1;

    // update icon
    zoom.innerHTML = currentScale === 1 ? "zoom_out" : "zoom_in";

    cloneVideo.style.transformOrigin = "left top";
    cloneVideo.style.transform = `scale(${newScale})`;
  }

  resetZoom() {
    const cloneVideo = this.videoManager.getCloneVideo();
    cloneVideo.style.transformOrigin = "left top";
    cloneVideo.style.transform = `scale(1)`;

    // Update icon
    const zoom = document.querySelector("#zoom");
    zoom.innerHTML = "zoom_in";
  }

  updateFocus(clickedVideo) {
    this.resetZoom();
    this.videoManager.updateFocus(clickedVideo);
    this.volumeControl.value = this.videoManager.getSelectedVideo().volume;
  }

  updateSelectedVideoLabel(name) {
    document.querySelector('#cloneVideo').parentElement.querySelector('small').textContent = name;
  }

  toggleSync() {
    const videoWrappers = document.querySelectorAll('.unfocused.video-wrapper');

    const hasExistingInputs = Array.from(videoWrappers).some(
      wrapper => wrapper.querySelector('input[name="delay"]')
    );

    if (hasExistingInputs) {
      videoWrappers.forEach(videoWrapper => this.removeSyncInput(videoWrapper));
    } else {
      videoWrappers.forEach(videoWrapper => this.addSyncInput(videoWrapper));
    }

    const syncIcon = document.querySelector("#sync-mode");
    syncIcon.classList.toggle("contrast");
  }

  addSyncInput(videoWrapper) {
    const delayInput = document.createElement('input');
    delayInput.type = 'number';
    delayInput.name = 'delay';
    delayInput.placeholder = 'Delay (s)';
    delayInput.setAttribute('aria-label', 'Delay (s)');

    if (videoWrapper.querySelector('video').dataset.delay !== '0') {
      delayInput.value = parseInt(videoWrapper.querySelector('video').dataset.delay)
    }

    const syncInputBgDiv = document.createElement('div');
    syncInputBgDiv.classList.add('sync-input-bg');

    const videoElement = videoWrapper.querySelector('video');

    videoWrapper.insertBefore(delayInput, videoElement);
    videoWrapper.insertBefore(syncInputBgDiv, videoElement);

    delayInput.addEventListener('input', (event) => {
      this.handleDelayChange(event, videoElement);
    });

    delayInput.addEventListener('change', (event) => {
      this.handleDelayChange(event, videoElement);
    });
  }

  removeSyncInput(videoWrapper) {
    const delayInput = videoWrapper.querySelector('input[name="delay"]');
    const syncBgDiv = videoWrapper.querySelector('.sync-input-bg');

    if (delayInput && syncBgDiv) {
      videoWrapper.removeChild(delayInput);
      videoWrapper.removeChild(syncBgDiv);
    }
  }

  handleDelayChange(event, videoElement) {
    const delayValue = parseInt(event.target.value);
    videoElement.dataset.delay = delayValue;
    this.videoManager.syncVideo();
  }
}