import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.connectingPromise = null;
  }

  connect() {
    if (this.connected && this.stompClient) {
      return Promise.resolve(this.stompClient);
    }

    if (this.connectingPromise) {
      return this.connectingPromise;
    }

    this.connectingPromise = new Promise((resolve, reject) => {
      try {
        const socket = new SockJS('http://localhost:8080/ws-queue');
        this.stompClient = Stomp.over(socket);
        // Disable debug logs in console to keep clean
        this.stompClient.debug = null;

        this.stompClient.connect(
          {},
          () => {
            this.connected = true;
            this.connectingPromise = null;
            // Resubscribe active topics if reconnected
            this.subscriptions.forEach((callback, topic) => {
              this.stompClient.subscribe(topic, (message) => {
                try {
                  callback(JSON.parse(message.body));
                } catch (e) {
                  callback(message.body);
                }
              });
            });
            resolve(this.stompClient);
          },
          (error) => {
            this.connected = false;
            this.connectingPromise = null;
            // Non-blocking reject; client polling will handle fallbacks
            reject(error);
          }
        );
      } catch (err) {
        this.connectingPromise = null;
        reject(err);
      }
    });

    return this.connectingPromise;
  }

  subscribe(topic, callback) {
    this.subscriptions.set(topic, callback);
    this.connect()
      .then((client) => {
        if (client && client.connected) {
          client.subscribe(topic, (message) => {
            try {
              callback(JSON.parse(message.body));
            } catch (e) {
              callback(message.body);
            }
          });
        }
      })
      .catch(() => {
        // WebSocket connection fallback silently handled
      });

    return () => {
      this.subscriptions.delete(topic);
    };
  }

  disconnect() {
    if (this.stompClient && this.connected) {
      try {
        this.stompClient.disconnect();
      } catch (e) {}
    }
    this.connected = false;
    this.subscriptions.clear();
  }
}

export const wsService = new WebSocketService();
export default wsService;
