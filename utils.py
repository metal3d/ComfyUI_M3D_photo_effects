import numpy as np
from PIL import Image, ImageEnhance


def tanh(x: np.ndarray | float, k=3.5, b=0.5):
    """returns the parametric tanh function"""
    return np.tanh(k * (x - b))


def normalized_tanh(x: np.ndarray, k=3.5, b=0.5) -> np.ndarray:
    """returns the normalized tanh function"""
    return (tanh(x, k, b) - tanh(0, k, b)) / (tanh(1, k, b) - tanh(0, k, b))


def overlay(im1: np.ndarray, im2: np.ndarray, factor=0.9):
    """apply im1 (base) on top layer im2 with factor"""
    # must do:
    # 2 * a * b if a < 0.5
    # 1 - 2 * (1-a) * (1-b) either
    lower = im1 < 0.5
    upper = im1 >= 0.5
    tmp = np.zeros_like(im1)
    tmp[lower] = 2 * im1[lower] * im2[lower]
    tmp[upper] = 1 - 2 * (1 - im1[upper]) * (1 - im2[upper])
    return tmp * factor


def bleach_bypass(im: np.ndarray, k=3.5, b=0.5, desaturate=0.75, strength=0.9):
    """Apply bleach bypass effect on the image"""
    imbase = Image.fromarray((im * 255).astype(np.uint8))

    enhancer = ImageEnhance.Color(imbase)
    base_image = enhancer.enhance(1 - desaturate)

    base_arr = np.asarray(base_image) / 255.0
    base_arr = normalized_tanh(base_arr, k, b)

    # balance the saturation as the "base" is very desaturated
    top_layer = enhancer.enhance(desaturate)
    top_arr = np.asarray(top_layer) / 255.0
    out = overlay(base_arr, top_arr, strength)
    return out
