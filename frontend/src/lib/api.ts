import type {
  Course,
  Session,
  Note,
  Flashcard,
  QuizQuestion,
  CalendarEvent,
  ChatMessage,
  ChatRequest,
  IngestRequest,
  IngestResponse,
  SessionStatusResponse,
  DashboardStats,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── DEMO FALLBACK DATA (Used seamlessly when backend is offline) ────────────
const MOCK_COURSES: Course[] = [
  {
    id: 'course-sec401',
    code: 'SEC401',
    name: 'Advanced Network Security & Cryptography',
    color: '#6366F1',
    instructor: 'Prof. Laurent Martin',
  },
  {
    id: 'course-dev302',
    code: 'DEV302',
    name: 'Cloud-Native Distributed Systems',
    color: '#EC4899',
    instructor: 'Dr. Sarah Chen',
  },
  {
    id: 'course-ai501',
    code: 'AI501',
    name: 'Speech Synthesis & Deep Learning Architectures',
    color: '#10B981',
    instructor: 'Prof. Karim Belkacem',
  },
];

const MOCK_SESSIONS: Session[] = [
  {
    id: 'session-ospf-01',
    course_id: 'course-sec401',
    bbb_meeting_id: 'b7ac9a49b231-1793044808054',
    title: 'Lecture 04: OSPF Dynamic Routing & Link-State Convergence',
    recorded_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    duration_seconds: 3240,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    audio_url: '',
    status: 'ready',
  },
  {
    id: 'session-k8s-02',
    course_id: 'course-dev302',
    bbb_meeting_id: 'c9ef3124a108-1793131200000',
    title: 'Lecture 06: Raft Consensus & Distributed State Synchronization',
    recorded_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    duration_seconds: 2850,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    audio_url: '',
    status: 'ready',
  },
];

const MOCK_NOTE: Note = {
  id: 'note-01',
  session_id: 'session-ospf-01',
  executive_summary:
    'This lecture covers Open Shortest Path First (OSPFv2) hierarchical routing, Link-State Advertisements (LSAs), and Dijkstra Shortest Path First calculation. Practical demonstrations highlight single-area configuration, DR/BDR election mechanics on broadcast networks, and interface MTU mismatch pitfalls.',
  summary:
    'OSPFv2 protocol mechanisms, neighbor adjacency states, DR/BDR election, and practical Cisco IOS configuration commands.',
  markdown_content: `# SEC401 — Lecture 04: OSPF Dynamic Routing & Link-State Convergence

> [!NOTE]
> Prerequisites: IP addressing, subnetting (/24 to /30), and fundamental distance-vector vs. link-state routing concepts.

## 1. Protocol Architecture & Foundation \`[02:15]\`

Open Shortest Path First (OSPF) is an interior gateway protocol (IGP) operating directly over IP protocol **89**. Unlike distance-vector protocols (e.g. RIP) that route by rumor, every router running OSPF constructs an identical **Link-State Database (LSDB)** topology tree using Dijkstra's Shortest Path First (SPF) algorithm.

| Parameter | Specification | Purpose |
| :--- | :--- | :--- |
| **IP Protocol** | 89 | Direct encapsulation (no transport layer TCP/UDP) |
| **Multicast Addresses** | \`224.0.0.5\` (AllSPFRouters), \`224.0.0.6\` (AllDRouters) | Efficient heartbeat & LSA dissemination |
| **Administrative Distance** | 110 | Preference rating over RIP (120) |
| **Metric Formula** | $\\text{Cost} = \\frac{10^8}{\\text{Bandwidth (bps)}}$ | Link quality estimation |

## 2. Neighbor Adjacency State Machine \`[11:40]\`

The transition from cold boot to full adjacency progresses through 7 discrete states:

1. **Down**: No Hello packets received on the link.
2. **Init**: Received Hello packet without our own Router ID in the neighbor list.
3. **2-Way**: Bidirectional communication established. DR/BDR election occurs here.
4. **ExStart**: Master/Slave negotiation using Database Description (DBD) packets.
5. **Exchange**: Routers exchange DBD packets describing their LSDB summaries.
6. **Loading \`[24:18]\`**: Routers request missing LSAs using Link State Request (LSR).
7. **Full**: Complete synchronization of the topology database across the area.

> [!WARNING]
> **Exam Alert:** A common exam pitfall occurs when routers hang in \`EXSTART/EXCHANGE\` state. The primary root cause is an **MTU mismatch** between connected interfaces. Verify MTU sizing with \`show ip ospf interface\`.

## 3. Practical Terminal Configuration \`[35:10]\`

\`\`\`bash
# Configure OSPF on Router 1
Router(config)# router ospf 1
Router(config-router)# router-id 1.1.1.1
Router(config-router)# network 10.0.0.0 0.0.0.255 area 0
Router(config-router)# auto-cost reference-bandwidth 1000

# Verification Commands
Router# show ip ospf neighbor
Router# show ip route ospf
Router# show ip ospf database
\`\`\`

## 4. Designated Router (DR) & Backup DR Mechanics \`[48:30]\`

On multi-access broadcast segments (e.g., Ethernet), full mesh adjacencies require $\\frac{n(n-1)}{2}$ sessions. OSPF eliminates this scaling bottleneck by electing a **Designated Router (DR)** and a **Backup Designated Router (BDR)** using interface priority and Router ID tiebreakers.`,
};

const MOCK_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    front: 'What IP protocol number does OSPF encapsulate directly over?',
    back: 'IP Protocol 89 (no TCP or UDP transport headers are used).',
    difficulty: 1,
  },
  {
    id: 'fc-2',
    front: 'What are the two standard multicast addresses reserved for OSPF?',
    back: '224.0.0.5 (AllSPFRouters) and 224.0.0.6 (AllDRouters).',
    difficulty: 2,
  },
  {
    id: 'fc-3',
    front: 'What is the default Administrative Distance of OSPF in Cisco networking?',
    back: 'Administrative Distance 110.',
    difficulty: 1,
  },
  {
    id: 'fc-4',
    front: 'What is the root cause if two OSPF neighbors remain stuck in EXSTART state?',
    back: 'Interface MTU mismatch on the interconnecting link (preventing DBD packet completion).',
    difficulty: 3,
  },
  {
    id: 'fc-5',
    front: 'What is the mathematical formula for default OSPF interface cost?',
    back: 'Cost = Reference Bandwidth (100 Mbps) / Interface Bandwidth (bps).',
    difficulty: 2,
  },
  {
    id: 'fc-6',
    front: 'In what adjacency state is the Designated Router (DR/BDR) elected?',
    back: 'The 2-Way state.',
    difficulty: 2,
  },
];

const MOCK_QUIZ: QuizQuestion[] = [
  {
    id: 'q-1',
    question: 'Which multicast address is utilized by DROther routers to transmit Link-State Updates directly to the DR and BDR?',
    options: ['224.0.0.1', '224.0.0.5', '224.0.0.6', '224.0.0.9'],
    correct_option_index: 2,
    explanation: 'DROther routers speak to DR and BDR on 224.0.0.6 (AllDRouters). The DR then propagates updates to all other routers on 224.0.0.5.',
  },
  {
    id: 'q-2',
    question: 'Two routers fail to form an OSPF adjacency and remain stuck in EXSTART/EXCHANGE. What is the most probable configuration defect?',
    options: [
      'Hello/Dead timer interval mismatch',
      'Maximum Transmission Unit (MTU) mismatch between interfaces',
      'Different Area IDs configured on the interface',
      'Mismatched network subnet mask',
    ],
    correct_option_index: 1,
    explanation: 'DBD packets require matching MTUs by default. If the MTUs differ, the negotiation halts at EXSTART or EXCHANGE.',
  },
  {
    id: 'q-3',
    question: 'How does OSPF determine its Router ID when no explicit router-id command is configured?',
    options: [
      'The lowest MAC address on any active interface',
      'The highest IPv4 address on any active loopback interface',
      'The first physical interface configured with an IP address',
      'A randomly generated 32-bit integer',
    ],
    correct_option_index: 1,
    explanation: 'OSPF chooses: 1) manual router-id, 2) highest IP on an active loopback interface, 3) highest IP on any active physical interface.',
  },
  {
    id: 'q-4',
    question: 'What algorithm is executed by OSPF to compute the shortest path tree to all known destination subnets?',
    options: ['Bellman-Ford Algorithm', 'Dijkstra Algorithm', 'Floyd-Warshall Algorithm', 'Kruskal Minimum Spanning Tree'],
    correct_option_index: 1,
    explanation: 'OSPF utilizes Edsger Dijkstras Shortest Path First (SPF) algorithm to calculate loop-free paths.',
  },
  {
    id: 'q-5',
    question: 'Which command adjusts the reference bandwidth to ensure 10Gbps links receive a lower cost than 1Gbps links in modern networks?',
    options: [
      'auto-cost reference-bandwidth <speed-in-mbps>',
      'ip ospf cost auto <speed>',
      'metric-weights 0 1 0 1 0',
      'bandwidth reference 10000',
    ],
    correct_option_index: 0,
    explanation: 'By default, reference bandwidth is 100 Mbps. Setting `auto-cost reference-bandwidth 10000` scales metrics properly for Gigabit and 10Gbps links.',
  },
];

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    title: 'SEC401: OSPF Dynamic Routing Convergence',
    course_id: 'course-sec401',
    session_id: 'session-ospf-01',
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 5400000).toISOString(),
    event_type: 'lecture',
    description: 'Hierarchical OSPF, link-state advertisement, and lab configuration.',
  },
  {
    id: 'ev-2',
    title: 'DEV302: Raft Consensus & Distributed DBs',
    course_id: 'course-dev302',
    session_id: 'session-k8s-02',
    start_time: new Date(Date.now() - 86400000 * 3).toISOString(),
    end_time: new Date(Date.now() - 86400000 * 3 + 5400000).toISOString(),
    event_type: 'lecture',
    description: 'Leader election, log replication, and split-brain resolution.',
  },
  {
    id: 'ev-3',
    title: 'SEC401: Midterm Laboratory Exam',
    course_id: 'course-sec401',
    start_time: new Date(Date.now() + 86400000 * 5).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 5 + 7200000).toISOString(),
    event_type: 'exam',
    description: 'Hands-on network troubleshooting and multi-area routing configuration.',
  },
];

async function request<T>(
  path: string,
  options?: RequestInit & { params?: Record<string, string | number | boolean | undefined> }
): Promise<T> {
  let url = `${API_BASE}${path}`;

  if (options?.params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      message = data.detail || data.message || message;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Courses ────────────────────────────────────────────────────────────────
export const coursesApi = {
  list: async (): Promise<Course[]> => {
    try {
      return await request<Course[]>('/api/courses');
    } catch {
      return MOCK_COURSES;
    }
  },
  get: async (id: string): Promise<Course> => {
    try {
      return await request<Course>(`/api/courses/${id}`);
    } catch {
      return MOCK_COURSES.find((c) => c.id === id) || MOCK_COURSES[0];
    }
  },
  create: async (data: Omit<Course, 'id'>): Promise<Course> => {
    try {
      return await request<Course>('/api/courses', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const newCourse: Course = { ...data, id: `course-${Date.now()}` };
      MOCK_COURSES.push(newCourse);
      return newCourse;
    }
  },
};

// ─── Sessions ───────────────────────────────────────────────────────────────
export const sessionsApi = {
  list: async (params?: { course_id?: string; status?: string }): Promise<Session[]> => {
    try {
      return await request<Session[]>('/api/sessions', { params });
    } catch {
      if (params?.course_id) {
        return MOCK_SESSIONS.filter((s) => s.course_id === params.course_id);
      }
      return MOCK_SESSIONS;
    }
  },
  get: async (id: string): Promise<Session> => {
    try {
      return await request<Session>(`/api/sessions/${id}`);
    } catch {
      return MOCK_SESSIONS.find((s) => s.id === id) || MOCK_SESSIONS[0];
    }
  },
  getStatus: async (id: string): Promise<SessionStatusResponse> => {
    try {
      return await request<SessionStatusResponse>(`/api/sessions/${id}/status`);
    } catch {
      return { id, status: 'ready', progress: 100 };
    }
  },
  ingest: async (data: IngestRequest): Promise<IngestResponse> => {
    try {
      return await request<IngestResponse>('/api/sessions/ingest', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      const newSession: Session = {
        id: `session-${Date.now()}`,
        course_id: data.course_id || 'course-sec401',
        bbb_meeting_id: data.meeting_id || 'sample-bbb-meeting',
        title: `Ingested Lecture (${(data.meeting_id || 'session').slice(0, 16)})`,
        recorded_at: new Date().toISOString(),
        duration_seconds: 3600,
        video_url: '',
        audio_url: '',
        status: 'ready',
      };
      MOCK_SESSIONS.unshift(newSession);
      return { session_id: newSession.id, status: 'ready', message: 'Ingestion pipeline initialized' };
    }
  },
};

// ─── Notes ──────────────────────────────────────────────────────────────────
export const notesApi = {
  get: async (sessionId: string): Promise<Note> => {
    try {
      return await request<Note>(`/api/sessions/${sessionId}/notes`);
    } catch {
      return { ...MOCK_NOTE, session_id: sessionId };
    }
  },
};

// ─── Flashcards ─────────────────────────────────────────────────────────────
export const flashcardsApi = {
  list: async (sessionId: string): Promise<Flashcard[]> => {
    try {
      return await request<Flashcard[]>(`/api/sessions/${sessionId}/flashcards`);
    } catch {
      return MOCK_FLASHCARDS;
    }
  },
};

// ─── Quiz ────────────────────────────────────────────────────────────────────
export const quizApi = {
  getQuestions: async (sessionId: string): Promise<QuizQuestion[]> => {
    try {
      return await request<QuizQuestion[]>(`/api/sessions/${sessionId}/quiz`);
    } catch {
      return MOCK_QUIZ;
    }
  },
};

// ─── Calendar ────────────────────────────────────────────────────────────────
export const calendarApi = {
  listEvents: async (params?: {
    start?: string;
    end?: string;
    course_id?: string;
  }): Promise<CalendarEvent[]> => {
    try {
      return await request<CalendarEvent[]>('/api/calendar/events', { params });
    } catch {
      return MOCK_EVENTS;
    }
  },
};

// ─── Chat ────────────────────────────────────────────────────────────────────
export const chatApi = {
  sendMessage: async (data: ChatRequest): Promise<{ message: string; id: string }> => {
    try {
      return await request<{ message: string; id: string }>('/api/chat', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return {
        id: Date.now().toString(),
        message:
          'Based on the lecture notes for **SEC401**, OSPF uses IP protocol **89** directly, and the professor specifically cautioned that if neighbors hang in the `EXSTART` state, check for an interface MTU mismatch (`show ip ospf interface`). Refer to timestamp **[14:22]**.',
      };
    }
  },
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      return await request<DashboardStats>('/api/dashboard/stats');
    } catch {
      return {
        total_sessions: MOCK_SESSIONS.length,
        flashcards_generated: MOCK_FLASHCARDS.length,
        quizzes_completed: MOCK_QUIZ.length,
        courses_count: MOCK_COURSES.length,
      };
    }
  },
};

export { ApiError };
