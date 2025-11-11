export interface LessonSegment {
  time: string
  title: string
  instructorScript?: string
  prompts?: string[]
  activities?: string[]
  cues?: string[]
  notes?: string[]
}

export interface LessonDayPlan {
  id: string
  title: string
  focus: string[]
  tone?: string
  segments: LessonSegment[]
  homework: string[]
}

export interface LessonWeekPlan {
  id: string
  title: string
  summary?: string
  days: LessonDayPlan[]
}

export const TRAINING_LESSON_PLANS: LessonWeekPlan[] = [
  {
    id: 'week-1',
    title: 'Week 1 • Foundations & Control',
    summary:
      'Establish classroom culture, introduce PMU fundamentals, and begin muscle-memory practice with emphasis on pressure, depth, and hand stability.',
    days: [
      {
        id: 'day-1',
        title: 'Day 1 • Culture, PMU Fundamentals, Muscle Memory',
        focus: [
          'Establish classroom culture & professionalism',
          'Introduce PMU as a discipline & regulated profession',
          'Begin muscle-memory practice with controlled hand movements'
        ],
        tone: 'Direct, confident, supportive coaching',
        segments: [
          {
            time: '9:30 – 9:50',
            title: 'Welcome & Class Culture',
            instructorScript: `Good morning everyone! I’m excited to begin this journey with you. This program is not just about learning how to tattoo eyebrows. You are learning a profession — one that changes how people see themselves, and how they see the world.

My job is to support your growth, your skill development, and your confidence. Your job is to be present, stay coachable, and practice consistently — even on the days you don’t feel like it.`,
            prompts: [
              'Take out a notebook. Write your name in big letters at the top of page 1. Now write: “I am becoming a Permanent Makeup Artist.”',
              'Engagement: Turn to someone next to you and share what brought you here. Keep it under 60 seconds each.'
            ]
          },
          {
            time: '9:50 – 10:40',
            title: 'What is PMU? vs Traditional Tattooing',
            instructorScript: `Permanent Makeup is the implantation of pigment into the upper dermis to enhance natural features. It is not traditional tattooing. Tattooing goes deeper, uses different pigment chemistry, and often prioritizes saturation and longevity over subtlety. Our goal is to create natural enhancement that ages gracefully, not bold ink that spreads.`,
            activities: [
              'Whiteboard talking points: upper dermis placement, precision hair strokes, pigment chemistry designed to soften, Missouri regulations.',
              'Checkpoint question: “Why does PMU need to fade over time instead of being permanent like a tattoo?”'
            ]
          },
          {
            time: '10:40 – 11:00',
            title: 'Workbook Guided Completion (Facts about PMU)',
            instructorScript:
              'We learn together — not alone. Follow along while I read aloud, then we’ll fill in the workbook together.',
            activities: ['Instructor-led reading of highlighted workbook paragraphs.']
          },
          {
            time: '11:00 – 11:50',
            title: 'Needle Theory — The Foundation of Technique',
            instructorScript: `Your line quality comes from three things: your needle size, your needle depth, your hand speed. If any of these three do not match your machine speed, your retention suffers.`,
            activities: [
              'Demonstrate cartridges: diameter, taper, configuration.',
              'Interactive drill: students describe differences while holding cartridges.'
            ]
          },
          {
            time: '11:50 – 12:20',
            title: 'Workbook — Needle Theory Section',
            cues: ['Walk the room verifying comprehension, posture, and vocabulary usage.']
          },
          {
            time: '12:20 – 1:20',
            title: 'Lunch',
            notes: ['Encourage hydration and posture reset before afternoon block.']
          },
          {
            time: '1:20 – 2:00',
            title: 'Pressure, Depth & Hand Stability Demonstration',
            instructorScript: `Everything in PMU is about consistency — not strength. We don’t push color into the skin. We glide and anchor.`,
            activities: ['Demonstrate pencil grip vs PMU grip, pinky anchor, wrist pivot vs arm movement.']
          },
          {
            time: '2:00 – 3:00',
            title: 'Practice Skin — Line Drills',
            activities: [
              'Horizontal lines × 20, vertical lines × 20, curved lines × 20.',
              'Evaluation: even spacing, no wobbling, no pausing.'
            ],
            cues: ['Instructor reminder: “If your line is shaky, your breathing is shaky. Breathe slow → move slow.”']
          },
          {
            time: '3:00 – 3:30',
            title: 'Closing Reflection',
            instructorScript: `Put your practice skin in front of you. Circle the best line you made today. That one line tells us you can do this… and the rest tells us where to focus.`,
            activities: ['Guided reflection discussion.']
          }
        ],
        homework: [
          'Workbook: PMU vs Tattooing + Needle Theory sections.',
          'Practice skin: 2 additional sheets of line drills.'
        ]
      },
      {
        id: 'day-2',
        title: 'Day 2 • Skin Anatomy, Fitzpatrick, Brow Structure, Stroke Work',
        focus: [
          'Master skin anatomy & Fitzpatrick scale to inform technique',
          'Train brow structure mapping and guided stroke practice',
          'Reinforce precision with accountability checkpoints'
        ],
        tone: 'Direct, assertive, coach-style',
        segments: [
          {
            time: '9:30 – 9:45',
            title: 'Reset the Room & Training Mindset',
            instructorScript: `Good morning. Yesterday, you learned the language of PMU — depth, pressure, and hand stability. Today, we start control.

If you want to be great in PMU, you must learn to slow your hands and speed your thinking. If you rush, you lose quality. So today, we train precision.`,
            prompts: ['Notebook title: “Control Over Speed.”']
          },
          {
            time: '9:45 – 10:25',
            title: 'Skin Anatomy (Lecture + Instructor Draw)',
            instructorScript: `The epidermis sheds. The dermis holds pigment. We implant pigment into the upper dermis — not the epidermis, not the lower dermis. This requires control, not pressure.`,
            activities: [
              'Draw skin layers on whiteboard; students mirror the drawing.',
              'Checkpoint questions on shallow vs deep placement outcomes.'
            ]
          },
          {
            time: '10:25 – 11:00',
            title: 'Fitzpatrick Scale Training',
            instructorScript:
              'The Fitzpatrick scale tells us how skin responds to trauma and sun — both impact healing and retention. You must correctly identify skin type before selecting technique and pigment.',
            activities: ['Pair activity labeling Fitzpatrick types from photo set with immediate correction.']
          },
          {
            time: '11:00 – 11:50',
            title: 'Guided Workbook Completion',
            instructorScript:
              'You are not memorizing — you are training your eye. Follow the highlighters and write only what matters. No extra fluff.',
            activities: ['Complete Skin Anatomy, Fitzpatrick Scale, Brow Types sections together.']
          },
          { time: '11:50 – 12:50', title: 'Lunch' },
          {
            time: '12:50 – 1:20',
            title: 'Brow Shape Structure (Whiteboard Breakdown)',
            instructorScript: `The eyebrow is not decoration — it is architecture. Our job is to create structure that aligns with the client’s bone, muscle movement, and natural asymmetry.

If you depend on stencils, you will never be a professional. Professionals see structure.`,
            activities: [
              'Whiteboard: brow head, body, arch, tail alignment.',
              'Students sketch in notebooks.'
            ]
          },
          {
            time: '1:20 – 2:20',
            title: 'Dry Stroke Pattern Training',
            instructorScript:
              'Every stroke has a beginning, middle, and exit. If your exit flick is sloppy, the entire brow collapses visually.',
            activities: [
              'Demonstrate U-shape, reverse U, anchor strokes.',
              'Paper drills followed by practice skin.',
              'Evaluation: no overlap, consistent curvature.'
            ],
            cues: ['Correction phrase: “Slow your breathing. One stroke at a time. Your speed is coming from anxiety, not skill.”']
          },
          { time: '2:20 – 2:35', title: 'Break + Hand Stretch' },
          {
            time: '2:35 – 3:20',
            title: 'Guided Stroke Coaching',
            activities: ['Instructor circulates, delivers precise corrections only when standards met.'],
            cues: ['Use language: “Stop. Reset wrist. Anchor pinky. Slow. Try again.”']
          },
          {
            time: '3:20 – 3:30',
            title: 'Closing Accountability',
            instructorScript: `Take a photo of your best stroke pattern and submit to the class group chat. That will be your baseline. Next week, we compare. We improve. We do not hide from improvement.`
          }
        ],
        homework: [
          'Workbook: Healing Process & Aftercare sections.',
          'Practice skin: 2 sheets of stroke drills with photos submitted to class group chat.'
        ]
      }
    ]
  },
  {
    id: 'week-2',
    title: 'Week 2 • Color Theory & Machine Rhythm',
    summary:
      'Deepen understanding of color theory, pigment behavior, undertones, and develop machine shading mechanics with consistent rhythm and saturation awareness.',
    days: [
      {
        id: 'day-1',
        title: 'Day 1 • Color Theory & Pigment Behavior',
        focus: [
          'Clarify hue, value, temperature, and healed outcomes',
          'Practice pigment swatching and discoloration case analysis',
          'Apply color theory on practice skin with actionable coaching'
        ],
        tone: 'Calm, clear, confidence-building',
        segments: [
          {
            time: '9:30 – 9:45',
            title: 'Welcome & Warm-Up',
            instructorScript: `Welcome back. You practiced stroke control last week. Today we add the why behind color — because the color you choose determines how your work heals.

Artists who understand color corrections earn more and retain clients longer. Today, you learn to choose confidently.`,
            prompts: ['Check-in question: “What did you learn about your hands last week?” (3–5 responses).']
          },
          {
            time: '9:45 – 10:35',
            title: 'Color Theory Fundamentals',
            instructorScript: `Brows do not heal the same color they apply. This is why PMU cannot be “color matching by eye.” We match undertones, not what we see in the moment.`,
            activities: [
              'Lecture hue/value/temperature with visuals.',
              'Checkpoint questions on gray/orange heals and Fitzpatrick tendencies.'
            ]
          },
          {
            time: '10:35 – 11:05',
            title: 'Pigment Brand Comparison & Undertone Swatch Lab',
            instructorScript:
              'Look at how your pigment spreads. That tells you viscosity and saturation. If you learn to read pigment on paper, you can predict healed results on skin.',
            activities: ['Students swatch warm, neutral, cool pigments; instructor circulates with feedback.']
          },
          {
            time: '11:05 – 11:50',
            title: 'Workbook Completion — Guided',
            activities: ['Color Theory, Color Correction, Over-Saturated Brows sections filled in with oversight.']
          },
          { time: '11:50 – 12:50', title: 'Lunch' },
          {
            time: '12:50 – 1:20',
            title: 'Brow Discoloration Case Gallery',
            activities: [
              'Show gray/blue/red/warm vs cool fade photos.',
              'Prompt students to recommend corrections with concise responses.'
            ]
          },
          {
            time: '1:20 – 2:20',
            title: 'Color Theory Application on Practice Skin',
            instructorScript:
              'You’re not trying to create a final brow. You are learning how your hand translates ink to surface. This is how you build predictability.',
            activities: ['Practice pressure consistency, stroke spacing, pigment saturation on practice skin.']
          },
          { time: '2:20 – 2:35', title: 'Break' },
          {
            time: '2:35 – 3:20',
            title: 'Instructor Correction Rounds',
            cues: [
              'Use direct actionable coaching: “Slow your exit flick.” “Anchor your pinky here.” “Loosen grip by 10%.”',
              'Avoid generic praise; reinforce precision.'
            ]
          },
          {
            time: '3:20 – 3:30',
            title: 'Closing Confidence Anchor',
            instructorScript: `Color is the difference between an amateur and a master. Today you learned the why behind healed results. Take photos of your swatches and your practice skin. This becomes your record of improvement.`
          }
        ],
        homework: [
          'Workbook pigment matching exercise.',
          'Photograph 2 real brows, label Fitzpatrick type, undertone, and ideal pigment choice (observation only).'
        ]
      },
      {
        id: 'day-2',
        title: 'Day 2 • Machine Shading Mechanics & Rhythm',
        focus: [
          'Master machine setup and movement rhythm',
          'Guide shading practice with pendulum, whip, and pixel techniques',
          'Build confidence through feedback and reflection'
        ],
        tone: 'Balanced, assured coaching with calm corrections',
        segments: [
          {
            time: '9:30 – 9:50',
            title: 'Warm-Up & Review',
            instructorScript: `Yesterday, you learned how pigment behaves. Today, you learn how the machine places pigment into the skin. Shading is not about pressure — it’s about movement rhythm. Your hand speed and machine speed must agree.`,
            activities: [
              'Quick oral review: gray heals, warmth tendencies, day-1 vs healed color.',
              'Call on three students.'
            ]
          },
          {
            time: '9:50 – 10:20',
            title: 'Machine Setup Fundamentals',
            instructorScript: 'Machine control starts before you ever touch the client. Precision begins with preparation.',
            activities: [
              'Students set up machines with oversight: needle protrusion, cartridge lock, barriers.',
              'Reinforce pinky anchor positioning.'
            ]
          },
          {
            time: '10:20 – 11:10',
            title: 'Shading Movements: Pendulum + Whip Stroke',
            instructorScript:
              'Your wrist drives shading — not your fingers. Your movement is light, consistent, and rhythmic. Patchy shading means the rhythm is off.',
            activities: [
              'Demonstrate pendulum, whip, circular pixel build on camera.',
              'Students mirror the sequence.'
            ]
          },
          {
            time: '11:10 – 11:45',
            title: 'Guided Shading Practice',
            activities: [
              'Instructor counts: 10 pendulum passes, 10 whip strokes, 10 micro-circular builds.',
              'Correction phrases: “Slow your exit.” “Anchor elbow.” “Relax wrist 15%.”'
            ]
          },
          { time: '11:45 – 12:45', title: 'Lunch' },
          {
            time: '12:45 – 1:15',
            title: 'Workbook Completion — Technique Focus',
            activities: ['Technique placement, angles, shading, and machine procedure sections completed together.']
          },
          {
            time: '1:15 – 2:10',
            title: 'Brow Map → Shade Exercise',
            instructorScript:
              'A real brow breathes. If the head is too strong, the brow loses softness. If the tail is weak, the brow loses finish. Control both.',
            activities: ['Students map brow outline, fill gradient zones (head soft, body medium, tail saturated).']
          },
          { time: '2:10 – 2:25', title: 'Break' },
          {
            time: '2:25 – 3:15',
            title: 'Live Feedback Rotation',
            cues: [
              'Instructor rotates delivering concise adjustments: reduce pressure, shorten strokes, lift sooner.',
              'Reinforce skill-specific feedback only.'
            ]
          },
          {
            time: '3:15 – 3:30',
            title: 'Reflection & Accountability',
            instructorScript:
              'Machine shading is controlled movement. Take a photo of your final shading practice and submit it to the student chat. This marks your baseline — next week, we compare for improvement.'
          }
        ],
        homework: [
          'Practice skin: 1 full gradient brow with machine speed, hand speed observations, and difficulty notes logged.'
        ]
      }
    ]
  },
  {
    id: 'week-3',
    title: 'Week 3 • Contraindications, Skin Type & Confident Consults',
    summary:
      'Shift focus to skin response, risk management, and confident hands-on control through guided practice, consult simulations, and luxury communication.',
    days: [
      {
        id: 'day-1',
        title: 'Day 1 • Contraindications, Skin Type & Ink Control',
        focus: [
          'Identify clients to postpone or refer out',
          'Link skin type to technique selection and healing outcomes',
          'Strengthen ink-on practice skin skills with instructor correction'
        ],
        tone: 'Decisive, safety-first coaching with calm confidence',
        segments: [
          {
            time: '9:30 – 9:50',
            title: 'Warm-Up & Confidence Conditioning',
            instructorScript:
              'Your best skill in PMU will never be drawing — it will be decision-making. The artist who understands skin heals the best.',
            activities: ['Fast verbal drill: definitions, Fitzpatrick cool types, overworking consequences.']
          },
          {
            time: '9:50 – 10:35',
            title: 'Contraindications Overview',
            instructorScript:
              'We are not just artists — we are risk managers. The safest artist keeps their license long-term.',
            activities: ['Categorize absolute vs relative contraindications; students decide to proceed/modify/postpone.']
          },
          {
            time: '10:35 – 11:00',
            title: 'Skin Type & Texture Demo',
            activities: [
              'Compare thin vs thick, oily vs dry behavior using mannequin/slide visuals.',
              'Key line repeated: “Skin decides the technique.”'
            ]
          },
          {
            time: '11:00 – 12:00',
            title: 'Ink-On Practice Skin Warm-Up',
            activities: [
              'Microblading strokes: spacing + pressure with cue “Lighter — let the blade kiss the skin.”',
              'Machine shading: smooth gradients with cue “Widen pendulum arc by 10%.”'
            ]
          },
          { time: '12:00 – 1:00', title: 'Lunch' },
          {
            time: '1:00 – 1:20',
            title: 'Guided Workbook Quiz',
            activities: ['Complete Contraindications, Fitzpatrick, Client History sections aloud for retention.']
          },
          {
            time: '1:20 – 2:40',
            title: 'Brow Map → Ink Application Practice',
            instructorScript:
              'Your job is not to copy the demonstration. Your job is to solve the brow based on skin type + desired result.',
            activities: ['Students map brow and choose technique scenario; instructor emphasizes stroke length, fade control.']
          },
          { time: '2:40 – 2:55', title: 'Break + Wrist Reset' },
          {
            time: '2:55 – 3:20',
            title: 'Group Gallery + Feedback Circle',
            activities: ['Silent observation followed by guided critique: healed outcome prediction, consistency highlights.']
          },
          {
            time: '3:20 – 3:30',
            title: 'Homework & Exit Direction',
            instructorScript:
              'Today, you didn’t just learn what to do — you started learning why you do it. The artists who become great are the ones who think before they touch skin.'
          }
        ],
        homework: [
          'Complete 1 practice brow with photos (outline + final shading).',
          'Upload to group chat with machine speed, hand motion, and difficulty notes.'
        ]
      },
      {
        id: 'day-2',
        title: 'Day 2 • Ideal Client Consult + Machine Practice',
        focus: [
          'Lead calm, high-trust consultations with luxury language',
          'Analyze client scenarios to select appropriate brow styles',
          'Continue building smooth, controlled, low-trauma shading technique'
        ],
        tone: 'Warm, confident, professional with gentle leadership',
        segments: [
          {
            time: '9:30 – 9:50',
            title: 'Warm-Up & Luxury Language Conditioning',
            activities: [
              'Demonstrate tone differences (basic vs luxury response).',
              'Mini role-play: nervous client vs luxury-communication artist.'
            ]
          },
          {
            time: '9:50 – 10:35',
            title: 'Ideal Client Lesson',
            instructorScript:
              'Your job is not to give them what they ask for, but what will heal beautifully.',
            activities: ['Workbook: Ideal Client & Brow Suitability; identify candidates and non-candidates.']
          },
          {
            time: '10:35 – 11:05',
            title: 'Client History & Medical Screening',
            activities: [
              'Complete 3 pretend client forms, identify risk factors.',
              'Craft luxury explanations for modifications or postponements.'
            ]
          },
          {
            time: '11:05 – 11:50',
            title: 'Mock Consultations (Paired Rotation)',
            activities: [
              '12-minute consults focusing on tone, authority, technique recommendations.',
              'Instructor coaches body language and phrasing.'
            ]
          },
          { time: '11:50 – 12:50', title: 'Lunch' },
          {
            time: '12:50 – 1:20',
            title: 'Machine Motion Mastery Demo',
            instructorScript: 'Slow hands, soft touch, consistent movement. Trauma is the enemy.',
            activities: ['Demonstrate machine speed vs hand speed, pendulum and whip shading with 3-point anchor.']
          },
          {
            time: '1:20 – 2:20',
            title: 'Machine Practice on Synthetic Skin',
            activities: [
              'Pendulum shading, whip fade, border softening, saturation control.',
              'Instructor checks pressure, angle, hand posture.'
            ]
          },
          { time: '2:20 – 2:35', title: 'Break + Wrist Reset' },
          {
            time: '2:35 – 3:15',
            title: 'Full Brow Shading Exercise',
            activities: ['Map → outline → shade tail to front fade with calm environment; instructor provides quiet support.']
          },
          {
            time: '3:15 – 3:30',
            title: 'Gallery Review + Reflection Journals',
            prompts: [
              'Where is the fade strongest?',
              'What technique adjustment improved your outcome the most?',
              'Reflection prompt: “Today I felt confident when I ____. Tomorrow I want to improve ____.”'
            ]
          }
        ],
        homework: [
          'Submit 1 complete shaded brow with machine speed, hand motion, and feedback adjustment summary to group chat.'
        ]
      }
    ]
  }
  // Additional weeks can be appended here following the same structure.
]

