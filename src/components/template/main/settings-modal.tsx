"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface AISettings {
  aiApiUrl?: string;
  aiApiKey?: string;
  aiModel?: string;
}

interface Props {
  defaultConfigs?: {
    aiApiUrl?: string;
    aiApiKey?: string;
    aiModel?: string;
  };
  saveSettingsAction: (data: AISettings) => void;
}

export function SettingsModal(props: Props) {
  const { defaultConfigs, saveSettingsAction } = props;
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<AISettings>(
    () =>
      defaultConfigs || {
        aiApiUrl: "",
        aiApiKey: "",
        aiModel: "deepseek-r1:1.5b",
      }
  );

  const router = useRouter();

  const handleSaveSettings = () => {
    saveSettingsAction(settings);
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure parameters for your application.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ai_api_url" className="text-right">
              API URL
            </Label>
            <Input
              id="ai_api_url"
              name="ai_api_url"
              value={settings.aiApiUrl}
              autoComplete="false"
              onChange={(e) =>
                setSettings({ ...settings, aiApiUrl: e.target.value })
              }
              placeholder="https://api.exemplo.com/v1"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ai_api_key" className="text-right">
              API KEY
            </Label>
            <Input
              id="ai_api_key"
              type="password"
              name="ai_api_key"
              value={settings.aiApiKey}
              onChange={(e) =>
                setSettings({ ...settings, aiApiKey: e.target.value })
              }
              placeholder="sk-xxxxxxxxxxxx"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ai_model" className="text-right">
              MODEL
            </Label>
            <Input
              id="ai_model"
              name="ai_model"
              value={settings.aiModel}
              onChange={(e) =>
                setSettings({ ...settings, aiModel: e.target.value })
              }
              placeholder="deepseek-r1:1.5b"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveSettings}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
