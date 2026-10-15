export interface TypeDiagnostic {
  message: string;
  line: number;
  col: number;
  category: "error" | "warning" | "info";
}

export interface TypeCompletion { label: string; type: string; boost?: number }
export interface HoverInfo { text: string; from: number; to: number }

export interface TypeRequest {
  id: number;
  kind: "diagnostics" | "completion" | "hover";
  source: string;
  pos?: number;
  jsx?: boolean;
}

export interface TypeResponse {
  id: number;
  result?: TypeDiagnostic[] | TypeCompletion[] | HoverInfo | null;
  error?: string;
}
