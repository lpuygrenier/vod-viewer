export function addSyncInput(videoWrapper, handleDelayChange) {
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

    delayInput.addEventListener('input', function (event) {
        handleDelayChange(event, videoElement);
    });

    delayInput.addEventListener('change', function (event) {
        handleDelayChange(event, videoElement);
    });
}

export function removeSyncInput(videoWrapper) {
    const delayInput = videoWrapper.querySelector('input[name="delay"]');
    const syncBgDiv = videoWrapper.querySelector('.sync-input-bg');

    if (delayInput && syncBgDiv) {
        videoWrapper.removeChild(delayInput);
        videoWrapper.removeChild(syncBgDiv);
    }
}
