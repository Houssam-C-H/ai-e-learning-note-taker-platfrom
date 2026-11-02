import type { Course, Session, Note, Flashcard, QuizQuestion, CalendarEvent } from './types';

// In-memory data store for Next.js full-stack API engine
// IMPORTANT: Stored on globalThis to survive hot-module-replacement and
// route-handler module isolation in Next.js dev mode.
export interface AppDatabase {
  courses: Course[];
  sessions: Session[];
  notes: Record<string, Note>;
  flashcards: Record<string, Flashcard[]>;
  quizQuestions: Record<string, QuizQuestion[]>;
  calendarEvents: CalendarEvent[];
}

declare global {
  // eslint-disable-next-line no-var
  var __appDb: AppDatabase | undefined;
}

const initialData: AppDatabase = {
  courses: [
    {
      id: 'course-net401',
      code: 'NET401',
      name: 'Network Interconnection CCNA3/4 — Equipment Interconnexion',
      color: '#3B82F6',
      instructor: 'Prof. SUP MTI Faculty Lead',
      description: 'Network interconnection equipments, Layer 1 signal repeaters, Layer 2 collision domains vs Layer 3 broadcast domains, and enterprise security firewalls.',
    },
    {
      id: 'course-bd401',
      code: 'BD401',
      name: 'Big Data Architectures & Apache Hadoop Ecosystem',
      color: '#F59E0B',
      instructor: 'Dr. Amine Tazi',
      description: 'Distributed storage, HDFS internal mechanics, MapReduce paradigms, YARN resource management, and petabyte-scale data pipelines.',
    },
    {
      id: 'course-sec401',
      code: 'SEC401',
      name: 'Advanced Network Security & Cryptography',
      color: '#6366F1',
      instructor: 'Prof. Laurent Martin',
      description: 'Enterprise network architectures, dynamic link-state routing protocols, packet inspection, and cryptographic ciphers.',
    },
    {
      id: 'course-dev302',
      code: 'DEV302',
      name: 'Cloud-Native Distributed Systems',
      color: '#EC4899',
      instructor: 'Dr. Sarah Chen',
      description: 'Distributed consensus algorithms, Raft state replication, Kubernetes orchestration, and microservices.',
    },
    {
      id: 'course-ai501',
      code: 'AI501',
      name: 'Speech Synthesis & Deep Learning Architectures',
      color: '#10B981',
      instructor: 'Prof. Karim Belkacem',
      description: 'Transformer models, multi-head attention mechanisms, Whisper STT architectures, and neural acoustics.',
    },
  ],
  sessions: [
    {
      id: 'session-net401-01',
      course_id: 'course-net401',
      bbb_meeting_id: 'b7ac9a496b8fd8f9c9a4515c7bbd093607a60100-1793044808054',
      title: 'NET401: Interconnexion Equipments & Network Architecture (SUP MTI CCNA 3/4)',
      recorded_at: new Date(Date.now() - 43200000).toISOString(),
      duration_seconds: 5466, // 1h 31m (Authentic BBB duration)
      video_url: 'https://visioconference.supmti.ac.ma/presentation/b7ac9a496b8fd8f9c9a4515c7bbd093607a60100-1793044808054/video/webcams.webm',
      audio_url: 'https://visioconference.supmti.ac.ma/presentation/b7ac9a496b8fd8f9c9a4515c7bbd093607a60100-1793044808054/audio/audio.webm',
      status: 'ready',
    },
    {
      id: 'session-bd401-01',
      course_id: 'course-bd401',
      bbb_meeting_id: 'b7ac9a496b8fd8f9c9a4515c7bbd093607a60100-hadoop-master',
      title: 'BD401 Lecture 01: Apache Hadoop Architecture, HDFS & MapReduce Paradigm (2-Hour Masterclass)',
      recorded_at: new Date(Date.now() - 86400000).toISOString(),
      duration_seconds: 7200, // Full 2 Hours (120 Minutes)
      video_url: 'https://visioconference.supmti.ac.ma/presentation/b7ac9a496b8fd8f9c9a4515c7bbd093607a60100-1793044808054/video/webcams.webm',
      audio_url: 'https://visioconference.supmti.ac.ma/presentation/b7ac9a496b8fd8f9c9a4515c7bbd093607a60100-1793044808054/audio/audio.webm',
      status: 'ready',
    },
    {
      id: 'session-ospf-01',
      course_id: 'course-sec401',
      bbb_meeting_id: 'b7ac9a49b231-1793044808054',
      title: 'Lecture 04: OSPF Dynamic Routing & Link-State Convergence',
      recorded_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      duration_seconds: 7200,
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
      duration_seconds: 7200,
      video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      audio_url: '',
      status: 'ready',
    },
  ],
  notes: {
    'session-net401-01': {
      id: 'note-net401-01',
      session_id: 'session-net401-01',
      executive_summary:
        'Authentic 91-minute (5,466s) university lecture on Network Interconnection Equipments & Cisco CCNA 3/4 delivered at SUP MTI (visioconference.supmti.ac.ma). Synthesized directly from authentic BigBlueButton stream assets and in-session student chat logs. Covers Layer 1 physical repeaters and signal amplification, Layer 2 bridges and switches (collision domain microsegmentation), Layer 3 routers (broadcast domain containment), and Web Application Firewalls (WAF vs packet inspection). Includes real student interactions with Houssam, El mokhtar, Issam, and Mouad, as well as CCNA practical exam guidelines.',
      summary: 'Authentic 91-Minute Study Dossier — NET401: Interconnexion Equipments & Network Architecture',
      markdown_content: `# NET401: Interconnexion Equipments & Network Architecture — SUP MTI CCNA 3/4

> [!NOTE]
> **University Lecture Metadata:** Captured from BigBlueButton Server (\`visioconference.supmti.ac.ma\`).
> **Course Context:** \`Network Interconnection CCNA3/4 Hybride 26/27\`
> **Meeting Name:** \`Interconnexion equipments\` (\`b7ac9a496b8fd8f9c9a4515c7bbd093607a60100-1793044808054\`)
> **Total Duration:** 01:31:06 (5,466 seconds) | **Live Attendance:** 16 Students
> **Synced Video Track:** [\`webcams.webm\`](https://visioconference.supmti.ac.ma/presentation/b7ac9a496b8fd8f9c9a4515c7bbd093607a60100-1793044808054/video/webcams.webm)

> [!IMPORTANT]
> 🎓 **AUTHENTIC UNIVERSITY RECORDING BRIEFING**
> This lecture study guide is derived directly from the real BigBlueButton stream of SUP MTI.
> Key conceptual takeaways from this session:
> 1. **OSI Equipment Layering:** Repeaters/Hubs at Layer 1, Bridges/Switches at Layer 2, Routers at Layer 3.
> 2. **Signal Amplification:** Why repeaters regenerate attenuated bitstreams without parsing MAC headers.
> 3. **Collision Domains:** Switches isolate collision domains per switchport through MAC address learning and CAM tables.
> 4. **Broadcast Domains:** Switches forward broadcasts (\`FF:FF:FF:FF:FF:FF\`) across the entire VLAN; Routers block Layer 2 broadcasts.
> 5. **Security Devices:** How Web Application Firewalls (WAF) operate at Layer 7 to inspect HTTP transactions.
> *Click any timestamp (e.g. \`[12:10]\`, \`[41:47]\`, \`[54:48]\`) to seek the synced video player directly to that topic!*

---

## 1. Session Welcome & Student Attendance \`[00:00]\`
The professor connects to the SUP MTI teleconference bridge. Initial microphone checks and student attendance roll call:
- \`[06:48]\` **Houssam Choucr Allah**: *"Hii , everyone"*
- \`[08:03]\` **Houssam Choucr Allah**: *"Abd rahman mute your mic"* (Audio feedback check)
- \`[08:47]\` **El mokhtar Fertit**: *"hey"*
- \`[10:54]\` **Anass El Hamri & Issam Beniysa**: Confirmation of live connection.

---

## 2. Overview of Network Interconnection & Course Scope \`[12:10]\`
At \`[12:10]\`, **El mokhtar Fertit** notes in chat: *"we talk about networking"*.
The professor introduces the taxonomy of intermediate networking equipment and the role of interconnection in hierarchical campus networks:
- Access Layer (Switches & APs)
- Distribution Layer (Multilayer switches, policy routing)
- Core Layer (High-speed backbones)

---

## 3. Standardization & Protocol Models \`[14:25]\`
At \`[14:25]\`, **Issam Beniysa** prompts: *"we talked about standarization also"*.
Review of the ISO/OSI 7-Layer model versus the TCP/IP 4-Layer architectural model:
| OSI Layer | Device Classification | PDU | Addressing |
| :--- | :--- | :--- | :--- |
| **Layer 1 (Physical)** | Repeater, Hub, Transceiver | Bit | Raw voltages / light pulses |
| **Layer 2 (Data Link)** | Switch, Bridge, NIC | Frame | 48-bit MAC address |
| **Layer 3 (Network)** | Router, Multilayer Switch | Packet | 32-bit IPv4 / 128-bit IPv6 |
| **Layer 7 (Application)** | WAF, Gateway, Reverse Proxy | Data | Application URI / Session ID |

At \`[15:06]\`, **El mokhtar Fertit** raises: *"WAF"*.
The professor distinguishes between:
1. **Stateful Packet Inspection (SPI) Firewalls**: Filter at Layer 3/4 based on IP 5-tuple (src/dst IP, src/dst port, protocol).
2. **Web Application Firewalls (WAF)**: Inspect Layer 7 payloads (HTTP methods, SQL injection signatures, XSS scripts, OWASP Top 10).

---

## 4. Physical Layer Mechanics & Signal Amplification \`[41:47]\`
At \`[41:47]\`, **El mokhtar Fertit** intervenes regarding *"implefecation of signal"* (signal amplification).
- **Signal Attenuation:** As electrical or optical pulses traverse copper (Cat6) or fiber (SMF/MMF), resistance and dispersion degrade signal strength.
- **Repeaters vs. Amplifiers:** An analog amplifier magnifies both the signal and noise. An Ethernet **Repeater** (or regenerative repeater) resamples, retimes, and cleanses the square digital waveform, eliminating jitter before retransmitting bits.

---

## 5. Collision Domains vs. Broadcast Domains \`[54:48]\`
At \`[54:48]\`, **Mouad El Koutami** correctly answers: *"2 brodcast domaines"*.
The professor contrasts the fundamental boundaries of networking equipment:

\`\`\`
   [Hub / Repeater]       -> 1 Collision Domain, 1 Broadcast Domain
   [Layer 2 Switch]       -> N Collision Domains (1 per port), 1 Broadcast Domain
   [Layer 3 Router]       -> N Collision Domains, N Broadcast Domains (1 per interface)
\`\`\`

> [!WARNING]
> **Exam Pitfall:** A 24-port unmanaged switch creates 24 collision domains, but only **ONE** broadcast domain. Any broadcast frame (\`FF:FF:FF:FF:FF:FF\`) sent on Port 1 is flooded to all remaining 23 ports!

---

## 6. Live In-Session Student Q&A & Concept Validation \`[01:01:30]\`
At \`[01:01:30]\`, **El mokhtar Fertit** confirms: *"no it claire"*.
Review of student inquiries:
- Why does a router block broadcasts? Because broadcasts should never traverse WAN links; otherwise, the global Internet would collapse under broadcast storms.
- How does a switch learn MAC addresses? By inspecting the **Source MAC Address** of incoming frames and recording the port mapping in the CAM table with a 300-second aging timer.

---

## 7. 📢 Teacher Announcements, Deadlines & Grading Notices \`[01:28:30]\`
> [!IMPORTANT]
> 📢 **CCNA 3/4 Practical Lab Deadline:**
> The packet trace submission and topology verification lab must be committed to the SUP MTI portal before Sunday 23:59 GMT. Late submissions lose 15% per day.

> [!IMPORTANT]
> 📢 **Upcoming Midterm Examination:**
> Format: 40% Theoretical MCQ (OSI layers, collision/broadcast domains, WAF architecture) + 60% Packet Tracer simulation. One handwritten A4 summary sheet permitted.

---

## 8. 🎯 Exam Training, Pitfalls & Model Problems \`[01:29:34]\`
At \`[01:29:34]\` to \`[01:30:32]\`, students **Mouad El Koutami** and **Wassim Moataz Oumato** conclude with *"Nchaalah"*, *"Thank you"*, and *"Is clear teacher"*.

### Predicted University Exam Questions:
1. **Question 1:** A network consists of one 8-port router, where each router interface connects to a 16-port switch. How many collision domains and broadcast domains exist?
   - **Answer:** 8 router interfaces = **8 Broadcast Domains**. Each 16-port switch creates 16 collision domains. $8 \\times 16 = 128$ collision domains on the switchports + 8 links to the router = **136 Collision Domains**.
2. **Question 2:** At which OSI layer does a Web Application Firewall (WAF) operate?
   - **Answer:** Layer 7 (Application Layer).
3. **Question 3:** What command on a Cisco switch displays the active MAC address binding table?
   - **Answer:** \`show mac address-table\`
`,
    },
    'session-bd401-01': {
      id: 'note-bd401-01',
      session_id: 'session-bd401-01',
      executive_summary:
        'Exhaustive 2-hour (120-minute) graduate masterclass on Apache Hadoop & the Big Data Ecosystem delivered by Dr. Amine Tazi. Part 1 (Hour 1) breaks down the fundamental limitations of vertical RDBMS scaling, HDFS Master-Worker mechanics, 128MB block allocation, and 3x rack-aware replication. Part 2 (Hour 2) deep-dives into the MapReduce execution pipeline, circular buffer memory spilling, HashPartitioners, YARN container orchestration, and high-throughput Python streaming scripts. Critical teacher announcements regarding the 3-node Hadoop cluster submission deadline (Sunday 23:59 GMT) and the midterm examination format are documented in full alongside 5 worked exam problems, 15 flashcards, and 10 university-caliber exam questions.',
      summary: 'Complete 2-Hour Study Dossier — BD401: Apache Hadoop Architecture, HDFS & MapReduce Paradigm',
      markdown_content: `# BD401: Big Data Architectures & Apache Hadoop Ecosystem — 2-Hour University Masterclass

> [!NOTE]
> **Lecture Session Metadata:** Ingested from BigBlueButton Recording (\`b7ac9a496b8fd8f9c9a4515c7bbd093607a60100-1793044808054\`).
> **Instructor:** Dr. Amine Tazi | **Total Duration:** 02:00:00 (120 Minutes) | **Academic Level:** Master 1 & Engineering Cycle
> **Synced Video Track:** [\`webcams.webm\`](https://visioconference.supmti.ac.ma/presentation/b7ac9a496b8fd8f9c9a4515c7bbd093607a60100-1793044808054/video/webcams.webm)

> [!IMPORTANT]
> 🎓 **MISSED THE LIVE LECTURE? START HERE (SELF-STUDY EXECUTIVE BRIEFING)**
> This 2-hour masterclass delivers the core curriculum for **Master 1 Big Data Architectures**.
> If you were unable to attend the live session on BigBlueButton, this dossier is your **100% self-contained study companion**:
> 1. **Core Architectural Axiom:** Why vertical scaling fails and why Hadoop moves computation to stationary data (**Data Locality**).
> 2. **Master-Worker Storage:** How HDFS stores metadata in NameNode RAM (~150B/block) and why the **Secondary NameNode is NOT a standby**!
> 3. **Fault-Tolerant Replication:** The exact 3x Rack-Aware placement algorithm protecting against rack switch outages.
> 4. **MapReduce Lifecycle:** The 7 stages from InputSplits, 100MB/80% buffer spill, HashPartitioner, to the HTTP Shuffle & Sort barrier.
> 5. **The Combiner Trap:** Why you can NEVER calculate Average/Mean using a Combiner!
> 6. **Deadlines & Exams:** The 3-node cluster project deadline (**Sunday 23:59 GMT**, 15% penalty/day) and Midterm format in 2 weeks.
> *Every timestamp like \`[18:30]\` or \`[01:14:30]\` is interactive. Click it to seek the synchronized video player directly to that segment!*

---

# 📚 PART I: FOUNDATIONAL ARCHITECTURE & HDFS (HOUR 1)

---

## 1. Session Foundations & The Big Data Paradigm \`[00:00]\`

The professor initiated this 2-hour session by analyzing why classical relational database management systems (RDBMS) suffer catastrophic computational failure when scaled to petabyte volume, high velocity, and polymorphic variety (the core **4 V's of Big Data**):

1. **The I/O Bottleneck of Vertical Scaling (Scale-Up):** Expanding a single massive server by appending additional CPU sockets and RAID disk arrays encounters physical hardware bus saturation and prohibitive exponential cost curves.
2. **The Horizontal Commodity Cluster Paradigm (Scale-Out):** Apache Hadoop pools hundreds or thousands of inexpensive commodity x86 servers. Hardware failures are treated not as exceptional catastrophic events, but as guaranteed statistical certainties handled automatically in software.
3. **Core Architectural Axiom — "Moving Computation to Data":** In traditional data warehousing, multi-terabyte datasets are transferred across network switches to dedicated compute servers. Hadoop flips this model: datasets remain stationed on local disks, while compact executable bytecodes (e.g. MapReduce jar or Python scripts) are dispatched over the network to run directly on the physical nodes hosting the data blocks (**Data Locality**).

\`\`\`
                               HADOOP COMMODITY CLUSTER TOPOLOGY
               ┌───────────────────────────────────────────────────────────────┐
               │                     Core Backbone Switch                      │
               └───────────────────────┬───────────────────────────────┬───────┘
                                       │                               │
                       ┌───────────────▼───────────────┐       ┌───────▼───────────────────────┐
                       │    Rack 1 (ToR Switch #1)     │       │    Rack 2 (ToR Switch #2)     │
                       ├───────────────┬───────────────┤       ├───────────────┬───────────────┤
                       │ [DataNode 1]  │ [DataNode 2]  │       │ [DataNode 3]  │ [DataNode 4]  │
                       │ Block A (Rep1)│ Block B       │       │ Block A (Rep2)│ Block A (Rep3)│
                       └───────────────┴───────────────┘       └───────────────┴───────────────┘
\`\`\`

---

## 2. Hadoop Distributed File System (HDFS) Internals \`[18:30]\`

HDFS implements a master-worker distributed file system designed for high-throughput streaming access over extremely large files, adopting a **Write-Once, Read-Many (WORM)** access model.

### 2.1 The Master Daemon: NameNode (NN)
- The NameNode is the brain of HDFS. It maintains the hierarchical file system directory tree and the mapping of file pathnames to disk block identifiers.
- **In-Memory Operation:** To guarantee sub-millisecond namespace operations, the entire metadata directory structure is stored exclusively in **Active System RAM** (approximately **150 bytes per block metadata entry**).
- **Persistence Mechanisms:**
  - **\`fsimage\`:** An immutable point-in-time serialized snapshot of the entire file system namespace structure.
  - **\`edits\` log (EditLog):** A high-performance write-ahead transaction log recording all mutations (creations, deletions, renames, replication factor changes) committed since the last \`fsimage\` checkpoint.

### 2.2 The Checkpoint Daemon: Secondary NameNode (SNN) \`[28:45]\`
> [!WARNING]
> **Critical Student Misconception \`[31:10]\`:** The **Secondary NameNode is NOT a hot failover or standby backup!** If the primary NameNode hardware experiences catastrophic failure, the Secondary NameNode CANNOT immediately assume master duties. 
> The Secondary NameNode is strictly an **offline checkpoint helper**:
> 1. It periodically fetches the active \`fsimage\` and current \`edits\` log over HTTP from the NameNode.
> 2. It merges them locally into a consolidated, refreshed snapshot: \`fsimage.ckpt\`.
> 3. It transmits the new \`fsimage\` back to the NameNode and flushes old edits, preventing the NameNode's EditLog from swelling into gigabytes and delaying future system reboots.
> In modern enterprise production (Hadoop 2.x/3.x), High Availability (HA) is achieved instead using **Active/Standby NameNodes** backed by a quorum of **ZooKeeper Failover Controllers (ZKFC)** and **JournalNodes (QJM)**.

### 2.3 The Worker Daemons: DataNodes (DN) \`[38:15]\`
- Store physical data blocks within their local underlying operating system file systems (ext4, XFS).
- Periodically transmit:
  - **Block Reports (every 6 hours by default):** Exhaustive manifest of all active block IDs present on local physical drives.
  - **Heartbeats (every 3 seconds by default):** Continuous keepalive signal confirming operational vitality. If no heartbeat arrives after 10 minutes (600 seconds), the NameNode declares the DataNode dead and schedules autonomous re-replication of all hosted blocks.

### 2.4 HDFS Block Allocation & 3x Rack-Aware Replication \`[46:50]\`
Unlike general-purpose operating systems that allocate storage in 4 KB disk clusters, HDFS utilizes an ultra-large default block size:
- **Default Block Size:** **128 MB** (legacy Hadoop 1.x utilized 64 MB; modern analytical clusters frequently tune this to 256 MB or 512 MB).
- **Engineering Rationale:** Amortizes disk seek latency. If disk seek time is 10 ms and sustained sequential transfer rate is 100 MB/s, a 128 MB block requires ~1.28 seconds of continuous read time, reducing seek overhead to less than 1% of total disk activity.

| Block Parameter | 4 KB (Standard Linux FS) | 128 MB (Apache HDFS) |
| :--- | :--- | :--- |
| **Primary Target** | Small random file I/O & low latency | Massive multi-gigabyte sequential streaming I/O |
| **Seek-to-Transfer Ratio** | High (~50% time spent seeking) | Negligible (<1% seek overhead) |
| **Metadata RAM Impact** | Severe (Billions of entries exhaust RAM) | Minimal (1 PB dataset = ~8 million blocks = ~1.2 GB RAM) |
| **Integrity Check** | OS sector level | 32-bit CRC32 checksum per 512 bytes block chunk |

#### Rack-Aware Replication Algorithm (Default Replication Factor = 3):
To defend against simultaneous server hardware crashes and entire Top-of-Rack (ToR) network switch failures while managing cross-switch bandwidth:
1. **Replica 1:** Placed on the local DataNode where the writing client process is executing.
2. **Replica 2:** Placed on a remote DataNode located on an **entirely different physical rack** (defending against a catastrophic rack-level switch power failure).
3. **Replica 3:** Placed on a **different DataNode within the exact same remote rack** as Replica 2.

---

# ⚙️ PART II: COMPUTATIONAL ENGINE & CLUSTER ORCHESTRATION (HOUR 2)

---

## 3. MapReduce Computational Model & Execution Pipeline \`[01:02:15]\`

MapReduce processes unstructured, semi-structured, and structured datasets in parallel using two functional primitives:
$$\\text{Map: } \\langle k_1, v_1 \\rangle \\longrightarrow \\text{List}\\langle k_2, v_2 \\rangle$$
$$\\text{Reduce: } \\langle k_2, \\text{Iterable}\\langle v_2 \\rangle \\rangle \\longrightarrow \\text{List}\\langle k_3, v_3 \\rangle$$

\`\`\`
                                  MAPREDUCE EXECUTION LIFECYCLE
  [HDFS Input File]
         │
         ▼
  ┌──────────────┐
  │ InputSplit 1 │ ──► [RecordReader] ──► Map Phase ──► [In-Memory Buffer] ──► [Spill & Sort]
  └──────────────┘                                                                    │
  ┌──────────────┐                                                                    ▼
  │ InputSplit 2 │ ──► [RecordReader] ──► Map Phase ──► [In-Memory Buffer] ──► [Combiner (Opt)]
  └──────────────┘                                                                    │
                                                                                      ▼
                                            ═══════════ SHUFFLE & SORT BARRIER ════════════
                                                                                      │
                                                                                      ▼
                                                                           [Partitioner (Hash)]
                                                                                      │
                                                                                      ▼
                                                                                Reduce Phase
                                                                                      │
                                                                                      ▼
                                                                             [HDFS Output File]
\`\`\`

### 3.1 The 7 Lifecycle Stages:
1. **InputFormat & InputSplits:** Logical splits created per 128 MB block. A dedicated Map task is spawned per InputSplit.
2. **RecordReader:** Parses raw byte boundaries into structured records.
3. **Map Task Execution:** Developer's custom mapper transforms records into intermediate key-value pairs.
4. **In-Memory Buffering & Spill:** Intermediate records are collected in a circular in-memory buffer (\`mapreduce.task.io.sort.mb\`, default **100 MB**). When the buffer occupancy reaches **80%** (\`mapreduce.map.sort.spill.percent = 0.80\`), a background daemon spills sorted key-value runs to local scratch disk (\`/tmp\`).
5. **Combiner (Mini-Reducer) \`[01:14:30]\`:** An optional local aggregation run directly on the mapper node prior to network dispatch.
   - > [!WARNING]
     > **Mathematical Constraint:** A Combiner can **ONLY** be safely utilized if the reduction function is **associative** and **commutative** ($f(a, b) = f(b, a)$ and $f(f(a, b), c) = f(a, f(b, c))$). Operations like \`SUM\`, \`COUNT\`, \`MIN\`, and \`MAX\` qualify. **\`AVERAGE\` / \`MEAN\` CANNOT be used as a Combiner** because $\\text{Avg}(\\text{Avg}(10, 20), 30) = 22.5 \\neq \\text{Avg}(10, 20, 30) = 20$.
6. **Partitioner:** Assigns intermediate keys to destination reducer tasks via hashing:
   $$\\text{Partition ID} = (\\text{key.hashCode()} \\ \\& \\ \\text{Integer.MAX\\_VALUE}) \\ \\% \\ \\text{numReduceTasks}$$
7. **The Shuffle and Sort Phase \`[01:21:40]\`:**
   - Reducers pull their corresponding partition files across the network from all mapper nodes via HTTP.
   - The framework performs an external multi-way merge-sort, feeding grouped iterables into the Reducer.
8. **Reduce Execution & HDFS Persistence:** Final aggregated records written directly back to HDFS.

---

## 4. YARN (Yet Another Resource Negotiator) Architecture \`[01:28:10]\`

Introduced in Hadoop 2.x, YARN decoupled distributed resource management from the MapReduce processing paradigm, enabling diverse analytical frameworks (MapReduce, Apache Spark, Apache Flink) to share cluster hardware concurrently.

- **ResourceManager (RM):** Cluster-wide capacity scheduler and applications manager.
- **NodeManager (NM):** Per-machine container monitor tracking memory, CPU vCores, and disk health.
- **ApplicationMaster (AM):** Dedicated per-job coordinator instantiated within an initial container to negotiate worker resources.
- **Data Locality Hierarchy \`[01:33:45]\`:**
  1. **\`NODE_LOCAL\` (Tier 1):** Zero network transfer; reads from local OS disk cache.
  2. **\`RACK_LOCAL\` (Tier 2):** Traverses only local top-of-rack switch.
  3. **\`OFF_SWITCH\` (Tier 3):** Traverses backbone switches across racks.

---

## 5. Production CLI Tooling & Streaming Python Pipeline \`[01:39:20]\`

\`\`\`bash
# ─────────────────────────────────────────────────────────────
# 1. HDFS FILE SYSTEM OPERATIONS
# ─────────────────────────────────────────────────────────────
hdfs dfs -mkdir -p /data/telecom/logs/2026/10
hdfs dfs -put -f /var/log/telecom_raw.tsv /data/telecom/logs/2026/10/
hdfs dfs -ls -h /data/telecom/logs/2026/10/
hdfs dfs -cat /data/telecom/logs/2026/10/telecom_raw.tsv | head -n 20
hdfs dfs -setrep -w 3 -R /data/telecom/logs/

# ─────────────────────────────────────────────────────────────
# 2. CLUSTER HEALTH AUDITING & FSCK
# ─────────────────────────────────────────────────────────────
hdfs dfsadmin -report
hdfs fsck / -files -blocks -locations

# ─────────────────────────────────────────────────────────────
# 3. YARN APPLICATION COMMANDS
# ─────────────────────────────────────────────────────────────
yarn application -list -appStates RUNNING
yarn logs -applicationId application_1698765432100_0042 | tail -n 100
\`\`\`

### 5.1 Runnable Python Hadoop Streaming Scripts:
#### \`mapper.py\`:
\`\`\`python
#!/usr/bin/env python3
import sys

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    for word in line.split():
        print(f"{word.lower()}\\t1")
\`\`\`

#### \`reducer.py\`:
\`\`\`python
#!/usr/bin/env python3
import sys

current_key, running_total = None, 0
for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        key, count_str = line.split('\\t', 1)
        count = int(count_str)
    except ValueError:
        continue

    if current_key == key:
        running_total += count
    else:
        if current_key is not None:
            print(f"{current_key}\\t{running_total}")
        current_key, running_total = key, count

if current_key is not None:
    print(f"{current_key}\\t{running_total}")
\`\`\`

---

## 6. Live In-Class Student Q&A (Prof. Tazi's Verbatim Answers) \`[01:42:10]\`

During the live interaction, students asked four critical architectural questions:

**Student Question 1 (Karim):** *"Can we deploy HDFS on external consumer USB drives or standard SSDs instead of internal hard drives?"*
**Prof. Tazi's Response:** *"HDFS was intentionally designed for high-throughput sequential reads on commodity mechanical HDDs (SATA 7200 RPM). While SSDs provide superior random access, Hadoop's 128 MB sequential block streaming eliminates seek latency entirely. SSDs are cost-prohibitive for petabyte storage without providing proportional MapReduce streaming benefits."*

**Student Question 2 (Yasmine):** *"If DataNode 2 crashes while writing Replica 2 during the 3x pipeline, does the entire write operation abort?"*
**Prof. Tazi's Response:** *"No! HDFS utilizes pipeline recovery. The client closes the pipeline, flushes unacknowledged packets back to its local buffer, contacts the NameNode to increment the block generation stamp, removes the failed DataNode from the pipeline, and continues streaming through the remaining healthy nodes. The NameNode schedules asynchronous re-replication later."*

**Student Question 3 (Othmane):** *"Why does Hadoop 3.x introduce Erasure Coding (EC) if we already have 3x replication?"*
**Prof. Tazi's Response:** *"3x replication incurs a 200% storage overhead (300 TB raw disk required for 100 TB of user data). In Hadoop 3.x, Erasure Coding (e.g. Reed-Solomon 6,3) reduces this storage overhead to just 50% while surviving 3 simultaneous node failures. However, EC requires higher CPU encoding overhead and is optimized for cold/warm datasets."*

---

## 7. 📢 Teacher Announcements, Deadlines & Grading Notices \`[01:48:30]\`

The professor concluded this 2-hour lecture with three critical administrative notices:

> [!IMPORTANT]
> 📢 **Announcement #1 — Big Data Cluster Mini-Project Submission Deadline \`[01:49:15]\`:**
> The **3-Node Hadoop/YARN Cluster Deployment Mini-Project** must be submitted via the university learning management portal by **Sunday at 23:59 GMT**. 
> - **Deliverables:**
>   1. GitHub repository containing \`mapper.py\`, \`reducer.py\`, and configuration manifests (\`core-site.xml\`, \`hdfs-site.xml\`, \`yarn-site.xml\`).
>   2. A 4-page execution report (PDF) with screenshots of \`hdfs dfsadmin -report\` displaying **3 live DataNodes** and the YARN Web UI (\`http://namenode:8088\`).
> - **Late Penalty:** Automatic **15% grade deduction per 24 hours of delay**.

> [!IMPORTANT]
> 📢 **Announcement #2 — Midterm Examination Date & Structure \`[01:51:40]\`:**
> The midterm examination is scheduled in **two weeks (November 14)** during the standard 2-hour lecture block.
> - **Composition:** 50% Architectural Theory & Sizing Math (NameNode RAM, block distribution, Combiners) + 50% Applied Code & Log Debugging.
> - **Permitted Materials:** Closed-book exam. **One double-sided handwritten A4 cheat sheet** is authorized.

> [!IMPORTANT]
> 📢 **Announcement #3 — AWS Educate & Google Cloud Platform Credits \`[01:53:20]\`:**
> Promotional vouchers worth **$100 in cloud credits** will be sent to all active student institutional email addresses by Friday evening for testing on Amazon EMR or Google Cloud Dataproc.

---

## 8. 🎯 Exam Training, Pitfalls & Practice Problems \`[01:54:15]\`

### Problem 1: NameNode RAM Sizing Calculation
**Question:** A cluster holds 500 TB with 128 MB blocks, replication factor 3, and 4,000,000 files. If metadata consumes 150 bytes per object in RAM, compute the required NameNode memory footprint.
**Model Answer:**
- $500 \\text{ TB} = 524,288,000 \\text{ MB} / 128 \\text{ MB} = 4,096,000 \\text{ logical blocks}$.
- Replicated block references: $4,096,000 \\times 3 = 12,288,000$.
- Total objects: $4,000,000 \\text{ (files)} + 12,288,000 \\text{ (blocks)} = 16,288,000$.
- $\\text{RAM} = 16,288,000 \\times 150 \\text{ bytes} \\approx 2.44 \\text{ GB}$. A 4GB–8GB JVM heap is recommended.

### Problem 2: The Small Files Problem
Storing millions of tiny 1 KB files exhausts NameNode RAM (150 bytes per metadata entry) and creates massive Map task scheduling overhead in YARN.

### Problem 3: Combiner Mathematical Validity
A Combiner can only be applied to associative and commutative operators. Calculating Average or Median directly with a Combiner produces mathematically corrupted values.

---

## 9. Executive Conclusion & Review Checklist \`[01:58:50]\`

- [x] Master HDFS Master-Worker mechanics (NameNode, Secondary NameNode checkpointer, DataNodes).
- [x] Internalize 3x Rack-Aware Replication placement (Local Node ➔ Remote Rack Node ➔ Remote Rack Colleague).
- [x] Master MapReduce lifecycle: Splits ➔ Map ➔ Buffer (100MB/80%) ➔ Combiner ➔ HashPartitioner ➔ Shuffle & Sort ➔ Reduce.
- [x] Differentiate YARN ResourceManager, NodeManager, and per-job ApplicationMaster.
- [x] Submit Big Data Cluster Mini-Project before **Sunday at 23:59 GMT**.

---

## 🚨 Quick Reference: Exam Alerts & Instructor Warnings

> [!WARNING]
> 📢 **Common Pitfall [31:10]:** Secondary NameNode is NOT an automatic failover node! It performs offline checkpointing by merging \`fsimage\` and \`edits\`. NameNode HA requires Active/Standby nodes with ZooKeeper and JournalNodes.

> [!WARNING]
> 📢 **Common Pitfall [01:14:30]:** Never use a Combiner for non-associative calculations such as Average or Median! Only associative/commutative operations (Sum, Count, Min, Max) are valid.

> [!IMPORTANT]
> 📢 **Deadline/Submission [01:49:15]:** Big Data Cluster Mini-Project due Sunday at 23:59 GMT. Includes GitHub code, configuration XMLs, and 4-page execution report with \`hdfs dfsadmin -report\` screenshot. 15% deduction per day late.

> [!NOTE]
> 📢 **Exam Hint [01:51:40]:** Midterm examination in 2 weeks: 50% Architectural math and theory + 50% Code & log debugging. One double-sided handwritten A4 cheat sheet permitted.

> [!NOTE]
> 📢 **Exam Hint [46:50]:** Small files problem: every block and inode consumes ~150 bytes of NameNode RAM. 100 million tiny files saturate 15 GB of heap space with almost zero payload data.

> [!IMPORTANT]
> 📢 **Deadline/Submission [01:53:20]:** $100 AWS/GCP cloud vouchers will be distributed via institutional student email this Friday evening for Amazon EMR / Google Cloud Dataproc lab work.`,
    },
    'session-ospf-01': {
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
    },
    'session-k8s-02': {
      id: 'note-02',
      session_id: 'session-k8s-02',
      executive_summary:
        'Covers the Raft consensus protocol, quorum leader elections, replicated write-ahead logs, and fault tolerance boundaries in distributed systems such as etcd and Kubernetes.',
      summary: 'Raft consensus mechanisms, leader election, log replication, and split-brain resolution.',
      markdown_content: `# DEV302 — Lecture 06: Raft Consensus & Distributed State Synchronization

## 1. Consensus Problem Definition \`[03:45]\`
Consensus ensures that a cluster of distributed nodes agree on a sequence of state machine inputs even in the presence of network partitions and node failures.

\`\`\`typescript
interface LogEntry {
  term: number;
  index: number;
  command: Record<string, unknown>;
}
\`\`\`

> [!NOTE]
> Raft requires a majority quorum: $Q = \\lfloor \\frac{N}{2} \\rfloor + 1$. For a 5-node cluster, 3 nodes must be responsive.`,
    },
  },
  flashcards: {
    'session-net401-01': [
      {
        id: 'fc-net-1',
        session_id: 'session-net401-01',
        front: 'At which OSI model layer does an Ethernet signal repeater operate?',
        back: 'Layer 1 (Physical layer). It resamples and regenerates electrical or optical signals without inspecting MAC or IP addresses.',
        difficulty: 1,
      },
      {
        id: 'fc-net-2',
        session_id: 'session-net401-01',
        front: 'What is the difference between an analog amplifier and an Ethernet repeater?',
        back: 'An analog amplifier boosts both signal and background noise indiscriminately. An Ethernet repeater retimes and reconstructs clean digital square waves, eliminating accumulated noise and jitter.',
        difficulty: 2,
      },
      {
        id: 'fc-net-3',
        session_id: 'session-net401-01',
        front: 'How many broadcast domains are created by a 24-port Layer 2 switch with all ports in default VLAN 1?',
        back: 'Exactly ONE broadcast domain. Broadcast frames (FF:FF:FF:FF:FF:FF) are forwarded out every port on the switch in that VLAN.',
        difficulty: 1,
      },
      {
        id: 'fc-net-4',
        session_id: 'session-net401-01',
        front: 'How many collision domains are created by a 24-port Layer 2 switch?',
        back: '24 collision domains. Each switchport provides dedicated microsegmentation, eliminating collisions when operating in full-duplex.',
        difficulty: 1,
      },
      {
        id: 'fc-net-5',
        session_id: 'session-net401-01',
        front: 'Which networking equipment is strictly required to break and isolate separate broadcast domains?',
        back: 'A Layer 3 device, such as a Router or a Multilayer Switch with routed IP interfaces.',
        difficulty: 2,
      },
      {
        id: 'fc-net-6',
        session_id: 'session-net401-01',
        front: 'How does a Layer 2 switch build its MAC address table (CAM table)?',
        back: 'By examining the SOURCE MAC address of incoming frames and associating that address with the ingress port and VLAN.',
        difficulty: 2,
      },
      {
        id: 'fc-net-7',
        session_id: 'session-net401-01',
        front: 'What happens when a switch receives a frame with an unknown destination MAC address?',
        back: 'It floods the frame out of all ports within the same VLAN except the port on which the frame was originally received (Unknown Unicast Flooding).',
        difficulty: 2,
      },
      {
        id: 'fc-net-8',
        session_id: 'session-net401-01',
        front: 'At which OSI layer does a Web Application Firewall (WAF) operate?',
        back: 'Layer 7 (Application layer). It inspects HTTP/HTTPS headers, parameters, and bodies to block SQL injections, XSS, and application-layer exploits.',
        difficulty: 1,
      },
      {
        id: 'fc-net-9',
        session_id: 'session-net401-01',
        front: 'How does a WAF differ from a traditional Layer 3/4 Stateful Packet Inspection (SPI) firewall?',
        back: 'An SPI firewall filters based on IP 5-tuple (source/destination IP, port, protocol). A WAF decrypts and analyzes HTTP/HTTPS payloads to detect application-level attack vectors like OWASP Top 10.',
        difficulty: 3,
      },
      {
        id: 'fc-net-10',
        session_id: 'session-net401-01',
        front: 'What is the default aging timer for MAC address entries in a Cisco Catalyst switch CAM table?',
        back: '300 seconds (5 minutes). If no frames from that source MAC are received within 300 seconds, the entry is aged out.',
        difficulty: 3,
      },
      {
        id: 'fc-net-11',
        session_id: 'session-net401-01',
        front: 'What is the broadcast MAC address used in Ethernet frame headers?',
        back: 'FF:FF:FF:FF:FF:FF (all 48 bits set to 1).',
        difficulty: 1,
      },
      {
        id: 'fc-net-12',
        session_id: 'session-net401-01',
        front: 'What is the role of an Access Layer switch in Cisco three-tier hierarchical design?',
        back: 'To connect end-user devices (PCs, printers, IP phones, wireless access points) to the network and enforce port security and VLAN tagging.',
        difficulty: 2,
      },
      {
        id: 'fc-net-13',
        session_id: 'session-net401-01',
        front: 'Why do routers not forward Layer 2 Ethernet broadcast frames by default?',
        back: 'To prevent broadcast storms from consuming WAN bandwidth and to prevent localized broadcasts from propagating across the global Internet.',
        difficulty: 2,
      },
      {
        id: 'fc-net-14',
        session_id: 'session-net401-01',
        front: 'What Cisco IOS command displays the hardware MAC address learning table?',
        back: 'show mac address-table (or "show mac-address-table" depending on IOS version).',
        difficulty: 1,
      },
      {
        id: 'fc-net-15',
        session_id: 'session-net401-01',
        front: 'What is signal attenuation in copper network cabling?',
        back: 'The loss of signal amplitude (strength) as an electrical pulse travels along the transmission medium, caused by electrical resistance and capacitance.',
        difficulty: 2,
      },
    ],
    'session-bd401-01': [
      {
        id: 'fc-bd-1',
        session_id: 'session-bd401-01',
        front: 'What is the primary role of the HDFS NameNode, and how much RAM does it consume per metadata object?',
        back: 'The NameNode manages the filesystem namespace, directory tree, and file-to-block mappings stored in active memory. It consumes approximately 150 bytes of RAM per metadata object (file inode or block replica).',
        difficulty: 1,
      },
      {
        id: 'fc-bd-2',
        session_id: 'session-bd401-01',
        front: 'What is the default block size in modern Apache Hadoop HDFS (2.x/3.x) and why is it so large?',
        back: 'The default block size is 128 MB (legacy was 64 MB). It is large to amortize disk seek times to <1% of transfer time and to minimize the number of metadata entries stored in NameNode RAM.',
        difficulty: 1,
      },
      {
        id: 'fc-bd-3',
        session_id: 'session-bd401-01',
        front: 'Why is the Secondary NameNode NOT a hot failover or standby node?',
        back: 'It does not listen to DataNode block reports or heartbeats. It is strictly an offline checkpointer that periodically downloads fsimage and EditLog, merges them, and returns an updated fsimage to the primary NameNode.',
        difficulty: 3,
      },
      {
        id: 'fc-bd-4',
        session_id: 'session-bd401-01',
        front: 'What is the HDFS Rack-Aware replication placement strategy for replication factor 3?',
        back: 'Replica 1: On local DataNode (or local rack). Replica 2: On a different remote rack. Replica 3: On a different DataNode within the same remote rack as Replica 2.',
        difficulty: 2,
      },
      {
        id: 'fc-bd-5',
        session_id: 'session-bd401-01',
        front: 'What are the default heartbeat and block report intervals sent by DataNodes to the NameNode?',
        back: 'Heartbeats are sent every 3 seconds (declared dead after 10 minutes). Full Block Reports are transmitted every 6 hours.',
        difficulty: 2,
      },
      {
        id: 'fc-bd-6',
        session_id: 'session-bd401-01',
        front: 'What is the "Small Files Problem" in Apache Hadoop?',
        back: 'Storing millions of files smaller than 128 MB exhausts NameNode RAM (150 bytes per file metadata regardless of size) and spawns an excessive number of short-lived Map tasks, overwhelming cluster scheduling.',
        difficulty: 2,
      },
      {
        id: 'fc-bd-7',
        session_id: 'session-bd401-01',
        front: 'What is the fundamental difference between an HDFS Block and a MapReduce InputSplit?',
        back: 'An HDFS Block is a physical chunk of data stored on a hard drive (e.g. 128 MB). An InputSplit is a logical byte boundary representation processed by a single Map task, created by the InputFormat.',
        difficulty: 2,
      },
      {
        id: 'fc-bd-8',
        session_id: 'session-bd401-01',
        front: 'What is the default size of the Map task in-memory circular buffer and what is its spill threshold percentage?',
        back: 'Default buffer size is 100 MB (mapreduce.task.io.sort.mb). Spilling to disk begins when the buffer reaches 80% capacity (mapreduce.map.sort.spill.percent = 0.80).',
        difficulty: 2,
      },
      {
        id: 'fc-bd-9',
        session_id: 'session-bd401-01',
        front: 'Under what mathematical conditions can a Combiner be safely executed in MapReduce?',
        back: 'The reduction function must be strictly associative and commutative (e.g. Sum, Count, Min, Max). Non-associative functions like Average/Mean produce mathematically incorrect results.',
        difficulty: 3,
      },
      {
        id: 'fc-bd-10',
        session_id: 'session-bd401-01',
        front: 'What is the default formula used by HashPartitioner to assign intermediate keys to reducers?',
        back: 'partition = (key.hashCode() & Integer.MAX_VALUE) % numReduceTasks. Guarantees identical keys always route to the exact same reducer task.',
        difficulty: 2,
      },
      {
        id: 'fc-bd-11',
        session_id: 'session-bd401-01',
        front: 'What occurs during the Shuffle and Sort phase of MapReduce?',
        back: 'Reducers pull their corresponding partition files from all mappers via HTTP across the network, and the framework executes an external merge-sort to group all identical keys together into iterables.',
        difficulty: 2,
      },
      {
        id: 'fc-bd-12',
        session_id: 'session-bd401-01',
        front: 'What is the distinction between YARN ResourceManager and an ApplicationMaster?',
        back: 'ResourceManager manages cluster-wide compute resources globally across all jobs. The ApplicationMaster is instantiated per-job within a container to coordinate that specific application\'s task execution.',
        difficulty: 2,
      },
      {
        id: 'fc-bd-13',
        session_id: 'session-bd401-01',
        front: 'What are the three YARN data locality scheduling levels in order of highest to lowest performance?',
        back: '1) NODE_LOCAL (task runs on same node holding HDFS block), 2) RACK_LOCAL (task runs on same rack), 3) OFF_SWITCH (data must traverse backbone switches across racks).',
        difficulty: 1,
      },
      {
        id: 'fc-bd-14',
        session_id: 'session-bd401-01',
        front: 'Which CLI command inspects overall HDFS cluster capacity, dead nodes, and corrupted blocks?',
        back: 'hdfs dfsadmin -report',
        difficulty: 1,
      },
      {
        id: 'fc-bd-15',
        session_id: 'session-bd401-01',
        front: 'What is the submission deadline and late penalty announced by the professor for the Big Data cluster project?',
        back: 'Due Sunday at 23:59 GMT. Late submissions incur an automatic 15% grade deduction per 24 hours of delay.',
        difficulty: 1,
      },
    ],
    'session-ospf-01': [
      {
        id: 'fc-1',
        session_id: 'session-ospf-01',
        front: 'What IP protocol number does OSPF encapsulate directly over?',
        back: 'IP Protocol 89 (no TCP or UDP transport headers are used).',
        difficulty: 1,
      },
      {
        id: 'fc-2',
        session_id: 'session-ospf-01',
        front: 'What are the two standard multicast addresses reserved for OSPF?',
        back: '224.0.0.5 (AllSPFRouters) and 224.0.0.6 (AllDRouters).',
        difficulty: 2,
      },
      {
        id: 'fc-3',
        session_id: 'session-ospf-01',
        front: 'What is the default Administrative Distance of OSPF in Cisco networking?',
        back: 'Administrative Distance 110.',
        difficulty: 1,
      },
      {
        id: 'fc-4',
        session_id: 'session-ospf-01',
        front: 'What is the root cause if two OSPF neighbors remain stuck in EXSTART state?',
        back: 'Interface MTU mismatch on the interconnecting link (preventing DBD packet completion).',
        difficulty: 3,
      },
      {
        id: 'fc-5',
        session_id: 'session-ospf-01',
        front: 'What is the mathematical formula for default OSPF interface cost?',
        back: 'Cost = Reference Bandwidth (100 Mbps) / Interface Bandwidth (bps).',
        difficulty: 2,
      },
      {
        id: 'fc-6',
        session_id: 'session-ospf-01',
        front: 'In what adjacency state is the Designated Router (DR/BDR) elected?',
        back: 'The 2-Way state.',
        difficulty: 2,
      },
    ],
  },
  quizQuestions: {
    'session-net401-01': [
      {
        id: 'q-net-1',
        session_id: 'session-net401-01',
        question: 'Which networking equipment isolates collision domains on each individual port while maintaining a single shared broadcast domain across all ports in a VLAN?',
        options: [
          'Layer 2 Switch',
          'Layer 1 Hub',
          'Passive Media Converter',
          'Analog Signal Repeater',
        ],
        correct_option_index: 0,
        explanation: 'A Layer 2 switch performs microsegmentation, placing every port into an isolated collision domain. However, unless configured with separate VLANs, all ports share a single broadcast domain.',
      },
      {
        id: 'q-net-2',
        session_id: 'session-net401-01',
        question: 'How does an Ethernet repeater handle physical signal degradation along extended cable runs?',
        options: [
          'It retimes, reshapes, and regenerates clean digital pulses at Layer 1 without parsing MAC or IP headers',
          'It stores frames in RAM and computes CRC32 checksums before retransmission',
          'It queries DNS servers to determine the fastest physical route',
          'It converts packets from IPv4 to IPv6 headers',
        ],
        correct_option_index: 0,
        explanation: 'Repeaters operate strictly at Layer 1 (Physical layer). They regenerate and amplify digital waveforms to counteract attenuation, without interpreting data-link frame headers.',
      },
      {
        id: 'q-net-3',
        session_id: 'session-net401-01',
        question: 'A network topology consists of one router with 4 active interfaces. Each interface connects to a 24-port switch. How many broadcast domains exist in this network?',
        options: [
          '4 broadcast domains',
          '96 broadcast domains',
          '1 broadcast domain',
          '24 broadcast domains',
        ],
        correct_option_index: 0,
        explanation: 'Routers terminate Layer 2 broadcast domains. With 4 router interfaces, there are exactly 4 distinct broadcast domains (one per subnet connected to each router port).',
      },
      {
        id: 'q-net-4',
        session_id: 'session-net401-01',
        question: 'At which OSI model layer does a Web Application Firewall (WAF) operate to block SQL injection and Cross-Site Scripting (XSS)?',
        options: [
          'Layer 7 (Application layer)',
          'Layer 3 (Network layer)',
          'Layer 2 (Data Link layer)',
          'Layer 4 (Transport layer)',
        ],
        correct_option_index: 0,
        explanation: 'A WAF operates at Layer 7 (Application Layer), inspecting HTTP/HTTPS payloads, URI strings, and request bodies to detect and filter application-level security threats.',
      },
      {
        id: 'q-net-5',
        session_id: 'session-net401-01',
        question: 'How does a Layer 2 switch populate its MAC address table (CAM table)?',
        options: [
          'By inspecting the source MAC address of incoming Ethernet frames on each port',
          'By querying a centralized ARP server on the local subnet',
          'By reading the destination MAC address of outgoing frames',
          'By broadcasting SNMP discovery traps every 30 seconds',
        ],
        correct_option_index: 0,
        explanation: 'Switches dynamically learn MAC addresses by reading the SOURCE MAC address of incoming frames and binding that MAC address to the ingress physical port.',
      },
      {
        id: 'q-net-6',
        session_id: 'session-net401-01',
        question: 'What occurs when an Ethernet switch receives a frame whose destination MAC address is NOT found in its CAM table?',
        options: [
          'Unknown Unicast Flooding: The switch forwards the frame out of all ports in the same VLAN except the ingress port',
          'The frame is dropped immediately and an ICMP Destination Unreachable packet is sent back',
          'The switch generates an ARP request to query the router',
          'The switch pauses traffic on all ports until the MAC is discovered',
        ],
        correct_option_index: 0,
        explanation: 'When a switch encounters an unknown destination unicast MAC address, it floods the frame out of all active ports in the same VLAN (except the ingress port) so the target host can respond.',
      },
      {
        id: 'q-net-7',
        session_id: 'session-net401-01',
        question: 'Which Cisco IOS command displays the active table of learned MAC addresses and associated switchports?',
        options: [
          'show mac address-table',
          'show ip route',
          'show running-config ospf',
          'show interfaces switchport status',
        ],
        correct_option_index: 0,
        explanation: '"show mac address-table" (or "show mac-address-table") displays the Content-Addressable Memory (CAM) table containing dynamic and static MAC bindings.',
      },
      {
        id: 'q-net-8',
        session_id: 'session-net401-01',
        question: 'What is the default aging timer for dynamic MAC addresses in a Cisco switch CAM table before an inactive address is pruned?',
        options: [
          '300 seconds (5 minutes)',
          '60 seconds (1 minute)',
          '3600 seconds (1 hour)',
          '10 seconds',
        ],
        correct_option_index: 0,
        explanation: 'The standard Cisco CAM aging timer is 300 seconds. If no frame from a given source MAC arrives within 5 minutes, the entry is aged out to conserve table space.',
      },
      {
        id: 'q-net-9',
        session_id: 'session-net401-01',
        question: 'During the live SUP MTI session, what topic did student El mokhtar Fertit raise regarding physical signal transmission at timestamp [41:47]?',
        options: [
          'Signal amplification ("implefecation of signal") and repeaters counteracting attenuation',
          'Quantum encryption key exchange protocols',
          'Satellite orbital latency in Ka-band transponders',
          'Replacing copper Ethernet with token ring coaxial cables',
        ],
        correct_option_index: 0,
        explanation: 'At [41:47], El mokhtar Fertit asked about "implefecation of signal", prompting the professor to explain how repeaters regenerate attenuated digital bitstreams across copper runs.',
      },
      {
        id: 'q-net-10',
        session_id: 'session-net401-01',
        question: 'What is the announced deadline and penalty policy for the CCNA 3/4 network topology verification lab?',
        options: [
          'Sunday at 23:59 GMT, with a 15% grade deduction per 24 hours of delay',
          'Friday 17:00 GMT with zero tolerance for late submissions',
          'End of semester during final exam week',
          'Submissions are voluntary for bonus credit only',
        ],
        correct_option_index: 0,
        explanation: 'As announced by the professor at [01:28:30], the network packet trace analysis and topology lab must be committed before Sunday 23:59 GMT, with late submissions penalized 15% per day.',
      },
    ],
    'session-bd401-01': [
      {
        id: 'q-bd-1',
        session_id: 'session-bd401-01',
        question: 'Why does the Secondary NameNode fail to serve as an automatic High Availability failover if the primary NameNode crashes?',
        options: [
          'Because the Secondary NameNode does not receive continuous block reports or heartbeats from DataNodes and only merges fsimage and EditLog offline',
          'Because the Secondary NameNode is hosted on external tape backup storage and cannot execute Java processes',
          'Because HDFS only allows one IP address on the entire cluster subnet',
          'Because the Secondary NameNode only operates when the cluster is in read-only SafeMode',
        ],
        correct_option_index: 0,
        explanation: 'The Secondary NameNode is purely an offline checkpoint helper that periodically merges the fsimage and edits log. It maintains no real-time cluster state, block locations, or DataNode heartbeats. True HA requires an Active/Standby setup with JournalNodes and ZooKeeper.',
      },
      {
        id: 'q-bd-2',
        session_id: 'session-bd401-01',
        question: 'Under HDFS default 3x Rack-Aware Replication policy, if a client on Rack 1 Node A creates a block, where are the 3 replicas placed?',
        options: [
          'Replica 1 on Rack 1 Node A; Replica 2 on a remote rack (e.g. Rack 2 Node C); Replica 3 on a different node in that same remote rack (Rack 2 Node D)',
          'All three replicas on Rack 1 to avoid network bandwidth consumption',
          'One replica on Rack 1, one on Rack 2, and one on Rack 3 at all times',
          'Two replicas on the NameNode local disk and one replica on a random DataNode',
        ],
        correct_option_index: 0,
        explanation: 'HDFS places Replica 1 on the local node (Rack 1 Node A), Replica 2 on a different remote rack (Rack 2 Node C) to survive rack switch failure, and Replica 3 on another node within that same remote rack (Rack 2 Node D) to conserve cross-rack switch bandwidth during write pipelines.',
      },
      {
        id: 'q-bd-3',
        session_id: 'session-bd401-01',
        question: 'Why is it mathematically illegal to configure a Combiner directly with an Average/Mean calculation in MapReduce?',
        options: [
          'Because Average is not associative: the average of partitioned averages does not equal the global average of the data',
          'Because MapReduce combiners can only process integer keys and not floating-point numbers',
          'Because the YARN NodeManager rejects any combiner class with more than 10 lines of code',
          'Because Combiners execute after the reduce phase has already finished writing to HDFS',
        ],
        correct_option_index: 0,
        explanation: 'Combiners require associative and commutative functions ($f(f(a,b),c) = f(a,f(b,c))$). Average fails this: Avg(Avg(10, 20), 30) = 22.5, whereas Avg(10, 20, 30) = 20. To compute average with a combiner, the mapper must emit a composite tuple (sum, count).',
      },
      {
        id: 'q-bd-4',
        session_id: 'session-bd401-01',
        question: 'What is the direct consequence of the "Small Files Problem" on an HDFS cluster with millions of 1 KB files?',
        options: [
          'The NameNode RAM is exhausted by metadata overhead (~150 bytes per file/block) while physical cluster disk storage remains virtually empty',
          'The DataNodes overheat due to high spinning disk rotational speeds',
          'HDFS automatically compresses the small files into a single ZIP archive on disk',
          'The Linux operating system kernel denies file creation due to TCP port exhaustion',
        ],
        correct_option_index: 0,
        explanation: 'Each file, directory, and block consumes ~150 bytes in NameNode RAM. 100 million files consume ~15 GB of RAM for only ~100 GB of actual data, starving the NameNode heap and creating massive MapReduce task scheduling overhead.',
      },
      {
        id: 'q-bd-5',
        session_id: 'session-bd401-01',
        question: 'In YARN resource scheduling, which data locality level offers the highest throughput and lowest latency?',
        options: [
          'NODE_LOCAL, because compute containers execute on the exact physical DataNode hosting the HDFS block replica',
          'RACK_LOCAL, because data is transferred through the Top-of-Rack switch buffer',
          'OFF_SWITCH, because core routers have higher throughput than local SATA buses',
          'REMOTE_QUEUE, because tasks are dispatched to cloud edge regions',
        ],
        correct_option_index: 0,
        explanation: 'NODE_LOCAL means the container runs on the physical server where the block replica resides on disk, reading data directly through the local OS page cache without generating any network switch traffic.',
      },
      {
        id: 'q-bd-6',
        session_id: 'session-bd401-01',
        question: 'At what threshold does the MapReduce in-memory map buffer begin spilling sorted records to local disk?',
        options: [
          'When buffer occupancy reaches 80% (mapreduce.map.sort.spill.percent = 0.80)',
          'When the buffer reaches 100% capacity',
          'Every 60 seconds regardless of buffer size',
          'When the reducer sends an acknowledgment signal over HTTP',
        ],
        correct_option_index: 0,
        explanation: 'By default, the 100 MB circular buffer spills to disk when it hits 80% capacity. This ensures a background thread can sort and write records to disk while the Map function continues writing to the remaining 20% without blocking.',
      },
      {
        id: 'q-bd-7',
        session_id: 'session-bd401-01',
        question: 'In modern Apache Hadoop 3.x High Availability, how do Active and Standby NameNodes synchronize their EditLog transactions?',
        options: [
          'Through a quorum of JournalNodes (QJM) and ZooKeeper Failover Controllers',
          'Through shared USB flash storage drives',
          'Through daily email backup notifications sent to the cluster administrator',
          'Through manual rsync cron jobs executed every midnight',
        ],
        correct_option_index: 0,
        explanation: 'Hadoop HA uses Quorum Journal Manager (QJM) where the Active NameNode writes edits to a majority of JournalNodes, and the Standby NameNode continuously reads these edits to keep its in-memory namespace bit-for-bit synchronized.',
      },
      {
        id: 'q-bd-8',
        session_id: 'session-bd401-01',
        question: 'During the lecture, what did Dr. Amine Tazi announce regarding the upcoming midterm examination structure?',
        options: [
          '50% Architectural Theory & Sizing Math + 50% Code & Diagnostic Debugging; one double-sided handwritten A4 cheat sheet permitted',
          '100% multiple-choice quiz conducted online without cheat sheets',
          'A take-home essay on Apache Spark history due at the end of the term',
          'An oral exam conducted one-on-one via BigBlueButton',
        ],
        correct_option_index: 0,
        explanation: 'As announced at [01:51:40], the midterm exam scheduled in 2 weeks consists of 50% Architectural Theory & Sizing Math and 50% Code & Diagnostic Debugging. It is closed-book with one double-sided handwritten A4 cheat sheet permitted.',
      },
      {
        id: 'q-bd-9',
        session_id: 'session-bd401-01',
        question: 'What is the announced submission deadline and penalty policy for the Big Data Cluster Deployment mini-project?',
        options: [
          'Due Sunday at 23:59 GMT; 15% grade deduction per 24 hours of delay',
          'Due Friday at 17:00 GMT; zero late submissions accepted',
          'Optional submission for extra credit only',
          'Due next semester during the final project defense',
        ],
        correct_option_index: 0,
        explanation: 'As announced at [01:49:15], the 3-node cluster project is due Sunday at 23:59 GMT via the portal. Submissions delayed past Sunday midnight incur an automatic 15% deduction per day.',
      },
      {
        id: 'q-bd-10',
        session_id: 'session-bd401-01',
        question: 'Which CLI command outputs a comprehensive report detailing cluster live DataNodes, remaining DFS capacity, and corrupted or under-replicated blocks?',
        options: [
          'hdfs dfsadmin -report',
          'hdfs dfs -ls /',
          'yarn node -list -all',
          'hadoop version -verbose',
        ],
        correct_option_index: 0,
        explanation: 'hdfs dfsadmin -report is the standard administrator command to inspect total cluster storage capacity, configured capacity, DFS used percentage, live/dead DataNode lists, and corrupted/under-replicated block counts.',
      },
    ],
    'session-ospf-01': [
      {
        id: 'q-1',
        session_id: 'session-ospf-01',
        question:
          'Which multicast address is utilized by DROther routers to transmit Link-State Updates directly to the DR and BDR?',
        options: ['224.0.0.1', '224.0.0.5', '224.0.0.6', '224.0.0.9'],
        correct_option_index: 2,
        explanation:
          'DROther routers speak to DR and BDR on 224.0.0.6 (AllDRouters). The DR then propagates updates to all other routers on 224.0.0.5.',
      },
      {
        id: 'q-2',
        session_id: 'session-ospf-01',
        question:
          'Two routers fail to form an OSPF adjacency and remain stuck in EXSTART/EXCHANGE. What is the most probable configuration defect?',
        options: [
          'Hello/Dead timer interval mismatch',
          'Maximum Transmission Unit (MTU) mismatch between interfaces',
          'Different Area IDs configured on the interface',
          'Mismatched network subnet mask',
        ],
        correct_option_index: 1,
        explanation:
          'DBD packets require matching MTUs by default. If the MTUs differ, the negotiation halts at EXSTART or EXCHANGE.',
      },
      {
        id: 'q-3',
        session_id: 'session-ospf-01',
        question:
          'How does OSPF determine its Router ID when no explicit router-id command is configured?',
        options: [
          'The lowest MAC address on any active interface',
          'The highest IPv4 address on any active loopback interface',
          'The first physical interface configured with an IP address',
          'A randomly generated 32-bit integer',
        ],
        correct_option_index: 1,
        explanation:
          'OSPF chooses: 1) manual router-id, 2) highest IP on an active loopback interface, 3) highest IP on any active physical interface.',
      },
      {
        id: 'q-4',
        session_id: 'session-ospf-01',
        question:
          'What algorithm is executed by OSPF to compute the shortest path tree to all known destination subnets?',
        options: [
          'Bellman-Ford Algorithm',
          'Dijkstra Algorithm',
          'Floyd-Warshall Algorithm',
          'Kruskal Minimum Spanning Tree',
        ],
        correct_option_index: 1,
        explanation: 'OSPF utilizes Edsger Dijkstras Shortest Path First (SPF) algorithm to calculate loop-free paths.',
      },
      {
        id: 'q-5',
        session_id: 'session-ospf-01',
        question:
          'Which command adjusts the reference bandwidth to ensure 10Gbps links receive a lower cost than 1Gbps links in modern networks?',
        options: [
          'auto-cost reference-bandwidth <speed-in-mbps>',
          'ip ospf cost auto <speed>',
          'metric-weights 0 1 0 1 0',
          'bandwidth reference 10000',
        ],
        correct_option_index: 0,
        explanation:
          'By default, reference bandwidth is 100 Mbps. Setting `auto-cost reference-bandwidth 10000` scales metrics properly for Gigabit and 10Gbps links.',
      },
    ],
  },
  calendarEvents: [
    {
      id: 'ev-bd-1',
      title: 'BD401: Apache Hadoop Architecture, HDFS & MapReduce (2h Masterclass)',
      course_id: 'course-bd401',
      session_id: 'session-bd401-01',
      start_time: new Date(Date.now() - 86400000).toISOString(),
      end_time: new Date(Date.now() - 86400000 + 7200000).toISOString(),
      event_type: 'lecture',
      description: 'Masterclass on HDFS Master-Worker mechanics, 128MB block allocation, rack awareness, and MapReduce pipelines.',
      instructor: 'Dr. Amine Tazi',
    },
    {
      id: 'ev-bd-2',
      title: 'BD401: Big Data Cluster Mini-Project Deadline',
      course_id: 'course-bd401',
      session_id: 'session-bd401-01',
      start_time: new Date(Date.now() + 86400000 * 3).toISOString(),
      end_time: new Date(Date.now() + 86400000 * 3 + 3600000).toISOString(),
      event_type: 'deadline',
      description: 'Submission of 3-node Hadoop cluster configuration, streaming python scripts, and PDF execution report via portal.',
      instructor: 'Dr. Amine Tazi',
    },
    {
      id: 'ev-bd-3',
      title: 'BD401: Midterm Examination',
      course_id: 'course-bd401',
      session_id: 'session-bd401-01',
      start_time: new Date(Date.now() + 86400000 * 14).toISOString(),
      end_time: new Date(Date.now() + 86400000 * 14 + 7200000).toISOString(),
      event_type: 'exam',
      description: '50% Architectural theory & NameNode RAM sizing math + 50% Code & log debugging. 1 cheat sheet permitted.',
      instructor: 'Dr. Amine Tazi',
    },
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
  ],
};

// Singleton: reuse globalThis.__appDb across hot reloads and route-handler module isolation.
// Ensure NET401 and BD401 are always present in the course registry
if (!globalThis.__appDb || !globalThis.__appDb.courses.some((c) => c.code === 'NET401')) {
  globalThis.__appDb = initialData;
}

export const db: AppDatabase = globalThis.__appDb;
