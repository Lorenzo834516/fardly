// Envío de mensajes por WhatsApp Business Cloud API (Meta).
//
// IMPORTANTE: para mensajes que el NEGOCIO inicia (como un saludo
// de cumpleaños, no una respuesta a algo que el cliente escribió),
// Meta exige usar una "plantilla" (template) previamente creada y
// aprobada en tu cuenta de Meta Business. No se puede mandar texto
// libre en ese caso.

const GRAPH_API_VERSION = 'v20.0';

type SendTemplateParams = {
  phoneNumberId: string;
  accessToken: string;
  to: string; // número del cliente, formato internacional sin '+' (ej: 50760000000)
  templateName: string;
  languageCode?: string; // ej: 'es' o 'es_PA'
  bodyParams?: string[]; // valores para las {{1}}, {{2}}... de la plantilla
};

export async function sendWhatsAppTemplate({
  phoneNumberId,
  accessToken,
  to,
  templateName,
  languageCode = 'es',
  bodyParams = [],
}: SendTemplateParams) {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components: bodyParams.length
        ? [
            {
              type: 'body',
              parameters: bodyParams.map((text) => ({ type: 'text', text })),
            },
          ]
        : undefined,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`WhatsApp API error (${res.status}): ${errorBody}`);
  }

  return res.json();
}