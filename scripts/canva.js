export class DrawingCanvas {
    constructor() {
      this.canvas = document.getElementById("drawingCanvas");
      this.ctx = this.canvas.getContext("2d");
      this.isDrawing = false;
      this.lastX = 0;
      this.lastY = 0;
  
      this.setupCanvas();
      this.bindEvents();
      this.hideCanvas();
    }
  
    setupCanvas() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
  
      // Set background opacity to 0.1
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  
      // Set pencil opacity to 1
      this.ctx.strokeStyle = "rgba(255, 255, 0, 1)";
      this.ctx.lineWidth = 4;
      this.ctx.lineCap = "round";
    }
  
    bindEvents() {
      // Drawing events
      this.canvas.addEventListener("mousedown", (e) => {
        this.startDrawing(e);
      });
      this.canvas.addEventListener("mousemove", (e) => {
        this.draw(e);
      });
      this.canvas.addEventListener("mouseup", () => {
        this.stopDrawing();
      });
      this.canvas.addEventListener("mouseout", () => {
        this.stopDrawing();
      });
    }
  
    toggleCanvas() {
      const isVisible = this.canvas.style.display !== "none";
      this.canvas.style.display = isVisible ? "none" : "block";
  
      if (!isVisible) {
        this.setupCanvas();
      }
  
      // Update edit icon
      const edit_icon = document.querySelector("#edit");
      edit_icon.classList.toggle("contrast");
  
      // update all buttons to put them disabled except edit button
      const buttons = document.querySelectorAll("button:not(#edit)");
      buttons.forEach(button => button.disabled = !button.disabled);
  
      const inputs = document.querySelectorAll("input");
      inputs.forEach(input => input.disabled = !input.disabled);
    }
  
    hideCanvas() {
      this.canvas.style.display = "none";
      this.visible = false;
    }
  
    startDrawing(e) {
      this.isDrawing = true;
      [this.lastX, this.lastY] = this.getMousePos(e);
    }
  
    draw(e) {
      if (!this.isDrawing) return;
  
      const [currentX, currentY] = this.getMousePos(e);
  
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(currentX, currentY);
      this.ctx.stroke();
  
      [this.lastX, this.lastY] = [currentX, currentY];
    }
  
    stopDrawing() {
      this.isDrawing = false;
    }
  
    getMousePos(e) {
      const rect = this.canvas.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    }
  }
  