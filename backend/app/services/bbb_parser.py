"""BigBlueButton metadata.xml parser."""

from __future__ import annotations

import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import TypedDict


class BBBMetadata(TypedDict):
    """Typed dict returned by parse_metadata."""

    name: str
    internal_meeting_id: str
    presenters: list[str]
    duration_seconds: int
    recorded_at: datetime


def parse_metadata(xml_content: str) -> BBBMetadata:
    """
    Parse a BigBlueButton metadata.xml string.

    Args:
        xml_content: Raw XML text from ``{bbb_base_url}/presentation/{meeting_id}/metadata.xml``.

    Returns:
        A :class:`BBBMetadata` dict with extracted fields.

    Raises:
        ValueError: If required XML elements are missing.
    """
    root = ET.fromstring(xml_content)

    def _text(tag: str, default: str = "") -> str:
        el = root.find(tag)
        return el.text.strip() if el is not None and el.text else default

    name = _text("meeting/name") or _text("name")
    internal_meeting_id = _text("meeting/internalMeetingID") or _text("internalMeetingID")

    # Duration is stored in milliseconds in BBB metadata
    duration_ms_str = _text("playback/duration") or _text("duration", "0")
    try:
        duration_seconds = int(float(duration_ms_str)) // 1000
    except ValueError:
        duration_seconds = 0

    # startTime is a Unix epoch in milliseconds
    start_time_str = _text("start_time") or _text("meeting/startTime", "0")
    try:
        start_ts_ms = int(start_time_str)
        recorded_at = datetime.fromtimestamp(start_ts_ms / 1000, tz=timezone.utc)
    except (ValueError, OSError):
        recorded_at = datetime.now(tz=timezone.utc)

    # Collect all presenter names
    presenters: list[str] = []
    for presenter_el in root.findall(".//presenter"):
        name_el = presenter_el.find("name")
        if name_el is not None and name_el.text:
            presenters.append(name_el.text.strip())

    return BBBMetadata(
        name=name,
        internal_meeting_id=internal_meeting_id,
        presenters=presenters,
        duration_seconds=duration_seconds,
        recorded_at=recorded_at,
    )
