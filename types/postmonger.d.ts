declare module 'postmonger' {
  interface PostmongerSession {
    on(event: string, callback: (data?: unknown) => void): void;
    trigger(event: string, data?: unknown): void;
  }

  interface PostmongerConnection {
    on(event: string, callback: (data?: unknown) => void): void;
    trigger(event: string, data?: unknown): void;
  }

  export const Session: new () => PostmongerSession;
  export const Connection: new (options?: {
    connect?: Window;
    from?: string;
    to?: string;
  }) => PostmongerConnection;
  export const version: string;
  export function noConflict(): typeof import('postmonger');
}
