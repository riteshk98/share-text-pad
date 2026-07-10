declare module 'y-websocket/bin/utils' {
  export function setupWSConnection(
    conn: unknown,
    req: unknown,
    opts?: {
      docName?: string;
      gc?: boolean;
    },
  ): void;
}