import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { API } from '@/config/api';
import { AUTH_CHANGED_EVENT } from '@/lib/auth';
import { useSocket } from './SocketContext';
import { invalidateAppointments } from '@/hooks/useAppointments';

export type NotificationType = 'appointment' | 'medication' | 'report' | 'system' | 'urgent';

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const NOTIFICATIONS_API = `${API}/notifications`;
const MAX_ITEMS = 50;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(NOTIFICATIONS_API, { withCredentials: true });
      setNotifications(res.data?.data?.notifications || []);
      setUnreadCount(res.data?.data?.unread || 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(AUTH_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, refresh);
  }, [refresh]);

  useEffect(() => {
    if (!socket) return;
    const handleNotification = (item: NotificationItem) => {
      setNotifications((prev) => [item, ...prev.filter((n) => n._id !== item._id)].slice(0, MAX_ITEMS));
      if (!item.read) setUnreadCount((count) => count + 1);
      if (item.type === 'appointment' || item.type === 'urgent') invalidateAppointments();
      const show = item.type === 'urgent' ? toast.warning : toast.info;
      show(item.title, { description: item.message, duration: 6000 });
    };
    socket.on('notification', handleNotification);
    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket]);

  const markRead = useCallback(async (id: string) => {
    const target = notifications.find((n) => n._id === id);
    if (!target || target.read) return;
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnreadCount((count) => Math.max(0, count - 1));
    try {
      await axios.put(`${NOTIFICATIONS_API}/${id}/read`, {}, { withCredentials: true });
    } catch {
      refresh();
    }
  }, [notifications, refresh]);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await axios.put(`${NOTIFICATIONS_API}/readAll`, {}, { withCredentials: true });
    } catch {
      refresh();
    }
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    const target = notifications.find((n) => n._id === id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (target && !target.read) setUnreadCount((count) => Math.max(0, count - 1));
    try {
      await axios.delete(`${NOTIFICATIONS_API}/${id}`, { withCredentials: true });
    } catch {
      refresh();
    }
  }, [notifications, refresh]);

  const clearAll = useCallback(async () => {
    setNotifications([]);
    setUnreadCount(0);
    try {
      await axios.delete(NOTIFICATIONS_API, { withCredentials: true });
    } catch {
      refresh();
    }
  }, [refresh]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, refresh, markRead, markAllRead, remove, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
}

export function timeAgo(date: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}
