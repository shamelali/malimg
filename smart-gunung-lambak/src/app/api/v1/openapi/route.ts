import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    openapi: '3.1.0',
    info: {
      title: 'Smart Gunung Lambak API',
      version: '1.0.0',
      description: 'Visitor, ranger, IoT, booking, safety and command-centre API for the MPK Kluang pilot.'
    },
    servers: [{ url: '/api/v1', description: 'Same-origin API' }],
    tags: [
      { name: 'Operations' },
      { name: 'Visitors' },
      { name: 'Rangers' },
      { name: 'Safety' },
      { name: 'Reports' }
    ],
    paths: {
      '/health': { get: { tags: ['Operations'], summary: 'Service health', responses: { '200': { description: 'OK' }, '503': { description: 'Dependency degraded' } } } },
      '/session': {
        post: { tags: ['Operations'], summary: 'Set demo role cookie', responses: { '200': { description: 'Session established' } } },
        delete: { tags: ['Operations'], summary: 'Reset demo session', responses: { '200': { description: 'Session reset' } } }
      },
      '/dashboard': { get: { tags: ['Operations'], summary: 'Aggregated operational dashboard', responses: { '200': { description: 'Dashboard snapshot' } } } },
      '/facilities': {
        get: { tags: ['Visitors'], summary: 'List facilities', responses: { '200': { description: 'Facilities' } } },
        patch: { tags: ['Rangers'], summary: 'Cycle facility operational status', requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } } } } }, responses: { '200': { description: 'Updated facility' }, '400': { description: 'Validation error' } } }
      },
      '/bookings': {
        get: { tags: ['Visitors'], summary: 'List bookings', responses: { '200': { description: 'Bookings' } } },
        post: { tags: ['Visitors'], summary: 'Create a booking with QR reference and smart-lock PIN', responses: { '201': { description: 'Booking created' }, '400': { description: 'Validation error' } } }
      },
      '/tasks': {
        get: { tags: ['Rangers'], summary: 'List ranger tasks', responses: { '200': { description: 'Tasks' } } },
        patch: { tags: ['Rangers'], summary: 'Complete or reopen a task', responses: { '200': { description: 'Updated task' } } }
      },
      '/iot': { get: { tags: ['Operations'], summary: 'IoT device catalog and latest values', responses: { '200': { description: 'Devices' } } } },
      '/sos': { post: { tags: ['Safety'], summary: 'Dispatch an emergency SOS', responses: { '201': { description: 'Dispatch accepted' }, '429': { description: 'Rate limited' } } } },
      '/sync': { post: { tags: ['Rangers'], summary: 'Flush the offline task queue', responses: { '200': { description: 'Sync result' } } } },
      '/checkpoints/{code}': {
        post: {
          tags: ['Visitors'],
          summary: 'Stamp a trail passport checkpoint',
          parameters: [{ name: 'code', in: 'path', required: true, schema: { type: 'string', enum: ['BASE', 'CP1', 'NORTH', 'SOUTH', 'MAST'] } }],
          responses: { '201': { description: 'Checkpoint stamped' }, '400': { description: 'Invalid checkpoint' } }
        }
      },
      '/trails': {
        get: {
          tags: ['Visitors'],
          summary: 'Bilingual trail catalog with difficulty, distance, elevation, ratings and weather',
          responses: { '200': { description: 'Trails and forecast' } }
        }
      },
      '/hikes': {
        get: { tags: ['Visitors'], summary: 'List recorded hike sessions', responses: { '200': { description: 'Hike log' } } },
        post: {
          tags: ['Visitors'],
          summary: 'Save a completed recorded hike and award gamification points',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { trailId: { type: 'string' }, durationSec: { type: 'number' }, distanceKm: { type: 'number' }, elevationM: { type: 'number' }, steps: { type: 'number' }, caloriesKcal: { type: 'number' }, source: { type: 'string', enum: ['gps', 'simulated'] } } } } } },
          responses: { '201': { description: 'Hike saved' }, '400': { description: 'Validation error' }, '429': { description: 'Rate limited' } }
        }
      },
      '/parks': { get: { tags: ['Operations'], summary: 'MPK multi-park catalog', responses: { '200': { description: 'Parks' } } } },
      '/forecast': { get: { tags: ['Operations'], summary: 'Computed car-park capacity forecast and staffing recommendation', responses: { '200': { description: 'Forecast' } } } },
      '/incidents': {
        get: { tags: ['Safety'], summary: 'List incidents', responses: { '200': { description: 'Incidents' } } },
        post: { tags: ['Safety'], summary: 'Public/ranger safety or wildlife sighting report', responses: { '201': { description: 'Incident logged' }, '429': { description: 'Rate limited' } } }
      },
      '/consent': {
        get: { tags: ['Reports'], summary: 'PDPA consent statistics (reports capability)', responses: { '200': { description: 'Consent stats' }, '403': { description: 'Forbidden' } } },
        post: { tags: ['Visitors'], summary: 'Record a PDPA consent decision', responses: { '201': { description: 'Consent recorded' } } }
      },
      '/admin/config': {
        get: { tags: ['Reports'], summary: 'Current facility configuration (admin)', responses: { '200': { description: 'Config' }, '403': { description: 'Forbidden' } } },
        post: { tags: ['Reports'], summary: 'Persist capacities/price band, versioned and audit-logged (admin)', responses: { '200': { description: 'Config saved' }, '403': { description: 'Forbidden' } } }
      },
      '/admin/api-keys': {
        get: { tags: ['Reports'], summary: 'List masked integration API keys (admin)', responses: { '200': { description: 'Keys' }, '403': { description: 'Forbidden' } } },
        post: { tags: ['Reports'], summary: 'Issue or revoke an integration API key (admin)', responses: { '201': { description: 'Key issued; full value shown once' }, '403': { description: 'Forbidden' } } }
      },
      '/ops/restore-test': { post: { tags: ['Operations'], summary: 'Run and log a DR restore drill (admin)', responses: { '201': { description: 'Restore test result' }, '403': { description: 'Forbidden' } } } },
      '/integrations/webhook-test': { post: { tags: ['Operations'], summary: 'Synthetic webhook latency test (admin)', responses: { '201': { description: 'Webhook result' }, '403': { description: 'Forbidden' } } } },
      '/reports/audit': { get: { tags: ['Reports'], summary: 'Export audit log as JSON or CSV', security: [{ demoCookieAuth: [] }, { demoApiKeyAuth: [] }], parameters: [{ name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv'] } }], responses: { '200': { description: 'Audit report' }, '403': { description: 'Missing reports capability' } } } }
    },
    components: {
      securitySchemes: {
        demoCookieAuth: { type: 'apiKey', in: 'cookie', name: 'lambak_role' },
        demoApiKeyAuth: { type: 'apiKey', in: 'header', name: 'x-api-key' }
      }
    }
  });
}
