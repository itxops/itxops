/* ITXOPS — site behaviour
   Progressive enhancement: the page is fully readable without this file.
   GSAP + ScrollTrigger drive the scroll animation when both are available and
   the visitor has not asked for reduced motion. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var animate = hasGsap && !reduceMotion;

  // Tell the head-script safety net that we are in control.
  window.__itxAnim = true;
  if (!animate) root.classList.remove('js-anim');

  /* ---------- current year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- header state + scroll progress ---------- */
  var header = document.getElementById('header');
  var bar = document.getElementById('progress-bar');
  var lastY = window.scrollY;
  var ticking = false;

  // Assigned by the animation block below when motion is enabled.
  var revealPending = [];
  var checkReveals = null;

  function onScrollFrame() {
    var y = window.scrollY;

    if (header) {
      header.classList.toggle('is-scrolled', y > 8);
      // Hide on the way down, bring it back on the way up.
      var navOpen = nav && nav.classList.contains('is-open');
      if (!navOpen && y > 260 && y > lastY + 4) header.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 260) header.classList.remove('is-hidden');
    }

    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }

    if (checkReveals) checkReveals();

    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScrollFrame);
    }
  }, { passive: true });

  /* ---------- mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open && header) header.classList.remove('is-hidden');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open')) {
        if (!nav.contains(e.target) && !toggle.contains(e.target)) closeNav();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) closeNav();
    });
  }

  /* ---------- highlight current page and in-page sections ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var path = window.location.pathname.replace(/\/$/, '');
  var currentPage = path.split('/').pop() || 'index.html';
  if (currentPage === '') currentPage = 'index.html';

  function setActive(link) {
    links.forEach(function (item) {
      var active = item === link;
      item.classList.toggle('is-active', active);
      if (active) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
  }

  // Set default active link based on current file/page name
  var matchedPageLink = null;
  links.forEach(function (link) {
    var href = link.getAttribute('href') || '';
    var cleanHref = href.split('#')[0].replace(/\/$/, '').split('/').pop();
    if (!cleanHref && (currentPage === 'index.html' || currentPage === '')) {
      matchedPageLink = link;
    } else if (cleanHref === currentPage) {
      matchedPageLink = link;
    }
  });

  if (matchedPageLink) {
    setActive(matchedPageLink);
  }

  // Only run in-page intersection observer for anchor links on the current page
  var hashSections = [];
  links.forEach(function (link) {
    var href = link.getAttribute('href') || '';
    if (href.startsWith('#') && href.length > 1) {
      try {
        var el = document.querySelector(href);
        if (el && el !== document.body) {
          hashSections.push({ link: link, el: el });
        }
      } catch (e) {
        // Not a selector, ignore
      }
    }
  });

  if ('IntersectionObserver' in window && hashSections.length) {
    var currentEl = null;
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) { if (entry.isIntersecting) currentEl = entry.target; });
        if (window.scrollY < 160 || !currentEl) {
          if (matchedPageLink) setActive(matchedPageLink);
          return;
        }
        var found = hashSections.find(function (item) { return item.el === currentEl; });
        if (found) setActive(found.link);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    hashSections.forEach(function (item) { spy.observe(item.el); });

    window.addEventListener('scroll', function () {
      if (window.scrollY < 160 && matchedPageLink) setActive(matchedPageLink);
    }, { passive: true });
  }

  /* ---------- scroll animation ---------- */
  if (animate) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero: staggered entrance, headline line by line.
    var hero = gsap.timeline({ defaults: { ease: 'power3.out', duration: .85 } });
    hero
      .fromTo('[data-hero="1"]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .6 })
      .fromTo('.hero__title .line',
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, stagger: .12 }, '-=.25')
      .fromTo('[data-hero="3"]', { opacity: 0, y: 18 }, { opacity: 1, y: 0 }, '-=.55')
      .fromTo('[data-hero="4"]', { opacity: 0, y: 18 }, { opacity: 1, y: 0 }, '-=.6')
      .fromTo('[data-hero="5"]',
        { opacity: 0, y: 34, scale: .97 },
        { opacity: 1, y: 0, scale: 1, duration: 1.05 }, '-=.75');

    // gsap.set on the title parent keeps [data-hero="2"] visible while its
    // child lines animate individually.
    gsap.set('[data-hero="2"]', { opacity: 1 });

    // Reveals are driven by plain geometry checked on scroll, not by
    // ScrollTrigger or IntersectionObserver. Both cache or defer state in ways
    // that can strand an element at opacity 0; a rect test cannot. Elements
    // that enter together animate together, so rows stagger naturally.
    revealPending = Array.prototype.slice.call(
      document.querySelectorAll('[data-reveal], [data-reveal-item]'));

    checkReveals = function () {
      if (!revealPending.length) return;

      var limit = window.innerHeight * .92;
      var batch = [];
      var remaining = [];

      revealPending.forEach(function (el) {
        // Anything at or above the fold, including content already scrolled
        // past (an anchor jump can skip straight over a section).
        if (el.getBoundingClientRect().top < limit) batch.push(el);
        else remaining.push(el);
      });

      if (!batch.length) return;
      revealPending = remaining;
      gsap.fromTo(batch,
        { opacity: 0, y: 26 },
        {
          opacity: 1, y: 0, duration: .8, ease: 'power3.out',
          stagger: batch.length > 1 ? .09 : 0
        });
    };

    // Polled on GSAP's ticker rather than only on scroll events: the rect test
    // then runs whenever the page has actually moved, no matter how it moved
    // (wheel, keyboard, anchor jump, scrollTo, or a programmatic scroll that
    // fires no event). The check is skipped while the offset is unchanged and
    // the ticker entry removes itself once everything has been revealed.
    var lastCheckY = -1;

    function tickReveals() {
      if (!revealPending.length) {
        gsap.ticker.remove(tickReveals);
        return;
      }
      var y = window.scrollY;
      if (y === lastCheckY) return;
      lastCheckY = y;
      checkReveals();
    }

    checkReveals();
    gsap.ticker.add(tickReveals);
    window.addEventListener('resize', checkReveals);
    window.addEventListener('load', checkReveals);

    // Failsafe: anything still hidden but on screen a few seconds after load
    // gets shown regardless. Content visibility must never depend on animation.
    window.addEventListener('load', function () {
      setTimeout(function () {
        Array.prototype.forEach.call(
          document.querySelectorAll('[data-reveal], [data-reveal-item], [data-hero]'),
          function (el) {
            if (window.getComputedStyle(el).opacity !== '0') return;
            var r = el.getBoundingClientRect();
            if (r.top < window.innerHeight && r.bottom > 0) {
              gsap.to(el, { opacity: 1, y: 0, duration: .4 });
            }
          });
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      }, 2200);
    });

    // Gentle parallax on the hero diagram.
    var visual = document.querySelector('.hero__visual');
    var diagram = document.getElementById('tilt');
    if (visual && diagram && window.matchMedia('(pointer: fine)').matches) {
      var rx = gsap.quickTo(diagram, 'rotationX', { duration: .6, ease: 'power2.out' });
      var ry = gsap.quickTo(diagram, 'rotationY', { duration: .6, ease: 'power2.out' });

      visual.addEventListener('mousemove', function (e) {
        var r = visual.getBoundingClientRect();
        rx(((e.clientY - r.top) / r.height - .5) * -7);
        ry(((e.clientX - r.left) / r.width - .5) * 9);
      });
      visual.addEventListener('mouseleave', function () { rx(0); ry(0); });
    }
  }

  /* ---------- cursor spotlight on cards & interactive tiles ---------- */
  if (window.matchMedia('(pointer: fine)').matches) {
    var cardSelector = '.service, .service-block, .tier, .val-card, .location-card, .metric-card, .tech__item, .acard, .scard, .cmethod, .steps__item';
    Array.prototype.forEach.call(document.querySelectorAll(cardSelector), function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- URL topic query parameter support ---------- */
  try {
    var params = new URLSearchParams(window.location.search);
    var topicParam = params.get('topic');
    if (topicParam) {
      var topicSelect = document.getElementById('topic');
      if (topicSelect) {
        for (var t = 0; t < topicSelect.options.length; t++) {
          if (topicSelect.options[t].value.toLowerCase() === topicParam.toLowerCase() ||
              topicSelect.options[t].text.toLowerCase().indexOf(topicParam.toLowerCase()) !== -1) {
            topicSelect.selectedIndex = t;
            break;
          }
        }
      }
    }
  } catch (err) {}

  /* ---------- hero network canvas ---------- */
  var canvas = document.getElementById('net');
  if (canvas && canvas.getContext && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var nodes = [];
    var w = 0, h = 0, dpr = 1, raf = null, visible = true;

    function size() {
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.max(18, Math.min(62, Math.round(w / 22)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - .5) * .22,
          vy: (Math.random() - .5) * .22,
          r: Math.random() * 1.6 + 1
        });
      }
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        for (var j = i + 1; j < nodes.length; j++) {
          var m = nodes[j];
          var dx = n.x - m.x, dy = n.y - m.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.strokeStyle = 'rgba(24, 96, 197, ' + (1 - dist / 140) * .3 + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = 'rgba(28, 37, 59, .45)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = window.requestAnimationFrame(frame);
    }

    function start() { if (raf === null) raf = window.requestAnimationFrame(frame); }
    function stop() {
      if (raf !== null) { window.cancelAnimationFrame(raf); raf = null; }
    }

    size();
    start();

    var resizeTimer;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(size, 180);
    });

    // Don't burn cycles when the hero is off-screen or the tab is hidden.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !document.hidden) start(); else stop();
      }, { threshold: 0 }).observe(canvas);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden || !visible) stop(); else start();
    });
  }

  /* ---------- contact form ----------
     The site is static, so the form hands the message to the visitor's mail
     client addressed to info@itxops.com. To switch to a hosted form endpoint
     instead, see README.md. */
  var SUPPORT_EMAIL = 'info@itxops.com';
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');

  if (form) {
    var setStatus = function (message, state) {
      if (!status) return;
      status.innerHTML = message;
      status.className = 'form__status' + (state ? ' is-' + state : '');
    };

    var fieldValue = function (name) {
      var el = form.elements[name];
      return el ? el.value.trim() : '';
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = fieldValue('name');
      var email = fieldValue('email');
      var company = fieldValue('company');
      var urgency = fieldValue('urgency') || 'Standard';
      var topic = fieldValue('topic');
      var message = fieldValue('message');

      // Mark anything missing or malformed.
      var invalid = null;
      ['name', 'email', 'message'].forEach(function (key) {
        var el = form.elements[key];
        if (!el) return;
        var bad = !el.value.trim() || (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
        el.classList.toggle('is-invalid', bad);
        if (bad && !invalid) invalid = el;
      });

      if (invalid) {
        setStatus('Please enter your name, a valid email address, and your message.', 'error');
        invalid.focus();
        return;
      }

      var urgencyPrefix = urgency.indexOf('Urgent') !== -1 ? '[URGENT OUTAGE] ' : '';
      var subject = urgencyPrefix + (topic || 'IT Support Inquiry') + ' — ' + name + (company ? ' (' + company + ')' : '');
      var body = [
        '--- ITXOPS REMOTE IT & OPERATIONS INQUIRY ---',
        'Name: ' + name,
        'Email: ' + email,
        'Company / Project: ' + (company || 'Not specified'),
        'Timeline / Urgency: ' + urgency,
        'Service Area: ' + (topic || 'General Infrastructure'),
        'Preferred Communication: Email (exclusively)',
        '',
        'Project / Problem Details:',
        message,
        '',
        'Sent via itxops.com contact portal'
      ].join('\r\n');

      var mailtoHref =
        'mailto:' + SUPPORT_EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      // Attempt to launch default mail client
      window.location.href = mailtoHref;

      var gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(SUPPORT_EMAIL) +
                     '&su=' + encodeURIComponent(subject) +
                     '&body=' + encodeURIComponent(body);
      var outlookUrl = 'https://outlook.live.com/mail/0/deeplink/compose?to=' + encodeURIComponent(SUPPORT_EMAIL) +
                       '&subject=' + encodeURIComponent(subject) +
                       '&body=' + encodeURIComponent(body);

      var successHtml =
        '<strong>Ready to send!</strong> Your email client should now open. ' +
        'If it did not launch automatically, you can open via: ' +
        '<div class="webmail-bar" style="margin-top:8px;">' +
        '<a class="webmail-link" href="' + gmailUrl + '" target="_blank" rel="noopener noreferrer">Open in Gmail &rarr;</a>' +
        '<a class="webmail-link" href="' + outlookUrl + '" target="_blank" rel="noopener noreferrer">Open in Outlook &rarr;</a>' +
        '<a class="webmail-link" href="mailto:' + SUPPORT_EMAIL + '">Default App &rarr;</a>' +
        '</div>' +
        '<div style="margin-top:8px;font-size:.85rem;color:var(--ink-muted);">' +
        'Or send an email directly to <strong style="color:var(--navy);">' + SUPPORT_EMAIL + '</strong>.</div>';

      setStatus(successHtml, 'success');
    });

    // Clear the error state as soon as the visitor starts fixing a field.
    form.addEventListener('input', function (e) {
      if (e.target.classList) e.target.classList.remove('is-invalid');
    });
  }

  /* ---------- interactive copy email widget ---------- */
  function initCopyEmailWidgets() {
    var copyWidgets = document.querySelectorAll('.js-copy-email');
    copyWidgets.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var email = btn.getAttribute('data-email') || SUPPORT_EMAIL;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(function () {
            btn.classList.add('is-copied');
            setTimeout(function () { btn.classList.remove('is-copied'); }, 2500);
          }).catch(function () {
            fallbackCopy(email, btn);
          });
        } else {
          fallbackCopy(email, btn);
        }
      });
    });

    function fallbackCopy(text, btn) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        btn.classList.add('is-copied');
        setTimeout(function () { btn.classList.remove('is-copied'); }, 2500);
      } catch (err) {}
      document.body.removeChild(textarea);
    }
  }

  /* ---------- interactive copy code blocks ---------- */
  function initCopyCodeBlocks() {
    var copyButtons = document.querySelectorAll('.js-code-copy');
    copyButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var codeBlock = btn.closest('.code-box');
        if (!codeBlock) return;
        var codeEl = codeBlock.querySelector('code');
        if (!codeEl) return;
        var codeText = codeEl.innerText.replace(/^\$ /gm, '');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(codeText).then(function () {
            handleCopied(btn);
          }).catch(function () {
            fallbackCodeCopy(codeText, btn);
          });
        } else {
          fallbackCodeCopy(codeText, btn);
        }
      });
    });

    function handleCopied(btn) {
      var origText = btn.innerHTML;
      btn.classList.add('is-copied');
      btn.innerHTML = '<svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13" style="display:inline-block;vertical-align:-2px;"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> Copied!';
      setTimeout(function () {
        btn.classList.remove('is-copied');
        btn.innerHTML = origText;
      }, 2200);
    }

    function fallbackCodeCopy(text, btn) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        handleCopied(btn);
      } catch (err) {}
      document.body.removeChild(textarea);
    }
  }

  /* ---------- real-time blog search & category filter ---------- */
  function initBlogFilter() {
    var filterPills = document.querySelectorAll('.js-blog-filter');
    var searchInput = document.querySelector('.js-blog-search');
    var cards = document.querySelectorAll('.js-blog-card');
    if (!cards.length) return;

    var activeCategory = 'all';
    var searchQuery = '';

    function applyFilter() {
      var visibleCount = 0;
      cards.forEach(function (card) {
        var cardCat = (card.getAttribute('data-category') || '').toLowerCase();
        var cardText = (card.innerText || '').toLowerCase();

        var matchesCategory = (activeCategory === 'all' || cardCat === activeCategory);
        var matchesSearch = (!searchQuery || cardText.indexOf(searchQuery) !== -1);

        if (matchesCategory && matchesSearch) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      var emptyNotice = document.getElementById('blog-empty-state');
      if (emptyNotice) {
        emptyNotice.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    }

    filterPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        filterPills.forEach(function (p) { p.classList.remove('is-active'); });
        pill.classList.add('is-active');
        activeCategory = (pill.getAttribute('data-filter') || 'all').toLowerCase();
        applyFilter();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        searchQuery = searchInput.value.trim().toLowerCase();
        applyFilter();
      });
    }
  }

  function initInteractiveFeatures() {
    initCopyEmailWidgets();
    initCopyCodeBlocks();
    initBlogFilter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInteractiveFeatures);
  } else {
    initInteractiveFeatures();
  }
})();
