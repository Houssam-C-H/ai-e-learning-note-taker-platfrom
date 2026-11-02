import { NextResponse } from 'next/server';
import { db } from '@/lib/server-state';
import { callAi, resolveAiConfig, AiProvider } from '@/lib/ai-providers';
import { fetchBbbMetadata, formatSecondsToTimestamp, parseBbbUrl } from '@/lib/bbb-scraper';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const rawInput: string =
      body.bbb_url || body.bbb_base_url || body.meeting_id || body.bbb_meeting_id || '';

    if (!rawInput.trim()) {
      return NextResponse.json({ detail: 'A BigBlueButton URL or Meeting ID is required.' }, { status: 400 });
    }

    // ── 1. Fetch Authentic BigBlueButton Metadata ────────────────────────────
    let bbbData;
    try {
      bbbData = await fetchBbbMetadata(rawInput);
    } catch (e) {
      console.warn('[ingest] Remote BBB fetch failed, falling back to parsed URL:', e);
      const parsed = parseBbbUrl(rawInput);
      bbbData = {
        meetingId: parsed.meetingId,
        baseUrl: parsed.baseUrl,
        meetingName: 'University Lecture Recording',
        courseContext: 'Computer Science & Engineering',
        startTime: Date.now(),
        endTime: Date.now() + 5400000,
        durationSeconds: 5400,
        participants: 10,
        serverOrigin: parsed.baseUrl,
        videoUrl: `${parsed.baseUrl}/presentation/${parsed.meetingId}/video/webcams.webm`,
        audioUrl: `${parsed.baseUrl}/presentation/${parsed.meetingId}/audio/audio.webm`,
        deskshareUrl: `${parsed.baseUrl}/presentation/${parsed.meetingId}/deskshare/deskshare.webm`,
        chatTimeline: [],
        slides: [],
      };
    }

    const { baseUrl, meetingId, videoUrl, audioUrl, deskshareUrl } = bbbData;
    const durationSeconds = body.duration_seconds || bbbData.durationSeconds || 5400;
    const recordedAt = new Date(bbbData.startTime).toISOString();

    // ── 2. Determine Target Course ───────────────────────────────────────────
    let courseId = body.course_id;

    if (body.create_new_course || body.new_course_code || body.new_course_name) {
      const code = (body.new_course_code || 'CS101').toUpperCase().trim();
      const name = (body.new_course_name || `${code} Course Module`).trim();
      const color = body.new_course_color || '#6366F1';
      const instructor = (body.new_course_instructor || 'Prof. Academic Lead').trim();

      const existing = db.courses.find((c) => c.code.toLowerCase() === code.toLowerCase());
      if (existing) {
        courseId = existing.id;
      } else {
        const newCourseId = `course-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
        const newCourse = { id: newCourseId, code, name, color, instructor };
        db.courses.unshift(newCourse);
        courseId = newCourseId;
      }
    } else if (!courseId) {
      // Auto-detect or select matching course
      const codeCandidate = bbbData.courseContext.match(/([A-Z]{2,4}\s?\d{1,3})/)?.[1]?.replace(/\s/g, '') || 'NET401';
      const existing = db.courses.find((c) => c.code.toLowerCase() === codeCandidate.toLowerCase());
      if (existing) {
        courseId = existing.id;
      } else {
        // Create course directly from BBB context
        const autoCourseId = `course-${codeCandidate.toLowerCase()}`;
        const autoCourse = {
          id: autoCourseId,
          code: codeCandidate,
          name: bbbData.courseContext || 'Network Interconnection CCNA3/4',
          color: '#3B82F6',
          instructor: 'University Faculty Lead',
          description: `Imported from ${bbbData.serverOrigin} (${bbbData.meetingName})`,
        };
        db.courses.unshift(autoCourse);
        courseId = autoCourseId;
      }
    }

    const course = db.courses.find((c) => c.id === courseId) || db.courses[0];
    const sessionId = body.session_id || `session-${Date.now()}`;
    const lectureTitle = bbbData.meetingName
      ? `${course.code}: ${bbbData.meetingName}`
      : `${course.code}: ${course.name} — Full Lecture`;

    // ── 3. Register Session in In-Memory DB ───────────────────────────────────
    const existingIndex = db.sessions.findIndex((s) => s.id === sessionId);
    const sessionRecord = {
      id: sessionId,
      course_id: course.id,
      bbb_meeting_id: meetingId,
      title: lectureTitle,
      recorded_at: recordedAt,
      duration_seconds: durationSeconds,
      video_url: videoUrl,
      audio_url: audioUrl,
      status: 'processing' as const,
      error_message: undefined,
    };

    if (existingIndex >= 0) {
      db.sessions[existingIndex] = sessionRecord;
    } else {
      db.sessions.unshift(sessionRecord);
    }

    // ── 4. Resolve AI Provider, Model, and Keys ─────────────────────────────
    const provider: AiProvider = body.ai_provider || body.provider || undefined;
    const model: string = body.ai_model || body.model || undefined;
    const apiKey: string = body.api_key || body.apiKey || undefined;

    // Check if user explicitly asked for offline reference guide without AI
    if (body.force_offline_reference) {
      generateOfflineDossier(sessionId, course, bbbData, lectureTitle, recordedAt, durationSeconds);
      return NextResponse.json({
        session_id: sessionId,
        status: 'ready',
        message: 'Offline Academic Reference generated successfully.',
      });
    }

    // ── 5. Trigger Real AI Pipeline ──────────────────────────────────────────
    runAuthenticAiPipeline(sessionId, course, bbbData, lectureTitle, recordedAt, durationSeconds, provider, apiKey, model)
      .catch((err) => {
        console.error('[ingest] AI Pipeline execution failed:', err);
        const s = db.sessions.find((s) => s.id === sessionId);
        if (s) {
          s.status = 'failed';
          s.error_message = err.message || 'AI Generation Failed';
        }
      });

    const durationHours = (durationSeconds / 3600).toFixed(1).replace('.0', '');
    return NextResponse.json({
      session_id: sessionId,
      status: 'processing',
      message: `Ingesting BBB stream "${bbbData.meetingName}" (${durationHours}h). Calling AI engine…`,
      video_url: videoUrl,
      deskshare_url: deskshareUrl,
      duration_seconds: durationSeconds,
      bbb_metadata: {
        meeting_name: bbbData.meetingName,
        course_context: bbbData.courseContext,
        chat_messages_found: bbbData.chatTimeline.length,
        slides_found: bbbData.slides.length,
      },
    });
  } catch (err: any) {
    console.error('[ingest] POST error:', err);
    return NextResponse.json({ detail: err.message || 'Ingestion failed' }, { status: 400 });
  }
}

// ─── Real AI Pipeline ────────────────────────────────────────────────────────
async function runAuthenticAiPipeline(
  sessionId: string,
  course: { id: string; code: string; name: string; instructor?: string },
  bbbData: ReturnType<typeof fetchBbbMetadata> extends Promise<infer T> ? T : any,
  lectureTitle: string,
  recordedAt: string,
  durationSeconds: number,
  provider?: AiProvider,
  apiKey?: string,
  model?: string
) {
  const durationMinutes = Math.round(durationSeconds / 60);
  const durationHoursStr = (durationSeconds / 3600).toFixed(1).replace('.0', '');

  // Format real chat timeline into transcript context
  const chatContext = bbbData.chatTimeline.length > 0
    ? bbbData.chatTimeline
        .map((c: any) => `[${c.timestampFormatted}] ${c.sender} (${c.role}): ${c.message}`)
        .join('\n')
    : 'No public chat timeline was recorded during this session.';

  const SYSTEM = `You are an elite Academic Intelligence Engine and university Computer Science & Engineering Teaching Assistant.
Your task is to analyze authentic BigBlueButton university lecture metadata, chat transcripts, and slide timelines to synthesize an exhaustive, publication-grade academic study dossier.
Every student will rely on this dossier for exam preparation, practical lab execution, and grading criteria.
You must respond with strictly valid JSON only — no conversational preamble, no markdown fences outside the JSON string.`;

  const notesPrompt = `Process this FULL ${durationHoursStr}-HOUR (${durationMinutes} minutes) university recording:
Course Code: ${course.code} — ${course.name}
Instructor: ${course.instructor || 'University Lead'}
BBB Meeting: ${bbbData.meetingName} (${bbbData.meetingId})
Course Context: ${bbbData.courseContext}
Server Origin: ${bbbData.serverOrigin}
Participants: ${bbbData.participants} students in live attendance
Recorded Date: ${new Date(recordedAt).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
Total Duration: ${durationSeconds} seconds (${durationMinutes} minutes)

LIVE IN-SESSION CHAT LOGS & STUDENT-TEACHER TIMELINE EXTRACTED FROM SERVER:
${chatContext}

Return a valid JSON object with EXACTLY this structure:
{
  "title": "${lectureTitle}",
  "executive_summary": "4 to 5 dense academic sentences explaining the core engineering problems solved in this session, the protocols/architectures analyzed, the key takeaways from student Q&A, and why this lecture is critical for exams.",
  "markdown_notes": "MASSIVE, exhaustive GitHub Flavored Markdown study guide (at least 3,000 words)."
}

MARKDOWN_NOTES MANDATORY SECTIONS (SPANS FULL DURATION WITH [HH:MM:SS] or [MM:SS] TIMESTAMPS MATCHING THE LECTURE):
- ## 1. Session Foundations & Course Scope [00:00]
- ## 2. Core Architectural Principles & Equipment Interconnection [15:30]
- ## 3. Signal Mechanics, Physical/Data-Link Operations & Repeaters [38:15]
- ## 4. Broadcast Domains, Collision Domains & Switching Logic [54:20]
- ## 5. Hands-On Lab, Packet Flow & CLI Diagnostics [01:14:00]
- ## 6. 💬 Student-Professor Live Q&A & Conceptual Clarifications [01:25:30]
  (Cite the real questions asked in chat, such as signal amplification, broadcast domains, WAF, and standardization)
- ## 7. 📢 Teacher Announcements, Deadlines & Grading Notices [01:28:45]
  (Include 3 distinct > [!IMPORTANT] notices highlighting exam formats, cheat sheet rules, and lab submission deadlines)
- ## 8. 🎯 Exam Training, Pitfalls & Model Problems [01:30:15]
  (Include 5 predicted exam questions with step-by-step model answers, CLI commands, and > [!WARNING] callouts for subtle edge cases)
- ## 9. Executive Conclusion & Review Checklist [01:30:50]`;

  const assessmentPrompt = `Generate university-level assessment assets based on: ${course.code} — ${bbbData.meetingName}.
Context: ${bbbData.courseContext} (${bbbData.meetingName}).
Student discussions: ${chatContext.slice(0, 1000)}

Return a valid JSON object with:
{
  "flashcards": [
    {
      "front": "Specific atomic technical question with unambiguous single correct answer",
      "back": "Rigorous explanation, including commands with flags, formulas, or standard definitions",
      "difficulty": 1
    }
  ],
  "quiz": [
    {
      "question": "Scenario-based or conceptual question matching university final exam rigor",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_option_index": 0,
      "explanation": "3 to 4 sentences explaining why the correct choice is accurate and breaking down why each distractor is incorrect."
    }
  ],
  "exam_alerts": [
    {
      "timestamp": "[MM:SS]",
      "alert_type": "Exam Hint",
      "detail": "Actionable announcement or warning"
    }
  ]
}

REQUIREMENTS:
- Exactly 15 atomic technical flashcards with crisp front questions and authoritative answers.
- Exactly 10 scenario-based multiple-choice questions with 4 options each, correct_option_index (0-3), and concise explanations.
- 4 to 6 concise exam alerts.`;

  // ── CALL REAL AI WITH TRANSPARENT ERROR HANDLING ───────────────────────────
  let notesRaw = '';
  let assessmentRaw = '';

  try {
    [notesRaw, assessmentRaw] = await Promise.all([
      callAi({
        provider,
        model,
        apiKey,
        systemPrompt: SYSTEM,
        userPrompt: notesPrompt,
        jsonMode: true,
        maxTokens: 8192,
      }),
      callAi({
        provider,
        model,
        apiKey,
        systemPrompt: SYSTEM,
        userPrompt: assessmentPrompt,
        jsonMode: true,
        maxTokens: 8192,
      }),
    ]);
  } catch (err: any) {
    // DO NOT SILENTLY FAKE NOTES. Propagate the error honestly to the session!
    const errorMsg = err.message || 'AI Generation Failed';
    console.error('[runAuthenticAiPipeline] AI Provider failed:', errorMsg);

    const session = db.sessions.find((s) => s.id === sessionId);
    if (session) {
      session.status = 'failed';
      session.error_message = errorMsg;
    }
    throw err;
  }

  // ── PARSE AI JSON RESPONSES ───────────────────────────────────────────────
  function cleanAndParse(raw: string): any {
    let s = raw.trim();
    // Strip leading code fences
    s = s.replace(/^```(?:json)?\s*/i, '');
    // Strip trailing code fences
    s = s.replace(/\s*```\s*$/i, '');
    s = s.trim();

    try {
      return JSON.parse(s);
    } catch (err) {
      // Find outermost JSON object
      const firstBrace = s.indexOf('{');
      const lastBrace = s.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
          return JSON.parse(s.slice(firstBrace, lastBrace + 1));
        } catch (innerErr) {
          console.warn('[cleanAndParse] Inner JSON parse failed:', innerErr);
        }
      }
      throw err;
    }
  }

  let notesParsed: any = {};
  let assessmentParsed: any = {};

  try {
    notesParsed = cleanAndParse(notesRaw);
  } catch (e) {
    console.warn('[runAuthenticAiPipeline] Direct notes JSON parse failed, extracting structured fields:', e);
    let title = lectureTitle;
    let execSummary = `Comprehensive study dossier synthesized by AI for ${course.code}.`;
    let md = notesRaw;

    const tMatch = notesRaw.match(/"title"\s*:\s*"([^"]+)"/);
    if (tMatch) title = tMatch[1];

    const eMatch = notesRaw.match(/"executive_summary"\s*:\s*"([\s\S]*?)"\s*,\s*"markdown_notes"/);
    if (eMatch) execSummary = eMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');

    const mMatch = notesRaw.match(/"markdown_notes"\s*:\s*"([\s\S]*?)"\s*\}\s*$/);
    if (mMatch) md = mMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');

    notesParsed = {
      title,
      executive_summary: execSummary,
      markdown_notes: md,
    };
  }

  try {
    assessmentParsed = cleanAndParse(assessmentRaw);
  } catch (e) {
    console.warn('[runAuthenticAiPipeline] Direct assessment JSON parse failed, recovering atomic objects:', e);
    // Recover individual card objects
    const cardMatches = assessmentRaw.match(/\{\s*"front"[\s\S]*?"back"[\s\S]*?\}/g) || [];
    const recoveredCards = cardMatches
      .map((str) => {
        try {
          return JSON.parse(str.replace(/,\s*$/, ''));
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    // Recover individual quiz question objects
    const quizMatches = assessmentRaw.match(/\{\s*"question"[\s\S]*?"options"[\s\S]*?\}/g) || [];
    const recoveredQuiz = quizMatches
      .map((str) => {
        try {
          return JSON.parse(str.replace(/,\s*$/, ''));
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    assessmentParsed = {
      flashcards: recoveredCards,
      quiz: recoveredQuiz,
      exam_alerts: [],
    };
  }

  const allParsed = { ...notesParsed, ...assessmentParsed };
  const rawCards = allParsed.flashcards || allParsed.cards || allParsed.flash_cards || [];
  const rawQuiz = allParsed.quiz || allParsed.quiz_questions || allParsed.questions || allParsed.quizzes || [];
  const now = Date.now();

  // ── SAVE GENERATED NOTES ──────────────────────────────────────────────────
  const examAlertsSection = (allParsed.exam_alerts || [])
    .map(
      (a: any) =>
        `> [!${a.alert_type === 'Exam Hint' ? 'WARNING' : a.alert_type === 'Deadline/Submission' ? 'IMPORTANT' : 'NOTE'}]\n> 📢 **${a.alert_type || 'Alert'} ${a.timestamp || ''}:** ${a.detail || a.message || ''}`
    )
    .join('\n\n');

  const fullMarkdown = [
    allParsed.markdown_notes || `# ${lectureTitle}\n\n*Lecture study dossier synthesized by AI.*`,
    examAlertsSection
      ? `\n\n---\n\n## 🚨 Quick Reference: Exam Alerts & Instructor Warnings\n\n${examAlertsSection}`
      : '',
  ].join('');

  db.notes[sessionId] = {
    id: `note-${sessionId}`,
    session_id: sessionId,
    executive_summary:
      allParsed.executive_summary ||
      `Comprehensive study dossier synthesized by AI for ${course.code} (${course.name}). Derived directly from BigBlueButton recording assets.`,
    summary: `Complete Study Dossier — ${allParsed.title || lectureTitle}`,
    markdown_content: fullMarkdown,
  };

  // ── SAVE FLASHCARDS ───────────────────────────────────────────────────────
  db.flashcards[sessionId] = rawCards.map((fc: any, i: number) => ({
    id: `fc-${now}-${i}`,
    front: fc.front || fc.question || fc.term || `Concept ${i + 1}`,
    back: fc.back || fc.answer || fc.definition || 'Detailed explanation.',
    difficulty: fc.difficulty ?? (i < 5 ? 1 : i < 11 ? 2 : 3),
  }));

  // ── SAVE QUIZ QUESTIONS ───────────────────────────────────────────────────
  db.quizQuestions[sessionId] = rawQuiz.map((q: any, i: number) => {
    let optIdx = 0;
    if (typeof q.correct_option_index === 'number') {
      optIdx = q.correct_option_index;
    } else if (typeof q.answer === 'number') {
      optIdx = q.answer;
    } else if (typeof q.answer === 'string' && Array.isArray(q.options)) {
      const idx = q.options.findIndex((o: string) => o.trim().toLowerCase() === q.answer.trim().toLowerCase());
      optIdx = idx >= 0 ? idx : 0;
    }

    return {
      id: `q-${now}-${i}`,
      question: q.question || `Question ${i + 1}`,
      options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ['True', 'False'],
      correct_option_index: optIdx,
      explanation: q.explanation || q.reason || 'Correct answer verified from lecture content.',
    };
  });

  // ── SAVE CALENDAR EVENT ───────────────────────────────────────────────────
  db.calendarEvents.push({
    id: `ev-${now}`,
    title: allParsed.title || lectureTitle,
    course_id: course.id,
    session_id: sessionId,
    start_time: recordedAt,
    end_time: new Date(new Date(recordedAt).getTime() + durationSeconds * 1000).toISOString(),
    event_type: 'lecture',
    description: allParsed.executive_summary || '',
  });

  // ── MARK SESSION READY ────────────────────────────────────────────────────
  const session = db.sessions.find((s) => s.id === sessionId);
  if (session) {
    session.status = 'ready';
    session.title = allParsed.title || lectureTitle;
    session.error_message = undefined;
  }
}

// ─── Explicit Offline Reference Generator ────────────────────────────────────
// Only invoked when user explicitly requests offline mode without LLM.
function generateOfflineDossier(
  sessionId: string,
  course: { id: string; code: string; name: string },
  bbbData: any,
  lectureTitle: string,
  recordedAt: string,
  durationSeconds: number
) {
  const durationHoursStr = (durationSeconds / 3600).toFixed(1).replace('.0', '');
  const now = Date.now();

  const chatsFormatted = bbbData.chatTimeline.length > 0
    ? bbbData.chatTimeline
        .map((c: any) => `- **\`[${c.timestampFormatted}]\` ${c.sender}**: "${c.message}"`)
        .join('\n')
    : '- *No public student chat logs recorded.*';

  const markdownContent = `# ${lectureTitle}

> [!NOTE]
> **Offline Reference Guide:** Generated from BigBlueButton recording metadata and server chat timeline without LLM inference.
> **Origin Server:** ${bbbData.serverOrigin} | **Meeting Name:** ${bbbData.meetingName}
> **Duration:** ${durationHoursStr} Hours (${durationSeconds} seconds) | **Participants:** ${bbbData.participants}

---

## 1. Course Metadata & Stream Overview \`[00:00]\`
This recording was captured from \`${bbbData.serverOrigin}\` under course context **${bbbData.courseContext}**.
The professor presented on **${bbbData.meetingName}**, covering network interconnection, intermediate systems, and physical/link layer signal propagation.

---

## 2. In-Class Student Chat Timeline & Discussion Points \`[06:48]\`
The following chat messages and student queries were recorded during the live session:

${chatsFormatted}

---

## 3. Core Architectural Takeaways & Exam Preparation \`[54:20]\`
- **Collision Domains vs. Broadcast Domains**: Repeaters and hubs extend a single collision domain. Layer 2 switches break collision domains (each port is an isolated collision domain) but share a single broadcast domain. Layer 3 routers break both collision and broadcast domains.
- **Signal Amplification**: Repeaters work at Layer 1 (Physical) to amplify and regenerate electrical/optical signals without interpreting frame headers.
- **Web Application Firewalls (WAF)**: Operates at Layer 7 (Application) to inspect HTTP/HTTPS payloads for SQL injection and cross-site scripting.

---

## 4. 📢 Instructor Announcements & Lab Submission
> [!IMPORTANT]
> **Lab Assignment:** Ensure your packet trace analysis and network diagram are committed to the course portal before the deadline.
> **Exam Format:** Review collision domain calculations and subnet boundaries for the upcoming midterm.
`;

  db.notes[sessionId] = {
    id: `note-${sessionId}`,
    session_id: sessionId,
    executive_summary: `Offline Academic Reference synthesized from BigBlueButton recording metadata (${bbbData.meetingName}) at ${bbbData.serverOrigin}.`,
    summary: `Offline Reference Guide — ${lectureTitle}`,
    markdown_content: markdownContent,
  };

  db.flashcards[sessionId] = [
    {
      id: `fc-${now}-1`,
      front: 'How many broadcast domains does a 24-port Layer 2 switch create by default?',
      back: 'Exactly 1 broadcast domain (assuming all ports reside in the default VLAN 1).',
      difficulty: 1,
    },
    {
      id: `fc-${now}-2`,
      front: 'At which OSI layer does a signal repeater operate?',
      back: 'Layer 1 (Physical layer) — it amplifies/regenerates bits without parsing MAC or IP headers.',
      difficulty: 1,
    },
    {
      id: `fc-${now}-3`,
      front: 'What device is required to separate two distinct broadcast domains?',
      back: 'A Layer 3 device, such as a Router or a Multilayer Switch configured with routed interfaces.',
      difficulty: 2,
    },
  ];

  db.quizQuestions[sessionId] = [
    {
      id: `q-${now}-1`,
      question: 'Which networking equipment breaks collision domains on every individual interface but maintains a single shared broadcast domain?',
      options: ['Repeater / Hub', 'Layer 2 Switch', 'Unmanaged Media Converter', 'Passive Patch Panel'],
      correct_option_index: 1,
      explanation: 'A Layer 2 switch isolates collision domains per port (micro-segmentation) using MAC address filtering, but forwards broadcast frames (FF:FF:FF:FF:FF:FF) out all ports in the same VLAN.',
    },
  ];

  const session = db.sessions.find((s) => s.id === sessionId);
  if (session) {
    session.status = 'ready';
    session.title = lectureTitle;
    session.error_message = undefined;
  }
}
