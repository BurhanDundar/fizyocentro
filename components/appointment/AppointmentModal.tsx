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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Appointment, AppointmentFormData } from '@/types';
import { appointmentSchema } from '@/lib/validations/appointment';
import { format, isValid } from 'date-fns';

interface AppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  onDeleteRecurringGroup?: (recurringGroupId: string) => Promise<void>;
  appointment?: Appointment | null;
  initialStartTime?: Date;
  initialEndTime?: Date;
}

export function AppointmentModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  onDeleteRecurringGroup,
  appointment,
  initialStartTime,
  initialEndTime,
}: AppointmentModalProps) {
  const toDateTimeLocalValue = (value: Date): string =>
    isValid(value) ? format(value, "yyyy-MM-dd'T'HH:mm") : '';

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorKey, setErrorKey] = useState(0);
  const [isRecurring, setIsRecurring] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteAllRecurring, setDeleteAllRecurring] = useState(false);

  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: '',
    description: '',
    startTime: initialStartTime || new Date(),
    endTime: initialEndTime || new Date(),
    recurring: {
      type: 'none',
      count: 1,
    },
    appointmentType: 'Ön Görüşme',
    serviceType: 'Fizik Tedavi',
    patients: [{ name: '', phone: '' }],
  });

  // Update form when appointment or initial times change
  useEffect(() => {
    if (appointment) {
      setFormData({
        patientName: appointment.patientName,
        description: appointment.description,
        startTime: appointment.startTime.toDate(),
        endTime: appointment.endTime.toDate(),
        recurring: {
          type: 'none',
          count: 1,
        },
        appointmentType: appointment.appointmentType || 'Ön Görüşme',
        serviceType: appointment.serviceType || 'Fizik Tedavi',
        patients: appointment.patients || [{ name: '', phone: '' }],
      });
      setIsRecurring(false);
    } else if (initialStartTime && initialEndTime) {
      setFormData({
        patientName: '',
        description: '',
        startTime: initialStartTime,
        endTime: initialEndTime,
        recurring: {
          type: 'none',
          count: 1,
        },
        appointmentType: 'Ön Görüşme',
        serviceType: 'Fizik Tedavi',
        patients: [{ name: '', phone: '' }],
      });
      setIsRecurring(false);
    }
  }, [appointment, initialStartTime, initialEndTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorKey(prev => prev + 1); // Trigger animation on every submit

    try {
      // Auto-populate patientName from first patient for backwards compatibility
      const submissionData = {
        ...formData,
        patientName: formData.patients[0]?.name || '',
      };

      console.log('Form data before validation:', submissionData);

      // Validate form data
      appointmentSchema.parse(submissionData);

      setLoading(true);
      await onSubmit(submissionData);
      handleClose();
    } catch (error: any) {
      console.error('Validation error:', error);

      if (error.issues && Array.isArray(error.issues)) {
        // Zod validation error - hem field bazlı hem de genel message
        const newErrors: Record<string, string> = {};
        const errorMessagesSet = new Set<string>();

        error.issues.forEach((issue: any) => {
          const fieldPath = issue.path[0];
          if (fieldPath) {
            newErrors[fieldPath] = issue.message;
          }
          // Custom mesajları veya en spesifik mesajı ekle
          if (issue.code === 'custom' || issue.path.length === 1) {
            errorMessagesSet.add(issue.message);
          }
          console.log('Validation issue:', issue.path.join('.'), issue.message);
        });

        // Eğer hiç custom mesaj yoksa, tüm mesajları ekle
        if (errorMessagesSet.size === 0) {
          error.issues.forEach((issue: any) => {
            errorMessagesSet.add(issue.message);
          });
        }

        if (errorMessagesSet.size > 0) {
          newErrors.submit = Array.from(errorMessagesSet).join('\n');
        }

        setErrors(newErrors);
      } else {
        // Other errors (Firebase, network, etc.)
        setErrors({ submit: error.message || 'Bir hata oluştu' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!onDelete) return;
    setDeleteAllRecurring(false); // Reset checkbox
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!onDelete) return;

    try {
      setLoading(true);

      // Check if should delete all recurring
      if (deleteAllRecurring && appointment?.recurringGroupId && onDeleteRecurringGroup) {
        await onDeleteRecurringGroup(appointment.recurringGroupId);
      } else {
        await onDelete();
      }

      setShowDeleteDialog(false);
      handleClose();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Don't reset form data here - let useEffect handle it on next open
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {/* Overlay when delete dialog is open */}
        {showDeleteDialog && (
          <div className="absolute inset-0 bg-gray-900/50 z-[55] rounded-xl" />
        )}

        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {appointment ? 'Randevuyu Düzenle' : 'Yeni Randevu Oluştur'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Hasta bilgilerini ve randevu detaylarını giriniz.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
            {/* Appointment Type */}
            <div className="grid gap-2">
              <Label htmlFor="appointmentType">Randevu Tipi</Label>
              <Select
                value={formData.appointmentType}
                onValueChange={(value) =>
                  setFormData({ ...formData, appointmentType: value as 'Ön Görüşme' | 'Rutin Görüşme' | 'Muayene' })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ön Görüşme">Ön Görüşme</SelectItem>
                  <SelectItem value="Rutin Görüşme">Rutin Görüşme</SelectItem>
                  <SelectItem value="Muayene">Muayene</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Service Type */}
            <div className="grid gap-2">
              <Label htmlFor="serviceType">Randevu Hizmeti</Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value) =>
                  setFormData({ ...formData, serviceType: value as 'Fizik Tedavi' })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fizik Tedavi">Fizik Tedavi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Number of Patients */}
            <div className="grid gap-2">
              <Label htmlFor="patientCount">Kişi Sayısı</Label>
              <Select
                value={formData.patients.length.toString()}
                onValueChange={(value) => {
                  if (!value) return;
                  const count = parseInt(value, 10);
                  const newPatients = Array.from({ length: count }, (_, i) =>
                    formData.patients[i] || { name: '', phone: '' }
                  );
                  setFormData({ ...formData, patients: newPatients });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Kişi</SelectItem>
                  <SelectItem value="2">2 Kişi</SelectItem>
                  <SelectItem value="3">3 Kişi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Patient Information */}
            {formData.patients.map((patient, index) => (
              <div key={index} className="grid gap-2 border-t pt-3 mt-2">
                <h4 className="text-sm font-medium">{index + 1}. Kişi Bilgileri</h4>

                <div className="grid gap-2">
                  <Label htmlFor={`patient-name-${index}`}>İsim Soyisim</Label>
                  <Input
                    key={`patient-name-${index}-${errorKey}`}
                    id={`patient-name-${index}`}
                    value={patient.name}
                    onChange={(e) => {
                      const newPatients = [...formData.patients];
                      newPatients[index] = { ...newPatients[index], name: e.target.value };
                      setFormData({ ...formData, patients: newPatients });
                    }}
                    placeholder="İsim Soyisim"
                    className={errors.patients ? 'input-error' : ''}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`patient-phone-${index}`}>Telefon Numarası (Opsiyonel)</Label>
                  <Input
                    id={`patient-phone-${index}`}
                    value={patient.phone || ''}
                    onChange={(e) => {
                      const newPatients = [...formData.patients];
                      newPatients[index] = { ...newPatients[index], phone: e.target.value };
                      setFormData({ ...formData, patients: newPatients });
                    }}
                    placeholder="0555 123 45 67 (opsiyonel)"
                  />
                </div>
              </div>
            ))}

            {/* Start Time */}
            <div className="grid gap-2">
              <Label htmlFor="startTime">Başlangıç Zamanı</Label>
              <Input
                key={`startTime-${errorKey}`}
                id="startTime"
                type="datetime-local"
                value={toDateTimeLocalValue(formData.startTime)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    startTime: new Date(e.target.value),
                  })
                }
                className={errors.startTime ? 'input-error' : ''}
              />
              {errors.startTime && (
                <p className="text-sm text-red-500">{errors.startTime}</p>
              )}
            </div>

            {/* End Time */}
            <div className="grid gap-2">
              <Label htmlFor="endTime">Bitiş Zamanı</Label>
              <Input
                key={`endTime-${errorKey}`}
                id="endTime"
                type="datetime-local"
                value={toDateTimeLocalValue(formData.endTime)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    endTime: new Date(e.target.value),
                  })
                }
                className={errors.endTime ? 'input-error' : ''}
              />
              {errors.endTime && (
                <p className="text-sm text-red-500">{errors.endTime}</p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
              <Textarea
                key={`description-${errorKey}`}
                id="description"
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Randevu detaylarını giriniz (opsiyonel)"
                rows={4}
                className={errors.description ? 'input-error' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Recurring Appointment - only show when creating new */}
            {!appointment && (
              <div className="grid gap-3 border-t pt-3 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recurring"
                    checked={isRecurring}
                    onCheckedChange={(checked) => {
                      setIsRecurring(checked === true);
                      if (!checked) {
                        setFormData({
                          ...formData,
                          recurring: {
                            type: 'none',
                            count: 1,
                          },
                        });
                      } else {
                        setFormData({
                          ...formData,
                          recurring: {
                            type: 'daily',
                            count: 1,
                          },
                        });
                      }
                    }}
                  />
                  <Label
                    htmlFor="recurring"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Tekrarlı Randevu
                  </Label>
                </div>

                {isRecurring && (
                  <div className="grid gap-3 pl-6">
                    {/* Recurring Type */}
                    <div className="grid gap-2">
                      <Label htmlFor="recurringType">Tekrar Sıklığı</Label>
                      <Select
                        value={formData.recurring?.type || 'daily'}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            recurring: {
                              ...formData.recurring!,
                              type: value as 'daily' | 'weekly' | 'monthly',
                            },
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Her Gün</SelectItem>
                          <SelectItem value="weekly">Her Hafta</SelectItem>
                          <SelectItem value="monthly">Her Ay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Recurring Count */}
                    <div className="grid gap-2">
                      <Label htmlFor="recurringCount">
                        {formData.recurring?.type === 'daily' && 'Kaç Gün?'}
                        {formData.recurring?.type === 'weekly' && 'Kaç Hafta?'}
                        {formData.recurring?.type === 'monthly' && 'Kaç Ay?'}
                      </Label>
                      <Input
                        id="recurringCount"
                        type="text"
                        inputMode="numeric"
                        value={formData.recurring?.count === 0 ? '' : formData.recurring?.count || ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ''); // Sadece rakam
                          if (value === '') {
                            setFormData({
                              ...formData,
                              recurring: {
                                ...formData.recurring!,
                                count: 0,
                              },
                            });
                          } else {
                            const numValue = parseInt(value);
                            if (numValue >= 1 && numValue <= 365) {
                              setFormData({
                                ...formData,
                                recurring: {
                                  ...formData.recurring!,
                                  count: numValue,
                                },
                              });
                            }
                          }
                        }}
                        placeholder="1"
                      />
                      <p className="text-xs text-gray-500">
                        {formData.recurring?.count || 1} randevu oluşturulacak
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* General error message */}
          {errors.submit && typeof errors.submit === 'string' && (
            <div className="rounded-md bg-red-50 p-3 border border-red-200">
              <div className="text-sm text-red-800 space-y-1">
                {errors.submit.split('\n').filter(msg => msg.trim()).map((msg, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span>{msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Randevuyu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Randevuyu silmek istediğinizden emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Recurring checkbox - only show if this is a recurring appointment */}
          {appointment?.recurringGroupId && onDeleteRecurringGroup && (
            <div className="flex items-center space-x-2 py-4">
              <Checkbox
                id="deleteAllRecurring"
                checked={deleteAllRecurring}
                onCheckedChange={(checked) => setDeleteAllRecurring(checked === true)}
              />
              <Label
                htmlFor="deleteAllRecurring"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Bağlı tüm tekrarlı randevuları da sil
              </Label>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={loading}
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteAllRecurring(false);
              }}
            >
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Siliniyor...' : 'Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
