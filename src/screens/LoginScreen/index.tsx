import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { ToastService } from '../../utils/toast';
import { styles } from './styles';
import LoginForm from './components/LoginForm';

interface LoginScreenProps {
  onForgotPassword: (email: string) => void;
}

export default function LoginScreen({ onForgotPassword }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const { login, register, loginWithGoogle } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (isSignUp && !name)) {
      const msg = 'Por favor, preencha todos os campos.';
      ToastService.showError('Erro de Validação', msg);
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        await register(name, email, password);
        ToastService.showSuccess('Conta Criada', 'Seja bem-vindo ao Auto Ledge!');
      } else {
        await login(email, password);
        ToastService.showSuccess('Login Realizado', 'Bem-vindo de volta ao Auto Ledge!');
      }
    } catch (err: any) {
      const errMsg = err.message || 'Ocorreu um erro. Tente novamente.';
      ToastService.showError('Erro de Autenticação', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      await loginWithGoogle();
      ToastService.showSuccess('Acesso Autorizado', 'Login realizado com o Google!');
    } catch (err: any) {
      const errMsg = err.message || 'Houve um problema ao entrar com o Google.';
      // Suppress showing toast if user cancelled the sign in flow
      if (errMsg !== 'Login cancelado pelo usuário.') {
        ToastService.showError('Erro com Google', errMsg);
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <Image source={require('../../../assets/adaptive-icon.png')} style={styles.logoImage} />
        </View>

        <LoginForm
          isSignUp={isSignUp}
          setIsSignUp={setIsSignUp}
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          loading={loading}
          loadingGoogle={loadingGoogle}
          onSubmit={handleSubmit}
          onGooglePress={handleGoogleLogin}
          onForgotPassword={() => onForgotPassword(email)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
