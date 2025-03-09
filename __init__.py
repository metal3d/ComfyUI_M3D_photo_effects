"""Import all nodes and define the mappings between node names and classes."""

from .nodes.bleachbypass import BleachBypass
from .nodes.rgbcurve import RGBCurve

NODE_CLASS_MAPPINGS = {
    "Bleach Bypass": BleachBypass,
    "RGB Curve": RGBCurve,
}
WEB_DIRECTORY = "./js"

__all__ = ["NODE_CLASS_MAPPINGS", "WEB_DIRECTORY"]
