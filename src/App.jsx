import { useEffect, useMemo, useState } from "react";

const sections = [
  { id: "home", label: "Home", icon: "🏡" },
  { id: "school", label: "My school", icon: "🎒" },
  { id: "food", label: "Healthy me", icon: "🥑" },
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
  { name: "Code.org", detail: "Try beginner-friendly coding puzzles and lessons.", url: "https://studio.code.org/courses/express-2025/units/1?viewAs=Instructor", icon: "💻", level: "Learn" },
  { name: "Blockly Games", detail: "Learn how to give computers step-by-step instructions.", url: "https://blockly.games/", icon: "🧱", level: "Play" },
];

const mathLinks = [
  { name: "ANTON", detail: "School exercises and maths practice.", url: "https://anton.app/", icon: "📚" },
  { name: "Matific", detail: "Interactive maths activities and games.", url: "https://www.matific.com/", icon: "🎲" },
  { name: "Math Is Fun", detail: "Friendly explanations, puzzles and number games.", url: "https://www.mathsisfun.com/", icon: "🔢" },
];

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem("aisha-dashboard-progress")) || { stars: 0, completed: [] };
  } catch {
    return { stars: 0, completed: [] };
  }
}

function App() {
  const [active, setActive] = useState("home");
  const [progress, setProgress] = useState(readSaved);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [roundScore, setRoundScore] = useState(0);
  const [roundFinished, setRoundFinished] = useState(false);
  const [foodAnswer, setFoodAnswer] = useState("");

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
    { icon: "🤖", title: "Coding explorer", description: "Visit a coding activity.", unlocked: progress.completed.includes("coding") },
    { icon: "🥦", title: "Food detective", description: "Try the healthy plate quiz.", unlocked: progress.completed.includes("food") },
  ], [earnedToday, progress.completed]);

  function markCompleted(id) {
    setProgress((old) => old.completed.includes(id) ? old : { ...old, completed: [...old.completed, id], stars: old.stars + 1 });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" onClick={() => setActive("home")} aria-label="Aisha's home">
          <span className="brand-icon">🌈</span>
          <span>Aisha's <strong>Little Learning World</strong></span>
        </a>
        <div className="top-stats"><span>⭐ {progress.stars} stars</span><span className="today-pill">A little learning every day</span></div>
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
          {active === "food" && <Food markCompleted={markCompleted} />}
          {active === "coding" && <Coding markCompleted={markCompleted} />}
          {active === "math" && <MathGames question={question} questionIndex={questionIndex} answer={answer} chooseAnswer={chooseAnswer} nextQuestion={nextQuestion} roundScore={roundScore} roundFinished={roundFinished} restartMath={restartMath} earnedToday={earnedToday} />}
          {active === "stars" && <Achievements stars={progress.stars} badges={badges} />}
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
    { id: "food", icon: "🥑", title: "Healthy me", text: "Discover food that helps you grow.", color: "green" },
    { id: "coding", icon: "🤖", title: "Coding lab", text: "Give instructions and create things.", color: "purple" },
    { id: "math", icon: "🧩", title: "Math games", text: "Solve puzzles and become a math star.", color: "peach" },
  ];
  return <>
    <section className="welcome-card">
      <div className="welcome-copy"><h1>Hi, Aisha! <span>✨</span></h1><p>What would you like to explore today?</p><button className="primary-button" onClick={() => setActive("math")}>Play a math game <span>→</span></button></div>
      <div className="welcome-art" aria-hidden="true"><div className="sun">☀️</div><div className="rainbow">🌈</div><div className="cloud">☁️</div><div className="star-float">⭐</div></div>
    </section>
    <div className="section-title-row"><div><p className="eyebrow">CHOOSE YOUR ADVENTURE</p><h2>Where shall we go?</h2></div><span className="star-counter">⭐ {stars} stars</span></div>
    <div className="adventure-grid">{cards.map((card) => <button key={card.id} className={`adventure-card ${card.color}`} onClick={() => setActive(card.id)}><span className="card-emoji">{card.icon}</span><span className="card-title">{card.title}</span><span className="card-text">{card.text}</span><span className="card-arrow">Let's go <b>↗</b></span></button>)}</div>
    <section className="mission-card"><div className="mission-icon">🎯</div><div><p className="eyebrow">TODAY'S LITTLE MISSION</p><h3>Try one new thing!</h3><p>Answer a maths question, explore a new food, or try a coding puzzle.</p></div><span className="mission-sparkle">✦</span></section>
  </>;
}

function School() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  return <>
    <PageHeading eyebrow="MY SCHOOL" title="My school day" subtitle="Everything you need for a happy school day." emoji="🎒" />
    <div className="notice-card"><span>✏️</span><div><strong>Let's add your real timetable!</strong><p>This is a starter timetable. Mum can help fill in your lessons and activities.</p></div></div>
    <section className="panel"><div className="panel-heading"><h2>📅 My week</h2><span className="small-tag">MY TIMETABLE</span></div><div className="week-list">{days.map((day, index) => <div className="day-row" key={day}><span className="day-dot">{["🌼", "🌻", "🌷", "🌸", "🌈"][index]}</span><strong>{day}</strong><span className="empty-schedule">Lessons to be added</span><span className="edit-pencil">✎</span></div>)}</div></section>
    <section className="panel"><div className="panel-heading"><h2>🎒 Before I leave</h2><span className="small-tag">MY CHECKLIST</span></div><div className="checklist">{["School bag", "Water bottle", "Lunch or snack", "Pencil case"].map((item) => <label key={item}><input type="checkbox" /> <span>{item}</span></label>)}</div></section>
  </>;
}

const foodQuestions = [{"q":"Which food belongs in the vegetables and fruit part of the plate?","o":["Carrot","Chicken","Rice","Cheese"],"a":0,"e":"Carrots are vegetables. They add color, fiber and vitamins to meals."},{"q":"Which food is a source of protein?","o":["Egg","Apple","Bread","Cucumber"],"a":0,"e":"Eggs contain protein, which helps the body grow and repair itself."},{"q":"Which food is a grain food?","o":["Pasta","Strawberry","Yogurt","Peas"],"a":0,"e":"Pasta is usually made from wheat, a grain."},{"q":"Which drink is a good everyday choice?","o":["Water","Lemonade","Cola","Sweet iced tea"],"a":0,"e":"Water helps your body work well and is a great drink throughout the day."},{"q":"Which of these is a fruit?","o":["Pear","Potato","Lentil","Oatmeal"],"a":0,"e":"A pear is a fruit. Fruit and vegetables bring lots of variety to meals."},{"q":"Which food is made from milk and can provide calcium and protein?","o":["Yogurt","Carrot","Rice","Olive oil"],"a":0,"e":"Yogurt is a dairy food that can provide calcium and protein."},{"q":"Which food is a plant-based source of protein?","o":["Lentils","Grapes","Pasta","Lettuce"],"a":0,"e":"Lentils are beans/legumes and contain plant protein and fiber."},{"q":"Which food is a whole grain?","o":["Oatmeal","Candy","Butter","Chicken"],"a":0,"e":"Oats are whole grains and provide energy and fiber."},{"q":"Which meal has a good mix of food groups?","o":["Rice, beans and broccoli","Only a bowl of sweets","Only plain pasta","Only cucumber"],"a":0,"e":"Rice gives energy, beans provide protein, and broccoli adds vegetables."},{"q":"What can vegetables and fruit help provide?","o":["Vitamins and fiber","Only protein","Only sugar","No nutrients"],"a":0,"e":"Different fruits and vegetables provide vitamins, minerals and fiber."},{"q":"Which food belongs to the protein group?","o":["Fish","Banana","Bread","Tomato"],"a":0,"e":"Fish is a protein food."},{"q":"Which is a starchy food that gives the body energy?","o":["Potato","Blueberry","Egg","Spinach"],"a":0,"e":"Potatoes contain carbohydrates that the body can use for energy."},{"q":"Which snack includes fruit and protein?","o":["Apple with yogurt","Only jelly sweets","Only crisps","Only a lollipop"],"a":0,"e":"The apple gives fruit and fiber; yogurt adds protein and calcium."},{"q":"Which of these is a vegetable?","o":["Broccoli","Peach","Cheese","Oats"],"a":0,"e":"Broccoli is a green vegetable."},{"q":"Why is it helpful to eat different colored vegetables and fruits?","o":["They offer different nutrients","They all taste exactly the same","They replace the need for water","They contain no nutrients"],"a":0,"e":"Different colors often come with different vitamins and helpful plant compounds."},{"q":"Which food is a legume?","o":["Chickpeas","Orange","Bread","Cheddar"],"a":0,"e":"Chickpeas are legumes. They provide plant protein and fiber."},{"q":"Which is a grain food often used to make porridge?","o":["Oats","Eggs","Carrots","Salmon"],"a":0,"e":"Oats are grains and are often cooked into porridge."},{"q":"What is one reason our bodies need protein?","o":["To grow and repair the body","To make us never thirsty","To replace sleep","To make vegetables unnecessary"],"a":0,"e":"Protein helps the body grow and repair muscles and other tissues."},{"q":"Which lunch has vegetables, grains and protein?","o":["Chicken, bulgur and salad","Only a banana","Only bread","Only yogurt"],"a":0,"e":"Chicken provides protein, bulgur is a grain, and salad adds vegetables."},{"q":"What is a sensible way to build a balanced meal?","o":["Include different food groups","Eat only one food every day","Avoid all grains","Drink soda instead of water"],"a":0,"e":"A balanced meal can include vegetables or fruit, grains or potatoes, and protein foods."}];

function Food({ markCompleted }) {
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
      markCompleted("food");
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
    <div className="resource-list">{codingLinks.map((link) => <a className="resource-card" href={link.url} target="_blank" rel="noreferrer" key={link.name} onClick={() => markCompleted("coding")}><span className="resource-icon">{link.icon}</span><span className="resource-info"><b>{link.name}</b><small>{link.detail}</small></span><span className="resource-level">{link.level}</span><span className="external-arrow">↗</span></a>)}</div>
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

function Achievements({ stars, badges }) {
  return <>
    <PageHeading eyebrow="MY PROGRESS" title="Look at you go!" subtitle="Every little step is something to celebrate." emoji="🏆" />
    <section className="stars-hero"><span>⭐</span><div><strong>{stars}</strong><p>stars collected</p></div><span>✨</span></section>
    <div className="section-title-row compact"><div><p className="eyebrow">YOUR BADGE COLLECTION</p><h2>Little achievements</h2></div></div>
    <div className="badge-grid">{badges.map((badge) => <div className={`badge-card ${badge.unlocked ? "unlocked" : "locked"}`} key={badge.title}><span>{badge.unlocked ? badge.icon : "🔒"}</span><b>{badge.title}</b><small>{badge.unlocked ? badge.description : "Keep exploring to unlock this badge!"}</small></div>)}</div>
    <p className="gentle-note">Your stars and completed missions are saved in this browser on this device.</p>
  </>;
}

export default App;
