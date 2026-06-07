import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TeslaInput } from '../../../components/TeslaInput';
import { TeslaButton } from '../../../components/TeslaButton';
import { styles } from '../styles';

interface LoginFormProps {
  isSignUp: boolean;
  setIsSignUp: (val: boolean) => void;
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  loading: boolean;
  loadingGoogle: boolean;
  onSubmit: () => void;
  onGooglePress: () => void;
  onForgotPassword: () => void;
}

export default function LoginForm({
  isSignUp,
  setIsSignUp,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  loading,
  loadingGoogle,
  onSubmit,
  onGooglePress,
  onForgotPassword,
}: LoginFormProps) {
  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>
        {isSignUp ? 'Criar Conta' : 'Acessar Conta'}
      </Text>

      {isSignUp && (
        <TeslaInput
          label="Nome Completo"
          placeholder="Digite seu nome"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          editable={!loading && !loadingGoogle}
        />
      )}

      <TeslaInput
        label="E-mail"
        placeholder="nome@exemplo.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading && !loadingGoogle}
      />

      <TeslaInput
        label="Senha"
        placeholder="Digite sua senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading && !loadingGoogle}
      />

      {!isSignUp && (
        <TouchableOpacity
          onPress={onForgotPassword}
          disabled={loading || loadingGoogle}
          style={styles.forgotPasswordButton}
        >
          <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
        </TouchableOpacity>
      )}

      <TeslaButton
        title={isSignUp ? 'Registrar' : 'Entrar'}
        onPress={onSubmit}
        variant="primary"
        loading={loading}
        disabled={loadingGoogle}
        style={styles.submitBtn}
      />

      <View style={styles.googleSeparator}>
        <View style={styles.googleSeparatorLine} />
        <Text style={styles.googleSeparatorText}>OU</Text>
        <View style={styles.googleSeparatorLine} />
      </View>

      <TeslaButton
        title="Continuar com o Google"
        onPress={onGooglePress}
        variant="outline"
        loading={loadingGoogle}
        disabled={loading}
        style={styles.googleBtn}
      />

      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>
          {isSignUp ? 'Já possui uma conta?' : 'Ainda não tem conta?'}
        </Text>
        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} disabled={loading || loadingGoogle}>
          <Text style={styles.switchLink}>
            {isSignUp ? ' Faça Login' : ' Cadastre-se'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
