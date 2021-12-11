import { useContext } from 'react';
import { TimerContext } from '../components/TimerContext';

export function useTimeLeft() {
  const { timeLeft } = useContext(TimerContext);
  return timeLeft;
}
