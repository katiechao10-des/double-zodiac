import { useState, useEffect, useRef, useCallback } from "react";
import { Analytics } from "@vercel/analytics/react";

// ─── DATA ───────────────────────────────────────────────────────────────────

const WESTERN_SIGNS = [
  { name: "Capricorn", symbol: "♑", dates: "Dec 22 – Jan 19" },
  { name: "Aquarius", symbol: "♒", dates: "Jan 20 – Feb 18" },
  { name: "Pisces", symbol: "♓", dates: "Feb 19 – Mar 20" },
  { name: "Aries", symbol: "♈", dates: "Mar 21 – Apr 19" },
  { name: "Taurus", symbol: "♉", dates: "Apr 20 – May 20" },
  { name: "Gemini", symbol: "♊", dates: "May 21 – Jun 20" },
  { name: "Cancer", symbol: "♋", dates: "Jun 21 – Jul 22" },
  { name: "Leo", symbol: "♌", dates: "Jul 23 – Aug 22" },
  { name: "Virgo", symbol: "♍", dates: "Aug 23 – Sep 22" },
  { name: "Libra", symbol: "♎", dates: "Sep 23 – Oct 22" },
  { name: "Scorpio", symbol: "♏", dates: "Oct 23 – Nov 21" },
  { name: "Sagittarius", symbol: "♐", dates: "Nov 22 – Dec 21" },
];

const CHINESE_ANIMALS = [
  { name: "Rat", emoji: "🐀" },
  { name: "Ox", emoji: "🐂" },
  { name: "Tiger", emoji: "🐅" },
  { name: "Rabbit", emoji: "🐇" },
  { name: "Dragon", emoji: "🐉" },
  { name: "Snake", emoji: "🐍" },
  { name: "Horse", emoji: "🐎" },
  { name: "Goat", emoji: "🐐" },
  { name: "Monkey", emoji: "🐒" },
  { name: "Rooster", emoji: "🐓" },
  { name: "Dog", emoji: "🐕" },
  { name: "Pig", emoji: "🐖" },
];

const LNY_DATES = {
  1940:[1,27],1941:[1,27],1942:[2,15],1943:[2,5],1944:[1,25],1945:[2,13],1946:[2,2],1947:[1,22],
  1948:[2,10],1949:[1,29],1950:[2,17],1951:[2,6],1952:[1,27],1953:[2,14],1954:[2,3],1955:[1,24],
  1956:[2,12],1957:[1,31],1958:[2,18],1959:[2,8],1960:[1,28],1961:[2,15],1962:[2,5],1963:[1,25],
  1964:[2,13],1965:[2,2],1966:[1,21],1967:[2,9],1968:[1,30],1969:[2,17],1970:[2,6],1971:[1,27],
  1972:[2,15],1973:[2,3],1974:[1,23],1975:[2,11],1976:[1,31],1977:[2,18],1978:[2,7],1979:[1,28],
  1980:[2,16],1981:[2,5],1982:[1,25],1983:[2,13],1984:[2,2],1985:[2,20],1986:[2,9],1987:[1,29],
  1988:[2,17],1989:[2,6],1990:[1,27],1991:[2,15],1992:[2,4],1993:[1,23],1994:[2,10],1995:[1,31],
  1996:[2,19],1997:[2,7],1998:[1,28],1999:[2,16],2000:[2,5],2001:[1,24],2002:[2,12],2003:[2,1],
  2004:[1,22],2005:[2,9],2006:[1,29],2007:[2,18],2008:[2,7],2009:[1,26],2010:[2,14],2011:[2,3],
  2012:[1,23],2013:[2,10],2014:[1,31],2015:[2,19],2016:[2,8],2017:[1,28],2018:[2,16],2019:[2,5],
  2020:[1,25],2021:[2,12],2022:[2,1],2023:[1,22],2024:[2,10],2025:[1,29],2026:[2,17],2027:[2,6],
  2028:[1,26],2029:[2,13],2030:[2,3],
};

function getWesternSign(month, day) {
  const ranges = [
    [1,20,1],[2,19,2],[3,21,3],[4,20,4],[5,21,5],[6,21,6],
    [7,23,7],[8,23,8],[9,23,9],[10,23,10],[11,22,11],[12,22,0]
  ];
  for (let i = 11; i >= 0; i--) {
    const [m, d, si] = ranges[i];
    if (month > m || (month === m && day >= d)) return WESTERN_SIGNS[si];
  }
  return WESTERN_SIGNS[0];
}

function getChineseAnimal(year, month, day) {
  let zodiacYear = year;
  const lny = LNY_DATES[year];
  if (lny) {
    const [lnyMonth, lnyDay] = lny;
    if (month < lnyMonth || (month === lnyMonth && day < lnyDay)) zodiacYear = year - 1;
  }
  const index = ((zodiacYear - 1900) % 12 + 12) % 12;
  return CHINESE_ANIMALS[index];
}
// All 144 clash lines — Agency Edition
const CLASH_LINES = {
  "Aries-Rat": "One pitches ideas before the brief is even finished. The other already reverse-engineered the client's budget from their LinkedIn activity.",
  "Taurus-Rat": "One wants a corner office with a plant. The other is quietly building a freelance empire from the same desk.",
  "Gemini-Rat": "Two personas in the meeting, three contingency plans underneath. You're the creative who always has 'one more thing' — and it always lands.",
  "Cancer-Rat": "One takes every round of client feedback personally. The other already figured out which stakeholder is actually making the decisions.",
  "Leo-Rat": "One presents the work like it's a TED Talk. The other spent the night before quietly stealing insights from the strategy team's shared drive.",
  "Virgo-Rat": "You've stress-tested the deck, proofread the brief, and mapped every possible client objection before the tissue session. The account team finds you exhausting and indispensable.",
  "Libra-Rat": "One wants the whole team to feel heard. The other is keeping a mental spreadsheet of who owes them a favor.",
  "Scorpio-Rat": "One collects secrets. The other collects leverage. You know which CD is about to get fired before HR does.",
  "Sagittarius-Rat": "One wants to quit and travel. The other is calculating exactly how much freelance income it would take. You have a Google Sheet called 'escape plan' that you update weekly.",
  "Capricorn-Rat": "You'll make ECD by 35 and own the agency by 45. This isn't ambition — it's a project timeline.",
  "Aquarius-Rat": "One wants to reinvent advertising. The other wants to profit from the reinvention. You'll launch the industry's next big disruption and have the merch ready on day one.",
  "Pisces-Rat": "One writes the emotional manifesto. The other negotiates the production budget. Your mood boards make people cry and your invoices are always on time.",
  "Aries-Ox": "One wants to blow up the brief and start over. The other wants to execute the original idea until it's perfect. Your brainstorms last six hours because you're arguing with yourself.",
  "Taurus-Ox": "Double stubborn. You picked a typeface in 2019 and you will defend it with your body. The client's 'small tweak' will be acknowledged and ignored.",
  "Gemini-Ox": "One talks through forty ideas in the brainstorm. The other has been silently refining the same one for three days. Your creative process is a mystery to your own partner.",
  "Cancer-Ox": "One mentors the juniors with emotional warmth. The other mentors them by assigning increasingly impossible deadlines and calling it growth.",
  "Leo-Ox": "One wants to present at Cannes. The other thinks awards are a distraction from the actual work. You enter anyway — and win.",
  "Virgo-Ox": "You've never missed a deadline. You've never delivered a typo. Your creative director trusts you with the pitch deck and the account team trusts you with the timeline. You find this boring.",
  "Libra-Ox": "One weighs every layout option for hours. The other picked the first one and started building. Your internal creative review takes longer than the actual project.",
  "Scorpio-Ox": "Grudges with a work ethic. You remember every piece of feedback the client killed, and you outlast every creative director who underestimated you.",
  "Sagittarius-Ox": "One wants to go indie and work from Lisbon. The other wants to build something brick by brick for twenty years. Your five-year plan has two completely contradictory versions.",
  "Capricorn-Ox": "You will become the most respected creative in the industry. It will take your entire career. You consider this a reasonable timeline.",
  "Aquarius-Ox": "One wants to tear down the traditional agency model. The other wants the traditional agency model to work exactly as designed. You are the future and the past having lunch together.",
  "Pisces-Ox": "One writes copy that makes the room go quiet. The other revises it fourteen times before anyone sees it. You're the reason the work is good and the reason it's always almost late.",
  "Aries-Tiger": "You walk into the pitch and the client can feel it. Two fire signs in a boardroom — you don't present work, you dare people not to buy it.",
  "Taurus-Tiger": "One wants the studio quiet and the coffee perfect. The other wants to fight the client. You'll produce gorgeous work and terrify the account team in the same afternoon.",
  "Gemini-Tiger": "One charms the client. The other eats the client. You're either the most fun person in the agency or the most dangerous, and it changes by the hour.",
  "Cancer-Tiger": "A creative director in a cardigan. Fiercely protective of the juniors, devastatingly lethal to anyone who gives bad feedback. Your team would follow you into any pitch.",
  "Leo-Tiger": "Two apex creatives. You don't collaborate — you co-headline. Every agency you've ever worked at tells stories about you after you leave.",
  "Virgo-Tiger": "Precision with fangs. Your feedback is so specific it restructures people's understanding of their own work. Juniors grow the fastest under you, and also cry the most.",
  "Libra-Tiger": "The diplomat who flips the conference table. You'll navigate three rounds of client feedback with grace, and then explode when someone suggests stock photography.",
  "Scorpio-Tiger": "One reads the room. The other dominates it. The client approved the campaign before they realized they hadn't actually decided to.",
  "Sagittarius-Tiger": "One wants to shoot the spot in five countries. The other wants to shoot it tomorrow. Your producer has developed a specific facial expression just for your ideas.",
  "Capricorn-Tiger": "Disciplined intensity. You climb the agency ladder like it's something you're doing to the ladder. The only thing more impressive than your portfolio is your patience.",
  "Aquarius-Tiger": "One wants to reinvent the industry. The other wants to burn it down. You're either founding the next great agency or destroying the current one, and honestly it depends on the meeting.",
  "Pisces-Tiger": "A creative who writes beautiful copy and then fights anyone who tries to edit it. You'll make the client cry with the work and then make them cry for a different reason in the revision round.",
  "Aries-Rabbit": "One charges into the brainstorm screaming ideas. The other is quietly sketching the best one in the corner. You pitch with confidence and then need to be alone for two days.",
  "Taurus-Rabbit": "Maximum comfort, maximum taste. Your desk is the nicest in the agency, your briefs are immaculate, and you will not be rushed by a timeline someone else set.",
  "Gemini-Rabbit": "The social creative who needs to recharge. You're the life of the agency party and the first person to leave it. Your Slack is always active; your camera is always off.",
  "Cancer-Rabbit": "You feel every round of feedback in your actual chest. Your work is deeply personal and your client revisions feel like personal attacks. You're right, but still.",
  "Leo-Rabbit": "One wants the Cannes stage. The other wants to observe from the back of the auditorium. Your portfolio is famous; your personality is a mystery.",
  "Virgo-Rabbit": "You noticed the kerning error in the final deck before the file was even open. Both signs are anxious, both are meticulous, and your creative director has never once had to give you a revision note.",
  "Libra-Rabbit": "The most tasteful creative in the agency. You were born with an eye for composition and a complete inability to choose between two equally good layouts before the deadline.",
  "Scorpio-Rabbit": "One sign says you're the most strategic mind in the building. The other says you apologize when someone takes your conference room booking.",
  "Sagittarius-Rabbit": "One wants to pitch the international account. The other wants to work from home forever. You volunteer for the global brief and then google 'is it too late to un-volunteer.'",
  "Capricorn-Rabbit": "Quiet ambition in a loud industry. You're the creative everyone underestimates until you make ECD without ever having raised your voice.",
  "Aquarius-Rabbit": "One wants to disrupt the agency model. The other wants to do it without upsetting anyone. You start creative revolutions very, very diplomatically.",
  "Pisces-Rabbit": "So empathetic your copywriting makes strangers cry. So sensitive that a client saying 'can we explore other directions' ruins your entire weekend.",
  "Aries-Dragon": "Main character energy in the pitch room. People either follow your vision or get out of the way. There is no 'let's circle back on this.'",
  "Taurus-Dragon": "A dragon sitting on a pile of awards. You've built a body of work you refuse to compromise, and you see absolutely nothing wrong with telling a client 'no.'",
  "Gemini-Dragon": "One shapeshifts the concept for every audience. The other believes the concept should be mythic and unchanging. Your creative reviews are legendary and confusing.",
  "Cancer-Dragon": "A creative director who guards their team like a nest. Terrifying in the client meeting, devastatingly kind in the one-on-one. Mess with your juniors and find out.",
  "Leo-Dragon": "The most awarded creative in the building and they will not let you forget it. You have main character energy in a main character role. Subtlety left the agency when you arrived.",
  "Virgo-Dragon": "A mythical talent who color-codes their project files. You're simultaneously the most visionary and most neurotic person on the floor.",
  "Libra-Dragon": "A dragon in a beautifully art-directed lair. You want power AND aesthetics, a corner office AND the best portfolio. You'll run the agency but only if the branding is right.",
  "Scorpio-Dragon": "Two of the most intense signs in their respective zodiacs in one creative brain. You walk into a pitch and the energy in the room changes temperature.",
  "Sagittarius-Dragon": "A creative who can't stop saying yes. You want to lead every pitch, join every brainstorm, fly to every shoot, and somehow still make the Monday status meeting.",
  "Capricorn-Dragon": "Strategic dominance. You're playing an industry game that most creatives don't even know exists, and your ten-year plan includes owning the board.",
  "Aquarius-Dragon": "A visionary who wants to rule the industry — but only to make it weirder. Your agency manifesto is either the future of advertising or complete nonsense, and no one can tell.",
  "Pisces-Dragon": "A dragon made of feeling. Your campaigns move people on a level they can't articulate, and your creative briefs read like poetry that somehow got a media budget.",
  "Aries-Snake": "One pitches first. The other waits until everyone else has gone and then quietly drops the best idea in the room.",
  "Taurus-Snake": "Both sensual, both stubborn, both excellent at doing three hours of 'visual research' on Pinterest and calling it work.",
  "Gemini-Snake": "The most persuasive creative alive. You can sell any concept to any client, pivot the rationale mid-sentence, and nobody notices the turn.",
  "Cancer-Snake": "One coils protectively around the team. The other smothers the brief with too many insights. You either under-share or over-share and there is no middle.",
  "Leo-Snake": "One wants to be celebrated. The other wants to be mysterious. You're the creative the whole industry watches but nobody actually knows.",
  "Virgo-Snake": "You notice everything. The client's body language, the account director's hesitation, the junior's typo on slide 14. You say nothing and file it all away for the exact right moment.",
  "Libra-Snake": "A snake in a beautifully designed garden. Elegant, balanced, and absolutely lethal when a client disturbs the creative vision.",
  "Scorpio-Snake": "Double venom. You understand client psychology so deeply it's almost unethical. You've never lost a pitch you actually cared about.",
  "Sagittarius-Snake": "One wants to fly to the shoot location. The other wants to stay coiled at the desk and think for six more hours. You're a strategist who occasionally does something impulsive and legendary.",
  "Capricorn-Snake": "Patient ambition in its purest form. You've been quietly building your book for years, and when you make your move, the entire industry will act surprised.",
  "Aquarius-Snake": "One sheds creative skins constantly. The other reinvents the process. You've changed your portfolio aesthetic so many times your recruiter needs a changelog.",
  "Pisces-Snake": "You move through the agency like smoke. Everyone feels your creative influence but no one can quite explain how you got the client to approve that.",
  "Aries-Horse": "Pure creative velocity. You've never once thought 'maybe I should do another round of revisions' and actually meant it.",
  "Taurus-Horse": "One wants to perfect the craft. The other wants to ship it and move on. You're the creative who redesigns their own portfolio the week after launching the client's rebrand.",
  "Gemini-Horse": "One talks through the idea. The other has already mocked it up. You've left three Slack threads mid-sentence today and it's 10 AM.",
  "Cancer-Horse": "One gallops to the next project. The other is still emotionally attached to the last one. You leave agencies and then check their Instagram every day for a month.",
  "Leo-Horse": "Big creative energy. You take up space in the brainstorm, your presentations are performances, and your hair is doing something right now.",
  "Virgo-Horse": "One says you organize your reference folders by color, mood, and decade. The other says you once changed the entire campaign direction at 2 AM because a horse doesn't follow a grid.",
  "Libra-Horse": "One seeks the perfect layout. The other has never once achieved visual balance and doesn't care. You're a graceful disaster or a disastrous grace, depending on the deadline.",
  "Scorpio-Horse": "One runs from the feedback. The other drowns in it. You're either emotionally detached from the work or dangerously attached, and you switch without warning.",
  "Sagittarius-Horse": "Double freedom. You've worked at four agencies, freelanced in three countries, and your LinkedIn says 'open to opportunities' permanently.",
  "Capricorn-Horse": "A racehorse in a business-casual dress code. Wildly ambitious but allergic to anyone else's creative process.",
  "Aquarius-Horse": "One runs free. The other thinks free. You're the creative who quits a perfectly good agency job to start something that doesn't have a business model yet.",
  "Pisces-Horse": "A creative chasing something they can't put in a brief. You're running toward an aesthetic that doesn't exist yet, and your art direction is gorgeous the whole way there.",
  "Aries-Goat": "One charges into the pitch. The other would rather be sketching in a café. You have big creative ambitions and zero interest in office politics.",
  "Taurus-Goat": "Maximum studio vibes. You want a beautiful workspace, good snacks, nice pens, and for absolutely nobody to schedule a meeting before 10 AM.",
  "Gemini-Goat": "One thrives in the brainstorm. The other wanders off to look at fonts. Your attention is either locked on the brief or completely somewhere else, and the switch is instant.",
  "Cancer-Goat": "You feel every campaign so deeply you've cried at your own work more than once. The agency loves your empathy and worries about your coping mechanisms.",
  "Leo-Goat": "One wants the spotlight. The other wants the studio. You present brilliantly at the pitch and then disappear for a week to actually make the thing.",
  "Virgo-Goat": "An artist with a spreadsheet. You have the creative soul of a poet and the browser tabs of a project manager. Your mood board has a mood board.",
  "Libra-Goat": "The most aesthetically gifted creative in the building. Your desk looks like a design magazine and your portfolio makes other creatives quietly reconsider their careers.",
  "Scorpio-Goat": "A wolf in intern's clothing. You look gentle and agreeable in the meeting. You are neither of those things when it comes to the work.",
  "Sagittarius-Goat": "One wants the international brief. The other wants to work from a hillside in Portugal. You'll take the assignment as long as you can bring a picnic and a WiFi hotspot.",
  "Capricorn-Goat": "Both goat-adjacent, completely different about it. One climbs the agency ladder for the title. The other climbs because the view is better for drawing.",
  "Aquarius-Goat": "A gentle radical. You want to change the advertising industry but you'd prefer to do it through beautiful art direction, not a LinkedIn manifesto.",
  "Pisces-Goat": "So vibes-based it's structural. You've built an entire creative career out of aesthetic intuition and somehow it keeps working. Your creative directors can't explain you and can't replace you.",
  "Aries-Monkey": "Pure creative chaos with strategic intent. You break the brief just to see what's inside, and then build something better from the pieces.",
  "Taurus-Monkey": "One wants a stable agency job. The other is swinging from freelance gig to freelance gig. Your career is a constant negotiation between your savings account and your impulses.",
  "Gemini-Monkey": "The most dangerously persuasive creative in the industry. You could sell a client their own brief back to them with a different font and they'd call it visionary.",
  "Cancer-Monkey": "One nests at the agency. The other can't stop climbing to the next opportunity. You're homesick at every new job and restless at every old one.",
  "Leo-Monkey": "One performs the pitch. The other performs a trick during the pitch. You're either the most awarded creative or the most entertaining, and the line is blurry.",
  "Virgo-Monkey": "One analyzes the brief. The other has already solved it with a lateral idea nobody asked for. You're a genius with an asterisk and a footnote the client didn't request.",
  "Libra-Monkey": "Charm offensive in the client meeting. You're so likable the client approves the risky concept before they realize what they've approved.",
  "Scorpio-Monkey": "One plays the long game. The other plays it in real time with a grin. You're the smartest creative in the room and everyone knows it, which is the problem.",
  "Sagittarius-Monkey": "One explores every creative territory. The other experiments with every production technique. You've tried every medium, broken every format, and regret is not in your vocabulary.",
  "Capricorn-Monkey": "A monkey in a creative director's chair. You look professional and strategic until you pitch something completely unhinged, and the pivot is instant.",
  "Aquarius-Monkey": "Two tricksters. You're inventing the future of advertising while everyone else is still arguing about the media plan for Q3.",
  "Pisces-Monkey": "A creative who either solves the brief in ten minutes or stares out the window for three hours. Both approaches produce award-winning work and nobody understands how.",
  "Aries-Rooster": "One charges into the pitch. The other narrates the charge. You do everything boldly and then send a follow-up email about how boldly you did it.",
  "Taurus-Rooster": "Opinionated and immovable. You have never once received a client revision and thought 'that's a good point.' You've thought it was wrong every time, and you've been right enough to keep your job.",
  "Gemini-Rooster": "One brainstorms out loud. The other announces the final idea like a verdict. You don't have creative reviews — you have creative declarations.",
  "Cancer-Rooster": "One protects the team quietly. The other protects them loudly in the all-hands meeting. You'll fight the client on behalf of a junior's idea and then make the team dinner.",
  "Leo-Rooster": "Two performers. You've never entered a pitch room — you've arrived. The only question is whether the client was ready for the show.",
  "Virgo-Rooster": "The most detail-obsessed creative in the agency. You spotted the orphan on slide 23 from across the room and it's been ruining your afternoon.",
  "Libra-Rooster": "One wants creative harmony. The other wants to be right about the creative direction. You'll facilitate the brainstorm as long as the brainstorm agrees with you.",
  "Scorpio-Rooster": "You notice everything. The client's tone shift, the account director's silence, the strategist's weak data point on slide 7. You say nothing until it's maximally effective.",
  "Sagittarius-Rooster": "One wants to explore the wildest creative territory. The other insists on a structured process to get there. You want creative freedom as long as the timeline is color-coded.",
  "Capricorn-Rooster": "Ruthless creative efficiency. You're at the agency by 7 AM, the deck is done by noon, and you have opinions about everyone else's morning routine.",
  "Aquarius-Rooster": "One disrupts. The other critiques the disruption. You tear apart creative work — other people's, the industry's, your own — and you're right often enough that it's a problem.",
  "Pisces-Rooster": "Sharp feedback at 10 AM, emotional vulnerability at 6 PM. You toggle between razor-precise creative direction and profound sensitivity, sometimes in the same review.",
  "Aries-Dog": "A loyal creative off the leash. You defend the work, defend the team, and charge straight at the problem before anyone said 'let's align on next steps.'",
  "Taurus-Dog": "Maximum loyalty, maximum stubbornness. You've been at the same agency for seven years and will not leave until they physically remove your desk.",
  "Gemini-Dog": "Everyone's favorite creative partner for different reasons. The strategist loves your thinking, the designers love your eye, the account team loves your reliability. You're exhausted by all of it.",
  "Cancer-Dog": "Two of the most loyal signs in one creative heart. You love your agency so hard it's almost a full-time job on top of your actual full-time job.",
  "Leo-Dog": "Golden retriever energy in the creative department. Big presence, big heart, big need for the CD to say 'great work.' You'll save the pitch and then need someone to tell you it mattered.",
  "Virgo-Dog": "A service-oriented creative who also judges your brief. You'll help any team with anything and silently note every strategic error they're making.",
  "Libra-Dog": "One wants creative justice. The other wants creative fairness. You're the person who mediates every internal disagreement and then loses sleep over whether the compromise was good enough.",
  "Scorpio-Dog": "Loyalty with strategic teeth. You'd go to war for the people you respect, and you keep a detailed mental file on everyone who's ever given bad creative feedback.",
  "Sagittarius-Dog": "One wants to go freelance and travel. The other feels guilty about leaving the team. You're the creative at the going-away party who keeps looking back at the agency door.",
  "Capricorn-Dog": "A working creative. You don't understand the concept of 'out of office' and you're suspicious of people who close their laptops at 6 PM.",
  "Aquarius-Dog": "A creative who's loyal to the industry itself. You want advertising to be better for everyone, but you're kind of weird about it on an individual project level.",
  "Pisces-Dog": "The most empathetic creative in the building. You absorb every team member's stress, every client's anxiety, and every campaign's emotion, and then need three days alone to recover.",
  "Aries-Pig": "One wants to charge into the next brief. The other wants to celebrate the last one with a long lunch. Your creative process alternates between sprinting and feasting.",
  "Taurus-Pig": "The most indulgent creative in the agency. You've turned 'team morale' from a concept into a personal mandate involving expensive coffee and unnecessary catering budgets.",
  "Gemini-Pig": "The social creative who feeds everyone. You'll talk through the entire brainstorm AND make sure the team is fed. Your Slack messages come with snack recommendations.",
  "Cancer-Pig": "Pure creative warmth. You're the agency's open door, the team's emotional anchor, and the reason the holiday party actually feels good. People feel safe around you and your clients can't explain why they keep approving the work.",
  "Leo-Pig": "One wants to shine. The other wants to celebrate. You throw the best wrap parties the agency has ever seen and always remember to toast the work — and yourself.",
  "Virgo-Pig": "One wants the deck perfect. The other wants the team dinner perfect. You're the creative who organizes the reference library by visual genre and the offsite by restaurant quality.",
  "Libra-Pig": "Generous and gracious. You give credit freely and share ideas openly, and then feel personally wounded when a creative partner doesn't do the same.",
  "Scorpio-Pig": "Beneath that warm, generous creative exterior is someone who remembers every stolen concept, every uncredited contribution, and every 'we went in a different direction.' You'll mentor anyone, but you never forget.",
  "Sagittarius-Pig": "One wants to work in every market. The other wants to eat in every market. Your international shoot schedule is just a restaurant itinerary with a production timeline attached.",
  "Capricorn-Pig": "One grinds all week. The other celebrates all weekend. You'll pull three all-nighters for the pitch and then spend Saturday doing absolutely nothing with an intensity that borders on professional.",
  "Aquarius-Pig": "One believes in the power of great advertising. The other believes in the goodness of the people making it. Your optimism is either the most beautiful thing in the industry or the most reckless.",
  "Pisces-Pig": "Pure creative vibes. You're kind, dreamy, generous, and probably not reading this brief because you got distracted by a typeface three pages ago.",
};


// Frame paths: 13 frames for stop-motion animation
const FRAME_PATHS = [
  "/frames/01.png",   // 0  - front of envelope
  "/frames/02.png",   // 1  - front tilted
  "/frames/02a.png",  // 2  - front more tilted
  "/frames/03.png",   // 3  - on edge
  "/frames/03a.png",  // 4  - on edge (duplicate angle)
  "/frames/04.png",   // 5  - edge/back transition
  "/frames/05.png",   // 6  - back tilted
  "/frames/06.png",   // 7  - back flat, flap closed
  "/frames/07.png",   // 8  - back flat, flap open
  "/frames/08.png",   // 9  - back, flap open wider
  "/frames/09.png",   // 10 - crumpled ball on envelope
  "/frames/10.png",   // 11 - paper emerging
  "/frames/11.png",   // 12 - paper mostly uncrumpled
];

const PHASE = {
  ENVELOPE: 0,    // Landing: envelope front (frame 1), tap to flip
  FLIPPING: 1,    // Animating flip (frames 1→5)
  BIRTHDAY: 2,    // Back of envelope showing, birthday input overlaid
  OPENING: 3,     // Animating open + uncrumple (frames 5→11)
  REVEALED: 4,    // Paper flat, clash line visible
};

// ─── STYLES ─────────────────────────────────────────────────────────────────

const style = document.createElement("style");
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500&family=Caveat:wght@400;500;600&display=swap');

  :root {
    --red: #E05A52;
    --deep-red: #C94040;
    --gold: #D4B65A;
    --pale-gold: #A8935C;
    --cream: #2E2A2B;
    --warm-white: #231F20;
    --ink: #F2EFEA;
    --ink-light: #D1CAC0;
    --ink-faint: #A89F94;
    --parchment: #2E2A2B;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    color: var(--ink);
    font-family: 'DM Sans', sans-serif;
    overflow: auto;
    margin: 0;
    background: #1a1410;
  }

  .desk-wrapper {
    position: relative;
    width: 2000px;
    height: 1140px;
    margin: 0 auto;
    background: url('/desktopBackground.png') no-repeat;
    background-size: 2000px 1140px;
  }

  .desk-frame-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 2000px;
    height: 1140px;
    background: url('/desktopFrame.png') no-repeat;
    background-size: 2000px 1140px;
    pointer-events: none;
    z-index: 20;
  }

  .monitor-screen {
    position: absolute;
    left: 520px;
    top: 160px;
    width: 940px;
    height: 560px;
    overflow-y: auto;
    overflow-x: hidden;
    background: var(--warm-white);
    border-radius: 2px;
    z-index: 10;
  }

  .monitor-screen::-webkit-scrollbar {
    width: 4px;
  }
  .monitor-screen::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.2);
    border-radius: 2px;
  }

  .page {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    position: relative;
  }

  .page::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse at 20% 0%, rgba(224, 90, 82, 0.06) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 100%, rgba(212, 182, 90, 0.06) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  .content { position: relative; z-index: 1; width: 100%; max-width: 520px; }

  .header { text-align: center; margin-bottom: 48px; }

  .header-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 8px;
  }

  .header-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 52px;
    font-weight: 700;
    color: var(--ink);
    line-height: 1.05;
    margin-bottom: 20px;
  }

  .header-title em { color: #E05A52; font-style: italic; }

  .header-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 300;
    color: var(--ink-faint);
    line-height: 1.6;
    max-width: 380px;
    margin: 0 auto;
    font-style: italic;
    text-align: center;
  }

  .divider { width: 60px; height: 1px; background: var(--gold); margin: 32px auto; opacity: 0.5; }

  .input-section { text-align: center; }

  .input-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--ink-faint);
    margin-bottom: 16px;
  }

  .date-input {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 400;
    color: var(--ink);
    background: transparent;
    border: none;
    border-bottom: 1.5px solid var(--pale-gold);
    padding: 8px 16px;
    text-align: center;
    outline: none;
    transition: border-color 0.3s ease;
    width: 220px;
    cursor: pointer;
  }

  .date-input:focus { border-bottom-color: var(--red); }
  .date-input::-webkit-calendar-picker-indicator { opacity: 0.6; cursor: pointer; filter: invert(1); }

  .reveal-btn {
    display: inline-block;
    margin-top: 28px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--warm-white);
    background: var(--red);
    border: none;
    padding: 14px 40px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .reveal-btn:hover { background: var(--deep-red); transform: translateY(-1px); }
  .reveal-btn:disabled { opacity: 0.3; cursor: default; transform: none; }

  /* ── Envelope ── */
  .envelope-stage {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    animation: fadeIn 0.5s ease forwards;
  }

  @keyframes fadeIn {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }

  .envelope-frame {
    height: 300px;
    width: auto;
    max-width: 90vw;
    object-fit: contain;
    border-radius: 4px;
    box-shadow: none;
    cursor: pointer;
    transition: transform 0.3s ease;
    user-select: none;
    -webkit-user-select: none;
  }

  .envelope-frame:hover {
    transform: scale(1.02);
  }

  .envelope-hint {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 400;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--ink-faint);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  .envelope-frame.no-click { cursor: default; pointer-events: none; }

  /* ── Result ── */
  .result-stage {
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: resultFadeIn 1s ease forwards;
    opacity: 0;
  }

  @keyframes resultFadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  .result-info { text-align: center; margin-bottom: 0; }

  .result-signs {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-bottom: 8px;
  }

  .result-sign-symbol { font-size: 36px; line-height: 1; }

  .result-vs {
    font-family: 'Cormorant Garamond', serif;
    font-size: 14px;
    color: var(--gold);
    font-style: italic;
  }

  .result-combo-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 4px;
  }

  .result-subtitle {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--ink-faint);
    margin-bottom: 12px;
  }

  .result-breakdown {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin-bottom: 0;
  }

  .result-breakdown-item { text-align: center; }

  .result-west-label, .result-east-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .result-west-label { color: var(--ink-faint); }
  .result-east-label { color: var(--red); opacity: 0.7; }

  .result-sign-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--ink);
  }

  .clash-line-text {
    font-family: Georgia, serif;
    font-size: 28px;
    font-style: italic;
    font-weight: 500;
    color: #D4B65A;
    line-height: 1.4;
    text-align: center;
    max-width: 480px;
    margin: 16px auto;
    animation: textAppear 1.5s ease forwards;
    opacity: 0;
  }

  @keyframes textAppear {
    0% { opacity: 0; }
    50% { opacity: 0; }
    100% { opacity: 1; }
  }

  .result-footer {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: var(--ink-faint);
    letter-spacing: 0.5px;
    text-align: center;
    margin-top: 24px;
  }

  .result-footer a { color: var(--red); text-decoration: none; }

  .share-btn {
    display: inline-block;
    margin-top: 20px;
    margin-bottom: 4px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--warm-white);
    background: var(--red);
    border: none;
    padding: 14px 40px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .share-btn:hover {
    background: var(--deep-red);
    transform: translateY(-1px);
  }

  .share-msg {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: var(--gold);
    margin-top: 8px;
    letter-spacing: 0.5px;
    animation: fadeIn 0.3s ease forwards;
  }

  .try-again-btn {
    display: inline-block;
    margin-top: 24px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--ink-faint);
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px 16px;
    transition: color 0.3s ease;
  }

  .try-again-btn:hover { color: var(--red); }

  .ornament {
    position: fixed;
    width: 60px;
    height: 60px;
    opacity: 0.15;
    pointer-events: none;
    z-index: 0;
  }

  .ornament-tl { top: 20px; left: 20px; border-top: 1.5px solid var(--gold); border-left: 1.5px solid var(--gold); }
  .ornament-tr { top: 20px; right: 20px; border-top: 1.5px solid var(--gold); border-right: 1.5px solid var(--gold); }
  .ornament-bl { bottom: 20px; left: 20px; border-bottom: 1.5px solid var(--gold); border-left: 1.5px solid var(--gold); }
  .ornament-br { bottom: 20px; right: 20px; border-bottom: 1.5px solid var(--gold); border-right: 1.5px solid var(--gold); }

  .how-link {
    display: inline-block;
    margin-top: 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--ink-faint);
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px 16px;
    transition: color 0.3s ease;
  }

  .how-link:hover { color: var(--red); }

  .now-what-link {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: var(--red);
    background: none;
    border: none;
    border-bottom: 1px solid transparent;
    cursor: pointer;
    padding: 0;
    transition: border-color 0.3s ease;
    letter-spacing: 0.5px;
  }

  .now-what-link:hover { border-bottom-color: var(--red); }

  .hiw-content { max-width: 560px; }
  .hiw-section { margin-bottom: 8px; }

  .hiw-heading {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 16px;
    line-height: 1.2;
  }

  .hiw-body {
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 300;
    color: var(--ink-light);
    line-height: 1.75;
    margin-bottom: 14px;
  }

  .hiw-aside { font-style: italic; color: var(--ink-faint); }
  .hiw-divider { width: 40px; height: 1px; background: var(--gold); margin: 32px 0; opacity: 0.4; }

  .hiw-footer {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: var(--ink-faint);
    margin-top: 20px;
    letter-spacing: 0.5px;
  }

  .hiw-footer a { color: var(--red); text-decoration: none; }

  @media (min-width: 1025px) {
    .result-sign-symbol { font-size: 28px; }
    .result-combo-name { font-size: 20px; margin-bottom: 2px; }
    .result-subtitle { font-size: 9px; margin-bottom: 6px; }
    .result-signs { gap: 14px; margin-bottom: 4px; }
    .result-breakdown { gap: 24px; }
    .result-west-label, .result-east-label { font-size: 9px; }
    .result-sign-name { font-size: 13px; }
    .clash-line-text { font-size: 22px; line-height: 1.3; max-width: 400px; }
    .share-btn { margin-top: 8px; padding: 10px 28px; font-size: 10px; }
    .result-footer { font-size: 10px; margin-top: 8px; }
    .try-again-btn { font-size: 10px; margin-top: 4px; }
  }

  @media (max-width: 560px) {
    .page { padding: 48px 12px 12px; }
    .header-title { font-size: 38px; }
    .result-combo-name { font-size: 26px; }
    .result-breakdown { gap: 32px; }
    .hiw-heading { font-size: 22px; }
    .envelope-frame { height: 250px; }
    .clash-line-text { font-size: 22px; }
    .wordmark { width: 320px !important; }
    .try-again-btn { margin-bottom: 0; }
  }

  @media (max-width: 1024px) {
    body {
      background: var(--dark-bg, #1A1410);
      overflow: auto;
    }
    .desk-wrapper {
      width: 100%;
      height: auto;
      min-height: 100vh;
      background: none;
      margin: 0;
    }
    .desk-frame-overlay {
      display: none;
    }
    .monitor-screen {
      position: relative;
      left: auto;
      top: auto;
      width: 100%;
      height: auto;
      min-height: 100vh;
      overflow: visible;
      border-radius: 0;
    }
  }
`;
document.head.appendChild(style);

// ─── APP ────────────────────────────────────────────────────────────────────

export default function App() {
  const [birthday, setBirthday] = useState("");
  const [result, setResult] = useState(null);
  const [phase, setPhase] = useState(PHASE.ENVELOPE);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const animating = useRef(false);

  // Preload all frames on mount + check for shared URL params
  useEffect(() => {
    FRAME_PATHS.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    // Check if someone arrived via a shared link like ?combo=Virgo-Horse
    const params = new URLSearchParams(window.location.search);
    const combo = params.get("combo");
    if (combo) {
      // Clean the URL without reloading
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  function handleReveal() {
    if (!birthday) return;
    const [year, month, day] = birthday.split("-").map(Number);
    const western = getWesternSign(month, day);
    const chinese = getChineseAnimal(year, month, day);
    const key = `${western.name}-${chinese.name}`;
    const clashLine = CLASH_LINES[key] || "A combination so rare, even the stars are confused.";
    setResult({ western, chinese, clashLine, key });
    // Skip straight to result — no opening animation
    setPhase(PHASE.REVEALED);
  }

  async function handleShare(r) {
    const shareUrl = `${window.location.origin}/api/share?combo=${r.key}`;
    const shareTitle = `I'm a ${r.western.name} ${r.chinese.name}`;
    const shareText = `${r.western.symbol} × ${r.chinese.emoji} — "${r.clashLine}" \n\nFind your Double Zodiac:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (e) {
        // User cancelled share — do nothing
      }
    } else {
      // Desktop fallback: copy link
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setShareMsg("Copied to clipboard!");
        setTimeout(() => setShareMsg(""), 2500);
      } catch (e) {
        setShareMsg("Copy this link: " + shareUrl);
        setTimeout(() => setShareMsg(""), 5000);
      }
    }
  }

  function animateFrames(startFrame, endFrame, onDone) {
    if (animating.current) return;
    animating.current = true;
    let frame = startFrame;
    const step = startFrame < endFrame ? 1 : -1;
    const interval = setInterval(() => {
      frame += step;
      setCurrentFrame(frame);
      if (frame === endFrame) {
        clearInterval(interval);
        animating.current = false;
        if (onDone) onDone();
      }
    }, 180);
  }

  function handleEnvelopeClick() {
    if (animating.current) return;
    if (phase === PHASE.ENVELOPE) {
      // Flip envelope from front to back: frames 0→7
      animateFrames(0, 7, () => setPhase(PHASE.BIRTHDAY));
    }
  }

  function handleReset() {
    setPhase(PHASE.ENVELOPE);
    setResult(null);
    setBirthday("");
    setCurrentFrame(0);
  }

  function handleBackFromHIW() {
    setShowHowItWorks(false);
  }

  // ─── HOW IT WORKS PAGE ─────────────────────────────────────────────────

  if (showHowItWorks) {
    return (
      <>
        <div className="ornament ornament-tl" />
        <div className="ornament ornament-tr" />
        <div className="ornament ornament-bl" />
        <div className="ornament ornament-br" />
        <div className="page">
          <div className="content hiw-content">
            <button className="try-again-btn" onClick={handleBackFromHIW} style={{ marginBottom: 24 }}>
              ← Back
            </button>
            <div className="header" style={{ marginBottom: 36 }}>
              <div className="header-label">Adstrology</div>
              <h1 className="header-title" style={{ fontSize: 40 }}>
                How it <em>works.</em>
              </h1>
            </div>
            <div className="hiw-section">
              <h2 className="hiw-heading">You have two zodiacs. They've never met.</h2>
              <p className="hiw-body">Western astrology and the Chinese zodiac are two of the oldest personality systems on earth. They were developed thousands of miles apart, using completely different logic, looking at completely different skies. And they've been quietly disagreeing about who you are since the day you were born.</p>
              <p className="hiw-body">I built this because I kept noticing the same thing in life: everybody's got a Co-Star notification on their phone, but nobody talks about the other zodiac–the one that runs on years, not months. Half the people I know plan their week around Mercury retrograde but couldn't tell you their Chinese animal. That felt like a gap, and I intend to fill it.</p>
            </div>
            <div className="hiw-divider" />
            <div className="hiw-section">
              <h2 className="hiw-heading">The West reads your month.</h2>
              <p className="hiw-body">Western astrology, the one you probably know, is based on the position of the sun at the moment of your birth. The year is divided into twelve signs, each lasting roughly a month: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces.</p>
              <p className="hiw-body">Your sign is tied to a constellation, an element (fire, earth, air, or water), and a set of personality traits that are supposed to explain how you think, create, and move through the world. In advertising, it's the sign that explains why you either thrive in brainstorms or need to be left alone with a blank doc.</p>
            </div>
            <div className="hiw-divider" />
            <div className="hiw-section">
              <h2 className="hiw-heading">The East reads your year.</h2>
              <p className="hiw-body">The Chinese zodiac works on a completely different clock. Instead of months, it runs on a twelve-year cycle, with each year assigned to an animal: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig.</p>
              <p className="hiw-body">Your animal isn't based on the stars, it's based on the lunar calendar, tied to a myth about a great race where twelve animals competed for their place in the cycle. The Rat won by riding the Ox and jumping off at the finish line. The Pig came last because it stopped for a snack. Honestly, the Pig sounds like most creatives on a Friday.</p>
              <p className="hiw-body">Each animal carries its own personality, its own strengths, its own warnings. And unlike Western astrology, which resets every month, your Chinese sign is shared by everyone born in your year; an entire generation of creatives marked by the same animal energy.</p>
            </div>
            <div className="hiw-divider" />
            <div className="hiw-section">
              <h2 className="hiw-heading">So what's the problem?</h2>
              <p className="hiw-body">The problem is that these two systems almost never agree.</p>
              <p className="hiw-body">Western astrology might call you cautious and analytical, the kind of creative who proofs the deck three times before the tissue session. The Chinese zodiac might call you reckless and free, the kind who scraps the whole campaign at midnight because the idea wasn't brave enough. One says you crave structure. The other says you can't sit through a status meeting. Same person, same birthday, two completely opposite readings.</p>
              <p className="hiw-body">That's your Double Zodiac. The collision between what the West says you are and what the East says you are. There are 144 possible combinations (12 Western signs × 12 Chinese animals), and every creative on earth falls into exactly one of them.</p>
            </div>
            <div className="hiw-divider" />
            <div className="hiw-section">
              <h2 className="hiw-heading">What does your Double Zodiac mean?</h2>
              <p className="hiw-body">It means you're more complicated than one system (or one job title) can explain.</p>
              <p className="hiw-body">Your Double Zodiac isn't a diagnosis. It's a contradiction. If, like me, you (want to) work in advertising, you already know that contradictions are where the interesting stuff lives. The tension between your two signs is where your creative voice gets its texture, its friction, its edge.</p>
              <p className="hiw-body">Maybe your Western sign is the version of you that shows up in the client meeting, and your Chinese sign is the one that comes out at 2 AM when you're actually making the work. Maybe one is the creative you're trying to become and the other is the one you can't help being. Maybe they take turns depending on the brief.</p>
            </div>
            <div className="hiw-divider" />
            <div className="hiw-section">
              <h2 className="hiw-heading">What's the red envelope?</h2>
              <p className="hiw-body">Every Lunar New Year growing up (and still to this day), my Nǎinai (grandma) gives me one of these Hóngbāo (red envelopes) to wish me good fortune for the year to come. Usually they have money (it symbolizes transferring good fortune, health, and energy from elders to younger generations. Chinese people love money). In my hóngbāo to you this Lunar New Year, I give you the gift of self-reflection. You're welcome!</p>
            </div>
            <div className="hiw-divider" />
            <div className="hiw-section" style={{ textAlign: "center" }}>
              <button className="reveal-btn" onClick={handleBackFromHIW}>Find your Double Zodiac</button>
              <br />
              <p className="hiw-footer">Adstrology — <a href="https://katiechao.xyz" target="_blank" rel="noopener noreferrer">Katie Chao</a>, Art Director</p>
            </div>
          </div>
        </div>
        <Analytics />
      </>
    );
  }

  // ─── MAIN FLOW ──────────────────────────────────────────────────────────

  return (
    <>
      <div className="desk-wrapper">
      <div className="desk-frame-overlay" />
      <div className="monitor-screen">
      <div className="ornament ornament-tl" />
      <div className="ornament ornament-tr" />
      <div className="ornament ornament-bl" />
      <div className="ornament ornament-br" />

      <div className="page">
        <div className="content">

          {/* PHASE: ENVELOPE FRONT — Landing page */}
          {(phase === PHASE.ENVELOPE || phase === PHASE.FLIPPING) && (
            <div className="envelope-stage">
              <img src="/wordmarkGold.png" alt="Adstrology" className="wordmark" style={{ marginBottom: 8, width: "280px", maxWidth: "80vw" }} />
              <p className="header-sub" style={{ marginBottom: 28 }}>Horoscopes written for people in advertising.<br />Find yours.</p>
              <img
                src={FRAME_PATHS[currentFrame]}
                alt="Red envelope"
                className={`envelope-frame${phase === PHASE.FLIPPING ? " no-click" : ""}`}
                onClick={handleEnvelopeClick}
                draggable={false}
              />
              {phase === PHASE.ENVELOPE && <div className="envelope-hint">Tap the envelope</div>}
              {phase === PHASE.FLIPPING && <div className="envelope-hint" style={{ animation: "none", opacity: 0.4 }}>...</div>}
              <button className="how-link" onClick={() => setShowHowItWorks(true)}>How it works</button>
            </div>
          )}

          {/* PHASE: BIRTHDAY — Back of envelope with input overlaid */}
          {(phase === PHASE.BIRTHDAY || phase === PHASE.OPENING) && (
            <div className="envelope-stage">
              <img src="/wordmarkGold.png" alt="Adstrology" className="wordmark" style={{ marginBottom: 8, width: "280px", maxWidth: "80vw" }} />
              {phase === PHASE.BIRTHDAY && (
                <div className="input-section" style={{ marginBottom: 20 }}>
                  <div className="input-label">Enter your birthday</div>
                  <input type="date" className="date-input" value={birthday} onChange={(e) => setBirthday(e.target.value)} min="1940-01-01" max="2030-12-31" />
                  <br />
                  <button className="reveal-btn" onClick={handleReveal} disabled={!birthday}>Open your envelope</button>
                </div>
              )}
              <img
                src={FRAME_PATHS[currentFrame]}
                alt="Red envelope"
                className="envelope-frame no-click"
                draggable={false}
              />
              {phase === PHASE.OPENING && <div className="envelope-hint" style={{ animation: "none", opacity: 0.4 }}>...</div>}
            </div>
          )}

          {/* PHASE: REVEALED — paper flat with result */}
          {phase === PHASE.REVEALED && result && (
            <div className="result-stage">
              <div className="result-info">
                <div className="result-signs">
                  <span className="result-sign-symbol">{result.western.symbol}</span>
                  <span className="result-vs">×</span>
                  <span className="result-sign-symbol">{result.chinese.emoji}</span>
                </div>
                <div className="result-combo-name">{result.western.name} {result.chinese.name}</div>
                <div className="result-subtitle">Your Double Zodiac</div>
                <div className="result-breakdown">
                  <div className="result-breakdown-item">
                    <div className="result-west-label">West says</div>
                    <div className="result-sign-name">{result.western.name}</div>
                  </div>
                  <div className="result-breakdown-item">
                    <div className="result-east-label">East says</div>
                    <div className="result-sign-name">{result.chinese.name}</div>
                  </div>
                </div>
              </div>

              <div className="clash-line-text">"{result.clashLine}"</div>

              <button className="share-btn" onClick={() => handleShare(result)}>
                Share your result
              </button>
              {shareMsg && <div className="share-msg">{shareMsg}</div>}

              <div className="result-footer">
                Your signs don't agree. <button className="now-what-link" onClick={() => setShowHowItWorks(true)}>Now what?</button>
                <br />
                <span style={{ opacity: 0.6 }}>Adstrology — <a href="https://katiechao.xyz" target="_blank" rel="noopener noreferrer">Katie Chao</a>, Art Director</span>
              </div>

              <div style={{ textAlign: "center" }}>
                <button className="try-again-btn" onClick={handleReset}>← Try another birthday</button>
              </div>
            </div>
          )}

        </div>
      </div>
      </div>
      </div>
      <Analytics />
    </>
  );
}
