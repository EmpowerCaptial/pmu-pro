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
            time: '3:00 – 3:20',
            title: 'Closing Reflection',
            instructorScript: `Put your practice skin in front of you. Circle the best line you made today. That one line tells us you can do this… and the rest tells us where to focus.`,
            activities: ['Guided reflection discussion.']
          },
          {
            time: '3:20 – 3:30',
            title: 'Spaced Review: Safety Foundations',
            instructorScript: 'Quick review of key safety concepts: BBP disposal, workstation setup, hand positioning.',
            activities: ['5-minute oral quiz: "What are the 3 critical safety checkpoints before starting any procedure?"']
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
            title: 'Skin Anatomy & Muscles in the Face (Lecture + Instructor Draw)',
            instructorScript: `The epidermis sheds. The dermis holds pigment. We implant pigment into the upper dermis — not the epidermis, not the lower dermis. This requires control, not pressure.

Understanding facial muscles is critical — the frontalis, orbicularis oculi, and corrugator supercilii all affect how pigment settles and how brows move. When you understand muscle structure, you understand why certain brow shapes work better with certain face shapes.`,
            activities: [
              'Draw skin layers on whiteboard; students mirror the drawing.',
              'Draw facial muscle map focusing on forehead and brow area muscles.',
              'Checkpoint questions on shallow vs deep placement outcomes.',
              'Discussion: How muscle movement affects brow design and healing.'
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
            time: '12:50 – 1:50',
            title: 'Face Shape to Brow Anatomy (Whiteboard Breakdown)',
            instructorScript: `The eyebrow is not decoration — it is architecture. Our job is to create structure that aligns with the client's bone, muscle movement, and natural asymmetry.

Face shape determines brow shape. Round faces need angular brows. Square faces need softer curves. Oval faces can carry most shapes, but the arch placement matters. Long faces need horizontal emphasis. Heart-shaped faces need balance at the tail.

If you depend on stencils, you will never be a professional. Professionals see structure. Professionals see face shape and design accordingly.`,
            activities: [
              'Whiteboard: face shape analysis — round, square, oval, long, heart-shaped.',
              'Whiteboard: brow head, body, arch, tail alignment for each face shape.',
              'Students sketch face shapes and corresponding brow designs in notebooks.',
              'Pair activity: analyze partner face shape and propose brow design.'
            ]
          },
          {
            time: '1:50 – 2:50',
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
            title: 'Color Theory Fundamentals & Color Wheel Paint Exercise',
            instructorScript: `Brows do not heal the same color they apply. This is why PMU cannot be "color matching by eye." We match undertones, not what we see in the moment.

The color wheel is your foundation. Understanding primary, secondary, and tertiary colors, along with complementary and analogous relationships, helps you predict how pigments will interact and heal.`,
            activities: [
              'Lecture hue/value/temperature with visuals.',
              'Color wheel paint exercise: students create primary, secondary, and tertiary color wheels.',
              'Demonstrate complementary color relationships and how they affect pigment mixing.',
              'Checkpoint questions on gray/orange heals and Fitzpatrick tendencies.'
            ]
          },
          {
            time: '10:35 – 11:05',
            title: 'Organic & Inorganic Pigments Lecture + Pigment Brand Comparison & Undertone Swatch Lab',
            instructorScript: `Organic and inorganic pigments behave differently in the skin. Organic pigments are carbon-based, fade faster, and create softer, more natural results. Inorganic pigments are metal-based, last longer, but can shift to cooler tones over time.

Understanding this distinction helps you choose the right pigment for each client's skin type and desired outcome. Look at how your pigment spreads. That tells you viscosity and saturation. If you learn to read pigment on paper, you can predict healed results on skin.`,
            activities: [
              'Lecture: Organic vs inorganic pigment chemistry, healing behavior, and retention differences.',
              'Visual comparison: Show examples of organic and inorganic healed results.',
              'Students swatch warm, neutral, cool pigments; instructor circulates with feedback.',
              'Discussion: When to choose organic vs inorganic based on client goals and skin type.'
            ]
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
            title: 'Closing Confidence Anchor & Spaced Review',
            instructorScript: `Color is the difference between an amateur and a master. Today you learned the why behind healed results. Take photos of your swatches and your practice skin. This becomes your record of improvement.`,
            activities: ['Review: "Name 3 safety protocols from Week 1" and "What determines pigment selection?"']
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
            activities: [
              'Technique placement, angles, shading, and machine procedure sections completed together.',
              'Machine work on fake skin: students practice machine techniques on practice skin while completing workbook sections.'
            ]
          },
          {
            time: '1:15 – 2:10',
            title: 'Brow Mapping',
            instructorScript:
              'A real brow breathes. If the head is too strong, the brow loses softness. If the tail is weak, the brow loses finish. Control both.',
            activities: [
              'Brow mapping steps on paper: students practice measuring and marking brow landmarks.',
              'Transition to mannequin head: apply mapping techniques on 3D surface with proper measurements and symmetry checks.'
            ]
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
            title: 'Homework, Exit Direction & Spaced Review',
            instructorScript:
              "Today, you didn't just learn what to do — you started learning why you do it. The artists who become great are the ones who think before they touch skin.",
            activities: ['Review: "What are the 3 components of color theory?" and "Name 2 absolute contraindications."']
          }
        ],
        homework: [
          'Workbook: Healing Process & Aftercare sections.',
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
  },
  {
    id: 'week-4',
    title: 'Week 4 • Hybrid Technique & Live Model Prep',
    summary:
      'Reinforce mapping, shading precision, and build confidence transitioning from synthetic practice to live model workflow with strong consult structure.',
    days: [
      {
        id: 'day-1',
        title: 'Day 1 • Machine Technique Refinement & Hybrid Prep',
        focus: [
          'Tune mapping accuracy and soft outlining',
          'Strengthen machine fades and gradient control',
          'Simulate hybrid workflow prior to live models'
        ],
        tone: 'Calm, corrective coaching focused on build-up to live clients',
        segments: [
          {
            time: '9:30 – 9:50',
            title: 'Instructor Demonstration – Brow Shape + Soft Edge Outline',
            instructorScript:
              'The outline guides, it does not box in. Brows should grow from the face, not sit on the face.',
            activities: [
              'Draw breathable outline emphasizing soft bulb and balanced arches.'
            ]
          },
          {
            time: '9:50 – 10:40',
            title: 'Student Mapping Practice',
            activities: [
              'Partners or mannequins: reinforce soft front, balanced arches, clean tails.',
              'Instructor circulates giving precise corrections.'
            ]
          },
          {
            time: '10:40 – 11:25',
            title: 'Synthetic Skin Machine Warm-Up',
            activities: [
              'Whip shading fade exercise, tail saturation focus, bulb gradient control.',
              'Reinforce needle hang consistency and floating wrist anchor.'
            ]
          },
          {
            time: '11:25 – 12:00',
            title: 'Technique Check & Feedback Focus',
            instructorScript:
              'Each student receives one core correction to prioritize for live model day.',
            activities: ['Document personal correction in notebook.']
          },
          { time: '12:00 – 1:00', title: 'Lunch' },
          {
            time: '1:00 – 1:20',
            title: 'Live Model Prep Protocol Training',
            activities: [
              'Demonstrate tray setup, PPE sequence, sanitation flows.',
              'Emphasize professionalism and calm client presence.'
            ]
          },
          {
            time: '1:20 – 2:00',
            title: 'Mock Consult & Map on Partner',
            instructorScript:
              '“Before we begin, I want to make sure this shape supports your natural bone structure. Do you have any concerns before I show you the mirror?”',
            activities: ['Role-play greeting, consultation wording, mapping approval scripting.']
          },
          {
            time: '2:00 – 3:10',
            title: 'Hybrid Simulation',
            activities: [
              'Complete one full brow shading pass on synthetic skin then transition to mapping/outlining partner brow.',
              'Build flow memory for live work.'
            ]
          },
          {
            time: '3:10 – 3:30',
            title: 'Group Discussion & Confidence Reinforcement',
            prompts: [
              'What part of your workflow feels most natural now?',
              'What will you focus on tomorrow?'
            ]
          }
        ],
        homework: ['Prepare tools and sanitation checklist for live model day.', 'Review mapping notes recorded during feedback.']
      },
      {
        id: 'day-2',
        title: 'Day 2 • Live Model Intro Day',
        focus: [
          'Regulate nerves prior to client arrival',
          'Execute consultation, mapping, and guided shading on live model',
          'Coach aftercare delivery with luxury tone'
        ],
        tone: 'Steady, reassuring leadership that keeps students calm and confident',
        segments: [
          {
            time: '9:30 – 10:00',
            title: 'Emotion Regulation & Client Presence',
            instructorScript:
              'Your calm is your client’s calm. Breathe, speak slowly, and move with purpose.',
            activities: ['Guided breathing, posture reset, tone rehearsal.']
          },
          {
            time: '10:00 – 11:30',
            title: 'Synthetic Skin Practice (Morning Warm-Up)',
            activities: [
              'Silent studio environment, shading repetition to steady hands.',
              'Instructor adjusts wrist angle, rhythm, pressure.'
            ]
          },
          { time: '11:30 – 12:00', title: 'Room Reset & Station Preparation' },
          {
            time: '12:00 – 12:30',
            title: 'Instructor Briefing + Model Orientation',
            activities: [
              'Walkthrough of welcoming script, intake questions, reassurance cues.'
            ]
          },
          {
            time: '12:30 – 3:00',
            title: 'Live Model Hybrid Work',
            activities: [
              'Sequence: consultation, mapping approval, brow #1 shading, instructor mini-review, brow #2 shading.',
              'Instructor re-guides technique without taking over.'
            ]
          },
          {
            time: '3:00 – 3:30',
            title: 'Debrief + Aftercare Teaching',
            instructorScript:
              '“Your brows will soften 30–40% as they heal. Flaking and lightness in week two are expected—this is part of the process.”'
          }
        ],
        homework: [
          'Submit before/after images with three-sentence reflection: success, improvement area, focus for next week.'
        ]
      }
    ]
  },
  {
    id: 'week-5',
    title: 'Week 5 • Hybrid Mastery & Live Execution',
    summary:
      'Blend hair strokes with powder shading, refine fades, and execute hybrid brows on live models while sustaining luxury communication.',
    days: [
      {
        id: 'day-1',
        title: 'Day 1 • Hybrid Brow Technique & Pattern Balance',
        focus: [
          'Reinforce clean front-stroke patterns',
          'Blend stroke-to-shade transitions for natural dimension',
          'Develop personal brow aesthetic and mapping confidence'
        ],
        tone: 'Direct coaching with emphasis on balance and finesse',
        segments: [
          {
            time: '9:30 – 9:50',
            title: 'Demo + Pattern Theory',
            instructorScript:
              'Hair strokes create texture. Powder adds density. Hybrids are about balance, not symmetry perfection.',
            activities: [
              'Demonstrate stroke spine alignment, rhythm, transition zone rules.'
            ]
          },
          {
            time: '9:50 – 10:40',
            title: 'Paper Stroke Drills (Front 1/3)',
            activities: [
              'Anchor point strokes, upper/lower spine control, airy spacing up front.',
              'Instructor corrects angle consistency and taper.'
            ]
          },
          {
            time: '10:40 – 11:25',
            title: 'Synthetic Skin Stroke Work (Front Only)',
            activities: [
              'Microblade front third focusing on pressure control and blade depth.',
              'Relax finger positioning and wrist.'
            ]
          },
          {
            time: '11:25 – 12:00',
            title: 'Transition to Shading Theory',
            instructorScript: 'Your fade is your signature. Pressure down in the tail, release into the front.',
            activities: [
              'Discuss pendulum vs whip shading, fade starting point.'
            ]
          },
          { time: '12:00 – 1:00', title: 'Lunch' },
          {
            time: '1:00 – 1:20',
            title: 'Live Instructor Demo (Full Hybrid Brow)',
            activities: [
              'Map, soft outline, microblade front + spine, machine shade tail with airy transition.'
            ]
          },
          {
            time: '1:20 – 2:20',
            title: 'Student Practice on Synthetic Skin',
            activities: [
              'Complete stroke front quadrant, shaded tail, smooth fade.',
              'Instructor reminders: lighten into bulb, maintain tail saturation.'
            ]
          },
          { time: '2:20 – 2:35', title: 'Break + Hand Reset' },
          {
            time: '2:35 – 3:20',
            title: 'Partner Hybrid Mapping & Design Practice',
            instructorScript:
              'Brows should support the face, not compete with it.',
            activities: ['Map one hybrid brow on partner; avoid over-arching; respect bone structure.']
          },
          {
            time: '3:20 – 3:30',
            title: 'Reflection & Tomorrow Prep',
            prompts: [
              'What felt easier today?',
              'What are you focusing on tomorrow?'
            ]
          }
        ],
        homework: ['Create three hybrid brows on synthetic skin and upload photos to group chat.']
      },
      {
        id: 'day-2',
        title: 'Day 2 • Hybrid Brow on Live Model',
        focus: [
          'Maintain calm confidence with live client communication',
          'Execute full hybrid brow with instructor support',
          'Document results and evaluate technique choices'
        ],
        tone: 'Supportive yet performance-oriented coaching',
        segments: [
          {
            time: '9:30 – 10:00',
            title: 'Morning Nerve Reset + Stroke Warm-Up',
            activities: ['Silent stroke + shading warm-up on paper and synthetic skin.']
          },
          {
            time: '10:00 – 11:30',
            title: 'Synthetic Skin Practice',
            activities: [
              'Reinforce clean stroke fronts, smooth fade transitions, tail density.',
              'Instructor offers individual corrections.'
            ]
          },
          {
            time: '11:30 – 12:00',
            title: 'Room & Tray Setup Demonstration',
            activities: ['Barrier film, wrapped cord, pigment setup, sharps layout; students replicate their trays.']
          },
          {
            time: '12:00 – 12:30',
            title: 'Model Arrival + Intake + Consultation',
            activities: ['Practice warm greeting, skin review, mapping approval script.']
          },
          {
            time: '12:30 – 3:00',
            title: 'Live Model Hybrid Brow Execution',
            activities: [
              'Map, confirm, stroke front softly, machine shade tail → fade front.',
              'Instructor ensures breathing, wrist motion remain controlled.'
            ]
          },
          {
            time: '3:00 – 3:30',
            title: 'Debrief + Healing Expectation Coaching',
            activities: ['Students verbally teach aftercare timeline with calm authority.']
          }
        ],
        homework: [
          'Submit live model photos with noted machine speed, hand motion, and planned adjustment for next session.'
        ]
      }
    ]
  },
  {
    id: 'week-6',
    title: 'Week 6 • Luxury Artist Identity & Client Experience',
    summary:
      'Shift from solely technique to luxury brand delivery—tone, pricing, consultation language, and content creation that communicates calm authority.',
    days: [
      {
        id: 'day-1',
        title: 'Day 1 • Become the Luxury Artist',
        focus: [
          'Define personal luxury artist identity and tone',
          'Understand client psychology and pricing strategy',
          'Create brand-aligned content and consultation scripts'
        ],
        tone: 'Inspirational yet practical; push students toward confident positioning',
        segments: [
          {
            time: '9:30 – 9:55',
            title: 'Identity Activation',
            instructorScript:
              'Who is the version of you your clients expect? How does she move and speak?',
            activities: [
              'Students write Luxury Artist Identity Statement and share highlights.'
            ]
          },
          {
            time: '9:55 – 10:45',
            title: 'Luxury Client Psychology',
            activities: [
              'Teach calm authority phrases.',
              'Practice language swaps (basic vs luxury).'
            ]
          },
          {
            time: '10:45 – 11:25',
            title: 'Pricing Strategy Workshop',
            instructorScript:
              'Your price reflects the experience you deliver. Build a ladder, don’t guess.',
            activities: [
              'Create 1-year growth ladder using training → luxury tiers.'
            ]
          },
          {
            time: '11:25 – 12:00',
            title: 'Portfolio Curation',
            activities: [
              'Audit Instagram: remove off-brand work, plan healed result posts, educational posts, emotional reassurance posts.'
            ]
          },
          { time: '12:00 – 1:00', title: 'Lunch' },
          {
            time: '1:00 – 2:10',
            title: 'Content Creation + Photo Technique',
            activities: [
              'Ring light placement, camera angle drills, slow reveal videos.',
              'Students photograph each other’s mapping.'
            ]
          },
          {
            time: '2:10 – 3:00',
            title: '"Luxury Consultation Script" Practice',
            activities: [
              'Partner role-play greeting, tone pacing, mirror reveal, confidence anchoring.',
              'Instructor removes fillers or uncertain language.'
            ]
          },
          {
            time: '3:00 – 3:30',
            title: 'Brand Identity Lock-In',
            activities: [
              'Students finalize brand keywords, color palette direction, first 3 IG posts.',
              'Instructor checks clarity and authenticity.'
            ]
          }
        ],
        homework: [
          'Publish or schedule 1 brand-aligned social post.',
          'Refine consultation script and rehearse aloud.'
        ]
      },
      {
        id: 'day-2',
        title: 'Day 2 • Luxury Studio Flow & Client Experience',
        focus: [
          'Design a premium appointment experience',
          'Refine tone, posture, and aftercare delivery',
          'Continue hybrid practice with calm precision'
        ],
        tone: 'Warm leadership maintaining high standards',
        segments: [
          {
            time: '9:30 – 10:15',
            title: 'Luxury Appointment Experience Framework',
            instructorScript:
              'Luxury is quiet confidence. Know how you want clients to feel at each stage.',
            activities: ['Map early/mid/end appointment emotions and touchpoints.']
          },
          {
            time: '10:15 – 11:00',
            title: 'Tone, Posture & Conversation Coaching',
            activities: ['Practice shoulders down, soft eye contact, controlled movements.']
          },
          {
            time: '11:00 – 11:45',
            title: 'Aftercare as Education Moment',
            activities: ['Rehearse aftercare explanation in soothing cadence, refine wording.']
          },
          { time: '11:45 – 12:45', title: 'Lunch' },
          {
            time: '12:45 – 3:10',
            title: 'Applied Hybrid Brow Practice',
            activities: [
              '20 min stroke warm-up, 35 min hybrid shading repetition, 1 hour partner mapping & outline practice.',
              'Instructor cycles through correction rounds.'
            ]
          },
          {
            time: '3:10 – 3:30',
            title: 'Reflection + Goal Language Rehearsal',
            prompts: [
              '“This is the type of client I serve.”',
              '“This is how I position my work.”',
              '“This is the level of experience I deliver.”'
            ]
          }
        ],
        homework: [
          'Document one full mock appointment flow including language, touchpoints, and timing.'
        ]
      }
    ]
  },
  {
    id: 'week-7',
    title: 'Week 7 • Final Evaluation & Graduation',
    summary:
      'Validate written knowledge and practical execution through final exams, reinforce decision-making, and celebrate graduation into professional artistry.',
    days: [
      {
        id: 'day-1',
        title: 'Day 1 • Final Written Exam & Clinical Prep',
        focus: [
          'Demonstrate theory mastery across anatomy, color, contraindications, and technique',
          'Prepare tray setup, mapping, and sanitation for practical exam',
          'Assess individual readiness with targeted feedback'
        ],
        tone: 'Professional, calm testing environment with focused coaching',
        segments: [
          {
            time: '9:30 – 9:45',
            title: 'Welcome & Exam Orientation',
            instructorScript:
              'Written exam covers the full curriculum. Passing requires calm focus and clarity.',
            activities: ['Review format, passing score, retake policy, mindset cue.']
          },
          {
            time: '9:45 – 11:15',
            title: 'Final Written Exam',
            activities: ['70–90 minute proctored exam. No coaching, quiet environment.']
          },
          {
            time: '11:15 – 11:45',
            title: 'Scoring + Private Feedback Review',
            activities: [
              'Students complete reflection worksheet while instructor scores.',
              'One action item provided to each student.'
            ]
          },
          { time: '11:45 – 12:45', title: 'Lunch' },
          {
            time: '12:45 – 2:30',
            title: 'Practical Prep Workshop',
            activities: [
              'Map brows on mannequin/peer, prepare trays, verbalize sanitation sequence.',
              'Instructor assesses mapping symmetry, posture, stroke direction.'
            ]
          },
          {
            time: '2:30 – 3:30',
            title: 'Individual Readiness Check',
            activities: [
              'Students verbally demonstrate needle hang, depth description, Fitzpatrick pigment logic, reassurance script.',
              'Instructor logs pass or reinforcement needed.'
            ]
          }
        ],
        homework: [
          'Review feedback from readiness check and adjust plan for practical exam.',
          'Ensure all tools and consent forms prepared for live model day.'
        ]
      },
      {
        id: 'day-2',
        title: 'Day 2 • Practical Final Exam & Graduation',
        focus: [
          'Perform complete PMU brow service confidently and safely',
          'Deliver luxury aftercare education and client communication',
          'Reflect on growth and finalize professional plan'
        ],
        tone: 'Supportive exam environment with high standards',
        segments: [
          {
            time: '9:30 – 9:45',
            title: 'Model Check-In & Consent Verification',
            activities: ['Students confirm candidacy, complete health and consent forms, conduct consultation.']
          },
          {
            time: '9:45 – 10:20',
            title: 'Mapping & Design Evaluation',
            activities: [
              'Students map based on bone structure and justify design before proceeding.',
              'Corrections required before continuing.'
            ]
          },
          {
            time: '10:20 – 12:45',
            title: 'Procedure Execution',
            activities: [
              'Outline/stroke pattern establishment (20–35 min)',
              'Stroke or shading build (45–75 min)',
              'Final pass/detail (10–20 min)',
              'Reveal (5 min) with calm delivery'
            ]
          },
          { time: '12:45 – 1:45', title: 'Lunch + Instructor Scoring' },
          {
            time: '1:45 – 2:15',
            title: 'Aftercare Education Demonstration',
            activities: [
              'Students walk model through healing timeline, touch-up scheduling, do’s/don’ts using luxury tone.'
            ]
          },
          {
            time: '2:15 – 3:00',
            title: 'Final Reflection + Growth Plan',
            activities: [
              'Students complete reflection: executed well, improvement focus, 3-month pricing plan, brand promise.',
              'Instructor signs off on final scores.'
            ]
          },
          {
            time: '3:00 – 3:30',
            title: 'Graduation Moment',
            instructorScript:
              '“Today, you are not just finishing training — you are beginning your role as a trusted artist. You earned this.”',
            activities: ['Photos, certificates, acknowledgment.']
          }
        ],
        homework: ['Celebrate, share graduation milestone, and outline first month action plan.']
      }
    ]
  }
]

