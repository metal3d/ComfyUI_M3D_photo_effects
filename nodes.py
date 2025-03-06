import numpy as np
import torch

from .utils import bleach_bypass


class BleachBypass:
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

    RETURN_TYPES = ("IMAGE",)
    RETURN_NAMES = ("image",)
    CATEGORY = "IMAGE"
    FUNCTION = "apply_bleach_bypass"

    def apply_bleach_bypass(
        self,
        image: torch.Tensor,
        slope,
        shadow_offset,
        desaturation,
        overlay_strength,
        node_id,
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
