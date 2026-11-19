export const selectStyles = {
  control: (base) => ({
    ...base,
    borderRadius: "8px",
    borderColor: "#d1d5db",
    minHeight: "44px",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#3b82f6",
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#eff6ff" : "white",
    color: "#1f2937",
    cursor: "pointer",
  }),
};
