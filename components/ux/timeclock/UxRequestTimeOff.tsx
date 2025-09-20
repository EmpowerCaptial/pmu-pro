"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export function UxRequestTimeOff() {
  const [showForm, setShowForm] = React.useState(false);

  return (
    <div className="border-t border-white/5 pt-4">
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-neutral-400 hover:text-white hover:bg-white/10"
        onClick={() => setShowForm(!showForm)}
      >
        <Calendar className="h-4 w-4 mr-2" />
        Request Time Off
      </Button>
      
      {showForm && (
        <div className="mt-3 p-3 bg-neutral-800 rounded-lg border border-white/5">
          <p className="text-sm text-neutral-400">
            Time off request feature coming soon. Contact your manager for now.
          </p>
        </div>
      )}
    </div>
  );
}
