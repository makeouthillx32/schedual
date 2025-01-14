export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeType, setThemeType] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = getCookie("theme");
      return savedTheme === "dark" ? "dark" : "light";
    }
    return "light"; // Default for SSR
  });

  // Sync theme on load
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeType);
  }, [themeType]);

  const toggleTheme = () => {
    const newTheme = themeType === "light" ? "dark" : "light";
    setThemeType(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    setCookie("theme", newTheme, { path: "/", maxAge: 31536000 });
  };

  return (
    <ThemeContext.Provider value={{ themeType, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};