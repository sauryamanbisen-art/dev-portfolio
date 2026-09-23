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
// Aside
const nav = document.querySelector(".nav"),
  navList = nav.querySelectorAll("li"),
  totalNavList = navList.length,
  allSection = document.querySelectorAll(".section"),
  totalSection = allSection.length;
  for (let i = 0; i<totalNavList; i++) 
  {
  const a = navList[i].querySelector("a")
  a.addEventListener("click", function (e) 
  {
    e.preventDefault();
    removeBackSection();
    for (let j = 0; j < totalNavList; j++)
    {
      if(navList[j].querySelector("a").classList.contains("active"))
      {
        addBackSection(j);
        // allSection[j].classList.add("back-section");
      }
      navList[j].querySelector("a").classList.remove("active");
    }
    this.classList.add("active")
    showSection(this);
    if(window.innerWidth < 1200)
    {
      asideSectionToggleBtn();
    }
  })
  }
  function removeBackSection()
  {
    for (let i = 0; i < totalSection; i++) 
    {
    allSection[i].classList.remove("back-section");
    }
  }
  function addBackSection(num)
  {
    allSection[num].classList.add("back-section");
  }
  function showSection(element) 
  {
    for (let i = 0; i < totalSection; i++) 
    {
      allSection[i].classList.remove("active");
    }
    const target = element.getAttribute("href").split("#")[1];
    const targetSection = document.querySelector("#" + target);
    if (targetSection) {
      targetSection.classList.add("active");
      targetSection.scrollTop = 0;
    }
    const themeControls = document.querySelector(".theme-controls");
    if (themeControls) {
      themeControls.classList.remove("hidden-on-scroll");
    }
    if (history.replaceState) {
      history.replaceState(null, null, target === "home" ? window.location.pathname + window.location.search : `#${target}`);
    }
    syncSectionProgress(target);
  }

  // Section Progress Indicator Synchronization (01/05 - 05/05)
  const sectionIndexMap = {
    "home": 1,
    "about": 2,
    "services": 3,
    "portfolio": 4,
    "contact": 5
  };

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
    // If a specific section was linked in the URL hash, navigate to it
    if (hash && sectionIndexMap[hash] && hash !== "home") {
      const targetLink = document.querySelector(`.nav a[href="#${hash}"]`);
      if (targetLink) {
        for (let j = 0; j < totalNavList; j++) {
          navList[j].querySelector("a").classList.remove("active");
        }
        targetLink.classList.add("active");
        showSection(targetLink);
        return;
      }
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
      const targetLink = document.querySelector(`.nav a[href="#${hash}"]`);
      if (targetLink) {
        targetLink.click();
      } else {
        syncSectionProgress(hash);
      }
    }
  });

  function updateNav(element)
  {
    for(let i=0; i<totalNavList; i++)
    {
      navList[i].querySelector("a").classList.remove("active");
      const target = element.getAttribute("href").split("#")[1];
      if(target === navList[i].querySelector("a").getAttribute("href").split("#")[1])
      {
        navList[i].querySelector("a").classList.add("active");
      }
    }
  }
  document.querySelector(".btn[href='#about']").addEventListener("click", function(e) 
  {
     e.preventDefault();
     removeBackSection(); 
     let currentIndex = 0;
     document.querySelectorAll(".section").forEach((section, index) => {
       if(section.classList.contains("active")) {
         currentIndex = index;
       }
     });
     addBackSection(currentIndex);
     showSection(this);
     updateNav(this);
  });
  document.querySelector(".hire-me").addEventListener("click", function()
  {
    const sectionIndex = this.getAttribute("data-section-index");
    showSection(this);
    updateNav(this);
    removeBackSection();
    addBackSection(sectionIndex);
  })
  const navTogglerBtn = document.querySelector(".nav-toggler");
  aside = document.querySelector(".aside");

  navTogglerBtn.addEventListener("click", () => {
  asideSectionToggleBtn();
  });

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

