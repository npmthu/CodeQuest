import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";

export default function TestDialog() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dialog Test</h1>
        <Button
          onClick={() => {
            console.log("Opening dialog...");
            setOpen(true);
          }}
        >
          Open Test Dialog
        </Button>
        <p>Modal state: {open ? "OPEN" : "CLOSED"}</p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
              <DialogDescription>
                If you can see this, Dialog is working!
              </DialogDescription>
            </DialogHeader>
            <div className="p-4">
              <p>Dialog content goes here</p>
              <Button onClick={() => setOpen(false)} className="mt-4">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
