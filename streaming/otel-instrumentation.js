const {OTLPMetricExporter} = require('@opentelemetry/exporter-metrics-otlp-http');
const {OTLPTraceExporter} = require('@opentelemetry/exporter-trace-otlp-http');
const {ExpressInstrumentation} = require('@opentelemetry/instrumentation-express');
const {FsInstrumentation} = require('@opentelemetry/instrumentation-fs');
const {HttpInstrumentation} = require('@opentelemetry/instrumentation-http');
const {IORedisInstrumentation} = require('@opentelemetry/instrumentation-ioredis');
const {PgInstrumentation} = require('@opentelemetry/instrumentation-pg');
const {PinoInstrumentation} = require('@opentelemetry/instrumentation-pino');
const {containerDetector} = require('@opentelemetry/resource-detector-container');
const {envDetector, hostDetector, osDetector, processDetector} = require('@opentelemetry/resources');
const { Resource } = require('@opentelemetry/resources');
const {PeriodicExportingMetricReader} = require('@opentelemetry/sdk-metrics');
const opentelemetry = require('@opentelemetry/sdk-node');
const {SemanticResourceAttributes} = require('@opentelemetry/semantic-conventions');

const sdk = new opentelemetry.NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'mastodon/streaming',
  }),
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new FsInstrumentation({
      // instrument fs only when it is part of another trace
      //requireParentSpan: true,
    }),
    new IORedisInstrumentation(),
    new PgInstrumentation(),
    new PinoInstrumentation({
      logKeys: {
        traceId: 'traceId',
        spanId: 'spanId',
        traceFlags: 'traceFlags',
      },
    }),
  ],
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
  }),
  resourceDetectors: [
    containerDetector,
    envDetector,
    hostDetector,
    osDetector,
    processDetector
  ],
});

sdk.start();
