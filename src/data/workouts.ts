export interface Exercise {
  name: string;
  sets: number;
  repRange: string;
  rest?: number; // seconds
  tip?: string;
}

export interface Workout {
  id: string;
  name: string;
  day: string;
  dayIndex: number; // 0=seg, 1=ter, etc.
  group: string;
  color: 'coral' | 'blue' | 'amber' | 'violet';
  description: string;
  exercises: Exercise[];
}

export const workouts: Workout[] = [
  {
    id: 'A',
    name: 'Treino A — Inferiores',
    day: 'Segunda-feira',
    dayIndex: 1,
    group: 'Membros inferiores e core',
    color: 'coral',
    description: 'Foco em quadríceps, posteriores de coxa, glúteos e panturrilhas, com trabalho de core ao final.',
    exercises: [
      { name: 'Leg press 45°', sets: 3, repRange: '8–12', rest: 90, tip: 'Pés na largura dos ombros, desça até 90° no joelho sem tirar o quadril do banco.' },
      { name: 'Mesa flexora', sets: 3, repRange: '10–15', rest: 60, tip: 'Controle a volta — não deixe o peso cair.' },
      { name: 'Cadeira extensora', sets: 2, repRange: '10–15', rest: 60, tip: 'Segure 1 segundo no topo com as pernas estendidas.' },
      { name: 'Hip thrust (elevação pélvica)', sets: 3, repRange: '8–12', rest: 90, tip: 'Aperte os glúteos no topo por 1 segundo.' },
      { name: 'Panturrilha sentado ou em pé', sets: 3, repRange: '12–20', rest: 60, tip: 'Amplitude completa — desça e suba todo o movimento.' },
      { name: 'Prancha', sets: 2, repRange: '30–45s', rest: 60, tip: 'Mantenha o corpo alinhado, sem elevar o quadril.' },
    ],
  },
  {
    id: 'B',
    name: 'Treino B — Superiores',
    day: 'Terça-feira',
    dayIndex: 2,
    group: 'Membros superiores (empurrar e puxar)',
    color: 'blue',
    description: 'Trabalho completo de peito, costas, ombros e braços com foco em empurrar e puxar.',
    exercises: [
      { name: 'Supino máquina ou supino com halteres', sets: 3, repRange: '8–12', rest: 90, tip: 'Cotovelos a 45° do tronco, não abra demais.' },
      { name: 'Puxada frontal na polia', sets: 3, repRange: '8–12', rest: 90, tip: 'Puxe até o peito, contraindo as escápulas.' },
      { name: 'Remada sentada na polia', sets: 3, repRange: '8–12', rest: 90, tip: 'Costas retas, puxe o cotovelo para trás.' },
      { name: 'Desenvolvimento de ombros na máquina', sets: 2, repRange: '8–12', rest: 60, tip: 'Não trave os cotovelos no topo.' },
      { name: 'Tríceps na polia com corda', sets: 2, repRange: '10–15', rest: 60, tip: 'Abra a corda no final do movimento.' },
      { name: 'Rosca direta ou rosca na máquina', sets: 2, repRange: '10–15', rest: 60, tip: 'Cotovelos fixos ao lado do corpo.' },
    ],
  },
  {
    id: 'C',
    name: 'Treino C — Inferiores',
    day: 'Quinta-feira',
    dayIndex: 4,
    group: 'Membros inferiores e core',
    color: 'amber',
    description: 'Ênfase em agachamento, posterior de coxa e glúteos com variação de exercícios.',
    exercises: [
      { name: 'Agachamento no Smith ou Goblet Squat', sets: 3, repRange: '8–12', rest: 90, tip: 'Desça até a coxa ficar paralela ao chão.' },
      { name: 'Levantamento terra romeno com halteres', sets: 3, repRange: '8–12', rest: 90, tip: 'Empurre o quadril para trás, mantenha os halteres próximos às pernas.' },
      { name: 'Cadeira flexora', sets: 2, repRange: '10–15', rest: 60, tip: 'Movimento controlado na volta.' },
      { name: 'Afundo guiado ou passada', sets: 2, repRange: '8–12 por perna', rest: 90, tip: 'Joelho da frente não ultrapassa o pé.' },
      { name: 'Panturrilha no leg press', sets: 3, repRange: '12–20', rest: 60, tip: 'Amplitude máxima — estenda e contraia.' },
      { name: 'Abdominal na máquina ou Dead Bug', sets: 2, repRange: '10–15', rest: 60, tip: 'Mantenha a lombar pressionada no chão.' },
    ],
  },
  {
    id: 'D',
    name: 'Treino D — Superiores',
    day: 'Sexta-feira',
    dayIndex: 5,
    group: 'Membros superiores (variação)',
    color: 'violet',
    description: 'Variação de empurrar e puxar com foco em ângulos diferentes para estímulo completo.',
    exercises: [
      { name: 'Supino inclinado com halteres ou máquina', sets: 3, repRange: '8–12', rest: 90, tip: 'Banco a 30–45°, foque na parte superior do peito.' },
      { name: 'Remada articulada ou remada com apoio no peito', sets: 3, repRange: '8–12', rest: 90, tip: 'Puxe os cotovelos para trás, contraindo as costas.' },
      { name: 'Puxada com pegada neutra', sets: 3, repRange: '8–12', rest: 90, tip: 'Palmas voltadas uma para a outra, puxe até o peito.' },
      { name: 'Crucifixo na máquina', sets: 2, repRange: '10–15', rest: 60, tip: 'Movimento controlado, sinta o peito alongar.' },
      { name: 'Elevação lateral', sets: 2, repRange: '12–15', rest: 60, tip: 'Peso leve, cotovelos levemente flexionados.' },
      { name: 'Tríceps na polia', sets: 2, repRange: '10–15', rest: 60, tip: 'Cotovelos fixos, estenda completamente.' },
      { name: 'Rosca martelo', sets: 2, repRange: '10–15', rest: 60, tip: 'Pegada neutra, sem balançar o corpo.' },
    ],
  },
];

export const weeklySchedule = [
  { day: 'Segunda', workoutId: 'A', label: 'Treino A', type: 'treino' as const },
  { day: 'Terça', workoutId: 'B', label: 'Treino B', type: 'treino' as const },
  { day: 'Quarta', workoutId: null, label: 'Recuperação / Mobilidade', type: 'recuperacao' as const },
  { day: 'Quinta', workoutId: 'C', label: 'Treino C', type: 'treino' as const },
  { day: 'Sexta', workoutId: 'D', label: 'Treino D', type: 'treino' as const },
  { day: 'Sábado', workoutId: null, label: 'Descanso', type: 'descanso' as const },
  { day: 'Domingo', workoutId: null, label: 'Descanso', type: 'descanso' as const },
];

export function getWorkoutById(id: string): Workout | undefined {
  return workouts.find(w => w.id === id);
}

export function getTodayWorkout(): Workout | null {
  const today = new Date().getDay(); // 0=dom, 1=seg...
  const dayMap: Record<number, string | null> = {
    1: 'A', 2: 'B', 3: null, 4: 'C', 5: 'D', 6: null, 0: null,
  };
  const id = dayMap[today];
  if (!id) return null;
  return getWorkoutById(id) || null;
}

export function getDayName(): string {
  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return days[new Date().getDay()];
}
