import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -10,
    },
    headerTitle: {
        color: colors.text,
        fontSize: 20,
        fontWeight: '700',
    },
    headerAddBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
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
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        marginBottom: 16,
        fontWeight: '500',
    },
    submitBtn: {
        marginTop: 12,
    },
    cardHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    totalCostText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '700',
    },
    deleteBtn: {
        padding: 4,
    },
    cardBody: {
        marginTop: 8,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        padding: 12,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        color: colors.textMuted,
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    detailValue: {
        color: colors.text,
        fontSize: 13,
        fontWeight: '600',
        marginTop: 2,
    },
    efficiencyBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 0.5,
        borderTopColor: colors.border,
    },
    efficiencyText: {
        color: colors.error,
        fontSize: 12,
        fontWeight: '600',
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
});
