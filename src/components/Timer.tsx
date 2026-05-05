import {Input} from '@/components/ui/input.tsx';
import {useState} from 'react';
import {Button} from '@/components/ui/button.tsx';

const START = 'Start';
const STOP = 'Stop';
const DEFAULT_TIME = '5';

const Timer = () => {
  const [time, setTime] = useState<string>(DEFAULT_TIME);
  const [started, setStarted] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>(START);

  function toggle() {
    setStarted(!started);
    setButtonText(!started ? STOP : START);
  }

  function reset() {
    if (started) {
      setTime(DEFAULT_TIME);
    }
  }

  return (
      <>
        <div className="flex gap-2">
          {started && <div >{time}</div>}
          <div className="flex">
            <label htmlFor="input-time" className="block items-center">Time</label>
            <Input id="input-time" onChange={(e) => setTime(e.target.value)}/> Minutes
          </div>
          <Button onClick={toggle}>{buttonText}</Button>
          <Button disabled={!started} onClick={reset}>Reset</Button>
        </div>
      </>
  );
};

export default Timer;