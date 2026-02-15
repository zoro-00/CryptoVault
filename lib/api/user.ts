// User and authentication service
import type { User, ApiResponse } from "@/lib/types";

// In-memory storage for demo (replace with database in production)
let users: User[] = [
  {
    id: "demo-user",
    email: "demo@cryptovault.com",
    name: "Demo User",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date(),
  },
];

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<ApiResponse<User>> {
  try {
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Get user error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get user",
    };
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(
  email: string,
): Promise<ApiResponse<User>> {
  try {
    const user = users.find((u) => u.email === email);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Get user by email error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get user",
    };
  }
}

/**
 * Create a new user
 */
export async function createUser(
  userData: Omit<User, "id" | "createdAt" | "updatedAt">,
): Promise<ApiResponse<User>> {
  try {
    // Check if user already exists
    const existingUser = users.find((u) => u.email === userData.email);
    if (existingUser) {
      return {
        success: false,
        error: "User with this email already exists",
      };
    }

    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(newUser);

    return {
      success: true,
      data: newUser,
      message: "User created successfully",
    };
  } catch (error) {
    console.error("Create user error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    };
  }
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: string,
  updates: Partial<Omit<User, "id" | "createdAt">>,
): Promise<ApiResponse<User>> {
  try {
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return {
        success: false,
        error: "User not found",
      };
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date(),
    };

    return {
      success: true,
      data: users[userIndex],
      message: "User updated successfully",
    };
  } catch (error) {
    console.error("Update user error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}

/**
 * Delete user
 */
export async function deleteUser(userId: string): Promise<ApiResponse<void>> {
  try {
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return {
        success: false,
        error: "User not found",
      };
    }

    users.splice(userIndex, 1);

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.error("Delete user error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}

/**
 * Mock authentication (replace with real auth in production)
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<ApiResponse<User>> {
  try {
    // This is a mock authentication - replace with real auth logic
    const user = users.find((u) => u.email === email);

    if (!user) {
      return {
        success: false,
        error: "Invalid credentials",
      };
    }

    // In production, verify password hash
    return {
      success: true,
      data: user,
      message: "Authentication successful",
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed",
    };
  }
}

/**
 * Get current demo user
 */
export function getDemoUser(): User {
  return users[0];
}
