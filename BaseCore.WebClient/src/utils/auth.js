export const AUTH_STORAGE_KEYS = {
    token: 'token',
    username: 'username',
    role: 'role',
    user: 'user',
};

export const normalizeRole = (role) => String(role || '').trim().toLowerCase();

export const unwrapAuthPayload = (payload) => (
    payload?.data?.data
    || payload?.data?.result
    || payload?.data
    || payload?.result
    || payload
    || {}
);

export const getRoleFromUser = (userData) => (
    userData?.role
    || userData?.Role
    || userData?.user?.role
    || userData?.user?.Role
    || userData?.roles?.[0]
    || userData?.Roles?.[0]
    || localStorage.getItem(AUTH_STORAGE_KEYS.role)
    || ''
);

export const getUsernameFromUser = (userData) => (
    userData?.username
    || userData?.Username
    || userData?.userName
    || userData?.UserName
    || userData?.name
    || userData?.Name
    || userData?.user?.username
    || userData?.user?.Username
    || userData?.user?.userName
    || userData?.user?.UserName
    || localStorage.getItem(AUTH_STORAGE_KEYS.username)
    || ''
);

export const getTokenFromUser = (userData) => (
    userData?.token
    || userData?.Token
    || userData?.accessToken
    || userData?.AccessToken
    || userData?.jwt
    || userData?.Jwt
    || userData?.data?.token
    || userData?.data?.Token
    || ''
);

export const saveAuthSession = (userData) => {
    const token = getTokenFromUser(userData);
    const role = getRoleFromUser(userData);
    const username = getUsernameFromUser(userData);

    if (token) {
        localStorage.setItem(AUTH_STORAGE_KEYS.token, token);
    }

    localStorage.setItem(AUTH_STORAGE_KEYS.role, role);
    localStorage.setItem(AUTH_STORAGE_KEYS.username, username);
    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify({
        ...userData,
        role,
        username,
    }));

    return { token, role, username };
};

export const clearAuthSession = () => {
    Object.values(AUTH_STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
};

export const getStoredUser = () => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.user);
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
    const storedRole = localStorage.getItem(AUTH_STORAGE_KEYS.role);

    if (!storedUser || !token || !storedRole) {
        clearAuthSession();
        return null;
    }

    try {
        const parsedUser = JSON.parse(storedUser);
        const role = getRoleFromUser(parsedUser);

        if (!role) {
            clearAuthSession();
            return null;
        }

        return parsedUser;
    } catch {
        clearAuthSession();
        return null;
    }
};

export const isAdminRole = (role) => normalizeRole(role) === 'admin';

export const isUserRole = (role) => normalizeRole(role) === 'user';
