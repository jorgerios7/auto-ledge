import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";
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

    function Header({ title, onClose, loading }: HeaderProps) {
        return (
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={loading}>
                    <X size={20} color={colors.text} />
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

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
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
        borderBottomColor: colors.border,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
});