import { TokenManager } from './tokenManager';

// Check if user is authenticated on app startup
export const checkAuthStatus = () => {
  const accessToken = TokenManager.getAccessToken();
  
  if (!accessToken) {
    return false;
  }

  // Check if token is expired
  if (TokenManager.isTokenExpired(accessToken)) {
    TokenManager.clearTokens();
    return false;
  }

  return true;
};

// Get stored user data from localStorage
export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem('auth-storage');
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.state?.user || null;
    }
  } catch (error) {
    console.error('Error parsing stored user data:', error);
  }
  return null;
};

// Check if user has valid session
export const hasValidSession = () => {
  const hasToken = TokenManager.hasValidTokens();
  const hasUser = getStoredUser();
  
  return hasToken && hasUser;
};

// Clear all authentication data
export const clearAuthData = () => {
  TokenManager.clearTokens();
  localStorage.removeItem('auth-storage');
};

// Refresh authentication status
export const refreshAuthStatus = async () => {
  const accessToken = TokenManager.getAccessToken();
  
  if (!accessToken) {
    return false;
  }

  // Try to refresh token if expired
  if (TokenManager.isTokenExpired(accessToken)) {
    const newToken = await TokenManager.refreshAccessToken();
    return !!newToken;
  }

  return true;
};
