export const setCookie = (name: string, value: string, options?: { path?: string; maxAge?: number }) => {
  let cookieString = `${name}=${value};`;
  if (options?.path) {
    cookieString += ` path=${options.path};`;
  }
  if (options?.maxAge) {
    cookieString += ` max-age=${options.maxAge};`;
  }
  document.cookie = cookieString;
  console.log(`Cookie written: ${cookieString}`); // Debugging log
};

export const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((c) => c.startsWith(`${name}=`));
  return cookie ? cookie.split("=")[1] : null;
};