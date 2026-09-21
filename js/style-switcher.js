/* ---------- theme colors ---------- */
const alternateStyles = document.querySelectorAll(".alternate-style");

const colorsRgb = {
  "color-1": "236, 24, 57",   // #ec1839
  "color-2": "139, 92, 246",  // #8b5cf6
  "color-3": "37, 99, 235",   // #2563eb
  "color-4": "16, 185, 129",  // #10b981
  "color-5": "250, 91, 15"    // #fa5b0f
};

// Explicitly bind setActiveStyle to the window object to prevent any ReferenceErrors
window.setActiveStyle = setActiveStyle;

function setActiveStyle(color) {
  alternateStyles.forEach((style) => {
    if (color === style.getAttribute("title")) {
      style.disabled = false;
    } else {
      style.disabled = true;
    }
  });

  // Set the CSS variable for the RGB color so the glow matches
  if (colorsRgb[color]) {
    document.documentElement.style.setProperty("--active-rgb", colorsRgb[color]);
  }

  // Save preference
  localStorage.setItem("theme-color", color);
}

// Apply saved theme color immediately, fallback to color-1 if none
const savedColor = localStorage.getItem("theme-color") || "color-1";
setActiveStyle(savedColor);

/* ---------- Pill UI Logic ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const themeControls = document.querySelector(".theme-controls");
  const themeModeToggle = document.getElementById("themeModeToggle");
  const accentPickerBtn = document.getElementById("accentPickerBtn");
  const accentPickerWrapper = document.querySelector(".accent-picker-wrapper");
  const accentOptions = document.querySelectorAll(".accent-option");
  const currentAccentDot = document.querySelector(".current-accent-dot");

  // Scroll hide/show logic is handled in script.js (handleSectionScroll)

  // 2. Light / Dark Mode Toggle Logic
  function applyThemeMode(isDark) {
    const root = document.documentElement;

    // Suppress transitions for one paint frame to prevent stagger
    root.classList.add("theme-switching");

    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme-mode", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme-mode", "light");
    }

    // Re-enable transitions after the browser paints the new theme
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove("theme-switching");
      });
    });
  }

  if (themeModeToggle) {
    themeModeToggle.addEventListener("click", (e) => {
      e.preventDefault();
      const isCurrentlyDark = document.documentElement.classList.contains("dark");
      // Clicking anywhere on the toggle pill flips the current mode
      applyThemeMode(!isCurrentlyDark);
    });
  }

  // Initial Sync from body class (set in index.html script tag)
  const isDarkInitial = document.documentElement.classList.contains("dark");
  applyThemeMode(isDarkInitial);

  // 3. Accent Color Dropdown Logic
  if (accentPickerBtn && accentPickerWrapper) {
    accentPickerBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isExpanded = accentPickerBtn.getAttribute("aria-expanded") === "true";
      accentPickerBtn.setAttribute("aria-expanded", !isExpanded);
      accentPickerWrapper.classList.toggle("open");
    });

    // Handle Accent Color Selection
    accentOptions.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const color = btn.getAttribute("data-color");
        const hex = btn.getAttribute("data-hex");
        
        // Apply the style via the existing function
        setActiveStyle(color);

        // Update the UI: Set active state on the option
        accentOptions.forEach(opt => opt.classList.remove("active"));
        btn.classList.add("active");

        // Update the active color dot on the main button
        if (currentAccentDot) {
          currentAccentDot.style.background = hex;
        }

        // Close the dropdown
        accentPickerWrapper.classList.remove("open");
        accentPickerBtn.setAttribute("aria-expanded", "false");
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (accentPickerWrapper.classList.contains("open") && !accentPickerWrapper.contains(e.target)) {
        accentPickerWrapper.classList.remove("open");
        accentPickerBtn.setAttribute("aria-expanded", "false");
      }
    });

    // Initial Sync of the active dot based on saved color
    const activeColor = localStorage.getItem("theme-color") || "color-1";
    const activeBtn = Array.from(accentOptions).find(opt => opt.getAttribute("data-color") === activeColor);
    if (activeBtn) {
      accentOptions.forEach(opt => opt.classList.remove("active"));
      activeBtn.classList.add("active");
      if (currentAccentDot) {
        currentAccentDot.style.background = activeBtn.getAttribute("data-hex");
      }
    }
  }
});
