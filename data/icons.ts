import {
  Megaphone,
  FileText,
  Newspaper,
  ClipboardList,
  Briefcase,
  BookOpen,
} from "lucide-react";

export const templateMeta: Record<string, { icon: any; color: string }> = {
  announcement: {
    icon: Megaphone,
    color: "bg-green-500/10 text-green-500",
  },
  blog: {
    icon: BookOpen,
    color: "bg-blue-500/10 text-blue-500",
  },
  newsletter: {
    icon: Newspaper,
    color: "bg-orange-500/10 text-orange-500",
  },
  release_notes: {
    icon: ClipboardList,
    color: "bg-yellow-500/10 text-yellow-500",
  },
  se_handover: {
    icon: Briefcase,
    color: "bg-pink-500/10 text-pink-500",
  },
  tech_doc: {
    icon: FileText,
    color: "bg-sky-500/10 text-sky-500",
  },
};