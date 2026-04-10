'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Appointment, AppointmentFormData } from '@/types';
import { appointmentSchema } from '@/lib/validations/appointment';
import { format } from 'date-fns';

interface AppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  appointment?: Appointment | null;
  initialStartTime?: Date;
  initialEndTime?: Date;
}

export function AppointmentModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  appointment,
  initialStartTime,
  initialEndTime,
}: AppointmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: '',
    description: '',
    startTime: initialStartTime || new Date(),
    endTime: initialEndTime || new Date(),
  });

  // Update form when appointment or initial times change
  useEffect(() => {
    if (appointment) {
      setFormData({
        patientName: appointment.patientName,
        description: appointment.description,
        startTime: appointment.startTime.toDate(),
        endTime: appointment.endTime.toDate(),
      });
    } else if (initialStartTime && initialEndTime) {
      setFormData({
        patientName: '',
        description: '',
        startTime: initialStartTime,
        endTime: initialEndTime,
      });
    }
  }, [appointment, initialStartTime, initialEndTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form data
      appointmentSchema.parse(formData);

      setLoading(true);
      await onSubmit(formData);
      handleClose();
    } catch (error: any) {
      if (error.errors) {
        const errorMap: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          errorMap[err.path[0]] = err.message;
        });
        setErrors(errorMap);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    if (confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) {
      try {
        setLoading(true);
        await onDelete();
        handleClose();
      } catch (error) {
        console.error('Delete error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      patientName: '',
      description: '',
      startTime: new Date(),
      endTime: new Date(),
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {appointment ? 'Randevuyu Düzenle' : 'Yeni Randevu Oluştur'}
          </DialogTitle>
          <DialogDescription>
            Hasta bilgilerini ve randevu detaylarını giriniz.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Patient Name */}
            <div className="grid gap-2">
              <Label htmlFor="patientName">Hasta Adı</Label>
              <Input
                id="patientName"
                value={formData.patientName}
                onChange={(e) =>
                  setFormData({ ...formData, patientName: e.target.value })
                }
                placeholder="Hasta adı giriniz"
              />
              {errors.patientName && (
                <p className="text-sm text-red-500">{errors.patientName}</p>
              )}
            </div>

            {/* Start Time */}
            <div className="grid gap-2">
              <Label htmlFor="startTime">Başlangıç Zamanı</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={format(formData.startTime, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    startTime: new Date(e.target.value),
                  })
                }
              />
              {errors.startTime && (
                <p className="text-sm text-red-500">{errors.startTime}</p>
              )}
            </div>

            {/* End Time */}
            <div className="grid gap-2">
              <Label htmlFor="endTime">Bitiş Zamanı</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={format(formData.endTime, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    endTime: new Date(e.target.value),
                  })
                }
              />
              {errors.endTime && (
                <p className="text-sm text-red-500">{errors.endTime}</p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Randevu detaylarını giriniz"
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            {appointment && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                Sil
              </Button>
            )}
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Kaydediliyor...' : appointment ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
