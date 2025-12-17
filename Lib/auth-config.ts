// Admin email configuration
export const ADMIN_EMAILS = [
    'nhitny2802@gmail.com'
];

// Check if user is admin
export const isAdmin = (email: string | null | undefined): boolean => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
};

// Check if user is authenticated
export const isAuthenticated = (user: any): boolean => {
    return !!user;
};
