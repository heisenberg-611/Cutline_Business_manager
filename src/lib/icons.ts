import {
  Film, RotateCcw, Clapperboard, Scissors, SlidersHorizontal, Palette, AudioWaveform, MonitorPlay, MessageSquare, PackageCheck, CircleDashed, Layers, Hexagon, Triangle, Square, Component, Workflow, Zap, Activity, Star, Sparkles, Target, Rocket,
  Code, Bug, GitBranch, Cpu, CheckCircle, Terminal,
  Mic, Speaker, Music,
  Layout, Image, PenTool,
  PenLine, BookOpen, Book, Type,
  Briefcase, DollarSign,
  GraduationCap, Library, Presentation, Edit3, ClipboardList,
  FlaskConical, Microscope, TestTubes, FileText, Database,
  Search,
  Users
} from 'lucide-react'

// Map of all available icons for pipeline stages
export const PIPELINE_ICONS = {
  // Generic / Default
  Workflow, CheckCircle, CircleDashed, Layers, Zap, Activity, Star, Rocket, MessageSquare, Search, Users,
  
  // Video & Production
  Film, Clapperboard, Scissors, SlidersHorizontal, MonitorPlay, PackageCheck,
  
  // Audio
  AudioWaveform, Mic, Speaker, Music,
  
  // Design & UI
  Palette, Sparkles, Layout, Image, PenTool, Hexagon, Triangle, Square, Component,
  
  // Developer
  Code, Bug, GitBranch, Cpu, Terminal,
  
  // Writing & Copy
  PenLine, BookOpen, Book, Type,
  
  // Business & Sales
  Briefcase, DollarSign, Target,
  
  // Teacher & Student
  GraduationCap, Library, Presentation, Edit3, ClipboardList,
  
  // Researcher
  FlaskConical, Microscope, TestTubes, FileText, Database
} as const;

export type PipelineIconName = keyof typeof PIPELINE_ICONS;

/**
 * Helper to get an icon component by string name.
 * If the name doesn't exist, it returns null or a default icon.
 */
export const getIconByName = (name: string | null | undefined) => {
  if (!name) return null;
  return PIPELINE_ICONS[name as PipelineIconName] || null;
}

const DYNAMIC_ICONS = [
  Layers, Hexagon, Triangle, Square, Component, Workflow,
  Zap, Activity, Star, Sparkles, Target, Rocket, CircleDashed
]

/**
 * Deterministically get a fallback icon for a stage based on its name.
 * Returns the Lucide component itself.
 */
export const getDefaultStageIcon = (name: string) => {
  const lower = name.toLowerCase()
  if (lower.includes('raw') || lower.includes('footage')) return Film
  if (lower.includes('sync') || lower.includes('prep')) return Clapperboard
  if (lower.includes('rough')) return Scissors
  if (lower.includes('fine')) return SlidersHorizontal
  if (lower.includes('color') || lower.includes('sound')) return Palette
  if (lower.includes('review')) return MonitorPlay
  if (lower.includes('revision')) return MessageSquare
  if (lower.includes('deliver') || lower.includes('final')) return PackageCheck

  // Dynamic system: Hash the stage name to deterministically pick a cool icon
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % DYNAMIC_ICONS.length
  return DYNAMIC_ICONS[index]
}

