import React, {
  useState,
  useEffect,
  ReactChildren,
  ReactChild,
  useCallback
} from 'react';

interface ContextValue {
  setEndTime: (time: number) => void;
  timeLeft: number;
  getTimeLeft: () => number;
}

interface Props {
  children?: ReactChildren | ReactChild;
}

export const TimerContext = React.createContext<ContextValue>({
  setEndTime: () => null,
  timeLeft: 1000 * 60 * 60,
  getTimeLeft: () => 1000 * 60 * 60
});

export const TimerProvider = ({ children }: Props) => {
  const [endTime, setEndTime] = useState(0);

  const getTimeLeft = useCallback(() => {
    return Math.floor((endTime - Date.now()) / 1000);
  }, [endTime]);

  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    if (endTime != null) {
      setTimeLeft(getTimeLeft);
      const intervalId = setInterval(() => setTimeLeft(getTimeLeft), 1000);

      return () => clearTimeout(intervalId);
    }
  }, [endTime]);

  // console.log('time left: ', timeLeft);

  return (
    <TimerContext.Provider value={{ setEndTime, timeLeft, getTimeLeft }}>
      {children}
    </TimerContext.Provider>
  );
};
