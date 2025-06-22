import { useEffect, useState } from "react";

export type DropdownItem = {
  label: string;
  value: string;
};

type DropdownProps = {
  items: DropdownItem[];
  onSelect: (val: string) => void;
  selected?: string | null;
};

const Dropdown = ({ items, onSelect, selected }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("Select Option");

  // 🔁 Update label when `selected` value changes
  useEffect(() => {
    if (selected) {
      const found = items.find((item) => item.value === selected);
      if (found) {
        setSelectedLabel(found.label);
      }
    }
  }, [selected, items]);

  const handleSelect = (item: DropdownItem) => {
    setSelectedLabel(item.label);
    setIsOpen(false);
    onSelect(item.value);
  };

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black border border-gray-300 text-white py-2 px-4 rounded-md text-left"
      >
        {selectedLabel}
      </button>
      {isOpen && (
        <ul className="absolute w-full bg-black border mt-1 rounded shadow z-10 max-h-60 overflow-y-auto">
          {items.map((item) => (
            <li
              key={item.value}
              onClick={() => handleSelect(item)}
              className="p-2 hover:bg-gray-100 hover:text-black cursor-pointer"
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
