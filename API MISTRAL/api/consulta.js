import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "El array 'messages' es requerido." });
  }

  const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

  const systemPrompt = `
    Eres un asistente de desarrollo de software experto.
    Proporcionas respuestas claras, concisas y técnicas.
    Hablas en español, pero usas inglés para términos técnicos.
    Formatea siempre el código en bloques Markdown con el lenguaje especificado.
  `;

  try {
    const apiResponse = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MISTRAL_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ]
      })
    });

    if (!apiResponse.ok) {
        const errorBody = await apiResponse.json().catch(() => ({ message: 'Error desconocido en la API' }));
        console.error("Error desde la API de Mistral:", errorBody);
        return res.status(apiResponse.status).json({ error: errorBody.message });
    }

    const data = await apiResponse.json();
    
    return res.status(200).json({ 
        reply: data.choices[0].message.content,
        usage: data.usage 
    });

  } catch (error) {
    console.error("Error en la función serverless:", error);
    return res.status(500).json({ error: "Error interno del servidor en la función." });
  }
}