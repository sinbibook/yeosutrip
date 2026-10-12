/* ============================================================
   common.js — 전 페이지 공통 스크립트
   원본 playbeach.kr /js/custom.js 의 UI 동작을 옮긴 것.

   - PC LNB 패널 토글 / 모바일 aside / aside 아코디언 / top 버튼
   - 헤더·푸터는 header-footer-loader.js 가 fetch 로 주입하므로
     window.loaderReady 이후에 바인딩한다.
   - 객실/시설 메뉴는 매퍼가 동적으로 만들기 때문에 이벤트 위임을 쓴다.
   - Swiper 초기화는 원본처럼 여기서 하지 않는다. 매퍼가 슬라이드를 생성한 뒤
     js/pages/*.js 가 TplSwiper 로 초기화한다.

   ⚠️ 원본에서 `#header.on` 은 "스크롤됨" 이 아니라 **LNB 패널 열림** 이다.
      (`.header.on .hd_inner{translateY(-100%)}` + `.header.on .hd_lnb{translateY(0)}`)
      스크롤에 따라 .on 을 붙이면 메뉴가 제멋대로 열린다.

   ⚠️ `#container` 상단 여백은 주지 않는다. 원본 헤더는 `.hd_inner` 가
      position:absolute 라 헤더 자체 높이가 0 이고, 히어로 위에 겹쳐 뜨는 디자인이다.
      (1023px 이하에서 fixed → absolute 로만 바뀔 뿐 겹치는 건 동일하다)
   ============================================================ */
$(function () {
  (window.loaderReady || Promise.resolve()).then(function () {
    // ── PC LNB 패널 토글 ───────────────────────────────────
    // 로고 오른쪽 전체를 덮는 .btn_toggle 을 누르면 hd_inner 가 위로 밀려나며
    // 흰색 hd_lnb 패널이 내려온다. .btn_lnb_close 로 닫는다.
    $(document).on('click', '.btn_toggle, .btn_lnb_close', function (e) {
      e.preventDefault();
      $('#header').toggleClass('on');
    });

    // ── PC 서브메뉴 높이 상한 ───────────────────────────────
    // 서브메뉴 노출은 CSS(.depth1:hover .depth_box)가 담당한다.
    // 다만 객실/시설이 많으면 화면 아래로 흘러 내려가므로
    // 뷰포트에 맞춰 상한을 잡고 넘칠 때만 그 박스를 스크롤시킨다.
    //
    // ⚠️ display:none 인 요소는 scrollHeight 가 0 이다. CSS 로 이미 펼쳐진
    //    (hover 중인) 상태에서 재야 실제 값이 나온다.
    function capDepthBox($box) {
      var el = $box.get(0);
      if (!el) return;

      // 서브메뉴 상단(LNB 패널 아래)부터 화면 끝까지 쓰고 아래 여백 20px 을 남긴다
      var top = el.getBoundingClientRect().top;
      var cap = Math.max(160, $(window).height() - top - 20);

      // 상한을 풀고 실제 내용 높이를 잰다
      $box.removeClass('is-scroll').css('max-height', '');
      if (el.scrollHeight > cap) {
        $box.addClass('is-scroll').css('max-height', cap + 'px');
      }
    }

    $(document).on('mouseenter', '.hd_lnb .depth1', function () {
      capDepthBox($(this).find('.depth_box'));
    });

    // 열려 있는 동안 창 크기가 바뀌면 상한을 다시 계산한다
    $(window).on('resize', function () {
      $('.hd_lnb .depth_box:visible').each(function () {
        capDepthBox($(this));
      });
    });

    // ── 모바일 aside 토글 ──────────────────────────────────
    $(document).on('click', '.btn_menu, .aside .btn_close', function (e) {
      e.preventDefault();
      if ($('.aside').hasClass('on')) {
        $('.aside').removeClass('on');
        $('html, body').css({ height: 'inherit', overflow: 'inherit' });
      } else {
        $('.aside').addClass('on');
        $('html, body').css({ height: '100%', overflow: 'hidden' });
      }
    });

    // ── aside 아코디언 ─────────────────────────────────────
    $(document).on('click', '.aside .depth1', function () {
      $('.aside .depth_list').not($(this).next()).slideUp();
      $(this).next().slideToggle();
    });

    // ── top 버튼 ───────────────────────────────────────────
    $(document).on('click', '.btn_top', function (e) {
      e.preventDefault();
      $('html, body').stop().animate({ scrollTop: 0 }, 300);
    });
  });
});

/* ============================================================
   Swiper 공용 헬퍼
   매퍼가 슬라이드를 동적 생성한 뒤 호출되므로, 같은 컨테이너에
   이미 인스턴스가 있으면 destroy 후 재생성한다.
   ============================================================ */
window.TplSwiper = (function () {
  var instances = {};

  function init(key, selector, options) {
    var el = document.querySelector(selector);
    if (!el) return null;

    // 슬라이드가 하나도 없으면 초기화하지 않는다 (매핑 전/데이터 없음)
    var slideCount = el.querySelectorAll('.swiper-slide').length;
    if (!slideCount) return null;

    if (instances[key]) {
      try {
        instances[key].destroy(true, true);
      } catch (e) {
        /* 이미 파괴된 인스턴스 무시 */
      }
      delete instances[key];
    }

    var opts = options || {};

    // loop 는 화면에 보이는 수보다 슬라이드가 많아야 정상 동작한다.
    // 부족한 상태로 켜면 Swiper 가 레이아웃을 못 잡거나 예외를 던진다.
    var perView = Number(opts.slidesPerView) || 1;
    if (opts.loop && slideCount <= perView) {
      var relaxed = {};
      Object.keys(opts).forEach(function (k) {
        relaxed[k] = opts[k];
      });
      relaxed.loop = false;
      opts = relaxed;
    }

    // 넘길 슬라이드가 없을 때 화살표를 숨길 대상 (Swiper 옵션이 아니므로 분리해 둔다)
    var lockHide = opts.lockHide;
    if (lockHide) {
      var cleaned = {};
      Object.keys(opts).forEach(function (k) {
        if (k !== 'lockHide') cleaned[k] = opts[k];
      });
      opts = cleaned;
    }

    // 한 슬라이더가 실패해도 같은 페이지의 나머지 초기화까지 멈추면 안 된다.
    try {
      instances[key] = new Swiper(selector, opts);
    } catch (e) {
      console.error('[TplSwiper] init failed:', key, selector, e);
      return null;
    }

    if (lockHide) bindLockHide(instances[key], lockHide);
    return instances[key];
  }

  // 슬라이드가 화면에 다 들어와 넘길 게 없으면 화살표 영역을 숨긴다.
  // Swiper 의 watchOverflow(기본 on)가 그 상태를 isLocked / lock·unlock 이벤트로 알려준다.
  // 브레이크포인트마다 slidesPerView 가 달라 잠김 여부가 바뀌므로 resize 에도 다시 본다.
  //   예) 객실 2개 → 데스크톱(2열)은 잠김 → 숨김 / 640px 이하(1열)는 넘길 수 있어 노출
  function bindLockHide(swiper, selector) {
    var target = document.querySelector(selector);
    if (!target || !swiper) return;

    function sync() {
      target.style.display = swiper.isLocked ? 'none' : '';
    }

    swiper.on('lock', sync);
    swiper.on('unlock', sync);
    swiper.on('resize', sync);
    sync();
  }

  // 객실 카드 목록 공용 초기화 — index / layout-map 이 같은 규격을 쓴다.
  //
  // 원본 custom.js 의 swiper2 breakpoints 를 그대로 따른다.
  //   playbeach        : slidesPerView 2 (PC) / loop true  / autoplay 없음
  //   아라마루·펜션마루 : slidesPerView 3 (PC) / loop false / autoplay 있음
  //
  // 1200px 이하는 세 사이트가 동일하고 PC 열 수만 갈린다.
  // 펜션마루(pensionmaru.kr)를 따라 PC 최대 3열로 간다 (861~1200px 은 2열).
  //
  // 객실이 열 수보다 적으면 빈 칸이 생기므로 개수만큼만 배치한다
  // (객실 1개 → 1열 전체 폭). loop 도 넘길 게 있을 때만 켠다.
  var ROOM_MAX_COLS = 3;

  function initRoomList(key, selector, extra) {
    var el = document.querySelector(selector);
    if (!el) return null;

    var count = el.querySelectorAll('.swiper-slide').length;
    if (!count) return null;

    var cap = function (n) {
      return Math.min(n, count);
    };
    var perView = cap(ROOM_MAX_COLS);

    var opts = {
      loop: count > perView,
      slidesPerView: perView,
      spaceBetween: 20,
      roundLengths: true,
      grabCursor: true,
      breakpoints: {
        280: { slidesPerView: 1, spaceBetween: 0 },
        479: { slidesPerView: cap(2), spaceBetween: 10 },
        861: { slidesPerView: cap(2), spaceBetween: 15 },
        1201: { slidesPerView: perView, spaceBetween: 20 }
      }
    };
    if (extra) {
      Object.keys(extra).forEach(function (k) {
        opts[k] = extra[k];
      });
    }

    return init(key, selector, opts);
  }

  return { init: init, initRoomList: initRoomList, instances: instances };
})();
