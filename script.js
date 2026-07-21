/* ==========================================================================
   BRAZIL TRAVEL CARD NEWS — script.js
   All logic is defensive: every DOM lookup is null-checked before use.
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  /* ------------------------------------------------------------------ */
  /* Topic dictionary: each key maps to a Korean-Wikipedia title first, */
  /* an English-Wikipedia fallback title, and a friendly, SHORT blurb   */
  /* written for kids. This short blurb is what's shown in the modal —  */
  /* we still borrow the Wikipedia PHOTO, but never the long article    */
  /* text, so explanations stay quick and easy to understand.           */
  /* ------------------------------------------------------------------ */
  var TOPICS = {
    flag:      { ko: '브라질의 국기', en: 'Flag of Brazil', fallback: '초록·노랑·파랑 3가지 색 국기예요. 초록은 숲, 노랑은 자원, 파랑은 하늘을 뜻해요.' },
    capital:   { ko: '브라질리아', en: 'Brasília', fallback: '브라질의 수도는 브라질리아예요. 비행기 모양으로 만든 계획도시예요.' },
    area:      { ko: '브라질', en: 'Brazil', fallback: '브라질은 남아메리카에서 가장 큰 나라예요.' },
    language:  { ko: '포르투갈어', en: 'Portuguese language', fallback: '브라질에서는 포르투갈어를 써요. 남미에서 유일해요.' },
    currency:  { ko: '브라질 헤알', en: 'Brazilian real', fallback: '브라질 돈은 헤알(Real)이에요. 시내 환전소가 환율이 더 좋아요.' },
    coffee:    { ko: '커피', en: 'Coffee', fallback: '브라질은 커피를 세계에서 가장 많이 만드는 나라예요.' },
    football:  { ko: '브라질 축구 국가대표팀', en: 'Brazil national football team', fallback: '브라질은 월드컵을 5번 우승한 축구 강국이에요.' },
    samba:     { ko: '삼바', en: 'Samba', fallback: '삼바는 신나는 브라질 대표 춤이에요.' },
    carnival:  { ko: '브라질의 카니발', en: 'Carnival in Brazil', fallback: '카니발은 매년 2월에 열리는 큰 축제예요. 삼바 퍼레이드가 유명해요.' },
    amazon:    { ko: '아마존 열대우림', en: 'Amazon rainforest', fallback: '아마존은 세계에서 가장 큰 숲이에요. ‘지구의 허파’라고 불러요.' },
    season:    { ko: '남반구', en: 'Southern Hemisphere', fallback: '브라질은 한국과 계절이 반대예요. 한국이 여름이면 브라질은 겨울이에요.' },
    safety:    { ko: '리우데자네이루', en: 'Rio de Janeiro', fallback: '귀중품은 눈에 띄지 않게, 밤에는 혼자 다니지 않아요.' },
    gesture:   { ko: '오케이 사인', en: 'OK gesture', fallback: '브라질에서 OK 사인은 실례가 될 수 있어요. 조심해요.' },
    hygiene:   { ko: '손 소독제', en: 'Hand sanitizer', fallback: '손 소독제와 물티슈를 챙기면 좋아요.' },
    park:      { ko: '토레스 (헤우그란데두술주)', en: 'Torres, Rio Grande do Sul', fallback: '과리타 주립공원은 절벽과 바다가 만나는 예쁜 곳이에요.' },
    beach:     { ko: '토레스 (헤우그란데두술주)', en: 'Torres, Rio Grande do Sul', fallback: '과리타 해변은 브라질 남부의 아름다운 해변이에요.' },
    churrasco: { ko: '슈하스코', en: 'Churrasco', fallback: '슈하스코는 즉석에서 썰어주는 브라질식 고기 바비큐예요.' },
    feijoada:  { ko: '페이조아다', en: 'Feijoada', fallback: '페이조아다는 검은콩과 고기를 끓인 브라질 대표 음식이에요.' },
    pastel:    { ko: '파스텔 (요리)', en: 'Pastel (food)', fallback: '파스텔은 고기·치즈를 넣고 바삭하게 튀긴 간식이에요.' },
    sunscreen: { ko: '선크림', en: 'Sunscreen', fallback: '브라질은 햇빛이 강해서 선크림이 꼭 필요해요.' },
    esim:      { ko: 'eSIM', en: 'eSIM', fallback: '유심(eSIM)을 미리 준비하면 인터넷을 바로 쓸 수 있어요.' },
    transport: { ko: '우버 (기업)', en: 'Uber (company)', fallback: '차량 호출 앱을 쓰면 더 안전하고 편해요.' },
    coffeebeans: { ko: '커피', en: 'Coffee', fallback: '커피 원두는 브라질 여행의 대표 선물이에요. 가족·친구에게 좋아요.' },
    jersey:    { ko: '브라질 축구 국가대표팀', en: 'Brazil national football team', fallback: '노랑·초록 브라질 축구 유니폼은 인기 기념품이에요.' },
    havaianas: { ko: '하바이아나스', en: 'Havaianas', fallback: '하바이아나스는 브라질에서 태어난 알록달록 고무 슬리퍼예요.' },
    gemstone:  { ko: '자수정', en: 'Amethyst', fallback: '브라질은 자수정 같은 예쁜 원석이 유명해요. 액세서리로 인기 있어요.' }
  };

  var WIKI_CACHE = {};

  function init() {
    var deck = document.getElementById('deck');
    if (!deck) return;

    var cards = Array.prototype.slice.call(deck.querySelectorAll('.card'));
    if (!cards.length) return;

    var dotNav = document.getElementById('dotNav');
    var dots = dotNav ? Array.prototype.slice.call(dotNav.querySelectorAll('.dot')) : [];
    var progressBar = document.getElementById('progressBar');
    var pageIndicator = document.getElementById('pageIndicator');
    var homeBtn = document.getElementById('homeBtn');
    var prevBtn = document.getElementById('prevBtn');
    var nextBtn = document.getElementById('nextBtn');
    var scrollTopBtn = document.getElementById('scrollTopBtn');
    var thanksBtn = document.getElementById('thanksBtn');

    var total = cards.length;
    var currentIndex = 0;

    /* ---------------------------------------------------------------- */
    /* Stagger delays for child reveal animations                        */
    /* ---------------------------------------------------------------- */
    function assignStaggerDelays(card) {
      var groups = card.querySelectorAll('[data-reveal="stagger"]');
      groups.forEach(function (group) {
        // Food cards should all be visible right away (no one-by-one delay)
        if (group.classList.contains('food-grid')) return;
        var children = group.children;
        for (var i = 0; i < children.length; i++) {
          children[i].style.setProperty('--d', (i * 0.08) + 's');
        }
      });
    }
    cards.forEach(assignStaggerDelays);

    /* ---------------------------------------------------------------- */
    /* Navigation helpers                                                 */
    /* ---------------------------------------------------------------- */
    function goToIndex(index) {
      if (index < 0 || index >= total) return;
      var target = cards[index];
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function next() { goToIndex(currentIndex + 1); }
    function prev() { goToIndex(currentIndex - 1); }
    function home() { goToIndex(0); }

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (homeBtn) homeBtn.addEventListener('click', home);
    if (scrollTopBtn) scrollTopBtn.addEventListener('click', home);

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var idx = parseInt(dot.getAttribute('data-index'), 10);
        if (!isNaN(idx)) goToIndex(idx);
      });
    });

    /* ---------------------------------------------------------------- */
    /* Keyboard navigation (disabled while modal is open)                */
    /* ---------------------------------------------------------------- */
    document.addEventListener('keydown', function (e) {
      if (isModalOpen()) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        prev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        home();
      } else if (e.key === 'End') {
        e.preventDefault();
        goToIndex(total - 1);
      }
    });

    /* ---------------------------------------------------------------- */
    /* Update UI state (dots, progress bar, page indicator, active card) */
    /* ---------------------------------------------------------------- */
    function setActive(index) {
      currentIndex = index;

      cards.forEach(function (card, i) {
        if (i === index) {
          card.classList.add('is-active');
        } else {
          card.classList.remove('is-active');
        }
      });

      dots.forEach(function (dot, i) {
        if (i === index) {
          dot.classList.add('is-active');
        } else {
          dot.classList.remove('is-active');
        }
      });

      if (progressBar) {
        var pct = total > 1 ? (index / (total - 1)) * 100 : 0;
        progressBar.style.width = pct + '%';
      }

      if (pageIndicator) {
        var num = String(index + 1).padStart(2, '0');
        var totalStr = String(total).padStart(2, '0');
        pageIndicator.innerHTML = num + '<span class="slash">/</span>' + totalStr;
      }

      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === total - 1;

      if (scrollTopBtn) {
        if (index > 0) {
          scrollTopBtn.classList.add('is-visible');
        } else {
          scrollTopBtn.classList.remove('is-visible');
        }
      }

      if (index === total - 1) {
        triggerConfetti();
      }
    }

    /* ---------------------------------------------------------------- */
    /* IntersectionObserver drives "which card is active"                */
    /* ---------------------------------------------------------------- */
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
              var idx = cards.indexOf(entry.target);
              if (idx !== -1) setActive(idx);
            }
          });
        },
        { root: deck, threshold: [0, 0.55, 1] }
      );
      cards.forEach(function (card) { observer.observe(card); });
    } else {
      // fallback: mark first card active
      setActive(0);
    }

    // Ensure first card is marked active immediately (before scroll events fire)
    setActive(0);

    /* ---------------------------------------------------------------- */
    /* Checklist toggle (card 5) — ignore clicks on the photo badge      */
    /* ---------------------------------------------------------------- */
    var checkItems = document.querySelectorAll('.check-item');
    checkItems.forEach(function (item) {
      item.addEventListener('click', function (e) {
        if (e.target.closest('.info-photo-badge')) return;
        item.classList.toggle('is-done');
      });
    });

    /* ---------------------------------------------------------------- */
    /* Ripple + confetti-burst on "감사합니다!" button                    */
    /* ---------------------------------------------------------------- */
    if (thanksBtn) {
      thanksBtn.addEventListener('click', function (e) {
        createRipple(e, thanksBtn);
        burstConfetti();
      });
    }

    function createRipple(e, el) {
      var rect = el.getBoundingClientRect();
      var ripple = document.createElement('span');
      var size = Math.max(rect.width, rect.height) * 1.4;
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      el.appendChild(ripple);
      window.setTimeout(function () {
        if (ripple && ripple.parentNode) ripple.parentNode.removeChild(ripple);
      }, 750);
    }

    /* ---------------------------------------------------------------- */
    /* Confetti canvas animation                                         */
    /* ---------------------------------------------------------------- */
    var confettiCanvas = document.getElementById('confettiCanvas');
    var confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
    var confettiParticles = [];
    var confettiRunning = false;
    var confettiColors = ['#F4B740', '#FFD77A', '#FF6B4D', '#FF9478', '#21B6A8', '#6FE0D3', '#FBF3E3'];
    var confettiRafId = null;
    var confettiHasFired = false;

    function resizeConfettiCanvas() {
      if (!confettiCanvas) return;
      var section = confettiCanvas.closest('.card');
      var w = section ? section.clientWidth : window.innerWidth;
      var h = section ? section.clientHeight : window.innerHeight;
      confettiCanvas.width = w;
      confettiCanvas.height = h;
    }

    function makeParticle(fromTop) {
      var w = confettiCanvas ? confettiCanvas.width : window.innerWidth;
      var h = confettiCanvas ? confettiCanvas.height : window.innerHeight;
      return {
        x: Math.random() * w,
        y: fromTop ? -20 - Math.random() * h * 0.3 : Math.random() * h * -1,
        size: 5 + Math.random() * 7,
        speedY: 1.6 + Math.random() * 2.6,
        speedX: (Math.random() - 0.5) * 2.4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
        life: 0,
        maxLife: 500 + Math.random() * 220
      };
    }

    function seedConfetti(count) {
      if (!confettiCtx) return;
      resizeConfettiCanvas();
      for (var i = 0; i < count; i++) {
        confettiParticles.push(makeParticle(true));
      }
    }

    function stepConfetti() {
      if (!confettiCtx || !confettiCanvas) return;
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

      var stillAlive = [];
      for (var i = 0; i < confettiParticles.length; i++) {
        var p = confettiParticles[i];
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;
        p.life++;

        if (p.y < confettiCanvas.height + 20 && p.life < p.maxLife) {
          confettiCtx.save();
          confettiCtx.translate(p.x, p.y);
          confettiCtx.rotate((p.rotation * Math.PI) / 180);
          confettiCtx.fillStyle = p.color;
          if (p.shape === 'rect') {
            confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          } else {
            confettiCtx.beginPath();
            confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            confettiCtx.fill();
          }
          confettiCtx.restore();
          stillAlive.push(p);
        }
      }
      confettiParticles = stillAlive;

      if (confettiParticles.length > 0) {
        confettiRafId = window.requestAnimationFrame(stepConfetti);
      } else {
        confettiRunning = false;
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }

    function runConfetti(count) {
      if (!confettiCtx) return;
      seedConfetti(count);
      if (!confettiRunning) {
        confettiRunning = true;
        confettiRafId = window.requestAnimationFrame(stepConfetti);
      }
    }

    function triggerConfetti() {
      if (confettiHasFired) return;
      confettiHasFired = true;
      runConfetti(90);
    }

    function burstConfetti() {
      runConfetti(70);
    }

    window.addEventListener('resize', function () {
      if (confettiCanvas) resizeConfettiCanvas();
    });

    /* ---------------------------------------------------------------- */
    /* INFO / PHOTO MODAL                                                 */
    /* ---------------------------------------------------------------- */
    var modal = document.getElementById('infoModal');
    var modalCloseBtn = document.getElementById('modalCloseBtn');
    var modalTitle = document.getElementById('modalTitle');
    var modalDesc = document.getElementById('modalDesc');
    var modalImg = document.getElementById('modalImg');
    var modalMap = document.getElementById('modalMap');
    var modalLoading = document.getElementById('modalLoading');
    var modalSource = document.getElementById('modalSource');
    var lastFocusedEl = null;

    function isModalOpen() {
      return !!(modal && modal.classList.contains('is-open'));
    }

    function getCardLabel(el) {
      if (!el) return '';
      var h3 = el.querySelector('h3');
      if (h3) {
        // strip any nested language tag like <span>Churrasco</span>
        var clone = h3.cloneNode(true);
        var innerSpan = clone.querySelector('span');
        if (innerSpan) innerSpan.remove();
        return clone.textContent.trim();
      }
      var infoVal = el.querySelector('.info-val');
      var infoLabel = el.querySelector('.info-label');
      if (infoVal && infoLabel) return infoLabel.textContent.trim();
      return el.textContent.trim().slice(0, 40);
    }

    function resetModalMedia() {
      if (modalImg) { modalImg.hidden = true; modalImg.src = ''; modalImg.alt = ''; }
      if (modalMap) { modalMap.hidden = true; modalMap.src = ''; }
      if (modalLoading) modalLoading.hidden = false;
      if (modalSource) { modalSource.hidden = true; modalSource.href = '#'; }
    }

    function openModal() {
      if (!modal) return;
      lastFocusedEl = document.activeElement;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (modalCloseBtn) modalCloseBtn.focus();
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (modalMap) { modalMap.src = ''; } // stop map iframe loading in background
      if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
        lastFocusedEl.focus();
      }
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isModalOpen()) closeModal();
    });

    function showMapModal(triggerEl) {
      resetModalMedia();
      if (modalTitle) modalTitle.textContent = '🗺️ 브라질의 위치';
      if (modalDesc) {
        modalDesc.textContent = '브라질은 남아메리카 동쪽, 바다 옆에 있어요. 지도의 초록 점이 브라질이에요.';
      }
      if (modalLoading) modalLoading.hidden = true;
      if (modalMap) {
        // world view centered so Brazil's marker is clearly visible
        var bbox = '-170,-58,170,75';
        var marker = '-10.3333,-53.2';
        modalMap.src = 'https://www.openstreetmap.org/export/embed.html?bbox=' + bbox + '&layer=mapnik&marker=' + marker;
        modalMap.hidden = false;
      }
      if (modalSource) {
        modalSource.href = 'https://www.openstreetmap.org/?mlat=-10.3333&mlon=-53.2#map=3/-10.33/-53.20';
        modalSource.textContent = '지도 크게 보기 →';
        modalSource.hidden = false;
      }
      openModal();
    }

    function wikiSummaryUrl(lang, title) {
      return 'https://' + lang + '.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title);
    }

    function fetchSummary(lang, title) {
      return fetch(wikiSummaryUrl(lang, title), { headers: { 'Accept': 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('not found');
          return res.json();
        })
        .then(function (data) {
          if (data && data.type === 'disambiguation') throw new Error('disambiguation');
          return data;
        });
    }

    // Prefer the small "thumbnail" image (fast to load) over the full-size
    // "originalimage" — the modal only ever displays it at a few hundred
    // pixels wide, so the big original just wastes time and data.
    function pickImage(data) {
      if (!data) return null;
      var thumb = data.thumbnail && data.thumbnail.source;
      if (thumb) return thumb;
      var original = data.originalimage && data.originalimage.source;
      return original || null;
    }

    function pickSourceUrl(data) {
      return (data && data.content_urls && data.content_urls.desktop && data.content_urls.desktop.page) || null;
    }

    // We only ever borrow the PHOTO from Wikipedia. The description text
    // always uses our own short, kid-friendly Korean blurb (topic.fallback)
    // so explanations stay quick and easy — never the long Wikipedia
    // article extract, which is too long and too advanced for a fast,
    // simple explanation.
    function buildResult(topic, fallbackTitle, koData, enData) {
      var image = pickImage(koData) || pickImage(enData);
      var desc = (topic && topic.fallback) || (koData && koData.extract) || '';
      var sourceUrl = pickSourceUrl(koData) || pickSourceUrl(enData);
      var title = fallbackTitle || (topic && topic.ko) || (koData && koData.title) || '';
      return { title: title, image: image, desc: desc, sourceUrl: sourceUrl };
    }

    function showTopicModal(topicKey, fallbackTitle) {
      var topic = TOPICS[topicKey];
      resetModalMedia();
      if (modalTitle) modalTitle.textContent = fallbackTitle || (topic ? topic.ko : '브라질 이야기');
      if (modalDesc) modalDesc.textContent = '';
      openModal();

      if (!topic) {
        if (modalLoading) modalLoading.hidden = true;
        if (modalDesc) modalDesc.textContent = '설명을 준비 중이에요.';
        return;
      }

      if (WIKI_CACHE[topicKey]) {
        renderTopicResult(WIKI_CACHE[topicKey]);
        return;
      }

      fetchSummary('ko', topic.ko)
        .then(function (koData) {
          var result = buildResult(topic, fallbackTitle, koData, null);
          WIKI_CACHE[topicKey] = result;
          renderTopicResult(result);
        })
        .catch(function () {
          // Korean article missing — try English only to borrow a photo,
          // description text still comes from our short Korean blurb.
          return fetchSummary('en', topic.en)
            .then(function (enData) {
              var result = buildResult(topic, fallbackTitle, null, enData);
              WIKI_CACHE[topicKey] = result;
              renderTopicResult(result);
            })
            .catch(function () {
              var result = buildResult(topic, fallbackTitle, null, null);
              WIKI_CACHE[topicKey] = result;
              renderTopicResult(result);
            });
        });
    }

    function renderTopicResult(result) {
      if (!isModalOpen()) return; // user already closed it
      if (modalLoading) modalLoading.hidden = true;
      if (modalTitle) modalTitle.textContent = result.title;
      if (modalDesc) modalDesc.textContent = result.desc || '';

      if (result.image && modalImg) {
        modalImg.decoding = 'async';
        modalImg.onerror = function () { modalImg.hidden = true; };
        modalImg.src = result.image;
        modalImg.alt = result.title;
        modalImg.hidden = false;
      } else if (modalImg) {
        modalImg.hidden = true;
      }

      if (result.sourceUrl && modalSource) {
        modalSource.href = result.sourceUrl;
        modalSource.textContent = '위키백과에서 더 보기 →';
        modalSource.hidden = false;
      } else if (modalSource) {
        modalSource.hidden = true;
      }
    }

    /* Wire up every clickable element that carries data-topic or data-map */
    var clickableSelectors = '[data-topic], [data-map]';
    document.querySelectorAll(clickableSelectors).forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var mapKind = el.getAttribute('data-map');
        if (mapKind) {
          showMapModal(el);
          return;
        }
        var topicKey = el.getAttribute('data-topic');
        if (!topicKey) return;
        var label = getCardLabel(el.closest('.info-chip, .fact-card, .tl-body, .food-card') || el.closest('li'));
        showTopicModal(topicKey, label);
      });
    });

    /* ---------------------------------------------------------------- */
    /* Prevent runaway errors from any late-loading font/image issues   */
    /* ---------------------------------------------------------------- */
    window.addEventListener('error', function () {
      /* swallow resource errors quietly (e.g. a slow/broken image) so the
         rest of the experience keeps working */
    }, true);
  }
})();
