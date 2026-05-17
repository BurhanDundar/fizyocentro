import 'server-only';

interface TwilioSendInput {
  to: string;
  body: string;
}

interface TwilioMessageResponse {
  sid: string;
  status: string;
}

const normalizePhone = (value: string): string => {
  const cleaned = value.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  if (cleaned.startsWith('0')) {
    return `+9${cleaned}`;
  }

  return `+${cleaned}`;
};

export const sendWhatsappMessage = async ({
  to,
  body,
}: TwilioSendInput): Promise<TwilioMessageResponse> => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error(
      'Missing Twilio env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM'
    );
  }

  const params = new URLSearchParams({
    From: `whatsapp:${normalizePhone(fromNumber)}`,
    To: `whatsapp:${normalizePhone(to)}`,
    Body: body,
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Twilio send failed (${response.status}): ${errorText}`);
  }

  const payload = (await response.json()) as Partial<TwilioMessageResponse>;
  if (!payload.sid || !payload.status) {
    throw new Error('Twilio send succeeded but response payload was missing sid/status');
  }

  return {
    sid: payload.sid,
    status: payload.status,
  };
};
