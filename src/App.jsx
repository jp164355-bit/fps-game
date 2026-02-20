import { useState, useEffect, useRef } from "react";
import "./App.css";

const characters = [
  { name: "Blaze 🔥", power: 15, hp: 100 },
  { name: "Shadow 🌑", power: 10, hp: 80 },
  { name: "Nova ⚡", power: 12, hp: 90 },
];

function App() {
  const [player, setPlayer] = useState(null);
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(100);
  const [combo, setCombo] = useState(1);
  const [time, setTime] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pos, setPos] = useState({ top: "50%", left: "50%" });

  const hitSound = useRef(new Audio("https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.wav"));
  const missSound = useRef(new Audio("https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.wav"));

  // Move Target
  const move = () => {
    if (paused) return;
    setPos({
      top: Math.random() * 80 + "%",
      left: Math.random() * 80 + "%",
    });
  };

  // Timer
  useEffect(() => {
    if (!player || paused || gameOver) return;

    const timer = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [player, paused, gameOver]);

  // Auto Move
  useEffect(() => {
    if (!player || paused || gameOver) return;

    const mover = setInterval(move, 900);

    return () => clearInterval(mover);
  }, [player, paused, gameOver]);

  // Shoot
  const shoot = () => {
    if (paused || gameOver) return;

    hitSound.current.play();

    setScore((s) => s + player.power * combo);
    setCombo((c) => Math.min(c + 1, 5));
    move();
  };

  // Miss
  const miss = () => {
    if (paused || gameOver) return;

    missSound.current.play();

    setCombo(1);
    setHp((h) => {
      if (h <= 10) {
        setGameOver(true);
        return 0;
      }
      return h - 10;
    });
  };

  // Restart
  const restart = () => {
    window.location.reload();
  };

  // Select Screen
  if (!player) {
    return (
      <div className="select">
        <h1>Select Agent</h1>

        {characters.map((c) => (
          <div
            key={c.name}
            className="card"
            onClick={() => {
              setPlayer(c);
              setHp(c.hp);
            }}
          >
            <h2>{c.name}</h2>
            <p>Power: {c.power}</p>
            <p>HP: {c.hp}</p>
          </div>
        ))}
      </div>
    );
  }

  // Game Over
  if (gameOver) {
    return (
      <div className="over">
        <h1>Mission Failed ❌</h1>
        <h2>Score: {score}</h2>
        <button onClick={restart}>Restart</button>
      </div>
    );
  }

  // Main Game
  return (
    <div className="arena" onClick={miss}>
      <div className="hud">
        <span>🎯 Score: {score}</span>
        <span>❤️ HP: {hp}</span>
        <span>🔥 Combo: x{combo}</span>
        <span>⏱ {time}s</span>
        <button onClick={() => setPaused(!paused)}>
          {paused ? "▶️" : "⏸"}
        </button>
      </div>

      <div
        className="enemy"
        style={pos}
        onClick={(e) => {
          e.stopPropagation();
          shoot();
        }}
      >
        💀
      </div>
    </div>
  );
}

export default App;
