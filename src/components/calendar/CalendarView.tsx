import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CalendarEvent, Task } from '../../types';
import { getTodayString, formatDateLabel } from '../../lib/utils';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Trash2
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const {
    calendarEvents,
    tasks,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    timeBlockTask,
    addToast
  } = useAppStore();

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [viewType, setViewType] = useState<'day' | 'week'>('day');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState<'focus' | 'work' | 'fitness' | 'personal' | 'finance'>('focus');
  const [eventStartTime, setEventStartTime] = useState('09:00');
  const [eventEndTime, setEventEndTime] = useState('10:30');
  const [eventLocation, setEventLocation] = useState('');

  const uncompletedTasks = tasks.filter((t) => t.status !== 'done');

  const getWeekDates = (baseDateStr: string): string[] => {
    const base = new Date(baseDateStr);
    const dayOfWeek = base.getDay();
    const start = new Date(base);
    start.setDate(base.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));

    const week: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      week.push(d.toISOString().split('T')[0]);
    }
    return week;
  };

  const weekDates = getWeekDates(selectedDate);

  const timeSlots: string[] = [];
  for (let h = 6; h <= 22; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
  }

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleOpenNewEvent = (slotTime?: string) => {
    setSelectedEvent(null);
    setEventTitle('');
    setEventCategory('focus');
    setEventStartTime(slotTime || '10:00');
    const [h] = (slotTime || '10:00').split(':').map(Number);
    setEventEndTime(`${Math.min(23, h + 1).toString().padStart(2, '0')}:00`);
    setEventLocation('');
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (evt: CalendarEvent) => {
    setSelectedEvent(evt);
    setEventTitle(evt.title);
    setEventCategory(evt.category);
    setEventStartTime(evt.startTime);
    setEventEndTime(evt.endTime);
    setEventLocation(evt.location || '');
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    if (selectedEvent) {
      updateCalendarEvent(selectedEvent.id, {
        title: eventTitle.trim(),
        category: eventCategory,
        startTime: eventStartTime,
        endTime: eventEndTime,
        location: eventLocation.trim() || undefined,
      });
      addToast('Event Updated', `${eventTitle} updated`);
    } else {
      addCalendarEvent({
        title: eventTitle.trim(),
        date: selectedDate,
        startTime: eventStartTime,
        endTime: eventEndTime,
        category: eventCategory,
        location: eventLocation.trim() || undefined,
        color: '#71717a',
      });
    }
    setIsEventModalOpen(false);
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.id }));
  };

  const handleDropSlot = (e: React.DragEvent, slotTime: string, targetDate: string) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    try {
      const { taskId } = JSON.parse(data);
      if (taskId) {
        timeBlockTask(taskId, targetDate, slotTime);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getEventsForDate = (dateStr: string) => {
    return calendarEvents
      .filter((e) => e.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-display text-text-main tracking-tight">
              Calendar & Time-Blocking
            </h1>
            <span className="px-2 py-0.2 rounded text-[10px] font-mono text-text-subtle bg-surface-subtle border border-border">
              Timeline
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Drag backlog tasks directly into hourly slots for focused deep work execution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-surface-subtle rounded-lg border border-border">
            <button
              onClick={() => setViewType('day')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewType === 'day'
                  ? 'bg-zinc-800 text-text-main font-semibold shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewType('week')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewType === 'week'
                  ? 'bg-zinc-800 text-text-main font-semibold shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Week
            </button>
          </div>

          {/* Date Navigator */}
          <div className="flex items-center gap-1 bg-surface-subtle px-2 py-1 rounded-lg border border-border">
            <button
              onClick={() => shiftDate(viewType === 'day' ? -1 : -7)}
              className="p-0.5 rounded text-text-subtle hover:text-text-main cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-medium px-1 text-text-main">
              {formatDateLabel(selectedDate)}
            </span>
            <button
              onClick={() => shiftDate(viewType === 'day' ? 1 : 7)}
              className="p-0.5 rounded text-text-subtle hover:text-text-main cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenNewEvent()}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Event
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Backlog + Right Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left: Task Backlog */}
        <div className="lg:col-span-1 glass-panel rounded-xl p-3.5 border border-border flex flex-col h-[650px]">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-main">
                Task Backlog
              </h3>
              <p className="text-[10px] text-text-subtle">Drag onto timeline</p>
            </div>
            <span className="text-[10px] font-mono font-semibold text-text-muted bg-surface px-1.5 py-0.2 rounded border border-border">
              {uncompletedTasks.length}
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-0.5">
            {uncompletedTasks.length === 0 ? (
              <div className="py-10 text-center text-xs text-text-subtle">
                All tasks scheduled!
              </div>
            ) : (
              uncompletedTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className="p-2.5 rounded-lg bg-surface-subtle hover:bg-surface-hover border border-border hover:border-zinc-500 cursor-grab active:cursor-grabbing transition-colors select-none group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-text-subtle truncate">
                      {task.projectName || 'General'}
                    </span>
                    <span className="text-[10px] font-mono text-text-subtle">
                      {task.estimatedMinutes || 30}m
                    </span>
                  </div>

                  <p className="text-xs font-medium text-text-main">
                    {task.title}
                  </p>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-text-subtle">
                    <span className="capitalize">{task.priority}</span>
                    <span className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Drag to slot →
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Timeline View */}
        <div className="lg:col-span-3 glass-panel rounded-xl p-4 border border-border flex flex-col h-[650px]">
          {viewType === 'day' ? (
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-text-subtle" />
                  <h3 className="text-xs font-semibold text-text-main">
                    Timeline for {formatDateLabel(selectedDate)}
                  </h3>
                </div>
                <span className="text-[11px] text-text-subtle">
                  Click slot or drop task to allocate
                </span>
              </div>

              {timeSlots.map((slot) => {
                const slotEvents = getEventsForDate(selectedDate).filter((e) => {
                  const eventStartH = parseInt(e.startTime.split(':')[0]);
                  const slotH = parseInt(slot.split(':')[0]);
                  return eventStartH === slotH;
                });

                return (
                  <div
                    key={slot}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropSlot(e, slot, selectedDate)}
                    className="flex items-start gap-3 min-h-[48px] group relative py-1 border-b border-border/50 hover:bg-surface-subtle/50 rounded-lg px-2 transition-colors"
                  >
                    <div className="w-12 text-right text-[11px] font-mono text-text-subtle pt-1">
                      {slot}
                    </div>

                    <div className="flex-1 flex flex-wrap gap-2">
                      {slotEvents.length === 0 ? (
                        <div
                          onClick={() => handleOpenNewEvent(slot)}
                          className="w-full h-full min-h-[36px] flex items-center justify-start text-[11px] text-transparent hover:text-text-subtle cursor-pointer transition-colors"
                        >
                          <span className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                            <Plus className="w-3 h-3 text-text-subtle" /> Click to add block
                          </span>
                        </div>
                      ) : (
                        slotEvents.map((evt) => (
                          <div
                            key={evt.id}
                            onClick={() => handleEditEvent(evt)}
                            className="flex-1 min-w-[180px] p-2 rounded-lg bg-surface-subtle hover:bg-surface-hover border border-border hover:border-zinc-500 flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-1.5 h-6 rounded-full bg-zinc-400 shrink-0" />
                              <div className="min-w-0">
                                <h4 className="text-xs font-semibold text-text-main truncate">
                                  {evt.title}
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] text-text-subtle mt-0.5 font-mono">
                                  <span>{evt.startTime} - {evt.endTime}</span>
                                  {evt.location && <span>• {evt.location}</span>}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCalendarEvent(evt.id);
                              }}
                              className="p-1 rounded text-text-subtle hover:text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto flex-1 pb-2">
              <div className="grid grid-cols-7 gap-2 min-w-[560px] h-full">
                {weekDates.map((dateStr) => {
                  const isSelected = dateStr === selectedDate;
                  const isToday = dateStr === getTodayString();
                  const dayEvents = getEventsForDate(dateStr);

                  return (
                    <div
                      key={dateStr}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropSlot(e, '10:00', dateStr)}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`rounded-lg p-2.5 border flex flex-col transition-colors cursor-pointer min-h-[400px] ${
                        isSelected
                          ? 'bg-surface-subtle border-zinc-500 shadow-xs'
                          : 'bg-surface-subtle/40 border-border hover:border-zinc-600'
                      }`}
                    >
                      <div className="text-center pb-1.5 mb-1.5 border-b border-border">
                        <p className="text-[9px] uppercase font-semibold text-text-subtle">
                          {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <p className={`text-sm font-bold font-mono ${isToday ? 'text-text-main underline' : 'text-text-muted'}`}>
                          {new Date(dateStr).getDate()}
                        </p>
                      </div>

                      <div className="space-y-1 flex-1 overflow-y-auto">
                        {dayEvents.map((evt) => (
                          <div
                            key={evt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEvent(evt);
                            }}
                            className="p-1 rounded bg-surface border border-border text-[9px] font-medium truncate text-text-main hover:border-zinc-500"
                          >
                            <span className="font-mono text-text-subtle">{evt.startTime}</span> {evt.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event Create / Edit Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title={selectedEvent ? 'Edit Event' : 'Schedule Event / Time-Block'}
        subtitle={`Scheduled on ${formatDateLabel(selectedDate)}`}
      >
        <form onSubmit={handleSaveEvent} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Event Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Deep Work: System Architecture"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Category</label>
              <select
                value={eventCategory}
                onChange={(e) => setEventCategory(e.target.value as any)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-2.5 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              >
                <option value="focus">Focus / Deep Work</option>
                <option value="work">Work Meeting</option>
                <option value="fitness">Fitness / Health</option>
                <option value="personal">Personal</option>
                <option value="finance">Finance Review</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Start Time</label>
              <input
                type="time"
                value={eventStartTime}
                onChange={(e) => setEventStartTime(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-2.5 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">End Time</label>
              <input
                type="time"
                value={eventEndTime}
                onChange={(e) => setEventEndTime(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-2.5 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Location (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Focus Studio, Zoom link"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            {selectedEvent ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => {
                  deleteCalendarEvent(selectedEvent.id);
                  setIsEventModalOpen(false);
                }}
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsEventModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                {selectedEvent ? 'Update Event' : 'Save Event'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
