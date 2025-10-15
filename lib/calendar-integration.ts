// Calendar Integration API helpers
// Handles integration with external booking systems like Calendly, Acuity, etc.

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  serviceType?: string;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  externalId?: string; // ID from external system
}

export interface CalendarProvider {
  id: string;
  name: string;
  description: string;
  logo: string;
  website: string;
  apiDocumentation: string;
  supportedFeatures: string[];
  setupInstructions: string;
}

export const CALENDAR_PROVIDERS: CalendarProvider[] = [
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Popular scheduling platform with extensive integrations',
    logo: '📅',
    website: 'https://calendly.com',
    apiDocumentation: 'https://developer.calendly.com',
    supportedFeatures: ['Two-way sync', 'Webhooks', 'Custom fields', 'Team scheduling'],
    setupInstructions: 'Get your API key from Calendly Settings > Integrations > API & Webhooks'
  },
  {
    id: 'acuity',
    name: 'Acuity Scheduling',
    description: 'Professional scheduling solution for service businesses',
    logo: '⏰',
    website: 'https://acuityscheduling.com',
    apiDocumentation: 'https://developers.acuityscheduling.com',
    supportedFeatures: ['Two-way sync', 'Webhooks', 'Payment processing', 'SMS notifications'],
    setupInstructions: 'Generate API credentials in Acuity Settings > Integrations > API'
  },
  {
    id: 'GOOGLE_CALENDAR',
    name: 'Google Calendar',
    description: 'Sync with your Google Calendar for unified scheduling',
    logo: '📊',
    website: 'https://calendar.google.com',
    apiDocumentation: 'https://developers.google.com/calendar',
    supportedFeatures: ['Two-way sync', 'Multiple calendars', 'Event details', 'Attendees'],
    setupInstructions: 'Click "Connect with Google" to authorize access to your calendar. No API keys needed!'
  },
  {
    id: 'outlook',
    name: 'Outlook Calendar',
    description: 'Microsoft Outlook calendar integration',
    logo: '📧',
    website: 'https://outlook.live.com',
    apiDocumentation: 'https://docs.microsoft.com/en-us/graph/api/resources/calendar',
    supportedFeatures: ['Two-way sync', 'Office 365', 'Event details', 'Attendees'],
    setupInstructions: 'Register app in Azure AD and configure Microsoft Graph API'
  },
  {
    id: 'bookly',
    name: 'Bookly',
    description: 'Booking and scheduling software for service businesses',
    logo: '📖',
    website: 'https://www.bookly.pro',
    apiDocumentation: 'https://www.bookly.pro/api-documentation',
    supportedFeatures: ['Two-way sync', 'Webhooks', 'Customer management', 'Payments'],
    setupInstructions: 'Generate API key from Bookly Settings > API'
  },
  {
    id: 'simplybook',
    name: 'SimplyBook.me',
    description: 'Online booking system with extensive customization',
    logo: '📋',
    website: 'https://simplybook.me',
    apiDocumentation: 'https://simplybook.me/api-documentation',
    supportedFeatures: ['Two-way sync', 'Webhooks', 'Multi-location', 'Staff scheduling'],
    setupInstructions: 'Enable API access in SimplyBook.me Settings > Integrations'
  }
];

/**
 * Test connection to external calendar provider
 */
export async function testCalendarConnection(
  provider: string,
  apiKey: string,
  additionalConfig?: Record<string, any>
): Promise<{ success: boolean; error?: string; calendars?: any[] }> {
  try {
    switch (provider) {
      case 'calendly':
        return await testCalendlyConnection(apiKey);
      case 'acuity':
        return await testAcuityConnection(apiKey);
      case 'google':
        return await testGoogleConnection(apiKey);
      case 'outlook':
        return await testOutlookConnection(apiKey);
      default:
        return { success: false, error: 'Provider not supported' };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Connection test failed' 
    };
  }
}

/**
 * Sync events from external calendar to PMU Pro
 */
export async function syncEventsFromExternal(
  integrationId: string,
  provider: string,
  apiKey: string,
  calendarId?: string
): Promise<CalendarEvent[]> {
  try {
    switch (provider) {
      case 'calendly':
        return await syncFromCalendly(apiKey, calendarId);
      case 'acuity':
        return await syncFromAcuity(apiKey, calendarId);
      case 'google':
        return await syncFromGoogle(apiKey, calendarId);
      case 'outlook':
        return await syncFromOutlook(apiKey, calendarId);
      default:
        throw new Error('Provider not supported');
    }
  } catch (error) {
    console.error(`Failed to sync from ${provider}:`, error);
    throw error;
  }
}

/**
 * Sync events from PMU Pro to external calendar
 */
export async function syncEventsToExternal(
  integrationId: string,
  provider: string,
  apiKey: string,
  events: CalendarEvent[],
  calendarId?: string
): Promise<{ success: boolean; syncedCount: number; errors: string[] }> {
  try {
    let syncedCount = 0;
    const errors: string[] = [];

    for (const event of events) {
      try {
        switch (provider) {
          case 'calendly':
            await syncToCalendly(apiKey, event, calendarId);
            break;
          case 'acuity':
            await syncToAcuity(apiKey, event, calendarId);
            break;
          case 'google':
            await syncToGoogle(apiKey, event, calendarId);
            break;
          case 'outlook':
            await syncToOutlook(apiKey, event, calendarId);
            break;
          default:
            throw new Error('Provider not supported');
        }
        syncedCount++;
      } catch (error) {
        errors.push(`Failed to sync event "${event.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { success: true, syncedCount, errors };
  } catch (error) {
    console.error(`Failed to sync to ${provider}:`, error);
    throw error;
  }
}

// Provider-specific implementation functions (mock implementations for now)

async function testCalendlyConnection(apiKey: string): Promise<{ success: boolean; error?: string; calendars?: any[] }> {
  // Mock implementation - in real app, would call Calendly API
  return { 
    success: true, 
    calendars: [
      { id: 'calendly_1', name: 'PMU Consultations', url: 'https://calendly.com/artist/pmu' },
      { id: 'calendly_2', name: 'Touch-up Appointments', url: 'https://calendly.com/artist/touchup' }
    ]
  };
}

async function testAcuityConnection(apiKey: string): Promise<{ success: boolean; error?: string; calendars?: any[] }> {
  // Mock implementation - in real app, would call Acuity API
  return { 
    success: true, 
    calendars: [
      { id: 'acuity_1', name: 'Main Calendar', url: 'https://artist.acuityscheduling.com' }
    ]
  };
}

async function testGoogleConnection(apiKey: string): Promise<{ success: boolean; error?: string; calendars?: any[] }> {
  // Mock implementation - in real app, would call Google Calendar API
  return { 
    success: true, 
    calendars: [
      { id: 'google_1', name: 'Primary', url: 'https://calendar.google.com' },
      { id: 'google_2', name: 'PMU Business', url: 'https://calendar.google.com' }
    ]
  };
}

async function testOutlookConnection(apiKey: string): Promise<{ success: boolean; error?: string; calendars?: any[] }> {
  // Mock implementation - in real app, would call Microsoft Graph API
  return { 
    success: true, 
    calendars: [
      { id: 'outlook_1', name: 'Calendar', url: 'https://outlook.live.com' }
    ]
  };
}

async function syncFromCalendly(apiKey: string, calendarId?: string): Promise<CalendarEvent[]> {
  // Mock implementation - would fetch events from Calendly API
  return [
    {
      id: 'calendly_event_1',
      title: 'PMU Consultation',
      startTime: new Date('2024-01-15T10:00:00Z'),
      endTime: new Date('2024-01-15T11:00:00Z'),
      clientName: 'Sarah Johnson',
      clientEmail: 'sarah@example.com',
      serviceType: 'Consultation',
      status: 'scheduled',
      externalId: 'calendly_event_1'
    }
  ];
}

async function syncFromAcuity(apiKey: string, calendarId?: string): Promise<CalendarEvent[]> {
  // Mock implementation - would fetch events from Acuity API
  return [
    {
      id: 'acuity_event_1',
      title: 'Microblading Session',
      startTime: new Date('2024-01-16T14:00:00Z'),
      endTime: new Date('2024-01-16T16:00:00Z'),
      clientName: 'Maria Garcia',
      clientEmail: 'maria@example.com',
      serviceType: 'Microblading',
      status: 'confirmed',
      externalId: 'acuity_event_1'
    }
  ];
}

async function syncFromGoogle(apiKey: string, calendarId?: string): Promise<CalendarEvent[]> {
  // Mock implementation - would fetch events from Google Calendar API
  return [];
}

async function syncFromOutlook(apiKey: string, calendarId?: string): Promise<CalendarEvent[]> {
  // Mock implementation - would fetch events from Microsoft Graph API
  return [];
}

async function syncToCalendly(apiKey: string, event: CalendarEvent, calendarId?: string): Promise<void> {
  // Mock implementation - would create/update event in Calendly
  console.log('Syncing to Calendly:', event.title);
}

async function syncToAcuity(apiKey: string, event: CalendarEvent, calendarId?: string): Promise<void> {
  // Mock implementation - would create/update event in Acuity
  console.log('Syncing to Acuity:', event.title);
}

async function syncToGoogle(apiKey: string, event: CalendarEvent, calendarId?: string): Promise<void> {
  // Mock implementation - would create/update event in Google Calendar
  console.log('Syncing to Google Calendar:', event.title);
}

async function syncToOutlook(apiKey: string, event: CalendarEvent, calendarId?: string): Promise<void> {
  // Mock implementation - would create/update event in Outlook
  console.log('Syncing to Outlook:', event.title);
}
