import { useState, useEffect, useRef } from 'react';
import { workouts, weeklySchedule, getTodayWorkout, getDayName, Workout } from './data/workouts';
import { ExerciseRecord, SessionData, downloadMarkdown } from './utils/markdown';

type Screen = 'home' | 'overview' | 'session';

const colorMap = {
  coral: { bg: 'bg-[#FEF3F2]', border: 'border-[#F97066]', text: 'text-[#F97066]', btn: 'bg-[#F97066] hover:bg-[#E85D53]', badge: 'bg-[#F97066] text-white' },
  blue: { bg: 'bg-[#EFF6FF]', border: 'border-[#3B82F6]', text: 'text-[#3B82F6]', btn: 'bg-[#3B82F6] hover:bg-[#2563EB]', badge: 'bg-[#3B82F6] text-white' },
  amber: { bg: 'bg-[#FFFBEB]', border: 'border-[#F59E0B]', text: 'text-[#F59E0B]', btn: 'bg-[#F59E0B] hover:bg-[#D97706]', badge: 'bg-[#F59E0B] text-white' },
  violet: { bg: 'bg-[#F5F3FF]', border: 'border-[#8B5CF6]', text: 'text-[#8B5CF6]', btn: 'bg-[#8B5CF6] hover:bg-[#7C3AED]', badge: 'bg-[#8B5CF6] text-white' },
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [sessionRecords, setSessionRecords] = useState<ExerciseRecord[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(0);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInitial, setTimerInitial] = useState(90);
  const [timerFinished, setTimerFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            setTimerFinished(true);
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200, 100, 200]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timerSeconds]);

  const startTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setTimerInitial(seconds);
    setTimerRunning(true);
    setTimerFinished(false);
  };

  const pauseTimer = () => setTimerRunning(false);
  const resumeTimer = () => { if (timerSeconds > 0) setTimerRunning(true); };
  const resetTimer = () => { setTimerSeconds(timerInitial); setTimerRunning(false); setTimerFinished(false); };
  const clearTimer = () => { setTimerSeconds(90); setTimerInitial(90); setTimerRunning(false); setTimerFinished(false); };

  const formatTimerDisplay = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const startSession = (workout: Workout) => {
    setSelectedWorkout(workout);
    setSessionStartTime(new Date());
    setSessionRecords(
      workout.exercises.map(ex => ({
        exerciseName: ex.name,
        plannedSets: ex.sets,
        plannedReps: ex.repRange,
        sets: Array.from({ length: ex.sets }, () => ({ reps: '', load: '' })),
        notes: '',
      }))
    );
    setExpandedExercise(0);
    setScreen('session');
  };

  const updateSetRecord = (exIdx: number, setIdx: number, field: 'reps' | 'load', value: string) => {
    setSessionRecords(prev => {
      const next = [...prev];
      const sets = [...next[exIdx].sets];
      sets[setIdx] = { ...sets[setIdx], [field]: value };
      next[exIdx] = { ...next[exIdx], sets };
      return next;
    });
  };

  const updateNotes = (exIdx: number, value: string) => {
    setSessionRecords(prev => {
      const next = [...prev];
      next[exIdx] = { ...next[exIdx], notes: value };
      return next;
    });
  };

  const isExerciseComplete = (rec: ExerciseRecord) => {
    return rec.sets.every(s => s.reps.trim() !== '');
  };

  const completedExercises = sessionRecords.filter(isExerciseComplete).length;
  const totalSets = sessionRecords.reduce((acc, r) => acc + r.sets.length, 0);
  const filledSets = sessionRecords.reduce((acc, r) => acc + r.sets.filter(s => s.reps.trim() !== '').length, 0);
  const progressPercent = totalSets > 0 ? Math.round((filledSets / totalSets) * 100) : 0;

  const finishSession = () => {
    if (!selectedWorkout || !sessionStartTime) return;
    const session: SessionData = {
      workout: selectedWorkout,
      startTime: sessionStartTime,
      endTime: new Date(),
      records: sessionRecords,
    };
    downloadMarkdown(session);
  };

  const todayWorkout = getTodayWorkout();
  const todayDayName = getDayName();
  const todaySchedule = weeklySchedule.find(s => {
    const dayMap: Record<number, string> = { 0: 'Domingo', 1: 'Segunda', 2: 'Terça', 3: 'Quarta', 4: 'Quinta', 5: 'Sexta', 6: 'Sábado' };
    return s.day === dayMap[new Date().getDay()];
  });

  // ============ HOME SCREEN ============
  if (screen === 'home') {
    return (
      <div className="min-h-screen min-h-[100dvh] max-w-lg mx-auto px-4 py-6 pb-20">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tight text-[#1A1A1A]">
            Treino<span className="text-[#F97066]">Log</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-[#4A4A4A] italic">
            &ldquo;Treine com intenção. Registre a evolução.&rdquo;
          </p>
          <p className="mt-1 text-xs uppercase tracking-wider text-[#888]">
            Hipertrofia iniciante
          </p>
        </header>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
          <p className="text-xs text-amber-800 leading-relaxed">
            ⚠️ Os registros não são salvos no navegador. Baixe o arquivo Markdown ao finalizar a sessão para não perder os dados.
          </p>
        </div>

        {/* Today card */}
        <div className="bg-white border-2 border-[#F97066] rounded-2xl p-4 mb-6 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-[#888] font-semibold mb-1">Hoje</p>
          <p className="text-lg font-bold text-[#1A1A1A]">{todayDayName}</p>
          {todayWorkout ? (
            <>
              <p className={`text-sm font-semibold mt-1 ${colorMap[todayWorkout.color].text}`}>
                {todayWorkout.name}
              </p>
              <p className="text-xs text-[#4A4A4A] mt-1">{todayWorkout.group}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-[#4A4A4A]">
                <span>🕐 11:40–12:30</span>
                <span>⏱ ~50 min</span>
              </div>
              <button
                onClick={() => { setSelectedWorkout(todayWorkout); setScreen('overview'); }}
                className="mt-4 w-full py-3 rounded-xl bg-[#F97066] hover:bg-[#E85D53] text-white font-bold text-sm transition-colors active:scale-[0.98]"
              >
                Começar treino
              </button>
            </>
          ) : (
            <div>
              <p className="text-sm text-[#4A4A4A] mt-1">
                {todaySchedule?.label || 'Dia de descanso da musculação'}
              </p>
              {todaySchedule?.type === 'recuperacao' && (
                <p className="text-xs text-[#888] mt-2">
                  Sugestão: alongamento leve, mobilidade articular ou caminhada curta.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Weekly schedule */}
        <section className="mb-6">
          <h2 className="text-xs uppercase tracking-widest text-[#888] font-semibold mb-3">Rotina semanal</h2>
          <div className="grid grid-cols-2 gap-2">
            {weeklySchedule.map((s, i) => {
              const isToday = s.day === todaySchedule?.day;
              const workout = s.workoutId ? workouts.find(w => w.id === s.workoutId) : null;
              const colors = workout ? colorMap[workout.color] : null;
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (workout) { setSelectedWorkout(workout); setScreen('overview'); }
                  }}
                  disabled={!workout}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    isToday
                      ? `${colors?.border} ${colors?.bg} shadow-sm`
                      : 'border-[#E5E5E0] bg-white'
                  } ${workout ? 'active:scale-[0.97]' : 'opacity-60'}`}
                >
                  <p className="text-[10px] uppercase tracking-wider text-[#888] font-semibold">{s.day}</p>
                  <p className={`text-xs font-bold mt-0.5 ${isToday && colors ? colors.text : 'text-[#1A1A1A]'}`}>
                    {s.label}
                  </p>
                  {isToday && (
                    <span className="inline-block mt-1 text-[9px] uppercase tracking-wider bg-[#F97066] text-white px-1.5 py-0.5 rounded-full font-semibold">
                      Hoje
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Weekly routine summary */}
        <section className="mb-6">
          <h2 className="text-xs uppercase tracking-widest text-[#888] font-semibold mb-3">Resumo da rotina</h2>
          <div className="bg-white border border-[#E5E5E0] rounded-xl p-4 space-y-2 text-xs text-[#4A4A4A]">
            <p><span className="font-semibold text-[#1A1A1A]">🏋️ Academia:</span> Seg–Sex, 11:40–12:30 (~50 min)</p>
            <p><span className="font-semibold text-[#1A1A1A]">💼 Trabalho:</span> Seg–Sex 07:30–11:30 / 13:00–17:00</p>
            <p><span className="font-semibold text-[#1A1A1A]">📚 Estudos:</span> Seg–Sáb 18:30–21:30</p>
            <p><span className="font-semibold text-[#1A1A1A]">😴 Sono:</span> ~23:00 às 06:00 (7h)</p>
            <p><span className="font-semibold text-[#1A1A1A]">🎌 Lazer:</span> Animes nos intervalos livres</p>
          </div>
        </section>

        {/* Safety notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
          <p className="text-[11px] text-[#666] leading-relaxed">
            💡 Este aplicativo não substitui avaliação profissional. Priorize a técnica correta e interrompa qualquer exercício em caso de dor aguda. Não é necessário treinar até a falha.
          </p>
        </div>
      </div>
    );
  }

  // ============ OVERVIEW SCREEN ============
  if (screen === 'overview' && selectedWorkout) {
    const colors = colorMap[selectedWorkout.color];
    const totalExSets = selectedWorkout.exercises.reduce((a, e) => a + e.sets, 0);

    return (
      <div className="min-h-screen min-h-[100dvh] max-w-lg mx-auto px-4 py-6 pb-20">
        {/* Back */}
        <button
          onClick={() => setScreen('home')}
          className="text-sm text-[#888] hover:text-[#1A1A1A] mb-4 flex items-center gap-1 active:scale-95"
        >
          ← Voltar
        </button>

        {/* Header */}
        <div className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-4 mb-4`}>
          <p className="text-[10px] uppercase tracking-widest text-[#888] font-semibold">{selectedWorkout.day}</p>
          <h1 className={`text-xl font-black mt-1 ${colors.text}`}>{selectedWorkout.name}</h1>
          <p className="text-xs text-[#4A4A4A] mt-1">{selectedWorkout.description}</p>
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-[#4A4A4A]">
            <span>🎯 {selectedWorkout.group}</span>
            <span>📊 {totalExSets} séries</span>
            <span>⏱ ~50 min</span>
          </div>
        </div>

        {/* Exercise list */}
        <h2 className="text-xs uppercase tracking-widest text-[#888] font-semibold mb-3">Exercícios</h2>
        <div className="space-y-2 mb-6">
          {selectedWorkout.exercises.map((ex, i) => (
            <div key={i} className="bg-white border border-[#E5E5E0] rounded-xl p-3">
              <div className="flex justify-between items-start gap-2">
                <p className="text-sm font-bold text-[#1A1A1A] flex-1 min-w-0">{ex.name}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${colors.badge}`}>
                  {ex.sets}×{ex.repRange}
                </span>
              </div>
              <div className="flex gap-3 mt-2 text-[11px] text-[#666]">
                <span>⏱ Descanso: {ex.rest || 60}s</span>
              </div>
              {ex.tip && (
                <p className="text-[11px] text-[#888] mt-1 italic">💡 {ex.tip}</p>
              )}
            </div>
          ))}
        </div>

        {/* Start button */}
        <button
          onClick={() => startSession(selectedWorkout)}
          className={`w-full py-4 rounded-xl ${colors.btn} text-white font-bold text-base transition-colors active:scale-[0.98] shadow-sm`}
        >
          Registrar este treino
        </button>
      </div>
    );
  }

  // ============ SESSION SCREEN ============
  if (screen === 'session' && selectedWorkout) {
    const colors = colorMap[selectedWorkout.color];

    return (
      <div className="min-h-screen min-h-[100dvh] max-w-lg mx-auto px-4 py-4 pb-36">
        {/* Session header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => { if (confirm('Sair do treino? Os dados serão perdidos.')) setScreen('home'); }}
            className="text-xs text-[#888] active:scale-95"
          >
            ← Sair
          </button>
          <p className={`text-xs font-bold ${colors.text}`}>{selectedWorkout.name}</p>
        </div>

        {/* Progress */}
        <div className="bg-white border border-[#E5E5E0] rounded-xl p-3 mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#888]">Progresso</span>
            <span className="font-bold text-[#1A1A1A]">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${colors.btn.replace('hover:', '')}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#888] mt-1">
            <span>{completedExercises}/{sessionRecords.length} exercícios</span>
            <span>{filledSets}/{totalSets} séries</span>
          </div>
        </div>

        {/* Timer */}
        <div className={`rounded-xl p-3 mb-4 border-2 ${timerFinished ? 'border-red-400 bg-red-50 timer-finished' : 'border-[#E5E5E0] bg-white'}`}>
          <p className="text-[10px] uppercase tracking-widest text-[#888] font-semibold mb-1">Temporizador</p>
          <div className="flex items-center justify-between gap-2">
            <span className={`text-3xl font-black tabular-nums ${timerFinished ? 'text-red-500' : 'text-[#1A1A1A]'}`}>
              {formatTimerDisplay(timerSeconds)}
            </span>
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={() => startTimer(60)} className="px-2 py-1 text-[10px] font-bold rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95">60s</button>
              <button onClick={() => startTimer(90)} className="px-2 py-1 text-[10px] font-bold rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95">90s</button>
              <button onClick={() => startTimer(120)} className="px-2 py-1 text-[10px] font-bold rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95">120s</button>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            {!timerRunning ? (
              <button onClick={timerSeconds > 0 && timerSeconds < timerInitial ? resumeTimer : () => startTimer(timerInitial)} className="flex-1 py-2 rounded-lg bg-green-500 text-white text-xs font-bold active:scale-95">
                {timerSeconds > 0 && timerSeconds < timerInitial ? '▶ Continuar' : '▶ Iniciar'}
              </button>
            ) : (
              <button onClick={pauseTimer} className="flex-1 py-2 rounded-lg bg-yellow-500 text-white text-xs font-bold active:scale-95">
                ⏸ Pausar
              </button>
            )}
            <button onClick={resetTimer} className="px-3 py-2 rounded-lg bg-gray-200 text-xs font-bold active:scale-95">↺</button>
            <button onClick={clearTimer} className="px-3 py-2 rounded-lg bg-gray-200 text-xs font-bold active:scale-95">✕</button>
          </div>
          {timerFinished && (
            <p className="text-[10px] text-red-600 font-semibold mt-1">⏰ Descanso finalizado!</p>
          )}
        </div>

        {/* Exercises */}
        <div className="space-y-2 mb-6">
          {selectedWorkout.exercises.map((ex, exIdx) => {
            const rec = sessionRecords[exIdx];
            const complete = isExerciseComplete(rec);
            const isExpanded = expandedExercise === exIdx;

            return (
              <div
                key={exIdx}
                className={`rounded-xl border-2 overflow-hidden transition-all ${
                  complete ? 'border-green-300 bg-green-50' : `border-[#E5E5E0] bg-white`
                }`}
              >
                {/* Exercise header */}
                <button
                  onClick={() => setExpandedExercise(isExpanded ? null : exIdx)}
                  className="w-full p-3 flex items-center justify-between text-left active:bg-gray-50"
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-sm font-bold text-[#1A1A1A] truncate">{ex.name}</p>
                    <p className="text-[10px] text-[#888]">
                      {ex.sets} séries × {ex.repRange}
                      {complete && ' ✓ Concluído'}
                    </p>
                  </div>
                  <span className="text-lg text-[#888] flex-shrink-0">{isExpanded ? '▾' : '▸'}</span>
                </button>

                {/* Exercise details */}
                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-gray-100">
                    {ex.tip && (
                      <p className="text-[11px] text-[#888] italic mt-2 mb-2">💡 {ex.tip}</p>
                    )}

                    {/* Sets */}
                    {rec.sets.map((set, setIdx) => (
                      <div key={setIdx} className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-[#888] w-7 flex-shrink-0">S{setIdx + 1}</span>
                        <div className="flex-1 flex gap-2 min-w-0">
                          <div className="flex-1 min-w-0">
                            <label className="text-[9px] uppercase text-[#888] block">Reps</label>
                            <input
                              type="number"
                              min="0"
                              max="99"
                              inputMode="numeric"
                              value={set.reps}
                              onChange={(e) => updateSetRecord(exIdx, setIdx, 'reps', e.target.value)}
                              placeholder="—"
                              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#F97066] bg-white"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="text-[9px] uppercase text-[#888] block">Carga (kg)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              inputMode="decimal"
                              value={set.load}
                              onChange={(e) => updateSetRecord(exIdx, setIdx, 'load', e.target.value)}
                              placeholder="—"
                              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#F97066] bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Notes */}
                    <div className="mt-2">
                      <label className="text-[9px] uppercase text-[#888] block">Observações</label>
                      <input
                        type="text"
                        value={rec.notes}
                        onChange={(e) => updateNotes(exIdx, e.target.value)}
                        placeholder="Ex: boa execução, senti cansaço..."
                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#F97066] bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Finish button - fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 z-50">
          <div className="max-w-lg mx-auto">
            <button
              onClick={finishSession}
              className="w-full py-4 rounded-xl bg-[#1A1A1A] hover:bg-[#333] text-white font-bold text-sm transition-colors active:scale-[0.98]"
            >
              📥 Finalizar e baixar Markdown
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
