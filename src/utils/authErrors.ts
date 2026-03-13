export const getAuthErrorMessage = (error: any): string => {
  if (!error || !error.code) {
    return error?.message || 'An unexpected error occurred. Please try again.';
  }

  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email is already in use by another account.';
    case 'auth/invalid-email':
      return 'The email address is invalid.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'The password is too weak. Please use a stronger password.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'The sign-in popup was closed before completing.';
    case 'auth/network-request-failed':
      return 'A network error occurred. Please check your connection and try again.';
    case 'auth/requires-recent-login':
      return 'This operation requires a recent login. Please log out and log back in.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address but different sign-in credentials.';
    case 'auth/invalid-action-code':
      return 'The action code is invalid. This can happen if the code is malformed, expired, or has already been used.';
    case 'auth/expired-action-code':
      return 'The action code has expired. Please request a new one.';
    default:
      return error.message || 'An unexpected authentication error occurred.';
  }
};
