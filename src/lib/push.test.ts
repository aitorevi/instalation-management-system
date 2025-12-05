import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isPushSupported,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  saveSubscription,
  removeSubscription,
  getCurrentSubscription
} from './push';

describe('push.ts - Browser Push Utilities', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('navigator', {});
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('isPushSupported', () => {
    it('should return false when window is undefined', () => {
      vi.stubGlobal('window', undefined);
      expect(isPushSupported()).toBe(false);
    });

    it('should return false when serviceWorker is not supported', () => {
      vi.stubGlobal('navigator', {});
      vi.stubGlobal('window', {});
      expect(isPushSupported()).toBe(false);
    });

    it('should return false when PushManager is not supported', () => {
      vi.stubGlobal('navigator', { serviceWorker: {} });
      vi.stubGlobal('window', {});
      expect(isPushSupported()).toBe(false);
    });

    it('should return false when Notification is not supported', () => {
      vi.stubGlobal('navigator', { serviceWorker: {} });
      vi.stubGlobal('window', { PushManager: {} });
      expect(isPushSupported()).toBe(false);
    });

    it('should return true when all APIs are supported', () => {
      vi.stubGlobal('navigator', { serviceWorker: {} });
      vi.stubGlobal('window', {
        PushManager: {},
        Notification: {}
      });
      expect(isPushSupported()).toBe(true);
    });
  });

  describe('requestNotificationPermission', () => {
    it('should return "denied" when window is undefined', async () => {
      vi.stubGlobal('window', undefined);
      const result = await requestNotificationPermission();
      expect(result).toBe('denied');
    });

    it('should return "denied" when Notification is not supported', async () => {
      vi.stubGlobal('window', {});
      const result = await requestNotificationPermission();
      expect(result).toBe('denied');
    });

    it('should return permission when granted', async () => {
      const mockNotification = {
        requestPermission: vi.fn().mockResolvedValue('granted')
      };
      vi.stubGlobal('Notification', mockNotification);
      vi.stubGlobal('window', { Notification: mockNotification });

      const result = await requestNotificationPermission();
      expect(result).toBe('granted');
    });

    it('should return permission when denied by user', async () => {
      const mockNotification = {
        requestPermission: vi.fn().mockResolvedValue('denied')
      };
      vi.stubGlobal('Notification', mockNotification);
      vi.stubGlobal('window', { Notification: mockNotification });

      const result = await requestNotificationPermission();
      expect(result).toBe('denied');
    });

    it('should return permission when default (not decided)', async () => {
      const mockNotification = {
        requestPermission: vi.fn().mockResolvedValue('default')
      };
      vi.stubGlobal('Notification', mockNotification);
      vi.stubGlobal('window', { Notification: mockNotification });

      const result = await requestNotificationPermission();
      expect(result).toBe('default');
    });
  });

  describe('subscribeToPush', () => {
    const mockVapidKey = 'BNxsW9M-LLqP8tV0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

    it('should return null when push is not supported', async () => {
      vi.stubGlobal('window', undefined);
      const result = await subscribeToPush(mockVapidKey);
      expect(result).toBeNull();
    });

    it('should return existing subscription if already subscribed', async () => {
      const mockSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/xxx',
        toJSON: () => ({})
      };

      vi.stubGlobal('navigator', {
        serviceWorker: {
          ready: Promise.resolve({
            pushManager: {
              getSubscription: vi.fn().mockResolvedValue(mockSubscription)
            }
          })
        }
      });
      vi.stubGlobal('window', {
        PushManager: {},
        Notification: {}
      });

      const result = await subscribeToPush(mockVapidKey);
      expect(result).toBe(mockSubscription);
    });

    it('should create new subscription when not subscribed', async () => {
      const mockNewSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/new',
        toJSON: () => ({})
      };

      vi.stubGlobal('navigator', {
        serviceWorker: {
          ready: Promise.resolve({
            pushManager: {
              getSubscription: vi.fn().mockResolvedValue(null),
              subscribe: vi.fn().mockResolvedValue(mockNewSubscription)
            }
          })
        }
      });
      vi.stubGlobal('window', {
        PushManager: {},
        Notification: {},
        atob: (str: string) => Buffer.from(str, 'base64').toString('binary')
      });

      const result = await subscribeToPush(mockVapidKey);
      expect(result).toBe(mockNewSubscription);
    });

    it('should return null when subscription fails', async () => {
      vi.stubGlobal('navigator', {
        serviceWorker: {
          ready: Promise.resolve({
            pushManager: {
              getSubscription: vi.fn().mockResolvedValue(null),
              subscribe: vi.fn().mockRejectedValue(new Error('Permission denied'))
            }
          })
        }
      });
      vi.stubGlobal('window', {
        PushManager: {},
        Notification: {},
        atob: (str: string) => Buffer.from(str, 'base64').toString('binary')
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await subscribeToPush(mockVapidKey);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error subscribing to push:', expect.any(Error));
    });
  });

  describe('unsubscribeFromPush', () => {
    it('should return false when push is not supported', async () => {
      vi.stubGlobal('window', undefined);
      const result = await unsubscribeFromPush();
      expect(result).toBe(false);
    });

    it('should return false when no subscription exists', async () => {
      vi.stubGlobal('navigator', {
        serviceWorker: {
          ready: Promise.resolve({
            pushManager: {
              getSubscription: vi.fn().mockResolvedValue(null)
            }
          })
        }
      });
      vi.stubGlobal('window', {
        PushManager: {},
        Notification: {}
      });

      const result = await unsubscribeFromPush();
      expect(result).toBe(false);
    });

    it('should return true when successfully unsubscribed', async () => {
      const mockSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/xxx',
        unsubscribe: vi.fn().mockResolvedValue(true)
      };

      vi.stubGlobal('navigator', {
        serviceWorker: {
          ready: Promise.resolve({
            pushManager: {
              getSubscription: vi.fn().mockResolvedValue(mockSubscription)
            }
          })
        }
      });
      vi.stubGlobal('window', {
        PushManager: {},
        Notification: {}
      });

      const result = await unsubscribeFromPush();
      expect(result).toBe(true);
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should return false when unsubscribe fails', async () => {
      const mockSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/xxx',
        unsubscribe: vi.fn().mockRejectedValue(new Error('Network error'))
      };

      vi.stubGlobal('navigator', {
        serviceWorker: {
          ready: Promise.resolve({
            pushManager: {
              getSubscription: vi.fn().mockResolvedValue(mockSubscription)
            }
          })
        }
      });
      vi.stubGlobal('window', {
        PushManager: {},
        Notification: {}
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await unsubscribeFromPush();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error unsubscribing from push:', expect.any(Error));
    });
  });

  describe('saveSubscription', () => {
    const mockSubscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/xxx',
      toJSON: () => ({
        endpoint: 'https://fcm.googleapis.com/fcm/send/xxx',
        keys: {
          p256dh: 'mock-p256dh-key',
          auth: 'mock-auth-key'
        }
      })
    } as PushSubscription;

    it('should return true when subscription is saved successfully', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      const result = await saveSubscription(mockSubscription);
      expect(result).toBe(true);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: mockSubscription.endpoint,
          keys: {
            p256dh: 'mock-p256dh-key',
            auth: 'mock-auth-key'
          }
        })
      });
    });

    it('should return false when API returns error', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: () => Promise.resolve({ error: 'Unauthorized' })
        })
      );

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await saveSubscription(mockSubscription);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save subscription:', {
        error: 'Unauthorized'
      });
    });

    it('should return false when fetch fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await saveSubscription(mockSubscription);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error saving subscription:', expect.any(Error));
    });
  });

  describe('removeSubscription', () => {
    const mockEndpoint = 'https://fcm.googleapis.com/fcm/send/xxx';

    it('should return true when subscription is removed successfully', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      const result = await removeSubscription(mockEndpoint);
      expect(result).toBe(true);
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: mockEndpoint })
      });
    });

    it('should return false when API returns error', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: () => Promise.resolve({ error: 'Not found' })
        })
      );

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await removeSubscription(mockEndpoint);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to remove subscription:', {
        error: 'Not found'
      });
    });

    it('should return false when fetch fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await removeSubscription(mockEndpoint);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error removing subscription:', expect.any(Error));
    });
  });

  describe('getCurrentSubscription', () => {
    it('should return null when push is not supported', async () => {
      vi.stubGlobal('window', undefined);
      const result = await getCurrentSubscription();
      expect(result).toBeNull();
    });

    it('should return null when no subscription exists', async () => {
      vi.stubGlobal('navigator', {
        serviceWorker: {
          ready: Promise.resolve({
            pushManager: {
              getSubscription: vi.fn().mockResolvedValue(null)
            }
          })
        }
      });
      vi.stubGlobal('window', {
        PushManager: {},
        Notification: {}
      });

      const result = await getCurrentSubscription();
      expect(result).toBeNull();
    });

    it('should return subscription when exists', async () => {
      const mockSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/xxx',
        toJSON: () => ({})
      };

      vi.stubGlobal('navigator', {
        serviceWorker: {
          ready: Promise.resolve({
            pushManager: {
              getSubscription: vi.fn().mockResolvedValue(mockSubscription)
            }
          })
        }
      });
      vi.stubGlobal('window', {
        PushManager: {},
        Notification: {}
      });

      const result = await getCurrentSubscription();
      expect(result).toBe(mockSubscription);
    });

    it('should return null when getSubscription fails', async () => {
      vi.stubGlobal('navigator', {
        serviceWorker: {
          ready: Promise.resolve({
            pushManager: {
              getSubscription: vi.fn().mockRejectedValue(new Error('Service Worker error'))
            }
          })
        }
      });
      vi.stubGlobal('window', {
        PushManager: {},
        Notification: {}
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await getCurrentSubscription();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error getting current subscription:',
        expect.any(Error)
      );
    });
  });
});
