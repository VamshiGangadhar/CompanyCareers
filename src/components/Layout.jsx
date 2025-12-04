import { clsx } from "clsx";

const Layout = ({ children, branding, className }) => {
  const defaultBranding = {
    primaryColor: "#3b82f6",
    secondaryColor: "#1f2937",
    backgroundColor: "#ffffff",
    textColor: "#374151",
    logo: null,
    banner: null,
  };

  const theme = { ...defaultBranding, ...branding };

  const customStyles = {
    "--primary-color": theme.primaryColor,
    "--secondary-color": theme.secondaryColor,
    "--background-color": theme.backgroundColor,
    "--text-color": theme.textColor,
  };

  return (
    <div
      className={clsx("min-h-screen", className)}
      style={{
        ...customStyles,
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
      }}
    >
      {theme.banner && (
        <div
          className="h-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${theme.banner})` }}
        />
      )}

      <div className="container mx-auto px-4">
        {theme.logo && (
          <div className="py-6">
            <img src={theme.logo} alt="Company Logo" className="h-16 w-auto" />
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default Layout;
