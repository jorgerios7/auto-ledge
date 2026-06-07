import React from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { useTheme } from '../theme';

export function CustomToast() {
    const { colors, typography } = useTheme();
    const toastConfig = {
        success: (props: any) => (
            <BaseToast
                {...props}
                style={{ borderLeftColor: colors.success, backgroundColor: colors.surface, borderRightWidth: 0, borderTopWidth: 0, borderBottomWidth: 0 }}
                contentContainerStyle={{ paddingHorizontal: 15 }}
                text1Style={{ color: colors.text, fontSize: typography.body, fontWeight: 'bold' }}
                text2Style={{ color: colors.textMuted, fontSize: typography.bodySmall }}
            />
        ),
        error: (props: any) => (
            <ErrorToast
                {...props}
                style={{ borderLeftColor: colors.error, backgroundColor: colors.surface, borderRightWidth: 0, borderTopWidth: 0, borderBottomWidth: 0 }}
                contentContainerStyle={{ paddingHorizontal: 15 }}
                text1Style={{ color: colors.text, fontSize: typography.body, fontWeight: 'bold' }}
                text2Style={{ color: colors.textMuted, fontSize: typography.bodySmall }}
            />
        ),
        info: (props: any) => (
            <BaseToast
                {...props}
                style={{ borderLeftColor: colors.primary, backgroundColor: colors.surface, borderRightWidth: 0, borderTopWidth: 0, borderBottomWidth: 0 }}
                contentContainerStyle={{ paddingHorizontal: 15 }}
                text1Style={{ color: colors.text, fontSize: typography.body, fontWeight: 'bold' }}
                text2Style={{ color: colors.textMuted, fontSize: typography.bodySmall }}
            />
        )
    };

    return <Toast config={toastConfig} />;
}
