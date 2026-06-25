import Spinner from '@/components/ui/Spinner';
import styles from './loading.module.scss';

export default function Loading() {
  return (
    <main className={styles.container}>
      <Spinner />
    </main>
  );
}
