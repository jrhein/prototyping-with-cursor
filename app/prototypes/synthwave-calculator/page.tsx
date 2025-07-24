import Calculator from '../../components/Calculator';
import styles from './styles.module.css';
import { dmSans } from '../../fonts';
import Link from 'next/link';

export default function SynthwaveCalculator() {
  return (
    <div className={`${styles.container} ${dmSans.className}`}>
      <Link href="/" className={styles.backButton}>
        <span>←</span>
        <span>Back</span>
      </Link>
      <h1>Synthwave Calculator</h1>
      <p className={styles.description}>A calculator with retro synthwave aesthetics, featuring neon glows and smooth animations.</p>
      <div className={styles.calculatorWrapper}>
        <Calculator />
      </div>
    </div>
  );
} 