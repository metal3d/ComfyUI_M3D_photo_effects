from .nodes import BleachBypass

NODE_CLASS_MAPPINGS = {
    "Bleach Bypass": BleachBypass,
}
WEB_DIRECTORY = "./js"

__all__ = ["NODE_CLASS_MAPPINGS", "WEB_DIRECTORY"]
