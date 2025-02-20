import { InjectionToken } from '@angular/core';
import { IbStorageTypes } from '../storage/storage.service';
import { IbAuthTypes } from 'public_api';

/**
 * Token per il tipo di autenticazione HTTP.
 */
export const IB_HTTP_AUTH_TYPE = new InjectionToken<IbAuthTypes>('IB_HTTP_AUTH_TYPE');

/**
 * Token per le URL escluse dal loader HTTP.
 */
export const IB_HTTP_URL_EXCLUDED_FROM_LOADER = new InjectionToken<string[]>('IB_HTTP_URL_EXCLUDED_FROM_LOADER');

/**
 * Token per l'URL della dashboard GUI.
 */
export const IB_HTTP_GUI_DASHBOARD_URL = new InjectionToken<string>('IB_HTTP_GUI_DASHBOARD_URL');

/**
 * Token per l'URL dell'API di login.
 */
export const IB_HTTP_API_LOGIN_URL = new InjectionToken<string>('IB_HTTP_API_LOGIN_URL');

/**
 * Token per l'URL della GUI di login.
 */
export const IB_HTTP_GUI_LOGIN_URL = new InjectionToken<string>('IB_HTTP_GUI_LOGIN_URL');

/**
 * Token per l'URL dell'API di refresh token.
 */
export const IB_HTTP_API_REFRESH_URL = new InjectionToken<string>('IB_HTTP_API_REFRESH_URL');

/**
 * Token per il tipo di storage della sessione HTTP.
 */
export const IB_HTTP_SESSION_STORAGE_TYPE = new InjectionToken<IbStorageTypes>('IB_HTTP_SESSION_STORAGE_TYPE');

/**
 * Token per il campo dei claims JWT.
 */
export const IB_HTTP_JWT_CLAIMS_FIELD = new InjectionToken<string>('IB_HTTP_JWT_CLAIMS_FIELD');

/**
 * Token per il campo dei ruoli JWT.
 */
export const IB_HTTP_JWT_ROLES_FIELD = new InjectionToken<string>('IB_HTTP_JWT_ROLES_FIELD');

/**
 * Token per abilitare o disabilitare gli interceptor HTTP.
 */
export const IB_HTTP_ENABLE_INTERCEPTORS = new InjectionToken<boolean>('IB_HTTP_ENABLE_INTERCEPTORS');

/**
 * Token per il messaggio di errore in caso di login fallito.
 */
export const IB_HTTP_TOAST_ON_LOGIN_FAILURE = new InjectionToken<string>('IB_HTTP_TOAST_ON_LOGIN_FAILURE');

/**
 * Token per il messaggio di errore generico negli interceptor HTTP.
 */
export const IB_HTTP_TOAST_ON_GENERIC_FAILURE = new InjectionToken<string>('IB_HTTP_TOAST_ON_GENERIC_FAILURE');

/**
 * Token per la gestione dei toast basati su status code.
 */
export const IB_HTTP_TOAST_ON_STATUS_CODE = new InjectionToken<Record<number, string>>('IB_HTTP_TOAST_ON_STATUS_CODE');

/**
 * Token per il codice di errore da mostrare nei toast.
 */
export const IB_HTTP_TOAST_ERROR_CODE = new InjectionToken<string | null>('IB_HTTP_TOAST_ERROR_CODE');

/**
 * Token per il campo dell'errore nei toast.
 */
export const IB_HTTP_TOAST_ERROR_FIELD = new InjectionToken<string | null>('IB_HTTP_TOAST_ERROR_FIELD');
