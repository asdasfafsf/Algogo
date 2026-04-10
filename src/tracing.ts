import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

export function initTracing() {
  const tempoEnabled = process.env.TEMPO_ENABLED === 'true';

  if (!tempoEnabled) return;

  const exporter = new OTLPTraceExporter({
    url: process.env.TEMPO_ENDPOINT ?? '',
    headers: process.env.TEMPO_AUTH_HEADER
      ? { Authorization: `Basic ${process.env.TEMPO_AUTH_HEADER}` }
      : undefined,
  });

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'algogo',
    }),
    traceExporter: exporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
      }),
    ],
  });

  sdk.start();
}
