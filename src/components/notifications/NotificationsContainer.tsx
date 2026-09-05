"use client";

import * as React from "react";
import { NotificationList } from "./NotificationList";
import {
  deleteNotificationLog,
  clearAllNotificationLogs,
  type NotificationItem,
} from "@/actions/notifications";

interface NotificationsContainerProps {
  initialLogs: NotificationItem[];
}

export function NotificationsContainer({
  initialLogs,
}: NotificationsContainerProps) {
  const [logs, setLogs] = React.useState<NotificationItem[]>(initialLogs);

  const handleDelete = async (id: string) => {
    const res = await deleteNotificationLog(id);
    if (res.success) {
      setLogs((prev) => prev.filter((item) => item.id !== id));
    } else {
      alert(res.error || "Failed to delete notification.");
    }
  };

  const handleClearAll = async () => {
    const res = await clearAllNotificationLogs();
    if (res.success) {
      setLogs([]);
    } else {
      alert(res.error || "Failed to clear notifications.");
    }
  };

  return (
    <NotificationList
      logs={logs}
      onDelete={handleDelete}
      onClearAll={handleClearAll}
    />
  );
}
