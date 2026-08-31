"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { ForgotPasswordFormInput, ForgotPasswordFormSchema, LoginFormInput, LoginFormSchema, RegisterFormInput, RegisterFormSchema, ResetPasswordFormInput, ResetPasswordFormSchema } from "@/schemas/auth";
import { z } from "zod";
import { ActionResponse } from "@/types";
import { env } from "@/utils/env";

type AuthAction<T> = (data: T, supabase: SupabaseClient) => ActionResponse;
const createAuthAction = <T extends { captchaToken?: string }>(schema: z.ZodSchema<T>, action: AuthAction<T>) => async (formData: T): ActionResponse => {
  const result = schema.safeParse(formData);
  if (!result.success) return { success: false, message: result.error.issues.map((issue) => issue.message).join(". ") };
  if (env.NEXT_PUBLIC_CAPTCHA_SITE_KEY && !result.data.captchaToken) return { success: false, message: "Captcha is required." };
  try { return await action(result.data, await createClient()); } catch (error) { return { success: false, message: error instanceof Error ? error.message : "An unexpected error occurred." }; }
};

const signInWithEmailAction: AuthAction<LoginFormInput> = async (data, supabase) => {
  const { data: authData, error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.loginPassword, options: data.captchaToken ? { captchaToken: data.captchaToken } : undefined });
  if (error) return { success: false, message: error.message };
  if (!authData.user) return { success: false, message: "Could not sign you in. Please try again." };
  const { data: profile, error: profileError } = await (supabase.from("profiles") as any).select("username").eq("user_id", authData.user.id).maybeSingle();
  if (profileError || !profile?.username) return { success: false, message: "Your account is missing a profile. Please sign out and try again." };
  return { success: true, message: `Welcome back, ${profile.username}` };
};

const signUpAction: AuthAction<RegisterFormInput> = async (data, supabase) => {
  const username = data.username.toLowerCase();
  const { data: existing, error: usernameError } = await (supabase.from("profiles") as any).select("id").eq("username", username).maybeSingle();
  if (usernameError) return { success: false, message: "Could not check username availability. Please try again." };
  if (existing) return { success: false, message: "Username already taken." };
  const { data: authData, error: signUpError } = await supabase.auth.signUp({ email: data.email, password: data.password, options: { ...(data.captchaToken ? { captchaToken: data.captchaToken } : {}), data: { username, display_name: data.username } } });
  if (signUpError) return { success: false, message: signUpError.message };
  if (!authData.user) return { success: false, message: "User was not created. Please try again." };
  const admin = await createClient(true);
  const { error: profileError } = await (admin.from("profiles") as any).upsert({ user_id: authData.user.id, username, display_name: data.username }, { onConflict: "user_id" });
  if (profileError) { console.error("Profile synchronization error:", profileError); return { success: false, message: "Account created, but the profile could not be initialized. Please try signing in again." }; }
  return { success: true, message: authData.session ? "Account created. Welcome to Spacely." : "Account created. Please check your email to verify your account." };
};

const sendResetPasswordEmailAction: AuthAction<ForgotPasswordFormInput> = async (data, supabase) => { const { error } = await supabase.auth.resetPasswordForEmail(data.email, { captchaToken: data.captchaToken }); return error ? { success: false, message: error.message } : { success: true, message: `We sent a password reset email to ${data.email}.` }; };
const resetPasswordAction: AuthAction<ResetPasswordFormInput> = async (data, supabase) => { const { error } = await supabase.auth.updateUser({ password: data.password }); return error ? { success: false, message: error.message } : { success: true, message: "Password has been reset successfully." }; };

export const signIn = createAuthAction(LoginFormSchema, signInWithEmailAction);
export const signUp = createAuthAction(RegisterFormSchema, signUpAction);
export const sendResetPasswordEmail = createAuthAction(ForgotPasswordFormSchema, sendResetPasswordEmailAction);
export const resetPassword = createAuthAction(ResetPasswordFormSchema, resetPasswordAction);
export const signOut = async (): ActionResponse => { try { const { error } = await (await createClient()).auth.signOut(); return error ? { success: false, message: error.message } : { success: true, message: "You have been signed out." }; } catch (error) { return { success: false, message: error instanceof Error ? error.message : "Could not sign out." }; } };
