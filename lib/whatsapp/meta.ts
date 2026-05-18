import 'server-only';

interface MetaSendInput {
  to: string;
  textBody: string;
  templateParams: string[];
}

interface MetaSendResponse {
  messageId: string;
  status: string;
}

const normalizePhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');

  if (cleaned.startsWith('0')) {
    return `9${cleaned}`;
  }

  if (cleaned.startsWith('90')) {
    return cleaned;
  }

  return cleaned;
};

export const sendWhatsappMessage = async ({
  to,
  textBody,
  templateParams,
}: MetaSendInput): Promise<MetaSendResponse> => {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v22.0';
  const templateName =
    process.env.WHATSAPP_TEMPLATE_NAME || 'jaspers_market_order_confirmation_v1';
  const templateLanguage = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US';

  if (!accessToken || !phoneNumberId) {
    throw new Error(
      'Missing WhatsApp Cloud API env vars: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID'
    );
  }

  const response = await fetch(
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalizePhone(to),
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: templateLanguage,
          },
          components: [
            {
              type: 'body',
              parameters: (templateParams.length ? templateParams : [textBody]).map((value) => ({
                type: 'text',
                text: value,
              })),
            },
          ],
        },
      }),
      cache: 'no-store',
    }
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`Meta WhatsApp send failed (${response.status}): ${JSON.stringify(payload)}`);
  }

  const messageId = payload?.messages?.[0]?.id;
  if (!messageId) {
    throw new Error('Meta WhatsApp send succeeded but response payload was missing messages[0].id');
  }

  return {
    messageId,
    status: payload?.messages?.[0]?.message_status || 'accepted',
  };
};
