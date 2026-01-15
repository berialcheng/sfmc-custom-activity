'use client';

import * as Postmonger from 'postmonger';
import type { CustomActivityState, JourneyInteraction, ActivityInstance } from './types';

// Postmonger Session type
interface PostmongerSession {
  on(event: string, callback: (data?: unknown) => void): void;
  trigger(event: string, data?: unknown): void;
}

/**
 * Journey Builder Postmonger Connection Manager
 */
export class JourneyBuilderConnection {
  private connection: PostmongerSession;
  private interaction: JourneyInteraction | null = null;
  private activity: ActivityInstance | null = null;
  private payload: CustomActivityState = {};
  private initialized = false;

  constructor() {
    const Session = (Postmonger as { Session: new () => PostmongerSession }).Session;
    this.connection = new Session();
  }

  /**
   * Initialize connection with Journey Builder
   */
  initialize(callbacks: {
    onInitActivity?: (data: unknown) => void;
    onRequestedInteraction?: (data: unknown) => void;
    onClickedNext?: () => void;
    onClickedBack?: () => void;
  }) {
    if (this.initialized) {
      console.log('Already initialized');
      return;
    }
    this.initialized = true;

    console.log('Initializing Postmonger connection...');

    // Listen for initActivity - this is sent by Journey Builder after we trigger 'ready'
    this.connection.on('initActivity', (data: unknown) => {
      console.log('initActivity received:', data);

      const initData = data as JourneyInteraction & {
        activity?: ActivityInstance;
      };

      this.interaction = initData;
      this.activity = initData.activity || null;

      // Restore saved configuration from activity
      if (this.activity?.arguments?.execute?.inArguments) {
        const inArgs = this.activity.arguments.execute.inArguments;
        inArgs.forEach((arg) => {
          Object.entries(arg).forEach(([key, value]) => {
            if (key !== 'contactKey' && key !== 'emailAddress') {
              (this.payload as Record<string, unknown>)[key] = value;
            }
          });
        });
      }

      callbacks.onInitActivity?.(data);
    });

    // Listen for requestedInteraction
    this.connection.on('requestedInteraction', (data: unknown) => {
      console.log('requestedInteraction received:', data);
      this.interaction = data as JourneyInteraction;
      callbacks.onRequestedInteraction?.(data);
    });

    // User clicked "Next" or "Done"
    this.connection.on('clickedNext', () => {
      console.log('clickedNext received');
      callbacks.onClickedNext?.();
    });

    // User clicked "Back"
    this.connection.on('clickedBack', () => {
      console.log('clickedBack received');
      callbacks.onClickedBack?.();
    });

    // IMPORTANT: Trigger 'ready' to tell Journey Builder we're ready
    // Journey Builder will then send 'initActivity'
    console.log('Triggering ready event...');
    this.connection.trigger('ready');
  }

  /**
   * Get current payload
   */
  getPayload(): CustomActivityState {
    return this.payload;
  }

  /**
   * Update payload
   */
  updatePayload(updates: Partial<CustomActivityState>) {
    this.payload = { ...this.payload, ...updates };
  }

  /**
   * Save Activity configuration
   */
  save() {
    if (!this.activity) {
      console.error('No activity to save');
      return;
    }

    // Build inArguments
    const inArguments = [
      { contactKey: '{{Contact.Key}}' },
      { emailAddress: '{{InteractionDefaults.Email}}' },
      ...Object.entries(this.payload).map(([key, value]) => ({ [key]: value })),
    ];

    // Update activity configuration
    this.activity.arguments = {
      execute: {
        inArguments,
        outArguments: [{ result: '' }],
      },
    };

    // Mark as configured
    this.activity.metaData = {
      ...this.activity.metaData,
      isConfigured: true,
    };

    console.log('Saving activity:', this.activity);

    // Send updated activity to Journey Builder
    this.connection.trigger('updateActivity', this.activity);
  }

  /**
   * Enable/disable "Done" button
   */
  setDoneEnabled(enabled: boolean) {
    this.connection.trigger('updateButton', {
      button: 'done',
      enabled,
    });
  }

  /**
   * Enable/disable "Next" button
   */
  setNextEnabled(enabled: boolean) {
    this.connection.trigger('updateButton', {
      button: 'next',
      enabled,
    });
  }

  /**
   * Get current activity
   */
  getActivity(): ActivityInstance | null {
    return this.activity;
  }

  /**
   * Trigger custom event
   */
  trigger(event: string, data?: unknown) {
    this.connection.trigger(event, data);
  }

  /**
   * Listen to custom event
   */
  on(event: string, callback: (data?: unknown) => void) {
    this.connection.on(event, callback);
  }
}

// Singleton instance
let connectionInstance: JourneyBuilderConnection | null = null;

export function getConnection(): JourneyBuilderConnection {
  if (!connectionInstance) {
    connectionInstance = new JourneyBuilderConnection();
  }
  return connectionInstance;
}
