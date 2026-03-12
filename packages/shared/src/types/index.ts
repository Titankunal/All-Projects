export interface SystemDesignQuery {
  id: string;
  prompt: string;
  createdAt: Date;
}

export interface ArchitectureComponent {
  id: string;
  type: string;
  name: string;
}
