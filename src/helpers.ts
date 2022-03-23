
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
