import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    alertModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    alertModalContainer: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        width: '100%',
        maxHeight: '100%',
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingBottom: 40,
    },
    formScroll: {
        padding: 24,
        paddingBottom: 60,
    },
    listScroll: {
        padding: 24,
        paddingBottom: 100,
    },
    vehSubtitle: {
        color: colors.textMuted,
        fontSize: 14,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    filterBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    filterBtnActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterBtnText: {
        color: colors.textMuted,
        fontSize: 12,
        fontWeight: '600',
    },
    filterBtnTextActive: {
        color: colors.background,
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        marginBottom: 16,
        fontWeight: '500',
    },
    fieldLabel: {
        color: colors.textMuted,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 8,
    },
    typeSelectorGrid: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    typeBtn: {
        flex: 1,
        height: 44,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    typeBtnActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    typeBtnText: {
        color: colors.textMuted,
        fontSize: 14,
        fontWeight: '600',
    },
    typeBtnTextActive: {
        color: colors.background,
    },
    submitBtn: {
        marginTop: 12,
    },
    cardHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    completeBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.text,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    deleteBtn: {
        padding: 4,
    },
    alertCardBody: {
        marginTop: 6,
    },
    triggerInfo: {
        backgroundColor: colors.surface,
        padding: 10,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    triggerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    triggerLabel: {
        color: colors.textMuted,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    triggerValue: {
        color: colors.text,
        fontSize: 13,
        fontWeight: '600',
    },
    statusSection: {
        marginTop: 10,
    },
    criticalRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    criticalText: {
        color: colors.error,
        fontSize: 12,
        fontWeight: '700',
    },
    normalRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    normalText: {
        color: colors.textSecondary,
        fontSize: 11,
        fontStyle: 'italic',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 20,
    },
    emptyText: {
        color: colors.textMuted,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    selectBtn: {
        height: 48,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 4,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    selectBtnText: {
        color: colors.text,
        fontSize: 15,
    },
    selectBtnChevron: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        maxHeight: '70%',
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 24,
    },
    modalTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalList: {
        marginBottom: 12,
    },
    modalItem: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
    },
    modalItemActive: {
        backgroundColor: colors.surface,
    },
    modalItemText: {
        color: colors.textMuted,
        fontSize: 14,
    },
    modalItemTextActive: {
        color: colors.text,
        fontWeight: '700',
    },
    linkedMaintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 0.5,
        borderTopColor: colors.border,
    },
    linkedMaintText: {
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: '600',
    },
});
