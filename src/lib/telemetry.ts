type TelemetryLevel = "info" | "warn" | "error";

type TelemetryProperties = Record<string, boolean | number | string | null | undefined>;

function sanitizeProperties(properties: TelemetryProperties): TelemetryProperties {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  );
}

export function safeSerializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      ...(process.env.NODE_ENV !== "production" ? {stack: error.stack} : {}),
    };
  }

  return {message: "Unknown error"};
}

export function logTelemetry(
  level: TelemetryLevel,
  eventName: string,
  properties: TelemetryProperties = {},
) {
  const payload = {
    eventName,
    properties: sanitizeProperties(properties),
    timestamp: new Date().toISOString(),
  };

  const serialized = JSON.stringify(payload);

  if (level === "error") {
    console.error(serialized);
    return;
  }

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  console.info(serialized);
}
