import Link from "next/link";
import styles from './styles/home.module.css';
import { dmSans } from './fonts';

export default function Home() {
  // Add your prototypes to this array
  const prototypes = [
    {
      title: 'Getting started',
      description: 'How to create a prototype',
      path: '/prototypes/example'
    },
    {
      title: 'Confetti button',
      description: 'An interactive button that creates a colorful confetti explosion',
      path: '/prototypes/confetti-button'
    },
    {
      title: 'Synthwave Calculator',
      description: 'A calculator with retro synthwave aesthetics, featuring neon glows and smooth animations',
      path: '/prototypes/synthwave-calculator'
    },
    {
      title: 'T.E. Piano',
      description: 'Digital piano interface inspired by Teenage Engineering design with clean minimalist aesthetics',
      path: '/prototypes/synthwave-piano'
    },
    // Add your new prototypes here like this:
    // {
    //   title: 'Your new prototype',
    //   description: 'A short description of what this prototype does',
    //   path: '/prototypes/my-new-prototype'
    // },
  ];

  return (
    <div className={`${styles.container} ${dmSans.className}`}>
      <header className={styles.header}>
        <h1>Justin's prototypes</h1>
      </header>

      <main>
        <section className={styles.grid}>
          {/* Goes through the prototypes list (array) to create cards */}
          {prototypes.map((prototype, index) => (
            <Link 
              key={index}
              href={prototype.path} 
              className={styles.card}
            >
              <h3>{prototype.title}</h3>
              <p>{prototype.description}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
