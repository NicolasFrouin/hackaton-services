import 'dotenv/config';

import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { loadAgentPrompt } from './generate_prompt.mts';
import { weather } from './tools/weather.mts';

const managerPrompt = loadAgentPrompt('manager');

const agentModel = new ChatOpenAI({
  temperature: 0.5,
  model: process.env.AGENT_MANAGER_MODEL, // ou le nom de votre modèle
  configuration: {
    baseURL: process.env.AGENT_MANAGER_URL,
    apiKey: 'not-needed', // LMStudio ne nécessite pas de clé API réelle
  },
});

//const agentModel = new ChatOpenAI({ temperature: 0.5, model: "gpt-4o-mini" });

const agentCheckpointer = new MemorySaver();
export const managerAgent = createReactAgent({
  prompt: managerPrompt,
  llm: agentModel,
  tools: [weather],
  checkpointSaver: agentCheckpointer,
});
