export interface AIModel {
  name: string;
  id: string;
  context: number;
  category?: string;
  capabilities?: {
    code?: boolean;
    reasoning?: boolean;
    vision?: boolean;
  };
}

export const AVAILABLE_MODELS: AIModel[] = [
  // Meta Models
  {
    name: "Llama 3.3 70B Instruct",
    id: "meta-llama/llama-3.3-70b-instruct:free",
    context: 131072,
    category: "Large"
  },
  {
    name: "Llama 3.3 8B Instruct",
    id: "meta-llama/llama-3.3-8b-instruct:free",
    context: 128000,
    category: "Popular"
  },
  {
    name: "Llama 4 Maverick",
    id: "meta-llama/llama-4-maverick:free",
    context: 256000,
    category: "Popular"
  },
  {
    name: "Llama 4 Scout",
    id: "meta-llama/llama-4-scout:free",
    context: 256000,
    category: "Popular"
  },
  {
    name: "Llama 3.2 3B Instruct",
    id: "meta-llama/llama-3.2-3b-instruct:free",
    context: 20000,
    category: "Small"
  },
  {
    name: "Llama 3.2 1B Instruct",
    id: "meta-llama/llama-3.2-1b-instruct:free",
    context: 131000,
    category: "Small"
  },
  {
    name: "Llama 3.2 11B Vision",
    id: "meta-llama/llama-3.2-11b-vision-instruct:free",
    context: 131072,
    category: "Popular",
    capabilities: { vision: true }
  },
  {
    name: "Llama 3.1 405B",
    id: "meta-llama/llama-3.1-405b:free",
    context: 64000,
    category: "Large"
  },
  {
    name: "Llama 3.1 8B Instruct",
    id: "meta-llama/llama-3.1-8b-instruct:free",
    context: 131072,
    category: "Popular"
  },
  
  // Microsoft Models
  {
    name: "Phi 4 Reasoning Plus",
    id: "microsoft/phi-4-reasoning-plus:free",
    context: 32768,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "Phi 4 Reasoning",
    id: "microsoft/phi-4-reasoning:free",
    context: 32768,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "MAI DS R1",
    id: "microsoft/mai-ds-r1:free",
    context: 163840,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  
  // Google Models
  {
    name: "Gemini 2.5 Pro",
    id: "google/gemini-2.5-pro-exp-03-25",
    context: 1048576,
    category: "Large"
  },
  {
    name: "Gemini 2.0 Flash",
    id: "google/gemini-2.0-flash-exp:free",
    context: 1048576,
    category: "Popular"
  },
  {
    name: "Gemma 3 1B",
    id: "google/gemma-3-1b-it:free",
    context: 32768,
    category: "Small"
  },
  {
    name: "Gemma 3 4B",
    id: "google/gemma-3-4b-it:free",
    context: 131072,
    category: "Popular"
  },
  {
    name: "Gemma 3 12B",
    id: "google/gemma-3-12b-it:free",
    context: 131072,
    category: "Popular"
  },
  {
    name: "Gemma 3 27B",
    id: "google/gemma-3-27b-it:free",
    context: 96000,
    category: "Large"
  },
  {
    name: "Gemma 2 9B",
    id: "google/gemma-2-9b-it:free",
    context: 8192,
    category: "Popular"
  },
  
  // Qwen Models
  {
    name: "Qwen3 0.6B",
    id: "qwen/qwen3-0.6b-04-28:free",
    context: 32000,
    category: "Small"
  },
  {
    name: "Qwen3 1.7B",
    id: "qwen/qwen3-1.7b:free",
    context: 32000,
    category: "Small"
  },
  {
    name: "Qwen3 4B",
    id: "qwen/qwen3-4b:free",
    context: 128000,
    category: "Popular"
  },
  {
    name: "Qwen3 30B",
    id: "qwen/qwen3-30b-a3b:free",
    context: 40960,
    category: "Large"
  },
  {
    name: "Qwen3 8B",
    id: "qwen/qwen3-8b:free",
    context: 40960,
    category: "Popular"
  },
  {
    name: "Qwen3 14B",
    id: "qwen/qwen3-14b:free",
    context: 40960,
    category: "Large"
  },
  {
    name: "Qwen3 32B",
    id: "qwen/qwen3-32b:free",
    context: 40960,
    category: "Large"
  },
  {
    name: "Qwen3 235B",
    id: "qwen/qwen3-235b-a22b:free",
    context: 40960,
    category: "Large"
  },
  {
    name: "QwQ 32B",
    id: "qwen/qwq-32b:free",
    context: 40000,
    category: "Large"
  },
  {
    name: "QwQ 32B RpR",
    id: "arliai/qwq-32b-arliai-rpr-v1:free",
    context: 32768,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "Qwen2.5 Coder 32B",
    id: "qwen/qwen-2.5-coder-32b-instruct:free",
    context: 32768,
    category: "Code",
    capabilities: { code: true }
  },
  {
    name: "Qwen2.5 7B",
    id: "qwen/qwen-2.5-7b-instruct:free",
    context: 32768,
    category: "Popular"
  },
  {
    name: "Qwen2.5 72B",
    id: "qwen/qwen-2.5-72b-instruct:free",
    context: 32768,
    category: "Large"
  },
  {
    name: "Qwen2.5 VL 3B",
    id: "qwen/qwen2.5-vl-3b-instruct:free",
    context: 64000,
    category: "Small",
    capabilities: { vision: true }
  },
  {
    name: "Qwen2.5 VL 7B",
    id: "qwen/qwen-2.5-vl-7b-instruct:free",
    context: 64000,
    category: "Popular",
    capabilities: { vision: true }
  },
  {
    name: "Qwen2.5 VL 32B",
    id: "qwen/qwen2.5-vl-32b-instruct:free",
    context: 8192,
    category: "Large",
    capabilities: { vision: true }
  },
  {
    name: "Qwen2.5 VL 72B",
    id: "qwen/qwen2.5-vl-72b-instruct:free",
    context: 131072,
    category: "Large",
    capabilities: { vision: true }
  },
  
  // DeepSeek Models
  {
    name: "DeepSeek Prover V2",
    id: "deepseek/deepseek-prover-v2:free",
    context: 163840,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "DeepSeek R1T Chimera",
    id: "tngtech/deepseek-r1t-chimera:free",
    context: 163840,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "DeepSeek V3 Base",
    id: "deepseek/deepseek-v3-base:free",
    context: 163840,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "DeepSeek V3 0324",
    id: "deepseek/deepseek-chat-v3-0324:free",
    context: 163840,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "DeepSeek R1 Zero",
    id: "deepseek/deepseek-r1-zero:free",
    context: 128000,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "DeepSeek R1",
    id: "deepseek/deepseek-r1:free",
    context: 163840,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "DeepSeek V3",
    id: "deepseek/deepseek-chat:free",
    context: 163840,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "DeepSeek R1 Qwen 32B",
    id: "deepseek/deepseek-r1-distill-qwen-32b:free",
    context: 16000,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "DeepSeek R1 Qwen 14B",
    id: "deepseek/deepseek-r1-distill-qwen-14b:free",
    context: 64000,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "DeepSeek R1 Llama 70B",
    id: "deepseek/deepseek-r1-distill-llama-70b:free",
    context: 8192,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  
  // Mistral Models
  {
    name: "Mistral Small 3.1 24B",
    id: "mistralai/mistral-small-3.1-24b-instruct:free",
    context: 96000,
    category: "Popular"
  },
  {
    name: "Mistral Small 24B",
    id: "mistralai/mistral-small-24b-instruct-2501:free",
    context: 32768,
    category: "Popular"
  },
  {
    name: "Mistral Nemo",
    id: "mistralai/mistral-nemo:free",
    context: 128000,
    category: "Popular"
  },
  {
    name: "Mistral 7B",
    id: "mistralai/mistral-7b-instruct:free",
    context: 32768,
    category: "Popular"
  },
  
  // THUDM Models
  {
    name: "GLM Z1 9B",
    id: "thudm/glm-z1-9b:free",
    context: 32000,
    category: "Popular"
  },
  {
    name: "GLM 4 9B",
    id: "thudm/glm-4-9b:free",
    context: 32000,
    category: "Popular"
  },
  {
    name: "GLM Z1 32B",
    id: "thudm/glm-z1-32b:free",
    context: 32768,
    category: "Large"
  },
  {
    name: "GLM 4 32B",
    id: "thudm/glm-4-32b:free",
    context: 32768,
    category: "Large"
  },
  
  // Nous Research Models
  {
    name: "DeepHermes 3 Mistral 24B",
    id: "nousresearch/deephermes-3-mistral-24b-preview:free",
    context: 32768,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  {
    name: "DeepHermes 3 Llama 8B",
    id: "nousresearch/deephermes-3-llama-3-8b-preview:free",
    context: 131072,
    category: "Reasoning",
    capabilities: { reasoning: true }
  },
  
  // Others
  {
    name: "Shisa V2 70B",
    id: "shisa-ai/shisa-v2-llama3.3-70b:free",
    context: 32768,
    category: "Large"
  },
  {
    name: "Deepcoder 14B",
    id: "agentica-org/deepcoder-14b-preview:free",
    context: 96000,
    category: "Code",
    capabilities: { code: true }
  },
  {
    name: "NVIDIA Nemotron Super 49B",
    id: "nvidia/llama-3.3-nemotron-super-49b-v1:free",
    context: 131072,
    category: "Large"
  },
  {
    name: "NVIDIA Nemotron Ultra 253B",
    id: "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
    context: 131072,
    category: "Large"
  },
  {
    name: "Qwerky 72B",
    id: "featherless/qwerky-72b:free",
    context: 32768,
    category: "Large"
  },
  {
    name: "OlympicCoder 32B",
    id: "open-r1/olympiccoder-32b:free",
    context: 32768,
    category: "Code",
    capabilities: { code: true }
  },
  {
    name: "Reka Flash 3",
    id: "rekaai/reka-flash-3:free",
    context: 32768,
    category: "Popular"
  },
  {
    name: "Moonlight 16B",
    id: "moonshotai/moonlight-16b-a3b-instruct:free",
    context: 8192,
    category: "Popular"
  },
  {
    name: "Dolphin 3.0 R1 24B",
    id: "cognitivecomputations/dolphin3.0-r1-mistral-24b:free",
    context: 32768,
    category: "Popular"
  },
  {
    name: "Dolphin 3.0 24B",
    id: "cognitivecomputations/dolphin3.0-mistral-24b:free",
    context: 32768,
    category: "Popular"
  },
  {
    name: "Kimi VL A3B Thinking",
    id: "moonshotai/kimi-vl-a3b-thinking:free",
    context: 131072,
    category: "Vision",
    capabilities: { vision: true }
  },
  {
    name: "InternVL3 14B",
    id: "opengvlab/internvl3-14b:free",
    context: 32000,
    category: "Vision",
    capabilities: { vision: true }
  },
  {
    name: "InternVL3 2B",
    id: "opengvlab/internvl3-2b:free",
    context: 32000,
    category: "Small",
    capabilities: { vision: true }
  },
  {
    name: "UI-TARS 72B",
    id: "bytedance-research/ui-tars-72b:free",
    context: 32768,
    category: "Large"
  }
];

// Quick filter for faster lookups
export const REASONING_MODELS = AVAILABLE_MODELS.filter(model => model.capabilities?.reasoning);
export const CODE_MODELS = AVAILABLE_MODELS.filter(model => model.capabilities?.code);
export const VISION_MODELS = AVAILABLE_MODELS.filter(model => model.capabilities?.vision);
export const SMALL_MODELS = AVAILABLE_MODELS.filter(model => getModelSize(model.name) > 0 && getModelSize(model.name) < 7);
export const MEDIUM_MODELS = AVAILABLE_MODELS.filter(model => getModelSize(model.name) >= 7 && getModelSize(model.name) < 20);
export const LARGE_MODELS = AVAILABLE_MODELS.filter(model => getModelSize(model.name) >= 20);

// Helper function to parse model size from name
function getModelSize(name: string): number {
  const match = name.match(/(\d+)B/);
  return match ? parseInt(match[1]) : 0;
}
