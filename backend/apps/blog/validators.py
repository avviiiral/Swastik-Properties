from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from PIL import Image, UnidentifiedImageError
from pathlib import Path

MAX_COVER_SIZE = 8 * 1024 * 1024
ALLOWED_COVER_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")

def validate_blog_cover(upload):
    suffix=Path(upload.name).suffix.lower()
    if suffix not in ALLOWED_COVER_EXTENSIONS:
        raise ValidationError("Cover image must be JPG, JPEG, PNG or WEBP.")
    if upload.size>MAX_COVER_SIZE:
        raise ValidationError("Cover image must not exceed 8 MB.")
    try:
        position=upload.tell()
        upload.seek(0)
        image=Image.open(upload)
        image.verify()
        upload.seek(position)
    except (UnidentifiedImageError,OSError,ValueError) as exc:
        raise ValidationError("The uploaded cover is not a valid image.") from exc
