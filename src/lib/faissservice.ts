import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/openai";
import { TimeWeightedVectorStoreRetriever } from "langchain/retrievers/time_weighted";
import path from 'path';

interface SearchResult {
  metadata: { distance?: number, id?: number };
}

// Function to create and save FAISS index
export const createFaissIndex = async (texts: string[], metadata: any[]): Promise<void> => {
  const vectorStore = await FaissStore.fromTexts(texts, metadata, new OpenAIEmbeddings());
  const directory = path.join(__dirname, 'faiss_index');
  await vectorStore.save(directory);
};

// Function to search FAISS index using TimeWeightedVectorStoreRetriever
export const searchFaissIndex = async (query: string, k: number): Promise<{ documents: SearchResult[], distances: number[], indices: number[] }> => {
  const directory = path.join(__dirname, 'faiss_index');
  const vectorStore = await FaissStore.load(directory, new OpenAIEmbeddings());

  const retriever = new TimeWeightedVectorStoreRetriever({
    vectorStore,
    k,
    otherScoreKeys: ["importance"]
  });

  // Perform similarity search using the retriever
  const searchResults = await retriever.invoke(query);

  const distances: number[] = searchResults.map((result: SearchResult) => result.metadata?.distance || 0);
  const indices: number[] = searchResults.map((result: SearchResult, index: number) => result.metadata?.id || index);

  return { documents: searchResults, distances, indices };
};
