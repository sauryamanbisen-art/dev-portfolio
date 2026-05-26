/* ================= toggle style switcher ================= */
const styleSwitcher = document.querySelector(".style-switcher");
const styleSwitcherToggle = document.querySelector(".style-switcher-toggler");

if (styleSwitcherToggle && styleSwitcher) {
  styleSwitcherToggle.addEventListener("click", () => {
    styleSwitcher.classList.toggle("open");
  }); 

  // hide style - switcher on scroll (highly optimized to avoid layout thrashing on every scroll event)
  window.addEventListener("scroll", () => {
    if (styleSwitcher.classList.contains("open")) {
      styleSwitcher.classList.remove("open");
    }
  });
}

/* ================= theme colors ================= */
const alternateStyles = document.querySelectorAll(".alternate-style");

function setActiveStyle(color) {
  alternateStyles.forEach((style) => {
    if (color === style.getAttribute("title")) {
      style.disabled = false; // Standard spec-compliant way to enable stylesheets
    } else {
      style.disabled = true;  // Standard spec-compliant way to disable stylesheets
    }
  });
  localStorage.setItem("theme-color", color);
}

// Explicitly bind setActiveStyle to the window object to prevent any ReferenceErrors in inline HTML onclick handlers
window.setActiveStyle = setActiveStyle;

// Apply saved theme color immediately on parse (avoids color flash on load)
const savedColor = localStorage.getItem("theme-color");
if (savedColor) {
  setActiveStyle(savedColor);
}

/* ================= theme light and dark mode ================= */
const dayNight = document.querySelector(".day-night");

// Function to update the light/dark icon classes
function updateIcon() {
  if (dayNight) {
    const icon = dayNight.querySelector("i");
    if (icon) {
      if (document.body.classList.contains("dark")) {
        icon.classList.add("fa-sun");
        icon.classList.remove("fa-moon");
      } else {
        icon.classList.add("fa-moon");
        icon.classList.remove("fa-sun");
      }
    }
  }
}

// Apply theme mode immediately on script execution (completely prevents white flash on reload)
const savedMode = localStorage.getItem("theme-mode");
if (savedMode === "dark") {
  document.body.classList.add("dark");
} else if (savedMode === "light") {
  document.body.classList.remove("dark");
} else {
  // System preference fallback if user hasn't chosen a preference yet
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add("dark");
  }
}

// Initialize icon immediately as elements exist in DOM
updateIcon();

if (dayNight) {
  dayNight.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    
    // Save preference to localStorage
    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme-mode", "dark");
    } else {
      localStorage.setItem("theme-mode", "light");
    }
    
    updateIcon();
  });
}
