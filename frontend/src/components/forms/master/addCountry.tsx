import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function AddCountryDialog({ open, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [isoCode, setIsoCode] = useState("");
  const [mobileCode, setMobileCode] = useState("");
  const { toast } = useToast();

  async function handleSave() {
    await api.addCountrys({ name,isoCode,mobileCode });
    toast({
        title: "Country Added",
        description: `${name} has been added successfully.`,
        variant: "default",
      });
    onSaved();
    onClose();
  }
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white w-96 rounded-xl shadow-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Add Country</h2>

        <Input
          placeholder="Enter country name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Enter country code"
          value={isoCode}
          onChange={(e) => setIsoCode(e.target.value)}
        />
        <Input
          placeholder="Enter mobile code"
          value={mobileCode}
          onChange={(e) => setMobileCode(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-blue-600" onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}
