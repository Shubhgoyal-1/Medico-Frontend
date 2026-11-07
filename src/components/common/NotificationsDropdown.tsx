import React, { useState, useEffect, useRef } from 'react';
import {
  Bell, CheckCircle2, Calendar, Pill, FileText,
  AlertCircle, ShieldCheck, Trash2, ExternalLink, X, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationItem, timeAgo, useNotifications } from '@/context/NotificationContext';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDropdown({
  isOpen,
  onClose,
}: NotificationsDropdownProps) {
  const { notifications, unreadCount, loading, markRead, markAllRead, remove, clearAll, refresh } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen, refresh]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    remove(id);
  };

  const handleMarkAllRead = () => {
    markAllRead();
  };

  const handleClearAll = () => {
    clearAll();
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    return true;
  });

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'medication':
        return <Pill className="w-4 h-4 text-teal-600" />;
      case 'report':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getIconBg = (type: NotificationItem['type']) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-50 border border-blue-100';
      case 'medication':
        return 'bg-teal-50 border border-teal-100';
      case 'report':
        return 'bg-purple-50 border border-purple-100';
      case 'urgent':
        return 'bg-rose-50 border border-rose-100';
      default:
        return 'bg-emerald-50 border border-emerald-100';
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header (White, Blue, Teal Theme) */}
      <div className="p-4 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white ring-1 ring-white/30">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2 leading-tight">
              Notifications & Alerts
              {unreadCount > 0 && (
                <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} unread
                </span>
              )}
            </h3>
            <p className="text-[10px] text-blue-100">Live clinical & health updates</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/15 text-blue-100 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs & Quick Actions */}
      <div className="px-3.5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-gray-200">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2 py-0.5 rounded-md font-semibold text-[11px] transition-all ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveFilter('unread')}
            className={`px-2.5 py-0.5 rounded-md font-semibold text-[11px] transition-all ${
              activeFilter === 'unread'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-teal-600 hover:text-teal-700 font-bold text-[11px] flex items-center gap-1"
              title="Mark all as read"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Read all
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-gray-400 hover:text-rose-600 font-medium text-[11px] flex items-center gap-1"
              title="Clear notifications"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Notification Items List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
        {loading && notifications.length === 0 ? (
          <div className="p-8 flex items-center justify-center text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-200 stroke-1" />
            <p className="text-xs font-semibold text-gray-600">No notifications</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {activeFilter === 'unread'
                ? 'You have caught up with all health alerts!'
                : 'Your notifications will appear here.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                markRead(n._id);
                if (n.link) {
                  navigate(n.link);
                  onClose();
                }
              }}
              className={`p-3.5 transition-colors flex items-start gap-3 cursor-pointer group ${
                n.read ? 'bg-white hover:bg-slate-50/60' : 'bg-teal-50/30 hover:bg-teal-50/60'
              }`}
            >
              {/* Type Icon Badge */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${getIconBg(
                  n.type
                )}`}
              >
                {getIcon(n.type)}
              </div>

              {/* Text Body */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <h4
                    className={`text-xs truncate ${
                      n.read ? 'font-medium text-gray-700' : 'font-extrabold text-slate-900'
                    }`}
                  >
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-medium flex-shrink-0">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">{n.message}</p>

                {n.link && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-bold hover:underline pt-0.5">
                    View details <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              {/* Read / Unread Indicator & Delete */}
              <div className="flex items-center gap-1 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block ring-2 ring-blue-100" />
                )}
                <button
                  onClick={(e) => handleDelete(n._id, e)}
                  className="p-1 rounded text-gray-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Remove notification"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
        <span className="text-[10px] text-gray-400 font-medium">
          Medico Healthcare Notification System
        </span>
      </div>
    </div>
  );
}
