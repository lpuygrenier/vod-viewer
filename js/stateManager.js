class StateManager {
  constructor() {
    this.state = {
      isDrawing: false,
      zoomLevel: 1,
      syncMode: false
    };
  }

  getState(key) {
    return this.state[key];
  }

  setState(key, value) {
    this.state[key] = value;
  }

  toggleState(key) {
    this.state[key] = !this.state[key];
  }

  resetZoom() {
    this.setState('zoomLevel', 1);
  }

  toggleZoom() {
    this.setState('zoomLevel', this.getState('zoomLevel') === 1 ? 2.3 : 1);
  }

  toggleSyncMode() {
    this.toggleState('syncMode');
  }

  getZoomLevel() {
    return this.getState('zoomLevel');
  }

  isSyncMode() {
    return this.getState('syncMode');
  }
}