declare module "exif-parser" {
  interface Parser {
    enableSimpleValues(enabled: boolean): Parser;
    enableImageSize(enabled: boolean): Parser;
    parse(): { tags: Record<string, unknown> };
  }

  export function create(
    buffer: ArrayBuffer,
    environment?: typeof globalThis,
  ): Parser;
}
