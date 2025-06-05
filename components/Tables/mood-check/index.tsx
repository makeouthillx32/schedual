"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { 
  Smile, 
  Meh, 
  Frown, 
  Battery, 
  Zap, 
  CloudRain, 
  Sun, 
  Coffee 
} from "lucide-react";

const moodOptions = [
  {
    id: "great",
    label: "Great",
    icon: Smile,
    color: "bg-green-100 hover:bg-green-200 border-green-300 text-green-800",
    selectedColor: "bg-green-200 border-green-400"
  },
  {
    id: "good",
    label: "Good",
    icon: Sun,
    color: "bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-800",
    selectedColor: "bg-yellow-200 border-yellow-400"
  },
  {
    id: "okay",
    label: "Okay",
    icon: Meh,
    color: "bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-800",
    selectedColor: "bg-blue-200 border-blue-400"
  },
  {
    id: "tired",
    label: "Tired",
    icon: Battery,
    color: "bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-800",
    selectedColor: "bg-orange-200 border-orange-400"
  },
  {
    id: "stressed",
    label: "Stressed",
    icon: CloudRain,
    color: "bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-800",
    selectedColor: "bg-purple-200 border-purple-400"
  },
  {
    id: "sad",
    label: "Sad",
    icon: Frown,
    color: "bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800",
    selectedColor: "bg-gray-200 border-gray-400"
  },
  {
    id: "energized",
    label: "Energized",
    icon: Zap,
    color: "bg-pink-100 hover:bg-pink-200 border-pink-300 text-pink-800",
    selectedColor: "bg-pink-200 border-pink-400"
  },
  {
    id: "need-coffee",
    label: "Need Coffee",
    icon: Coffee,
    color: "bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800",
    selectedColor: "bg-amber-200 border-amber-400"
  }
];

export function MoodCheckIn({ className }: { className?: string }) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedMood) {
      setSubmitted(true);
      // Here you would send the data to your backend
      console.log("Mood submitted:", { mood: selectedMood, feedback });
    }
  };

  if (submitted) {
    return (
      <div
        className={cn(
          "rounded-[var(--radius)] bg-[hsl(var(--background))] px-7.5 pb-4 pt-7.5 shadow-[var(--shadow-sm)] dark:bg-[hsl(var(--card))] dark:shadow-[var(--shadow-md)]",
          className,
        )}
      >
        <div className="text-center py-8">
          <Smile className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
            Thanks for sharing!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your mood has been recorded. Have a great day at work!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[var(--radius)] bg-[hsl(var(--background))] px-7.5 pb-4 pt-7.5 shadow-[var(--shadow-sm)] dark:bg-[hsl(var(--card))] dark:shadow-[var(--shadow-md)]",
        className,
      )}
    >
      <h2 className="mb-4 text-body-2xlg font-bold text-[hsl(var(--foreground))] dark:text-[hsl(var(--card-foreground))]">
        How are you feeling today?
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {moodOptions.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.id;
          
          return (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood.id)}
              className={cn(
                "p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2",
                isSelected ? mood.selectedColor : mood.color
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-sm font-medium">{mood.label}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            Want to tell your coach anything? (Optional)
          </label>
          <Textarea
            placeholder="How can we make your day better?"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={!selectedMood}
          className="w-full md:w-auto"
        >
          Share My Mood
        </Button>
      </div>
    </div>
  );
}