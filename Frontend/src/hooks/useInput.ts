import { useState } from 'react';

type inputState = [string, (event: React.ChangeEvent<HTMLInputElement>) => void];

export default function useInput(defaultValue: string): inputState {
  const [value, setValue] = useState(defaultValue);
  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value);
  return [value, handleValueChange];
}