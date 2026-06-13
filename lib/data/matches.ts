export interface Match {
  id: string;
  matchNumber: number;
  date: string; // ISO date string
  time: string; // local time string for display
  group: string;
  team1: string;
  team2: string;
  team1Flag: string;
  team2Flag: string;
  venue: string;
  city: string;
  status: "upcoming" | "live" | "completed";
  espnEventId?: string; // ESPN event ID for live data
  result?: {
    team1Score: number;
    team2Score: number;
    motm?: string;
    firstScorer?: string;
  };
}

export const FLAGS: Record<string, string> = {
  Mexico: "🇲🇽",
  "South Africa": "🇿🇦",
  "South Korea": "🇰🇷",
  Czechia: "🇨🇿",
  Canada: "🇨🇦",
  "Bosnia and Herzegovina": "🇧🇦",
  Qatar: "🇶🇦",
  Switzerland: "🇨🇭",
  Brazil: "🇧🇷",
  Morocco: "🇲🇦",
  Haiti: "🇭🇹",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "United States": "🇺🇸",
  Paraguay: "🇵🇾",
  Australia: "🇦🇺",
  Turkey: "🇹🇷",
  Germany: "🇩🇪",
  Curaçao: "🇨🇼",
  "Ivory Coast": "🇨🇮",
  Ecuador: "🇪🇨",
  Netherlands: "🇳🇱",
  Japan: "🇯🇵",
  Sweden: "🇸🇪",
  Tunisia: "🇹🇳",
  Belgium: "🇧🇪",
  Egypt: "🇪🇬",
  Iran: "🇮🇷",
  "New Zealand": "🇳🇿",
  Spain: "🇪🇸",
  "Cape Verde": "🇨🇻",
  "Saudi Arabia": "🇸🇦",
  Uruguay: "🇺🇾",
  France: "🇫🇷",
  Senegal: "🇸🇳",
  Iraq: "🇮🇶",
  Norway: "🇳🇴",
  Argentina: "🇦🇷",
  Algeria: "🇩🇿",
  Austria: "🇦🇹",
  Jordan: "🇯🇴",
  Portugal: "🇵🇹",
  "DR Congo": "🇨🇩",
  Uzbekistan: "🇺🇿",
  Colombia: "🇨🇴",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Croatia: "🇭🇷",
  Ghana: "🇬🇭",
  Panama: "🇵🇦",
};

export const MATCHES: Match[] = [
  // June 11
  { id: "m1", matchNumber: 1, date: "2026-06-11", time: "1:00 PM CST", group: "A", team1: "Mexico", team2: "South Africa", team1Flag: "🇲🇽", team2Flag: "🇿🇦", venue: "Estadio Azteca", city: "Mexico City", status: "completed", espnEventId: "760415", result: { team1Score: 2, team2Score: 0, motm: "Raúl Jiménez" } },
  { id: "m2", matchNumber: 2, date: "2026-06-11", time: "8:00 PM CST", group: "A", team1: "South Korea", team2: "Czechia", team1Flag: "🇰🇷", team2Flag: "🇨🇿", venue: "Estadio Akron", city: "Guadalajara", status: "completed", espnEventId: "760416", result: { team1Score: 2, team2Score: 1, motm: "Son Heung-min" } },
  // June 12
  { id: "m3", matchNumber: 3, date: "2026-06-12", time: "3:00 PM ET", group: "B", team1: "Canada", team2: "Bosnia and Herzegovina", team1Flag: "🇨🇦", team2Flag: "🇧🇦", venue: "BMO Field", city: "Toronto", status: "completed", espnEventId: "760417", result: { team1Score: 1, team2Score: 1 } },
  { id: "m4", matchNumber: 4, date: "2026-06-12", time: "6:00 PM PT", group: "D", team1: "United States", team2: "Paraguay", team1Flag: "🇺🇸", team2Flag: "🇵🇾", venue: "SoFi Stadium", city: "Los Angeles", status: "completed", espnEventId: "760421", result: { team1Score: 4, team2Score: 1, motm: "Christian Pulisic" } },
  // June 13
  { id: "m5", matchNumber: 5, date: "2026-06-13", time: "12:00 PM PT", group: "B", team1: "Qatar", team2: "Switzerland", team1Flag: "🇶🇦", team2Flag: "🇨🇭", venue: "Levi's Stadium", city: "San Francisco", status: "upcoming", espnEventId: "760420" },
  { id: "m6", matchNumber: 6, date: "2026-06-13", time: "6:00 PM ET", group: "C", team1: "Brazil", team2: "Morocco", team1Flag: "🇧🇷", team2Flag: "🇲🇦", venue: "MetLife Stadium", city: "New York/NJ", status: "upcoming", espnEventId: "760419" },
  { id: "m7", matchNumber: 7, date: "2026-06-13", time: "9:00 PM ET", group: "C", team1: "Haiti", team2: "Scotland", team1Flag: "🇭🇹", team2Flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", venue: "Gillette Stadium", city: "Boston", status: "upcoming", espnEventId: "760418" },
  { id: "m8", matchNumber: 8, date: "2026-06-13", time: "6:00 PM PT", group: "D", team1: "Australia", team2: "Turkey", team1Flag: "🇦🇺", team2Flag: "🇹🇷", venue: "BC Place", city: "Vancouver", status: "upcoming", espnEventId: "760422" },
  // June 14
  { id: "m9", matchNumber: 9, date: "2026-06-14", time: "12:00 PM CDT", group: "E", team1: "Germany", team2: "Curaçao", team1Flag: "🇩🇪", team2Flag: "🇨🇼", venue: "NRG Stadium", city: "Houston", status: "upcoming" },
  { id: "m10", matchNumber: 10, date: "2026-06-14", time: "3:00 PM CDT", group: "F", team1: "Netherlands", team2: "Japan", team1Flag: "🇳🇱", team2Flag: "🇯🇵", venue: "AT&T Stadium", city: "Dallas", status: "upcoming" },
  { id: "m11", matchNumber: 11, date: "2026-06-14", time: "7:00 PM ET", group: "E", team1: "Ivory Coast", team2: "Ecuador", team1Flag: "🇨🇮", team2Flag: "🇪🇨", venue: "Lincoln Financial Field", city: "Philadelphia", status: "upcoming" },
  { id: "m12", matchNumber: 12, date: "2026-06-14", time: "8:00 PM CST", group: "F", team1: "Sweden", team2: "Tunisia", team1Flag: "🇸🇪", team2Flag: "🇹🇳", venue: "Estadio BBVA", city: "Monterrey", status: "upcoming" },
  // June 15
  { id: "m13", matchNumber: 13, date: "2026-06-15", time: "12:00 PM ET", group: "H", team1: "Spain", team2: "Cape Verde", team1Flag: "🇪🇸", team2Flag: "🇨🇻", venue: "Mercedes-Benz Stadium", city: "Atlanta", status: "upcoming" },
  { id: "m14", matchNumber: 14, date: "2026-06-15", time: "12:00 PM PT", group: "G", team1: "Belgium", team2: "Egypt", team1Flag: "🇧🇪", team2Flag: "🇪🇬", venue: "Lumen Field", city: "Seattle", status: "upcoming" },
  { id: "m15", matchNumber: 15, date: "2026-06-15", time: "6:00 PM ET", group: "H", team1: "Saudi Arabia", team2: "Uruguay", team1Flag: "🇸🇦", team2Flag: "🇺🇾", venue: "Hard Rock Stadium", city: "Miami", status: "upcoming" },
  { id: "m16", matchNumber: 16, date: "2026-06-15", time: "6:00 PM PT", group: "G", team1: "Iran", team2: "New Zealand", team1Flag: "🇮🇷", team2Flag: "🇳🇿", venue: "SoFi Stadium", city: "Los Angeles", status: "upcoming" },
  // June 16
  { id: "m17", matchNumber: 17, date: "2026-06-16", time: "3:00 PM ET", group: "I", team1: "France", team2: "Senegal", team1Flag: "🇫🇷", team2Flag: "🇸🇳", venue: "MetLife Stadium", city: "New York/NJ", status: "upcoming" },
  { id: "m18", matchNumber: 18, date: "2026-06-16", time: "6:00 PM ET", group: "I", team1: "Iraq", team2: "Norway", team1Flag: "🇮🇶", team2Flag: "🇳🇴", venue: "Gillette Stadium", city: "Boston", status: "upcoming" },
  { id: "m19", matchNumber: 19, date: "2026-06-16", time: "8:00 PM CDT", group: "J", team1: "Argentina", team2: "Algeria", team1Flag: "🇦🇷", team2Flag: "🇩🇿", venue: "Arrowhead Stadium", city: "Kansas City", status: "upcoming" },
  { id: "m20", matchNumber: 20, date: "2026-06-16", time: "9:00 PM PT", group: "J", team1: "Austria", team2: "Jordan", team1Flag: "🇦🇹", team2Flag: "🇯🇴", venue: "Levi's Stadium", city: "San Francisco", status: "upcoming" },
  // June 17
  { id: "m21", matchNumber: 21, date: "2026-06-17", time: "12:00 PM CDT", group: "K", team1: "Portugal", team2: "DR Congo", team1Flag: "🇵🇹", team2Flag: "🇨🇩", venue: "NRG Stadium", city: "Houston", status: "upcoming" },
  { id: "m22", matchNumber: 22, date: "2026-06-17", time: "3:00 PM CDT", group: "L", team1: "England", team2: "Croatia", team1Flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", team2Flag: "🇭🇷", venue: "AT&T Stadium", city: "Dallas", status: "upcoming" },
  { id: "m23", matchNumber: 23, date: "2026-06-17", time: "7:00 PM ET", group: "L", team1: "Ghana", team2: "Panama", team1Flag: "🇬🇭", team2Flag: "🇵🇦", venue: "BMO Field", city: "Toronto", status: "upcoming" },
  { id: "m24", matchNumber: 24, date: "2026-06-17", time: "8:00 PM CST", group: "K", team1: "Uzbekistan", team2: "Colombia", team1Flag: "🇺🇿", team2Flag: "🇨🇴", venue: "Estadio Azteca", city: "Mexico City", status: "upcoming" },
  // June 18
  { id: "m25", matchNumber: 25, date: "2026-06-18", time: "12:00 PM ET", group: "A", team1: "Czechia", team2: "South Africa", team1Flag: "🇨🇿", team2Flag: "🇿🇦", venue: "Mercedes-Benz Stadium", city: "Atlanta", status: "upcoming" },
  { id: "m26", matchNumber: 26, date: "2026-06-18", time: "12:00 PM PT", group: "B", team1: "Switzerland", team2: "Bosnia and Herzegovina", team1Flag: "🇨🇭", team2Flag: "🇧🇦", venue: "SoFi Stadium", city: "Los Angeles", status: "upcoming" },
  { id: "m27", matchNumber: 27, date: "2026-06-18", time: "3:00 PM PT", group: "B", team1: "Canada", team2: "Qatar", team1Flag: "🇨🇦", team2Flag: "🇶🇦", venue: "BC Place", city: "Vancouver", status: "upcoming" },
  { id: "m28", matchNumber: 28, date: "2026-06-18", time: "7:00 PM CST", group: "A", team1: "Mexico", team2: "South Korea", team1Flag: "🇲🇽", team2Flag: "🇰🇷", venue: "Estadio Akron", city: "Guadalajara", status: "upcoming" },
  // June 19
  { id: "m29", matchNumber: 29, date: "2026-06-19", time: "6:00 PM ET", group: "C", team1: "Scotland", team2: "Morocco", team1Flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", team2Flag: "🇲🇦", venue: "Gillette Stadium", city: "Boston", status: "upcoming" },
  { id: "m30", matchNumber: 30, date: "2026-06-19", time: "12:00 PM PT", group: "D", team1: "United States", team2: "Australia", team1Flag: "🇺🇸", team2Flag: "🇦🇺", venue: "Lumen Field", city: "Seattle", status: "upcoming" },
  { id: "m31", matchNumber: 31, date: "2026-06-19", time: "8:30 PM ET", group: "C", team1: "Brazil", team2: "Haiti", team1Flag: "🇧🇷", team2Flag: "🇭🇹", venue: "Lincoln Financial Field", city: "Philadelphia", status: "upcoming" },
  { id: "m32", matchNumber: 32, date: "2026-06-19", time: "9:00 PM PT", group: "D", team1: "Turkey", team2: "Paraguay", team1Flag: "🇹🇷", team2Flag: "🇵🇾", venue: "Levi's Stadium", city: "San Francisco", status: "upcoming" },
  // June 20
  { id: "m33", matchNumber: 33, date: "2026-06-20", time: "12:00 PM CDT", group: "F", team1: "Netherlands", team2: "Sweden", team1Flag: "🇳🇱", team2Flag: "🇸🇪", venue: "NRG Stadium", city: "Houston", status: "upcoming" },
  { id: "m34", matchNumber: 34, date: "2026-06-20", time: "4:00 PM ET", group: "E", team1: "Germany", team2: "Ivory Coast", team1Flag: "🇩🇪", team2Flag: "🇨🇮", venue: "BMO Field", city: "Toronto", status: "upcoming" },
  { id: "m35", matchNumber: 35, date: "2026-06-20", time: "7:00 PM CDT", group: "E", team1: "Ecuador", team2: "Curaçao", team1Flag: "🇪🇨", team2Flag: "🇨🇼", venue: "Arrowhead Stadium", city: "Kansas City", status: "upcoming" },
  { id: "m36", matchNumber: 36, date: "2026-06-20", time: "10:00 PM CST", group: "F", team1: "Tunisia", team2: "Japan", team1Flag: "🇹🇳", team2Flag: "🇯🇵", venue: "Estadio BBVA", city: "Monterrey", status: "upcoming" },
  // June 21
  { id: "m37", matchNumber: 37, date: "2026-06-21", time: "12:00 PM ET", group: "H", team1: "Spain", team2: "Saudi Arabia", team1Flag: "🇪🇸", team2Flag: "🇸🇦", venue: "Mercedes-Benz Stadium", city: "Atlanta", status: "upcoming" },
  { id: "m38", matchNumber: 38, date: "2026-06-21", time: "12:00 PM PT", group: "G", team1: "Belgium", team2: "Iran", team1Flag: "🇧🇪", team2Flag: "🇮🇷", venue: "SoFi Stadium", city: "Los Angeles", status: "upcoming" },
  { id: "m39", matchNumber: 39, date: "2026-06-21", time: "6:00 PM ET", group: "H", team1: "Uruguay", team2: "Cape Verde", team1Flag: "🇺🇾", team2Flag: "🇨🇻", venue: "Hard Rock Stadium", city: "Miami", status: "upcoming" },
  { id: "m40", matchNumber: 40, date: "2026-06-21", time: "6:00 PM PT", group: "G", team1: "New Zealand", team2: "Egypt", team1Flag: "🇳🇿", team2Flag: "🇪🇬", venue: "BC Place", city: "Vancouver", status: "upcoming" },
  // June 22
  { id: "m41", matchNumber: 41, date: "2026-06-22", time: "12:00 PM CDT", group: "J", team1: "Argentina", team2: "Austria", team1Flag: "🇦🇷", team2Flag: "🇦🇹", venue: "AT&T Stadium", city: "Dallas", status: "upcoming" },
  { id: "m42", matchNumber: 42, date: "2026-06-22", time: "5:00 PM ET", group: "I", team1: "France", team2: "Iraq", team1Flag: "🇫🇷", team2Flag: "🇮🇶", venue: "Lincoln Financial Field", city: "Philadelphia", status: "upcoming" },
  { id: "m43", matchNumber: 43, date: "2026-06-22", time: "8:00 PM ET", group: "I", team1: "Norway", team2: "Senegal", team1Flag: "🇳🇴", team2Flag: "🇸🇳", venue: "MetLife Stadium", city: "New York/NJ", status: "upcoming" },
  { id: "m44", matchNumber: 44, date: "2026-06-22", time: "8:00 PM PT", group: "J", team1: "Jordan", team2: "Algeria", team1Flag: "🇯🇴", team2Flag: "🇩🇿", venue: "Levi's Stadium", city: "San Francisco", status: "upcoming" },
  // June 23
  { id: "m45", matchNumber: 45, date: "2026-06-23", time: "12:00 PM CDT", group: "K", team1: "Portugal", team2: "Uzbekistan", team1Flag: "🇵🇹", team2Flag: "🇺🇿", venue: "NRG Stadium", city: "Houston", status: "upcoming" },
  { id: "m46", matchNumber: 46, date: "2026-06-23", time: "4:00 PM ET", group: "L", team1: "England", team2: "Ghana", team1Flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", team2Flag: "🇬🇭", venue: "Gillette Stadium", city: "Boston", status: "upcoming" },
  { id: "m47", matchNumber: 47, date: "2026-06-23", time: "7:00 PM ET", group: "L", team1: "Panama", team2: "Croatia", team1Flag: "🇵🇦", team2Flag: "🇭🇷", venue: "BMO Field", city: "Toronto", status: "upcoming" },
  { id: "m48", matchNumber: 48, date: "2026-06-23", time: "8:00 PM CST", group: "K", team1: "Colombia", team2: "DR Congo", team1Flag: "🇨🇴", team2Flag: "🇨🇩", venue: "Estadio Akron", city: "Guadalajara", status: "upcoming" },
  // June 24
  { id: "m49", matchNumber: 49, date: "2026-06-24", time: "12:00 PM PT", group: "B", team1: "Switzerland", team2: "Canada", team1Flag: "🇨🇭", team2Flag: "🇨🇦", venue: "BC Place", city: "Vancouver", status: "upcoming" },
  { id: "m50", matchNumber: 50, date: "2026-06-24", time: "12:00 PM PT", group: "B", team1: "Bosnia and Herzegovina", team2: "Qatar", team1Flag: "🇧🇦", team2Flag: "🇶🇦", venue: "Lumen Field", city: "Seattle", status: "upcoming" },
  { id: "m51", matchNumber: 51, date: "2026-06-24", time: "6:00 PM ET", group: "C", team1: "Scotland", team2: "Brazil", team1Flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", team2Flag: "🇧🇷", venue: "Hard Rock Stadium", city: "Miami", status: "upcoming" },
  { id: "m52", matchNumber: 52, date: "2026-06-24", time: "6:00 PM ET", group: "C", team1: "Morocco", team2: "Haiti", team1Flag: "🇲🇦", team2Flag: "🇭🇹", venue: "Mercedes-Benz Stadium", city: "Atlanta", status: "upcoming" },
  { id: "m53", matchNumber: 53, date: "2026-06-24", time: "7:00 PM CST", group: "A", team1: "Czechia", team2: "Mexico", team1Flag: "🇨🇿", team2Flag: "🇲🇽", venue: "Estadio Azteca", city: "Mexico City", status: "upcoming" },
  { id: "m54", matchNumber: 54, date: "2026-06-24", time: "7:00 PM CST", group: "A", team1: "South Africa", team2: "South Korea", team1Flag: "🇿🇦", team2Flag: "🇰🇷", venue: "Estadio BBVA", city: "Monterrey", status: "upcoming" },
  // June 25
  { id: "m55", matchNumber: 55, date: "2026-06-25", time: "4:00 PM ET", group: "E", team1: "Ecuador", team2: "Germany", team1Flag: "🇪🇨", team2Flag: "🇩🇪", venue: "MetLife Stadium", city: "New York/NJ", status: "upcoming" },
  { id: "m56", matchNumber: 56, date: "2026-06-25", time: "4:00 PM ET", group: "E", team1: "Curaçao", team2: "Ivory Coast", team1Flag: "🇨🇼", team2Flag: "🇨🇮", venue: "Lincoln Financial Field", city: "Philadelphia", status: "upcoming" },
  { id: "m57", matchNumber: 57, date: "2026-06-25", time: "6:00 PM CDT", group: "F", team1: "Japan", team2: "Sweden", team1Flag: "🇯🇵", team2Flag: "🇸🇪", venue: "AT&T Stadium", city: "Dallas", status: "upcoming" },
  { id: "m58", matchNumber: 58, date: "2026-06-25", time: "6:00 PM CDT", group: "F", team1: "Tunisia", team2: "Netherlands", team1Flag: "🇹🇳", team2Flag: "🇳🇱", venue: "Arrowhead Stadium", city: "Kansas City", status: "upcoming" },
  { id: "m59", matchNumber: 59, date: "2026-06-25", time: "7:00 PM PT", group: "D", team1: "Turkey", team2: "United States", team1Flag: "🇹🇷", team2Flag: "🇺🇸", venue: "SoFi Stadium", city: "Los Angeles", status: "upcoming" },
  { id: "m60", matchNumber: 60, date: "2026-06-25", time: "7:00 PM PT", group: "D", team1: "Paraguay", team2: "Australia", team1Flag: "🇵🇾", team2Flag: "🇦🇺", venue: "Levi's Stadium", city: "San Francisco", status: "upcoming" },
  // June 26
  { id: "m61", matchNumber: 61, date: "2026-06-26", time: "3:00 PM ET", group: "I", team1: "Norway", team2: "France", team1Flag: "🇳🇴", team2Flag: "🇫🇷", venue: "Gillette Stadium", city: "Boston", status: "upcoming" },
  { id: "m62", matchNumber: 62, date: "2026-06-26", time: "3:00 PM ET", group: "I", team1: "Senegal", team2: "Iraq", team1Flag: "🇸🇳", team2Flag: "🇮🇶", venue: "BMO Field", city: "Toronto", status: "upcoming" },
  { id: "m63", matchNumber: 63, date: "2026-06-26", time: "7:00 PM CDT", group: "H", team1: "Cape Verde", team2: "Saudi Arabia", team1Flag: "🇨🇻", team2Flag: "🇸🇦", venue: "NRG Stadium", city: "Houston", status: "upcoming" },
  { id: "m64", matchNumber: 64, date: "2026-06-26", time: "6:00 PM CST", group: "H", team1: "Uruguay", team2: "Spain", team1Flag: "🇺🇾", team2Flag: "🇪🇸", venue: "Estadio Akron", city: "Guadalajara", status: "upcoming" },
  { id: "m65", matchNumber: 65, date: "2026-06-26", time: "8:00 PM PT", group: "G", team1: "Egypt", team2: "Iran", team1Flag: "🇪🇬", team2Flag: "🇮🇷", venue: "Lumen Field", city: "Seattle", status: "upcoming" },
  { id: "m66", matchNumber: 66, date: "2026-06-26", time: "8:00 PM PT", group: "G", team1: "New Zealand", team2: "Belgium", team1Flag: "🇳🇿", team2Flag: "🇧🇪", venue: "BC Place", city: "Vancouver", status: "upcoming" },
  // June 27
  { id: "m67", matchNumber: 67, date: "2026-06-27", time: "5:00 PM ET", group: "L", team1: "Panama", team2: "England", team1Flag: "🇵🇦", team2Flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", venue: "MetLife Stadium", city: "New York/NJ", status: "upcoming" },
  { id: "m68", matchNumber: 68, date: "2026-06-27", time: "5:00 PM ET", group: "L", team1: "Croatia", team2: "Ghana", team1Flag: "🇭🇷", team2Flag: "🇬🇭", venue: "Lincoln Financial Field", city: "Philadelphia", status: "upcoming" },
  { id: "m69", matchNumber: 69, date: "2026-06-27", time: "7:30 PM ET", group: "K", team1: "Colombia", team2: "Portugal", team1Flag: "🇨🇴", team2Flag: "🇵🇹", venue: "Hard Rock Stadium", city: "Miami", status: "upcoming" },
  { id: "m70", matchNumber: 70, date: "2026-06-27", time: "7:30 PM ET", group: "K", team1: "DR Congo", team2: "Uzbekistan", team1Flag: "🇨🇩", team2Flag: "🇺🇿", venue: "Mercedes-Benz Stadium", city: "Atlanta", status: "upcoming" },
  { id: "m71", matchNumber: 71, date: "2026-06-27", time: "9:00 PM CDT", group: "J", team1: "Algeria", team2: "Austria", team1Flag: "🇩🇿", team2Flag: "🇦🇹", venue: "Arrowhead Stadium", city: "Kansas City", status: "upcoming" },
  { id: "m72", matchNumber: 72, date: "2026-06-27", time: "9:00 PM CDT", group: "J", team1: "Jordan", team2: "Argentina", team1Flag: "🇯🇴", team2Flag: "🇦🇷", venue: "AT&T Stadium", city: "Dallas", status: "upcoming" },
];

export const GROUPS: Record<string, string[]> = {
  A: ["Mexico", "South Africa", "South Korea", "Czechia"],
  B: ["Canada", "Bosnia and Herzegovina", "Qatar", "Switzerland"],
  C: ["Brazil", "Morocco", "Haiti", "Scotland"],
  D: ["United States", "Paraguay", "Australia", "Turkey"],
  E: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"],
  F: ["Netherlands", "Japan", "Sweden", "Tunisia"],
  G: ["Belgium", "Egypt", "Iran", "New Zealand"],
  H: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"],
  I: ["France", "Senegal", "Iraq", "Norway"],
  J: ["Argentina", "Algeria", "Austria", "Jordan"],
  K: ["Portugal", "DR Congo", "Uzbekistan", "Colombia"],
  L: ["England", "Croatia", "Ghana", "Panama"],
};
