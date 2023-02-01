export default function decodeProxyParams(urlSearch: string) {
  const ret = {} as Record<string, string>;
  const params = Object.fromEntries(new URLSearchParams(urlSearch));
  for (const [key, value] of Object.entries(params)) {
    if (!key.startsWith("proxyParams.")) {
      continue;
    }
    const decodedKey = decodeURIComponent(key.replace("proxyParams.", ""));
    const decodedValue = decodeURIComponent(value);
    ret[decodedKey] = decodedValue;
  }
  return ret;
}
