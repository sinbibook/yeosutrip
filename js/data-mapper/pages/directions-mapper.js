(function (global) {
  'use strict';

  function DirectionsMapper() {
    BaseDataMapper.call(this);
  }
  DirectionsMapper.prototype = Object.create(BaseDataMapper.prototype);
  DirectionsMapper.prototype.constructor = DirectionsMapper;

  // 섹션 배정 — pages.directions.sections[0]
  //   hero   → .sub_wide_visual 배경
  //   notice → .map_info 안내사항 블록 (아래 파싱 규약 참고)
  DirectionsMapper.prototype.getSection = function () {
    var page = this.getPages().directions;
    return (page && page.sections && page.sections[0]) || {};
  };

  DirectionsMapper.prototype.mapPage = function () {
    this.mapPropertyNames();
    this.mapHeroBg();
    this.mapAddress();
    this.mapNotice();
    this.mapKakaoMap();
  };

  DirectionsMapper.prototype.mapPropertyNames = function () {
    var self = this;
    document.querySelectorAll('[data-property-name-en]').forEach(function (el) {
      el.textContent = self.getPropertyNameEn();
    });
    document.querySelectorAll('[data-property-name]').forEach(function (el) {
      el.textContent = self.getPropertyName();
    });
    this.applyPropertyCaptions();
  };

  DirectionsMapper.prototype.mapHeroBg = function () {
    var el = document.querySelector('[data-directions-hero]');
    if (!el) return;

    var hero = this.getSection().hero || {};
    var url = this.getFirstSelectedImage(hero.images || []);
    if (!url) {
      var picked = this.pickPropertyImage(['exterior', 'surrounding', 'thumbnail']);
      url = picked ? picked.url : '';
    }
    this.setBackground(el, url, 'Hero Image');
  };

  DirectionsMapper.prototype.getAddress = function () {
    var prop = this.getProperty();
    return this.firstText(prop.address, (prop.businessInfo || {}).businessAddress);
  };

  DirectionsMapper.prototype.mapAddress = function () {
    var address = this.getAddress();
    document.querySelectorAll('[data-directions-address]').forEach(function (el) {
      el.textContent = address;
      // 주소가 없으면 "주소 :" 만 남으므로 줄째 숨긴다
      var line = el.closest('p') || el;
      line.style.display = address ? '' : 'none';
    });
  };

  // ── 안내사항(notice) 다중 블록 규약 ──────────────────────
  //
  // 크롤러가 채우는 형식 (E2 와 동일)
  //
  //   자가용 이용 시
  //   ※ 네비게이션에 주소를 검색해주세요
  //   지번 주소 : …
  //   도로명 주소 : …
  //   (빈 줄)
  //   대중교통 이용 시
  //   …
  //
  // - 빈 줄(\n\n)로 블록을 구분한다
  // - 각 블록의 첫 줄이 제목이다
  //
  // 원본 `dl.map_info` 는 **제목이 하나**다.
  //
  //   dt.sub_title_box   p `{name} - 오시는길` / h3 `오시는길 안내`   ← 고정
  //   dd                 .box(strong 블록 제목 + p 본문) × N
  //
  // 즉 블록이 늘어나는 자리는 `dd` 안의 `.box` 이고(CSS `.map_info dd .box + .box`),
  // 블록 제목은 h3 가 아니라 `strong` 이다. 번호(`01,`)는 붙이지 않는다.
  DirectionsMapper.prototype.mapNotice = function () {
    var self = this;
    var host = document.querySelector('[data-directions-notice]');
    if (!host) return;
    host.innerHTML = '';

    var blocks = this.parseNoticeBlocks();
    // 안내 문구도 주소도 없으면 제목만 남으므로 영역째 숨긴다
    host.style.display = blocks.length ? '' : 'none';
    if (!blocks.length) return;

    var dt = document.createElement('dt');
    dt.className = 'sub_title_box';
    var lead = document.createElement('p');
    var name = this.getPropertyName();
    lead.textContent = (name ? name + ' - ' : '') + '오시는길';
    var h3 = document.createElement('h3');
    h3.textContent = this.NOTICE_HEADING;
    dt.appendChild(lead);
    dt.appendChild(h3);
    host.appendChild(dt);

    var dd = document.createElement('dd');
    blocks.forEach(function (block) {
      dd.appendChild(self.buildNoticeBox(block));
    });
    host.appendChild(dd);
  };

  // 원본 h3 는 업체와 무관한 고정 문구다
  DirectionsMapper.prototype.NOTICE_HEADING = '오시는길 안내';

  // 원본 dd 는 `.box > strong + p` 구조다. strong 에 블록 제목이 들어간다.
  // 원본 표기가 `[자가용 이용시]` 라 대괄호가 없는 제목은 감싸 준다
  // (크롤러는 `자가용 이용 시` 처럼 대괄호 없이 넘긴다).
  DirectionsMapper.prototype.buildNoticeBox = function (block) {
    var box = document.createElement('div');
    box.className = 'box';

    var title = String(block.title || '').trim();
    if (title) {
      var strong = document.createElement('strong');
      strong.textContent = /^[[(]/.test(title) ? title : '[' + title + ']';
      box.appendChild(strong);
    }

    var body = String(block.body || '').trim();
    if (body) {
      var p = document.createElement('p');
      p.innerHTML = this.nl2br(body);
      box.appendChild(p);
    }
    return box;
  };

  // 제목 조건: `※` 로 시작하지 않고 `:` 를 포함하지 않는 줄.
  // `지번 주소 : …` 나 `※ …` 를 제목으로 오인하지 않기 위한 규칙이다.
  DirectionsMapper.prototype.isNoticeTitle = function (line) {
    var s = String(line || '').trim();
    if (!s) return false;
    return !/^※/.test(s) && s.indexOf(':') === -1;
  };

  DirectionsMapper.prototype.DEFAULT_NOTICE_TITLE = '자가용 이용 시';

  DirectionsMapper.prototype.parseNoticeBlocks = function () {
    var self = this;
    var notice = this.getSection().notice;
    var sources = Array.isArray(notice) ? notice : notice ? [notice] : [];
    var blocks = [];

    sources.forEach(function (item) {
      var title = self.cleanText(item && item.title);
      var chunks = self
        .cleanText(item && item.description)
        .split(/\n\s*\n/)
        .map(function (c) {
          return c.trim();
        })
        .filter(Boolean);

      chunks.forEach(function (chunk, idx) {
        var lines = chunk.split('\n');
        var head = '';

        // 첫 블록은 notice.title 을 제목으로 쓰고 본문 첫 줄을 떼지 않는다
        if (idx === 0 && title && !blocks.length) {
          head = title;
        } else if (self.isNoticeTitle(lines[0])) {
          head = lines.shift().trim();
        }

        blocks.push({
          title: self.firstText(head, title, self.DEFAULT_NOTICE_TITLE),
          body: lines.join('\n').trim()
        });
      });
    });

    // 본문이 하나도 없으면 주소로 안내 문구를 조립한다
    var hasBody = blocks.some(function (b) {
      return b.body;
    });
    if (!blocks.length || !hasBody) {
      var address = this.getAddress();
      if (!address)
        return blocks.filter(function (b) {
          return b.body;
        });
      return [
        {
          title: this.firstText(blocks[0] && blocks[0].title, this.DEFAULT_NOTICE_TITLE),
          body: '※ 네비게이션에 아래 주소를 입력해주세요.\n' + address
        }
      ];
    }
    return blocks;
  };

  // ── 지도 ────────────────────────────────────────────────
  // 원본은 daum roughmap 퍼가기 스크립트를 썼다. 업체 고유 key 가 필요해
  // 재현할 수 없으므로 Kakao Maps SDK(js/kakao-maps-sdk.js)로 대체했다.
  //
  // preview 는 데이터가 바뀔 때마다 매핑을 다시 돌린다. 그때마다 new Map() 을
  // 만들면 인스턴스가 쌓이므로, 이미 있으면 중심만 옮긴다.
  DirectionsMapper.prototype.mapKakaoMap = function () {
    var self = this;
    var container = document.getElementById('kakao-map');
    if (!container) return;

    var prop = this.getProperty();
    var lat = Number(prop.latitude);
    var lng = Number(prop.longitude);
    // 좌표가 없어도 영역은 유지한다. `.map_inner` 는 padding-bottom 40% 비율 상자라
    // 안을 비우면 테두리만 남은 빈 띠가 되어 페이지가 무너진 것처럼 보인다.
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      container.style.display = '';
      ImageHelpers.applyBackgroundPlaceholder(container, '지도');
      return;
    }
    container.style.display = '';
    container.classList.remove('empty-image-placeholder');
    container.style.backgroundImage = '';

    function createMap() {
      try {
        var position = new kakao.maps.LatLng(lat, lng);

        if (self._kakaoMap) {
          self._kakaoMap.setCenter(position);
          self._kakaoMap.relayout();
          if (self._kakaoMarker) self._kakaoMarker.setPosition(position);
          return;
        }

        self._kakaoMap = new kakao.maps.Map(container, { center: position, level: 4 });
        self._kakaoMarker = new kakao.maps.Marker({ position: position });
        self._kakaoMarker.setMap(self._kakaoMap);

        // 지도가 숨겨진 상태로 생성되면 크기를 0 으로 잡는다. 노출 후 다시 계산한다.
        window.addEventListener('resize', function () {
          if (!self._kakaoMap) return;
          self._kakaoMap.relayout();
          self._kakaoMap.setCenter(position);
        });
      } catch (e) {
        console.error('[directions] kakao map init failed:', e);
      }
    }

    if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
      window.kakao.maps.load(createMap);
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new DirectionsMapper();
    mapper.initialize();
    global.directionsMapperInstance = mapper;
  });

  global.DirectionsMapper = DirectionsMapper;
})(window);
