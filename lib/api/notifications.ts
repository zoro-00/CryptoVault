// Notifications service
import type { Notification, ApiResponse, PaginatedResponse } from "@/lib/types";

// In-memory storage for demo (replace with database in production)
let notifications: Notification[] = [
  {
    id: "1",
    userId: "demo-user",
    title: "Bitcoin Alert",
    message: "BTC reached $50,000!",
    type: "price_alert",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 min ago
    metadata: {
      coinId: "bitcoin",
      price: 50000,
      condition: "above",
    },
  },
  {
    id: "2",
    userId: "demo-user",
    title: "Portfolio Update",
    message: "Your portfolio is up 5.2% today",
    type: "success",
    read: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    link: "/portfolio",
  },
  {
    id: "3",
    userId: "demo-user",
    title: "New Feature",
    message: "Check out our new staking feature",
    type: "info",
    read: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    link: "/staking",
  },
  {
    id: "4",
    userId: "demo-user",
    title: "Security Alert",
    message: "New login from Chrome on Windows",
    type: "warning",
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: "5",
    userId: "demo-user",
    title: "Ethereum Update",
    message: "ETH dropped below $2,500",
    type: "price_alert",
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    metadata: {
      coinId: "ethereum",
      price: 2499,
      condition: "below",
    },
  },
];

/**
 * Get all notifications for a user
 */
export async function getNotifications(
  userId: string,
  options: { page?: number; limit?: number; unreadOnly?: boolean } = {},
): Promise<PaginatedResponse<Notification>> {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = options;

    let userNotifications = notifications.filter((n) => n.userId === userId);

    if (unreadOnly) {
      userNotifications = userNotifications.filter((n) => !n.read);
    }

    // Sort by createdAt desc
    userNotifications.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    const total = userNotifications.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = userNotifications.slice(start, end);

    return {
      success: true,
      data: paginatedData,
      page,
      limit,
      total,
      hasMore: end < total,
    };
  } catch (error) {
    console.error("Get notifications error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get notifications",
      data: [],
      page: 1,
      limit: 20,
      total: 0,
      hasMore: false,
    };
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(
  userId: string,
): Promise<ApiResponse<number>> {
  try {
    const count = notifications.filter(
      (n) => n.userId === userId && !n.read,
    ).length;
    return {
      success: true,
      data: count,
    };
  } catch (error) {
    console.error("Get unread count error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get unread count",
      data: 0,
    };
  }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(
  notificationId: string,
  userId: string,
): Promise<ApiResponse<Notification>> {
  try {
    const notification = notifications.find(
      (n) => n.id === notificationId && n.userId === userId,
    );

    if (!notification) {
      return {
        success: false,
        error: "Notification not found",
      };
    }

    notification.read = true;

    return {
      success: true,
      data: notification,
      message: "Notification marked as read",
    };
  } catch (error) {
    console.error("Mark as read error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark as read",
    };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(
  userId: string,
): Promise<ApiResponse<number>> {
  try {
    let count = 0;
    notifications.forEach((n) => {
      if (n.userId === userId && !n.read) {
        n.read = true;
        count++;
      }
    });

    return {
      success: true,
      data: count,
      message: `Marked ${count} notifications as read`,
    };
  } catch (error) {
    console.error("Mark all as read error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to mark all as read",
      data: 0,
    };
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: string,
  userId: string,
): Promise<ApiResponse<void>> {
  try {
    const index = notifications.findIndex(
      (n) => n.id === notificationId && n.userId === userId,
    );

    if (index === -1) {
      return {
        success: false,
        error: "Notification not found",
      };
    }

    notifications.splice(index, 1);

    return {
      success: true,
      message: "Notification deleted",
    };
  } catch (error) {
    console.error("Delete notification error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete notification",
    };
  }
}

/**
 * Create a new notification
 */
export async function createNotification(
  notification: Omit<Notification, "id" | "createdAt">,
): Promise<ApiResponse<Notification>> {
  try {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      createdAt: new Date(),
    };

    notifications.unshift(newNotification);

    return {
      success: true,
      data: newNotification,
      message: "Notification created",
    };
  } catch (error) {
    console.error("Create notification error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create notification",
    };
  }
}
