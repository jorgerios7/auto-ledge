import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LoginScreen from "../screens/LoginScreen";
import { StatusBar } from "expo-status-bar";
import DashboardScreen from "../screens/DashboardScreen";
import MaintenanceScreen from "../screens/MaintenanceScreen";
import FuelScreen from "../screens/FuelScreen";
import AlertsScreen from "../screens/AlertScreen";
import VehiclesScreen from "../screens/VehiclesScreen";
import { Bell, Car, Droplet, LayoutGrid, Wrench } from "lucide-react-native";
import { colors } from "../theme/colors";

export function MainAppNavigator() {
    const insets = useSafeAreaInsets();
    const { user } = useApp();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'maintenance' | 'fuel' | 'alerts' | 'garage'>('dashboard');
    const [autoOpenModal, setAutoOpenModal] = useState<string | null>(null);

    if (!user) {
        return (
            <View style={styles.container}>
                <LoginScreen />
                <StatusBar style="light" />
            </View>
        );
    }

    const handleOpenModalFromDashboard = (formType: 'fuel' | 'maintenance' | 'alert' | 'vehicle') => {
        setAutoOpenModal(formType);
        if (formType === 'fuel') setActiveTab('fuel');
        else if (formType === 'maintenance') setActiveTab('maintenance');
        else if (formType === 'alert') setActiveTab('alerts');
        else if (formType === 'vehicle') setActiveTab('garage');
    };

    const handleCloseModal = () => {
        setAutoOpenModal(null);
    };

    const renderActiveScreen = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <DashboardScreen
                        onNavigate={(screen) => {
                            if (screen === 'history') setActiveTab('maintenance');
                            else if (screen === 'alerts') setActiveTab('alerts');
                            else if (screen === 'garage') setActiveTab('garage');
                        }}
                        onOpenModal={handleOpenModalFromDashboard}
                    />
                );
            case 'maintenance':
                return (
                    <MaintenanceScreen
                        key={`maint-${autoOpenModal === 'maintenance'}`}
                        initiallyShowAddModal={autoOpenModal === 'maintenance'}
                        onCloseAddModal={handleCloseModal}
                    />
                );
            case 'fuel':
                return (
                    <FuelScreen
                        key={`fuel-${autoOpenModal === 'fuel'}`}
                        initiallyShowAddModal={autoOpenModal === 'fuel'}
                        onCloseAddModal={handleCloseModal}
                    />
                );
            case 'alerts':
                return (
                    <AlertsScreen
                        key={`alerts-${autoOpenModal === 'alert'}`}
                        initiallyShowAddModal={autoOpenModal === 'alert'}
                        onCloseAddModal={handleCloseModal}
                    />
                );
            case 'garage':
                return (
                    <VehiclesScreen
                        key={`garage-${autoOpenModal === 'vehicle'}`}
                        initiallyShowAddModal={autoOpenModal === 'vehicle'}
                        onCloseAddModal={handleCloseModal}
                    />
                );
            default:
                return <DashboardScreen
                    onNavigate={setActiveTab as any}
                    onOpenModal={handleOpenModalFromDashboard}
                />;
        }
    };

    return (
        <View style={{ ...styles.container, paddingBottom: Math.max(insets.bottom, 16) }}>
            <View style={styles.screenArea}>
                {renderActiveScreen()}
            </View>

            {/* Tesla Minimal Tab Bar */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => { setActiveTab('dashboard'); handleCloseModal(); }}
                    activeOpacity={0.7}
                >
                    <LayoutGrid size={20} color={activeTab === 'dashboard' ? colors.text : colors.textSecondary} />
                    <Text style={[styles.tabLabel, activeTab === 'dashboard' && styles.tabLabelActive]}>Painel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => { setActiveTab('maintenance'); handleCloseModal(); }}
                    activeOpacity={0.7}
                >
                    <Wrench size={20} color={activeTab === 'maintenance' ? colors.text : colors.textSecondary} />
                    <Text style={[styles.tabLabel, activeTab === 'maintenance' && styles.tabLabelActive]}>Serviços</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => { setActiveTab('fuel'); handleCloseModal(); }}
                    activeOpacity={0.7}
                >
                    <Droplet size={20} color={activeTab === 'fuel' ? colors.text : colors.textSecondary} />
                    <Text style={[styles.tabLabel, activeTab === 'fuel' && styles.tabLabelActive]}>Recarga</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => { setActiveTab('alerts'); handleCloseModal(); }}
                    activeOpacity={0.7}
                >
                    <Bell size={20} color={activeTab === 'alerts' ? colors.text : colors.textSecondary} />
                    <Text style={[styles.tabLabel, activeTab === 'alerts' && styles.tabLabelActive]}>Alertas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => { setActiveTab('garage'); handleCloseModal(); }}
                    activeOpacity={0.7}
                >
                    <Car size={20} color={activeTab === 'garage' ? colors.text : colors.textSecondary} />
                    <Text style={[styles.tabLabel, activeTab === 'garage' && styles.tabLabelActive]}>Garagem</Text>
                </TouchableOpacity>
            </View>
            <StatusBar style="light" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    screenArea: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        height: Platform.OS === 'ios' ? 85 : 65,
        backgroundColor: colors.tabBarBg,
        borderTopWidth: 0.5,
        borderTopColor: colors.border,
        paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        paddingTop: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: colors.textSecondary,
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    tabLabelActive: {
        color: colors.text,
    },
});