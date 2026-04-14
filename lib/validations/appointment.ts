import { z } from 'zod';

const patientInfoSchema = z.object({
  name: z.string().min(1, 'İsim gereklidir').min(2, 'İsim en az 2 karakter olmalıdır'),
  phone: z.string().optional(), // Telefon numarası zorunlu değil
});

export const appointmentSchema = z
  .object({
    patientName: z.string().min(2, 'Hasta adı en az 2 karakter olmalıdır'),
    description: z.string().optional(), // Açıklama zorunlu değil
    startTime: z.date({
      message: 'Başlangıç zamanı gereklidir',
    }),
    endTime: z.date({
      message: 'Bitiş zamanı gereklidir',
    }),
    appointmentType: z.enum(['Ön Görüşme', 'Rutin Görüşme', 'Muayene'], {
      message: 'Randevu tipi seçilmelidir'
    }),
    serviceType: z.enum(['Fizik Tedavi'], {
      message: 'Hizmet tipi seçilmelidir'
    }),
    patients: z.array(patientInfoSchema).min(1, 'En az 1 kişi bilgisi gereklidir'),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'Bitiş zamanı başlangıç zamanından sonra olmalıdır',
    path: ['endTime'],
  })
  .refine((data) => {
    // Tüm kişilerin isimlerinin doldurulmuş olduğunu kontrol et
    return data.patients.every(patient => patient.name && patient.name.trim().length >= 2);
  }, {
    message: 'Tüm kişilerin isimleri girilmelidir (en az 2 karakter)',
    path: ['patients'],
  });

export type AppointmentSchema = z.infer<typeof appointmentSchema>;
