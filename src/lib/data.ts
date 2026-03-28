export interface TeamMember {
  role: string;
  shortRole: string;
  names: string[];
  isAdmin?: boolean;
  isBridesmaid?: boolean;
  isActive?: boolean;
  description?: string;
}

export const TEAM_ROLES: TeamMember[] = [
  { role: "Coordinator", shortRole: "Coord", names: ["Aisyah"], isAdmin: true, isActive: true, description: "Oversees the entire event, manages vendors, and ensures the timeline is followed." },
  { role: "Floor manager", shortRole: "FM", names: ["Tariq"], isAdmin: true, isActive: true, description: "Assists the coordinator, manages the venue floor, and handles immediate logistical issues." },
  { role: "Usher/ crowd control", shortRole: "Usher", names: ["Amir", "Zaid"], isActive: true, description: "Directs guests, manages seating, and ensures smooth crowd flow." },
  { role: "Informer / runner", shortRole: "Runner", names: ["Bilal"], isActive: true, description: "Relays messages between teams and runs quick errands." },
  { role: "Logistics 1", shortRole: "Log", names: ["Omar"], isActive: true, description: "Handles physical items, props, and equipment transport." },
  { role: "Bridesmaid 1", shortRole: "BM", names: ["Fatimah"], isBridesmaid: true, isActive: true, description: "Supports the bride, assists with tasks, and keeps the bridal party organized." },
  { role: "Bridesmaid 2", shortRole: "BM", names: ["Khadijah"], isBridesmaid: true, isActive: true, description: "Supports the bride, assists with tasks, and keeps the bridal party organized." },
  { role: "Bridesmaid 3", shortRole: "BM", names: ["Zainab"], isBridesmaid: true, isActive: true, description: "Supports the bride, assists with tasks, and keeps the bridal party organized." },
  { role: "Bridesmaid 4", shortRole: "BM", names: ["Maryam"], isBridesmaid: true, isActive: true, description: "Supports the bride, assists with tasks, and keeps the bridal party organized." },
  { role: "Bridesmaid 5", shortRole: "BM", names: ["Safiyyah"], isBridesmaid: true, isActive: true, description: "Supports the bride, assists with tasks, and keeps the bridal party organized." },
  { role: "Emcee", shortRole: "MC", names: ["Yusuf"], isActive: true, description: "Hosts the reception, makes announcements, and keeps the energy high." },
  { role: "Dan & Nad", shortRole: "Couple", names: ["Dan", "Nad"], isAdmin: true, isActive: true, description: "The stars of the show!" }
];

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  assignees: string[];
  isMainEvent?: boolean;
  notes?: string;
  startedAt?: string;
}

export interface ChecklistItem {
  id: string;
  task: string;
  assignees: string[];
  completed: boolean;
  dueDate?: string;
  priority: 'High' | 'Medium' | 'Low';
  day: 'Pre-wedding' | 'Day 1' | 'Day 2';
  notes?: string;
}

export const day1Timeline: TimelineEvent[] = [
  { id: "d1-1", time: "07:00 AM", title: "Wake up & Breakfast", description: "Start the day fresh with a good breakfast.", assignees: ["Dan & Nad"], notes: "Room service ordered the night before." },
  
  // Concurrent events at 07:30 AM
  { id: "d1-2a", time: "07:30 AM", title: "Hair & Makeup Starts", description: "Makeup artist arrives for Naddy and bridesmaids.", assignees: ["Dan & Nad"], notes: "MUA: Sarah (+1 234-567-8900)" },
  { id: "d1-2b", time: "07:30 AM", title: "Venue Access & Decor Setup", description: "Florists and decorators begin setting up the main hall.", assignees: ["Coordinator"], notes: "Ensure the floral arch is placed center stage." },
  
  { id: "d1-3", time: "08:30 AM", title: "Groom Prep", description: "Danny and groomsmen get ready.", assignees: ["Dan & Nad"] },
  { id: "d1-4", time: "09:30 AM", title: "First Look & Photos", description: "Couple's first look and pre-event photoshoot.", assignees: ["Photographer"], notes: "Location: The Botanical Gardens nearby." },
  { id: "d1-5", time: "10:00 AM", title: "Event Starts: Guest Arrival", description: "Guests begin to arrive and take their seats.", assignees: ["Usher/ crowd control"], isMainEvent: true },
  { id: "d1-6", time: "10:30 AM", title: "Ceremony Begins", description: "The official wedding ceremony.", assignees: ["Officiant"], isMainEvent: true, notes: "Rings should be with the Best Man." },
  { id: "d1-7", time: "11:30 AM", title: "Cocktail Hour", description: "Drinks and light snacks for guests.", assignees: ["Catering"], isMainEvent: true },
  { id: "d1-8", time: "12:30 PM", title: "Lunch Reception", description: "Main lunch is served.", assignees: ["Catering"], isMainEvent: true },
  
  // Concurrent events at 02:00 PM
  { id: "d1-9a", time: "02:00 PM", title: "Speeches & Toasts", description: "Best man, maid of honor, and parents' speeches.", assignees: ["Emcee"], isMainEvent: true, notes: "Keep speeches under 5 mins each." },
  { id: "d1-9b", time: "02:00 PM", title: "Vendor Meals", description: "Photographer, videographer, and coordinator take their lunch break.", assignees: ["Vendors"] },
  
  { id: "d1-10", time: "03:00 PM", title: "Cake Cutting & Mingling", description: "Cutting the wedding cake and taking photos with guests.", assignees: ["Dan & Nad"], isMainEvent: true },
  { id: "d1-11", time: "04:00 PM", title: "Event Concludes", description: "Guests begin to depart.", assignees: ["Coordinator"], isMainEvent: true },
  { id: "d1-12", time: "05:00 PM", title: "Vendor Cleanup", description: "Vendors pack up equipment and clean the venue.", assignees: ["Vendors"] },
  { id: "d1-13", time: "07:00 PM", title: "Rest & Relax", description: "Head back to the hotel to rest for Day 2.", assignees: ["Dan & Nad"] },
];

export const day2Timeline: TimelineEvent[] = [
  { id: "d2-1", time: "10:00 AM", title: "Wake up & Brunch", description: "Relaxed morning brunch.", assignees: ["Dan & Nad"] },
  { id: "d2-2", time: "11:30 AM", title: "Hair & Makeup Starts", description: "Prep for the evening reception.", assignees: ["Dan & Nad"] },
  { id: "d2-3", time: "01:00 PM", title: "Venue Setup Check", description: "Ensure all decorations and tables are set.", assignees: ["Coordinator"], notes: "Check the lighting and sound system." },
  { id: "d2-4", time: "02:00 PM", title: "Event Starts: Welcome Drinks", description: "Guests arrive for the evening celebration.", assignees: ["Usher/ crowd control"], isMainEvent: true },
  { id: "d2-5", time: "03:00 PM", title: "Grand Entrance", description: "Danny and Naddy enter the reception.", assignees: ["Emcee"], isMainEvent: true },
  { id: "d2-6", time: "03:30 PM", title: "First Dance", description: "The couple's first dance.", assignees: ["Dan & Nad"], isMainEvent: true, notes: "Song: 'Perfect' by Ed Sheeran" },
  { id: "d2-7", time: "04:00 PM", title: "Dinner Served", description: "Main course for the evening.", assignees: ["Catering"], isMainEvent: true },
  { id: "d2-8", time: "05:30 PM", title: "Party & Dancing", description: "Dance floor opens to all guests.", assignees: ["DJ"], isMainEvent: true },
  { id: "d2-9", time: "07:00 PM", title: "Event Concludes", description: "Farewell to guests.", assignees: ["Coordinator"], isMainEvent: true },
  { id: "d2-10", time: "08:00 PM", title: "Pack Gifts & Belongings", description: "Collect all gifts and personal items.", assignees: ["Bridesmaid 1"], notes: "Load everything into Danny's car." },
  { id: "d2-11", time: "10:00 PM", title: "Afterparty / Rest", description: "Official end of the wedding plans.", assignees: ["Dan & Nad"] },
];

export const checklists: ChecklistItem[] = [
  // Pre-wedding
  { id: "c-1", task: "Confirm final headcount with caterer", assignees: ["Dan & Nad"], completed: false, priority: "High", day: "Pre-wedding", dueDate: "Oct 10", notes: "Need vegetarian count." },
  { id: "c-2", task: "Pick up wedding rings", assignees: ["Dan & Nad"], completed: true, priority: "High", day: "Pre-wedding", dueDate: "Oct 12" },
  { id: "c-3", task: "Final dress fitting", assignees: ["Dan & Nad"], completed: true, priority: "High", day: "Pre-wedding", dueDate: "Oct 5" },
  { id: "c-4", task: "Write vows", assignees: ["Dan & Nad"], completed: false, priority: "Medium", day: "Pre-wedding", dueDate: "Oct 15", notes: "Keep it under 2 minutes." },
  
  // Day 1
  { id: "c-5", task: "Prepare vendor tip envelopes", assignees: ["Coordinator"], completed: false, priority: "High", day: "Day 1", notes: "Give to the coordinator before 10 AM." },
  { id: "c-6", task: "Pack emergency bridal kit", assignees: ["Bridesmaid 1"], completed: false, priority: "Medium", day: "Day 1", notes: "Include safety pins, mints, and makeup touch-ups." },
  { id: "c-7", task: "Bring marriage license", assignees: ["Dan & Nad"], completed: false, priority: "High", day: "Day 1", notes: "CRITICAL: Do not forget this!" },
  { id: "c-7a", task: "Distribute Bunga Rampai", assignees: ["Bridesmaid 2"], completed: false, priority: "Medium", day: "Day 1" },
  { id: "c-7b", task: "Manage guestbook", assignees: ["Bridesmaid 3"], completed: false, priority: "Medium", day: "Day 1" },
  
  // Day 2
  { id: "c-8", task: "Confirm photography shot list", assignees: ["Coordinator"], completed: false, priority: "Medium", day: "Day 2", notes: "Make sure to get photos with extended family." },
  { id: "c-9", task: "Pay remaining balance to DJ", assignees: ["Floor manager"], completed: false, priority: "High", day: "Day 2" },
  { id: "c-10", task: "Collect leftover cake", assignees: ["Logistics 1"], completed: false, priority: "Low", day: "Day 2", notes: "Ask catering for boxes." },
  { id: "c-11", task: "Help bride with dress change", assignees: ["Bridesmaid 4"], completed: false, priority: "High", day: "Day 2" },
  { id: "c-12", task: "Gather gifts and angbaos", assignees: ["Bridesmaid 5"], completed: false, priority: "High", day: "Day 2" },
];

export interface RSVP {
  id: string;
  name: string;
  email: string;
  phone?: string;
  guests: number;
  status: 'Confirmed' | 'Declined' | 'Pending';
  dietaryRequirements?: string;
  notes?: string;
  submittedAt: string;
}

export const mockRSVPs: RSVP[] = [
  { id: "r-1", name: "John Doe", email: "john@example.com", guests: 2, status: "Confirmed", submittedAt: "2026-03-20T10:00:00Z" },
  { id: "r-2", name: "Jane Smith", email: "jane@example.com", guests: 1, status: "Confirmed", dietaryRequirements: "Vegan", submittedAt: "2026-03-21T14:30:00Z" },
  { id: "r-3", name: "Bob Wilson", email: "bob@example.com", guests: 0, status: "Declined", submittedAt: "2026-03-22T09:15:00Z" },
  { id: "r-4", name: "Alice Brown", email: "alice@example.com", guests: 3, status: "Pending", submittedAt: "2026-03-23T11:45:00Z" },
];
