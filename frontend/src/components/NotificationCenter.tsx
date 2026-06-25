import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  X,
  Check,
  FileText,
  RefreshCw,
} from "lucide-react";
import {
  notificationService,
  AppNotification,
} from "../services/notification.service";

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      checkForNewNotifications();
      loadUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, showAll]);

  const loadNotifications = async (limit = showAll ? 100 : 50) => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(limit);
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  const checkForNewNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      const newNotifications = data.filter(
        (n) => !notifications.some((existing) => existing.id === n.id),
      );

      if (newNotifications.length > 0) {
        setNotifications(data);
        // Update unread count
        loadUnreadCount();
        // Show browser notifications for new ones
        newNotifications.forEach((notification) => {
          showBrowserNotification(notification);
        });
      }
    } catch (error) {
      console.error("Error checking for new notifications:", error);
    }
  };

  const showBrowserNotification = (notification: AppNotification) => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }

    if (Notification.permission === "granted") {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico", // You can customize this
        tag: notification.id, // Prevents duplicate notifications
      });

      browserNotification.onclick = () => {
        window.focus();
        setOpen(true);
        browserNotification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          showBrowserNotification(notification);
        }
      });
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      loadUnreadCount(); // Update unread count
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0); // All marked as read
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "WELCOME":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "GUIDE":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "BALANCE_IMPORTED":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "DSF_GENERATED":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "DEADLINE_APPROACHING":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "DAILY_GREETING":
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case "INACTIVITY_REMINDER":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "DSF_REMINDER":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBackgroundColor = (type: string, read: boolean) => {
    if (read) return "bg-gray-50";
    switch (type) {
      case "WELCOME":
      case "BALANCE_IMPORTED":
      case "DSF_GENERATED":
      case "DAILY_GREETING":
        return "bg-green-50";
      case "GUIDE":
        return "bg-blue-50";
      case "DEADLINE_APPROACHING":
      case "INACTIVITY_REMINDER":
        return "bg-orange-50";
      case "DSF_REMINDER":
        return "bg-red-50";
      default:
        return "bg-gray-50";
    }
  };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString("fr");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-3 left-1/2 transform -translate-x-1/2 h-5 min-w-[20px] p-0 flex items-center justify-center text-[10px] font-bold rounded-full border-2 border-background"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="h-3 w-3 mr-1" />
              Tout marquer lu
            </Button>
          )}
        </div>

        <ScrollArea className="h-72">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
              <Bell className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 transition-all ${getBackgroundColor(notification.type, notification.isRead)} ${
                    !notification.isRead ? "border-l-4 border-orange-600" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 flex-shrink-0"
                          onClick={() => removeNotification(notification.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">
                          {formatTimestamp(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Marquer lu
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator className="mt-auto" />
        <div className="p-2 space-y-1">
          <Button
            variant="ghost"
            className="w-full text-sm justify-start"
            onClick={() => {
              setShowAll(!showAll);
              loadNotifications(showAll ? 50 : 100);
            }}
          >
            {showAll ? "Voir moins" : "Voir toutes les notifications"}
          </Button>
          {notifications.length >= (showAll ? 100 : 50) && (
            <Button
              variant="ghost"
              className="w-full text-sm justify-start"
              onClick={() => setOpen(false)}
            >
              Fermer
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
