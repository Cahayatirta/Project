import { useState } from "react";
import axios, { type AxiosRequestConfig } from "axios";
import api from "../utils/api";

export type FieldError = {
  property: string;
  message: string;
};

export type ApiErrorResponse = {
  message: string;
  errors: FieldError[];
  getFieldError: (property: string) => string | undefined;
};

type RawApiErrorResponse = {
  message?: string;
  errors?: FieldError[];
};

type UsePostFormOptions<TResult> = {
  config?: AxiosRequestConfig;
  onSuccess?: (result: TResult) => void;
  onError?: (error?: ApiErrorResponse) => void;
};

function createErrorResponse(message: string, errors: FieldError[] = []): ApiErrorResponse {
  return {
    message,
    errors,
    getFieldError: (property: string) =>
      errors.find((error) => error.property === property)?.message,
  };
}

function getErrors(error: unknown): ApiErrorResponse {
  if (axios.isAxiosError<RawApiErrorResponse>(error)) {
    const responseData = error.response?.data;

    return createErrorResponse(
      responseData?.message ?? error.message,
      responseData?.errors ?? [],
    );
  }

  return createErrorResponse(
    error instanceof Error ? error.message : "Something went wrong. Please try again.",
  );
}

export default function usePostForm<TPayload, TResult = unknown>(
  url: string,
  options: UsePostFormOptions<TResult> = {},
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse>();
  const [result, setResult] = useState<TResult | null>(null);

  async function submit(payload: TPayload) {
    setLoading(true);
    setError(undefined);
    setResult(null);

    try {
      const response = await api.post<TResult>(url, payload, options.config);
      setResult(response.data);
      options.onSuccess?.(response.data);
      return response.data;
    } catch (requestError) {
      const errors = getErrors(requestError);
      setError(errors);
      options.onError?.(errors);
      return null;
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setLoading(false);
    setError(undefined);
    setResult(null);
  }

  return {
    submit,
    reset,
    loading,
    error,
    result,
    isSuccess: Boolean(result),
  };
}
