import { z } from 'zod';

export const appointmentSchema = z
  .object({
    patientName: z.string().min(2, 'Hasta adı en az 2 karakter olmalıdır'),
    description: z.string().min(5, 'Açıklama en az 5 karakter olmalıdır'),
    startTime: z.date({
      message: 'Başlangıç zamanı gereklidir',
    }),
    endTime: z.date({
      message: 'Bitiş zamanı gereklidir',
    }),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'Bitiş zamanı başlangıç zamanından sonra olmalıdır',
    path: ['endTime'],
  });

export type AppointmentSchema = z.infer<typeof appointmentSchema>;
