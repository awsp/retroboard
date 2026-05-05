import { Input } from '@/components/ui/input.tsx';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { Timer as TimerIcon } from 'lucide-react';

const START = 'Start';
const PAUSE = 'Pause';
const DEFAULT_TIME = '5';

interface TimerProps {
  socket: Socket | null;
}

interface TimerState {
  remainingTime: number;
  isRunning: boolean;
  hasStarted: boolean;
  initialDuration: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Timer = ({ socket }: TimerProps) => {
  const [time, setTime] = useState<string>(DEFAULT_TIME);
  const [timerState, setTimerState] = useState<TimerState>({
    remainingTime: 300,
    isRunning: false,
    hasStarted: false,
    initialDuration: 300,
  });
  const toastIdRef = useRef<string | number | undefined>(undefined);
  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.on('timer-state', (state: TimerState) => {
      setTimerState(state);

      // Update toast when timer is running
      if (state.isRunning) {
        if (toastIdRef.current) {
          toast.dismiss(toastIdRef.current);
        }

        toastIdRef.current = toast.custom(
          (t) => (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px]">
              <TimerIcon className="h-6 w-6 text-blue-500" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  Timer Running
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                  {formatTime(state.remainingTime)}
                </div>
              </div>
              <button
                onClick={() => toast.dismiss(t)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          ),
          {
            duration: Infinity,
            id: 'timer-toast',
          }
        );
      } else {
        // Dismiss toast when timer is paused or finished
        if (toastIdRef.current) {
          toast.dismiss(toastIdRef.current);
          toastIdRef.current = undefined;
        }

        // Show completion message if timer finished
        if (state.remainingTime === 0) {
          toast.success('Timer Complete!', {
            description: 'The countdown has finished.',
            duration: 5000,
          });
        }
      }
    });

    return () => {
      socket.off('timer-state');
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, [socket]);

  const toggle = () => {
    if (!socket) {
      return;
    }

    if (timerState.isRunning) {
      socket.emit('timer-pause');
    } else {
      socket.emit('timer-start');
    }
  };
  const reset = () => {
    if (!socket) return;
    socket.emit('timer-reset');
  };
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTime(value);

    // Only update server if not running and value is a valid number
    if (!timerState.isRunning && socket && value && !isNaN(Number(value))) {
      socket.emit('timer-set', Number(value));
    }
  };

  return (
    <div className="flex items-center gap-2">
      {timerState.hasStarted && (
        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold tabular-nums">
          <TimerIcon className="h-4 w-4" />
          {formatTime(timerState.remainingTime)}
        </div>
      )}
      <div className="flex items-center gap-1">
        <label htmlFor="input-time" className="text-sm text-muted-foreground">
          Time
        </label>
        <Input
          id="input-time"
          type="number"
          min="1"
          value={time}
          onChange={handleTimeChange}
          disabled={timerState.isRunning}
          className="w-16 h-8"
        />
        <span className="text-sm text-muted-foreground">min</span>
      </div>
      <Button onClick={toggle} size="sm">
        {timerState.isRunning ? PAUSE : START}
      </Button>
      <Button disabled={!timerState.hasStarted} onClick={reset} size="sm" variant="outline">
        Reset
      </Button>
    </div>
  );
};

export default Timer;
