import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Share2, Zap, Clock, Target, Award } from 'lucide-react';

const CREATOR_ENTRY = {
  name: "Ashish Garg",
  avgTime: 200,
  date: "12/01/2026",
  creator: true,
};
export default function ReactionGame() {
  const [gameState, setGameState] = useState('start'); // start, waiting, click, result
  const [score, setScore] = useState(0);
  const [reactionTime, setReactionTime] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [personalBest, setPersonalBest] = useState(null);
  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);

  const MAX_ATTEMPTS = 5;

  // Load leaderboard and personal best from storage
  useEffect(() => {
    loadLeaderboard();
    loadPersonalBest();
  }, []);

  const loadLeaderboard = () => {
  try {
    const data = localStorage.getItem("leaderboard");
    const parsed = data ? JSON.parse(data) : [];

    const filtered = parsed.filter(
      (entry) => entry.name !== CREATOR_ENTRY.name
    );

    setLeaderboard([CREATOR_ENTRY, ...filtered].slice(0, 10));
  } catch (error) {
    setLeaderboard([CREATOR_ENTRY]);
  }
};



  const loadPersonalBest = () => {
  try {
    const data = localStorage.getItem("personal-best");
    if (data) setPersonalBest(JSON.parse(data));
  } catch {
    setPersonalBest(null);
  }
};


  const saveToLeaderboard = (name, avgTime) => {
  const data = localStorage.getItem("leaderboard");
  let board = data ? JSON.parse(data) : [];

  board.push({
    name,
    avgTime: Math.round(avgTime),
    date: new Date().toISOString(),
  });

  board = board
    .filter((e) => e.name !== CREATOR_ENTRY.name)
    .sort((a, b) => a.avgTime - b.avgTime)
    .slice(0, 9);

  localStorage.setItem("leaderboard", JSON.stringify(board));
  setLeaderboard([CREATOR_ENTRY, ...board]);
};


  const savePersonalBest = (avgTime) => {
  const newBest = {
    avgTime: Math.round(avgTime),
    date: new Date().toISOString(),
  };
  localStorage.setItem("personal-best", JSON.stringify(newBest));
  setPersonalBest(newBest);
};

  const getRandomPosition = () => {
    return {
      x: Math.random() * 70 + 15,
      y: Math.random() * 70 + 15
    };
  };

  const startGame = () => {
    setAttempts(0);
    setTotalScore(0);
    setScore(0);
    startRound();
  };

  const startRound = () => {
    setGameState('waiting');
    setTargetPosition(getRandomPosition());
    const delay = Math.random() * 3000 + 2000;

    timeoutRef.current = setTimeout(() => {
      setGameState('click');
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleTargetClick = () => {
    if (gameState === 'waiting') {
      clearTimeout(timeoutRef.current);
      setGameState('result');
      setReactionTime('Too early!');
      setTimeout(() => {
        if (attempts + 1 < MAX_ATTEMPTS) {
          startRound();
          setAttempts(attempts + 1);
        } else {
          endGame(totalScore);
        }
      }, 1500);
      return;
    }

    if (gameState !== 'click') return;

    const time = Date.now() - startTimeRef.current;
    setReactionTime(time);
    
    const points = Math.max(1000 - time, 100);
    const newTotal = totalScore + points;
    setScore(points);
    setTotalScore(newTotal);
    setGameState('result');

    setTimeout(() => {
      if (attempts + 1 < MAX_ATTEMPTS) {
        startRound();
        setAttempts(attempts + 1);
      } else {
        endGame(newTotal);
      }
    }, 1500);
  };

  const endGame = (finalScore) => {
    const avgTime = (MAX_ATTEMPTS * 1000 - finalScore) / MAX_ATTEMPTS;
    
    if (!personalBest || avgTime < personalBest.avgTime) {
      savePersonalBest(avgTime);
    }
    
    setGameState('gameover');
    setShowNameInput(true);
  };

  const submitScore = () => {
    if (playerName.trim()) {
      const avgTime = (MAX_ATTEMPTS * 1000 - totalScore) / MAX_ATTEMPTS;
      saveToLeaderboard(playerName.trim(), avgTime);
      setShowNameInput(false);
    }
  };

  const shareScore = () => {
    const avgTime = Math.round((MAX_ATTEMPTS * 1000 - totalScore) / MAX_ATTEMPTS);
    const text = `⚡ Reaction Speed Challenge ⚡\n\nMy average reaction time: ${avgTime}ms\nTotal score: ${totalScore}\n\nCan you beat me? 🎯`;
    
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Score copied to clipboard!');
    }
  };

  const getRank = () => {
    const avgTime = (MAX_ATTEMPTS * 1000 - totalScore) / MAX_ATTEMPTS;
    if (avgTime < 200) return { text: '🔥 LEGENDARY', color: 'text-red-500' };
    if (avgTime < 250) return { text: '⚡ ELITE', color: 'text-purple-500' };
    if (avgTime < 300) return { text: '🎯 MASTER', color: 'text-blue-500' };
    if (avgTime < 350) return { text: '🌟 EXPERT', color: 'text-green-500' };
    if (avgTime < 400) return { text: '👍 SKILLED', color: 'text-yellow-500' };
    return { text: '🎮 ROOKIE', color: 'text-gray-500' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-500 bg-clip-text text-transparent">
            ⚡ Reaction Speed Challenge
          </h1>
          <p className="text-gray-300">Test your reflexes. Beat the world.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="md:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-purple-500/30 shadow-2xl">
              {/* Stats Bar */}
              {gameState !== 'start' && (
                <div className="flex justify-between mb-6 text-sm">
                  <div className="bg-slate-700/50 px-4 py-2 rounded-lg">
                    <div className="text-gray-400">Attempt</div>
                    <div className="text-2xl font-bold text-purple-400">{attempts + 1}/{MAX_ATTEMPTS}</div>
                  </div>
                  <div className="bg-slate-700/50 px-4 py-2 rounded-lg">
                    <div className="text-gray-400">Score</div>
                    <div className="text-2xl font-bold text-yellow-400">{totalScore}</div>
                  </div>
                  {personalBest && (
                    <div className="bg-slate-700/50 px-4 py-2 rounded-lg">
                      <div className="text-gray-400">Personal Best</div>
                      <div className="text-2xl font-bold text-green-400">{personalBest.avgTime}ms</div>
                    </div>
                  )}
                </div>
              )}

              {/* Game Container */}
              <div 
                className="relative bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl overflow-hidden"
                style={{ height: '500px' }}
              >
                {gameState === 'start' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                    <Zap className="w-24 h-24 text-yellow-400 mb-6 animate-pulse" />
                    <h2 className="text-3xl font-bold mb-4">Ready to Test Your Speed?</h2>
                    <p className="text-gray-300 mb-6 text-center max-w-md">
                      Click the target as soon as it appears! You'll get 5 attempts. 
                      Faster reactions = higher scores!
                    </p>
                    <button
                      onClick={startGame}
                      className="bg-gradient-to-r from-yellow-400 to-red-500 text-black px-8 py-4 rounded-xl font-bold text-xl hover:scale-105 transition-transform shadow-lg"
                    >
                      START GAME
                    </button>
                  </div>
                )}

                {gameState === 'waiting' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Clock className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
                      <p className="text-2xl text-gray-300">Wait for it...</p>
                      <p className="text-sm text-gray-500 mt-2">Don't click yet!</p>
                    </div>
                  </div>
                )}

                {gameState === 'click' && (
                  <button
                    onClick={handleTargetClick}
                    className="absolute w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center border-4 border-white animate-pulse"
                    style={{
                      left: `${targetPosition.x}%`,
                      top: `${targetPosition.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <Target className="w-12 h-12 text-white" />
                  </button>
                )}

                {gameState === 'result' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-slate-800/90 p-8 rounded-2xl">
                      {typeof reactionTime === 'number' ? (
                        <>
                          <div className="text-6xl font-bold text-green-400 mb-2">{reactionTime}ms</div>
                          <div className="text-2xl text-yellow-400 mb-2">+{score} points</div>
                          <p className="text-gray-300">
                            {reactionTime < 200 ? '🔥 Lightning fast!' :
                             reactionTime < 250 ? '⚡ Excellent!' :
                             reactionTime < 300 ? '🎯 Great!' :
                             reactionTime < 350 ? '👍 Good!' :
                             '😅 Keep practicing!'}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="text-4xl mb-2">❌</div>
                          <div className="text-2xl text-red-400">{reactionTime}</div>
                          <p className="text-gray-300 text-sm mt-2">Wait for the target to appear!</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {gameState === 'gameover' && (
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center bg-slate-800/95 p-8 rounded-2xl max-w-md w-full">
                      <Award className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold mb-4">Game Complete!</h2>
                      
                      <div className="mb-6">
                        <div className={`text-4xl font-bold ${getRank().color} mb-2`}>
                          {getRank().text}
                        </div>
                        <div className="text-2xl text-gray-300 mb-1">
                          Avg: {Math.round((MAX_ATTEMPTS * 1000 - totalScore) / MAX_ATTEMPTS)}ms
                        </div>
                        <div className="text-xl text-yellow-400">
                          Total Score: {totalScore}
                        </div>
                      </div>

                      {showNameInput && (
                        <div className="mb-4">
                          <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full bg-slate-700 border border-purple-500/30 rounded-lg px-4 py-2 mb-2 text-white placeholder-gray-400"
                            maxLength={20}
                          />
                          <button
                            onClick={submitScore}
                            disabled={!playerName.trim()}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                          >
                            Submit to Leaderboard
                          </button>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={shareScore}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                          Share
                        </button>
                        <button
                          onClick={startGame}
                          className="flex-1 bg-gradient-to-r from-yellow-400 to-red-500 hover:opacity-90 text-black px-4 py-3 rounded-lg font-semibold transition-opacity"
                        >
                          Play Again
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-purple-500/30 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold">Global Leaders</h2>
              </div>

              {leaderboard.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>No scores yet!</p>
                  <p className="text-sm mt-2">Be the first on the leaderboard</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        index === 0 ? 'bg-yellow-500/20 border border-yellow-500/50' :
                        index === 1 ? 'bg-gray-400/20 border border-gray-400/50' :
                        index === 2 ? 'bg-orange-600/20 border border-orange-600/50' :
                        'bg-slate-700/30'
                      }`}
                    >
                      <div className={`text-2xl font-bold w-8 ${
                        index === 0 ? 'text-yellow-400' :
                        index === 1 ? 'text-gray-300' :
                        index === 2 ? 'text-orange-400' :
                        'text-gray-500'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">
                          {entry.name}
                          {entry.creator && (
                            <span className="ml-2 text-xs text-purple-400">(Creator)</span>
                          )}
                        </div>

                        <div className="text-sm text-gray-400">
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-400">{entry.avgTime}ms</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-700">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">RANK TIERS</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-red-400">🔥 LEGENDARY</span>
                    <span className="text-gray-400">&lt; 200ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-400">⚡ ELITE</span>
                    <span className="text-gray-400">&lt; 250ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-400">🎯 MASTER</span>
                    <span className="text-gray-400">&lt; 300ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-400">🌟 EXPERT</span>
                    <span className="text-gray-400">&lt; 350ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
         {/* FOOTER */}
        <footer className="text-center text-xs text-gray-400 mt-10 opacity-70">
          Crafted with ⚡ by Ashish Garg
        </footer>
      </div>
    </div>
  );
}