import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SettingsIcon } from "lucide-react";

export function SettingsModal() {
  const handleSaveSettings = () => {};

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action="">
          <h3>AI Settings</h3>
          <Input placeholder="api url" />
          <Input placeholder="api key" />

          <DialogFooter>
            <Button onClick={handleSaveSettings}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
