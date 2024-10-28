export interface Generation {
  label: string;
  thought: string;
  isCompleted?: boolean;
  action: string; // Add this line
}

export interface ProgressProps {
  generations: Generation[];
  hoveredGenerationId: number; // Add this
  setHoveredGenerationId: (id: number) => void; // Add this
}

export interface SummarizedGeneration extends Generation {
  summarizedDescription?: string;
  isSummarized: boolean;
}

export interface ChatProps {
  setGenerations: React.Dispatch<React.SetStateAction<Generation[]>>;
  hoveredGenerationId: number;
  setHoveredGenerationId: React.Dispatch<React.SetStateAction<number>>;
}

export interface Generation {
  label: string;
  thought: string;
  action: string;
  input?: string;
  isCompleted?: boolean;
}
