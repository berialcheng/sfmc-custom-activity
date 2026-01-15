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
      console.log('initActivity received:', JSON.stringify(data, null, 2));

      // The data structure can vary - handle different cases
      const initData = data as Record<string, unknown>;

      // Store the full payload
      this.interaction = initData as unknown as JourneyInteraction;

      // Try to find activity in different possible locations
      if (initData.activity) {
        this.activity = initData.activity as ActivityInstance;
      } else if (initData.arguments) {
        // The data itself might be the activity
        this.activity = initData as unknown as ActivityInstance;
      } else {
        // Create a default activity structure
        console.log('Creating default activity structure');
        this.activity = {
          id: (initData.id as string) || 'foundations-support-activity',
          key: (initData.key as string) || 'foundations-support-activity-key',
          name: (initData.name as string) || "Foundation's Support Activity",
          type: 'REST',
          arguments: {
            execute: {
              inArguments: [],
              outArguments: [],
            },
          },
          metaData: {
            isConfigured: false,
          },
        };
      }

      console.log('Activity set to:', JSON.stringify(this.activity, null, 2));

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

    // Listen for requestedInteraction - contains the full journey and activity data
    this.connection.on('requestedInteraction', (data: unknown) => {
      console.log('requestedInteraction received:', JSON.stringify(data, null, 2));

      const interactionData = data as Record<string, unknown>;
      this.interaction = interactionData as unknown as JourneyInteraction;

      // NOTE: Do NOT overwrite this.activity from requestedInteraction!
      // The initActivity event already gave us the correct activity data.
      // requestedInteraction contains ALL activities in the journey,
      // and picking the wrong one causes data corruption.

      // If we need to find our activity, we should match by key/id:
      if (!this.activity && interactionData.activities && Array.isArray(interactionData.activities)) {
        const activities = interactionData.activities as ActivityInstance[];
        // Only use this as fallback if initActivity didn't set the activity
        const restActivity = activities.find(a => a.type === 'REST');
        if (restActivity) {
          this.activity = restActivity;
          console.log('Activity from requestedInteraction (fallback):', this.activity);
        }
      }

      callbacks.onRequestedInteraction?.(data);
    });

    // User clicked "Next" or "Done"
    this.connection.on('clickedNext', () => {
      console.log('clickedNext received');
      this.save(); // Auto-save when clicking next/done
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

    // Also request the current interaction data
    this.connection.trigger('requestInteraction');
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
    // If no activity exists, create one
    if (!this.activity) {
      console.log('Creating new activity for save');
      this.activity = {
        id: 'foundations-support-activity',
        key: 'foundations-support-activity-key',
        name: "Foundation's Support Activity",
        type: 'REST',
        arguments: {
          execute: {
            inArguments: [],
            outArguments: [],
          },
        },
        metaData: {
          isConfigured: false,
        },
      };
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

    // IMPORTANT: Remove any corrupted outcomes to prevent accumulation
    // REST activities should not define custom outcomes - SFMC will use default behavior
    delete (this.activity as Record<string, unknown>).outcomes;
    delete (this.activity as Record<string, unknown>).configurationArguments;
    delete (this.activity as Record<string, unknown>).schema;

    console.log('Saving activity:', JSON.stringify(this.activity, null, 2));

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
