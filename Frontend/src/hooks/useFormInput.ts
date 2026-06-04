import { useState } from 'react';


export default function useFormInput<T>(initialForm: T): [T, (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void, (field: keyof T, value: string) => void] {
  const [form, setForm] = useState<T>(initialForm);
  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const field = event.target.id
    setForm((currentForm) => ({
      ...currentForm,
      [field]: event.target.value,
    }));
  };
  const updateField = (field: keyof T, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }
  return [form, handleValueChange, updateField];
}
