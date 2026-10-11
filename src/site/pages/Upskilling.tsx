import { listLearningLog, listSkills } from '../../lib/api';
import type { Skill } from '../../lib/types';
import { useAsync, useTitle } from '../hooks';
import { LearningGrid, Loading, PageHeader } from '../components/Bits';
import { ArrowUpRight } from '../components/Icons';

const DAYS = 180;

export function Upskilling() {
  useTitle('Upskilling');
  const { data: log } = useAsync(() => listLearningLog(DAYS), []);
  const { data: skills, loading } = useAsync(listSkills, []);
  const learning = skills?.filter((s) => s.status === 'learning') ?? [];
  const done = skills?.filter((s) => s.status === 'done') ?? [];
  const totalMinutes = (log ?? []).reduce((sum, e) => sum + e.minutes, 0);

  return (
    <>
      <PageHeader eyebrow="02 / Learning" title="Upskilling" intro="What I’m learning right now, and how — logged one day at a time." />

      <section aria-labelledby="log-heading" className="flex flex-col gap-6 rounded-[36px] bg-ink p-6 text-white sm:p-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="log-heading" className="m-0 text-[36px] leading-none font-extrabold tracking-[-0.04em]">
            Learning log
          </h2>
          <span className="font-mono text-[13px] text-ash">
            {log?.length ?? 0} days · {Math.round(totalMinutes / 60)} hours in the last {DAYS} days
          </span>
        </div>
        <LearningGrid entries={log ?? []} days={DAYS} columns={30} />
        <div className="flex items-center gap-2 font-mono text-xs text-ash" aria-hidden="true">
          Less
          {[0, 0.45, 0.65, 0.85, 1].map((o) => (
            <span key={o} className="size-3 rounded-[3px] bg-coal">
              {o > 0 && <span className="block size-full rounded-[3px] bg-cobalt" style={{ opacity: o }} />}
            </span>
          ))}
          More
        </div>
      </section>

      {loading ? (
        <Loading />
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <SkillList title="Now learning" skills={learning} empty="Nothing in progress right now." />
          <SkillList title="Done" skills={done} empty="Finished courses and skills will show up here." />
        </div>
      )}
    </>
  );
}

function SkillList({ title, skills, empty }: { title: string; skills: Skill[]; empty: string }) {
  return (
    <section className="flex flex-col gap-2 rounded-[32px] bg-white p-7">
      <h2 className="m-0 mb-2 text-2xl font-bold tracking-[-0.02em]">{title}</h2>
      {skills.length === 0 && <p className="m-0 border-t border-line pt-4 text-muted">{empty}</p>}
      {skills.map((s) => (
        <div key={s.id} className="flex flex-col gap-1.5 border-t border-line py-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-lg font-semibold tracking-[-0.01em]">{s.name}</span>
            <span className="shrink-0 rounded-full bg-paper px-3 py-1 font-mono text-xs text-muted capitalize">{s.kind}</span>
          </div>
          {s.note && <p className="m-0 leading-relaxed text-muted">{s.note}</p>}
          {s.link && (
            <a href={s.link} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-1 py-1 text-sm font-semibold text-cobalt">
              View <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      ))}
    </section>
  );
}
