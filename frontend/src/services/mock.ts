export type Analysis = {
    id: string;
    findings: string[];
    confidence: number; // 0-1
    metrics: { auc: number; sensitivity: number; specificity: number };
    overlays?: string; // base64 placeholder
    thumbnail: string; // data URL for preview
    modality: "X-Ray";
    createdAt: string;
  };
  
  export async function mockAnalyze(file: File): Promise<Analysis> {
    // fake latency
    await new Promise(r => setTimeout(r, 1200));
    const id = Math.random().toString(36).slice(2, 10);
    const thumbnail = await fileToDataURL(file);
    return {
      id,
      thumbnail,
      modality: "X-Ray",
      createdAt: new Date().toISOString(),
      findings: [
        "No acute cardiopulmonary process identified.",
        "LLM summary: pattern consistent with normal chest radiograph.",
      ],
      confidence: 0.92,
      metrics: { auc: 0.95, sensitivity: 0.91, specificity: 0.93 },
      overlays: undefined,
    };
  }
  
  export async function fileToDataURL(file: File): Promise<string> {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
  }