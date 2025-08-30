class Cache {
  private cache: Map<string, { imageUrl: string; timestamp: number }> = new Map();
  private cacheDuration: number; // in milliseconds

  constructor(duration: number) {
    this.cacheDuration = duration;
  }

  public get(key: string) {
    const cachedItem = this.cache.get(key);
    if (cachedItem) {
      const isExpired = Date.now() - cachedItem.timestamp > this.cacheDuration;
      if (!isExpired) {
        return cachedItem.imageUrl;
      } else {
        this.cache.delete(key); // Remove expired item
      }
    }
    return null;
  }

  public set(key: string, value: string) {
    this.cache.set(key, { imageUrl: value, timestamp: Date.now() });
  }
}

export const imageCache = new Cache(1000 * 60 * 5); // Cache duration set to 5 minutes
