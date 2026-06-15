// Seed exercises into the database. Run with: DATABASE_URL="..." npx tsx prisma/seeds/exercises.ts

const exercises = [
  // Chest
  { name: "Bench Press", muscleGroup: "Chest", equipment: "Barbell", instructions: "Lie on bench, grip bar slightly wider than shoulder-width, lower to chest, press up." },
  { name: "Incline Bench Press", muscleGroup: "Chest", equipment: "Barbell", instructions: "Lie on incline bench at 30-45°, press barbell from upper chest." },
  { name: "Decline Bench Press", muscleGroup: "Chest", equipment: "Barbell", instructions: "Lie on decline bench, grip bar, lower to lower chest, press up." },
  { name: "Dumbbell Flyes", muscleGroup: "Chest", equipment: "Dumbbell", instructions: "Lie on bench, arms extended above chest with slight bend, lower dumbbells out to sides, bring back together." },
  { name: "Cable Crossover", muscleGroup: "Chest", equipment: "Cable", instructions: "Stand between two high pulleys, grab handles, bring hands together in front of chest with slight bend in elbows." },
  { name: "Push-Up", muscleGroup: "Chest", equipment: "Bodyweight", instructions: "Hands shoulder-width apart, lower body until chest nearly touches floor, push back up." },
  { name: "Incline Dumbbell Press", muscleGroup: "Chest", equipment: "Dumbbell", instructions: "Lie on incline bench, press dumbbells from chest level to full extension." },
  { name: "Chest Dips", muscleGroup: "Chest", equipment: "Bodyweight", instructions: "Grip parallel bars, lean forward, lower body until shoulders are below elbows, push up." },
  { name: "Machine Chest Press", muscleGroup: "Chest", equipment: "Machine", instructions: "Sit at chest press machine, grip handles, press forward to full extension." },
  { name: "Pec Deck", muscleGroup: "Chest", equipment: "Machine", instructions: "Sit at pec deck, place forearms on pads, bring arms together in front of chest." },

  // Back
  { name: "Deadlift", muscleGroup: "Back", equipment: "Barbell", instructions: "Stand with feet hip-width, grip bar, keep back straight, drive through heels to stand." },
  { name: "Pull-Up", muscleGroup: "Back", equipment: "Bodyweight", instructions: "Hang from bar with overhand grip, pull body up until chin clears bar, lower with control." },
  { name: "Barbell Row", muscleGroup: "Back", equipment: "Barbell", instructions: "Bend at hips with straight back, pull bar to lower chest, squeeze shoulder blades, lower." },
  { name: "Lat Pulldown", muscleGroup: "Back", equipment: "Cable", instructions: "Sit at pulldown machine, grip wide bar, pull down to upper chest, control return." },
  { name: "Seated Cable Row", muscleGroup: "Back", equipment: "Cable", instructions: "Sit at row station, grip handle, pull to torso while squeezing shoulder blades, return with control." },
  { name: "T-Bar Row", muscleGroup: "Back", equipment: "Barbell", instructions: "Straddle bar with T-bar handle, pull weight to chest while keeping back straight." },
  { name: "Single-Arm Dumbbell Row", muscleGroup: "Back", equipment: "Dumbbell", instructions: "Place one knee and hand on bench, row dumbbell to hip with opposite arm." },
  { name: "Face Pull", muscleGroup: "Back", equipment: "Cable", instructions: "Using rope attachment at face height, pull toward face while externally rotating shoulders." },
  { name: "Chin-Up", muscleGroup: "Back", equipment: "Bodyweight", instructions: "Hang from bar with underhand grip, pull body up until chin clears bar." },
  { name: "Rack Pull", muscleGroup: "Back", equipment: "Barbell", instructions: "Set bar at knee height in rack, grip and stand up with weight, focusing on upper back." },

  // Legs
  { name: "Squat", muscleGroup: "Legs", equipment: "Barbell", instructions: "Bar across upper back, feet shoulder-width, descend until thighs parallel to floor, drive up." },
  { name: "Front Squat", muscleGroup: "Legs", equipment: "Barbell", instructions: "Bar across front delts, elbows up, squat down keeping torso upright, drive up." },
  { name: "Romanian Deadlift", muscleGroup: "Legs", equipment: "Barbell", instructions: "Stand holding bar, hinge at hips with slight knee bend, lower bar along legs, return." },
  { name: "Leg Press", muscleGroup: "Legs", equipment: "Machine", instructions: "Sit in leg press, feet shoulder-width on platform, lower until knees at 90°, press back." },
  { name: "Walking Lunge", muscleGroup: "Legs", equipment: "Dumbbell", instructions: "Hold dumbbells at sides, step forward into lunge, back knee nearly touches ground, alternate legs." },
  { name: "Bulgarian Split Squat", muscleGroup: "Legs", equipment: "Dumbbell", instructions: "Back foot elevated on bench, hold dumbbells, squat with front leg until thigh parallel to floor." },
  { name: "Leg Extension", muscleGroup: "Legs", equipment: "Machine", instructions: "Sit at leg extension machine, extend legs to full knee lockout, lower with control." },
  { name: "Leg Curl", muscleGroup: "Legs", equipment: "Machine", instructions: "Lie face down on leg curl, curl heels toward glutes, lower with control." },
  { name: "Calf Raise", muscleGroup: "Legs", equipment: "Machine", instructions: "Stand on calf raise platform, push through toes to full plantar flexion, lower to stretch." },
  { name: "Hack Squat", muscleGroup: "Legs", equipment: "Machine", instructions: "Position shoulders under pads, feet shoulder-width, squat down, press through heels." },
  { name: "Goblet Squat", muscleGroup: "Legs", equipment: "Dumbbell", instructions: "Hold one dumbbell vertically against chest, squat down keeping torso upright." },
  { name: "Glute Bridge", muscleGroup: "Legs", equipment: "Bodyweight", instructions: "Lie on back, knees bent, feet flat, drive hips up squeezing glutes at top." },
  { name: "Hip Thrust", muscleGroup: "Legs", equipment: "Barbell", instructions: "Upper back on bench, bar across hips, drive hips up squeezing glutes, lower with control." },

  // Shoulders
  { name: "Overhead Press", muscleGroup: "Shoulders", equipment: "Barbell", instructions: "Stand with bar at shoulder level, press overhead until arms fully extended, lower." },
  { name: "Lateral Raise", muscleGroup: "Shoulders", equipment: "Dumbbell", instructions: "Stand holding dumbbells at sides, raise arms out to sides to shoulder height, lower with control." },
  { name: "Front Raise", muscleGroup: "Shoulders", equipment: "Dumbbell", instructions: "Hold dumbbells in front of thighs, raise one or both arms to shoulder height, lower." },
  { name: "Rear Delt Flye", muscleGroup: "Shoulders", equipment: "Dumbbell", instructions: "Bend at hips with flat back, raise dumbbells out to sides, squeeze rear delts at top." },
  { name: "Arnold Press", muscleGroup: "Shoulders", equipment: "Dumbbell", instructions: "Start with dumbbells at shoulder height palms facing you, rotate palms forward as you press up." },
  { name: "Upright Row", muscleGroup: "Shoulders", equipment: "Barbell", instructions: "Grip bar shoulder-width, pull bar up along body to chin level, elbows high, lower." },
  { name: "Cable Face Pull", muscleGroup: "Shoulders", equipment: "Cable", instructions: "Using rope at face height, pull toward face with external rotation, squeeze rear delts." },
  { name: "Push Press", muscleGroup: "Shoulders", equipment: "Barbell", instructions: "Dip at knees, drive up explosively, press bar overhead, lower to shoulders." },

  // Arms
  { name: "Barbell Curl", muscleGroup: "Arms", equipment: "Barbell", instructions: "Stand holding barbell with underhand grip, curl weight to shoulders, lower with control." },
  { name: "Dumbbell Curl", muscleGroup: "Arms", equipment: "Dumbbell", instructions: "Stand holding dumbbells at sides, curl to shoulders keeping elbows fixed, lower." },
  { name: "Hammer Curl", muscleGroup: "Arms", equipment: "Dumbbell", instructions: "Hold dumbbells with neutral grip (palms facing each other), curl to shoulders." },
  { name: "Preacher Curl", muscleGroup: "Arms", equipment: "Barbell", instructions: "Sit at preacher bench, arms on pad, curl bar to shoulders, squeeze at top, lower." },
  { name: "Close-Grip Bench Press", muscleGroup: "Arms", equipment: "Barbell", instructions: "Lie on bench, grip bar shoulder-width or closer, lower to lower chest, press up." },
  { name: "Tricep Pushdown", muscleGroup: "Arms", equipment: "Cable", instructions: "Stand at high pulley with rope or bar, push down until arms fully extended, return with control." },
  { name: "Overhead Tricep Extension", muscleGroup: "Arms", equipment: "Dumbbell", instructions: "Hold dumbbell overhead with both hands, lower behind head, extend to full lockout." },
  { name: "Skull Crusher", muscleGroup: "Arms", equipment: "Barbell", instructions: "Lie on bench, hold bar above face with arms extended, lower bar toward forehead, extend." },
  { name: "Diamond Push-Up", muscleGroup: "Arms", equipment: "Bodyweight", instructions: "Hands together forming diamond shape under chest, lower body, push up focusing on triceps." },
  { name: "Concentration Curl", muscleGroup: "Arms", equipment: "Dumbbell", instructions: "Sit on bench, elbow against inner thigh, curl dumbbell to shoulder, squeeze at top." },

  // Core
  { name: "Plank", muscleGroup: "Core", equipment: "Bodyweight", instructions: "Forearms on ground, body in straight line from head to heels, hold position." },
  { name: "Hanging Leg Raise", muscleGroup: "Core", equipment: "Bodyweight", instructions: "Hang from bar, raise legs keeping them straight or bent, lower with control." },
  { name: "Cable Crunch", muscleGroup: "Core", equipment: "Cable", instructions: "Kneel facing high pulley with rope, curl torso down bringing elbows toward knees." },
  { name: "Russian Twist", muscleGroup: "Core", equipment: "Bodyweight", instructions: "Sit with knees bent, lean back slightly, rotate torso side to side." },
  { name: "Ab Wheel Rollout", muscleGroup: "Core", equipment: "Other", instructions: "Kneel holding ab wheel, roll forward extending body, roll back to starting position." },
  { name: "Dead Bug", muscleGroup: "Core", equipment: "Bodyweight", instructions: "Lie on back, arms and legs up, lower opposite arm and leg while keeping core braced." },
  { name: "Side Plank", muscleGroup: "Core", equipment: "Bodyweight", instructions: "Lie on side, forearm on ground, lift hips forming straight line, hold." },

  // Full Body / Olympic
  { name: "Clean and Jerk", muscleGroup: "Full Body", equipment: "Barbell", instructions: "Pull bar from floor to shoulders (clean), then press overhead (jerk) in one fluid motion." },
  { name: "Snatch", muscleGroup: "Full Body", equipment: "Barbell", instructions: "Pull bar from floor to overhead in one continuous motion, catch in full squat position." },
  { name: "Kettlebell Swing", muscleGroup: "Full Body", equipment: "Kettlebell", instructions: "Hinge at hips, swing kettlebell between legs, drive hips forward swinging to shoulder height." },
  { name: "Burpee", muscleGroup: "Full Body", equipment: "Bodyweight", instructions: "Drop to push-up position, perform push-up, jump feet to hands, jump up with arms overhead." },
  { name: "Turkish Get-Up", muscleGroup: "Full Body", equipment: "Kettlebell", instructions: "Lie on back holding kettlebell up, stand up while keeping arm extended, reverse to lie back down." },
  { name: "Thruster", muscleGroup: "Full Body", equipment: "Barbell", instructions: "Front squat into overhead press in one fluid movement." },
  { name: "Battle Ropes", muscleGroup: "Full Body", equipment: "Other", instructions: "Hold rope ends, create alternating waves by moving arms up and down rapidly." },
  { name: "Sled Push", muscleGroup: "Full Body", equipment: "Other", instructions: "Push weighted sled forward while maintaining low body position and driving through legs." },

  // Cardio
  { name: "Running", muscleGroup: "Cardio", equipment: "None", instructions: "Run at steady pace or intervals. Maintain proper form with arm swing and midfoot strike." },
  { name: "Cycling", muscleGroup: "Cardio", equipment: "Machine", instructions: "Pedal at consistent pace. Adjust resistance for desired intensity." },
  { name: "Rowing", muscleGroup: "Cardio", equipment: "Machine", instructions: "Drive through legs, lean back, pull handle to chest, recover in reverse order." },
  { name: "Jump Rope", muscleGroup: "Cardio", equipment: "Other", instructions: "Jump rope at steady pace. Stay on balls of feet, minimal ground contact." },
  { name: "Swimming", muscleGroup: "Cardio", equipment: "None", instructions: "Swim laps using freestyle, breaststroke, or butterfly. Focus on breathing rhythm." },
];

export default exercises;
