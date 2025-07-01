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
import { Plus, Check, Pencil, Trash2 } from "lucide-react";
import { useFabricTypes } from "@/hooks/useFabricTypes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FabricSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const FabricSelector = ({
  value,
  onChange,
}: FabricSelectorProps) => {
  const { fabricTypes, addFabricType, updateFabricType, deleteFabricType } = useFabricTypes();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customFabricInput, setCustomFabricInput] = useState("");
  const [editingFabric, setEditingFabric] = useState<{ id: string; name: string } | null>(null);

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

    if (trimmedFabric && !fabricTypes.some(f => f.name === trimmedFabric)) {
      await addFabricType(trimmedFabric);
      onChange(trimmedFabric);
    }
    setShowCustomInput(false);
    setCustomFabricInput("");
  };

  const handleUpdateFabric = async () => {
    if (editingFabric && customFabricInput.trim()) {
      await updateFabricType(editingFabric.id, customFabricInput.trim());
      onChange(customFabricInput.trim());
      setEditingFabric(null);
      setCustomFabricInput("");
    }
  };

  const handleCancelCustomInput = () => {
    setShowCustomInput(false);
    setCustomFabricInput("");
    setEditingFabric(null);
  };

  if (showCustomInput || editingFabric) {
    return (
      <div className="space-y-2">
        <Input
          type="text"
          value={customFabricInput}
          onChange={(e) => setCustomFabricInput(e.target.value)}
          placeholder={editingFabric ? "Update fabric name..." : "Enter custom fabric type..."}
          className="w-full bg-white text-gray-900"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (editingFabric) {
                handleUpdateFabric();
              } else {
                handleAddCustomFabric();
              }
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
            onClick={editingFabric ? handleUpdateFabric : handleAddCustomFabric}
            disabled={!customFabricInput.trim()}
            className="flex items-center"
          >
            <Check className="h-3 w-3 mr-1" />
            {editingFabric ? "Update" : "Add"}
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
          <div key={fabric.id} className="flex items-center pr-2">
            <SelectItem
              value={fabric.name}
              className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 flex-grow"
            >
              {fabric.name}
            </SelectItem>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 ml-2"
              onClick={(e) => {
                e.stopPropagation();
                setEditingFabric(fabric);
                setCustomFabricInput(fabric.name);
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-500 hover:text-red-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the fabric type "{fabric.name}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteFabricType(fabric.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
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
