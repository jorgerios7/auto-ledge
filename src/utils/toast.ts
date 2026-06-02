import Toast from 'react-native-toast-message';

export const ToastService = {
    showError: (title: string, message?: string) => {
        Toast.show({
            type: 'error',
            text1: title,
            text2: message,
            position: 'top',
            visibilityTime: 4000,
            autoHide: true,
            topOffset: 60,
        });
    },

    showSuccess: (title: string, message?: string) => {
        Toast.show({
            type: 'success',
            text1: title,
            text2: message,
            position: 'top',
            visibilityTime: 4000,
            autoHide: true,
            topOffset: 60,
        });
    },

    showInfo: (title: string, message?: string) => {
        Toast.show({
            type: 'info',
            text1: title,
            text2: message,
            position: 'top',
            visibilityTime: 4000,
            autoHide: true,
            topOffset: 60,
        });
    }
};