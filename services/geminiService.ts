
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult } from "../types";

export const extractBoletoData = async (base64Data: string, mimeType: string): Promise<ExtractionResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Você é um assistente especializado em documentos financeiros brasileiros (Boletos).
    Analise o documento e extraia com precisão:
    1. Valor total do boleto (número decimal).
    2. Data de vencimento (formato YYYY-MM-DD).
    3. Linha digitável ou Código de Barras.
    4. Nome do Beneficiário/Emissor (Empresa que emitiu o boleto).

    Retorne APENAS um objeto JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            value: { type: Type.NUMBER, description: "O valor total do boleto" },
            dueDate: { type: Type.STRING, description: "Data de vencimento no formato YYYY-MM-DD" },
            barcode: { type: Type.STRING, description: "Linha digitável ou código de barras completo" },
            issuer: { type: Type.STRING, description: "Nome da empresa emissora" }
          },
          required: ["value", "dueDate", "barcode", "issuer"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as ExtractionResult;
  } catch (error) {
    console.error("Erro na extração Gemini:", error);
    throw new Error("Não foi possível processar o boleto automaticamente.");
  }
};
