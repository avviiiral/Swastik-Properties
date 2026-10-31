import re
from urllib.parse import unquote, urlsplit

from django.core.exceptions import ValidationError


MAX_BROCHURE_SIZE = 25 * 1024 * 1024
MAX_PROPERTY_IMAGE_SIZE = 10 * 1024 * 1024
ALLOWED_PROPERTY_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}

_COORDINATE_PATTERNS = (
    re.compile(r"!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)"),
    re.compile(r"/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)"),
)


def validate_google_maps_url(value):
    """Accept Google Maps URLs, including Google's supported short-link hosts."""
    parsed = urlsplit(value)
    host = (parsed.hostname or "").lower().rstrip(".")
    is_google_host = (
        host == "google.com"
        or host.endswith(".google.com")
        or host == "google.co.in"
        or host.endswith(".google.co.in")
        or host in {"maps.app.goo.gl", "goo.gl"}
    )
    is_maps_path = "/maps" in parsed.path or host in {
        "maps.app.goo.gl",
        "goo.gl",
    }

    if parsed.scheme != "https" or not is_google_host or not is_maps_path:
        raise ValidationError(
            "Enter a valid HTTPS Google Maps link (including maps.app.goo.gl links)."
        )


def validate_pdf_upload(uploaded_file):
    """Check extension, file size and PDF signature before accepting a brochure."""
    if uploaded_file.size > MAX_BROCHURE_SIZE:
        raise ValidationError("The brochure must not exceed 25 MB.")

    if not uploaded_file.name.lower().endswith(".pdf"):
        raise ValidationError("Only PDF brochures are allowed.")

    try:
        original_position = uploaded_file.tell()
        uploaded_file.seek(0)
        signature = uploaded_file.read(5)
        uploaded_file.seek(original_position)
    except (AttributeError, OSError):
        raise ValidationError("The uploaded brochure could not be read.")

    if signature != b"%PDF-":
        raise ValidationError("The uploaded file does not appear to be a valid PDF.")


def extract_google_maps_coordinates(value):
    """Extract place coordinates where they are embedded in a Google Maps URL."""
    decoded = unquote(value or "")

    for pattern in _COORDINATE_PATTERNS:
        match = pattern.search(decoded)
        if match:
            latitude, longitude = (float(match.group(1)), float(match.group(2)))
            if -90 <= latitude <= 90 and -180 <= longitude <= 180:
                return latitude, longitude

    return None, None



def validate_property_image_upload(uploaded_file):
    """Limit property photographs to common web formats and 10 MB per image."""
    suffix = (uploaded_file.name.rsplit(".", 1)[-1] if "." in uploaded_file.name else "").lower()
    if f".{suffix}" not in ALLOWED_PROPERTY_IMAGE_EXTENSIONS:
        raise ValidationError("Upload property photos as JPG, JPEG, PNG or WEBP files.")
    if uploaded_file.size > MAX_PROPERTY_IMAGE_SIZE:
        raise ValidationError("Each property photo must not exceed 10 MB.")
