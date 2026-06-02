import React from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { colors } from '../theme/colors';

export function CustomToast() {
    const toastConfig = {
        success: (props: any) => (
            <BaseToast
                {...props}
                style={{ borderLeftColor: colors.success, backgroundColor: colors.surface, borderRightWidth: 0, borderTopWidth: 0, borderBottomWidth: 0 }}
                contentContainerStyle={{ paddingHorizontal: 15 }}
                text1Style={{ color: colors.text, fontSize: 15, fontWeight: 'bold' }}
                text2Style={{ color: colors.textMuted, fontSize: 13 }}
            />
        ),
        error: (props: any) => (
            <ErrorToast
                {...props}
                style={{ borderLeftColor: colors.error, backgroundColor: colors.surface, borderRightWidth: 0, borderTopWidth: 0, borderBottomWidth: 0 }}
                contentContainerStyle={{ paddingHorizontal: 15 }}
                text1Style={{ color: colors.text, fontSize: 15, fontWeight: 'bold' }}
                text2Style={{ color: colors.textMuted, fontSize: 13 }}
            />
        ),
        info: (props: any) => (
            <BaseToast
                {...props}
                style={{ borderLeftColor: colors.primary, backgroundColor: colors.surface, borderRightWidth: 0, borderTopWidth: 0, borderBottomWidth: 0 }}
                contentContainerStyle={{ paddingHorizontal: 15 }}
                text1Style={{ color: colors.text, fontSize: 15, fontWeight: 'bold' }}
                text2Style={{ color: colors.textMuted, fontSize: 13 }}
            />
        )
    };

    return <Toast config={toastConfig} />;
}