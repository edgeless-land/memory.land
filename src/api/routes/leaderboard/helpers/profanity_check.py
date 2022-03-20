from fnmatch import fnmatch
from .blacklist import INITIALS_BLACK_LIST


def is_initials_safe(initials: str) -> bool:
    """
    Check if any of the INITIALS_BLACK_LIST matches the current initials.
    """

    if initials.lower() in INITIALS_BLACK_LIST:
        return False

    for blacklisted_initials in INITIALS_BLACK_LIST:
        if fnmatch(initials.lower(), blacklisted_initials.lower()):
            return False

    return True
