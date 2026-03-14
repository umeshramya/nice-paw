import { Agent } from "@mariozechner/pi-agent-core";
import { getModel } from "@mariozechner/pi-ai";

type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh";

type ModelConfig = {
  name: string;
  provider: any;
  modelId: string;
};

export default class MultiLLMAgent {

  private agent: any;
  private models: Record<string, any> = {};

  constructor(options: {
    models: ModelConfig[];
    selectedModel: string;
    systemPrompt: string;
    agentTools?: any[];
    AgentMessage?: any[];
    thinkingLevel?: ThinkingLevel;
  }) {

    // register all models
    options.models.forEach((m) => {
      this.models[m.name] = getModel(m.provider, m.modelId);
    });

    // validate selected model
    if (!this.models[options.selectedModel]) {
      throw new Error(`Model '${options.selectedModel}' not found`);
    }

    // create agent with selected model
    this.agent = new Agent({
      initialState: {
        systemPrompt: options.systemPrompt,
        thinkingLevel: options.thinkingLevel || "off",
        tools: options.agentTools || [],
        messages: options.AgentMessage || [],
        model: this.models[options.selectedModel]
      }
    });
  }

  // change model later
  setModel(modelName: string) {
    if (!this.models[modelName]) {
      throw new Error(`Model '${modelName}' not registered`);
    }

    this.agent.state.model = this.models[modelName];
  }

  // run agent
  async run(input: string) {
    return await this.agent.run(input);
  }

  // list available models
  getAvailableModels() {
    return Object.keys(this.models);
  }

}