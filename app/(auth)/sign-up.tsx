import {
  CodeFormValues,
  SignUpFormValues,
  codeSchema,
  signUpSchema,
} from "@/lib/schemas/auth";
import { useAuth, useSignUp } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

import SignUpForm from "@/components/auth/SignUpForm";
import SuccessScreen from "@/components/auth/SuccessScreen";
import VerifyForm from "@/components/auth/VerifyForm";

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const isLoading = fetchStatus === "fetching";

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "all",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const codeForm = useForm<CodeFormValues>({
    resolver: zodResolver(codeSchema),
    mode: "all",
    defaultValues: { code: "" },
  });

  const handleSignUp = async (values: SignUpFormValues) => {
    setEmail(values.email);
    setFirstName(values.firstName);

    const { error } = await signUp.password({
      emailAddress: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (!error) await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async ({ code }: CodeFormValues) => {
    await signUp.verifications.verifyEmailCode({ code });

    const { error } = await signUp.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) return;
        const url = decorateUrl("/");
        router.replace(url as any);
      },
    });

    if (!error) {
      setIsSuccess(true);
    } else {
      console.error("Sign-up finalize error:", error);
    }
  };

  const handleResend = async () => {
    setResendMessage("");
    try {
      await signUp.verifications.sendEmailCode();
      setResendMessage("A new verification code has been sent.");
      setTimeout(() => setResendMessage(""), 4000);
    } catch {
      Alert.alert("Error", "Unable to resend verification code.");
    }
  };

  const handleStartOver = () => {
    signUp.reset();
    codeForm.reset();
    signUpForm.reset();
    setResendMessage("");
  };

  // Already signed in — nothing to render
  if (isSignedIn) return null;

  // Verification step: email sent, waiting for code
  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <KeyboardAvoidingView
        className="flex-1 bg-brand-bg"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6 py-10">
            <VerifyForm
              email={email}
              control={codeForm.control}
              error={codeForm.formState.errors.code?.message}
              clerkError={errors.fields.code?.message}
              message={resendMessage}
              loading={isLoading}
              onVerify={codeForm.handleSubmit(handleVerify)}
              onResend={handleResend}
              onBack={handleStartOver}
            />
          </View>
          <View nativeID="clerk-captcha" />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Success step: finalize navigated away, but show this as fallback
  if (isSuccess) {
    return (
      <KeyboardAvoidingView
        className="flex-1 bg-brand-bg"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 justify-center px-6 py-10">
          <SuccessScreen
            firstName={firstName}
            title="Welcome to Wallex!"
            description="Your account has been created successfully. You're all set to start tracking your finances."
            buttonText="Go to Dashboard"
            onContinue={() => router.replace("/")}
          />
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Default: sign-up form
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-brand-bg"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-10">
          <SignUpForm
            control={signUpForm.control}
            errors={signUpForm.formState.errors}
            clerkErrors={errors.fields as any}
            loading={isLoading}
            onSubmit={signUpForm.handleSubmit(handleSignUp)}
            onSignIn={() => router.replace("/sign-in")}
          />
        </View>
        <View nativeID="clerk-captcha" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
