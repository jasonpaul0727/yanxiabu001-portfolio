(() => {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(pointer: fine)");
  const langToggle = document.getElementById("langToggle");
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("primaryNav");
  const stage = document.querySelector(".portrait-stage");
  const avatarButtons = [...document.querySelectorAll("[data-avatar]")];
  const portraits = [...document.querySelectorAll(".portrait")];
  const stored = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const remember = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  const themeToggle = document.getElementById("themeToggle");
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#161b24" : "#0075f6";
    remember("portfolio-theme", theme);
  }
  setTheme(stored("portfolio-theme") === "dark" ? "dark" : "light");
  themeToggle.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

  function setLanguage(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-en], [data-zh]").forEach(node => {
      if (node.dataset[lang]) node.textContent = node.dataset[lang];
    });
    document.querySelectorAll("[data-en-html], [data-zh-html]").forEach(node => {
      if (node.dataset[lang + "Html"]) node.innerHTML = node.dataset[lang + "Html"];
    });
    document.querySelectorAll("[data-en-label], [data-zh-label]").forEach(node => {
      node.setAttribute("aria-label", node.dataset[lang + "Label"]);
    });
    portraits.forEach(node => { node.alt = node.dataset[lang + "Alt"]; });
    langToggle.textContent = lang === "en" ? "中文" : "EN";
    langToggle.setAttribute("aria-label", lang === "en" ? "Switch to Chinese" : "切换到英文");
    remember("portfolio-language", lang);
  }
  langToggle.addEventListener("click", () => setLanguage(document.documentElement.lang === "en" ? "zh" : "en"));
  setLanguage(stored("portfolio-language") === "zh" ? "zh" : "en");

  function setAvatar(mode) {
    avatarButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.avatar === mode)));
    portraits.forEach(portrait => {
      const active = portrait.dataset.mode === mode;
      portrait.classList.toggle("is-active", active);
      portrait.setAttribute("aria-hidden", String(!active));
    });
    remember("portfolio-avatar", mode);
  }
  avatarButtons.forEach(button => button.addEventListener("click", () => setAvatar(button.dataset.avatar)));
  setAvatar(stored("portfolio-avatar") === "anime" ? "anime" : "real");

  function closeMenu() {
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    nav.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", event => { if (event.target.closest("a")) closeMenu(); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) { closeMenu(); menuToggle.focus(); }
  });

  const revealNodes = document.querySelectorAll(".section-head, .education-item, .experience, .project, .skill-group, .interest, .video-shell, .contact-box");
  if ("IntersectionObserver" in window && !motion.matches) {
    revealNodes.forEach(node => node.classList.add("reveal"));
    document.documentElement.classList.add("motion-enabled");
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    }), { threshold: .08, rootMargin: "0px 0px -24px 0px" });
    revealNodes.forEach(node => observer.observe(node));
    motion.addEventListener("change", () => {
      if (motion.matches) { document.documentElement.classList.remove("motion-enabled"); observer.disconnect(); }
    });
  }

  const progress = document.querySelector(".reading-progress");
  const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
  let scrollPending = false;
  function updateScroll() {
    document.querySelector(".back-top").classList.toggle("is-visible", scrollY > innerHeight * .6);
    const range = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = "scaleX(" + (range > 0 ? Math.min(1, scrollY / range) : 0) + ")";
    let active = "";
    navLinks.forEach(link => {
      const section = document.querySelector(link.getAttribute("href"));
      if (section && section.getBoundingClientRect().top < innerHeight * .45) active = link.getAttribute("href");
    });
    navLinks.forEach(link => {
      const current = link.getAttribute("href") === active;
      link.classList.toggle("active", current);
      if (current) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current");
    });
    scrollPending = false;
  }
  addEventListener("scroll", () => {
    if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  addEventListener("resize", updateScroll);
  updateScroll();

  document.querySelectorAll(".btn").forEach(button => button.addEventListener("click", event => {
    if (motion.matches || event.detail === 0) return;
    const bounds = button.getBoundingClientRect();
    const wave = document.createElement("span");
    wave.className = "click-wave";
    wave.setAttribute("aria-hidden", "true");
    wave.style.left = (event.clientX - bounds.left - 6) + "px";
    wave.style.top = (event.clientY - bounds.top - 6) + "px";
    button.append(wave);
    wave.addEventListener("animationend", () => wave.remove(), { once: true });
  }));

  const canvas = document.getElementById("flowField");
  const context = canvas.getContext("2d");
  let width = 0, height = 0, frameId = 0, inView = true, lastFrame = 0;
  const pointer = { x: .5, y: .5 };
  function sizeCanvas() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width; height = bounds.height;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw(0);
  }
  function draw(time) {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    for (let i = 0; i < 14; i++) {
      const offset = i / 13;
      const startY = height * (.15 + offset * .64);
      const bend = (pointer.y - .5) * 40;
      context.beginPath();
      context.moveTo(-10, startY);
      context.bezierCurveTo(width * .22, startY - 85 + bend, width * .62, startY + 130 - bend, width + 10, startY - 75);
      context.strokeStyle = "rgba(0,117,246," + (.06 + offset * .035) + ")";
      context.lineWidth = .8; context.stroke();
      if (!motion.matches) {
        const t = ((time * .000065 + i * .077) % 1);
        const u = 1 - t;
        const x = u*u*u*(-10) + 3*u*u*t*(width*.22) + 3*u*t*t*(width*.62) + t*t*t*(width+10);
        const y = u*u*u*startY + 3*u*u*t*(startY-85+bend) + 3*u*t*t*(startY+130-bend) + t*t*t*(startY-75);
        context.fillStyle = "rgba(0,117,246," + (.3 + offset * .2) + ")";
        context.fillRect(x, y, 8, 1);
      }
    }
  }
  function animate(time) {
    if (time - lastFrame > 30) { draw(time); lastFrame = time; }
    frameId = requestAnimationFrame(animate);
  }
  function syncAnimation() {
    cancelAnimationFrame(frameId);
    if (!motion.matches && !document.hidden && inView && context) frameId = requestAnimationFrame(animate);
    else draw(0);
  }
  if ("ResizeObserver" in window) new ResizeObserver(sizeCanvas).observe(stage); else addEventListener("resize", sizeCanvas);
  if ("IntersectionObserver" in window) new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting; syncAnimation();
  }).observe(stage);
  document.addEventListener("visibilitychange", syncAnimation);
  motion.addEventListener("change", syncAnimation);
  stage.addEventListener("pointermove", event => {
    if (motion.matches || !finePointer.matches) return;
    const bounds = stage.getBoundingClientRect();
    pointer.x = (event.clientX - bounds.left) / bounds.width;
    pointer.y = (event.clientY - bounds.top) / bounds.height;
    stage.style.setProperty("--mx", ((pointer.x - .5) * 10) + "px");
    stage.style.setProperty("--my", ((pointer.y - .5) * 6) + "px");
  });
  stage.addEventListener("pointerleave", () => {
    pointer.x = pointer.y = .5; stage.style.setProperty("--mx", "0px"); stage.style.setProperty("--my", "0px");
  });
  sizeCanvas(); syncAnimation();

  fetch("./site-content.json").then(response => response.ok ? response.json() : null).then(config => {
    if (!config?.introVideoUrl) return;
    const url = new URL(config.introVideoUrl, location.href);
    if (!["http:", "https:"].includes(url.protocol)) return;
    const video = document.getElementById("introVideo");
    const youtubeHost = ["www.youtube.com", "youtube.com", "youtu.be"].includes(url.hostname);
    const videoId = youtubeHost ? (url.hostname === "youtu.be" ? url.pathname.slice(1) : url.searchParams.get("v") || url.pathname.split("/").pop()) : null;
    if (videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)) {
      const iframe = document.createElement("iframe");
      iframe.className = "intro-embed"; iframe.title = document.documentElement.lang === "zh" ? "Jason 自我介绍视频" : "Jason's introduction video";
      iframe.src = "https://www.youtube-nocookie.com/embed/" + videoId;
      iframe.allow = "fullscreen; picture-in-picture"; iframe.allowFullscreen = true;
      document.querySelector(".video-frame").append(iframe);
    } else {
      video.src = url.href; video.hidden = false;
      video.addEventListener("error", () => { video.hidden = true; document.getElementById("videoPlaceholder").hidden = false; }, { once: true });
    }
    document.getElementById("videoPlaceholder").hidden = true;
  }).catch(() => {});
})();
