import numpy as np
from PIL import Image, ImageEnhance


def T(x, k=3.5, b=0.5):
    return np.tanh(k * (x - b))


def Tnorm(x, k=3.5, b=0.5):
    return (T(x, k, b) - T(0, k, b)) / (T(1, k, b) - T(0, k, b))


def overlay(im1: np.ndarray, im2: np.ndarray, factor=0.5):
    # must do:
    # 2 * a * b if a < 0.5
    # 1 - 2 * (1-a) * (1-b) either
    lower = im1 < 0.5
    upper = im1 >= 0.5
    tmp = np.zeros_like(im1)
    tmp[lower] = 2 * im1[lower] * im2[lower]
    tmp[upper] = 1 - 2 * (1 - im1[upper]) * (1 - im2[upper])
    return tmp * factor


def bleach_bypass(im, k=3.5, b=0.5, desaturate=0.75, strength=1):
    im = Image.fromarray((im * 255).astype(np.uint8))

    enhancer = ImageEnhance.Color(im)
    imin = enhancer.enhance(1 - desaturate)

    imarr = np.asarray(imin) / 255.0
    imarr = Tnorm(imarr, k, b)

    # balance the saturation as the "base" is very desaturated
    tmp = enhancer.enhance(desaturate)
    tmp = np.asarray(tmp) / 255.0
    out = overlay(imarr, tmp, strength)
    return out
