import { Readable } from 'node:stream';
import { HttpRequest, InvocationContext, HttpResponseInit, app } from '@azure/functions';
import { AIChatCompletionRequest, AIChatCompletionDelta } from '@microsoft/ai-chat-protocol';
import { AzureOpenAIEmbeddings, AzureChatOpenAI } from '@langchain/openai';
import { Embeddings } from '@langchain/core/embeddings';
import { AzureCosmsosDBNoSQLChatMessageHistory, AzureCosmosDBNoSQLVectorStore } from '@langchain/azure-cosmosdb';
import { FileSystemChatMessageHistory } from '@langchain/community/stores/message/file_system';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';
import { VectorStore } from '@langchain/core/vectorstores';
import { ChatOllama, OllamaEmbeddings } from '@langchain/ollama';
import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { ChatPromptTemplate, PromptTemplate } from '@langchain/core/prompts';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';
import { badRequest, data, serviceUnavailable } from '../http-response.js';
import { ollamaChatModel, ollamaEmbeddingsModel, faissStoreFolder } from '../constants.js';
import { getAzureOpenAiTokenProvider, getCredentials, getUserId } from '../security.js';

const ragSystemPrompt = `You are EcoSentinel AI, an intelligent environmental assistant. Your task is to provide helpful, clear, and context-aware responses to users' questions about environmental monitoring and sustainability in Kenya and East Africa.

Use the provided context documents to answer. If they are insufficient, do NOT say "I don't know". Instead, respond with:
- An educated guess based on known environmental patterns in Kenya or East Africa.
- General reasoning using environmental science knowledge.
- Suggestions for how or where the user might find more accurate or real-time data.
Focus on addressing the triple planetary crisis by providing actionable insights in the following areas:

1. **Climate Change**:
   - Provide weather and disaster predictions to enable early warnings for vulnerable communities.
   - Suggest affordable adaptation technologies, such as mobile apps for drought and flood alerts, to support farmers and urban areas.

2. **Biodiversity and Nature Loss**:
   - Empower communities with monitoring tools to track species or deforestation, e.g., for Tsavo ecosystems.
   - Highlight capacity-building initiatives that integrate traditional knowledge from Maasai, Luo, Kikuyu, and Kalenjin practices to enhance community-led conservation efforts.

3. **Pollution and Waste**:
   - Recommend waste tracking platforms to monitor water quality or organize community waste collection.
   - Promote circular economy solutions to reduce plastic consumption, encourage recycling, and minimize plastic leakage.

When responding, incorporate local traditional knowledge and practices:
- **Maasai**: Rotational grazing techniques to preserve grasslands.
- **Luo**: Sustainable fishing practices to protect aquatic biodiversity.
- **Kikuyu**: Agroforestry methods to enhance soil fertility and biodiversity.
- **Kalenjin**: Indigenous water conservation techniques for drought resilience.

Use the provided context documents to answer questions. If the documents are insufficient:
- Make an educated guess based on known environmental patterns in Kenya or East Africa.
- Apply general reasoning using environmental science knowledge.
- Suggest tools, platforms, or local institutions (e.g., Kenya Meteorological Department, NEMA) that can provide more accurate or real-time data.

Write a detailed and structured explanation about environmental data analysis in the context of Kenya and East Africa. Use a professional tone. Break the information into clearly numbered sections, each with a bolded title and a short paragraph explaining the point. Cover areas such as air quality, water quality, biodiversity, climate data, and land use changes.

End with a paragraph suggesting tools or platforms (like GIS or Google Earth Engine) and local institutions that support environmental monitoring. Always be helpful, resourceful, and clear. When referencing data, mention the source like [source.txt].

Wrap 2–3 possible follow-up questions in double angle brackets, e.g.:
<<Can I access historical pollution data?>>
<<How does weather affect air quality?>>`;

const titleSystemPrompt = `Create a title for this chat session, based on the user question. The title should be less than 32 characters and relevant to environmental monitoring or sustainability. Do NOT use double-quotes.`;

interface ChatContext {
  sessionId: string;
}

export async function postChats(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const azureOpenAiEndpoint = process.env.AZURE_OPENAI_API_ENDPOINT;

  try {
    const requestBody = (await request.json()) as {
      messages: AIChatCompletionRequest['messages'];
      context: ChatContext;
    };

    const { messages, context: chatContext } = requestBody;
    const userId = getUserId(request, requestBody);

    // Validate messages
    if (!messages || messages.length === 0 || !messages.at(-1)?.content) {
      return badRequest('Invalid or missing messages in the request body');
    }

    // Validate context
    if (!chatContext || typeof chatContext !== 'object' || !chatContext.sessionId) {
      return badRequest(
        'Invalid or missing context in the request body. Ensure "context" includes a valid "sessionId".',
      );
    }

    let embeddings: Embeddings;
    let model: BaseChatModel;
    let store: VectorStore;
    let chatHistory;
    const sessionId = chatContext.sessionId || uuidv4();
    context.log(`userId: ${userId}, sessionId: ${sessionId}`);

    if (azureOpenAiEndpoint) {
      const credentials = getCredentials();
      const azureADTokenProvider = getAzureOpenAiTokenProvider();

      embeddings = new AzureOpenAIEmbeddings({ azureADTokenProvider });
      model = new AzureChatOpenAI({
        temperature: 0.7,
        azureADTokenProvider,
      });
      store = new AzureCosmosDBNoSQLVectorStore(embeddings, { credentials });

      chatHistory = new AzureCosmsosDBNoSQLChatMessageHistory({
        sessionId,
        userId,
        credentials,
      });
    } else {
      context.log('No Azure OpenAI endpoint set, using Ollama models and local DB');
      embeddings = new OllamaEmbeddings({ model: ollamaEmbeddingsModel });
      model = new ChatOllama({
        temperature: 0.7,
        model: ollamaChatModel,
      });
      store = await FaissStore.load(faissStoreFolder, embeddings);
      chatHistory = new FileSystemChatMessageHistory({
        sessionId,
        userId,
      });
    }

    const ragChain = await createStuffDocumentsChain({
      llm: model,
      prompt: ChatPromptTemplate.fromMessages([
        ['system', ragSystemPrompt],
        ['human', '{input}'],
      ]),
      documentPrompt: PromptTemplate.fromTemplate('[{source}]: {page_content}\n'),
    });

    const ragChainWithHistory = new RunnableWithMessageHistory({
      runnable: ragChain,
      inputMessagesKey: 'input',
      historyMessagesKey: 'chat_history',
      getMessageHistory: async () => chatHistory,
    });

    const retriever = store.asRetriever(3);
    const question = messages.at(-1)!.content;
    const responseStream = await ragChainWithHistory.stream(
      {
        input: question,
        context: await retriever.invoke(question),
      },
      { configurable: { sessionId } },
    );
    const jsonStream = Readable.from(createJsonStream(responseStream, sessionId));

    const { title } = await chatHistory.getContext();
    if (!title) {
      const response = await ChatPromptTemplate.fromMessages([
        ['system', titleSystemPrompt],
        ['human', '{input}'],
      ])
        .pipe(model)
        .invoke({ input: question });
      context.log(`Title for session: ${response.content as string}`);
      chatHistory.setContext({ title: response.content });
    }

    return data(jsonStream, {
      'Content-Type': 'application/x-ndjson',
      'Transfer-Encoding': 'chunked',
    });
  } catch (_error: unknown) {
    const error = _error as Error;
    context.error(`Error when processing chat-post request: ${error.message}`);
    return serviceUnavailable('Service temporarily unavailable. Please try again later.');
  }
}

async function* createJsonStream(chunks: AsyncIterable<string>, sessionId: string) {
  for await (const chunk of chunks) {
    if (!chunk) continue;

    const responseChunk: AIChatCompletionDelta = {
      delta: {
        content: chunk,
        role: 'assistant',
      },
      context: {
        sessionId,
      },
    };

    yield JSON.stringify(responseChunk) + '\n';
  }
}

app.setup({ enableHttpStream: true });

app.http('chats-post', {
  route: 'chats/stream',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: postChats,
});
