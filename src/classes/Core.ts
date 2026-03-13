import { Agent } from "@mariozechner/pi-agent-core";
import { getModel, Model } from "@mariozechner/pi-ai";

type ThinkingLevel ="off" | "minimal" | "low" | "medium" | "high" | "xhigh"


export default class{
   private agent:any
   private tools:string[]=[]
   private thinkingLevel :ThinkingLevel="off"
   private AgentTools:any[]=[]
   private AgentMessage:any[]=[]

   
    constructor(options:{provider:any,modelId:any,  systemPrompt:string, agentTools?:any[],AgentMessage?:any[], thinkingLevel?:ThinkingLevel}){
        this.agent = new Agent({initialState:{
        systemPrompt: options.systemPrompt,
        thinkingLevel: options.thinkingLevel || "off",
        tools: options.agentTools || [],
        messages: options.AgentMessage || [],
        model : getModel(options.provider, options.modelId)
        }})
    }
}