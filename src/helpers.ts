
// Removes any parts of a call sign that are not
// part of the actuall call like "portable" or
// a foreign country
export function getMainCall(call: string): string {
  const parts = call.split('/')

  // Just return the longes part of the array
  const mainCall = parts.reduce((last, next) => {
    return last.length >= next.length ? last : next;
  });

  return mainCall.toUpperCase();
}

export function callIsPortable(call: string): boolean {
  return call.toUpperCase().endsWith('/P');
}

export function getFilePath(uri: string): string {
  return decodeURI(uri)
    .replace(/content:\/\/com.android./, '')
    // I honestlly don't get why there are
    // things like %3A instead of a /. I'm
    // missing something here....
    // So feel free to fix this
    .replace(/%[0-9][A-Z]/g, '/');
}
