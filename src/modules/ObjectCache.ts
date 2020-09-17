export default class ObjectCache<V extends { name: string }> extends Map<string, V> {
  getOrThrow(key: string): V {
    const value = this.get(key)
    if (!value) {
      throw Error(`no value for key '${key}' in this cache`)
    }

    return value
  }
}
