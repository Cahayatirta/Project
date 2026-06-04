import { useMemo, useState } from "react";
import Input from "./Input";

type SelectOption = {
  label: string;
  value: string;
};

type SelectWithOtherProps<TField extends string = string> = {
  id: TField;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  otherLabel?: string;
  otherPlaceholder?: string;
  onValueChange: (field: TField, value: string) => void;
};

const OTHER_VALUE = "__other__";

export default function SelectWithOther<TField extends string = string>({
  id,
  value,
  options,
  placeholder = "Select option",
  otherLabel = "Other",
  otherPlaceholder = "Type your answer",
  onValueChange,
}: SelectWithOtherProps<TField>) {
  const optionValues = useMemo(() => options.map((option) => option.value), [options]);
  const hasCustomValue = value !== "" && !optionValues.includes(value);
  const [isOtherSelected, setIsOtherSelected] = useState(hasCustomValue);
  const selectValue = isOtherSelected || hasCustomValue ? OTHER_VALUE : value;

  function handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedValue = event.target.value;

    if (selectedValue === OTHER_VALUE) {
      setIsOtherSelected(true);
      onValueChange(id, hasCustomValue ? value : "");
      return;
    }

    setIsOtherSelected(false);
    onValueChange(id, selectedValue);
  }

  function handleOtherChange(event: React.ChangeEvent<HTMLInputElement>) {
    onValueChange(id, event.target.value);
  }

  return (
    <div>
      <select
        id={`${id}Select`}
        value={selectValue}
        onChange={handleSelectChange}
        className="mt-1 block w-full rounded-md border border-black/50 px-3 py-2 text-black shadow-md focus:outline-primary-500"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        <option value={OTHER_VALUE}>{otherLabel}</option>
      </select>

      {(isOtherSelected || hasCustomValue) && (
        <Input
          type="text"
          id={id}
          value={value}
          onChange={handleOtherChange}
          placeholder={otherPlaceholder}
        />
      )}
    </div>
  );
}
