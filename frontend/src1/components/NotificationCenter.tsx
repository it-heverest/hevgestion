import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Clock,
  X,
  Check
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'deadline';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Balance importée',
    message: 'Votre balance comptable a été importée avec succès',
    timestamp: 'Il y a 5 min',
    read: false
  },
  {
    id: '2',
    type: 'deadline',
    title: 'Échéance TVA',
    message: 'La déclaration TVA est due dans 5 jours',
    timestamp: 'Il y a 1h',
    read: false
  },
  {
    id: '3',
    type: 'warning',
    title: 'Anomalie détectée',
    message: '3 comptes nécessitent une vérification',
    timestamp: 'Il y a 2h',
    read: true
  },
  {
    id: '4',
    type: 'info',
    title: 'Nouveau rapport',
    message: 'Le bilan actif a été généré',
    timestamp: 'Hier',
    read: true
  },
];

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'deadline':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = (type: string, read: boolean) => {
    if (read) return 'bg-muted/50';
    
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/10';
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-900/10';
      case 'deadline':
        return 'bg-blue-50 dark:bg-blue-900/10';
      default:
        return 'bg-blue-50 dark:bg-blue-900/10';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={markAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Tout marquer lu
            </Button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              Aucune notification
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="p-2 space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg transition-all ${getBackgroundColor(notification.type, notification.read)} ${
                    !notification.read ? 'border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-medium">
                          {notification.title}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 flex-shrink-0"
                          onClick={() => removeNotification(notification.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {notification.timestamp}
                        </span>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs px-2"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Marquer lu
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <Separator />
        
        <div className="p-2">
          <Button 
            variant="ghost" 
            className="w-full text-sm"
            onClick={() => setOpen(false)}
          >
            Voir toutes les notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
