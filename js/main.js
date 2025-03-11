import { app } from "../../scripts/app.js";
import { M3DCurveGraph } from "./svgcurve.js";

app.registerExtension({
  name: "m3d.photo.effects",
  async beforeRegisterNodeDef(nodeType, nodeData, _) {
    if (!nodeData?.category?.startsWith("M3D")) {
      return;
    }
    // keep an eye on M3D nodes
    nodeType.prototype.m3d_node = true;
    nodeType.prototype.m3d_use_curve = nodeData?.category?.match(/curve/);
  },
  async nodeCreated(node) {
    if (node?.m3d_use_curve) {
      // we need a "curve" widget
      try {
        new M3DCurveGraph(node); // retgister a graph element in the node
        node.size[1] = Math.max(node.size[1], 350); // set a minimum height to display the graph
      } catch (error) {
        console.error(error);
      }
    }
  },
});
