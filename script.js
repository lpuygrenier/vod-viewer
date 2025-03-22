let selectedVideo = null;
let videos = [];
let isLoading = false;
let videoCount = 1;
const volumeControl = document.getElementById("volume-control");
const timeline = document.getElementById("timeline-control");
const cloneVideo = document.getElementById('cloneVideo');
const INITIAL_VOLUME = 0.5;


const drawingCanvas = new DrawingCanvas();

function removeHUDWelcome() {
  const videoLayout = document.querySelector(".video-layout");
  videoLayout.classList.remove("hide");

  const welcomeLayout = document.querySelector(".welcome-layout");
  welcomeLayout.classList.add("hide");
}

function importVideos() {
  const input = document.getElementById("video-import");
  const files = input.files;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const videoURL = URL.createObjectURL(file);
    addVideo(videoURL, file.name);
  }

  removeHUDWelcome();
}

function addVideo(videoURL, videoName) {
  const video = document.createElement("video");
  video.src = videoURL;
  video.preload = "auto";
  video.controls = false;
  video.volume = 0;

  if (!cloneVideo.srcObject) {
    const stream = video.captureStream();
    cloneVideo.srcObject = stream;
    cloneVideo.play();
    cloneVideo.muted = true;
    selectedVideo = video;
    video.volume = INITIAL_VOLUME;
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
  numberLabel.textContent = videoCount;
  videoWrapper.appendChild(numberLabel);

  const unfocused = document.querySelector(".unfocused-videos");
  unfocused.appendChild(videoWrapper);

  videos.push({
    video: video,
    videoCount: videoCount,
    delay: 0
  });

  video.dataset.videoCount = videoCount;
  video.dataset.delay = 0;

  videoCount++;


  video.addEventListener("loadstart", () => {
    isLoading = true;
    pauseOtherVideos(video);
  });

  video.addEventListener("canplay", () => {
    isLoading = false;
  });
}

function pauseOtherVideos(currentVideo) {
  videos.forEach((item) => {
    if (item.video !== currentVideo) {
      item.video.pause();
    }
  });
}

function togglePlay() {
  const allPaused = videos.every((item) => item.video.paused);

  videos.forEach((item) => (allPaused ? item.video.play() : item.video.pause()));
  if (allPaused) {
    cloneVideo.play();
  } else {
    cloneVideo.pause();
  }

}

function pauseAllVideos() {
  videos.forEach((item) => item.video.pause());
  cloneVideo.pause();
}

function playAllVideos() {
  videos.forEach((item) => item.video.play());
  cloneVideo.play();
}

function goBack(seconds) {
  pauseAllVideos();
  videos.forEach((item) => (item.video.currentTime = item.video.currentTime - seconds));
}

function goForward(seconds) {
  pauseAllVideos();
  videos.forEach((item) => (item.video.currentTime = item.video.currentTime + seconds));
}

function resetVolumes() {
  videos.forEach((item) => (item.video.volume = 0));
  cloneVideo.volume = 0;
}

function updateFocus(clickedVideo) {
  resetZoom();

  if (typeof clickedVideo === "number") {
    const videoToFocus = videos.find(
      (item) => item.videoCount == clickedVideo
    );
    if (videoToFocus) {
      clickedVideo = videoToFocus.video;
    } else {
      return;
    }
  }

  const stream = clickedVideo.captureStream();
  cloneVideo.srcObject = stream;
  cloneVideo.currentTime = clickedVideo.currentTime;
  cloneVideo[clickedVideo.paused ? 'pause' : 'play']();

  const volume = selectedVideo ? selectedVideo.volume : 0.5;
  resetVolumes();
  selectedVideo = clickedVideo;
  selectedVideo.volume = volume;
  volumeControl.value = volume;
}

volumeControl.addEventListener("input", (event) => {
  if (selectedVideo) {
    selectedVideo.volume = parseFloat(event.target.value);
  }
});

function toggleZoom() {
  const zoom = document.querySelector("#zoom");

  let currentScale = parseFloat(
    getComputedStyle(cloneVideo).transform.split("(")[1]
  );
  const newScale = currentScale === 1 ? 2.3 : 1;

  // update icon
  zoom.innerHTML = currentScale === 1 ? "zoom_out" : "zoom_in";

  cloneVideo.style.transformOrigin = "left top";
  cloneVideo.style.transform = `scale(${newScale})`;
}

function resetZoom() {
  cloneVideo.style.transformOrigin = "left top";
    cloneVideo.style.transform = `scale(1)`;
    
  // Update icon
  const zoom = document.querySelector("#zoom");
  zoom.innerHTML = "zoom_in";
}

function syncVideo() {
  const videosElements = document.querySelectorAll('.unfocused.video-wrapper video');
  videosElements.forEach((video) => {
      const delay = parseInt(video.dataset.delay);
      video.currentTime = selectedVideo.currentTime + delay;
    }
  );
}

function addSyncInput(videoWrapper) {
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

  delayInput.addEventListener('input', function(event) {
    handleDelayChange(event, videoElement);
  });

  delayInput.addEventListener('change', function(event) {
    handleDelayChange(event, videoElement);
  });
}

function removeSyncInput(videoWrapper) {
  const delayInput = videoWrapper.querySelector('input[name="delay"]');
  const syncBgDiv = videoWrapper.querySelector('.sync-input-bg');
  
  if (delayInput && syncBgDiv) {
    videoWrapper.removeChild(delayInput);
    videoWrapper.removeChild(syncBgDiv);
  }
}

function handleDelayChange (event, videoElement) {
  const delayValue = parseInt(event.target.value);
  videoElement.dataset.delay = delayValue;
  syncVideo();
}

function toggleSync() {
  const videoWrappers = document.querySelectorAll('.unfocused.video-wrapper');
  
  const hasExistingInputs = Array.from(videoWrappers).some(
      wrapper => wrapper.querySelector('input[name="delay"]')
  );
  
  if (hasExistingInputs) {
      videoWrappers.forEach(videoWrapper => { removeSyncInput(videoWrapper)});
  } else {
      videoWrappers.forEach(videoWrapper => addSyncInput(videoWrapper));
  }

  const syncIcon = document.querySelector("#sync-mode");
  syncIcon.classList.toggle("contrast");
}
window.addEventListener("keydown", function (event) {
  if (event.code === "Space") {
    event.preventDefault();
    togglePlay();
  } else if (event.code === "ArrowRight") {
    event.preventDefault();
    goForward(10);
  } else if (event.code === "ArrowLeft") {
    event.preventDefault();
    goBack(10);
  } else if (
    event.code.startsWith("Digit") ||
    event.code.startsWith("Numpad")
  ) {
    const digit = parseInt(event.key);
    if (digit >= 0 && digit <= 9) {
      event.preventDefault();
      updateFocus(digit);
    }
  } else if (event.code === "KeyD") {
    drawingCanvas.toggleCanvas();
  } else if (event.code === "KeyZ") {
    toggleZoom();
  } else if (event.code === "KeyS") {
    syncVideo();
  }
});

cloneVideo.addEventListener('timeupdate', () => {
  const progress = (selectedVideo.currentTime / selectedVideo.duration) * 100;
  timeline.value = progress;
});

timeline.addEventListener('input', () => {
  const time = (timeline.value / 100) * selectedVideo.duration;
  selectedVideo.currentTime = time;
  syncVideo();
});
