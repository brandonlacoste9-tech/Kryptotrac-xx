import { io, Socket } from 'socket.io-client';
import { createBrowserClient } from '@supabase/ssr';

const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const COLONY_API_URL = process.env.NEXT_PUBLIC_COLONY_API_URL || 'http://localhost:10000';

class ColonyLink {
  public socket: Socket | null = null;
  private supabase = createClient();

  constructor() {
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  private async connect() {
    const { data: { session } } = await this.supabase.auth.getSession();
    const token = session?.access_token;

    // Guest users don't get a socket connection
    if (!token) {
        console.log("🌱 Kryptotrac: Guest mode (No Socket)");
        return;
    }

    this.socket = io(COLONY_API_URL, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
        console.log('🪙 Kryptotrac: Connected to Core.');
        // Join the global crypto alerts channel upon connection
        this.socket?.emit('join_channel', 'global_crypto_alerts');
    });
  }

  public subscribeToAlerts(callback: (alert: any) => void) {
    this.socket?.on('price_alert', callback);
  }
}

export const colonyLink = new ColonyLink();
