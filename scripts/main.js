import { DrawingCanvas } from './canva.js';
import { MultiVideoPlayer } from './multiVideoPlayer.js';

// Initialize modules
const drawingCanvas = new DrawingCanvas();
const multiVideoPlayer = new MultiVideoPlayer('cloneVideo', 'volume-control', 'timeline-control');

// Function to expose importVideos to the global scope
window.importVideos = () => {
    const input = document.getElementById("video-import");
    const files = input.files;
    multiVideoPlayer.importVideos(files);
};

// UI Event Listeners (replacing onclick attributes)
document.querySelector('[data-target="modal-upload"]').addEventListener('click', (event) => {
    toggleModal(event);
});

document.getElementById('edit').addEventListener('click', () => {
    drawingCanvas.toggleCanvas();
});

document.querySelector('[id="zoom"]').addEventListener('click', () => {
    multiVideoPlayer.toggleZoom();
});

document.getElementById('sync-mode').addEventListener('click', () => {
    multiVideoPlayer.toggleSync();
});

// Add event listener for sync button
document.querySelector('.play-controls button:nth-child(1)').addEventListener('click', () => {
    console.log('sync');
    multiVideoPlayer.syncVideo();
});

// Add event listeners for fast rewind and forward buttons
document.querySelector('.play-controls button:nth-child(2)').addEventListener('click', () => {
    multiVideoPlayer.goBack(60);
    console.log('b60');

});

document.querySelector('.play-controls button:nth-child(3)').addEventListener('click', () => {
    multiVideoPlayer.goBack(10);
    console.log('b10');

});

document.querySelector('.play-controls button:nth-child(4)').addEventListener('click', () => {
    multiVideoPlayer.togglePlay();
    console.log('9');

});

document.querySelector('.play-controls button:nth-child(5)').addEventListener('click', () => {
    multiVideoPlayer.goForward(10);
    console.log('f10');

});

document.querySelector('.play-controls button:nth-child(6)').addEventListener('click', () => {
    multiVideoPlayer.goForward(60);
    console.log('f60');

});

document.querySelector('[data-target="modal-example"]').addEventListener('click', (event) => {
    toggleModal(event);
});

// Add keydown event listener
window.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
        event.preventDefault();
        multiVideoPlayer.togglePlay();
    } else if (event.code === "ArrowRight") {
        event.preventDefault();
        multiVideoPlayer.goForward(10);
    } else if (event.code === "ArrowLeft") {
        event.preventDefault();
        multiVideoPlayer.goBack(10);
    } else if (
        event.code.startsWith("Digit") ||
        event.code.startsWith("Numpad")
    ) {
        const digit = parseInt(event.key);
        if (digit >= 0 && digit <= 9) {
            event.preventDefault();
            multiVideoPlayer.updateFocus(digit);
        }
    } else if (event.code === "KeyD") {
        drawingCanvas.toggleCanvas();
    } else if (event.code === "KeyZ") {
        multiVideoPlayer.toggleZoom();
    } else if (event.code === "KeyS") {
        multiVideoPlayer.syncVideo();
    }
});

// UI Event Listeners (replacing onclick attributes)
document.querySelector('[data-target="modal-upload"]').addEventListener('click', (event) => {
    toggleModal(event);
});

document.getElementById('edit').addEventListener('click', () => {
    drawingCanvas.toggleCanvas();
});

document.querySelector('[id="zoom"]').addEventListener('click', () => {
    multiVideoPlayer.toggleZoom();
});

document.getElementById('sync-mode').addEventListener('click', () => {
    multiVideoPlayer.toggleSync();
});

document.querySelector('[data-target="modal-example"]').addEventListener('click', (event) => {
    toggleModal(event);
});
