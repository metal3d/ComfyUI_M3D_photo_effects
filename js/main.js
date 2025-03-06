import { app } from "../../scripts/app.js";

class M3DDrawGraph {
  constructor(node) {
    this.node = node;
    console.dir(node);
    // preare a div with a canvas inside. The canvas will be used to draw the curve,
    // the div (container) is used to center the canvas and ease the rescale.
    this.canvas = document.createElement("canvas");
    this.canvas.classList.add("m3d-graph-canvas");

    // Observer to resize the canvas when the parent div is resized
    // Maybe this is not necessary... there is a "onResize" method on the node,
    // but it's not well docummented for the moment.
    const observer = new ResizeObserver(() => {
      this.drawGrid();
      this.drawCurve();
      node.setDirtyCanvas();
    });
    observer.observe(this.canvas);

    // register the callback to draw the curve
    node.widgets.forEach((widget) => {
      widget.callback = () => {
        this.drawGrid(); // reset the canvas and draw the grid
        this.drawCurve(); // draw the curve
        node.setDirtyCanvas();
      };
    });

    // register the widget to the node
    node.addDOMWidget("graph", "canvas", this.canvas);
  }

  /**
   * Parametric tanh function, as it is developed in the Python node.
   */
  tanh(x, k, b) {
    return Math.tanh(k * (x - b));
  }

  /**
   * Normalized tanh function, as it is developed in the Python node.
   */
  ntanh(x, k, b) {
    const tanh = this.tanh;
    return (tanh(x, k, b) - tanh(0, k, b)) / (tanh(1, k, b) - tanh(0, k, b));
  }

  /**
   * return the scaled size of the canvas
   */
  getCorrectCanvasSize() {
    const canvas = this.canvas;
    const rect = canvas.getBoundingClientRect();

    const computedStyle = window.getComputedStyle(canvas);
    const transform = computedStyle.transform; // Example : "matrix(1.21, 0, 0, 1.21, 0, 0)"

    let scale = 1;
    if (transform?.startsWith("matrix")) {
      const values = transform.match(/matrix\(([^,]*)/);
      if (values?.length > 1) {
        scale = parseFloat(values[1]);
      }
    }

    return {
      width: rect.width,
      height: rect.height,
      scale: scale,
    };
  }

  /**
   * Prepare teh canvas, clear and draw a grid
   */
  drawGrid() {
    const ctx = this.canvas.getContext("2d");
    const { width, height } = this.getCorrectCanvasSize();
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    ctx.reset();

    ctx.lineWidth = 1;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // draw a grid in the context
    const stepX = w / 5;
    const stepY = h / 5;

    ctx.save();
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--fg-color")
      .trim();
    for (let x = 0; x < w; x += stepX) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(w, h);
    ctx.stroke();

    for (let y = 0; y < h; y += stepY) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w, h);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw the curve of the function
   */
  drawCurve() {
    const ctx = this.canvas.getContext("2d");
    ctx.save();
    ctx.strokeStyle = "rgba(255, 0, 0, 1)";
    ctx.lineWidth = 4;
    const numStep = 100;
    // build an array of X values from 0 to 1 with numStep steps
    const xValues = Array.from(
      { length: numStep },
      (_, i) => i / (numStep - 1),
    );
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, h);

    const k = this.node.widgets[0].value; // slope
    const b = this.node.widgets[1].value; // offset (shadow_offest)

    xValues.forEach((x, _) => {
      const t = this.ntanh(x, k, b);
      ctx.lineTo(x * w, (1 - t) * h);
      ctx.stroke();
    });
    ctx.restore();
  }
}

app.registerExtension({
  name: "m3d.photo.effects",
  node: null,
  async setup() {
    // add m3d-flex-element css class on top
    document.head.innerHTML += `
    <style>
      .m3d-graph-canvas {
        aspect-ratio: 1 / 1;
      }
    </style>
    `;
  },
  async nodeCreated(node) {
    if (node.comfyClass != "Bleach Bypass") {
      return;
    }
    try {
      new M3DDrawGraph(node); // retgister a graph element in the node
      node.size[1] = Math.max(node.size[1], 350); // set a minimum height to display the graph
    } catch (error) {
      console.error(error);
    }
  },
});
