(function (global) {
  'use strict';

  // 출처 / 거리 판정 (E2·C2·D2·L 과 같은 규칙)
  var SOURCE_RE = /^(자료출처|출처)/;
  var DISTANCE_RE = /^(펜션에서|숙소에서)|거리$/;

  function NearbyAttractionsMapper() {
    BaseDataMapper.call(this);
  }
  NearbyAttractionsMapper.prototype = Object.create(BaseDataMapper.prototype);
  NearbyAttractionsMapper.prototype.constructor = NearbyAttractionsMapper;

  // 섹션 배정 — pages.nearbyAttractions.sections[0]
  //   hero    → .sub_wide_visual 배경
  //   about[] → 여행지 목록 (배열이다. 다른 페이지의 about 은 객체라 헷갈리기 쉽다)
  NearbyAttractionsMapper.prototype.getSection = function () {
    var page = this.getPages().nearbyAttractions;
    return (page && page.sections && page.sections[0]) || null;
  };

  NearbyAttractionsMapper.prototype.mapPage = function () {
    var section = this.getSection();

    // enabled=false (또는 섹션 자체가 없음) → 404 리다이렉트.
    // 헤더 TRAVEL 메뉴도 header-footer-mapper 가 같은 기준으로 숨긴다.
    if (!section || section.enabled === false) {
      window.location.href = '404.html';
      return;
    }

    this.mapPropertyNames();
    this.mapHeroBg();
    this.mapTitleBox();
    this.mapList();
  };

  NearbyAttractionsMapper.prototype.mapPropertyNames = function () {
    var self = this;
    document.querySelectorAll('[data-property-name-en]').forEach(function (el) {
      el.textContent = self.getPropertyNameEn();
    });
    document.querySelectorAll('[data-property-name]').forEach(function (el) {
      el.textContent = self.getPropertyName();
    });
    this.applyPropertyCaptions();
  };

  NearbyAttractionsMapper.prototype.mapHeroBg = function () {
    var el = document.querySelector('[data-nearby-hero]');
    if (!el) return;

    var section = this.getSection() || {};
    var url = this.getFirstSelectedImage((section.hero && section.hero.images) || []);
    if (!url) {
      // 여행지 사진 → 숙소 주변 → 외경 순으로 폴백
      var items = this.getItems();
      for (var i = 0; i < items.length && !url; i++) {
        url = this.getFirstSelectedImage(items[i].images || []);
      }
    }
    if (!url) {
      var picked = this.pickPropertyImage(['surrounding', 'exterior', 'thumbnail']);
      url = picked ? picked.url : '';
    }
    this.setBackground(el, url, 'Hero Image');
  };

  // MAPPER: hero.title / hero.description → .sub_title_box
  //
  // 히어로 문구(`Tour Information` / `{name} 여행지 정보`)는 페이지 성격 라벨이라 고정하고,
  // 그 아래 제목 영역을 백오피스가 채울 수 있게 연다 (reservation.html 과 같은 방식).
  //
  // ⚠️ 이 섹션의 `about` 은 객체가 아니라 **여행지 항목 배열**이라
  //    title/description 슬롯이 hero 쪽에만 있다.
  NearbyAttractionsMapper.prototype.mapTitleBox = function () {
    var self = this;
    var name = this.getPropertyName();
    var hero = (this.getSection() || {}).hero || {};

    document.querySelectorAll('[data-nearby-lead]').forEach(function (el) {
      var lead = self.firstText(hero.description, (name ? name + ' - ' : '') + '관광안내');
      el.innerHTML = self.nl2br(lead);
    });
    document.querySelectorAll('[data-nearby-title]').forEach(function (el) {
      el.textContent = self.firstText(hero.title, '주변 여행지');
    });
  };

  // 항목 소스
  //   1) nearbyAttractions.about[]      { title, description, images } — 사진·설명까지
  //   2) property.nearbyAttractions[]   문자열 배열(이름만) — 사진/설명 없음
  NearbyAttractionsMapper.prototype.getItems = function () {
    var section = this.getSection() || {};
    var about = section.about;
    if (Array.isArray(about) && about.length) return about;

    var fallback = this.getProperty().nearbyAttractions || [];
    return fallback
      .map(function (v) {
        return typeof v === 'string' ? { title: v } : v;
      })
      .filter(Boolean);
  };

  // MAPPER: 여행지 목록 → .travel_list ul
  //
  // 원본 li 는 `img + strong + p(본문 + span 출처 + em 거리)` 구조다.
  // `01.` `02.` 번호는 매퍼가 넣지 않는다 — 원본 CSS 의
  // `strong:before { counter-increment }` 가 붙인다.
  NearbyAttractionsMapper.prototype.mapList = function () {
    var self = this;
    var ul = document.querySelector('[data-nearby-list]');
    if (!ul) return;
    ul.innerHTML = '';

    var items = this.getItems();
    if (!items.length) return;

    items.forEach(function (item) {
      var title = self.cleanText(item && item.title);
      if (!title) return;
      ul.appendChild(self.buildItem(item, title));
    });
  };

  NearbyAttractionsMapper.prototype.buildItem = function (item, title) {
    var li = document.createElement('li');
    var images = this.getSelectedImages(item.images || []);
    var first = images[0] || null;

    var img = document.createElement('img');
    if (first && first.url) {
      img.src = first.url;
      img.alt = title;
    } else {
      ImageHelpers.applyPlaceholder(img, '여행지 이미지');
    }
    li.appendChild(img);

    var strong = document.createElement('strong');
    strong.textContent = title;
    li.appendChild(strong);

    var parsed = this.splitDescription(item.description, first);
    // 본문·출처·거리가 모두 없으면 <p> 를 만들지 않는다
    // (property.nearbyAttractions[] 문자열 폴백은 이름만 있다)
    if (!parsed.body && !parsed.source && !parsed.distance) return li;

    var p = document.createElement('p');
    if (parsed.body) p.innerHTML = this.nl2br(parsed.body);

    if (parsed.source) {
      var span = document.createElement('span');
      span.textContent = parsed.source;
      p.appendChild(span);
    }
    if (parsed.distance) {
      var em = document.createElement('em');
      em.textContent = parsed.distance;
      p.appendChild(em);
    }
    li.appendChild(p);
    return li;
  };

  // 본문 / 자료출처 / 거리 세 덩어리로 나눈다.
  //
  //   거리는 images[0].description 이 정본이다 (C2 / D2 / L 이 그 필드를 쓴다).
  //   출처는 전용 필드가 없어 description 안에서 가려낸다.
  //
  // 출처·거리는 **각각 첫 번째로 매칭된 줄 하나만** 쓰고 나머지는 본문으로 남는다.
  // 줄 순서는 상관없다.
  NearbyAttractionsMapper.prototype.splitDescription = function (description, firstImage) {
    var distance = this.cleanText(firstImage && firstImage.description);
    var source = '';
    var body = [];

    this.cleanText(description)
      .split('\n')
      .forEach(function (raw) {
        var line = raw.trim();
        if (!line) return;
        if (!source && SOURCE_RE.test(line)) {
          source = line;
          return;
        }
        if (!distance && DISTANCE_RE.test(line)) {
          distance = line;
          return;
        }
        body.push(line);
      });

    return { body: body.join('\n'), source: source, distance: distance };
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new NearbyAttractionsMapper();
    mapper.initialize();
    global.nearbyAttractionsMapperInstance = mapper;
  });

  global.NearbyAttractionsMapper = NearbyAttractionsMapper;
})(window);
