import numpy as np
import torch

from .utils import bleach_bypass


class BleachBypass:
    """Apply a bleach bypass effect to the input image."""

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("image",)
    CATEGORY = "M3D/image-effects/curve"
    FUNCTION = "apply_bleach_bypass"
    DESCRIPTION = """Apply the "bleach bypass" effect to the input image.

This effect is well-known in movies like "300",
it enforces shadows and desaturates the image.
To ensure a good result, keep the slope value between 2 and 5.
If your image is overexposed, you can increase the shadow offset.
At the opposite, if your image is underexposed, you can decrease the shadow offset.
"""

    @classmethod
    def INPUT_TYPES(cls):
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
                "desaturation": (
                    "FLOAT",
                    {
                        "min": 0.0,
                        "max": 1.0,
                        "default": 0.8,
                        "step": 0.01,
                        "tooltip": "The input desaturation (1-value) of the image. keep value near 0.7 to 0.9 for common effect.",
                    },
                ),
                "overlay_strength": (
                    "FLOAT",
                    {
                        "min": 0.0,
                        "max": 1.0,
                        "default": 0.9,
                        "step": 0.01,
                        "tooltip": "The strength of the overlay effect. keep value near 0.8 to 1.0 for common effect.",
                    },
                ),
            },
            "hidden": {
                "node_id": "UNIQUE_ID",
            },
        }

    def apply_bleach_bypass(
        self,
        image: torch.Tensor,
        slope,
        shadow_offset,
        desaturation,
        overlay_strength,
        **kwargs,
    ):
        im = image.numpy().squeeze(0)
        im = bleach_bypass(
            im,
            k=slope,
            b=shadow_offset,
            desaturate=desaturation,
            strength=overlay_strength,
        )
        im = np.expand_dims(im, axis=0)
        return (torch.from_numpy(im),)
