export let config = {
  api: {
    url: 'https://apptoogoodtogo.com/api/',
    endpoints: {
      item: 'item/v7/',
      authEmail: 'auth/v3/authByEmail',
      authPolling: 'auth/v3/authByRequestPollingId',
      signUpEmail: 'auth/v3/signUpByEmail',
      refreshToken: 'auth/v3/token/refresh',
      activeOrder: 'order/v6/active',
      inactiveOrder: 'order/v6/inactive',
    },
    userAgents: [
      'TGTG/{} Dalvik/2.1.0 (Linux; U; Android 9; Nexus 5 Build/M4B30Z)',
      'TGTG/{} Dalvik/2.1.0 (Linux; U; Android 10; SM-G935F Build/NRD90M)',
      'TGTG/{} Dalvik/2.1.0 (Linux; Android 12; SM-G920V Build/MMB29K)',
    ],
    accessTokenLifetime: 3600 * 4,
    maxRetries: 24,
    waitTime: 5000,
    language: 'en-UK',
  },
};
