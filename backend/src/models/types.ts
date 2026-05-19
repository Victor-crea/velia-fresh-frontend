import { Request } from "express";

export type AppRole = "admin" | "cliente";
export type OrderStatus = "pendiente" | "preparando" | "entregado" | "cancelado";
export type ProductCategory = "Res" | "Cerdo" | "Pollo" | "Cordero" | "Embutidos";

export interface AuthUser {
  id: string;
  email: string;
  role: AppRole | null;
}

export interface AuthedRequest extends Request {
  user?: AuthUser;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function ok<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

export function fail(error: string, code?: string): ApiError {
  return { success: false, error, ...(code ? { code } : {}) };
}
