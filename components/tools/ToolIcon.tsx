import {
  ArrowRightLeft,
  Crop,
  FileDown,
  FileImage,
  FileOutput,
  FileStack,
  FileText,
  FileType,
  ImageDown,
  Images,
  Minimize2,
  Repeat,
  RotateCcw,
  RotateCw,
  Scaling,
  Scissors,
  ShieldOff,
  Trash2,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  ArrowRightLeft,
  Crop,
  FileDown,
  FileImage,
  FileOutput,
  FileStack,
  FileText,
  FileType,
  ImageDown,
  Images,
  Minimize2,
  Repeat,
  RotateCcw,
  RotateCw,
  Scaling,
  Scissors,
  ShieldOff,
  Trash2,
};

export function ToolIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Wrench;
  return <Icon aria-hidden className={cn("size-5", className)} strokeWidth={1.75} />;
}
