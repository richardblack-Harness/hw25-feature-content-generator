// components/icon-map.tsx
import { Megaphone, FileText, Code, Lightbulb } from "lucide-react";
import type { JSX } from "react";

export const iconMap: Record<string, JSX.Element> = {
  marketing: <Megaphone className="h-5 w-5" />,
  announcement: <FileText className="h-5 w-5" />,
  tech: <Code className="h-5 w-5" />,
  idea: <Lightbulb className="h-5 w-5" />,
};