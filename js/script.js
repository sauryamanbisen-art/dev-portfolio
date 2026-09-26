// --- HOVER TRACKERS REGISTRY (Hoisted to prevent any TDZ ReferenceErrors) ---
var hoverTrackers = [];

function resetAllHoverTrackers() {
  if (Array.isArray(hoverTrackers)) {
    hoverTrackers.forEach((tracker) => {
      if (tracker && typeof tracker.reset === "function") {
        tracker.reset();
      }
    });
  }
}

// --- PRELOADER LOGIC ---
let preloaderStarted = false;

function startPreloaderTransition() {
  if (preloaderStarted) return;
  preloaderStarted = true;
  if (typeof fallbackTimeout !== 'undefined') clearTimeout(fallbackTimeout);

  const preloader = document.getElementById("preloader");
  const preloaderSkeleton = document.getElementById("preloader-skeleton");

  if (preloader) {
    // Elegant, responsive 180ms breather before fading out
    setTimeout(() => {
      preloader.classList.add("fade-out");
      if (preloaderSkeleton) {
        preloaderSkeleton.classList.add("fade-out");
      }
      setTimeout(() => {
        if (preloader && preloader.parentNode) preloader.remove();
        if (preloaderSkeleton && preloaderSkeleton.parentNode) preloaderSkeleton.remove();
      }, 380);
    }, 180);
  } else if (preloaderSkeleton) {
    preloaderSkeleton.classList.add("fade-out");
    setTimeout(() => {
      if (preloaderSkeleton && preloaderSkeleton.parentNode) preloaderSkeleton.remove();
    }, 380);
  }
}

// Safety fallback: if the page takes more than 1.5 seconds, release the preloader immediately
const fallbackTimeout = setTimeout(() => {
  startPreloaderTransition();
}, 1500);

if (document.readyState === "complete") {
  startPreloaderTransition();
} else {
  window.addEventListener("load", startPreloaderTransition);
}
// --- END PRELOADER LOGIC ---

/* typing animation */
const typingElement = document.querySelector(".typing");
if (typingElement && typeof Typed !== "undefined") {
  var typed = new Typed(".typing", {
    strings: ["Web Designer", "FullStack Developer", "DevOps Engineer", "Tech Learner"],
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

function navigateToSection(targetId, updateHistory = true) {
  if (!targetId) return;

  // Collision guard: ignore rapid clicks while a transition is active
  if (isTransitioning) return;

  const currentSection = document.querySelector(".section.active");
  const targetSection = document.getElementById(targetId);

  // If target does not exist or user clicked current active section, do nothing
  if (!targetSection || currentSection === targetSection) return;

  isTransitioning = true;

  // Cleanly reset any active card hover states and indicators
  resetAllHoverTrackers();

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

  // 4. Update browser URL history
  if (updateHistory && history.pushState) {
    history.pushState({ section: targetId }, "", targetId === "home" ? window.location.pathname + window.location.search : `#${targetId}`);
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
      if (history.replaceState) {
        history.replaceState({ section: hash }, "", `#${hash}`);
      }
      return;
    }

    // Default to the section that has .active in the DOM (Home on initial load)
    const activeEl = document.querySelector(".section.active");
    const currentActiveId = activeEl ? activeEl.id : "home";
    syncSectionProgress(currentActiveId);
    
    // Set initial history state
    if (history.replaceState) {
      history.replaceState({ section: currentActiveId }, "", currentActiveId === "home" ? window.location.pathname + window.location.search : `#${currentActiveId}`);
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

  // Sync on browser back/forward buttons (popstate & hashchange)
  window.addEventListener("popstate", (e) => {
    const targetSection = (e.state && e.state.section) || window.location.hash.replace("#", "") || "home";
    if (targetSection && sectionIndexMap[targetSection]) {
      navigateToSection(targetSection, false);
    }
  });

  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.replace("#", "") || "home";
    if (hash && sectionIndexMap[hash]) {
      const activeEl = document.querySelector(".section.active");
      if (!activeEl || activeEl.id !== hash) {
        navigateToSection(hash, false);
      }
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

/* ==========================================
   Contact Form & Custom Subject Select Logic
   ========================================== */
(function () {
  const form = document.getElementById("contact-form");
  const sendBtn = document.getElementById("sendBtn");
  const container = document.getElementById("subjectSelect");
  const hiddenInput = document.getElementById("userSubject");
  const valueDisplay = container ? container.querySelector(".custom-select-value") : null;
  const options = container ? Array.from(container.querySelectorAll(".custom-option")) : [];
  const trigger = container ? container.querySelector(".custom-select-trigger") : null;
  const otherWrap = document.getElementById("otherSubjectWrap");
  const otherInput = document.getElementById("otherSubjectInput");

  // Initialize EmailJS if library loaded
  if (typeof emailjs !== "undefined") {
    try {
      emailjs.init("1r-mX1fIHAfMNNmWi");
    } catch (e) {
      console.warn("EmailJS initialization warning:", e);
    }
  }

  // Helper to open/close custom select
  function toggleDropdown(open) {
    if (!container || !trigger) return;
    const shouldOpen = typeof open === "boolean" ? open : !container.classList.contains("open");
    container.classList.toggle("open", shouldOpen);
    trigger.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    if (shouldOpen) {
      const selected = container.querySelector(".custom-option.selected") || options[0];
      if (selected) selected.focus();
    }
  }

  function selectOption(opt) {
    if (!opt || !valueDisplay || !hiddenInput) return;
    const val = opt.getAttribute("data-value");

    options.forEach((o) => {
      o.classList.remove("selected");
      o.setAttribute("aria-selected", "false");
    });
    opt.classList.add("selected");
    opt.setAttribute("aria-selected", "true");

    valueDisplay.textContent = val;
    valueDisplay.removeAttribute("data-placeholder");

    hiddenInput.value = val;
    toggleDropdown(false);

    if (val === "Other") {
      if (otherWrap) otherWrap.style.display = "block";
      if (otherInput) {
        otherInput.setAttribute("required", "required");
        otherInput.focus();
      }
    } else {
      if (otherWrap) otherWrap.style.display = "none";
      if (otherInput) {
        otherInput.removeAttribute("required");
        otherInput.value = "";
      }
    }
  }

  if (container && trigger) {
    // Click toggle
    trigger.addEventListener("click", () => {
      toggleDropdown();
    });

    // Keyboard navigation on trigger
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        toggleDropdown(true);
      } else if (e.key === "Escape") {
        toggleDropdown(false);
      }
    });

    // Options keyboard and click handling
    options.forEach((opt, index) => {
      opt.addEventListener("click", () => {
        selectOption(opt);
      });

      opt.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectOption(opt);
          if (trigger) trigger.focus();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          const next = options[(index + 1) % options.length];
          if (next) next.focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const prev = options[(index - 1 + options.length) % options.length];
          if (prev) prev.focus();
        } else if (e.key === "Home") {
          e.preventDefault();
          if (options[0]) options[0].focus();
        } else if (e.key === "End") {
          e.preventDefault();
          if (options[options.length - 1]) options[options.length - 1].focus();
        } else if (e.key === "Escape") {
          e.preventDefault();
          toggleDropdown(false);
          if (trigger) trigger.focus();
        }
      });
    });

    // Sync other input to hidden field
    if (otherInput) {
      otherInput.addEventListener("input", () => {
        if (hiddenInput && (hiddenInput.value === "Other" || (otherWrap && otherWrap.style.display !== "none"))) {
          hiddenInput.value = otherInput.value.trim() || "Other";
        }
      });
    }

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) {
        toggleDropdown(false);
      }
    });
  }

  function resetFormAndCustomSelect() {
    if (form) form.reset();
    if (valueDisplay) {
      valueDisplay.textContent = "Select a subject";
      valueDisplay.setAttribute("data-placeholder", "true");
    }
    options.forEach((o) => {
      o.classList.remove("selected");
      o.setAttribute("aria-selected", "false");
    });
    if (hiddenInput) hiddenInput.value = "";
    if (otherWrap) otherWrap.style.display = "none";
    if (otherInput) {
      otherInput.removeAttribute("required");
      otherInput.value = "";
    }
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }

  // Form submission handling
  if (form && sendBtn) {
    form.addEventListener("reset", resetFormAndCustomSelect);

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Check standard field validity
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Check custom subject dropdown validity
      if (hiddenInput && !hiddenInput.value) {
        toggleDropdown(true);
        if (trigger) trigger.focus();
        return;
      }

      // If 'Other' was selected, ensure user actually typed custom subject
      if (hiddenInput && (hiddenInput.value === "Other" || (otherWrap && otherWrap.style.display !== "none"))) {
        if (!otherInput || !otherInput.value.trim()) {
          if (otherInput) {
            otherInput.focus();
            otherInput.reportValidity();
          }
          return;
        }
        hiddenInput.value = otherInput.value.trim();
      }

      if (typeof emailjs === "undefined") {
        alert("⚠️ Email service is temporarily unavailable. Please email me directly at sauryamanbisen@gmail.com");
        return;
      }

      // Disable button + show loading state
      sendBtn.disabled = true;
      sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending...</span>';

      emailjs.sendForm(
        "service_7dzp7p5",
        "template_ffuv9pj",
        form
      )
      .then(() => {
        sendBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Message Sent ✅</span>';
        resetFormAndCustomSelect();

        // Restore send button after 3 seconds
        setTimeout(() => {
          sendBtn.disabled = false;
          sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> <span>Send Message</span> <i class="fa-solid fa-arrow-right btn-arrow"></i>';
        }, 3000);
      })
      .catch((error) => {
        console.error("EmailJS send error:", error);

        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> <span>Send Message</span> <i class="fa-solid fa-arrow-right btn-arrow"></i>';

        alert("❌ Failed to send message. Please contact me directly at sauryamanbisen@gmail.com");
      });
    });
  }
})();

/* ==========================================================================
   Smooth Cursor-Move Hover Interaction Engine (Portfolio & Services)
   ========================================================================== */

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


