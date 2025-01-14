export const setCookie = (
  name: string,
  value: string,
  options: { path?: string; maxAge?: number } = {}
) => {
  let cookieString = `${name}=${value};`;

  if (options.path) {
    cookieString += `Path=${options.path};`;
  }

  if (options.maxAge) {
    cookieString += `Max-Age=${options.maxAge};`;
  }

  document.cookie = cookieString;
};

export const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((row) => row.startsWith(`${name}=`));
  return cookie ? cookie.split("=")[1] : null;
};