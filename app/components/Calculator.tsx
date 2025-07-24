'use client';

import { useState } from 'react';
import styles from './Calculator.module.css';
import { dmSans } from '../fonts';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const formatNumber = (num: string) => {
    // Handle error message
    if (num === 'Error') return num;

    // Split number into integer and decimal parts
    const [integerPart, decimalPart] = num.split('.');
    
    // Format integer part with commas
    const formattedInteger = parseInt(integerPart).toLocaleString('en-US');
    
    // Return formatted number with decimal part if it exists
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  const handleNumber = (num: string) => {
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    // Remove commas before storing in equation
    const cleanDisplay = display.replace(/,/g, '');
    setEquation(cleanDisplay + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleEqual = () => {
    try {
      // Remove commas before evaluation
      const cleanDisplay = display.replace(/,/g, '');
      const cleanEquation = equation.replace(/,/g, '');
      const result = eval(cleanEquation + cleanDisplay);
      setDisplay(String(result));
      setEquation('');
    } catch (error) {
      setDisplay('Error');
      setEquation('');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  return (
    <div className={`${styles.calculator} ${dmSans.className}`}>
      <div className={styles.screen}>
        <div className={styles.equation}>{equation}</div>
        <div className={styles.display}>{formatNumber(display)}</div>
      </div>
      <div className={styles.buttons}>
        {/* Row 1 */}
        <button className={`${styles.button} ${styles.clear}`} onClick={handleClear}>
          <span>AC</span>
        </button>
        <button className={`${styles.button} ${styles.operator}`} onClick={() => handleOperator('/')}>
          <span>/</span>
        </button>
        <button className={`${styles.button} ${styles.operator}`} onClick={() => handleOperator('*')}>
          <span>×</span>
        </button>
        <button className={`${styles.button} ${styles.operator}`} onClick={() => handleOperator('-')}>
          <span>-</span>
        </button>

        {/* Row 2 */}
        <button className={styles.button} onClick={() => handleNumber('7')}>
          <span>7</span>
        </button>
        <button className={styles.button} onClick={() => handleNumber('8')}>
          <span>8</span>
        </button>
        <button className={styles.button} onClick={() => handleNumber('9')}>
          <span>9</span>
        </button>
        <button className={`${styles.button} ${styles.operator}`} onClick={() => handleOperator('+')}>
          <span>+</span>
        </button>

        {/* Row 3 */}
        <button className={styles.button} onClick={() => handleNumber('4')}>
          <span>4</span>
        </button>
        <button className={styles.button} onClick={() => handleNumber('5')}>
          <span>5</span>
        </button>
        <button className={styles.button} onClick={() => handleNumber('6')}>
          <span>6</span>
        </button>
        <button className={`${styles.button} ${styles.equal}`} onClick={handleEqual}>
          <span>=</span>
        </button>

        {/* Row 4 */}
        <button className={styles.button} onClick={() => handleNumber('1')}>
          <span>1</span>
        </button>
        <button className={styles.button} onClick={() => handleNumber('2')}>
          <span>2</span>
        </button>
        <button className={styles.button} onClick={() => handleNumber('3')}>
          <span>3</span>
        </button>

        {/* Row 5 - Bottom Row */}
        <button className={`${styles.button} ${styles.zero}`} onClick={() => handleNumber('0')}>
          <span>0</span>
        </button>
        <button className={styles.button} onClick={() => handleNumber('.')}>
          <span>.</span>
        </button>
      </div>
    </div>
  );
} 