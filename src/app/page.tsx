import Spinner from '@/components/ui/Spinner';
import Avatar, { AvatarGroup } from '@/components/ui/Avatar';

export default function RootPage() {
  return (
    <main style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <section>
        <h2>Spinner</h2>
        <Spinner />
      </section>
      <section>
        <h2>Avatar — 기본</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Avatar size="s" />
          <Avatar size="m" />
          <Avatar size="l" />
          <Avatar src="https://i.pravatar.cc/150?img=1" alt="사용자1" size="s" />
          <Avatar src="https://i.pravatar.cc/150?img=1" alt="사용자1" size="m" />
          <Avatar src="https://i.pravatar.cc/150?img=1" alt="사용자1" size="l" />
        </div>
      </section>
      <section>
        <h2>AvatarGroup</h2>
        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '16px' }}>
          <AvatarGroup size="s">
            <Avatar />
            <Avatar />
          </AvatarGroup>
          <AvatarGroup size="s">
            <Avatar src="https://i.pravatar.cc/150?img=1" alt="사용자1" />
            <Avatar src="https://i.pravatar.cc/150?img=2" alt="사용자2" />
          </AvatarGroup>
          <AvatarGroup size="m">
            <Avatar src="https://i.pravatar.cc/150?img=1" alt="사용자1" />
            <Avatar src="https://i.pravatar.cc/150?img=2" alt="사용자2" />
          </AvatarGroup>
        </div>
      </section>
    </main>
  );
}
