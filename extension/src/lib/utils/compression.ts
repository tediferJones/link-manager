type CompressionTypes = ConstructorParameters<typeof CompressionStream>[0]
const compressionStrategy: CompressionTypes = 'gzip';

export async function compress(data: string) {
  const binary = new TextEncoder().encode(data);
  const stream = new Blob([ binary ]).stream();
  const compressedStream = stream.pipeThrough(
    new CompressionStream(compressionStrategy)
  );
  const compressedData = new Uint8Array(
    await new Response(compressedStream).arrayBuffer()
  );
  return btoa(String.fromCharCode(...compressedData));
}

export async function decompress(data: string) {
  const binary = Uint8Array.from(atob(data), c => c.charCodeAt(0));
  const stream = new Blob([ binary ]).stream();
  const decompressedStream = stream.pipeThrough(
    new DecompressionStream(compressionStrategy)
  );
  return new Response(decompressedStream).text();
}
