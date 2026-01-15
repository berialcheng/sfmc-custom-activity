'use client';

import { useEffect, useState, useCallback } from 'react';
import { getConnection } from '@/lib/postmonger';
import type { CustomActivityState } from '@/lib/types';

interface ActivityConfigProps {
  onSave?: (config: CustomActivityState) => void;
}

// Check if running inside SFMC Journey Builder iframe
function isInJourneyBuilder(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // If window.parent equals window, we're not in an iframe
    return window.parent !== window;
  } catch {
    // Cross-origin error means we're in an iframe
    return true;
  }
}

export default function ActivityConfig({ onSave }: ActivityConfigProps) {
  const [isReady, setIsReady] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [config, setConfig] = useState<CustomActivityState>({
    customField1: '',
    customField2: '',
    isEnabled: true,
  });

  // Initialize Postmonger connection
  useEffect(() => {
    // Check if running in Journey Builder
    const inJB = isInJourneyBuilder();
    console.log('Is in Journey Builder:', inJB);

    if (!inJB) {
      console.log('Development mode: Not in Journey Builder iframe');
      setIsDevMode(true);
      setIsReady(true);
      return;
    }

    const connection = getConnection();

    connection.initialize({
      onInitActivity: () => {
        console.log('Activity initialized, showing config UI');
        setIsReady(true);

        // Restore saved configuration
        const savedPayload = connection.getPayload();
        console.log('Saved payload:', savedPayload);
        if (Object.keys(savedPayload).length > 0) {
          setConfig((prev) => ({ ...prev, ...savedPayload }));
        }

        // Enable done button
        connection.setDoneEnabled(true);
      },

      onClickedNext: () => {
        // Save configuration when user clicks Done/Next
        const conn = getConnection();
        conn.save();
        console.log('Configuration saved');
      },
    });
  }, []);

  // Update configuration
  const handleChange = useCallback(
    (field: keyof CustomActivityState, value: string | boolean) => {
      setConfig((prev) => {
        const newConfig = { ...prev, [field]: value };

        // Only sync to Postmonger when not in dev mode
        if (!isDevMode) {
          const connection = getConnection();
          connection.updatePayload({ [field]: value });
        }

        return newConfig;
      });
    },
    [isDevMode]
  );

  // Save configuration
  const handleSave = useCallback(() => {
    if (!isDevMode) {
      const connection = getConnection();
      connection.save();
    } else {
      console.log('Development mode - Config saved:', config);
      alert('Configuration saved (Development Mode)\n\n' + JSON.stringify(config, null, 2));
    }
    onSave?.(config);
  }, [config, onSave, isDevMode]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to Journey Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {isDevMode && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>Development Mode</strong> - Journey Builder environment not detected. The configuration UI can be previewed, but save functionality is simulated.
          </p>
        </div>
      )}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configure Custom Activity</h1>

      <div className="space-y-6">
        {/* Custom Field 1 */}
        <div>
          <label
            htmlFor="customField1"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Custom Field 1
          </label>
          <input
            type="text"
            id="customField1"
            value={config.customField1 || ''}
            onChange={(e) => handleChange('customField1', e.target.value)}
            placeholder="Enter custom value..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
          <p className="mt-1 text-sm text-gray-500">
            This field will be passed as a parameter when the Activity executes
          </p>
        </div>

        {/* Custom Field 2 */}
        <div>
          <label
            htmlFor="customField2"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Custom Field 2
          </label>
          <input
            type="text"
            id="customField2"
            value={config.customField2 || ''}
            onChange={(e) => handleChange('customField2', e.target.value)}
            placeholder="Enter custom value..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>

        {/* Enable Toggle */}
        <div className="flex items-center justify-between py-4 border-t border-gray-200">
          <div>
            <label
              htmlFor="isEnabled"
              className="block text-sm font-medium text-gray-700"
            >
              Enable Activity
            </label>
            <p className="text-sm text-gray-500">
              When disabled, the Journey will skip this activity
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={config.isEnabled}
            onClick={() => handleChange('isEnabled', !config.isEnabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              config.isEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                config.isEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Data Binding Reference */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Available Data Bindings
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>
              <code className="bg-blue-100 px-1 rounded">
                {'{{Contact.Key}}'}
              </code>{' '}
              - Contact unique identifier
            </li>
            <li>
              <code className="bg-blue-100 px-1 rounded">
                {'{{InteractionDefaults.Email}}'}
              </code>{' '}
              - Contact email address
            </li>
            <li>
              <code className="bg-blue-100 px-1 rounded">
                {'{{Contact.Attribute.DataExtensionName.FieldName}}'}
              </code>{' '}
              - Data Extension field
            </li>
          </ul>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
