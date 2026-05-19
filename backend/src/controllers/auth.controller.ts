import { Response, NextFunction } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { AuthedRequest, ok } from "../models/types";
import { HttpError } from "../middlewares/errorHandler";
import { recordAudit } from "../services/audit.service";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Registra usuario nuevo + crea perfil (el trigger handle_new_user lo hace).
 * @returns user + session
 */
export async function register(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const body = registerSchema.parse(req.body);
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: { full_name: body.full_name },
    });
    if (error || !data.user) throw new HttpError(400, error?.message ?? "No se pudo crear el usuario", "SIGNUP_FAILED");

    // Login automatico para devolver session
    const session = await supabaseAdmin.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });
    if (session.error) throw new HttpError(400, session.error.message, "SIGNIN_FAILED");

    await recordAudit(req, {
      action: "REGISTER",
      entity: "user",
      entity_id: data.user.id,
      payload: { email: body.email },
    });

    res.json(ok({ user: session.data.user, session: session.data.session }));
  } catch (e) { next(e); }
}

/**
 * Login con email + password. Devuelve access_token y refresh_token.
 */
export async function login(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const body = loginSchema.parse(req.body);
    const { data, error } = await supabaseAdmin.auth.signInWithPassword(body);
    if (error || !data.session) throw new HttpError(401, error?.message ?? "Credenciales inválidas", "INVALID_CREDENTIALS");

    await recordAudit(req, {
      action: "LOGIN",
      entity: "session",
      entity_id: data.user?.id ?? "unknown",
      payload: { email: body.email },
    });

    res.json(ok({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: data.user,
    }));
  } catch (e) { next(e); }
}

/**
 * Cierra sesión revocando el token actual.
 */
export async function logout(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (token) {
      await supabaseAdmin.auth.admin.signOut(token);
    }
    res.json(ok({ message: "Sesión cerrada" }));
  } catch (e) { next(e); }
}

/**
 * Devuelve datos del usuario autenticado + perfil + rol.
 */
export async function me(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new HttpError(401, "No autenticado", "NO_AUTH");
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", req.user.id)
      .maybeSingle();
    res.json(ok({ ...req.user, profile }));
  } catch (e) { next(e); }
}
