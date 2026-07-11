const TIME_BLOCKS = [
  { name: "Gym", startTime: "06:00", endTime: "07:00", daysOfWeek: "1,2,3,4,5,6", color: "#e85460", type: "fixed", sortOrder: 0 },
  { name: "Shower + Breakfast", startTime: "07:00", endTime: "07:30", daysOfWeek: "1,2,3,4,5,6,0", color: "#929ca9", type: "fixed", sortOrder: 1 },
  { name: "Deep Work 1", startTime: "07:30", endTime: "09:00", daysOfWeek: "1,2,3,4,5", color: "#c8a85b", type: "fixed", sortOrder: 2 },
  { name: "University", startTime: "09:00", endTime: "13:00", daysOfWeek: "1,2,3,4,5", color: "#689dc8", type: "fixed", sortOrder: 3 },
  { name: "Lunch", startTime: "13:00", endTime: "14:00", daysOfWeek: "1,2,3,4,5,6,0", color: "#929ca9", type: "fixed", sortOrder: 4 },
  { name: "Deep Work 2", startTime: "14:00", endTime: "16:00", daysOfWeek: "1,2,3,4,5", color: "#c8a85b", type: "fixed", sortOrder: 5 },
  { name: "Admin", startTime: "16:00", endTime: "17:00", daysOfWeek: "1,2,3,4,5", color: "#a08ef5", type: "fixed", sortOrder: 6 },
  { name: "Free", startTime: "17:00", endTime: "18:00", daysOfWeek: "1,2,3,4,5,6,0", color: "#3ec488", type: "fixed", sortOrder: 7 },
  { name: "Dinner", startTime: "18:00", endTime: "19:00", daysOfWeek: "1,2,3,4,5,6,0", color: "#929ca9", type: "fixed", sortOrder: 8 },
  { name: "Light Work", startTime: "19:00", endTime: "21:00", daysOfWeek: "1,2,3,4,5,6", color: "#d58b45", type: "fixed", sortOrder: 9 },
  { name: "Laptop Closes", startTime: "21:00", endTime: "21:00", daysOfWeek: "1,2,3,4,5,6,0", color: "#e85460", type: "fixed", sortOrder: 10 },
  { name: "Bed", startTime: "21:45", endTime: "05:45", daysOfWeek: "1,2,3,4,5,6,0", color: "#586573", type: "fixed", sortOrder: 11 },
  { name: "Sunday Rest", startTime: "00:00", endTime: "23:59", daysOfWeek: "0", color: "#3ec488", type: "fixed", sortOrder: 12 },
];

export default TIME_BLOCKS;
