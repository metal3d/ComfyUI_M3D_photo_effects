/**
 * An SVG plot curve thar react to some widgets in the node.
 * At this time, it's made for Bleach Bypass and RGB Curves nodes.
 */
export class M3DCurveGraph {
  constructor(node, factorWidget = "slope", offsetWidget = "shadow_offset") {
    // get the slope and offset widgets to read values from
    this.factorWidget = null;
    this.offsetWidget = null;
    node.widgets.forEach((widget) => {
      switch (widget.name) {
        case factorWidget:
          this.factorWidget = widget;
          break;
        case offsetWidget:
          this.offsetWidget = widget;
          break;
      }
    });
    // color and graph conifguration
    const colors = this.getComputedColors();
    this.node = node;
    this.cruveStrokeWidth = 0.01;
    this.curveColor = colors.red;
    this.gridLineWidth = 0.001;
    this.gridColor = colors.gray;
    this.borderLineWidth = 0.005;
    this.borderColor = colors.gray;
    this.dashArray = "0.01, 0.01";

    // build the SVG widget
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
    this.path.setAttribute("stroke-width", this.cruveStrokeWidth);
    this.path.setAttribute("fill", "none");
    this.path.setAttribute("stroke", this.curveColor);
    this.path.setAttribute("stroke-linecap", "round");
    this.svgElement.appendChild(this.path);

    // when values changed on slope and offset, redraw the curve
    this.factorWidget.callback = () => {
      this.drawCurve();
    };
    this.offsetWidget.callback = () => {
      this.drawCurve();
    };

    // let's go!
    this.drawCurve();
  }

  /**
   * To respect ComfyUI styles, we need to get the colors from the computed style.
   */
  getComputedColors() {
    // the the --error-text color from the computed style of html element
    return {
      red: document.documentElement.style.getPropertyValue("--error-text"),
      gray: document.documentElement.style.getPropertyValue("--descrip-text"),
    };
  }

  /**
   * Draw a grid in the SVG element.
   */
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

    const createLine = (x1, y1, x2, y2) => {
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      line.setAttribute("stroke", this.gridColor);
      line.setAttribute("stroke-width", this.gridLineWidth);
      line.setAttribute("stroke-dasharray", this.dashArray);
      return line;
    };

    for (let x = 0.2; x < 1; x += 0.2) {
      const line = createLine(x, 0, x, 1);
      this.svgElement.appendChild(line);
    }

    for (let y = 0.2; y < 1; y += 0.2) {
      const line = createLine(0, y, 1, y);
      this.svgElement.appendChild(line);
    }
  }

  /**
   * Draw the curve in the SVG element.
   */
  drawCurve() {
    const k = this.factorWidget.value; // slope
    const b = this.offsetWidget.value; // offset (shadow_offest)

    const numStep = 100;
    const xValues = Array.from(
      { length: numStep },
      (_, i) => i / (numStep - 1),
    );

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
