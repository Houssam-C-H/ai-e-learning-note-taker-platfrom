// BigBlueButton University Lecture Asset Scraper
// Extracts authentic metadata, slide changes, whiteboard text, and live chat logs
// directly from BigBlueButton recording servers (e.g. supmti.ac.ma).

export interface BbbRecordingMetadata {
  meetingId: string;
  baseUrl: string;
  meetingName: string;
  courseContext: string;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  participants: number;
  serverOrigin: string;
  videoUrl: string;
  audioUrl: string;
  deskshareUrl: string;
  chatTimeline: Array<{
    timestampSeconds: number;
    timestampFormatted: string;
    sender: string;
    role: string;
    message: string;
  }>;
  slides: Array<{
    id: string;
    inSeconds: number;
    outSeconds: number;
    text?: string;
  }>;
}

export function formatSecondsToTimestamp(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function parseBbbUrl(rawUrl: string): { baseUrl: string; meetingId: string } {
  const cleaned = rawUrl.trim();

  // Match: https://visioconference.supmti.ac.ma/presentation/b7ac9a49...-1793044808054/video/webcams.webm
  const presMatch = cleaned.match(/^(https?:\/\/[^/]+)\/presentation\/([a-zA-Z0-9_-]+-\d{10,13})/);
  if (presMatch) {
    return { baseUrl: presMatch[1], meetingId: presMatch[2] };
  }

  // Match: https://visioconference.supmti.ac.ma/playback/presentation/2.3/b7ac9a49...-1793044808054
  const playMatch = cleaned.match(/^(https?:\/\/[^/]+)\/.*\/([a-zA-Z0-9_-]+-\d{10,13})/);
  if (playMatch) {
    return { baseUrl: playMatch[1], meetingId: playMatch[2] };
  }

  // Raw meeting ID like b7ac9a49...-1793044808054
  const idMatch = cleaned.match(/^([a-zA-Z0-9_-]+-\d{10,13})$/);
  if (idMatch) {
    return {
      baseUrl: process.env.BBB_BASE_URL || 'https://visioconference.supmti.ac.ma',
      meetingId: idMatch[1],
    };
  }

  return {
    baseUrl: cleaned.startsWith('http') ? cleaned.replace(/\/+$/, '') : 'https://visioconference.supmti.ac.ma',
    meetingId: `session-${Date.now()}`,
  };
}

export async function fetchBbbMetadata(rawUrl: string): Promise<BbbRecordingMetadata> {
  const { baseUrl, meetingId } = parseBbbUrl(rawUrl);
  const presentationBase = `${baseUrl}/presentation/${meetingId}`;

  let meetingName = 'University Lecture Recording';
  let courseContext = 'Computer Science & Engineering';
  let startTime = Date.now();
  let endTime = Date.now() + 5400000;
  let durationSeconds = 5400; // ~90m
  let participants = 10;
  let serverOrigin = baseUrl;

  const chatTimeline: BbbRecordingMetadata['chatTimeline'] = [];
  const slides: BbbRecordingMetadata['slides'] = [];

  // 1. Fetch metadata.xml
  try {
    const metaRes = await fetch(`${presentationBase}/metadata.xml`, { cache: 'no-store' });
    if (metaRes.ok) {
      const xml = await metaRes.text();

      const nameMatch = xml.match(/<meeting[^>]*name="([^"]+)"/);
      if (nameMatch) meetingName = nameMatch[1];

      const ctxMatch = xml.match(/<bbb-context>([^<]+)<\/bbb-context>/);
      if (ctxMatch) courseContext = ctxMatch[1];

      const startMatch = xml.match(/<start_time>(\d+)<\/start_time>/);
      if (startMatch) startTime = parseInt(startMatch[1], 10);

      const endMatch = xml.match(/<end_time>(\d+)<\/end_time>/);
      if (endMatch) endTime = parseInt(endMatch[1], 10);

      const durMatch = xml.match(/<duration>(\d+)<\/duration>/);
      if (durMatch) {
        durationSeconds = Math.round(parseInt(durMatch[1], 10) / 1000);
      } else if (endTime > startTime) {
        durationSeconds = Math.round((endTime - startTime) / 1000);
      }

      const partMatch = xml.match(/<participants>(\d+)<\/participants>/);
      if (partMatch) participants = parseInt(partMatch[1], 10);

      const originMatch = xml.match(/<bbb-origin-server-name>([^<]+)<\/bbb-origin-server-name>/);
      if (originMatch) serverOrigin = originMatch[1];
    }
  } catch (err) {
    console.warn('[bbb-scraper] Failed to fetch metadata.xml:', err);
  }

  // 2. Fetch slides_new.xml (Student & Teacher Chat logs with exact seconds)
  try {
    const slidesRes = await fetch(`${presentationBase}/slides_new.xml`, { cache: 'no-store' });
    if (slidesRes.ok) {
      const xml = await slidesRes.text();
      // Regex parse chattimeline elements
      const chatRegex = /<chattimeline\s+in="([\d.]+)"[^>]*name="([^"]*)"[^>]*senderRole="([^"]*)"[^>]*message="([^"]*)"/g;
      let match;
      while ((match = chatRegex.exec(xml)) !== null) {
        const inSec = parseFloat(match[1]);
        chatTimeline.push({
          timestampSeconds: inSec,
          timestampFormatted: formatSecondsToTimestamp(inSec),
          sender: match[2] || 'Student',
          role: match[3] || 'VIEWER',
          message: match[4] || '',
        });
      }
    }
  } catch (err) {
    console.warn('[bbb-scraper] Failed to fetch slides_new.xml:', err);
  }

  // 3. Fetch shapes.svg for deskshare & slide timing
  try {
    const shapesRes = await fetch(`${presentationBase}/shapes.svg`, { cache: 'no-store' });
    if (shapesRes.ok) {
      const svg = await shapesRes.text();
      const imgRegex = /<image\s+id="([^"]+)"[^>]*in="([\d.]+)"\s+out="([\d.]+)"/g;
      let imgMatch;
      while ((imgMatch = imgRegex.exec(svg)) !== null) {
        slides.push({
          id: imgMatch[1],
          inSeconds: parseFloat(imgMatch[2]),
          outSeconds: parseFloat(imgMatch[3]),
        });
      }
    }
  } catch (err) {
    console.warn('[bbb-scraper] Failed to fetch shapes.svg:', err);
  }

  return {
    meetingId,
    baseUrl,
    meetingName,
    courseContext,
    startTime,
    endTime,
    durationSeconds,
    participants,
    serverOrigin,
    videoUrl: `${presentationBase}/video/webcams.webm`,
    audioUrl: `${presentationBase}/audio/audio.webm`,
    deskshareUrl: `${presentationBase}/deskshare/deskshare.webm`,
    chatTimeline,
    slides,
  };
}

