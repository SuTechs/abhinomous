import { listMoments } from '../../lib/api';
import { useAsync, useTitle } from '../hooks';
import { Loading, Notice, PageHeader, Polaroid } from '../components/Bits';

export function Life() {
  useTitle('Life, lately');
  const { data: moments, error, loading } = useAsync(() => listMoments(), []);
  return (
    <>
      <PageHeader eyebrow="04 / Life" title="Life, lately" intro="Milestones, trips and the moments in between." />
      {loading && <Loading />}
      {error && <Notice>Couldn’t load moments right now. Please try again in a moment.</Notice>}
      {moments?.length === 0 && <Notice>No moments yet.</Notice>}
      {!!moments?.length && (
        <div className="grid grid-cols-1 gap-8 rounded-[36px] bg-mist p-6 min-[480px]:grid-cols-2 sm:p-10 lg:grid-cols-3 xl:grid-cols-4">
          {moments.map((m, i) => (
            <Polaroid key={m.id} moment={m} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
