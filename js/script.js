// --- PRELOADER LOGIC ---
let preloaderStarted = false;

function startPreloaderTransition() {
  if (preloaderStarted) return;
  preloaderStarted = true;
  if (typeof fallbackTimeout !== 'undefined') clearTimeout(fallbackTimeout);

  const preloader = document.getElementById("preloader");
  const preloaderSkeleton = document.getElementById("preloader-skeleton");

  if (preloader) {
    setTimeout(() => {
      preloader.classList.add("fade-out");
      setTimeout(() => {
        if (preloader) preloader.remove();
        setTimeout(() => {
          if (preloaderSkeleton) {
            preloaderSkeleton.classList.add("fade-out");
            setTimeout(() => {
              if (preloaderSkeleton) preloaderSkeleton.remove();
            }, 600);
          }
        }, 800);
      }, 600);
    }, 800);
  } else if (preloaderSkeleton) {
    setTimeout(() => {
      if (preloaderSkeleton) {
        preloaderSkeleton.classList.add("fade-out");
        setTimeout(() => {
          if (preloaderSkeleton) preloaderSkeleton.remove();
        }, 600);
      }
    }, 800);
  }
}

// Safety fallback: if the page takes more than 3 seconds to fully trigger the 'load' event,
// force-start the preloader transition so the user is never stuck on a black screen.
const fallbackTimeout = setTimeout(() => {
  startPreloaderTransition();
}, 3000);

if (document.readyState === "complete") {
  startPreloaderTransition();
} else {
  window.addEventListener("load", startPreloaderTransition);
}
// --- END PRELOADER LOGIC ---

/* typing animation */
const typingElement = document.querySelector(".typing");
if (typingElement) {
  var typed = new Typed(".typing", {
    strings: ["Web Designer", "FullStack Developer", "DevOps Engineer","Tech Learner"],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true
  });
}
// Aside & Navigation
const nav = document.querySelector(".nav"),
  navList = nav ? nav.querySelectorAll("li") : [],
  totalNavList = navList.length,
  allSection = document.querySelectorAll(".section"),
  totalSection = allSection.length,
  aside = document.querySelector(".aside"),
  navTogglerBtn = document.querySelector(".nav-toggler");

// Section Progress Indicator Index Mapping (01/05 - 05/05)
const sectionIndexMap = {
  "home": 1,
  "about": 2,
  "services": 3,
  "portfolio": 4,
  "contact": 5
};

let isTransitioning = false;

function navigateToSection(targetId) {
  if (!targetId) return;

  // Collision guard: ignore rapid clicks while a transition is active
  if (isTransitioning) return;

  const currentSection = document.querySelector(".section.active");
  const targetSection = document.getElementById(targetId);

  // If target does not exist or user clicked current active section, do nothing
  if (!targetSection || currentSection === targetSection) return;

  isTransitioning = true;

  // Cleanly reset any active card hover states and indicators
  if (typeof resetAllHoverTrackers === "function") {
    resetAllHoverTrackers();
  }

  // Determine navigation direction (forward vs backward)
  const currentIndex = currentSection ? (sectionIndexMap[currentSection.id] || 1) : 1;
  const targetIndex = sectionIndexMap[targetId] || 1;
  const isForward = targetIndex >= currentIndex;

  // 1. Immediately update active state on sidebar navigation links for instant feedback
  for (let i = 0; i < totalNavList; i++) {
    const link = navList[i].querySelector("a");
    if (link) {
      const linkTarget = link.getAttribute("href").replace("#", "");
      if (linkTarget === targetId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    }
  }

  // 2. Immediately synchronize section progress indicator (e.g. 01/05 -> 02/05)
  syncSectionProgress(targetId);

  // 3. Close mobile aside drawer if open
  if (window.innerWidth < 1200 && aside && aside.classList.contains("open")) {
    asideSectionToggleBtn();
  }

  // 4. Update browser URL history without causing reload
  if (history.replaceState) {
    history.replaceState(null, null, targetId === "home" ? window.location.pathname + window.location.search : `#${targetId}`);
  }

  // 5. Ensure theme controls pill is visible at top of target section
  const themeControls = document.querySelector(".theme-controls");
  if (themeControls) {
    themeControls.classList.remove("hidden-on-scroll");
  }

  // Reset scroll position on target section before entrance begins
  targetSection.scrollTop = 0;

  // Animation class names based on direction
  const exitClass = isForward ? "section-exit-forward" : "section-exit-backward";
  const enterClass = isForward ? "section-enter-forward" : "section-enter-backward";

  // Clean lingering animation classes from any other sections
  allSection.forEach((sec) => {
    sec.classList.remove(
      "section-exit-forward",
      "section-exit-backward",
      "section-enter-forward",
      "section-enter-backward",
      "back-section"
    );
    if (sec !== currentSection && sec !== targetSection) {
      sec.classList.remove("active");
    }
  });

  // Apply coordinated exit and enter classes simultaneously
  if (currentSection) {
    currentSection.classList.add(exitClass);
  }
  targetSection.classList.add(enterClass);

  let transitionFinished = false;
  const finishTransition = () => {
    if (transitionFinished) return;
    transitionFinished = true;

    if (currentSection) {
      currentSection.classList.remove("active", exitClass);
    }
    targetSection.classList.remove(enterClass);
    targetSection.classList.add("active");

    // Clean all other sections to guarantee pristine final state
    allSection.forEach((sec) => {
      if (sec !== targetSection) {
        sec.classList.remove(
          "active",
          "section-exit-forward",
          "section-exit-backward",
          "section-enter-forward",
          "section-enter-backward",
          "back-section"
        );
      }
    });

    isTransitioning = false;
  };

  const handleAnimationEnd = (e) => {
    if (e.target === targetSection) {
      targetSection.removeEventListener("animationend", handleAnimationEnd);
      finishTransition();
    }
  };

  targetSection.addEventListener("animationend", handleAnimationEnd);
  // Safety timeout fallback (460ms animation + 60ms buffer)
  setTimeout(finishTransition, 520);
}

// Direct section display for initial load or deep-link without transition
function showSectionDirect(targetId) {
  const targetSection = document.getElementById(targetId);
  if (!targetSection) return;

  if (typeof resetAllHoverTrackers === "function") {
    resetAllHoverTrackers();
  }

  allSection.forEach((sec) => {
    sec.classList.remove(
      "active",
      "section-exit-forward",
      "section-exit-backward",
      "section-enter-forward",
      "section-enter-backward",
      "back-section"
    );
  });

  targetSection.classList.add("active");
  targetSection.scrollTop = 0;

  for (let i = 0; i < totalNavList; i++) {
    const link = navList[i].querySelector("a");
    if (link) {
      const linkTarget = link.getAttribute("href").replace("#", "");
      if (linkTarget === targetId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    }
  }

  syncSectionProgress(targetId);
}

// Backward compatibility helpers
function showSection(element) {
  if (!element) return;
  const target = (typeof element === "string") ? element : element.getAttribute("href").split("#")[1];
  navigateToSection(target);
}

function removeBackSection() {
  allSection.forEach((sec) => sec.classList.remove("back-section"));
}

function addBackSection(num) {
  if (allSection[num]) allSection[num].classList.add("back-section");
}

function updateNav(element) {
  if (!element) return;
  const target = (typeof element === "string") ? element : element.getAttribute("href").split("#")[1];
  for (let i = 0; i < totalNavList; i++) {
    const link = navList[i].querySelector("a");
    if (link) {
      const linkTarget = link.getAttribute("href").replace("#", "");
      if (linkTarget === target) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    }
  }
}

// Attach click listeners to sidebar navigation items
for (let i = 0; i < totalNavList; i++) {
  const a = navList[i].querySelector("a");
  if (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      const target = this.getAttribute("href").split("#")[1];
      navigateToSection(target);
    });
  }
}

  function syncSectionProgress(sectionName) {
    if (!sectionName || !sectionIndexMap[sectionName]) {
      const activeEl = document.querySelector(".section.active");
      sectionName = activeEl ? activeEl.id : "home";
    }

    const currentNum = sectionIndexMap[sectionName] || 1;
    const totalSections = 5;
    const formatted = currentNum < 10 ? `0${currentNum}` : `${currentNum}`;
    const fillPercent = (currentNum / totalSections) * 100;

    const allCounts = document.querySelectorAll(".current-count");
    const allBars = document.querySelectorAll(".progress-bar-fill");

    allCounts.forEach((countEl) => {
      if (countEl.textContent !== formatted) {
        countEl.style.opacity = "0";
        countEl.style.transform = "translateY(-3px)";
        setTimeout(() => {
          countEl.textContent = formatted;
          countEl.style.opacity = "1";
          countEl.style.transform = "translateY(0)";
        }, 140);
      } else {
        countEl.textContent = formatted;
        countEl.style.opacity = "1";
        countEl.style.transform = "translateY(0)";
      }
    });

    allBars.forEach((barEl) => {
      barEl.style.width = `${fillPercent}%`;
    });
  }

  window.syncSectionProgress = syncSectionProgress;

  // Accurately initialize progress based on the visible active section
  function initProgressIndicator() {
    const hash = window.location.hash.replace("#", "");
    // If a specific section was linked in the URL hash, navigate to it directly without animation
    if (hash && sectionIndexMap[hash] && hash !== "home") {
      showSectionDirect(hash);
      return;
    }

    // Default to the section that has .active in the DOM (Home on initial load)
    const activeEl = document.querySelector(".section.active");
    const currentActiveId = activeEl ? activeEl.id : "home";
    syncSectionProgress(currentActiveId);
    
    // Clear stale hash if Home is the active section on screen
    if (history.replaceState && currentActiveId === "home" && window.location.hash) {
      history.replaceState(null, null, window.location.pathname + window.location.search);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProgressIndicator);
  } else {
    initProgressIndicator();
  }

  // Observe class mutations on all sections so progress indicator NEVER desyncs
  allSection.forEach((sec) => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class" && sec.classList.contains("active")) {
          syncSectionProgress(sec.id);
        }
      });
    });
    observer.observe(sec, { attributes: true });
  });

  // Hide Theme Controls on Scroll Down, Reappear on Return to Top
  const themeControls = document.querySelector(".theme-controls");
  const accentWrapper = document.querySelector(".accent-picker-wrapper");
  const accentPickerBtn = document.getElementById("accentPickerBtn");

  function handleSectionScroll(e) {
    const target = e.target;
    let scrollTop = 0;
    if (target && target.scrollTop !== undefined) {
      scrollTop = target.scrollTop;
    } else {
      scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
    }

    if (scrollTop > 30) {
      if (themeControls && !themeControls.classList.contains("hidden-on-scroll")) {
        themeControls.classList.add("hidden-on-scroll");
        if (accentWrapper && accentWrapper.classList.contains("open")) {
          accentWrapper.classList.remove("open");
          if (accentPickerBtn) accentPickerBtn.setAttribute("aria-expanded", "false");
        }
      }
    } else {
      if (themeControls && themeControls.classList.contains("hidden-on-scroll")) {
        themeControls.classList.remove("hidden-on-scroll");
      }
    }
  }

  allSection.forEach((sec) => {
    sec.addEventListener("scroll", handleSectionScroll, { passive: true });
  });
  window.addEventListener("scroll", handleSectionScroll, { passive: true, capture: true });

  // Sync on browser back/forward hashchange
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.replace("#", "") || "home";
    if (hash && sectionIndexMap[hash]) {
      navigateToSection(hash);
    }
  });

  const moreAboutBtn = document.querySelector(".btn[href='#about']");
  if (moreAboutBtn) {
    moreAboutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      navigateToSection("about");
    });
  }

  const hireMeBtn = document.querySelector(".hire-me");
  if (hireMeBtn) {
    hireMeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      navigateToSection("contact");
    });
  }

  if (navTogglerBtn) {
    navTogglerBtn.addEventListener("click", () => {
      asideSectionToggleBtn();
    });
  }

  function asideSectionToggleBtn() {
  aside.classList.toggle("open");
  navTogglerBtn.classList.toggle("open");
  for(let i=0; i<totalSection; i++ )
  {
    allSection[i].classList.toggle("open");
  }
  }

  // Close aside when clicking outside of it on mobile/tablet view
  document.addEventListener("click", (e) => {
    if (window.innerWidth < 1200 && aside.classList.contains("open")) {
      if (!aside.contains(e.target) && !navTogglerBtn.contains(e.target)) {
        asideSectionToggleBtn();
      }
    }
  });

(function () {
  if (typeof emailjs === "undefined") {
    console.warn("EmailJS is not loaded.");
    return;
  }
  emailjs.init("1r-mX1fIHAfMNNmWi");
  const form = document.getElementById("contact-form");
  const sendBtn = document.getElementById("sendBtn");

  if (!form || !sendBtn) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // validation check
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Validate custom subject dropdown
    const subjectInput = document.getElementById("userSubject");
    if (subjectInput && !subjectInput.value) {
      const selectContainer = document.getElementById("subjectSelect");
      if (selectContainer) {
        selectContainer.classList.add("open");
        selectContainer.querySelector(".custom-select-trigger").focus();
      }
      return;
    }

    // Disable button + show loading
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending...</span>';

    emailjs.sendForm(
      "service_7dzp7p5",
      "template_ffuv9pj",
      form
    )
    .then(() => {
      sendBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Message Sent ✅</span>';
      form.reset();

      // Also reset the custom subject dropdown UI
      const csVal = document.querySelector(".custom-select-value");
      const csOpts = document.querySelectorAll(".custom-option");
      const csHidden = document.getElementById("userSubject");
      const csOtherWrap = document.getElementById("otherSubjectWrap");
      const csOtherInput = document.getElementById("otherSubjectInput");
      if (csVal) { csVal.textContent = "Select a subject"; csVal.setAttribute("data-placeholder", "true"); }
      csOpts.forEach(function(o) { o.classList.remove("selected"); });
      if (csHidden) csHidden.value = "";
      if (csOtherWrap) csOtherWrap.style.display = "none";
      if (csOtherInput) csOtherInput.value = "";

      // enable again after 3 sec
      setTimeout(() => {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> <span>Send Message</span> <i class="fa-solid fa-arrow-right btn-arrow"></i>';
      }, 3000);
    })
    .catch((error) => {
      console.error(error);

      sendBtn.disabled = false;
      sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> <span>Send Message</span> <i class="fa-solid fa-arrow-right btn-arrow"></i>';

      alert("❌ Failed to send message");
    });

  });

})();


/* ==========================================
   Custom Subject Select Dropdown Logic
   ========================================== */
(function () {
  const container = document.getElementById("subjectSelect");
  const hiddenInput = document.getElementById("userSubject");
  const valueDisplay = container ? container.querySelector(".custom-select-value") : null;
  const options = container ? container.querySelectorAll(".custom-option") : [];
  const trigger = container ? container.querySelector(".custom-select-trigger") : null;
  const otherWrap = document.getElementById("otherSubjectWrap");
  const otherInput = document.getElementById("otherSubjectInput");

  if (!container || !hiddenInput || !valueDisplay || !trigger) return;

  // Toggle dropdown open/close
  trigger.addEventListener("click", function () {
    container.classList.toggle("open");
  });

  // Keyboard support for trigger
  trigger.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      container.classList.toggle("open");
    }
    if (e.key === "Escape") {
      container.classList.remove("open");
    }
  });

  // Option click handler
  options.forEach(function (opt) {
    opt.addEventListener("click", function () {
      const val = opt.getAttribute("data-value");

      // Remove previous selected
      options.forEach(function (o) { o.classList.remove("selected"); });
      opt.classList.add("selected");

      // Update display text
      valueDisplay.textContent = val;
      valueDisplay.removeAttribute("data-placeholder");

      // Set hidden input value
      hiddenInput.value = val;

      // Close dropdown
      container.classList.remove("open");

      // Show/hide other input
      if (val === "Other") {
        otherWrap.style.display = "block";
        otherInput.focus();
      } else {
        otherWrap.style.display = "none";
        otherInput.value = "";
      }
    });
  });

  // Sync other input to hidden field
  if (otherInput) {
    otherInput.addEventListener("input", function () {
      if (hiddenInput.value === "Other" || otherWrap.style.display !== "none") {
        hiddenInput.value = otherInput.value || "Other";
      }
    });
  }

  // Close on outside click
  document.addEventListener("click", function (e) {
    if (!container.contains(e.target)) {
      container.classList.remove("open");
    }
  });

  // Reset handler — when form resets, also reset custom select
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("reset", function () {
      valueDisplay.textContent = "Select a subject";
      valueDisplay.setAttribute("data-placeholder", "true");
      options.forEach(function (o) { o.classList.remove("selected"); });
      hiddenInput.value = "";
      otherWrap.style.display = "none";
      otherInput.value = "";
    });
  }
})();

/* ==========================================================================
   Smooth Cursor-Move Hover Interaction Engine (Portfolio & Services)
   ========================================================================== */
const hoverTrackers = [];

function resetAllHoverTrackers() {
  hoverTrackers.forEach((tracker) => {
    if (tracker && typeof tracker.reset === "function") {
      tracker.reset();
    }
  });
}

function initSmoothHoverTracker({
  container,
  itemSelector,
  innerSelector,
  indicatorClass,
  elevateOnHover = false,
  elevationPx = 4
}) {
  if (!container) return null;

  const items = Array.from(container.querySelectorAll(itemSelector));
  if (items.length === 0) return null;

  // Touch device guard: only activate smooth cursor tracking for devices with a fine pointer (mouse/trackpad)
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!isFinePointer) return null;

  // Ensure container establishes a positioning context
  const compPos = window.getComputedStyle(container).position;
  if (compPos === "static") {
    container.style.position = "relative";
  }

  // Create or reuse indicator element
  let indicator = container.querySelector(`.${indicatorClass}`);
  if (!indicator) {
    indicator = document.createElement("div");
    indicator.className = `smooth-hover-indicator ${indicatorClass}`;
    indicator.setAttribute("aria-hidden", "true");
    container.appendChild(indicator);
  }

  let activeItem = null;
  let isInside = false;
  let leaveTimeout = null;
  let rafId = null;

  function getCardBounds(item) {
    const cardInner = item.querySelector(innerSelector);
    if (!cardInner) return null;

    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    const compItem = window.getComputedStyle(item);
    const padLeft = parseFloat(compItem.paddingLeft) || 0;
    const padTop = parseFloat(compItem.paddingTop) || 0;

    const x = (itemRect.left - containerRect.left) + padLeft;
    const y = (itemRect.top - containerRect.top) + padTop + (elevateOnHover ? -elevationPx : 0);
    const width = cardInner.offsetWidth;
    const height = cardInner.offsetHeight;

    return { x, y, width, height };
  }

  function updateIndicator(item, immediate = false) {
    const bounds = getCardBounds(item);
    if (!bounds) return;

    if (immediate) {
      indicator.style.transition = "none";
      indicator.style.transform = `translate3d(${bounds.x}px, ${bounds.y}px, 0)`;
      indicator.style.width = `${bounds.width}px`;
      indicator.style.height = `${bounds.height}px`;
      // Force synchronous reflow so subsequent transition changes animate smoothly
      void indicator.offsetWidth;
      indicator.style.transition = "";
    } else {
      indicator.style.transform = `translate3d(${bounds.x}px, ${bounds.y}px, 0)`;
      indicator.style.width = `${bounds.width}px`;
      indicator.style.height = `${bounds.height}px`;
    }
  }

  function activate(item) {
    if (!item) return;
    if (leaveTimeout) {
      clearTimeout(leaveTimeout);
      leaveTimeout = null;
    }

    const isNewEntry = !isInside;
    isInside = true;

    // Remove active class from previous item if switching
    if (activeItem && activeItem !== item) {
      const prevInner = activeItem.querySelector(innerSelector);
      if (prevInner) prevInner.classList.remove("hover-active");
    }

    activeItem = item;
    const inner = item.querySelector(innerSelector);
    if (inner) inner.classList.add("hover-active");

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      updateIndicator(item, isNewEntry);
      indicator.style.opacity = "1";
    });
  }

  function deactivate() {
    isInside = false;
    indicator.style.opacity = "0";
    if (activeItem) {
      const inner = activeItem.querySelector(innerSelector);
      if (inner) inner.classList.remove("hover-active");
      activeItem = null;
    }
  }

  // Attach listeners to items
  items.forEach((item) => {
    item.addEventListener("pointerenter", () => {
      activate(item);
    });

    item.addEventListener("pointerleave", () => {
      if (leaveTimeout) clearTimeout(leaveTimeout);
      // Short grace period while moving across item margins/gutters
      leaveTimeout = setTimeout(() => {
        deactivate();
      }, 80);
    });
  });

  // Container-level pointerleave for immediate deactivation when truly exiting the grid
  container.addEventListener("pointerleave", () => {
    if (leaveTimeout) clearTimeout(leaveTimeout);
    deactivate();
  });

  // Clean-up on window blur / mouse leave
  document.addEventListener("mouseleave", () => {
    if (leaveTimeout) clearTimeout(leaveTimeout);
    deactivate();
  });

  // Reposition immediately on window resize without lag
  window.addEventListener("resize", () => {
    if (isInside && activeItem) {
      updateIndicator(activeItem, true);
    }
  });

  const trackerInstance = {
    reset: deactivate,
    recalculate: () => {
      if (isInside && activeItem) {
        updateIndicator(activeItem, true);
      }
    }
  };

  hoverTrackers.push(trackerInstance);
  return trackerInstance;
}

function setupSectionHoverTrackers() {
  // 1. Services Section
  const serviceSection = document.getElementById("services");
  if (serviceSection) {
    const firstServiceItem = serviceSection.querySelector(".service-item");
    const serviceRow = firstServiceItem ? firstServiceItem.closest(".row") : null;
    if (serviceRow) {
      initSmoothHoverTracker({
        container: serviceRow,
        itemSelector: ".service-item",
        innerSelector: ".service-item-inner",
        indicatorClass: "service-hover-indicator",
        elevateOnHover: false
      });
    }
  }

  // 2. Portfolio Section
  const portfolioSection = document.getElementById("portfolio");
  if (portfolioSection) {
    const firstPortfolioItem = portfolioSection.querySelector(".portfolio-item");
    const portfolioRow = firstPortfolioItem ? firstPortfolioItem.closest(".row") : null;
    if (portfolioRow) {
      initSmoothHoverTracker({
        container: portfolioRow,
        itemSelector: ".portfolio-item",
        innerSelector: ".portfolio-item-inner",
        indicatorClass: "portfolio-hover-indicator",
        elevateOnHover: true,
        elevationPx: 4
      });
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupSectionHoverTrackers);
} else {
  setupSectionHoverTrackers();
}


