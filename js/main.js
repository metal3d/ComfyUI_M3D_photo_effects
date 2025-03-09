import { app } from "../../scripts/app.js";

class M3DGraphView {
  constructor(node) {
    // styles...
    const colors = this.getComputedColors();
    this.node = node;
    this.cruveStrokeWidth = 0.01;
    this.curveColor = colors.red;
    this.gridLineWidth = 0.001;
    this.gridColor = colors.gray;
    this.borderLineWidth = 0.005;
    this.borderColor = colors.gray;
    this.dashArray = "0.01, 0.01";

    this.svgElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    // ensure the path that is from 0 to 1 will be scaled to the svg size
    this.svgElement.setAttribute("viewBox", "0 0 1 1");
    this.node.addDOMWidget("MD3graphView", "svg", this.svgElement);

    this.drawGrid();

    // add a path
    this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    // set the path line width to 1px
    this.path.setAttribute("stroke-width", this.cruveStrokeWidth);
    this.path.setAttribute("fill", "none");
    this.path.setAttribute("stroke", this.curveColor);
    this.path.setAttribute("stroke-linecap", "round");
    this.svgElement.appendChild(this.path);

    // when values changed
    node.widgets.forEach((widget) => {
      widget.callback = () => {
        this.drawCurve(); // draw the curve
      };
    });
    this.drawCurve();
  }

  getComputedColors() {
    // the the --error-text color from the computed style of html element
    return {
      red: document.documentElement.style.getPropertyValue("--error-text"),
      gray: document.documentElement.style.getPropertyValue("--descrip-text"),
    };
  }

  drawGrid() {
    const border = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    border.setAttribute("stroke", this.borderColor);
    border.setAttribute("stroke-width", this.borderLineWidth);
    border.setAttribute("fill", "none");
    // from 0 to 1
    border.setAttribute("x", 0);
    border.setAttribute("y", 0);
    border.setAttribute("width", 1);
    border.setAttribute("height", 1);
    this.svgElement.appendChild(border);

    for (let x = 0.2; x < 1; x += 0.2) {
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("x1", x);
      line.setAttribute("y1", 0);
      line.setAttribute("x2", x);
      line.setAttribute("y2", 1);
      line.setAttribute("stroke", this.gridColor);
      line.setAttribute("stroke-width", this.gridLineWidth);
      line.setAttribute("stroke-dasharray", this.dashArray);
      this.svgElement.appendChild(line);
    }

    for (let y = 0.2; y < 1; y += 0.2) {
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("x1", 0);
      line.setAttribute("y1", y);
      line.setAttribute("x2", 1);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", this.gridColor);
      line.setAttribute("stroke-width", this.gridLineWidth);
      line.setAttribute("stroke-dasharray", this.dashArray);
      this.svgElement.appendChild(line);
    }
  }

  drawCurve() {
    const k = this.node.widgets[0].value; // slope
    const b = this.node.widgets[1].value; // offset (shadow_offest)

    const numStep = 100;
    const xValues = Array.from(
      { length: numStep },
      (_, i) => i / (numStep - 1),
    );

    this.path.setAttribute("stroke", this.curveColor);
    let pathDraw = "M 0 1 ";
    xValues.forEach((x, _) => {
      const t = this.ntanh(x, k, b);
      pathDraw += `L ${x} ${1 - t} `;
    });
    this.path.setAttribute("d", `${pathDraw}`);
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
}

app.registerExtension({
  name: "m3d.photo.effects",
  async nodeCreated(node) {
    switch (node.comfyClass) {
      case "Bleach Bypass":
      case "RGB Curve":
        try {
          new M3DGraphView(node); // retgister a graph element in the node
          node.size[1] = Math.max(node.size[1], 350); // set a minimum height to display the graph
        } catch (error) {
          console.error(error);
        }
        break;
    }
  },
});
