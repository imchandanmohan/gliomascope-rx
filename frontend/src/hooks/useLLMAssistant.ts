import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function useLLMAssistant(apiKey: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  const sendToGemini = async (inputImage?: string, maskImage?: string, userQuery?: string) => {
    if (!apiKey) throw new Error("Gemini API key missing");

    const newMessage: Message = { role: "user", content: userQuery || "Analyze this case." };
    setMessages((prev) => [...prev, newMessage]);

    const prompt = `
You are a radiology AI assistant analyzing brain MRI segmentation results.

Context:
- The first image is a grayscale MRI slice (T1/T2 or FLAIR).
- The second image is the segmentation overlay showing the tumor region.
- You should identify the tumor type (if visible), relative location (frontal/parietal/etc.), 
  estimate coverage %, and mention any diagnostic observations.

Please respond concisely and clinically, in a structured format:
1. Observed Region:
2. Tumor Characteristics:
3. Confidence or Artifacts:
4. Recommendation:
`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            ...(inputImage
              ? [{ inline_data: { mime_type: "image/png", data: inputImage.split(",")[1] } }]
              : []),
            ...(maskImage
              ? [{ inline_data: { mime_type: "image/png", data: maskImage.split(",")[1] } }]
              : []),
            { text: userQuery || "" },
          ],
        },
      ],
    };

    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    const newHistory = [...messages, newMessage, { role: "assistant", content: reply }];
    setMessages(newHistory);
    return reply;
  };

  return { messages, sendToGemini };
}