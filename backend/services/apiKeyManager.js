import { UserApiKeys } from '../models/index.js';

class ApiKeyManager {
  constructor() {
    this.defaultUserId = 'default_user';
  }

  // Get user API keys
  async getUserApiKeys(userId = this.defaultUserId) {
    try {
      let userKeys = await UserApiKeys.findOne({
        where: { user_id: userId }
      });

      if (!userKeys) {
        // Create default user with empty keys
        userKeys = await UserApiKeys.create({
          user_id: userId,
          websocket_keys: {
            finnhub: '',
            alpha_vantage: '',
            twelve_data: ''
          },
          rest_api_keys: {
            alpha_vantage: '',
            twelve_data: '',
            exchange_rates: ''
          }
        });
      }

      return userKeys;
    } catch (error) {
      console.error('Error getting user API keys:', error);
      return null;
    }
  }

  // Update user API keys
  async updateUserApiKeys(userId, keyType, provider, apiKey) {
    try {
      const userKeys = await this.getUserApiKeys(userId);
      
      if (!userKeys) {
        throw new Error('User not found');
      }

      // Validate key type and provider
      if (!['websocket_keys', 'rest_api_keys'].includes(keyType)) {
        throw new Error('Invalid key type');
      }

      const validProviders = {
        websocket_keys: ['finnhub', 'alpha_vantage', 'twelve_data'],
        rest_api_keys: ['alpha_vantage', 'twelve_data', 'exchange_rates']
      };

      if (!validProviders[keyType].includes(provider)) {
        throw new Error(`Invalid provider for ${keyType}`);
      }

      // Update the specific key
      const updatedKeys = { ...userKeys[keyType] };
      updatedKeys[provider] = apiKey;

      await userKeys.update({
        [keyType]: updatedKeys
      });

      console.log(`✅ Updated ${keyType}.${provider} for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error updating API keys:', error);
      return false;
    }
  }

  // Validate API key format
  validateApiKey(provider, apiKey) {
    const validators = {
      finnhub: (key) => key && key.length >= 20 && key.match(/^[a-zA-Z0-9]+$/),
      alpha_vantage: (key) => key && key.length >= 10 && key.match(/^[A-Z0-9]+$/),
      twelve_data: (key) => key && key.length >= 20 && key.match(/^[a-zA-Z0-9]+$/),
      exchange_rates: (key) => key && key.length >= 10
    };

    const validator = validators[provider];
    return validator ? validator(apiKey) : false;
  }

  // Get active API keys (non-empty)
  async getActiveApiKeys(userId = this.defaultUserId) {
    try {
      const userKeys = await this.getUserApiKeys(userId);
      
      if (!userKeys) {
        return { websocket_keys: {}, rest_api_keys: {} };
      }

      const activeWebsocketKeys = {};
      const activeRestKeys = {};

      // Filter out empty keys
      Object.entries(userKeys.websocket_keys).forEach(([provider, key]) => {
        if (key && key.trim() !== '') {
          activeWebsocketKeys[provider] = key;
        }
      });

      Object.entries(userKeys.rest_api_keys).forEach(([provider, key]) => {
        if (key && key.trim() !== '') {
          activeRestKeys[provider] = key;
        }
      });

      return {
        websocket_keys: activeWebsocketKeys,
        rest_api_keys: activeRestKeys
      };
    } catch (error) {
      console.error('Error getting active API keys:', error);
      return { websocket_keys: {}, rest_api_keys: {} };
    }
  }

  // Check if user has any API keys configured
  async hasApiKeysConfigured(userId = this.defaultUserId) {
    try {
      const activeKeys = await this.getActiveApiKeys(userId);
      
      const hasWebsocketKeys = Object.keys(activeKeys.websocket_keys).length > 0;
      const hasRestKeys = Object.keys(activeKeys.rest_api_keys).length > 0;
      
      return {
        hasWebsocketKeys,
        hasRestKeys,
        hasAnyKeys: hasWebsocketKeys || hasRestKeys
      };
    } catch (error) {
      console.error('Error checking API keys configuration:', error);
      return { hasWebsocketKeys: false, hasRestKeys: false, hasAnyKeys: false };
    }
  }

  // Get API key status for frontend
  async getApiKeyStatus(userId = this.defaultUserId) {
    try {
      const userKeys = await this.getUserApiKeys(userId);
      
      if (!userKeys) {
        return {
          websocket_keys: {
            finnhub: { configured: false, key: '' },
            alpha_vantage: { configured: false, key: '' },
            twelve_data: { configured: false, key: '' }
          },
          rest_api_keys: {
            alpha_vantage: { configured: false, key: '' },
            twelve_data: { configured: false, key: '' },
            exchange_rates: { configured: false, key: '' }
          }
        };
      }

      const status = {
        websocket_keys: {},
        rest_api_keys: {}
      };

      // Check websocket keys
      Object.entries(userKeys.websocket_keys).forEach(([provider, key]) => {
        status.websocket_keys[provider] = {
          configured: key && key.trim() !== '',
          key: key ? key.substring(0, 4) + '...' + key.substring(key.length - 4) : ''
        };
      });

      // Check rest API keys
      Object.entries(userKeys.rest_api_keys).forEach(([provider, key]) => {
        status.rest_api_keys[provider] = {
          configured: key && key.trim() !== '',
          key: key ? key.substring(0, 4) + '...' + key.substring(key.length - 4) : ''
        };
      });

      return status;
    } catch (error) {
      console.error('Error getting API key status:', error);
      return null;
    }
  }

  // Reset all API keys for a user
  async resetApiKeys(userId = this.defaultUserId) {
    try {
      const userKeys = await this.getUserApiKeys(userId);
      
      if (userKeys) {
        await userKeys.update({
          websocket_keys: {
            finnhub: '',
            alpha_vantage: '',
            twelve_data: ''
          },
          rest_api_keys: {
            alpha_vantage: '',
            twelve_data: '',
            exchange_rates: ''
          }
        });
      }

      console.log(`✅ Reset all API keys for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error resetting API keys:', error);
      return false;
    }
  }
}

export default ApiKeyManager;
