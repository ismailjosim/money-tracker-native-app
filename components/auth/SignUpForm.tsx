import { SignUpFormValues } from "@/lib/schemas/auth";
import React from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { Text, TouchableOpacity, View } from "react-native";

import AuthHeader from "./AuthHeader";
import AuthInput from "./AuthInput";
import PasswordInput from "./PasswordInput";
import PrimaryButton from "./PrimaryButton";

interface SignUpFormProps {
  control: Control<SignUpFormValues>;
  errors: FieldErrors<SignUpFormValues>;
  clerkErrors?: {
    emailAddress?: { message: string };
    password?: { message: string };
  };
  loading?: boolean;
  onSubmit: () => void;
  onSignIn: () => void;
}

export default function SignUpForm({
  control,
  errors,
  clerkErrors,
  loading = false,
  onSubmit,
  onSignIn,
}: SignUpFormProps) {
  return (
    <>
      <AuthHeader
        title="Create Account"
        subtitle="Track your income, expenses and savings in one beautiful place."
        showTagline
      />

      <View className="bg-brand-surface border border-brand-surface-border rounded-3xl p-6">
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Controller
              control={control}
              name="firstName"
              render={({ field: { value, onChange, onBlur } }) => (
                <AuthInput
                  label="First Name"
                  placeholder="John"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.firstName?.message}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              )}
            />
          </View>

          <View className="flex-1">
            <Controller
              control={control}
              name="lastName"
              render={({ field: { value, onChange, onBlur } }) => (
                <AuthInput
                  label="Last Name"
                  placeholder="Doe"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.lastName?.message}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <AuthInput
              label="Email Address"
              placeholder="john@example.com"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={
                errors.email?.message ?? clerkErrors?.emailAddress?.message
              }
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message ?? clerkErrors?.password?.message}
              autoComplete="password-new"
              textContentType="newPassword"
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { value, onChange, onBlur } }) => (
            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirmPassword?.message}
              autoComplete="password-new"
              textContentType="newPassword"
              returnKeyType="done"
            />
          )}
        />

        <PrimaryButton
          title="Create Account"
          loading={loading}
          onPress={onSubmit}
        />

        <View className="flex-row justify-center items-center mt-6">
          <Text className="text-brand-text-secondary text-sm">
            Already have an account?
          </Text>

          <TouchableOpacity onPress={onSignIn} activeOpacity={0.7}>
            <Text className="ml-2 text-primary font-semibold text-sm">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
