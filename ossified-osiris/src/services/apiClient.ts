const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const toErrorMessage = async (response: Response) => {
  try {
    const payload = (await response.json()) as { message?: string };
    if (payload.message) return payload.message;
  } catch {
    // Ignore invalid json response.
  }

  return `Request failed with status ${response.status}`;
};

export const apiRequest = async <T>(
  path: string,
  init?: Omit<RequestInit, 'headers'> & { headers?: Record<string, string> },
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await toErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
};
