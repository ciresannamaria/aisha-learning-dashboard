import React, { useEffect, useMemo, useState } from "react";

const sections = [
  { id: "home", label: "Home", icon: "🏡" },
  { id: "calendar", label: "Calendar", icon: "🗓️" },
  { id: "school", label: "My School Day", icon: "🎒" },
  { id: "coding", label: "Coding Lab", icon: "🤖", earnsStar: true },
  { id: "math", label: "Math Games", icon: "🧩", earnsStar: true },
  { id: "feelings", label: "Emotions", icon: "😊", earnsStar: true },
  { id: "future", label: "Professions", icon: "🌍", earnsStar: true },
  { id: "food", label: "Food", icon: "🍎", earnsStar: true },
  { id: "stars", label: "My Stars", icon: "⭐" },
];

const questions = [
  { question: "What is 8 + 7?", answers: ["14", "15", "16"], correct: "15", explanation: "8 + 7 = 15. You can make 10 first: 8 + 2 + 5!" },
  { question: "What is 20 − 6?", answers: ["13", "14", "15"], correct: "14", explanation: "20 − 6 = 14. Great thinking!" },
  { question: "What is 5 × 3?", answers: ["8", "15", "20"], correct: "15", explanation: "5 groups of 3 make 15!" },
  { question: "What comes next? 2, 4, 6, 8, …", answers: ["9", "10", "12"], correct: "10", explanation: "We are counting in twos: 2, 4, 6, 8, 10." },
  { question: "What is 30 + 25?", answers: ["45", "55", "65"], correct: "55", explanation: "30 + 20 + 5 = 55!" },
  { question: "Which number is the biggest?", answers: ["49", "94", "59"], correct: "94", explanation: "94 has 9 tens, so it is the biggest." },
  { question: "What is 100 − 25?", answers: ["65", "75", "85"], correct: "75", explanation: "100 − 25 = 75. You did it!" },
];

const codingLinks = [
  { name: "Code.org", url: "https://studio.code.org/courses/coursec-2025/units/1", icon: "💻" },
  { name: "Scratch · Meet and Do", url: "https://scratch.mit.edu/", icon: "🐱" },
];

const mathLinks = [
  { name: "Matific", detail: "Interactive maths activities and games.", url: "https://www.matific.com/", icon: "🎲" },
  { name: "Math Is Fun", detail: "Friendly explanations, puzzles and number games.", url: "https://www.mathsisfun.com/", icon: "🔢" },
];

function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem("aisha-dashboard-progress") || "{}");
    const firstStarDate = (saved.history || []).map(item => item.date).filter(Boolean).sort()[0];
    return { stars: 0, completed: [], history: [], achievements: [], cycleStartedAt: firstStarDate || new Date().toISOString(), celebrationPending: false, ...saved };
  } catch {
    return { stars: 0, completed: [], history: [], achievements: [], cycleStartedAt: new Date().toISOString(), celebrationPending: false };
  }
}

function App() {
  const [active, setActive] = useState("home");
  const [progress, setProgress] = useState(readSaved);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [roundScore, setRoundScore] = useState(0);
  const [roundFinished, setRoundFinished] = useState(false);


  useEffect(() => {
    localStorage.setItem("aisha-dashboard-progress", JSON.stringify(progress));
  }, [progress]);

  const question = questions[questionIndex];
  const earnedToday = progress.completed.includes("math-starter");

  function addStars(old, amount, label) {
    if (!amount) return old;
    const now = new Date();
    let total = (old.stars || 0) + amount;
    let achievements = [...(old.achievements || [])];
    let cycleStart = old.cycleStartedAt || now.toISOString();
    let celebrationPending = old.celebrationPending || false;
    while (total >= 50) {
      const days = Math.max(1, Math.ceil((now - new Date(cycleStart)) / 86400000));
      achievements.push({ id: crypto.randomUUID(), date: now.toISOString(), days, stars: 50, treat: "" });
      total -= 50;
      cycleStart = now.toISOString();
      celebrationPending = true;
    }
    const historyItems = Array.from({ length: amount }, () => ({ id: crypto.randomUUID(), label, date: now.toISOString(), stars: 1 }));
    return { ...old, stars: total, achievements, cycleStartedAt: cycleStart, celebrationPending, history: [...(old.history || []), ...historyItems] };
  }

  function completeMathRound() {
    if (!earnedToday) {
      setProgress((old) => ({ ...addStars(old, roundScore, "Math Games · correct answer"), completed: [...old.completed, "math-starter"] }));
    }
    setRoundFinished(true);
  }

  function chooseAnswer(choice) {
    if (answer) return;
    setAnswer(choice);
    if (choice === question.correct) setRoundScore((score) => score + 1);
  }

  function nextQuestion() {
    if (questionIndex === questions.length - 1) {
      completeMathRound();
      return;
    }
    setQuestionIndex((index) => index + 1);
    setAnswer("");
  }

  function restartMath() {
    setQuestionIndex(0);
    setAnswer("");
    setRoundScore(0);
    setRoundFinished(false);
  }

  const badges = useMemo(() => [
    { icon: "🌈", title: "Curious learner", description: "You opened your learning world!", unlocked: true },
    { icon: "🔢", title: "Math explorer", description: "Finish your first maths challenge.", unlocked: earnedToday },
    { icon: "🤖", title: "Coding explorer", description: "Visit a coding activity.", unlocked: progress.completed.some((item) => item.startsWith("coding-")) },
    { icon: "🥦", title: "Food detective", description: "Try the healthy plate quiz.", unlocked: progress.completed.includes("food") },
  ], [earnedToday, progress.completed]);

  function markCompleted(id) {
    const labels = { "profession-teacher": "Professions · explored Teacher", "coding-Scratch": "Coding Lab · opened Scratch", "coding-Code.org": "Coding Lab · opened Code.org", "coding-Blockly Games": "Coding Lab · opened Blockly Games", "feeling-happy": "Emotions · learned about Happiness", "feeling-awe": "Emotions · learned about Awe" };
    setProgress((old) => old.completed.includes(id) ? old : {
      ...addStars(old, 1, labels[id] || "Learning activity"),
      completed: [...old.completed, id],
    });
  }

  function awardFoodQuizStars(score) {
    const earned = Math.floor(score / 3);
    setProgress((old) => ({
      ...addStars(old, earned, "Healthy Me · 3 correct quiz answers"),
      completed: old.completed.includes("food") ? old.completed : [...old.completed, "food"],
    }));
  }

  function dismissCelebration() {
    setProgress((old) => ({ ...old, celebrationPending: false }));
  }

  return (
    <div className="app-shell">
      {progress.celebrationPending && <div className="star-celebration-overlay" role="dialog" aria-modal="true" aria-labelledby="star-celebration-title"><div className="star-celebration-card"><div className="star-celebration-art">🎉⭐🎁</div><p className="eyebrow">A SPECIAL MILESTONE</p><h2 id="star-celebration-title">Well done, Aisha!</h2><p>You collected 50 stars! Go and choose your special treat with Mum.</p><button className="primary-button" onClick={dismissCelebration}>Yay! ✨</button></div></div>}
      <header className="topbar">
        <a className="brand" href="#home" onClick={() => setActive("home")} aria-label="Aisha's home">
          <span className="brand-icon">🌈</span>
          <span><strong>Aisha's Dashboard</strong></span>
        </a>
        <div className="top-stats"><button className="star-history-button" onClick={() => setActive("stars")} aria-label="View star history">⭐ {progress.stars}</button></div>
      </header>

      <div className="layout">
        <aside className="sidebar" aria-label="Main navigation">
          <p className="nav-caption">MY WORLD</p>
          {sections.map((section) => (
            <button key={section.id} className={`nav-button ${active === section.id ? "active" : ""}`} onClick={() => setActive(section.id)}>
              <span>{section.icon}</span><span className="nav-label">{section.label}</span>{section.earnsStar && <span className="nav-star" aria-label="You can earn a star here">⭐</span>}
            </button>
          ))}
        </aside>

        <main className="main-content">
          {active === "home" && <Home setActive={setActive} stars={progress.stars} />}
          {active === "school" && <School />}
          {active === "future" && <FutureWorld markCompleted={markCompleted} />}
          {active === "food" && <Food markCompleted={markCompleted} awardFoodQuizStars={awardFoodQuizStars} />}
          {active === "feelings" && <MyFeelings markCompleted={markCompleted} />}
          {active === "coding" && <Coding markCompleted={markCompleted} />}
          {active === "math" && <MathGames awardTreasureStar={() => setProgress((old) => ({ ...addStars(old, 1, "Math Games · completed Treasure Hunt"), completed: [...old.completed, "math-treasure-hunt"] }))} hasTreasureStar={progress.completed.includes("math-treasure-hunt")} />}
          {active === "calendar" && <Calendar />}
          {active === "stars" && <Achievements progress={progress} />}
          <footer className="footer">Made with <span>♥</span> for Aisha</footer>
        </main>
      </div>
    </div>
  );
}

function Calendar() {
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const today = clock;
  const todayKey = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");
  const holidayStart = "2026-12-23";
  const holidayEnd = "2027-01-06";
  const startDate = new Date(2026, 11, 23);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysToHoliday = Math.max(0, Math.ceil((startDate - todayMidnight) / 86400000));
  const dayProgress = Math.max(0, Math.min(100, ((86400000 - (today.getHours() * 3600000 + today.getMinutes() * 60000 + today.getSeconds() * 1000 + today.getMilliseconds())) / 86400000) * 100));
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [view, setView] = useState("month");
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const marketEvents = [];
  for (let date = new Date(2026, 10, 5); date <= new Date(2027, 10, 4); date.setDate(date.getDate() + 7)) {
    const key = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
    marketEvents.push({ date: key, time: "Morning", title: "Morning market & a sweet treat", detail: "A little stop at the market before work and school to choose some sweets together.", icon: "🍬", color: "market" });
  }
  const fridayBreakfastEvents = [];
  for (let date = new Date(2026, 10, 6); date <= new Date(2027, 10, 5); date.setDate(date.getDate() + 7)) {
    const key = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
    fridayBreakfastEvents.push({ date: key, time: "Morning", title: "Special Friday Breakfast", detail: "A lovely breakfast made just for you — a little Friday treat to look forward to!", icon: "🥞", color: "breakfast" });
  }
  const recurringSundayEvents = [];
  for (let date = new Date(2026, 10, 8); date <= new Date(2027, 10, 7); date.setDate(date.getDate() + 7)) {
    const key = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
    if (date <= new Date(2026, 11, 13)) {
      recurringSundayEvents.push({ date: key, time: "11:00 AM–12:00 PM", title: "Swimming club", detail: "Swimming course (last session: December 13, 2026).", icon: "🏊", color: "swimming" });
    }
    recurringSundayEvents.push({ date: key, time: "2:30–4:30 PM", title: "Chess club", detail: "Chess club — time to practise moves and play!", icon: "♟️", color: "chess" });
  }
  const events = [
    { date: "2026-11-07", time: "11:00 AM", title: "Meet our friends", detail: "Sushi together, then a playground visit.", icon: "🍣", color: "sushi" },
    { date: "2026-11-09", time: "5:30–7:00 PM", title: "Lanterns Exhibition", detail: "Aisha’s school lanterns exhibition.", icon: "🏮", color: "school" },
    { date: "2026-11-10", time: "4:15 PM", title: "St Martin Parade", detail: "St George School.", icon: "🏮", color: "school" },
    { date: "2026-11-11", time: "5:30 PM", title: "Lanterns St Martin – Aisha", detail: "Meet in the classroom.", icon: "🏮", color: "school" },
    { date: "2026-11-14", time: "9:00 AM", title: "Meeting with Fatima", detail: "", icon: "🤝", color: "school" },
    { date: "2026-11-09", time: "All day", title: "No OGS", detail: "No after-school care today.", icon: "📌", color: "school" },
    { date: "2026-11-11", time: "All day", title: "No OGS", detail: "No after-school care today.", icon: "📌", color: "school" },
    ...marketEvents,
    ...fridayBreakfastEvents,
    ...recurringSundayEvents,
  ];
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const monthName = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const dateKey = (date) => date ? [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-") : "";
  const isoWeek = (date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };
  const first = new Date(year, monthIndex, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((offset + daysInMonth) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1;
    return day > 0 && day <= daysInMonth ? new Date(year, monthIndex, day) : null;
  });
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const selected = new Date(selectedDate + "T12:00:00");
  const monday = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const selectedWeek = Array.from({ length: 7 }, (_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
  const weekLabel = selectedWeek[0].toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " – " + selectedWeek[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const selectedEvents = events.filter(event => event.date === selectedDate);
  const moveMonth = (amount) => setMonth(new Date(year, monthIndex + amount, 1));
  const moveWeek = (amount) => {
    const next = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + amount * 7);
    setSelectedDate(dateKey(next));
    setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
  };
  const goToThisWeek = () => {
    setSelectedDate(todayKey);
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };
  return <>
    <div className="page-heading calendar-page-heading"><div><h1>Calendar</h1><p className="page-subtitle">Aisha, this is our family calendar. You can look here to see our plans and events.</p></div></div>
    <section className="calendar-panel">
      <div className="calendar-toolbar">
        <button className="secondary-button" onClick={() => view === "week" ? moveWeek(-1) : moveMonth(-1)} aria-label={view === "week" ? "Previous week" : "Previous month"}>‹</button>
        <h2><span className="calendar-heading-leaves">🍂</span> {view === "week" ? weekLabel : monthName}</h2>
        <button className="secondary-button" onClick={() => view === "week" ? moveWeek(1) : moveMonth(1)} aria-label={view === "week" ? "Next week" : "Next month"}>›</button>
        <div className="calendar-view-toggle"><button className={view === "month" ? "active" : ""} onClick={() => setView("month")}>Month</button><button className={view === "week" ? "active" : ""} onClick={() => setView("week")}>Week</button></div>
        <button className="calendar-today-button" onClick={goToThisWeek}>This week</button>
      </div>
      <div className="calendar-grid">
        <div className="calendar-weekday calendar-week-number"></div>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => <div className="calendar-weekday" key={day}>{day}</div>)}
        {(view === "month" ? weeks : [selectedWeek]).map((week, weekIndex) => {
          const weekDate = week.find(Boolean);
          return <React.Fragment key={weekIndex}>
            <div className="calendar-week-number">{weekDate ? isoWeek(weekDate) : ""}</div>
            {week.map((date, dayIndex) => {
              const key = dateKey(date);
              const dayEvents = events.filter(event => event.date === key);
              const isToday = date && date.toDateString() === today.toDateString();
              const isHoliday = date && key >= holidayStart && key <= holidayEnd;
              return <button key={key || "blank-" + dayIndex} className={`calendar-day ${!date ? "empty" : ""} ${isHoliday ? "holiday" : ""} ${isToday ? "today" : ""} ${key === selectedDate ? "selected" : ""}`} disabled={!date} onClick={() => setSelectedDate(key)}>
                {date && <><span className="calendar-day-number">{date.getDate()}</span>{dayEvents.map(event => <span className="calendar-event-dot" key={event.title}>{event.icon} <small>{event.title}</small></span>)}</>}
              </button>;
            })}
          </React.Fragment>;
        })}
      </div>
      <div className="calendar-event-list">
        <h3>✨ {selectedEvents.length ? "Plans for this day" : "A little look ahead"}</h3>
        {selectedEvents.length ? selectedEvents.map(event => <div className="calendar-event-card" key={event.title}><span>{event.icon}</span><div><b>{event.title}</b><small>{new Date(event.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })} · {event.time}</small></div></div>) : <p className="calendar-empty-note">Tap a day to see its plans. More adventures can be added here!</p>}
      </div>
    </section>
    <div className="day-progress" aria-label={`Today is ${Math.round(dayProgress)} percent remaining`}><div className="day-progress-label"><span>Today</span><small>Time left in the day</small></div><div className="day-progress-track"><span style={{ width: `${dayProgress}%` }} /></div></div>
  </>;
}

function PageHeading({ eyebrow, title, subtitle, emoji }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title} <span>{emoji}</span></h1><p className="page-subtitle">{subtitle}</p></div></div>;
}

function Home({ setActive, stars }) {
  const cards = [
    { id: "calendar", icon: "🗓️", title: "Calendar", text: "See dates, plans and upcoming events.", color: "blue" },
    { id: "school", icon: "🎒", title: "My School Day", text: "Timetable, school things and reminders.", color: "blue" },
    { id: "coding", icon: "🤖", title: "Coding Lab", text: "Give instructions and create things.", color: "purple" , earnsStar: true},
    { id: "math", icon: "🧩", title: "Math Games", text: "Solve puzzles and become a math star.", color: "peach" , earnsStar: true},
    { id: "feelings", icon: "😊", title: "Emotions", text: "Explore emotions and understand yourself.", color: "peach" , earnsStar: true},
    { id: "future", icon: "🌍", title: "Professions", text: "Explore interesting jobs and professions.", color: "purple", earnsStar: true },
    { id: "food", icon: "🍎", title: "Food", text: "Discover how different foods help your body.", color: "green" , earnsStar: true},
    { id: "klaro", icon: "🟡", title: "KLARO · Klasse2000", text: "Explore healthy habits, movement and feelings.", color: "green" },
  ];
  return <>

    <div className="home-top-row"><span className="star-counter">⭐ {stars} stars</span></div>
    <section className="star-goal-reminder"><span>⭐</span><div><b>Goal: collect 50 stars.</b><p>When you reach 50 stars, choose a special treat with Mom.</p></div></section>
    <div className="adventure-grid">{cards.map((card) => <button key={card.id} className={`adventure-card ${card.color}`} onClick={() => setActive(card.id)}><span className="card-emoji">{card.icon}</span><span className="card-title">{card.title}{card.earnsStar && <span className="home-card-star" aria-label="You can earn a star here"> ⭐</span>}</span></button>)}</div>
  </>;
}

const initialWeek = [
  { day:"Monday", icon:"🌼", lessons:[["8:10–8:55","",""],["9:00–9:45","Deutsch","Frau Thülig"],["10:15–11:00","Mathematik","Frau Thülig"],["11:05–11:50","Kunst","Frau Thülig"],["12:05–12:50","Kunst","Frau Thülig"],["12:50–13:35","",""]], after:"Betreuung · GT 8 · Chess Club (every two weeks)" },
  { day:"Tuesday", icon:"🌻", lessons:[["8:10–8:55","Sachunterricht","Frau Wood"],["9:00–9:45","Mathematik","Frau Thülig"],["10:15–11:00","Deutsch","Frau Thülig"],["11:05–11:50","Deutsch","Frau Thülig"],["12:05–12:50","Ev. Religion","Frau Heppner"],["12:50–13:35","",""]], after:"GT 8 · Recorder 13:30–14:15 · Frau Bierhaus" },
  { day:"Wednesday", icon:"🌷", lessons:[["8:10–8:55","Sport","Herr Schrader"],["9:00–9:45","Geometrie","Frau Grünewald"],["10:15–11:00","Musik","Frau Grünewald"],["11:05–11:50","Deutsch","Frau Ulpke"],["12:05–12:50","",""],["12:50–13:35","",""]], after:"GT 8 · Ensemble 14:00–14:45 · Herr Pottmeier" },
  { day:"Thursday", icon:"🌸", lessons:[["8:10–8:55","Ev./kath. Religion",""],["9:00–9:45","Deutsch","Frau Thülig"],["10:15–11:00","Mathematik","Frau Thülig"],["11:05–11:50","Kunst","Frau Thülig"],["12:05–12:50","Schwimmen","Frau Thülig & Herr Schrader"],["12:50–13:35","Schwimmen","Frau Thülig & Herr Schrader"]], after:"GT 8" },
  { day:"Friday", icon:"🌈", lessons:[["8:10–8:55","Kath. Religion","Frau Friemel"],["9:00–9:45","Mathematik","Frau Thülig"],["10:15–11:00","Deutsch","Frau Thülig"],["11:05–11:50","Sachunterricht","Frau Wood"],["12:05–12:50","Sachunterricht","Frau Wood"],["12:50–13:35","",""]], after:"GT 8" }
];
const breakTimes = [{ after:1, label:"🍎 Snack & play · 9:45–10:15" },{ after:3, label:"🍎 Snack & play · 11:50–12:05" }];
const afterSchoolActivities = {
  Monday: [{ time:"15:00–16:00", name:"Chess Club", detail:"Every two weeks", chess:true }],
  Tuesday: [{ time:"13:30–14:15", name:"Recorder", detail:"Frau Bierhaus" }],
  Wednesday: [{ time:"14:00–14:45", name:"Ensemble", detail:"Herr Pottmeier" }],
  Thursday: [{ time:"15:00–16:00", name:"Bastel Club" }],
  Friday: [],
};
function School() {
  const [schoolTab,setSchoolTab] = useState("timetable");
  const [klaroPassword,setKlaroPassword] = useState("");
  const [week,setWeek] = useState(() => { try { const saved = JSON.parse(localStorage.getItem("aisha-week-schedule")); return saved ? saved.map(day => day.day === "Monday" && day.after?.includes("Dance Club") ? {...day,after:"Betreuung · GT 8 · Chess Club (every two weeks)"} : day) : initialWeek; } catch { return initialWeek; } });
  const [showChessDates,setShowChessDates] = useState(false);
  const chessClubDates = [];
  for (let date = new Date(Date.UTC(2026,10,2)); date <= new Date(Date.UTC(2027,6,16)); date.setUTCDate(date.getUTCDate()+14)) {
    chessClubDates.push(new Date(date).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}));
  }
  const [sunday,setSunday] = useState(() => { try { return JSON.parse(localStorage.getItem("aisha-sunday-schedule")) || [["Swimming Club","09:00–10:00"],["Chess Club","14:00–16:00"]]; } catch { return [["Swimming Club","09:00–10:00"],["Chess Club","14:00–16:00"]]; } });
  const [editing,setEditing] = useState(false);
  function updateLesson(dayIndex,lessonIndex,field,value) {
    setWeek(old => old.map((day,i) => i !== dayIndex ? day : {...day,lessons:day.lessons.map((lesson,j) => j !== lessonIndex ? lesson : lesson.map((v,k) => k === field ? value : v))}));
  }
  function updateAfter(dayIndex,value) { setWeek(old => old.map((day,i) => i === dayIndex ? {...day,after:value} : day)); }
  function updateSunday(index,field,value) { setSunday(old => old.map((item,i) => i === index ? item.map((v,k) => k === field ? value : v) : item)); }
  function saveSchedule() { localStorage.setItem("aisha-week-schedule",JSON.stringify(week)); localStorage.setItem("aisha-sunday-schedule",JSON.stringify(sunday)); setEditing(false); }
  function resetSchedule() { if (window.confirm("Reset the timetable to the original school schedule?")) { setWeek(initialWeek); setSunday([["Swimming Club","09:00–10:00"],["Chess Club","14:00–16:00"]]); localStorage.removeItem("aisha-week-schedule"); localStorage.removeItem("aisha-sunday-schedule"); setEditing(false); } }
  const lessonTimes = ["8:10–8:55","9:00–9:45","10:15–11:00","11:05–11:50","12:05–12:50","12:50–13:35"];
  return <>
    <PageHeading eyebrow="MY SCHOOL & ACTIVITIES" title="My school" subtitle="Your timetable and lunch menu." emoji="🎒" />
    <div className="school-tabs" role="tablist" aria-label="School information">
      <button className={schoolTab === "timetable" ? "school-tab active" : "school-tab"} onClick={() => setSchoolTab("timetable")}>📅 My timetable</button>
      <button className={schoolTab === "lunch" ? "school-tab active" : "school-tab"} onClick={() => setSchoolTab("lunch")}>🍽️ School lunches</button>
      <button className={schoolTab === "edu" ? "school-tab active" : "school-tab"} onClick={() => setSchoolTab("edu")}>🎮 Edu Games</button>
      <a className="school-tab school-system-link" href="https://ggsass.de/iserv/auth/login" target="_blank" rel="noreferrer">🔐 School System ↗</a>
    </div>
    {schoolTab === "timetable" && <>
    <div className="schedule-toolbar"><span>{editing ? "✏️ Change any lesson or activity below." : "A little plan for every day."}</span><div>{editing ? <><button className="secondary-button" onClick={() => setEditing(false)}>Cancel</button><button className="primary-button" onClick={saveSchedule}>Save changes ✓</button></> : <button className="secondary-button" onClick={() => setEditing(true)}>✎ Edit my week</button>}</div></div>
    <section className="panel timetable-panel"><div className="panel-heading"><h2>📅 Monday to Friday</h2><span className="small-tag">SCHOOL TIMETABLE</span></div>
      <div className="timetable-grid">
        {week.map((day,dayIndex) => <div className="timetable-day" key={day.day}><h3><span>{day.icon}</span>{day.day}</h3>
          {(() => {
            const lastLessonIndex = day.lessons.reduce((last, lesson, index) => lesson[1].trim() ? index : last, -1);
            const ogsIndex = lastLessonIndex + 1;
            const ogsStart = ogsIndex < lessonTimes.length ? lessonTimes[ogsIndex].split("–")[0] : null;
            return <>
              {day.lessons.map((lesson,lessonIndex) => {
              const isOgsCard = lastLessonIndex >= 0 && lastLessonIndex < lessonTimes.length - 1 && lessonIndex === ogsIndex;
              const isAfterLastLesson = lastLessonIndex >= 0 && lessonIndex > lastLessonIndex;
              if (isAfterLastLesson && !isOgsCard) return <React.Fragment key={lessonIndex}>
                {breakTimes.filter(b => b.after === lessonIndex).map(b => <div className="schedule-break" key={b.label}>{b.label}</div>)}
              </React.Fragment>;
              return <React.Fragment key={lessonIndex}>
                <div className={`lesson-card ${lesson[1] || isOgsCard ? "" : "lesson-empty"} ${isOgsCard ? "ogs-lesson-card" : ""}`}>
                  <small>{isOgsCard ? `${ogsStart} onwards` : `${lessonTimes[lessonIndex]} · Lesson ${lessonIndex+1}`}</small>
                  {editing ? <><input aria-label={day.day+" lesson "+(lessonIndex+1)} value={lesson[1]} placeholder={isOgsCard ? "GT 8 / activity" : "Lesson / activity"} onChange={e => updateLesson(dayIndex,lessonIndex,1,e.target.value)} /><input aria-label="Teacher" value={lesson[2]} placeholder="Teacher (optional)" onChange={e => updateLesson(dayIndex,lessonIndex,2,e.target.value)} />{isOgsCard && <textarea value={day.after} onChange={e => updateAfter(dayIndex,e.target.value)} aria-label={day.day+" GT 8 activities"} />}</> : <>
                    <b>{isOgsCard ? "🌟 GT 8" : lesson[1] || "—"}</b>
                    {lesson[2] && <span>{lesson[2]}</span>}
                    {isOgsCard && (afterSchoolActivities[day.day] || []).map(activity => <div className="ogs-activity" key={activity.name}>
                      <strong>{activity.time}</strong><span>{activity.name}{activity.detail ? ` · ${activity.detail}` : ""}</span>
                      {activity.chess && <><button className="chess-dates-toggle" onClick={() => setShowChessDates(value => !value)}>{showChessDates ? "Hide dates ▲" : "Show chess club dates ▼"}</button>{showChessDates && <ol className="chess-dates-list">{chessClubDates.map(date => <li key={date}>{date}</li>)}</ol>}</>}
                    </div>)}
                    {isOgsCard && !(afterSchoolActivities[day.day] || []).length && <span>No extra club scheduled.</span>}
                  </>}
                </div>
                {breakTimes.filter(b => b.after === lessonIndex).map(b => <div className="schedule-break" key={b.label}>{b.label}</div>)}
              </React.Fragment>;
              })}
              {lastLessonIndex === lessonTimes.length - 1 && <div className="lesson-card ogs-lesson-card">
                <small>13:35 onwards</small>
                {editing ? <textarea value={day.after} onChange={e => updateAfter(dayIndex,e.target.value)} aria-label={day.day+" GT 8 activities"} /> : <>
                  <b>🌟 OGS</b>
                  {(afterSchoolActivities[day.day] || []).map(activity => <div className="ogs-activity" key={activity.name}>
                    <strong>{activity.time}</strong><span>{activity.name}{activity.detail ? ` · ${activity.detail}` : ""}</span>
                    {activity.chess && <><button className="chess-dates-toggle" onClick={() => setShowChessDates(value => !value)}>{showChessDates ? "Hide dates ▲" : "Show chess club dates ▼"}</button>{showChessDates && <ol className="chess-dates-list">{chessClubDates.map(date => <li key={date}>{date}</li>)}</ol>}</>}
                  </div>)}
                  {!(afterSchoolActivities[day.day] || []).length && <span>No extra club scheduled.</span>}
                </>}
              </div>}
            </>;
          })()}
          
        </div>)}
      </div>
    </section>
    <section className="panel sunday-panel"><div className="panel-heading"><h2>☀️ Sunday · Optional activities</h2><span className="small-tag">WEEKEND</span></div><div className="sunday-activities">{sunday.map((item,index) => <div className="sunday-item" key={index}>{editing ? <><input value={item[0]} aria-label="Sunday activity" onChange={e => updateSunday(index,0,e.target.value)} /><input value={item[1]} aria-label="Activity time" onChange={e => updateSunday(index,1,e.target.value)} /></> : <><b>{item[0]}</b><span>{item[1]}</span></>}</div>)}</div></section>
    <section className="panel"><div className="panel-heading"><h2>🎒 Before I leave</h2><span className="small-tag">MY CHECKLIST</span></div><div className="checklist">{["School bag","Water bottle","Lunch or snack","Pencil case"].map(item => <label key={item}><input type="checkbox" /> <span>{item}</span></label>)}</div></section>
    <p className="gentle-note">Changes are saved in this browser on this device. Mum can edit the timetable any time.</p>
    {editing && <button className="reset-schedule" onClick={resetSchedule}>Reset to original timetable</button>}
    </>}
    {schoolTab === "edu" && <section className="panel" style={{display:"grid",gap:"1.25rem"}}>
      <div className="panel-heading"><h2>🎮 Educational games</h2><span className="small-tag">LEARN & PLAY</span></div>
      <article className="klaro-link-card" style={{display:"grid",gap:".75rem"}}>
        <span style={{fontSize:"2rem"}}>🔐</span><b>KLARO · School password</b>
        <small>Copy the password before opening the KLARO website.</small>
        <label style={{display:"grid",gap:".4rem"}}><strong>Password</strong><input type="text" value={klaroPassword} onChange={e=>setKlaroPassword(e.target.value)} placeholder="Enter the password from school" autoComplete="off" /></label>
        <button className="secondary-button" disabled={!klaroPassword.trim()} onClick={()=>navigator.clipboard?.writeText(klaroPassword)}>Copy password</button>
      </article>
      <a className="klaro-link-card" href="https://www.klaro-labor.de/" target="_blank" rel="noreferrer" style={{display:"grid",gap:".5rem"}}><span style={{fontSize:"2rem"}}>🟡</span><b>KLARO · Klasse2000</b><small>Games, exercises and learning activities.</small><em>Open KLARO website ↗</em></a>
      <a className="klaro-link-card" href="https://anton.app/" target="_blank" rel="noreferrer" style={{display:"grid",gap:".5rem"}}><span style={{fontSize:"2rem"}}>📚</span><b>ANTON</b><small>School exercises and learning games. Tap to open ANTON; if installed, your device may open the app.</small><em>Open ANTON ↗</em></a>
    </section>}
    {schoolTab === "lunch" && <section className="panel lunch-menu-panel">
      <div className="panel-heading"><h2>🍽️ School lunch menu</h2><span className="small-tag">9–13 NOV 2026</span></div>
      <p className="lunch-menu-copy">Here is the school lunch menu for the week of 9–13 November 2026.</p>
      <a className="primary-button lunch-menu-link" href="http://www.grundschule-albert-schweitzer.de/wp-content/uploads/2026/11/Speiseplan-Mensa-09.11-13.11.26.pdf" target="_blank" rel="noreferrer">Open lunch menu (PDF) <span>↗</span></a>
      <p className="gentle-note">Tap the link to view this week's meals.</p>
    </section>}
  </>;
}

const foodQuestions = [{"q":"Which food belongs in the vegetables and fruit part of the plate?","o":["Carrot","Chicken","Rice","Cheese"],"a":0,"e":"Carrots are vegetables. They add color, fiber and vitamins to meals."},{"q":"Which food is a source of protein?","o":["Egg","Apple","Bread","Cucumber"],"a":0,"e":"Eggs contain protein, which helps the body grow and repair itself."},{"q":"Which food is a grain food?","o":["Pasta","Strawberry","Yogurt","Peas"],"a":0,"e":"Pasta is usually made from wheat, a grain."},{"q":"Which drink is a good everyday choice?","o":["Water","Lemonade","Cola","Sweet iced tea"],"a":0,"e":"Water helps your body work well and is a great drink throughout the day."},{"q":"Which of these is a fruit?","o":["Pear","Potato","Lentil","Oatmeal"],"a":0,"e":"A pear is a fruit. Fruit and vegetables bring lots of variety to meals."},{"q":"Which food is made from milk and can provide calcium and protein?","o":["Yogurt","Carrot","Rice","Olive oil"],"a":0,"e":"Yogurt is a dairy food that can provide calcium and protein."},{"q":"Which food is a plant-based source of protein?","o":["Lentils","Grapes","Pasta","Lettuce"],"a":0,"e":"Lentils are beans/legumes and contain plant protein and fiber."},{"q":"Which food is a whole grain?","o":["Oatmeal","Candy","Butter","Chicken"],"a":0,"e":"Oats are whole grains and provide energy and fiber."},{"q":"Which meal has a good mix of food groups?","o":["Rice, beans and broccoli","Only a bowl of sweets","Only plain pasta","Only cucumber"],"a":0,"e":"Rice gives energy, beans provide protein, and broccoli adds vegetables."},{"q":"What can vegetables and fruit help provide?","o":["Vitamins and fiber","Only protein","Only sugar","No nutrients"],"a":0,"e":"Different fruits and vegetables provide vitamins, minerals and fiber."},{"q":"Which food belongs to the protein group?","o":["Fish","Banana","Bread","Tomato"],"a":0,"e":"Fish is a protein food."},{"q":"Which is a starchy food that gives the body energy?","o":["Potato","Blueberry","Egg","Spinach"],"a":0,"e":"Potatoes contain carbohydrates that the body can use for energy."},{"q":"Which snack includes fruit and protein?","o":["Apple with yogurt","Only jelly sweets","Only crisps","Only a lollipop"],"a":0,"e":"The apple gives fruit and fiber; yogurt adds protein and calcium."},{"q":"Which of these is a vegetable?","o":["Broccoli","Peach","Cheese","Oats"],"a":0,"e":"Broccoli is a green vegetable."},{"q":"Why is it helpful to eat different colored vegetables and fruits?","o":["They offer different nutrients","They all taste exactly the same","They replace the need for water","They contain no nutrients"],"a":0,"e":"Different colors often come with different vitamins and helpful plant compounds."},{"q":"Which food is a legume?","o":["Chickpeas","Orange","Bread","Cheddar"],"a":0,"e":"Chickpeas are legumes. They provide plant protein and fiber."},{"q":"Which is a grain food often used to make porridge?","o":["Oats","Eggs","Carrots","Salmon"],"a":0,"e":"Oats are grains and are often cooked into porridge."},{"q":"What is one reason our bodies need protein?","o":["To grow and repair the body","To make us never thirsty","To replace sleep","To make vegetables unnecessary"],"a":0,"e":"Protein helps the body grow and repair muscles and other tissues."},{"q":"Which lunch has vegetables, grains and protein?","o":["Chicken, bulgur and salad","Only a banana","Only bread","Only yogurt"],"a":0,"e":"Chicken provides protein, bulgur is a grain, and salad adds vegetables."},{"q":"What is a sensible way to build a balanced meal?","o":["Include different food groups","Eat only one food every day","Avoid all grains","Drink soda instead of water"],"a":0,"e":"A balanced meal can include vegetables or fruit, grains or potatoes, and protein foods."}];


function FutureWorld({ markCompleted }) {
  const [open,setOpen] = useState("");
  const jobs = [
    {id:"teacher",emoji:"👩‍🏫",title:"Teacher",category:"Education",art:"teacher",sections:[
      ["What does a teacher do?","Teachers help children learn. They explain things, answer questions and plan fun lessons."],
      ["Where do teachers work?","In schools, where they teach and help their students."],
      ["What skills help?","Patience, kindness, creativity and clear explanations."],
      ["Try it!","Teach a teddy bear or a friend something you know. Can you explain it in three steps?"]
    ]},
    {id:"doctor",emoji:"🧑‍⚕️",title:"Doctor",category:"Healthcare",art:"doctor",sections:[
      ["What does a doctor do?","Doctors help people when they are ill or hurt. They ask questions, examine patients and suggest treatment."],
      ["Where do doctors work?","In hospitals, doctors' offices and health centers."],
      ["What skills help?","Kindness, careful listening, teamwork and problem-solving."],
      ["Try it!","Set up a pretend doctor's office for a teddy bear. Ask what hurts and how you can help."]
    ]}
  ];
  return <>
    <PageHeading eyebrow="EXPLORE THE WORLD OF WORK" title="Professions" subtitle="Discover jobs and what you might enjoy." emoji="🌍" />
    <div className="future-jobs-grid">
      {jobs.map(job=><div className={"future-flip-card "+(open===job.id?"is-flipped":"")} key={job.id}>
        <div className="future-flip-inner">
          <div className="future-card-face future-card-front">
            <button className="future-job-card" onClick={()=>{setOpen(open===job.id?"":job.id);markCompleted("profession-"+job.id);}} aria-label={"Turn over the "+job.title+" card"}>
              <div className={job.art==="teacher"?"teacher-art":"doctor-art"} role="img" aria-label={job.art==="teacher"?"Teacher in a classroom":"Doctor with a medical bag"}>
                {job.art==="teacher"?<><span>👩‍🏫</span><span className="teacher-board">ABC<br/>1 2 3<br/>✏️ 📚</span><span className="teacher-plant">🌱</span></>:<><span>🧑‍⚕️</span><span className="doctor-bag">🩺</span><span className="doctor-cross">✚</span></>}
              </div>
              <span className="future-card-title">{job.title}</span><span className="future-card-category">{job.category}</span><span className="future-card-open">Tap to turn the card ↻</span>
            </button>
          </div>
          <div className="future-card-face future-card-back">
            <div className="future-back-content">
              <button className="secondary-button future-back" onClick={()=>setOpen("")}>↶ Turn card back</button>
              <div className="future-back-title"><span>{job.emoji}</span><div><p className="eyebrow">{job.category.toUpperCase()}</p><h2>{job.title}</h2></div></div>
              {job.sections.map(([heading,copy],index)=><div className={index===3?"future-try":"future-info-block"} key={heading}><h3>{index===3?"🎨 ":""}{heading}</h3><p>{copy}</p></div>)}
            </div>
          </div>
        </div>
      </div>)}
    </div>
  </>;
}

const emotionCards = [
  { id:"happy", emoji:"😊", en:"Happy", de:"Glücklich", meaning:"You might feel happy when something lovely happens or you enjoy time with someone.", clue:"You may smile, laugh, feel warm, or have lots of energy.", body:"A smile, relaxed face, light feeling, or excited energy.", example:"Your friend invites you to play. You might feel happy!" },
  { id:"sad", emoji:"😢", en:"Sad", de:"Traurig", meaning:"You might feel sad when you miss someone, lose something, or something does not go as you hoped.", clue:"You may want to be quiet, cry, or have a cuddle.", body:"Tears, a heavy feeling, a lump in your throat, or low energy.", example:"Your favorite toy breaks. You might feel sad." },
  { id:"angry", emoji:"😠", en:"Angry", de:"Wütend", meaning:"You might feel angry when something seems unfair or someone crosses a boundary.", clue:"Your face may feel hot, your muscles may tighten, or your voice may get louder.", body:"Hot cheeks, tight fists, a fast heartbeat, or tense shoulders.", example:"Someone takes your turn. You might feel angry." },
  { id:"scared", emoji:"😨", en:"Scared", de:"Ängstlich", meaning:"You might feel scared when something seems unsafe, uncertain, or unfamiliar.", clue:"You may want to hide, hold someone's hand, or move closer to a trusted person.", body:"A tummy flutter, fast heartbeat, shaky legs, or tense muscles.", example:"You hear a strange noise at night. You might feel scared." },
  { id:"surprised", emoji:"😲", en:"Surprised", de:"Überrascht", meaning:"You might feel surprised when something unexpected happens.", clue:"Your eyes may open wide and your mouth may make an O shape.", body:"A sudden jump, wide eyes, or a quick change in energy.", example:"A friend gives you an unexpected present. You might feel surprised." },
  { id:"calm", emoji:"😌", en:"Calm", de:"Ruhig", meaning:"You might feel calm when your body and mind feel settled and safe.", clue:"Your breathing may be slow and your muscles relaxed.", body:"Soft shoulders, steady breathing, and a peaceful feeling.", example:"You are reading quietly in a cozy place. You might feel calm." },
];
const feelingScenarios = [
  { story:"You practiced a lot, and your tower finally stays standing!", choices:["😊 Happy","😢 Sad","😨 Scared"], answer:0, why:"You worked hard and reached your goal. You might feel proud or happy." },
  { story:"You cannot find your favorite book, and you really wanted to read it.", choices:["😢 Sad","😲 Surprised","😌 Calm"], answer:0, why:"You might feel sad or disappointed. It is okay to ask someone to help you look." },
  { story:"Someone pushes ahead of you in a game and it feels unfair.", choices:["😠 Angry","😌 Calm","😲 Surprised"], answer:0, why:"You might feel angry because it seems unfair. You can use words to explain what happened." },
];
function MyFeelings({ markCompleted }) {
  const [openFeeling,setOpenFeeling] = useState("");
  const [answers,setAnswers] = useState({});
  const [checked,setChecked] = useState(false);
  const lessons = [
    {
      id:"happy",
      emoji:"😊",
      name:"Happiness",
      german:"Glücklich",
      intro:"Happiness is a good feeling when you enjoy something.",
      clues:"You may smile, laugh, or feel cheerful.",
      example:"You play a fun game with a friend and smile.",
      questions:[
        {question:"Which situation might make you feel happy?",options:["Playing a fun game with a friend","Losing your favorite toy","Hearing a loud, scary noise"],correct:0,why:"Playing together can be enjoyable and make you feel happy."},
        {question:"What might your body do when you feel happy?",options:["You might smile or laugh","Your body must always feel tired","You must always want to cry"],correct:0,why:"A smile or laugh can be a clue that you feel happy."}
      ]
    },
    {
      id:"awe",
      emoji:"😮",
      name:"Awe",
      german:"Staunen",
      intro:"Awe is wonder when something feels amazing.",
      clues:"You may say “Wow!”, look closely, or feel curious.",
      example:"You see a sky full of stars and whisper, “Wow!”",
      questions:[
        {question:"When might you feel awe?",options:["Seeing a huge waterfall","Finding a missing sock","Eating your usual breakfast"],correct:0,why:"A huge waterfall can feel amazing and fill us with wonder."},
        {question:"What might you do when you feel awe?",options:["Look closely and say “Wow!”","Always feel angry","Always want to run away"],correct:0,why:"Awe can make us curious and amazed."}
      ]
    },
    {
      id:"proud",
      emoji:"🌟",
      name:"Proud",
      german:"Stolz",
      intro:"Proud is a good feeling you may have when you try hard, learn something, or do something that matters to you.",
      clues:"You might smile, stand a little taller, or feel pleased with yourself.",
      example:"You keep practicing how to ride your bike, and one day you can do it!",
      questions:[
        {question:"When might you feel proud?",options:["You keep practicing and learn something new","You give up before trying","You laugh when someone makes a mistake"],correct:0,why:"Trying hard and learning something new can make you feel proud."},
        {question:"What is a kind thing to remember about feeling proud?",options:["You can feel proud of your effort, not only winning","You should only feel proud when you are the best","You must never make mistakes"],correct:0,why:"Effort, practice, and progress are all good reasons to feel proud."}
      ]
    }
  ];
  const current=lessons.find(item=>item.id===openFeeling);
  function openCard(item) {
    setOpenFeeling(openFeeling===item.id?"":item.id);
    if(openFeeling!==item.id) {
      markCompleted("feeling-"+item.id);
      setAnswers({});
      setChecked(false);
    }
  }
  function chooseAnswer(questionIndex,optionIndex) {
    setAnswers(old=>({...old,[questionIndex]:optionIndex}));
    setChecked(false);
  }
  return <>
    <PageHeading eyebrow="EMOTIONS & ME" title="Emotions" subtitle="Let's learn about one feeling at a time." emoji="😊" />
    <div className="feelings-intro"><span>💛</span><div><b>Every feeling is okay.</b><p>We can learn what feelings are and how they might feel inside our body.</p></div></div>
    <section className="feelings-panel feelings-lessons-panel">
      <p className="eyebrow">FEELING OF THE DAY</p>
      <h2>Let's learn about a feeling</h2>
      <p className="feelings-copy">Choose the card to discover today's feeling.</p>
      <div className="feeling-flip-list">
        {lessons.map(item=><div className="feeling-flip-wrap" key={item.id}>
          <div className={"feeling-flip-inner "+(openFeeling===item.id?"is-flipped":"")}>
            <div className="feeling-flip-face feeling-flip-front">
              <button className="feeling-flip-front-button" onClick={()=>openCard(item)} aria-label={"Turn over the "+item.name+" card"}>
                <span className="feeling-flip-emoji">{item.emoji}</span>
                <span className="feeling-flip-name">{item.name}</span>
                <small>{item.german}</small>
                <span className="feeling-flip-hint">Tap to turn the card ↻</span>
              </button>
            </div>
            <div className="feeling-flip-face feeling-flip-back">
              <div className="feeling-flip-back-content">
                <h3>{item.emoji} {item.name}</h3>
                <p>{item.intro}</p>
                <p><b>How might it feel?</b> {item.clues}</p>
                <p><b>Example:</b> {item.example}</p>
                <button className="feeling-flip-back-button" onClick={()=>setOpenFeeling("")}>Turn card back ↶</button>
              </div>
            </div>
          </div>
        </div>)}
      </div>
    </section>
    {current&&<section className="feelings-panel feeling-quiz-panel">
      <p className="eyebrow">LITTLE CHECK · {current.name.toUpperCase()}</p>
      <h2>What have you learned?</h2>
      <p className="feelings-copy">Try these two little questions.</p>
      {current.questions.map((q,index)=><div className="feeling-question" key={q.question}>
        <h3>{index+1}. {q.question}</h3>
        <div className="feeling-answer-list">{q.options.map((option,optionIndex)=><button key={option} className={"feeling-answer "+(answers[index]===optionIndex?"chosen":"")+(checked&&optionIndex===q.correct?" correct":"")+(checked&&answers[index]===optionIndex&&optionIndex!==q.correct?" incorrect":"")} onClick={()=>chooseAnswer(index,optionIndex)}>{option}</button>)}</div>
        {checked&&<p className="feeling-answer-explanation">{q.why}</p>}
      </div>)}
      <button className="primary-button feeling-check-button" disabled={Object.keys(answers).length!==current.questions.length} onClick={()=>setChecked(true)}>Check my answers ✓</button>
      {checked&&<p className="feeling-quiz-result">{current.questions.filter((q,index)=>answers[index]===q.correct).length} out of 2 correct. Great job for learning about feelings! 💛</p>}
      <p className="feelings-gentle-note">You can try the questions again whenever you like. There are no bad feelings.</p>
    </section>}
  </>;
}

function Food() {
  return <>
    <PageHeading eyebrow="FOOD" title="Eat a rainbow!" subtitle="Discover the foods that help you grow, feel strong and have energy." emoji="🌈" />
    <section className="balanced-food-layout">
      <div className="balanced-plate-visual" role="img" aria-label="A balanced plate with vegetables, fruit, chicken, rice and potatoes">
        <div className="balanced-plate">
          <div className="plate-food plate-vegetables"><span>🥦</span><span>🥕</span><span>🥬</span><span>🍅</span><span>🥒</span></div>
          <div className="plate-food plate-fruit"><span>🍓</span><span>🫐</span><span>🍊</span></div>
          <div className="plate-food plate-carbs"><span>🍚</span><span>🥔</span></div>
          <div className="plate-food plate-protein"><span>🍗</span><span>🥚</span></div>
        </div>
        <p className="plate-caption">A colorful, balanced meal</p>
      </div>
      <div className="balanced-food-guide">
        <p className="eyebrow">A BALANCED PLATE</p>
        <h2>Three helpful food groups</h2>
        <div className="balanced-food-group food-fiber">
          <span className="balanced-food-icon">🥦🍓</span>
          <div><h3>Vegetables & fruits</h3><b>Fiber</b><p>Help digestion and keep our bodies healthy.</p></div>
        </div>
        <div className="balanced-food-group food-carbs">
          <span className="balanced-food-icon">🍞🥔</span>
          <div><h3>Grains & potatoes</h3><b>Carbohydrates</b><p>Give us energy to learn, play and move.</p></div>
        </div>
        <div className="balanced-food-group food-protein">
          <span className="balanced-food-icon">🍗🥚</span>
          <div><h3>Meat & other protein foods</h3><b>Protein</b><p>Help our bodies grow and repair.</p></div>
        </div>
        <p className="balanced-food-note">A balanced meal includes foods from all three groups. The foods can be different every day!</p>
      </div>
    </section>
  </>;
}

function Coding({ markCompleted }) {
  return <>
    <PageHeading eyebrow="CODING LAB" title="Hello, little coder!" emoji="🤖" />
    <div className="resource-list">{codingLinks.map((link) => <a className="resource-card" href={link.url} target="_blank" rel="noreferrer" key={link.name} onClick={() => markCompleted("coding-" + link.name)}><span className="resource-icon">{link.icon}</span><span className="resource-info"><b>{link.name}</b></span><span className="external-arrow">↗</span></a>)}</div>
  </>;
}

function makeTreasureQuestions() {
  const used = new Set();
  return Array.from({ length: 5 }, () => {
    let a, b, op, answer, question;
    do {
      op = Math.random() < 0.5 ? "+" : "−";
      if (op === "+") {
        a = Math.floor(Math.random() * 11) + 5;
        b = Math.floor(Math.random() * (21 - a));
        answer = a + b;
      } else {
        a = Math.floor(Math.random() * 11) + 10;
        b = Math.floor(Math.random() * Math.min(10, a));
        answer = a - b;
      }
      question = `${a} ${op} ${b} = ?`;
    } while (used.has(question));
    used.add(question);
    const options = new Set([answer]);
    while (options.size < 3) {
      const offset = Math.floor(Math.random() * 7) - 3;
      if (offset !== 0 && answer + offset >= 0) options.add(answer + offset);
    }
    return { question, answer: String(answer), options: [...options].sort(() => Math.random() - 0.5) };
  });
}

function MathGames({ awardTreasureStar, hasTreasureStar }) {
  const [playing, setPlaying] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState("");
  const [found, setFound] = useState(0);
  const [finished, setFinished] = useState(false);
  const [earnedThisRun, setEarnedThisRun] = useState(false);
  const current = tasks[index];

  function startHunt() {
    setTasks(makeTreasureQuestions());
    setIndex(0);
    setChoice("");
    setFound(0);
    setFinished(false);
    setEarnedThisRun(false);
    setPlaying(true);
  }

  function choose(value) {
    if (choice) return;
    setChoice(value);
    if (String(value) === current.answer) setFound((n) => n + 1);
  }

  function next() {
    if (index === tasks.length - 1) {
      setFinished(true);
      if (!hasTreasureStar) { awardTreasureStar(); setEarnedThisRun(true); }
    } else {
      setIndex((n) => n + 1);
      setChoice("");
    }
  }

  if (!playing) return <section className="treasure-game-grid">
    <button className="treasure-game-card" onClick={startHunt}>
      <span className="treasure-game-art">🗺️💎</span>
      <span className="treasure-game-name">Math Treasure Hunt</span>
      <span className="treasure-game-play">Play <b>→</b></span>
    </button>
  </section>;

  if (finished) return <section className="treasure-play-panel">
    <button className="treasure-back" onClick={() => setPlaying(false)}>← All games</button>
    <div className="treasure-finish">🏴‍☠️</div>
    <p className="eyebrow">TREASURE FOUND!</p>
    <h2>You did it!</h2>
    <p className="treasure-score">{found} / {tasks.length}</p>
    <p>You explored all five treasure clues.</p>
    <p className="treasure-reward">{earnedThisRun ? "⭐ You earned a star!" : hasTreasureStar ? "Your treasure star has already been collected." : "Great exploring!"}</p>
    <button className="primary-button" onClick={startHunt}>Play again ↻</button>
  </section>;

  return <section className="treasure-play-panel">
    <button className="treasure-back" onClick={() => setPlaying(false)}>← All games</button>
    <div className="treasure-progress-row"><span>🗺️ Treasure map</span><b>Clue {index + 1} of {tasks.length}</b></div>
    <div className="treasure-map">{tasks.map((_, i) => <span key={i} className={i < index ? "found" : i === index ? "current" : ""}>{i < index ? "💎" : "?"}</span>)}</div>
    <div className="treasure-question-art">🦊</div>
    <p className="eyebrow">SOLVE THE CLUE</p>
    <h2 className="treasure-question">{current.question}</h2>
    <div className="treasure-answer-grid">{current.options.map((option) => <button key={option} disabled={Boolean(choice)} className={choice === option ? (choice === current.answer ? "treasure-answer correct" : "treasure-answer incorrect") : "treasure-answer"} onClick={() => choose(option)}>{option}</button>)}</div>
    {choice && <><p className={choice === current.answer ? "treasure-feedback right" : "treasure-feedback"}>{choice === current.answer ? "Brilliant! You found a clue! 💎" : `Good try! The answer is ${current.answer}.`}</p><button className="primary-button" onClick={next}>{index === tasks.length - 1 ? "Find the treasure!" : "Next clue →"}</button></>}
  </section>;
}

function Achievements({ progress }) {
  const stars = progress.stars || 0;
  const history = progress.history || [];
  const achievements = progress.achievements || [];
  const percent = Math.min(100, (stars / 50) * 100);
  const monthlyHistory = history.slice().sort((a,b) => b.date.localeCompare(a.date));
  return <>
    <PageHeading eyebrow="MY PROGRESS" title="My Progress" subtitle={`Well done, Aisha! You have collected ${stars} stars so far.`} />
    <section className="stars-hero progress-goal-card">
      <div className="progress-goal-top"><strong>{stars} / 50</strong><span>⭐</span></div>
      <div className="star-progress-track" role="progressbar" aria-valuenow={stars} aria-valuemin="0" aria-valuemax="50"><span style={{ width: percent + "%" }} /></div>
      <p>{50 - stars} more {50 - stars === 1 ? "star" : "stars"} to your special treat with Mum!</p>
    </section>
    <div className="section-title-row compact"><div><h2>Notifications</h2></div></div>
    <section className="star-history-list">
      {monthlyHistory.length ? monthlyHistory.map(item => <div className="star-history-item" key={item.id}><span>⭐</span><div><b>{item.label}</b><small>{new Date(item.date).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</small></div><strong>+{item.stars || 1}</strong></div>) : <p className="gentle-note">Your stars will appear here as you earn them.</p>}
    </section>
    <div className="section-title-row compact"><div><h2>Little Achievements</h2></div></div>
    <section className="milestone-grid">
      {achievements.length ? achievements.slice().reverse().map((item) => <article className="milestone-card" key={item.id}><span>🏆</span><div><b>50 stars collected!</b><p>You reached your goal in {item.days} {item.days === 1 ? "day" : "days"}.</p><small>Special treat: {item.treat || "To be added with Mum"}</small><small>{new Date(item.date).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</small></div></article>) : <p className="gentle-note">Your first 50-star celebration will be remembered here!</p>}
    </section>
    <p className="gentle-note">Your progress is saved in this browser on this device.</p>
  </>;
}

export default App;
