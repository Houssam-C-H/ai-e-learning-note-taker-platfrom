"""MinIO / S3-compatible object storage service."""

from __future__ import annotations

import io
import logging
from pathlib import Path

from app.config import settings

logger = logging.getLogger(__name__)

_client = None


def _get_client():
    """Return a cached MinIO client, initialising it on first call."""
    global _client  # noqa: PLW0603
    if _client is None:
        from minio import Minio  # type: ignore[import]

        _client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
        )
        # Ensure bucket exists
        if not _client.bucket_exists(settings.MINIO_BUCKET):
            _client.make_bucket(settings.MINIO_BUCKET)
            logger.info("Created MinIO bucket: %s", settings.MINIO_BUCKET)
    return _client


def upload_file(local_path: str, object_name: str | None = None) -> str:
    """
    Upload a local file to MinIO and return its object URL.

    Args:
        local_path: Absolute path to the file on disk.
        object_name: Destination key in the bucket. Defaults to the file name.

    Returns:
        A presigned URL (or direct URL) to the uploaded object.
    """
    client = _get_client()
    path = Path(local_path)
    if object_name is None:
        object_name = path.name

    content_type = _guess_content_type(path.suffix)
    client.fput_object(
        settings.MINIO_BUCKET,
        object_name,
        local_path,
        content_type=content_type,
    )
    logger.info("Uploaded %s → %s/%s", local_path, settings.MINIO_BUCKET, object_name)

    # Return a presigned URL valid for 7 days
    url = client.presigned_get_object(settings.MINIO_BUCKET, object_name)
    return url


def download_file(object_name: str, dest_path: str) -> str:
    """
    Download an object from MinIO to a local path.

    Args:
        object_name: Key in the bucket.
        dest_path: Local destination file path.

    Returns:
        The ``dest_path`` for convenience.
    """
    client = _get_client()
    client.fget_object(settings.MINIO_BUCKET, object_name, dest_path)
    logger.info("Downloaded %s/%s → %s", settings.MINIO_BUCKET, object_name, dest_path)
    return dest_path


def _guess_content_type(suffix: str) -> str:
    mapping = {
        ".mp3": "audio/mpeg",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
    }
    return mapping.get(suffix.lower(), "application/octet-stream")
