import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

interface Player {
  name: string;
}

interface Score {
  [playerId: number]: {
    holes: number[];
    total: number;
  };
}

interface Step {
  title: string;
  description: string;
}

interface Translations {
  ar: {
    title: string;
    playerCount: string;
    startRegistration: string;
    playerInfo: string;
    name: string;
    next: string;
    instructions: {
      title: string;
      steps: Step[];
      startPlaying: string;
    };
    scoreSheet: {
      title: string;
      hole: string;
      total: string;
      showResults: string;
    };
    results: {
      title: string;
      podium: string;
      rank: string;
      points: string;
    };
  };
  en: {
    title: string;
    playerCount: string;
    startRegistration: string;
    playerInfo: string;
    name: string;
    next: string;
    instructions: {
      title: string;
      steps: Step[];
      startPlaying: string;
    };
    scoreSheet: {
      title: string;
      hole: string;
      total: string;
      showResults: string;
    };
    results: {
      title: string;
      podium: string;
      rank: string;
      points: string;
    };
  };
}

export default function App() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [gameId, setGameId] = useState<Id<"games"> | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showScoreSheet, setShowScoreSheet] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [scores, setScores] = useState<Score>({});
  const [showLanguageButton, setShowLanguageButton] = useState(true);

  const createGame = useMutation(api.games.createGame);
  const addPlayer = useMutation(api.games.addPlayer);

  useEffect(() => {
    const handleScroll = () => {
      setShowLanguageButton(window.scrollY < 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const translations: Translations = {
    ar: {
      title: "تسجيل اللاعبين",
      playerCount: "عدد اللاعبين",
      startRegistration: "ابدأ التسجيل",
      playerInfo: "معلومات اللاعب",
      name: "الاسم",
      next: "التالي",
      instructions: {
        title: "تعليمات اللعب",
        steps: [
          { title: "استلام المضرب والكرة", description: "توجه إلى مكتب الاستقبال لاستلام المضرب والكرة الخاصة بك" },
          { title: "قواعد اللعب", description: "احرص على ضرب الكرة بلطف وتوجيهها نحو الهدف" },
          { title: "تسجيل النقاط", description: "سجل عدد الضربات التي احتجتها لإدخال الكرة في كل حفرة" },
          { title: "إنهاء اللعبة", description: "بعد الانتهاء، قم بإعادة المعدات إلى مكتب الاستقبال" }
        ],
        startPlaying: "ابدأ اللعب"
      },
      scoreSheet: {
        title: "سجل النقاط",
        hole: "الحفرة",
        total: "المجموع",
        showResults: "إظهار النتائج"
      },
      results: {
        title: "النتائج النهائية",
        podium: "منصة التتويج",
        rank: "المركز",
        points: "النقاط"
      }
    },
    en: {
      title: "Player Registration",
      playerCount: "Number of Players",
      startRegistration: "Start Registration",
      playerInfo: "Player Information",
      name: "Name",
      next: "Next",
      instructions: {
        title: "Game Instructions",
        steps: [
          { title: "Get Your Equipment", description: "Go to the reception desk to get your putter and ball" },
          { title: "Playing Rules", description: "Make sure to hit the ball gently and aim for the target" },
          { title: "Score Keeping", description: "Record the number of strokes it takes to get the ball in each hole" },
          { title: "End Game", description: "After finishing, return the equipment to the reception desk" }
        ],
        startPlaying: "Start Playing"
      },
      scoreSheet: {
        title: "Score Sheet",
        hole: "Hole",
        total: "Total",
        showResults: "Show Results"
      },
      results: {
        title: "Final Results",
        podium: "Podium",
        rank: "Rank",
        points: "Points"
      }
    }
  };

  const t = translations[language];

  const handleStartRegistration = async () => {
    const id = await createGame({ playerCount });
    setGameId(id);
    setPlayers(Array(playerCount).fill({ name: '' }));
  };

  const updatePlayer = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = { name };
    setPlayers(newPlayers);
  };

  const handleSubmit = async () => {
    if (!gameId) return;
    for (const player of players) {
      await addPlayer({ name: player.name, gameId: gameId });
    }
    setShowInstructions(true);
  };

  const isFormValid = () => players.every(player => player.name.trim() !== '');

  const updateScore = (playerIndex: number, holeIndex: number, value: string) => {
    const numValue = parseInt(value) || 0;
    setScores(prev => {
      const newScores = { ...prev };
      if (!newScores[playerIndex]) {
        newScores[playerIndex] = { holes: Array(18).fill(0), total: 0 };
      }
      newScores[playerIndex].holes[holeIndex] = numValue;
      newScores[playerIndex].total = newScores[playerIndex].holes.reduce((a, b) => a + b, 0);
      return newScores;
    });
  };

  const calculateRankings = () => {
    return Object.entries(scores)
      .map(([playerIndex, score]) => ({
        playerName: players[parseInt(playerIndex)]?.name || "",
        total: score.total
      }))
      .sort((a, b) => a.total - b.total);
  };

  const languageButton = showLanguageButton && (
    <button
      onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
      className="fixed top-4 right-8 px-6 py-3 bg-[#744430] text-[#fff8e8] rounded-lg text-lg hover:bg-[#8b5440] transition-all z-50"
      style={{
        direction: language === 'ar' ? 'rtl' : 'ltr',
        opacity: showLanguageButton ? 1 : 0,
        transform: showLanguageButton ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'opacity 0.3s ease, transform 0.3s ease'
      }}
    >
      {language === 'ar' ? 'English' : 'عربي'}
    </button>
  );

  if (showResults) {
    const rankings = calculateRankings();
    return (
      <div className="min-h-screen bg-[#fff8e8] p-8 flex flex-col items-center">
        {languageButton}
        <div className="w-48 h-48 bg-[#744430] rounded-lg p-2 mb-8">
          <img
            src="https://i.imgur.com/6odZE0O.png"
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-4xl font-bold text-[#744430] mb-12 text-center">{t.results.title}</h1>
        <div className="flex justify-center items-end mb-12 gap-4 w-full max-w-2xl">
          {rankings[1] && (
            <div className="flex flex-col items-center w-1/3">
              <div className="text-3xl mb-2">🥈</div>
              <div className="bg-[#ddbb6b] text-[#744430] rounded-lg px-4 py-2 font-bold shadow-lg">{rankings[1].playerName}</div>
              <div className="mt-2 text-[#744430]">{t.results.points}: {rankings[1].total}</div>
              <div className="mt-2 font-bold">{t.results.rank} 2</div>
            </div>
          )}
          {rankings[0] && (
            <div className="flex flex-col items-center w-1/3">
              <div className="text-5xl mb-2">🏆</div>
              <div className="bg-[#744430] text-[#fff8e8] rounded-lg px-6 py-3 font-bold shadow-2xl text-2xl">{rankings[0].playerName}</div>
              <div className="mt-2 text-[#744430] font-bold">{t.results.points}: {rankings[0].total}</div>
              <div className="mt-2 font-bold">{t.results.rank} 1</div>
            </div>
          )}
          {rankings[2] && (
            <div className="flex flex-col items-center w-1/3">
              <div className="text-2xl mb-2">🥉</div>
              <div className="bg-[#ddbb6b] text-[#744430] rounded-lg px-4 py-2 font-bold shadow-lg">{rankings[2].playerName}</div>
              <div className="mt-2 text-[#744430]">{t.results.points}: {rankings[2].total}</div>
              <div className="mt-2 font-bold">{t.results.rank} 3</div>
            </div>
          )}
        </div>
        {rankings.length > 3 && (
          <div className="w-full max-w-xl mt-8">
            <h2 className="text-2xl font-bold text-[#744430] mb-4 text-center">{t.results.podium}</h2>
            <div className="space-y-2">
              {rankings.slice(3).map((r, idx) => (
                <div key={idx} className="flex justify-between bg-white rounded-lg px-4 py-2 shadow">
                  <span className="font-bold text-[#744430]">{t.results.rank} {idx + 4}</span>
                  <span className="text-[#744430]">{r.playerName}</span>
                  <span className="text-[#744430]">{t.results.points}: {r.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (showScoreSheet) {
    return (
      <div className="min-h-screen bg-[#fff8e8] p-8">
        <div className="max-w-7xl mx-auto">
          {languageButton}
          <h1 className="text-4xl font-bold text-[#744430] mb-12 text-center">{t.scoreSheet.title}</h1>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-lg">
              <thead className="bg-[#744430] text-[#fff8e8]">
                <tr>
                  <th className="px-2 py-2 w-16">{t.scoreSheet.hole}</th>
                  {players.map((player, index) => (
                    <th key={index} className="px-2 py-2 w-24">{player.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 18 }, (_, holeIndex) => (
                  <tr key={holeIndex} className="border-b border-[#744430]">
                    <td className="px-2 py-2 font-medium bg-[#744430] text-[#fff8e8] text-center w-16">{holeIndex + 1}</td>
                    {players.map((_, playerIndex) => (
                      <td key={playerIndex} className="px-2 py-2 border-r border-[#744430] w-24">
                        <input
                          type="number"
                          min="1"
                          className="w-10 h-10 text-center border-2 border-[#744430] rounded-lg"
                          value={scores[playerIndex]?.holes[holeIndex] || ''}
                          onChange={(e) => updateScore(playerIndex, holeIndex, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-[#744430] text-[#fff8e8]">
                  <td className="px-2 py-2 font-bold text-center w-16">{t.scoreSheet.total}</td>
                  {players.map((_, playerIndex) => (
                    <td key={playerIndex} className="px-2 py-2 font-bold text-center w-24">
                      {scores[playerIndex]?.total || 0}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <button
            onClick={() => setShowResults(true)}
            className="mt-8 w-full py-4 bg-[#744430] text-[#fff8e8] rounded-lg text-xl font-bold hover:bg-[#8b5440] transition-colors"
          >
            {t.scoreSheet.showResults}
          </button>
        </div>
      </div>
    );
  }

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-[#fff8e8] p-8">
        <div className="max-w-4xl mx-auto">
          {languageButton}
          <h1 className="text-5xl font-bold text-[#744430] mb-16 text-center">{t.instructions.title}</h1>
          <div className="mb-16">
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <img
                src="https://i.imgur.com/0oFVVpq.png"
                alt="Mini Golf Instructions"
                className="w-full rounded-xl shadow-md hover:shadow-lg transition-shadow"
              />
            </div>
          </div>
          <div className="grid gap-8">
            {t.instructions.steps.map((step, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#744430] rounded-full flex items-center justify-center">
                    <span className="text-[#fff8e8] text-2xl font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#744430] mb-3">{step.title}</h3>
                    <p className="text-[#744430] text-lg leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowScoreSheet(true)}
            className="mt-16 w-full py-6 bg-[#744430] text-[#fff8e8] rounded-xl text-2xl font-bold hover:bg-[#8b5440] transition-all hover:shadow-lg transform hover:-translate-y-1"
          >
            {t.instructions.startPlaying}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#fff8e8] p-8"
      style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
    >
      <div className="mb-8">{languageButton}</div>
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center">
          <div className="w-48 h-48 bg-[#744430] rounded-lg p-2 mb-8">
            <img
              src="https://i.imgur.com/6odZE0O.png"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        {!gameId ? (
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold text-[#744430] mb-8 text-center">{t.title}</h1>
            <div className="bg-[#fff8e8] p-6 rounded-lg border-2 border-[#744430]">
              <label className="block mb-6">
                <span className="text-[#744430] text-xl font-medium block mb-2">{t.playerCount}</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={playerCount}
                  onChange={(e) => setPlayerCount(Number(e.target.value))}
                  className="block w-full px-4 py-2 rounded-lg border-2 border-[#744430] focus:border-[#744430] focus:outline-none text-lg bg-white"
                />
              </label>
              <button
                onClick={handleStartRegistration}
                className="w-full py-3 bg-[#744430] text-[#fff8e8] rounded-lg text-lg font-semibold hover:bg-[#8b5440] transition-colors"
              >
                {t.startRegistration}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {players.map((player, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-[#744430] mb-4">
                  {t.playerInfo} {index + 1}
                </h2>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-[#744430] text-lg font-medium block mb-1">{t.name}</span>
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => updatePlayer(index, e.target.value)}
                      className="block w-full px-4 py-2 rounded-lg border-2 border-[#744430] focus:border-[#744430] focus:outline-none"
                      required
                    />
                  </label>
                </div>
              </div>
            ))}
            <button
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className="w-full py-3 bg-[#744430] text-[#fff8e8] rounded-lg text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#8b5440] transition-colors"
            >
              {t.next}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}