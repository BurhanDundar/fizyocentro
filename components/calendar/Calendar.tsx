'use client';

import { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg, EventResizeDoneArg } from '@fullcalendar/interaction';
import { EventClickArg, EventInput, EventDropArg } from '@fullcalendar/core';
import { Appointment, AppointmentFormData } from '@/types';
import { AppointmentModal } from '@/components/appointment/AppointmentModal';
import {
  createAppointment,
  updateAppointment,
  deleteAppointment,
  subscribeToUserAppointments,
} from '@/services/appointment.service';
import { useAuth } from '@/hooks/useAuth';

interface CalendarProps {
  selectedUserId: string;
}

export function Calendar({ selectedUserId }: CalendarProps) {
  const { user } = useAuth();
  const calendarRef = useRef<FullCalendar>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  // Subscribe to appointments based on role and selected user
  useEffect(() => {
    if (!user) return;
    if (!selectedUserId) return; // Wait for selectedUserId to be set

    let unsubscribe: (() => void) | undefined;

    // Always view specific user's appointments (selectedUserId is always set now)
    unsubscribe = subscribeToUserAppointments(selectedUserId, setAppointments);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, selectedUserId]);

  // Convert appointments to FullCalendar events
  const events: EventInput[] = appointments.map((appointment) => ({
    id: appointment.id,
    title: appointment.patientName,
    start: appointment.startTime.toDate(),
    end: appointment.endTime.toDate(),
    extendedProps: {
      description: appointment.description,
      userId: appointment.userId,
    },
    backgroundColor: getColorForUser(appointment.userId),
    borderColor: getColorForUser(appointment.userId),
  }));

  // Handle date/time slot click (create new appointment)
  const handleDateClick = (arg: DateClickArg) => {
    const startTime = arg.date;
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour

    setSelectedAppointment(null);
    setSelectedSlot({ start: startTime, end: endTime });
    setModalOpen(true);
  };

  // Handle event click (edit appointment)
  const handleEventClick = (arg: EventClickArg) => {
    const appointment = appointments.find((a) => a.id === arg.event.id);
    if (appointment) {
      setSelectedAppointment(appointment);
      setSelectedSlot(null);
      setModalOpen(true);
    }
  };

  // Handle event drop (drag and drop)
  const handleEventDrop = async (arg: EventDropArg) => {
    const appointment = appointments.find((a) => a.id === arg.event.id);
    if (!appointment) {
      arg.revert();
      return;
    }

    try {
      const newStartTime = arg.event.start;
      const newEndTime = arg.event.end;

      if (!newStartTime || !newEndTime) {
        arg.revert();
        return;
      }

      // Calculate duration from original appointment
      const originalDuration = appointment.endTime.toDate().getTime() - appointment.startTime.toDate().getTime();
      const calculatedEndTime = new Date(newStartTime.getTime() + originalDuration);

      // Update appointment with new times
      await updateAppointment(appointment.id, {
        patientName: appointment.patientName,
        description: appointment.description,
        startTime: newStartTime,
        endTime: calculatedEndTime,
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      arg.revert();
    }
  };

  // Handle event resize (büyütme/küçültme)
  const handleEventResize = async (arg: EventResizeDoneArg) => {
    const appointment = appointments.find((a) => a.id === arg.event.id);
    if (!appointment) {
      arg.revert();
      return;
    }

    try {
      const newStartTime = arg.event.start;
      const newEndTime = arg.event.end;

      if (!newStartTime || !newEndTime) {
        arg.revert();
        return;
      }

      // Update appointment with new times
      await updateAppointment(appointment.id, {
        patientName: appointment.patientName,
        description: appointment.description,
        startTime: newStartTime,
        endTime: newEndTime,
      });
    } catch (error) {
      console.error('Error resizing appointment:', error);
      arg.revert();
    }
  };

  // Handle create appointment
  const handleCreateAppointment = async (data: AppointmentFormData) => {
    if (!user) return;

    // Use selectedUserId if available, otherwise use current user's id
    const userId = selectedUserId || user.id;
    await createAppointment(userId, data);
  };

  // Handle update appointment
  const handleUpdateAppointment = async (data: AppointmentFormData) => {
    if (!selectedAppointment) return;
    await updateAppointment(selectedAppointment.id, data);
  };

  // Handle delete appointment
  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;
    await deleteAppointment(selectedAppointment.id);
  };

  const handleModalSubmit = async (data: AppointmentFormData) => {
    if (selectedAppointment) {
      await handleUpdateAppointment(data);
    } else {
      await handleCreateAppointment(data);
    }
  };

  return (
    <>
      <div className="calendar-container bg-white rounded-lg shadow p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          customButtons={{
            timeGridWeek: {
              text: 'Hafta',
              click: function() {
                const calendarApi = calendarRef.current?.getApi();
                if (calendarApi) {
                  calendarApi.changeView('timeGridWeek');
                  calendarApi.today();
                }
              }
            },
            timeGridDay: {
              text: 'Gün',
              click: function() {
                const calendarApi = calendarRef.current?.getApi();
                if (calendarApi) {
                  calendarApi.changeView('timeGridDay');
                  calendarApi.today();
                }
              }
            }
          }}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          slotDuration="00:30:00"
          allDaySlot={false}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          eventResizableFromStart={true}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          height="auto"
          locale="tr"
          firstDay={1}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          buttonText={{
            today: 'Bugün',
            month: 'Ay',
            week: 'Hafta',
            day: 'Gün',
          }}
        />
      </div>

      <AppointmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        onDelete={selectedAppointment ? handleDeleteAppointment : undefined}
        appointment={selectedAppointment}
        initialStartTime={selectedSlot?.start}
        initialEndTime={selectedSlot?.end}
      />
    </>
  );
}

// Helper function to generate consistent colors for users
function getColorForUser(userId: string): string {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
  ];

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
