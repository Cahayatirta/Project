import type { SelectHTMLAttributes } from "react";

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: SelectOption[];
  placeholder?: string;
};

export default function Select({
  options,
  placeholder = "Select option",
  className,
  ...params
}: SelectProps) {
  return (
    <select
      {...params}
      className={`mt-1 block w-full rounded-md border border-black/50 px-3 py-2 text-black shadow-md focus:outline-primary-500${className ? ` ${className}` : ""}`}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
