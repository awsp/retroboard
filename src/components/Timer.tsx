import {Input} from '@/components/ui/input.tsx';
import React, {useEffect, useState} from 'react';
import {Button} from '@/components/ui/button.tsx';
import {Switch} from '@/components/ui/switch.tsx';
import {Socket} from 'socket.io-client';
import {toast} from 'sonner';
import {RotateCcw, Timer as TimerIcon} from 'lucide-react';
import confetti from 'canvas-confetti';

const DEFAULT_TIME = '5';
const URGENT_THRESHOLD_SECONDS = 15;
const POST_COMPLETION_PULSE_DURATION_MS = 5000;

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

const Timer = ({socket}: TimerProps) => {
  const [time, setTime] = useState<string>(DEFAULT_TIME);
  const [timerState, setTimerState] = useState<TimerState>({
    remainingTime: 300,
    isRunning: false,
    hasStarted: false,
    initialDuration: 300,
  });
  const [showPulse, setShowPulse] = useState<boolean>(false);

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {startVelocity: 30, spread: 360, ticks: 60, zIndex: 0};

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: {x: randomInRange(0.1, 0.3), y: Math.random() - 0.2},
      });
      confetti({
        ...defaults,
        particleCount,
        origin: {x: randomInRange(0.7, 0.9), y: Math.random() - 0.2},
      });
    }, 250);
  };

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.on('timer-state', (state: TimerState) => {
      console.log('Timer state received:', {
        remainingTime: state.remainingTime,
        isRunning: state.isRunning,
        hasStarted: state.hasStarted,
      });

      setTimerState((prevState) => {
        console.log('Previous state:', {
          remainingTime: prevState.remainingTime,
          isRunning: prevState.isRunning,
        });

        // Check if timer just stopped at zero (transition from running to stopped at 0)
        if (
            prevState.isRunning &&
            !state.isRunning &&
            state.remainingTime === 0
        ) {
          console.log('🎉 Timer complete! Triggering confetti...');
          triggerConfetti();
          toast.success('Timer Complete!', {
            description: 'The countdown has finished.',
            duration: 5000,
          });

          // Remove pulse effect after configured duration
          setTimeout(() => {
            setShowPulse(false);
          }, POST_COMPLETION_PULSE_DURATION_MS);
        }
        return state;
      });
    });

    return () => {
      socket.off('timer-state');
    };
  }, [socket]);

  const toggle = () => {
    if (!socket) {
      return;
    }

    if (timerState.isRunning) {
      socket.emit('timer-pause');
    } else {
      // If timer has completed (reached 0), reset it before starting
      if (timerState.remainingTime === 0) {
        const durationInMinutes = timerState.initialDuration / 60;
        socket.emit('timer-set', durationInMinutes);
      }
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

  const getTimerColor = () => {
    if (timerState.remainingTime <= URGENT_THRESHOLD_SECONDS) {
      return 'text-red-600 dark:text-red-400';
    }
    const percentRemaining =
        timerState.remainingTime / timerState.initialDuration;
    if (percentRemaining <= 0.5) {
      return 'text-orange-600 dark:text-orange-400';
    }
    return 'text-blue-600 dark:text-blue-400';
  };

  const isUrgent = timerState.remainingTime <= URGENT_THRESHOLD_SECONDS;

  // Enable pulse during urgent phase or when timer just completed
  useEffect(() => {
    if (isUrgent && timerState.isRunning) {
      setShowPulse(true);
    } else if (timerState.remainingTime > URGENT_THRESHOLD_SECONDS) {
      setShowPulse(false);
    }
  }, [isUrgent, timerState.isRunning, timerState.remainingTime]);

  return (
      <div className="flex items-center gap-2">
        {timerState.hasStarted && (
            <div
                className={`flex items-center gap-1 font-semibold tabular-nums transition-colors duration-300 ${getTimerColor()} ${showPulse ? 'animate-pulse' : ''}`}
            >
              <TimerIcon className="h-4 w-4"/>
              {formatTime(timerState.remainingTime)}
            </div>
        )}
        <div className="flex items-center gap-2">
          <label htmlFor="input-time" className="text-sm text-muted-foreground">
            Timer
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
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch
                checked={timerState.isRunning}
                onCheckedChange={(checked) => {
                  console.log('Switch toggled:', checked);
                  toggle();
                }}
                className="border border-gray-400 dark:border-gray-500 shadow-sm"
            />
          </label>

          <span
              className={`text-xs px-3 py-1 rounded-md w-[70px] text-center cursor-default ${
                  timerState.isRunning
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
          >
          {timerState.isRunning ? 'Running' : 'Stopped'}
        </span>
        </div>
        <Button
            disabled={!timerState.hasStarted}
            onClick={reset}
            size="icon"
            variant="ghost"
        >
          <RotateCcw className="h-4 w-4"/>
        </Button>
      </div>
  );
};

export default Timer;
