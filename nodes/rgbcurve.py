import numpy as np
import torch

from .utils import normalized_tanh


class RGBCurve:
    """Apply a RGB curve to an image."""

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("image",)
    CATEGORY = "M3D/image-effects/curve"
    FUNCTION = "apply_curve"
    DESCRIPTION = """Apply a RGB curve to the input image at once.

This node apply a correction to the all channels of the image at once.
It helps to enhance the contrast and the colors of the image.
"""

    @classmethod
    def INPUT_TYPES(cle):
        return {
            "required": {
                "image": ("IMAGE", {}),
                "slope": (
                    "FLOAT",
                    {
                        "min": 1.0,
                        "max": 50,
                        "step": 0.1,
                        "default": 4,
                        "tooltip": "The slope of the S-curve. keep value from 2 to 10 to expect good results.",
                    },
                ),
                "shadow_offset": (
                    "FLOAT",
                    {
                        "min": 0.0,
                        "max": 1.0,
                        "default": 0.5,
                        "step": 0.01,
                        "tooltip": "The shadow offset of the image. keep value near 0.5. If >0.5 the shadows are more present, <0.5 the lights are more present.",
                    },
                ),
            },
            "hidden": {
                "node_id": "UNIQUE_ID",
            },
        }

    def apply_curve(
        self,
        image: torch.Tensor,
        slope,
        shadow_offset,
        **kwargs,
    ):
        im = image.numpy().squeeze(0)
        im = normalized_tanh(im, slope, shadow_offset)
        im = np.expand_dims(im, 0)
        return (torch.from_numpy(im),)
