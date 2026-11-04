import React, { useEffect, useMemo, useState } from "react";

const sections = [
  { id: "home", label: "Home", icon: "🏡" },
  { id: "school", label: "My school", icon: "🎒" },
  { id: "future", label: "My future world", icon: "🌍" },
  { id: "food", label: "Healthy me", icon: "🥑" },
  { id: "feelings", label: "My feelings", icon: "🌈" },
  { id: "coding", label: "Coding lab", icon: "🤖" },
  { id: "math", label: "Math games", icon: "🧩" },
  { id: "stars", label: "My stars", icon: "⭐" },
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
  { name: "Scratch", detail: "Make your own stories, animations and games.", url: "https://scratch.mit.edu/", icon: "🐱", level: "Create" },
  { name: "Code.org", detail: "Try beginner-friendly coding puzzles and lessons.", url: "https://studio.code.org/courses/coursec-2025/units/1", icon: "💻", level: "Learn" },
  { name: "Blockly Games", detail: "Learn how to give computers step-by-step instructions.", url: "https://blockly.games/", icon: "🧱", level: "Play" },
];

const mathLinks = [
  { name: "ANTON", detail: "School exercises and maths practice.", url: "https://anton.app/", icon: "📚" },
  { name: "Matific", detail: "Interactive maths activities and games.", url: "https://www.matific.com/", icon: "🎲" },
  { name: "Math Is Fun", detail: "Friendly explanations, puzzles and number games.", url: "https://www.mathsisfun.com/", icon: "🔢" },
];

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem("aisha-dashboard-progress")) || { stars: 0, completed: [], history: [] };
  } catch {
    return { stars: 0, completed: [], history: [] };
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

  function completeMathRound() {
    if (!earnedToday) {
      setProgress((old) => ({
        ...old,
        stars: old.stars + roundScore,
        completed: [...old.completed, "math-starter"],
        history: [...(old.history || []), ...Array.from({ length: roundScore }, () => ({ id: crypto.randomUUID(), label: "Math Games · correct answer", date: new Date().toISOString(), stars: 1 }))],
      }));
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
    const labels = { "profession-teacher": "My Future World · explored Teacher", "coding-Scratch": "Coding Lab · opened Scratch", "coding-Code.org": "Coding Lab · opened Code.org", "coding-Blockly Games": "Coding Lab · opened Blockly Games", "feeling-happy": "My Feelings · learned about Happiness" };
    setProgress((old) => old.completed.includes(id) ? old : {
      ...old,
      completed: [...old.completed, id],
      stars: old.stars + 1,
      history: [...(old.history || []), { id: crypto.randomUUID(), label: labels[id] || "Learning activity", date: new Date().toISOString(), stars: 1 }],
    });
  }

  function awardFoodQuizStars(score) {
    const earned = Math.floor(score / 3);
    setProgress((old) => ({
      ...old,
      completed: old.completed.includes("food") ? old.completed : [...old.completed, "food"],
      stars: old.stars + earned,
      history: [...(old.history || []), ...Array.from({ length: earned }, (_, index) => ({ id: crypto.randomUUID(), label: "Healthy Me · 3 correct quiz answers", date: new Date().toISOString(), stars: 1 }))],
    }));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" onClick={() => setActive("home")} aria-label="Aisha's home">
          <span className="brand-icon">🌈</span>
          <span>Aisha's <strong>Little Learning World</strong></span>
        </a>
        <div className="top-stats"><button className="star-history-button" onClick={() => setActive("stars")} aria-label="View star history">⭐ {progress.stars}</button></div>
      </header>

      <div className="layout">
        <aside className="sidebar" aria-label="Main navigation">
          <p className="nav-caption">MY WORLD</p>
          {sections.map((section) => (
            <button key={section.id} className={`nav-button ${active === section.id ? "active" : ""}`} onClick={() => setActive(section.id)}>
              <span>{section.icon}</span>{section.label}
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
          {active === "math" && <MathGames question={question} questionIndex={questionIndex} answer={answer} chooseAnswer={chooseAnswer} nextQuestion={nextQuestion} roundScore={roundScore} roundFinished={roundFinished} restartMath={restartMath} earnedToday={earnedToday} />}
          {active === "stars" && <Achievements stars={progress.stars} badges={badges} history={progress.history || []} />}
          <footer className="footer">Made with <span>♥</span> for Aisha · Your learning adventure</footer>
        </main>
      </div>
    </div>
  );
}

function PageHeading({ eyebrow, title, subtitle, emoji }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title} <span>{emoji}</span></h1><p className="page-subtitle">{subtitle}</p></div></div>;
}

function Home({ setActive, stars }) {
  const cards = [
    { id: "school", icon: "🎒", title: "My school day", text: "Timetable, school things and reminders.", color: "blue" },
    { id: "future", icon: "🌍", title: "My future world", text: "Explore interesting jobs and professions.", color: "purple" },
    { id: "food", icon: "🥑", title: "Healthy me", text: "Discover food that helps you grow.", color: "green" },
    { id: "feelings", icon: "🌈", title: "My feelings", text: "Explore emotions and understand yourself.", color: "peach" },
    { id: "coding", icon: "🤖", title: "Coding lab", text: "Give instructions and create things.", color: "purple" },
    { id: "math", icon: "🧩", title: "Math games", text: "Solve puzzles and become a math star.", color: "peach" },
  ];
  return <>

    <div className="section-title-row"><div><p className="eyebrow">CHOOSE YOUR ADVENTURE</p><h2>Where shall we go?</h2></div><span className="star-counter">⭐ {stars} stars</span></div>
    <div className="adventure-grid">{cards.map((card) => <button key={card.id} className={`adventure-card ${card.color}`} onClick={() => setActive(card.id)}><span className="card-emoji">{card.icon}</span><span className="card-title">{card.title}</span><span className="card-text">{card.text}</span><span className="card-arrow">Let's go <b>↗</b></span></button>)}</div>
    <section className="mission-card star-goal-card"><div className="mission-icon">⭐</div><div><p className="eyebrow">YOUR STAR GOAL</p><h3>Collect 50 stars!</h3><p>When you reach 50 stars, choose a special treat with Mum.</p><p className="star-encouragement">✨ Try one new thing today. Every little step counts!</p></div><span className="mission-sparkle">🎁</span></section>
  </>;
}

const initialWeek = [
  { day:"Monday", icon:"🌼", lessons:[["8:10–8:55","",""],["9:00–9:45","Deutsch","Frau Thülig"],["10:15–11:00","Mathematik","Frau Thülig"],["11:05–11:50","Kunst","Frau Thülig"],["12:05–12:50","Kunst","Frau Thülig"],["12:50–13:35","",""]], after:"OGS · Chess Club (every two weeks)" },
  { day:"Tuesday", icon:"🌻", lessons:[["8:10–8:55","Sachunterricht","Frau Wood"],["9:00–9:45","Mathematik","Frau Thülig"],["10:15–11:00","Deutsch","Frau Thülig"],["11:05–11:50","Deutsch","Frau Thülig"],["12:05–12:50","Ev. Religion","Frau Heppner"],["12:50–13:35","",""]], after:"OGS · Recorder 13:30–14:15 · Frau Bierhaus" },
  { day:"Wednesday", icon:"🌷", lessons:[["8:10–8:55","Sport","Herr Schrader"],["9:00–9:45","Geometrie","Frau Grünewald"],["10:15–11:00","Musik","Frau Grünewald"],["11:05–11:50","Deutsch","Frau Ulpke"],["12:05–12:50","",""],["12:50–13:35","",""]], after:"OGS · Ensemble 14:00–14:45 · Herr Pottmeier" },
  { day:"Thursday", icon:"🌸", lessons:[["8:10–8:55","Ev./kath. Religion",""],["9:00–9:45","Deutsch","Frau Thülig"],["10:15–11:00","Mathematik","Frau Thülig"],["11:05–11:50","Kunst","Frau Thülig"],["12:05–12:50","Schwimmen","Frau Thülig & Herr Schrader"],["12:50–13:35","Schwimmen","Frau Thülig & Herr Schrader"]], after:"OGS · Bastel Club 15:00–16:00" },
  { day:"Friday", icon:"🌈", lessons:[["8:10–8:55","Kath. Religion","Frau Friemel"],["9:00–9:45","Mathematik","Frau Thülig"],["10:15–11:00","Deutsch","Frau Thülig"],["11:05–11:50","Sachunterricht","Frau Wood"],["12:05–12:50","Sachunterricht","Frau Wood"],["12:50–13:35","",""]], after:"OGS" }
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
  const [week,setWeek] = useState(() => { try { const saved = JSON.parse(localStorage.getItem("aisha-week-schedule")); return saved ? saved.map(day => day.day === "Monday" && day.after?.includes("Dance Club") ? {...day,after:"OGS · Chess Club (every two weeks)"} : day) : initialWeek; } catch { return initialWeek; } });
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
                  {editing ? <><input aria-label={day.day+" lesson "+(lessonIndex+1)} value={lesson[1]} placeholder={isOgsCard ? "OGS / activity" : "Lesson / activity"} onChange={e => updateLesson(dayIndex,lessonIndex,1,e.target.value)} /><input aria-label="Teacher" value={lesson[2]} placeholder="Teacher (optional)" onChange={e => updateLesson(dayIndex,lessonIndex,2,e.target.value)} />{isOgsCard && <textarea value={day.after} onChange={e => updateAfter(dayIndex,e.target.value)} aria-label={day.day+" OGS activities"} />}</> : <>
                    <b>{isOgsCard ? "🌟 OGS" : lesson[1] || "—"}</b>
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
                {editing ? <textarea value={day.after} onChange={e => updateAfter(dayIndex,e.target.value)} aria-label={day.day+" OGS activities"} /> : <>
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
    {schoolTab === "lunch" && <section className="panel lunch-menu-panel">
      <div className="panel-heading"><h2>🍽️ This week's lunch</h2><span className="small-tag">2–6 NOVEMBER 2026</span></div>
      <p className="lunch-menu-copy">Here is the latest menu from school. Open it to see what is being served each day.</p>
      <a className="primary-button lunch-menu-link" href="http://www.grundschule-albert-schweitzer.de/wp-content/uploads/2026/11/Speiseplan-Mensa-02.11-06.11.26.pdf" target="_blank" rel="noreferrer">Open this week's menu <span>↗</span></a>
      <p className="gentle-note">Mum updates this link when the school publishes a new weekly menu.</p>
    </section>}
  </>;
}

const foodQuestions = [{"q":"Which food belongs in the vegetables and fruit part of the plate?","o":["Carrot","Chicken","Rice","Cheese"],"a":0,"e":"Carrots are vegetables. They add color, fiber and vitamins to meals."},{"q":"Which food is a source of protein?","o":["Egg","Apple","Bread","Cucumber"],"a":0,"e":"Eggs contain protein, which helps the body grow and repair itself."},{"q":"Which food is a grain food?","o":["Pasta","Strawberry","Yogurt","Peas"],"a":0,"e":"Pasta is usually made from wheat, a grain."},{"q":"Which drink is a good everyday choice?","o":["Water","Lemonade","Cola","Sweet iced tea"],"a":0,"e":"Water helps your body work well and is a great drink throughout the day."},{"q":"Which of these is a fruit?","o":["Pear","Potato","Lentil","Oatmeal"],"a":0,"e":"A pear is a fruit. Fruit and vegetables bring lots of variety to meals."},{"q":"Which food is made from milk and can provide calcium and protein?","o":["Yogurt","Carrot","Rice","Olive oil"],"a":0,"e":"Yogurt is a dairy food that can provide calcium and protein."},{"q":"Which food is a plant-based source of protein?","o":["Lentils","Grapes","Pasta","Lettuce"],"a":0,"e":"Lentils are beans/legumes and contain plant protein and fiber."},{"q":"Which food is a whole grain?","o":["Oatmeal","Candy","Butter","Chicken"],"a":0,"e":"Oats are whole grains and provide energy and fiber."},{"q":"Which meal has a good mix of food groups?","o":["Rice, beans and broccoli","Only a bowl of sweets","Only plain pasta","Only cucumber"],"a":0,"e":"Rice gives energy, beans provide protein, and broccoli adds vegetables."},{"q":"What can vegetables and fruit help provide?","o":["Vitamins and fiber","Only protein","Only sugar","No nutrients"],"a":0,"e":"Different fruits and vegetables provide vitamins, minerals and fiber."},{"q":"Which food belongs to the protein group?","o":["Fish","Banana","Bread","Tomato"],"a":0,"e":"Fish is a protein food."},{"q":"Which is a starchy food that gives the body energy?","o":["Potato","Blueberry","Egg","Spinach"],"a":0,"e":"Potatoes contain carbohydrates that the body can use for energy."},{"q":"Which snack includes fruit and protein?","o":["Apple with yogurt","Only jelly sweets","Only crisps","Only a lollipop"],"a":0,"e":"The apple gives fruit and fiber; yogurt adds protein and calcium."},{"q":"Which of these is a vegetable?","o":["Broccoli","Peach","Cheese","Oats"],"a":0,"e":"Broccoli is a green vegetable."},{"q":"Why is it helpful to eat different colored vegetables and fruits?","o":["They offer different nutrients","They all taste exactly the same","They replace the need for water","They contain no nutrients"],"a":0,"e":"Different colors often come with different vitamins and helpful plant compounds."},{"q":"Which food is a legume?","o":["Chickpeas","Orange","Bread","Cheddar"],"a":0,"e":"Chickpeas are legumes. They provide plant protein and fiber."},{"q":"Which is a grain food often used to make porridge?","o":["Oats","Eggs","Carrots","Salmon"],"a":0,"e":"Oats are grains and are often cooked into porridge."},{"q":"What is one reason our bodies need protein?","o":["To grow and repair the body","To make us never thirsty","To replace sleep","To make vegetables unnecessary"],"a":0,"e":"Protein helps the body grow and repair muscles and other tissues."},{"q":"Which lunch has vegetables, grains and protein?","o":["Chicken, bulgur and salad","Only a banana","Only bread","Only yogurt"],"a":0,"e":"Chicken provides protein, bulgur is a grain, and salad adds vegetables."},{"q":"What is a sensible way to build a balanced meal?","o":["Include different food groups","Eat only one food every day","Avoid all grains","Drink soda instead of water"],"a":0,"e":"A balanced meal can include vegetables or fruit, grains or potatoes, and protein foods."}];


function FutureWorld({ markCompleted }) {
  const [open,setOpen] = useState(false);
  const [likes,setLikes] = useState([]);
  const qualities=["I enjoy helping people learn.","I like explaining things.","I enjoy being creative.","I like working with children."];
  return <>
    <PageHeading eyebrow="EXPLORE THE WORLD OF WORK" title="My future world" subtitle="Discover jobs and what you might enjoy." emoji="🌍" />
    <div className={open ? "future-flip-card is-flipped" : "future-flip-card"}>
      <div className="future-flip-inner">
        <div className="future-card-face future-card-front">
          <button className="future-job-card" onClick={()=>{setOpen(true);markCompleted("profession-teacher");}} aria-label="Turn over the Teacher card">
            <div className="teacher-art" role="img" aria-label="Teacher in a classroom"><span>👩‍🏫</span><span className="teacher-board">ABC<br/>1 2 3<br/>✏️ 📚</span><span className="teacher-plant">🌱</span></div>
            <span className="future-card-title">Teacher</span><span className="future-card-category">Education</span><span className="future-card-open">Tap to turn the card ↻</span>
          </button>
        </div>
        <div className="future-card-face future-card-back">
          <div className="future-back-content">
            <button className="secondary-button future-back" onClick={()=>setOpen(false)}>↶ Turn card back</button>
            <div className="future-back-title"><span>👩‍🏫</span><div><p className="eyebrow">EDUCATION</p><h2>Teacher</h2></div></div>
            <div className="future-info-block"><h3>What does a teacher do?</h3><p>Teachers help people learn. They explain ideas, plan lessons, answer questions and encourage their students.</p></div>
            <div className="future-info-block"><h3>Where can teachers work?</h3><ul><li>Primary and secondary schools</li><li>Special education and language schools</li><li>Vocational colleges and adult education</li><li>International schools</li></ul><p>An <b>international teacher</b> teaches in a school where children may come from many countries. Lessons are often taught in English.</p></div>
            <div className="future-info-block"><h3>How do you become a teacher?</h3><p>In Germany, the usual route is to study teaching at university and then complete practical teacher training called <b>Referendariat</b>. The exact route depends on the school and German state.</p></div>
            <div className="future-info-block"><h3>What skills can help?</h3><p>Patience · Kindness · Creativity · Good communication · Enjoying learning and sharing ideas</p></div>
            <div className="future-info-block"><h3>Would you enjoy being a teacher?</h3><p>Choose anything that sounds like you. There are no right or wrong answers!</p><div className="future-checklist">{qualities.map(item=><label key={item}><input type="checkbox" checked={likes.includes(item)} onChange={e=>setLikes(old=>e.target.checked?[...old,item]:old.filter(x=>x!==item))}/><span>{item}</span></label>)}</div><p className="future-small-note">{likes.length ? "You picked "+likes.length+" things you might enjoy!" : "Pick the things you like."}</p></div>
            <div className="future-try"><h3>🎨 Try it yourself!</h3><p>Choose something you know and teach it to a teddy bear, friend or family member. Can you explain it in three steps?</p></div>
          </div>
        </div>
      </div>
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
      intro:"Happiness is a warm, bright feeling we may have when something good happens or when we enjoy a moment.",
      clues:"You might smile, laugh, feel warm inside, or want to share your good mood with someone.",
      example:"You build a tall tower, and it stands up! You may feel happy and proud.",
      questions:[
        {question:"Which situation might make you feel happy?",options:["Playing a fun game with a friend","Losing your favorite toy","Hearing a loud, scary noise"],correct:0,why:"Playing together can be enjoyable and make you feel happy."},
        {question:"What might your body do when you feel happy?",options:["You might smile or laugh","Your body must always feel tired","You must always want to cry"],correct:0,why:"A smile or laugh can be a clue that you feel happy."}
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
    <PageHeading eyebrow="EMOTIONS & ME" title="My feelings" subtitle="Let's learn about one feeling at a time." emoji="🌈" />
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

function Food({ markCompleted, awardFoodQuizStars }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = foodQuestions[questionIndex];
  const correct = selected === question?.a;

  function choose(index) {
    if (selected !== null) return;
    setSelected(index);
    if (index === question.a) setScore((value) => value + 1);
  }

  function next() {
    if (questionIndex === foodQuestions.length - 1) {
      setFinished(true);
      awardFoodQuizStars(score);
    } else {
      setQuestionIndex((value) => value + 1);
      setSelected(null);
    }
  }

  function restart() {
    setQuestionIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  return <>
    <PageHeading eyebrow="HEALTHY ME" title="Eat a rainbow!" subtitle="Discover foods that help you grow." emoji="🥑" />
    <section className="plate-panel"><div className="plate-illustration"><div className="plate-half"><span>🥦</span><span>🥕</span><span>🍓</span><span>🥬</span></div><div className="plate-quarter"><span>🍚</span><span>🍞</span></div><div className="plate-quarter protein"><span>🥚</span><span>🫘</span></div></div><div className="plate-copy"><p className="eyebrow">THE HEALTHY PLATE</p><h2>A little bit of everything!</h2><p>A helpful guide for a balanced main meal:</p><ul><li><b>½ plate</b> vegetables and fruit</li><li><b>¼ plate</b> grains or potatoes</li><li><b>¼ plate</b> protein foods</li></ul><p className="gentle-note">Different meals can look different. This is a guide, not a strict rule.</p></div></section>
    <div className="food-groups"><div className="food-group green"><span>🥦</span><b>Vegetables & fruit</b><small>Help your body stay healthy.</small></div><div className="food-group yellow"><span>🍞</span><b>Grains & potatoes</b><small>Give you energy to play.</small></div><div className="food-group pink"><span>🥚</span><b>Protein foods</b><small>Help your body grow.</small></div><div className="food-group blue"><span>💧</span><b>Water</b><small>Helps your body work well.</small></div></div>
    <section className="quiz-panel food-quiz">
      <div className="food-quiz-top"><p className="eyebrow">FOOD EXPLORER QUIZ</p><span className="small-tag">{finished ? "COMPLETE" : `QUESTION ${questionIndex + 1} OF ${foodQuestions.length}`}</span></div>
      {!finished ? <>
        <div className="progress-track"><span style={{width:`${((questionIndex + 1) / foodQuestions.length) * 100}%`}} /></div>
        <h2>{question.q}</h2>
        <div className="food-answer-grid">{question.o.map((option,index) => <button key={option} disabled={selected !== null} className={selected === index ? (correct ? "food-answer correct" : "food-answer incorrect") : selected !== null && index === question.a ? "food-answer reveal-correct" : "food-answer"} onClick={() => choose(index)}>{option}</button>)}</div>
        {selected !== null && <><div className={`feedback ${correct ? "good" : "try-again"}`}>{correct ? "That's right! 🌟 " : "Good try! "} {question.e}</div><button className="primary-button next-button" onClick={next}>{questionIndex === foodQuestions.length - 1 ? "See my score" : "Next question →"}</button></>}
      </> : <div className="result-panel"><div className="result-emoji">🌟</div><h2>Food explorer complete!</h2><p className="result-score">{score} / {foodQuestions.length}</p><p>{score === foodQuestions.length ? "Fantastic! You know so much about food groups!" : "Well done for learning! Every question helps you discover something new."}</p><button className="primary-button" onClick={restart}>Play again ↻</button></div>}
    </section>
  </>;
}

function Coding({ markCompleted }) {
  return <>
    <PageHeading eyebrow="CODING LAB" title="Hello, little coder!" subtitle="Computers follow instructions. You can teach them what to do!" emoji="🤖" />
    <section className="coding-intro"><div className="robot-face">🤖</div><div><h2>Think like a computer scientist</h2><p>Break a big problem into small steps. Give clear instructions. Test your idea and try again!</p></div></section>
    <div className="section-title-row compact"><div><p className="eyebrow">PICK A CODING ADVENTURE</p><h2>Choose where to explore</h2></div></div>
    <div className="resource-list">{codingLinks.map((link) => <a className="resource-card" href={link.url} target="_blank" rel="noreferrer" key={link.name} onClick={() => markCompleted("coding-" + link.name)}><span className="resource-icon">{link.icon}</span><span className="resource-info"><b>{link.name}</b><small>{link.detail}</small></span><span className="resource-level">{link.level}</span><span className="external-arrow">↗</span></a>)}</div>
    <section className="mission-card"><div className="mission-icon">🧭</div><div><p className="eyebrow">UNPLUGGED CHALLENGE</p><h3>Be a robot's teacher!</h3><p>Write 4 steps to help a robot walk from the door to a chair. Are your instructions clear?</p></div></section>
  </>;
}

function MathGames({ question, questionIndex, answer, chooseAnswer, nextQuestion, roundScore, roundFinished, restartMath, earnedToday }) {
  const isCorrect = answer === question.correct;
  return <>
    <PageHeading eyebrow="MATH WORLD" title="Let's play with numbers!" subtitle="Think, try, and enjoy the challenge. Every question is a chance to learn." emoji="🧩" />
    <section className="math-card">
      {!roundFinished ? <>
        <div className="math-topline"><span className="small-tag">DAILY CHALLENGE</span><span className="question-count">Question {questionIndex + 1} of {questions.length}</span></div>
        <div className="progress-track"><span style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div>
        <div className="math-mascot">🦊</div><p className="math-prompt">Can you solve this?</p><h2 className="math-question">{question.question}</h2>
        <div className="answer-grid">{question.answers.map((choice) => <button key={choice} disabled={Boolean(answer)} className={answer === choice ? (isCorrect ? "answer-button correct" : "answer-button incorrect") : "answer-button"} onClick={() => chooseAnswer(choice)}>{choice}</button>)}</div>
        {answer && <div className={`feedback ${isCorrect ? "good" : "try-again"}`}>{isCorrect ? "Brilliant! That's right! 🎉" : `Good try! The answer is ${question.correct}.`}<br />{question.explanation}</div>}
        {answer && <button className="primary-button next-button" onClick={nextQuestion}>{questionIndex === questions.length - 1 ? "See my result" : "Next question →"}</button>}
      </> : <div className="result-panel"><div className="result-emoji">🏆</div><p className="eyebrow">CHALLENGE COMPLETE</p><h2>You did it!</h2><p className="result-score">{roundScore} / {questions.length} correct</p><p>{roundScore === questions.length ? "Amazing work! You are a maths superstar!" : "Wonderful effort! Practising helps your brain grow."}</p>{earnedToday ? <p className="gentle-note">Your stars for today's challenge have already been collected.</p> : <p className="gentle-note">You earned {roundScore} stars!</p>}<button className="primary-button" onClick={restartMath}>Play again ↻</button></div>}
    </section>
    <div className="section-title-row compact"><div><p className="eyebrow">MORE MATHS FUN</p><h2>Explore these websites</h2></div></div>
    <div className="resource-list">{mathLinks.map((link) => <a className="resource-card" href={link.url} target="_blank" rel="noreferrer" key={link.name}><span className="resource-icon">{link.icon}</span><span className="resource-info"><b>{link.name}</b><small>{link.detail}</small></span><span className="external-arrow">↗</span></a>)}</div>
  </>;
}

function Achievements({ stars, badges, history }) {
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthlyHistory = history.filter(item => item.date?.slice(0, 7) === thisMonth).sort((a,b) => b.date.localeCompare(a.date));
  const olderStars = Math.max(0, stars - history.reduce((sum,item) => sum + (item.stars || 1), 0));
  return <>
    <PageHeading eyebrow="MY PROGRESS" title="Look at you go!" subtitle="Every little step is something to celebrate." emoji="🏆" />
    <section className="stars-hero"><span>⭐</span><div><strong>{stars}</strong><p>stars collected</p><p className="treat-goal">🎁 At 50 stars, choose a special treat with Mum!</p></div><span>✨</span></section>
    <div className="section-title-row compact"><div><p className="eyebrow">STAR NOTIFICATIONS</p><h2>This month's stars</h2></div></div>
    <section className="star-history-list">
      {monthlyHistory.length ? monthlyHistory.map(item => <div className="star-history-item" key={item.id}><span>⭐</span><div><b>{item.label}</b><small>{new Date(item.date).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</small></div><strong>+{item.stars || 1}</strong></div>) : <p className="gentle-note">No stars collected this month yet. Try an activity to get started!</p>}
      {olderStars > 0 && <p className="gentle-note">{olderStars} earlier {olderStars === 1 ? "star was" : "stars were"} collected before star notifications were added.</p>}
    </section>
    <div className="section-title-row compact"><div><p className="eyebrow">YOUR BADGE COLLECTION</p><h2>Little achievements</h2></div></div>
    <div className="badge-grid">{badges.map((badge) => <div className={`badge-card ${badge.unlocked ? "unlocked" : "locked"}`} key={badge.title}><span>{badge.unlocked ? badge.icon : "🔒"}</span><b>{badge.title}</b><small>{badge.unlocked ? badge.description : "Keep exploring to unlock this badge!"}</small></div>)}</div>
    <p className="gentle-note">Your stars and completed missions are saved in this browser on this device.</p>
  </>;
}

export default App;
