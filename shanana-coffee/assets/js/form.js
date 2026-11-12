/* ==========================================================================
   SHANANA COFFEE — Wholesale inquiry form
   Client-side validation + submission to the provider set in config.js.
   If no provider is configured the form says so plainly and sends nothing.
   (Server-side validation is still required by whichever service receives
   the data — client checks are for usability only.)
   ========================================================================== */
(function () {
  "use strict";
  var CONFIG = window.SHANANA_CONFIG || {};
  var FORM_CFG = CONFIG.form || {};
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_RE = /^[+()\-.\s\d]{7,24}$/;

  var ICON_INFO = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor"/><path d="M10 9v5M10 6v.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  var ICON_OK = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor"/><path d="M6 10.5l2.6 2.5L14 7.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';

  function providerReady() {
    var p = FORM_CFG.provider;
    if (p === "netlify") return true;
    if ((p === "formspree" || p === "custom") && /^https:\/\//.test(FORM_CFG.endpoint || "")) return true;
    return false;
  }

  function init() {
    var form = document.getElementById("wholesale-form");
    if (!form) return;
    var status = form.querySelector(".form-status");
    var submit = form.querySelector('[type="submit"]');
    var banner = document.querySelector("[data-form-banner]");

    if (banner) banner.hidden = providerReady();

    // Pre-select a size passed from the collection / showroom (?size=1lb)
    var size = new URLSearchParams(location.search).get("size");
    if (size) {
      var box = form.querySelector('input[name="productSizes"][value="' + CSS.escape(size) + '"]');
      if (box) box.checked = true;
    }

    // U.S. state is required only for U.S. buyers
    var country = form.elements.country, state = form.elements.state;
    function syncState() {
      var us = /^(united states|usa|us|u\.s\.a?\.?)$/i.test((country.value || "").trim());
      state.required = us;
      var star = form.querySelector('[data-state-req]');
      if (star) star.hidden = !us;
    }
    country.addEventListener("input", syncState); syncState();

    // live re-validation once a field has been touched
    form.addEventListener("blur", function (e) { if (e.target.name) validateField(form, e.target.name); }, true);
    form.addEventListener("change", function (e) {
      if (e.target.name && e.target.closest(".field.has-error")) validateField(form, e.target.name);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      setStatus(status, "", "");
      var firstBad = validateAll(form);
      if (firstBad) {
        setStatus(status, "error", "Please review the highlighted fields.");
        firstBad.focus();
        return;
      }
      if (form.elements.company_website && form.elements.company_website.value) return; // honeypot: silently drop

      if (!providerReady()) {
        var email = (CONFIG.contact || {}).wholesaleEmail;
        setStatus(status, "error",
          "Online submission is not yet connected, so your inquiry has <strong>not</strong> been sent." +
          (email ? ' Please email <a href="mailto:' + email + '?subject=Wholesale%20inquiry">' + email + "</a> directly." : " Please check back soon."));
        return;
      }

      submit.disabled = true;
      var label = submit.querySelector("span");
      var orig = label.textContent;
      label.textContent = "Sending…";
      send(form).then(function () {
        form.reset(); syncState();
        setStatus(status, "success",
          "Thank you — your inquiry has been received. A member of the Shanana Coffee team will follow up by email.");
        status.focus();
      }).catch(function () {
        setStatus(status, "error", "We couldn’t send your inquiry just now. Please check your connection and try again.");
      }).then(function () { submit.disabled = false; label.textContent = orig; });
    });
  }

  function collect(form) {
    var fd = new FormData(form);
    var data = {};
    fd.forEach(function (v, k) {
      if (k === "company_website") return;
      if (data[k] !== undefined) data[k] = [].concat(data[k], v); else data[k] = v;
    });
    data.productSizes = [].concat(data.productSizes || []).join(", ");
    data._subject = "Wholesale inquiry — " + (data.company || "");
    return data;
  }

  function send(form) {
    var ctrl = "AbortController" in window ? new AbortController() : null;
    var timer = ctrl && setTimeout(function () { ctrl.abort(); }, 15000);
    var req;
    if (FORM_CFG.provider === "netlify") {
      var fd = new FormData(form);
      req = fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(fd).toString(),
        signal: ctrl && ctrl.signal
      });
    } else {
      req = fetch(FORM_CFG.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(collect(form)),
        signal: ctrl && ctrl.signal
      });
    }
    return req.then(function (res) {
      if (timer) clearTimeout(timer);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res;
    });
  }

  /* ---- validation ------------------------------------------------------ */
  var RULES = {
    contactName: function (v) { return v.trim().length >= 2 || "Please enter your full name."; },
    company: function (v) { return v.trim().length >= 2 || "Please enter your company name."; },
    email: function (v) { return EMAIL_RE.test(v.trim()) || "Please enter a valid business email address."; },
    phone: function (v) { return !v.trim() || PHONE_RE.test(v.trim()) || "Please enter a valid phone number, including country code."; },
    country: function (v) { return v.trim().length >= 2 || "Please enter your country."; },
    state: function (v, form) { return !form.elements.state.required || v.trim().length >= 2 || "Please enter your state."; },
    category: function (v) { return !!v || "Please choose a business category."; },
    productSizes: function (_, form) { return !!form.querySelector('input[name="productSizes"]:checked') || "Please choose at least one size."; },
    volume: function (v) { return !!v || "Please choose an estimated monthly volume."; },
    sample: function (_, form) { return !!form.querySelector('input[name="sample"]:checked') || "Please let us know whether you’d like samples."; },
    partnership: function (v) { return !!v || "Please choose a partnership type."; },
    comments: function (v) { return v.length <= 2000 || "Please keep comments under 2,000 characters."; },
    consent: function (_, form) { return form.elements.consent.checked || "Please confirm you have read the privacy notice."; }
  };

  function fieldValue(form, name) {
    var el = form.elements[name];
    if (!el) return "";
    if (el instanceof RadioNodeList || (el.length && !el.tagName)) return "";
    return el.type === "checkbox" ? (el.checked ? el.value : "") : el.value;
  }

  function validateField(form, name) {
    var rule = RULES[name];
    if (!rule) return true;
    var res = rule(fieldValue(form, name), form);
    var errEl = document.getElementById("err-" + name);
    var field = errEl && errEl.closest(".field");
    var inputs = form.querySelectorAll('[name="' + name + '"]');
    var ok = res === true;
    if (field) field.classList.toggle("has-error", !ok);
    if (errEl) errEl.textContent = ok ? "" : res;
    inputs.forEach(function (i) { i.setAttribute("aria-invalid", String(!ok)); });
    return ok;
  }

  function validateAll(form) {
    var first = null;
    Object.keys(RULES).forEach(function (name) {
      if (!validateField(form, name) && !first) first = form.querySelector('[name="' + name + '"]');
    });
    return first;
  }

  function setStatus(el, kind, html) {
    if (!el) return;
    if (!kind) { el.innerHTML = ""; return; }
    el.innerHTML = '<div class="notice notice--' + kind + '" role="' + (kind === "error" ? "alert" : "status") + '">' +
      (kind === "success" ? ICON_OK : ICON_INFO) + "<p>" + html + "</p></div>";
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
