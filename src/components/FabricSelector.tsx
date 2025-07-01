import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import { useFabricTypes } from "@/hooks/useFabricTypes";

interface FabricSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const FabricSelector = ({
  value,
  onChange,
}: FabricSelectorProps) => {
  const { fabricTypes, addFabricType } = useFabricTypes();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customFabricInput, setCustomFabricInput] = useState("");

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "__add_custom__") {
      setShowCustomInput(true);
      setCustomFabricInput("");
    } else {
      onChange(selectedValue);
      setShowCustomInput(false);
    }
  };

  const handleAddCustomFabric = async () => {
    const trimmedFabric = customFabricInput.trim();

    if (trimmedFabric && !fabricTypes.includes(trimmedFabric)) {
      await addFabricType(trimmedFabric);
      onChange(trimmedFabric);
    }
    setShowCustomInput(false);
    setCustomFabricInput("");
  };

  const handleCancelCustomInput = () => {
    setShowCustomInput(false);
    setCustomFabricInput("");
  };

  if (showCustomInput) {
    return (
      <div className="space-y-2">
        <Input
          type="text"
          value={customFabricInput}
          onChange={(e) => setCustomFabricInput(e.target.value)}
          placeholder="Enter custom fabric type..."
          className="w-full bg-white text-gray-900"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddCustomFabric();
            } else if (e.key === "Escape") {
              handleCancelCustomInput();
            }
          }}
          autoFocus
        />
        <div className="flex space-x-2">
          <Button
            type="button"
            size="sm"
            onClick={handleAddCustomFabric}
            disabled={!customFabricInput.trim()}
            className="flex items-center"
          >
            <Check className="h-3 w-3 mr-1" />
            Add
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCancelCustomInput}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={handleSelectChange}>
      <SelectTrigger className="w-full bg-white border border-gray-300">
        <SelectValue
          placeholder="Select fabric type..."
          className="text-gray-900"
        />
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-60 overflow-y-auto" position="popper">
        {fabricTypes.map((fabric) => (
          <SelectItem
            key={fabric}
            value={fabric}
            className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100"
          >
            {fabric}
          </SelectItem>
        ))}
        <SelectItem
          value="__add_custom__"
          className="text-blue-600 hover:bg-blue-50 focus:bg-blue-50"
        >
          <span className="flex items-center">
            <Plus className="h-3 w-3 mr-2" />
            Add Custom Fabric...
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default FabricSelector;
