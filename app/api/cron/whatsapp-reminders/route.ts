import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase/admin';
import { sendWhatsappMessage } from '@/lib/whatsapp/meta';

const APPOINTMENTS_COLLECTION = 'appointments';

interface AppointmentReminderDoc {
  patientName?: string;
  startTime?: Timestamp;
  reminderAt?: Timestamp | null;
  reminderStatus?: 'scheduled' | 'sent' | 'failed' | 'skipped';
  patients?: Array<{ name?: string; phone?: string }>;
}

const getFirstPhone = (patients: AppointmentReminderDoc['patients']): string | null => {
  if (!patients?.length) return null;

  const patientWithPhone = patients.find((patient) => Boolean(patient.phone?.trim()));
  return patientWithPhone?.phone?.trim() || null;
};

const formatAppointmentDate = (startTime: Timestamp) => {
  const date = startTime.toDate();
  return date.toLocaleString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Istanbul',
  });
};

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const headerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : null;
  const url = new URL(request.url);
  const queryToken = url.searchParams.get('secret')?.trim() || null;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || (headerToken !== cronSecret && queryToken !== cronSecret)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let snapshot;
  try {
    const adminDb = getAdminDb();
    const now = Timestamp.now();
    snapshot = await adminDb
      .collection(APPOINTMENTS_COLLECTION)
      .where('reminderAt', '<=', now)
      .limit(50)
      .get();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Firebase Admin error';
    return Response.json({ error: message }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data() as AppointmentReminderDoc;

    if (data.reminderStatus !== 'scheduled' || !data.startTime) {
      continue;
    }

    const phone = getFirstPhone(data.patients);
    if (!phone) {
      await doc.ref.update({
        reminderStatus: 'skipped',
        reminderError: 'No patient phone number',
      });
      skipped += 1;
      continue;
    }

    const patientName = data.patientName || 'Danışanımız';
    const appointmentDateText = formatAppointmentDate(data.startTime);

    try {
      const providerResult = await sendWhatsappMessage({
        to: phone,
        textBody: `Merhaba ${patientName}, Fizyocentro randevunuzu hatırlatmak isteriz. Randevu saatiniz: ${appointmentDateText}.`,
        templateParams: [patientName, doc.id, appointmentDateText],
      });

      await doc.ref.update({
        reminderStatus: 'sent',
        reminderSentAt: FieldValue.serverTimestamp(),
        reminderError: null,
        reminderProvider: 'meta',
        reminderProviderMessageId: providerResult.messageId,
        reminderProviderStatus: providerResult.status,
      });
      sent += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await doc.ref.update({
        reminderStatus: 'failed',
        reminderError: message.slice(0, 500),
        reminderProvider: 'meta',
      });
      failed += 1;
    }
  }

  return Response.json({
    success: true,
    processed: snapshot.size,
    sent,
    failed,
    skipped,
  });
}
