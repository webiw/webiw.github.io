(function () {
  function wireMobileNav() {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector("[data-mobile-toggle]");
    if (!header || !toggle) return;

    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && header.classList.contains("is-open")) {
        header.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  function wireLightbox() {
    const triggers = [...document.querySelectorAll("[data-lightbox-src]")];
    if (!triggers.length) return;

    const modal = document.createElement("div");
    modal.className = "lightbox";
    modal.hidden = true;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Visionneuse d’images");
    modal.innerHTML = `
      <div class="lightbox-top">
        <span class="lightbox-counter num" data-lb-counter>1 / 1</span>
        <button type="button" class="lightbox-close" data-lb-close aria-label="Fermer l’image (Échap)">×</button>
      </div>
      <div class="lightbox-stage" data-lb-backdrop>
        <button type="button" class="lightbox-nav lightbox-prev" data-lb-prev aria-label="Image précédente">‹</button>
        <img data-lb-img src="" alt="">
        <button type="button" class="lightbox-nav lightbox-next" data-lb-next aria-label="Image suivante">›</button>
      </div>
      <p class="lightbox-caption" data-lb-caption></p>
    `;
    document.body.appendChild(modal);

    const img = modal.querySelector("[data-lb-img]");
    const caption = modal.querySelector("[data-lb-caption]");
    const counter = modal.querySelector("[data-lb-counter]");
    const prevBtn = modal.querySelector("[data-lb-prev]");
    const nextBtn = modal.querySelector("[data-lb-next]");
    const closeBtn = modal.querySelector("[data-lb-close]");
    let currentIndex = 0;
    let lastTrigger = null;

    function show(index) {
      currentIndex = (index + triggers.length) % triggers.length;
      const item = triggers[currentIndex];
      img.src = item.dataset.lightboxSrc;
      img.alt = item.dataset.lightboxAlt || "";
      caption.textContent = item.dataset.lightboxCaption || item.dataset.lightboxAlt || "";
      counter.textContent = `${currentIndex + 1} / ${triggers.length}`;
      const multi = triggers.length > 1;
      prevBtn.hidden = !multi;
      nextBtn.hidden = !multi;
    }

    function open(index, triggerEl) {
      lastTrigger = triggerEl;
      show(index);
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function close() {
      if (modal.hidden) return;
      modal.hidden = true;
      img.src = "";
      document.body.style.overflow = "";
      if (lastTrigger) lastTrigger.focus();
    }

    triggers.forEach((trigger, index) => {
      trigger.addEventListener("click", event => {
        event.preventDefault();
        open(index, trigger);
      });
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", event => {
      event.stopPropagation();
      show(currentIndex - 1);
    });
    nextBtn.addEventListener("click", event => {
      event.stopPropagation();
      show(currentIndex + 1);
    });

    modal.addEventListener("click", event => {
      if (event.target === modal || event.target.hasAttribute("data-lb-backdrop")) {
        close();
      }
    });

    document.addEventListener("keydown", event => {
      if (modal.hidden) return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") show(currentIndex - 1);
      if (event.key === "ArrowRight") show(currentIndex + 1);
    });
  }

  function wireContactForm() {
    const form = document.querySelector("[data-contact-form]");
    if (!form) return;

    const loadedAt = Date.now();
    const feedback = form.querySelector("[data-form-feedback]");
    const selectSujet = form.querySelector('select[name="sujet"]');
    const textareaMessage = form.querySelector('textarea[name="message"]');

    // Pré-remplissage depuis l’URL (?sujet=spectacle&objet=Nono)
    const params = new URLSearchParams(window.location.search);
    const paramSujet = (params.get("sujet") || "").toLowerCase();
    const paramObjet = params.get("objet") || "";

    if (selectSujet && ["atelier", "spectacle", "presse", "autre"].includes(paramSujet)) {
      selectSujet.value = paramSujet;
    }
    if (textareaMessage && paramObjet && !textareaMessage.value) {
      textareaMessage.value = `Bonjour Nolwenn et Lauren,\n\nJe vous contacte au sujet de « ${paramObjet} ».\n`;
    }

    function buildMailtoHref(data) {
      const subject = `[Site Compagnie O'Détour] ${String(data.sujet || "Contact").toUpperCase()} - ${data.nom || ""}`;
      const body = [
        `Bonjour Nolwenn et Lauren,`,
        ``,
        data.message || "",
        ``,
        `---`,
        `Nom : ${data.nom || ""}`,
        `E-mail : ${data.email || ""}`,
        `Téléphone : ${data.telephone || "Non renseigné"}`,
        `Structure / Commune : ${data.structure || "Non renseignée"}`,
        `Sujet : ${data.sujet || ""}`
      ].join("\n");
      return `mailto:cieodetour@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    form.addEventListener("submit", async event => {
      event.preventDefault();
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      payload.elapsed_ms = Date.now() - loadedAt;
      payload.page_url = window.location.href;

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      if (feedback) {
        feedback.hidden = false;
        feedback.className = "form-feedback";
        feedback.textContent = "Envoi de votre message en cours…";
      }

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok || !result.ok) {
          throw new Error(result.error || "Impossible d’envoyer le formulaire automatiquement.");
        }
        form.reset();
        if (feedback) {
          feedback.className = "form-feedback is-success";
          feedback.textContent = result.message || "Merci ! Votre message a bien été envoyé à la Compagnie O’Détour.";
        }
      } catch {
        const mailto = buildMailtoHref(payload);
        if (feedback) {
          feedback.className = "form-feedback is-error";
          feedback.innerHTML = `
            <p><strong>Votre message est prêt, finalisez l’envoi en un clic :</strong> le serveur de messagerie directe n’a pas répondu, mais aucune information n’est perdue. Cliquez sur le bouton ci-dessous pour ouvrir votre e-mail déjà prérempli à destination de <strong>cieodetour@gmail.com</strong>.</p>
            <a class="btn btn-primary btn-sm mailto-fallback" href="${mailto}">Ouvrir mon e-mail prérempli →</a>
          `;
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  function wireYoutubeFacades() {
    document.querySelectorAll("[data-yt-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.ytId;
        const title = btn.dataset.ytTitle || "Vidéo YouTube";
        if (!id) return;
        const wrap = document.createElement("div");
        wrap.className = "youtube-facade";
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
        iframe.title = title;
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        wrap.appendChild(iframe);
        btn.replaceWith(wrap);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    wireMobileNav();
    wireLightbox();
    wireContactForm();
    wireYoutubeFacades();
  });
})();
