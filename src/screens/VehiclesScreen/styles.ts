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
    errorText: {
        color: colors.error,
        fontSize: 14,
        marginBottom: 16,
        fontWeight: '500',
    },
    dropdownLabel: {
        color: colors.textMuted,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 8,
    },
    fuelOptionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    fuelOptionBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        minWidth: 80,
        alignItems: 'center',
    },
    fuelOptionBtnActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    fuelOptionText: {
        color: colors.textMuted,
        fontSize: 13,
        fontWeight: '600',
    },
    fuelOptionTextActive: {
        color: colors.background,
    },
    submitBtn: {
        marginTop: 12,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
    },
    vehPlate: {
        color: colors.error,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    vehName: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '700',
    },
    vehMeta: {
        color: colors.textMuted,
        fontSize: 12,
        marginTop: 4,
    },
    cardOdoContainer: {
        alignItems: 'flex-end',
    },
    cardOdo: {
        color: colors.text,
        fontSize: 20,
        fontWeight: '300',
    },
    cardOdoUnit: {
        color: colors.textMuted,
        fontSize: 10,
        fontWeight: '700',
        marginTop: 2,
    },
    deleteBtn: {
        padding: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyText: {
        color: colors.textMuted,
        fontSize: 14,
        textAlign: 'center',
    },
});
