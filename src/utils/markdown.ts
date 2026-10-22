import { Workout } from '../data/workouts';

export interface SetRecord {
  reps: string;
  load: string;
}

export interface ExerciseRecord {
  exerciseName: string;
  plannedSets: number;
  plannedReps: string;
  sets: SetRecord[];
  notes: string;
}

export interface SessionData {
  workout: Workout;
  startTime: Date;
  endTime: Date;
  records: ExerciseRecord[];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function dateSlug(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function generateMarkdown(session: SessionData): string {
  const { workout, startTime, endTime, records } = session;
  const dateStr = formatDate(endTime);
  const startStr = formatTime(startTime);
  const endStr = formatTime(endTime);

  let md = `# TreinoLog — ${workout.name}\n\n`;
  md += `**Data de finalização:** ${dateStr}\n\n`;
  md += `**Horário de início:** ${startStr} | **Término:** ${endStr}\n\n`;
  md += `**Treino:** ${workout.name}\n\n`;
  md += `**Descrição:** ${workout.description}\n\n`;
  md += `**Grupo muscular:** ${workout.group}\n\n`;
  md += `---\n\n`;
  md += `## Registro de séries\n\n`;
  md += `| Exercício | Séries planejadas | Repetições realizadas | Carga | Observações |\n`;
  md += `| --- | ---: | --- | --- | --- |\n`;

  for (const rec of records) {
    const repsStr = rec.sets
      .map((s, i) => `S${i + 1}: ${s.reps || '—'}`)
      .join(' · ');
    const loadStr = rec.sets
      .filter(s => s.load)
      .map(s => s.load)
      .pop() || '—';
    const loadFormatted = loadStr !== '—' ? `${loadStr} kg` : '—';
    const notes = rec.notes || '—';
    md += `| ${rec.exerciseName} | ${rec.plannedSets} × ${rec.plannedReps} | ${repsStr} | ${loadFormatted} | ${notes} |\n`;
  }

  md += `\n---\n\n`;
  md += `## Orientações para a próxima sessão\n\n`;
  md += `- Compare carga, repetições e técnica com esta sessão.\n`;
  md += `- Quando atingir o topo da faixa de repetições em todas as séries, aumente a carga gradualmente (2,5–5 kg).\n`;
  md += `- Priorize a técnica antes de aumentar peso.\n`;
  md += `- Interrompa o exercício em caso de dor aguda.\n\n`;
  md += `---\n\n`;
  md += `*Arquivo gerado localmente pelo TreinoLog em ${dateStr} às ${endStr}.*\n\n`;
  md += `> ⚠️ Os dados não foram salvos no navegador. Este arquivo é o único registro desta sessão.\n`;

  return md;
}

export function downloadMarkdown(session: SessionData): void {
  const md = generateMarkdown(session);
  const slug = dateSlug(session.endTime);
  const filename = `treinolog-${session.workout.id.toLowerCase()}-${slug}.md`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
