import React from "react";
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppTheme, useTheme } from "../theme";
import { X } from "lucide-react-native";

interface Props {
    visible: boolean;
    onClose: () => void;
    loading?: boolean;
    headerTitle: string;
    children: React.ReactNode;
}

interface HeaderProps {
    title: string;
    onClose: () => void;
    loading?: boolean;
}

export function CustomModal({ visible, onClose, loading, headerTitle, children }: Props) {
    const theme = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);

    function Header({ title, onClose, loading }: HeaderProps) {
        return (
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={loading}>
                    <X size={20} color={theme.colors.text} />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.overlay}>
                    <View style={styles.content}>
                        <Header title={headerTitle} onClose={onClose} loading={loading} />
                        {children}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal >
    );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: theme.colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        width: '100%',
        maxHeight: '90%',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: theme.colors.border,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: theme.typography.bodySmall,
        fontWeight: '700',
        color: theme.colors.text,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
