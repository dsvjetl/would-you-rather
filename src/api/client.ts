export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Pulls a human-readable message out of the common error body shapes:
// OpenAI-style { error: { message } }, Gemini-style { error: { message } }, or our proxy's { error: string }.
const extractErrorMessage = async (response: Response): Promise<string> => {
  const fallback = `${response.status} ${response.statusText}`;
  try {
    const body: unknown = await response.json();
    if (typeof body === 'object' && body !== null && 'error' in body) {
      const error = (body as { error: unknown }).error;
      if (typeof error === 'string') return error;
      if (typeof error === 'object' && error !== null && 'message' in error) {
        const message = (error as { message: unknown }).message;
        if (typeof message === 'string') return message;
      }
    }
  } catch {
    // body wasn't JSON
  }
  return fallback;
};

export const apiFetch = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    throw new ApiError(await extractErrorMessage(response), response.status);
  }

  return (await response.json()) as T;
};
