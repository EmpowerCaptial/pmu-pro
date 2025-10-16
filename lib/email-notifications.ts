interface EmailSchedule {
  day: number
  subject: string
  content: string
  procedure: "brows" | "lips" | "eyeliner"
}

export const healingEmailSchedule: EmailSchedule[] = [
  // Day 1
  {
    day: 1,
    subject: "Day 1: Your PMU Healing Journey Begins",
    content:
      "Congratulations on your PMU procedure! Today is crucial for proper healing. Keep the area clean and dry, and follow your aftercare instructions carefully.",
    procedure: "brows",
  },
  // Day 3
  {
    day: 3,
    subject: "Day 3: Healing Progress Check",
    content:
      "You're doing great! Your PMU may appear darker than expected - this is completely normal. Continue with gentle cleaning and avoid picking or scratching.",
    procedure: "brows",
  },
  // Day 7
  {
    day: 7,
    subject: "Day 7: One Week Milestone",
    content:
      "You've completed your first week! The initial healing phase is nearly complete. You may notice some flaking - let it happen naturally.",
    procedure: "brows",
  },
  // Day 14
  {
    day: 14,
    subject: "Day 14: Halfway Through Healing",
    content:
      "You're making great progress! The color may appear lighter now - don't worry, it will continue to develop over the next 4-6 weeks for true healed results.",
    procedure: "brows",
  },
  // Day 21
  {
    day: 21,
    subject: "Day 21: Almost There!",
    content:
      "You're in the final stretch! Your true color is emerging. Continue protecting your PMU from sun exposure and harsh products.",
    procedure: "brows",
  },
  // Day 42
  {
    day: 42,
    subject: "Day 42: Fully Healed!",
    content:
      "Congratulations! Your PMU is now fully healed. Time to schedule your touch-up appointment if needed. Enjoy your beautiful results!",
    procedure: "brows",
  },
]

export async function scheduleHealingEmails(
  clientEmail: string,
  procedure: "brows" | "lips" | "eyeliner",
  procedureDate: Date,
) {
  // This would integrate with an email service like SendGrid, Mailgun, or Resend
  const relevantEmails = healingEmailSchedule.filter(
    (email) => email.procedure === procedure || email.procedure === "brows", // Default fallback
  )

  for (const email of relevantEmails) {
    const sendDate = new Date(procedureDate)
    sendDate.setDate(sendDate.getDate() + email.day)

    // Schedule email (this would use your preferred email service)
    console.log(`Scheduling email for ${clientEmail} on ${sendDate.toDateString()}: ${email.subject}`)
  }

  return { success: true, emailsScheduled: relevantEmails.length }
}
