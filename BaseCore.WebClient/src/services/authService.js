import api from './api';
import { saveAuthSession, unwrapAuthPayload } from '../utils/auth';

export const loginWithCredentials = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const userData = unwrapAuthPayload(response.data);
    const session = saveAuthSession({
        ...userData,
        username: userData?.username || userData?.Username || userData?.userName || userData?.UserName || username,
    });

    if (!session.token || !session.role) {
        throw new Error('Login response is missing token or role');
    }

    return {
        userData: {
            ...userData,
            role: session.role,
            username: session.username,
        },
        ...session,
    };
};

export default {
    loginWithCredentials,
};
