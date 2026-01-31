/**
 * Packet color assignment
 * Deterministic colors derived from packet IDs
 */

/**
 * Creates a color map for the provided packet IDs
 */
export function getPacketColorMap(packetIds: string[]): Record<string, string> {
  const uniqueIds = Array.from(new Set(packetIds)).sort();
  const count = uniqueIds.length;

  if (count === 0) {
    return {};
  }

  const colors: Record<string, string> = {};

  for (let i = 0; i < uniqueIds.length; i++) {
    const hue = Math.round((i * 360) / count);
    colors[uniqueIds[i]] = `hsl(${hue}, 70%, 50%)`;
  }

  return colors;
}
