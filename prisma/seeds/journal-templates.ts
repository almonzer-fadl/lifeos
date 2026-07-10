const JOURNAL_TEMPLATES = [
  {
    name: "Morning Intention",
    entryType: "morning_intention",
    prompts: [
      { field: "intention", label: "What matters today?", type: "textarea", required: true },
      { field: "ship", label: "One thing I will ship today", type: "text", required: true },
      { field: "gratitude", label: "One thing I'm grateful for", type: "text" },
    ],
  },
  {
    name: "Evening Review",
    entryType: "evening_review",
    prompts: [
      { field: "shipped", label: "What I shipped today", type: "textarea", required: true },
      { field: "tomorrow", label: "What tomorrow holds", type: "textarea", required: true },
      { field: "blocker", label: "What got in the way", type: "textarea", required: true },
    ],
  },
  {
    name: "Weekly Reflection",
    entryType: "weekly_review",
    prompts: [
      { field: "wins", label: "Wins this week", type: "textarea", required: true },
      { field: "lessons", label: "Lessons learned", type: "textarea" },
      { field: "adjustments", label: "What I'll adjust next week", type: "textarea", required: true },
      { field: "gym", label: "Training: sessions completed / planned", type: "text" },
      { field: "prayers", label: "Prayer consistency this week", type: "text" },
      { field: "quran", label: "Quran progress this week", type: "text" },
      { field: "finance", label: "Money: spent / income / notes", type: "text" },
    ],
  },
];

export default JOURNAL_TEMPLATES;
