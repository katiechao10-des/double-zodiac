import { useState, useEffect, useRef } from "react";

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

// Lunar New Year dates (approx) for accurate Chinese zodiac calculation
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
  // Each entry: [startMonth, startDay, signIndex]
  const ranges = [
    [1,20,1],[2,19,2],[3,21,3],[4,20,4],[5,21,5],[6,21,6],
    [7,23,7],[8,23,8],[9,23,9],[10,23,10],[11,22,11],[12,22,0]
  ];
  for (let i = 11; i >= 0; i--) {
    const [m, d, si] = ranges[i];
    if (month > m || (month === m && day >= d)) {
      return WESTERN_SIGNS[si];
    }
  }
  return WESTERN_SIGNS[0]; // Capricorn (born Jan 1-19)
}

function getChineseAnimal(year, month, day) {
  let zodiacYear = year;
  const lny = LNY_DATES[year];
  if (lny) {
    const [lnyMonth, lnyDay] = lny;
    if (month < lnyMonth || (month === lnyMonth && day < lnyDay)) {
      zodiacYear = year - 1;
    }
  }
  const index = ((zodiacYear - 1900) % 12 + 12) % 12;
  return CHINESE_ANIMALS[index];
}

// All 144 clash lines
const CLASH_LINES = {
  "Aries-Rat": "One charges in without a plan. The other had three plans before breakfast.",
  "Taurus-Rat": "Both want security. One hoards luxury. The other hoards escape routes.",
  "Gemini-Rat": "Two personalities meet the most cunning animal in the zodiac. That's at least five people in one body.",
  "Cancer-Rat": "One builds a fortress of feelings. The other tunnels underneath it looking for a better deal.",
  "Leo-Rat": "One needs to be the center of attention. The other is already three moves ahead while nobody's watching.",
  "Virgo-Rat": "The most anxious sign meets the most resourceful animal. You've prepared for disasters that haven't been invented yet.",
  "Libra-Rat": "One wants everyone to get along. The other is taking notes on who's useful.",
  "Scorpio-Rat": "One keeps secrets for power. The other keeps secrets for survival. Nobody will ever fully know you.",
  "Sagittarius-Rat": "One wants to explore the world. The other wants to own a small corner of it. You can't decide if you're a backpacker or a landlord.",
  "Capricorn-Rat": "Ambition squared. You'd climb a corporate ladder that hasn't been built yet and then charge people to use it.",
  "Aquarius-Rat": "One wants to save humanity. The other wants to outsmart it. You're the person who disrupts the system and then profits off the disruption.",
  "Pisces-Rat": "One lives in a dream world. The other is running a business out of it.",
  "Aries-Ox": "One sprints. The other plods. You start every project at full speed and finish it three years later.",
  "Taurus-Ox": "Double bull energy. You haven't changed your mind since 2014 and you're not about to start.",
  "Gemini-Ox": "One wants to talk about it. The other already decided six hours ago. Your mouth and your brain have never met.",
  "Cancer-Ox": "One nurtures with emotion. The other nurtures by working 14-hour days and calling it love.",
  "Leo-Ox": "One demands the spotlight. The other thinks the spotlight is a waste of electricity.",
  "Virgo-Ox": "You have never once in your life winged it and you're not sure people who do are real.",
  "Libra-Ox": "One weighs every option carefully. The other already picked the first option and plowed through the wall.",
  "Scorpio-Ox": "One holds grudges. The other holds grudges while doing manual labor. You'll outlast and outwork everyone who wronged you.",
  "Sagittarius-Ox": "One wants to run free. The other wants to plow a straight line until it dies. Your soul is a GPS recalculating forever.",
  "Capricorn-Ox": "You will succeed. It will take forty years. You will not mind.",
  "Aquarius-Ox": "One wants to revolutionize the world. The other wants the world to stay exactly the same. You are your own opposition party.",
  "Pisces-Ox": "One floats through life. The other is an immovable object. You are somehow both the river and the boulder.",
  "Aries-Tiger": "Two fire-starters in one body. You walk into a room and the room knows.",
  "Taurus-Tiger": "One wants peace and quiet. The other wants to fight something. You alternate between bubble baths and bar fights.",
  "Gemini-Tiger": "One talks fast. The other pounces fast. You're either charming someone or terrifying them and sometimes it's the same conversation.",
  "Cancer-Tiger": "A tiger in a blanket fort. Fiercely protective, deeply soft, and will absolutely destroy anyone who hurts the people you love.",
  "Leo-Tiger": "Two apex predators. One rules the jungle, the other rules the savanna. You've never had an understated moment in your life.",
  "Virgo-Tiger": "One attacks with precision. The other attacks with claws. Your criticism is both surgically accurate and emotionally devastating.",
  "Libra-Tiger": "One seeks harmony. The other seeks a fight. You're the diplomat who flips the table when diplomacy fails.",
  "Scorpio-Tiger": "One stalks from the shadows. The other leaps from the tall grass. Either way, they never see you coming.",
  "Sagittarius-Tiger": "One shoots the arrow. The other IS the arrow. You don't do anything at half speed and people find it exhausting.",
  "Capricorn-Tiger": "Disciplined ferocity. You climb mountains the way other people breathe. The only thing scarier than your ambition is your patience.",
  "Aquarius-Tiger": "One wants to change the system. The other wants to tear it apart. You're either a revolutionary or a chaos agent and honestly it depends on the day.",
  "Pisces-Tiger": "A tiger who writes poetry. You'll rip someone apart and then cry about it on the way home.",
  "Aries-Rabbit": "One charges into battle. The other hides in a hole. You live in a constant state of fight AND flight.",
  "Taurus-Rabbit": "Maximum comfort. You have strong opinions about thread count and you will die on this very soft hill.",
  "Gemini-Rabbit": "One talks to everyone. The other would rather not be perceived. You're the life of the party who needs to leave the party in 45 minutes.",
  "Cancer-Rabbit": "Feelings wrapped in feelings wrapped in a cashmere blanket. You're so gentle it's almost a weapon.",
  "Leo-Rabbit": "One wants attention. The other wants to observe quietly from the corner. You're famous on the internet and anonymous in real life.",
  "Virgo-Rabbit": "Both anxious. Both detail-oriented. You noticed a typo in this description before you finished reading it.",
  "Libra-Rabbit": "The most elegant combination in the zodiac. You were born with good taste and an inability to make quick decisions.",
  "Scorpio-Rabbit": "One sign says you're the most dangerous person in the room. The other says you apologize when someone steps on YOUR foot.",
  "Sagittarius-Rabbit": "One wants adventure. The other wants to stay home. You book a one-way ticket and then google 'how to cancel a one-way ticket.'",
  "Capricorn-Rabbit": "Quiet ambition. You're the person everyone underestimates until you own the company.",
  "Aquarius-Rabbit": "One is a rebel. The other is a diplomat. You start revolutions very, very politely.",
  "Pisces-Rabbit": "So soft you're practically translucent. You cried at a commercial today and you'll do it again tomorrow.",
  "Aries-Dragon": "One breathes fire. The other IS fire. People either worship you or get out of the way. There is no third option.",
  "Taurus-Dragon": "A dragon sitting on a pile of gold. You hoard beautiful things, refuse to share, and see absolutely nothing wrong with that.",
  "Gemini-Dragon": "One shapeshifts with words. The other shapeshifts with myth. Nobody knows which version of you is the real one, including you.",
  "Cancer-Dragon": "A dragon guarding a nest. Terrifying on the outside, devastatingly tender on the inside. Mess with your family and find out.",
  "Leo-Dragon": "The most extra combination in the entire zodiac. You have main character energy in a main character animal. Subtlety was never an option.",
  "Virgo-Dragon": "A mythical creature who color-codes their hoard. You're simultaneously the most powerful and most neurotic person in any room.",
  "Libra-Dragon": "A dragon in a silk robe. You want power AND aesthetics, dominance AND charm. You'll conquer the world but only if it's beautifully lit.",
  "Scorpio-Dragon": "Two of the most intense signs in their respective zodiacs in one body. Therapists see you coming and clear their afternoon.",
  "Sagittarius-Dragon": "A dragon that can't sit still. You want to fly everywhere, burn everything, learn everything, and be home by dinner.",
  "Capricorn-Dragon": "Strategic dominance. You're playing a game most people don't even know exists, and you're winning.",
  "Aquarius-Dragon": "A dragon who reads philosophy. You want to rule the world, but only to make it weirder.",
  "Pisces-Dragon": "A dragon made of water. Mythical, emotional, impossible to pin down. You live in a fantasy and somehow make it real.",
  "Aries-Snake": "One strikes first. The other waits. You're either recklessly brave or dangerously patient and no one knows which one's coming.",
  "Taurus-Snake": "Both sensual, both stubborn, both excellent at doing absolutely nothing for hours and calling it self-care.",
  "Gemini-Snake": "The most slippery combination alive. You can talk your way into or out of anything, and you do — daily.",
  "Cancer-Snake": "One coils protectively. The other smothers with love. You're either guarding someone or squeezing them too tight.",
  "Leo-Snake": "One wants to be adored. The other wants to be mysterious. You're the person at the party who everyone's watching but nobody's approaching.",
  "Virgo-Snake": "Cold-blooded precision. You notice everything, say nothing, and file it away for later. People are right to be nervous.",
  "Libra-Snake": "A snake in a flower garden. Beautiful, balanced, and absolutely lethal when the equilibrium is disturbed.",
  "Scorpio-Snake": "Two venomous signs. You're the final boss of emotional intelligence. You understand people so well it's almost unfair.",
  "Sagittarius-Snake": "One wants to explore. The other prefers to stay coiled and think. You're a philosopher who occasionally bites.",
  "Capricorn-Snake": "Patient ambition personified. You've been quietly working toward something for years and when it happens, everyone will act surprised.",
  "Aquarius-Snake": "One sheds skin. The other rewrites systems. You reinvent yourself so often your friends need a changelog.",
  "Pisces-Snake": "One slithers. The other drifts. You move through the world like smoke — everyone feels your presence but no one can grab hold.",
  "Aries-Horse": "Pure velocity. You have never once thought 'maybe I should slow down' and actually meant it.",
  "Taurus-Horse": "One wants to run. The other wants to stay. You're the person who renovates their apartment and then moves.",
  "Gemini-Horse": "One talks fast. The other runs fast. You've left three conversations mid-sentence today and it's 10 AM.",
  "Cancer-Horse": "One gallops away. The other clings tight. You leave and then call five times on the drive home.",
  "Leo-Horse": "Mane energy. You're loud, you're proud, you take up space, and your hair is doing something right now.",
  "Virgo-Horse": "One says you color-code your calendar. The other says you threw your calendar off a cliff.",
  "Libra-Horse": "One seeks balance. The other has never once been balanced. You're a graceful disaster or a disastrous grace, depending on the hour.",
  "Scorpio-Horse": "One runs from feelings. The other drowns in them. You're either emotionally unavailable or terrifyingly intense and you switch without warning.",
  "Sagittarius-Horse": "Double freedom. You've lived in four cities, changed your major three times, and you're not done. You will never be done.",
  "Capricorn-Horse": "A racehorse in a business suit. You're wildly ambitious but refuse to follow anyone else's track.",
  "Aquarius-Horse": "One runs free. The other thinks free. You're the person who quits a perfectly good job to start something that doesn't exist yet.",
  "Pisces-Horse": "A horse running through a dream. You're chasing something you can't name, and you look beautiful doing it.",
  "Aries-Goat": "One rams forward. The other grazes peacefully. You have big ambitions and zero urgency and it confuses everyone.",
  "Taurus-Goat": "Double earth energy. You want a beautiful life, good food, soft fabrics, and for nobody to rush you. Ever.",
  "Gemini-Goat": "One talks to the crowd. The other wanders off to eat flowers. Your attention span is either laser-focused or completely gone.",
  "Cancer-Goat": "Pure tenderness. You feel everything so deeply that you've cried in a grocery store more than once and you're at peace with it.",
  "Leo-Goat": "One wants the stage. The other wants the meadow. You perform brilliantly and then disappear for a week.",
  "Virgo-Goat": "An artist with a spreadsheet. You have the soul of a poet and the browser tabs of an accountant.",
  "Libra-Goat": "The most aesthetically gifted combination in the zodiac. Your living space looks like a magazine and you will not apologize.",
  "Scorpio-Goat": "A wolf in sheep's clothing, but make it literal. You look soft. You are not.",
  "Sagittarius-Goat": "One explores the mountain. The other lives on it. You want adventure but only the kind where you can bring a picnic.",
  "Capricorn-Goat": "Both goat-adjacent and completely different about it. One climbs for success. The other climbs because the view is nice.",
  "Aquarius-Goat": "A gentle radical. You want to change the world but you'd prefer to do it through art, thank you.",
  "Pisces-Goat": "So dreamy it's structural. You've built an entire life out of vibes and somehow it's working.",
  "Aries-Monkey": "Pure chaos with a purpose. You break things just to see how they work, and then you build something better.",
  "Taurus-Monkey": "One wants stability. The other is swinging from a chandelier. Your life is a constant negotiation between your savings account and your impulses.",
  "Gemini-Monkey": "The most dangerously clever combination in the zodiac. You could sell sand to a beach and the beach would thank you.",
  "Cancer-Monkey": "One clings to home. The other can't stop climbing trees. You're homesick everywhere and restless at home.",
  "Leo-Monkey": "One performs for the crowd. The other performs tricks on the crowd. You're either an entertainer or a con artist and the line is blurry.",
  "Virgo-Monkey": "One analyzes the problem. The other has already solved it with a workaround nobody asked for. You're a genius with an asterisk.",
  "Libra-Monkey": "Charm offensive. You're so likable it's suspicious and so clever it's disarming. People agree with you before they realize what happened.",
  "Scorpio-Monkey": "One manipulates from the shadows. The other does it in broad daylight with a grin. You're the smartest person in the room and everyone knows it, which is the problem.",
  "Sagittarius-Monkey": "One explores. The other experiments. You've tried everything once, most things twice, and regret is not in your vocabulary.",
  "Capricorn-Monkey": "A monkey in a three-piece suit. You look professional until you don't, and the switch is instant.",
  "Aquarius-Monkey": "Two tricksters. You're inventing the future while everyone else is still reading the manual for the present.",
  "Pisces-Monkey": "A monkey who daydreams. You're either solving a complex problem or staring out a window, and sometimes they're the same thing.",
  "Aries-Rooster": "One charges. The other crows about it. You do everything boldly and then make sure everyone heard.",
  "Taurus-Rooster": "Stubborn AND opinionated. You have never once kept a thought to yourself and you've never once changed your mind.",
  "Gemini-Rooster": "One talks. The other announces. You don't have conversations — you have broadcasts.",
  "Cancer-Rooster": "One protects quietly. The other protects loudly. You're the friend who will fight someone on your behalf and also make you soup.",
  "Leo-Rooster": "Two showoffs. You've never entered a room — you've arrived. The only question is whether the room was ready.",
  "Virgo-Rooster": "The most detail-obsessed combination alive. You spotted a crooked picture frame from across the restaurant and it's been ruining your meal.",
  "Libra-Rooster": "One wants harmony. The other wants to be right. You'll keep the peace as long as the peace agrees with you.",
  "Scorpio-Rooster": "Observant to the point of surveillance. You notice what people are wearing, what they're hiding, and exactly how long they hesitated before answering.",
  "Sagittarius-Rooster": "One explores freely. The other follows a strict routine. You want adventure as long as it starts on time.",
  "Capricorn-Rooster": "Ruthless efficiency. You wake up at 5 AM, accomplish more by noon than most people do in a week, and have opinions about how everyone else spends their morning.",
  "Aquarius-Rooster": "One wants to disrupt. The other wants to critique. You tear things apart — systems, arguments, outfits — and you're always right, which makes it worse.",
  "Pisces-Rooster": "A rooster at sunrise, a dreamer at sunset. You swing between razor-sharp criticism and profound emotional softness, sometimes in the same sentence.",
  "Aries-Dog": "A guard dog with no leash. Loyal, fearless, and running straight at the problem before anyone said go.",
  "Taurus-Dog": "Maximum loyalty, maximum stubbornness. You will sit beside someone forever and absolutely refuse to move on command.",
  "Gemini-Dog": "One is everyone's best friend. The other is everyone's best friend for different reasons. You're the most popular person in any room and you're exhausted by it.",
  "Cancer-Dog": "Two of the most loyal signs in their respective zodiacs. You love so hard it's almost a full-time job.",
  "Leo-Dog": "A golden retriever meets a lion. Big energy, big heart, big need for approval. You'd rescue someone and then need them to tell you you did a good job.",
  "Virgo-Dog": "A service animal who also judges you. You'll help anyone with anything and silently note everything they're doing wrong.",
  "Libra-Dog": "One wants justice. The other wants fairness. You're the friend who mediates every group argument and then loses sleep over whether you got it right.",
  "Scorpio-Dog": "Loyalty with teeth. You'd die for the people you love and you keep a mental list of everyone who's hurt them.",
  "Sagittarius-Dog": "One wants to run free. The other wants to come home. You're the dog at the dog park who keeps checking to make sure the owner's still there.",
  "Capricorn-Dog": "A working dog. You don't understand the concept of a day off and you're suspicious of people who do.",
  "Aquarius-Dog": "A rescue dog who rescues others. You're loyal to humanity as a concept but kind of weird about it on an individual level.",
  "Pisces-Dog": "The most empathetic combination in the zodiac. You absorb everyone's feelings like a sponge and then need three days alone to wring yourself out.",
  "Aries-Pig": "One charges headfirst into battle. The other would rather take a nap.",
  "Taurus-Pig": "The most indulgent combination imaginable. You've turned 'treat yourself' from a motto into an Olympic sport.",
  "Gemini-Pig": "One is the social butterfly. The other is the potluck host. You'll talk to everyone at the party and also make sure everyone's fed.",
  "Cancer-Pig": "Pure comfort. You're a warm kitchen, a full table, and an open door. People feel safe around you and they can't always explain why.",
  "Leo-Pig": "One wants to shine. The other wants to feast. You throw the best parties anyone's ever been to and you always remember to toast yourself.",
  "Virgo-Pig": "One wants everything perfect. The other wants everything delicious. You're the person who organizes the spice rack by cuisine.",
  "Libra-Pig": "Grace and generosity. You give and give and give and then feel personally offended when someone doesn't reciprocate at the same level.",
  "Scorpio-Pig": "Beneath that warm, generous exterior is someone who remembers every slight. You'll feed your enemies but you'll never forget what they did.",
  "Sagittarius-Pig": "One wants to travel the world. The other wants to eat the world. Your passport is just a restaurant guide with stamps.",
  "Capricorn-Pig": "One works hard. The other plays hard. You'll grind all week and then spend the weekend doing nothing with an intensity that borders on professional.",
  "Aquarius-Pig": "One is idealistic. The other is naive. You believe the best in people with a stubbornness that is either beautiful or reckless.",
  "Pisces-Pig": "Pure vibes. You're kind, dreamy, generous, and probably not reading this because you got distracted by something beautiful three sentences ago.",
};

// ─── STYLES ─────────────────────────────────────────────────────────────────

const style = document.createElement("style");
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --red: #B8372E;
    --deep-red: #8B1A1A;
    --gold: #C9A84C;
    --pale-gold: #E8D5A3;
    --cream: #FDF6EC;
    --warm-white: #FEFCF8;
    --ink: #1A1410;
    --ink-light: #4A3F35;
    --ink-faint: #8C7E6E;
    --parchment: #F5EDE0;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: var(--warm-white);
    color: var(--ink);
    font-family: 'DM Sans', sans-serif;
    overflow-x: hidden;
  }

  .page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    position: relative;
  }

  .page::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse at 20% 0%, rgba(184, 55, 46, 0.04) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 100%, rgba(201, 168, 76, 0.06) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  .content { position: relative; z-index: 1; width: 100%; max-width: 520px; }

  /* ── Header ── */
  .header {
    text-align: center;
    margin-bottom: 48px;
  }

  .header-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 16px;
  }

  .header-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 52px;
    font-weight: 700;
    color: var(--ink);
    line-height: 1.05;
    margin-bottom: 20px;
  }

  .header-title em {
    color: var(--red);
    font-style: italic;
  }

  .header-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 300;
    color: var(--ink-faint);
    line-height: 1.6;
    max-width: 380px;
    margin: 0 auto;
  }

  /* ── Divider ── */
  .divider {
    width: 60px;
    height: 1px;
    background: var(--gold);
    margin: 32px auto;
    opacity: 0.5;
  }

  /* ── Date Input ── */
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

  .date-input::-webkit-calendar-picker-indicator {
    opacity: 0.4;
    cursor: pointer;
  }

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

  .reveal-btn:hover {
    background: var(--deep-red);
    transform: translateY(-1px);
  }

  .reveal-btn:disabled {
    opacity: 0.3;
    cursor: default;
    transform: none;
  }

  /* ── Result Card ── */
  .result-card {
    background: var(--cream);
    border: 1px solid var(--pale-gold);
    padding: 48px 36px;
    text-align: center;
    position: relative;
    animation: cardReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
  }

  @keyframes cardReveal {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  .result-card::before,
  .result-card::after {
    content: '';
    position: absolute;
    top: 8px; left: 8px; right: 8px; bottom: 8px;
    border: 1px solid var(--pale-gold);
    pointer-events: none;
    opacity: 0.6;
  }

  .result-signs {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-bottom: 8px;
  }

  .result-sign-symbol {
    font-size: 36px;
    line-height: 1;
  }

  .result-vs {
    font-family: 'Cormorant Garamond', serif;
    font-size: 14px;
    color: var(--gold);
    font-style: italic;
  }

  .result-combo-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 6px;
  }

  .result-subtitle {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--ink-faint);
    margin-bottom: 28px;
  }

  .result-line-container {
    border-top: 1px solid var(--pale-gold);
    border-bottom: 1px solid var(--pale-gold);
    padding: 24px 8px;
    margin-bottom: 28px;
  }

  .result-clash-line {
    font-family: 'Cormorant Garamond', serif;
    font-size: 19px;
    font-weight: 400;
    font-style: italic;
    color: var(--ink-light);
    line-height: 1.65;
  }

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

  .result-breakdown {
    display: flex;
    justify-content: center;
    gap: 48px;
    margin-bottom: 28px;
  }

  .result-breakdown-item { text-align: center; }

  .result-footer {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: var(--ink-faint);
    letter-spacing: 0.5px;
  }

  .result-footer a {
    color: var(--red);
    text-decoration: none;
  }

  /* ── Try Again ── */
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

  /* ── Gold corner ornaments ── */
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

  @media (max-width: 560px) {
    .header-title { font-size: 38px; }
    .result-card { padding: 36px 24px; }
    .result-combo-name { font-size: 26px; }
    .result-clash-line { font-size: 17px; }
    .result-breakdown { gap: 32px; }
    .hiw-heading { font-size: 22px; }
  }

  /* ── How it works link ── */
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

  /* ── Now what link in results ── */
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

  /* ── How It Works page ── */
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

  .hiw-aside {
    font-style: italic;
    color: var(--ink-faint);
  }

  .hiw-divider {
    width: 40px;
    height: 1px;
    background: var(--gold);
    margin: 32px 0;
    opacity: 0.4;
  }

  .hiw-footer {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: var(--ink-faint);
    margin-top: 20px;
    letter-spacing: 0.5px;
  }

  .hiw-footer a {
    color: var(--red);
    text-decoration: none;
  }
`;
document.head.appendChild(style);

// ─── APP ────────────────────────────────────────────────────────────────────

export default function App() {
  const [birthday, setBirthday] = useState("");
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  function handleReveal() {
    if (!birthday) return;
    const [year, month, day] = birthday.split("-").map(Number);
    const western = getWesternSign(month, day);
    const chinese = getChineseAnimal(year, month, day);
    const key = `${western.name}-${chinese.name}`;
    const clashLine = CLASH_LINES[key] || "A combination so rare, even the stars are confused.";
    setResult({ western, chinese, clashLine, key });
    setShowResult(true);
  }

  function handleReset() {
    setShowResult(false);
    setResult(null);
    setBirthday("");
  }

  function handleBackFromHIW() {
    setShowHowItWorks(false);
  }

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
              <div className="header-label">East Says Horse</div>
              <h1 className="header-title" style={{ fontSize: 40 }}>
                How it <em>works.</em>
              </h1>
            </div>

            <div className="hiw-section">
              <h2 className="hiw-heading">You have two zodiacs. They've never met.</h2>
              <p className="hiw-body">
                Western astrology and the Chinese zodiac are two of the oldest personality systems on earth. They were developed thousands of miles apart, using completely different logic, looking at completely different skies. And they've been quietly disagreeing about who you are since the day you were born.
              </p>
            </div>

            <div className="hiw-divider" />

            <div className="hiw-section">
              <h2 className="hiw-heading">The West reads your month.</h2>
              <p className="hiw-body">
                Western astrology — the one you probably know — is based on the position of the sun at the moment of your birth. The year is divided into twelve signs, each lasting roughly a month: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces.
              </p>
              <p className="hiw-body">
                Your sign is tied to a constellation, an element (fire, earth, air, or water), and a set of personality traits that are supposed to explain how you think, love, and move through the world.
              </p>
              <p className="hiw-body hiw-aside">
                When someone at a party asks "what's your sign?" — this is the one they mean.
              </p>
            </div>

            <div className="hiw-divider" />

            <div className="hiw-section">
              <h2 className="hiw-heading">The East reads your year.</h2>
              <p className="hiw-body">
                The Chinese zodiac works on a completely different clock. Instead of months, it runs on a twelve-year cycle, with each year assigned to an animal: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig.
              </p>
              <p className="hiw-body">
                Your animal isn't based on the stars — it's based on the lunar calendar, tied to a myth about a great race where twelve animals competed for their place in the cycle. The Rat won by riding the Ox and jumping off at the finish line. The Pig came last because it stopped for a snack.
              </p>
              <p className="hiw-body">
                Each animal carries its own personality, its own strengths, its own warnings. And unlike Western astrology, which resets every month, your Chinese sign is shared by everyone born in your year — an entire generation marked by the same animal.
              </p>
            </div>

            <div className="hiw-divider" />

            <div className="hiw-section">
              <h2 className="hiw-heading">So what's the problem?</h2>
              <p className="hiw-body">
                The problem is that these two systems almost never agree.
              </p>
              <p className="hiw-body">
                Western astrology might call you cautious and analytical. The Chinese zodiac might call you reckless and free. One says you crave stability. The other says you can't sit still. Same person, same birthday, two completely opposite readings.
              </p>
              <p className="hiw-body">
                That's your Double Zodiac — the collision between what the West says you are and what the East says you are. There are 144 possible combinations (12 Western signs × 12 Chinese animals), and every person on earth falls into exactly one of them.
              </p>
            </div>

            <div className="hiw-divider" />

            <div className="hiw-section">
              <h2 className="hiw-heading">What does your Double Zodiac mean?</h2>
              <p className="hiw-body">
                It means you're more complicated than one system can explain.
              </p>
              <p className="hiw-body">
                Your Double Zodiac isn't a diagnosis. It's a contradiction — and contradictions are where the interesting stuff lives. The tension between your two signs is where your personality gets its texture, its friction, its depth.
              </p>
              <p className="hiw-body">
                Maybe your Western sign is the version of you that shows up at work, and your Chinese sign is the version that comes out at midnight. Maybe one is who you're trying to be and the other is who you can't help being. Maybe they take turns.
              </p>
              <p className="hiw-body">
                This tool isn't here to tell you who you are. It's here to show you that two ancient civilizations tried, and they couldn't agree.
              </p>
            </div>

            <div className="hiw-divider" />

            <div className="hiw-section" style={{ textAlign: "center" }}>
              <button className="reveal-btn" onClick={handleBackFromHIW}>
                Find your Double Zodiac
              </button>
              <br />
              <p className="hiw-footer">
                East Says Horse — by <a href="https://katiechao.xyz" target="_blank" rel="noopener noreferrer">Katie Chao</a>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="ornament ornament-tl" />
      <div className="ornament ornament-tr" />
      <div className="ornament ornament-bl" />
      <div className="ornament ornament-br" />

      <div className="page">
        <div className="content">
          {!showResult ? (
            <>
              <div className="header">
                <div className="header-label">East Says Horse</div>
                <h1 className="header-title">
                  Double <em>Zodiac.</em>
                </h1>
                <p className="header-sub">
                  You have two zodiac signs. They don't agree on who you are.
                </p>
              </div>

              <div className="divider" />

              <div className="input-section">
                <div className="input-label">Enter your birthday</div>
                <input
                  type="date"
                  className="date-input"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  min="1940-01-01"
                  max="2030-12-31"
                />
                <br />
                <button
                  className="reveal-btn"
                  onClick={handleReveal}
                  disabled={!birthday}
                >
                  Reveal your crisis
                </button>
                <br />
                <button className="how-link" onClick={() => setShowHowItWorks(true)}>
                  How it works
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="result-card" key={result.key}>
                <div className="result-signs">
                  <span className="result-sign-symbol">{result.western.symbol}</span>
                  <span className="result-vs">×</span>
                  <span className="result-sign-symbol">{result.chinese.emoji}</span>
                </div>

                <div className="result-combo-name">
                  {result.western.name} {result.chinese.name}
                </div>

                <div className="result-subtitle">Your Double Zodiac</div>

                <div className="result-line-container">
                  <p className="result-clash-line">"{result.clashLine}"</p>
                </div>

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

                <div className="result-footer">
                  Your signs don't agree. <button className="now-what-link" onClick={() => setShowHowItWorks(true)}>Now what?</button>
                  <br />
                  <span style={{ opacity: 0.6 }}>East Says Horse — by <a href="https://katiechao.xyz" target="_blank" rel="noopener noreferrer">Katie Chao</a></span>
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <button className="try-again-btn" onClick={handleReset}>
                  ← Try another birthday
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}