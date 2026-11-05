export type PathNodeStatus = 'done' | 'current' | 'todo';

export interface PathNode {
  id: string;
  title: string;
  trackTitle: string;
  hue: string;
  status: PathNodeStatus;
  href: string;
}

export interface PathHover {
  node: PathNode;
  x: number;
  y: number;
}

export interface PathRendererOptions {
  canvas: HTMLCanvasElement;
  /** Camada HTML onde as placas com o nome das trilhas são posicionadas. */
  labelLayer?: HTMLElement;
  nodes: PathNode[];
  animate: boolean;
  /** Desloca o caminho para a direita (texto à esquerda em telas largas). */
  offsetRight: boolean;
  onHover(hover: PathHover | null): void;
  onSelect(node: PathNode): void;
}

export interface PathRenderer {
  dispose(): void;
}
