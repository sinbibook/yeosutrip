(function (global) {
  'use strict';

  // .special_img_bnr ul 은 3칸 콜라주
  var GALLERY_COLS = 3;

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function FacilityMapper() {
    BaseDataMapper.call(this);
  }
  FacilityMapper.prototype = Object.create(BaseDataMapper.prototype);
  FacilityMapper.prototype.constructor = FacilityMapper;

  FacilityMapper.prototype.mapPage = function () {
    this.mapPropertyNames();
    this.mapTitles();
    this.mapHeroSlides();
    this.mapNav();
    this.mapTexts();
    this.mapGallery();

    if (typeof window.initFacilitySwipers === 'function') window.initFacilitySwipers();
  };

  FacilityMapper.prototype.mapPropertyNames = function () {
    var self = this;
    document.querySelectorAll('[data-property-name-en]').forEach(function (el) {
      el.textContent = self.getPropertyNameEn();
    });
    document.querySelectorAll('[data-property-name]').forEach(function (el) {
      el.textContent = self.getPropertyName();
    });
    this.applyPropertyCaptions();
  };

  // ── 현재 시설 ──────────────────────────────────────────
  // 원본은 시설당 파일 하나(special1~9.html)였다. 템플릿은 한 파일 + `?id=` 다.
  // id 가 없거나 못 찾으면 첫 번째 시설로 떨어진다 (빈 페이지보다 낫다).
  FacilityMapper.prototype.getFacilities = function () {
    return this.getProperty().facilities || [];
  };

  FacilityMapper.prototype.getCurrentId = function () {
    var params = new URLSearchParams(window.location.search);
    return params.get('id') || params.get('facility_id') || '';
  };

  FacilityMapper.prototype.getCurrentFacility = function () {
    var list = this.getFacilities();
    if (!list.length) return null;
    var id = this.getCurrentId();
    if (!id) return list[0];

    var found = null;
    list.some(function (f) {
      if (String(f.id) === String(id)) {
        found = f;
        return true;
      }
      return false;
    });
    return found || list[0];
  };

  // 백오피스가 시설별로 만드는 페이지. 만들지 않으면 pages.facility 가 [] 로 온다.
  // 그 경우 아래 슬롯들은 전부 폴백(원본 문구 / facilities[] 값)으로 떨어진다.
  FacilityMapper.prototype.getFacilitySection = function (facility) {
    if (!facility) return {};
    var pages = this.getPages().facility;
    if (!Array.isArray(pages)) return {};

    var found = {};
    pages.some(function (page) {
      if (String(page && page.facilityId) !== String(facility.id)) return false;
      found = (page.sections && page.sections[0]) || {};
      return true;
    });
    return found;
  };

  // 시설 이미지 pool.
  // 백오피스가 시설 페이지를 만들지 않으면 pages.facility 가 [] 로 오므로
  // facilities[].images 가 사실상 유일한 소스다.
  FacilityMapper.prototype.getFacilityImages = function (facility) {
    if (!facility) return [];
    var pool = [];
    var seen = {};

    var section = this.getFacilitySection(facility);
    ['hero', 'about'].forEach(function (key) {
      ((section[key] && section[key].images) || []).forEach(function (img) {
        if (img && img.url && !seen[img.url]) {
          seen[img.url] = 1;
          pool.push(img);
        }
      });
    });

    this.getSelectedImages(facility.images || []).forEach(function (img) {
      if (img && img.url && !seen[img.url]) {
        seen[img.url] = 1;
        pool.push(img);
      }
    });
    return pool;
  };

  // MAPPER: 시설명 → 히어로 / 대제목
  //
  // ⚠️ 히어로는 원본 special1~9.html 이 아니라 **원본 room.html 상세 구조**를 따른다.
  //
  //   원본 special : <strong>Private Swimming Spa</strong> + <p>개별 스위밍 스파</p>
  //   원본 room    : <p>Room Info</p> + <strong>여름(오션뷰)</strong>
  //
  // 같은 사이트인데 반대다. special 은 영문명이 있다는 전제로 짠 구조이고,
  // room 은 영문명이 없어서 영문 라벨을 작은 줄에 두고 한글을 큰 줄에 올린 것이다.
  // 백오피스 facilities[] 에는 영문명 필드가 없어 우리 상황이 room 과 같으므로
  // `Special Info`(작은 줄, 고정) + 한글 시설명(큰 줄) 배치를 쓴다.
  // 목록에서 들어온 상세 페이지라는 성격이 room.html 과 같아 `Room Info` 와 짝을 맞췄다.
  // (눈썹 라벨이 이미 `Special 01` 을 쓰므로 히어로까지 `Special` 이면 한 페이지에
  //  같은 단어가 두 번 나온다)
  FacilityMapper.prototype.mapTitles = function () {
    var f = this.getCurrentFacility() || {};
    var name = this.cleanText(f.name);
    var nameEn = this.cleanText(f.nameEn);

    // 백오피스에서 사용자가 채우는 자리라 슬롯을 열어 두고, 비면 폴백으로 떨어진다
    var hero = this.getFacilitySection(f).hero || {};

    setAllText('[data-facility-label]', this.firstText(hero.description, 'Special Info'));
    setAllText('[data-facility-title]', this.firstText(hero.title, nameEn, name));
    setAllText('[data-facility-name]', name);
    setAllText('[data-facility-eyebrow]', this.getEyebrow(f));
  };

  // `.special_img_bnr .txt strong` 은 Allura 필기체 자리다.
  //
  // 원본은 시설 영문명(Private Swimming Spa)을 올리는데, 백오피스 facilities[] 에
  // 영문명 필드가 없다. 한글 시설명을 넣으면 두 가지가 동시에 무너진다.
  //   1) 바로 위 h3 와 같은 문구가 두 번 나온다 (공용수영장 / 공용수영장)
  //   2) Allura 에 한글 글리프가 없어 고딕으로 떨어져 필기체 느낌이 사라진다
  //
  // 그래서 `Special 01` 순번 라벨로 대신한다. 라틴이라 Allura 가 그대로 살아난다.
  // (index 의 특장점 카드도 같은 이유로 순번 라벨을 쓴다)
  FacilityMapper.prototype.EYEBROW_LABEL = 'Special';

  FacilityMapper.prototype.getEyebrow = function (facility) {
    var nameEn = this.cleanText(facility && facility.nameEn);
    if (nameEn) return nameEn; // 영문명이 내려오면 원본대로 그것을 쓴다

    var index = 0;
    this.getFacilities().some(function (f, i) {
      if (facility && String(f.id) === String(facility.id)) {
        index = i;
        return true;
      }
      return false;
    });
    return this.EYEBROW_LABEL + ' ' + ('0' + (index + 1)).slice(-2);
  };

  FacilityMapper.prototype.mapHeroSlides = function () {
    var self = this;
    var wrapper = document.querySelector('[data-facility-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    var images = this.getFacilityImages(this.getCurrentFacility());
    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, '부대시설 이미지');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      self.setBackground(slide, img.url, '부대시설 이미지');
      wrapper.appendChild(slide);
    });
  };

  // MAPPER: property.facilities[] → .sub_cate_wrap 탭 (전 시설)
  FacilityMapper.prototype.mapNav = function () {
    var self = this;
    var current = this.getCurrentFacility();
    document.querySelectorAll('[data-facility-nav]').forEach(function (ul) {
      ul.innerHTML = '';
      self.getFacilities().forEach(function (f) {
        var name = self.cleanText(f.name);
        if (!name) return;
        var li = document.createElement('li');
        if (current && String(f.id) === String(current.id)) li.className = 'on';
        var a = document.createElement('a');
        a.href = './facility.html?id=' + f.id;
        a.textContent = name;
        a.title = name;
        li.appendChild(a);
        ul.appendChild(li);
      });
    });
  };

  // MAPPER: description / usageGuide → .special_img_bnr .txt
  //
  //   em (20px, 아래 `· · ·` 장식) ← description  — 한 줄 소개 카피
  //   p  (14px 본문)               ← usageGuide   — 이용 요금·시간·제약 등 실제 안내
  //
  // 원본은 세 칸을 이렇게 쓴다 — strong 영문 / em 짧은 제목 / p 본문.
  //
  //   <strong> Private Swimming Spa
  //   <em>     고급스러움이오션뷰로 즐기는 스위밍 스파!
  //   <p>      멋진 바다를 바라보며 프라이빗하게 즐길 수 있는 …
  //
  // 예전에는 em 에 description, p 에 usageGuide 를 넣었다. 운영자가
  // description 을 한 줄 카피로 쓴다는 전제였는데, 크롤 데이터는 description 에
  // 본문이 통째로 들어온다. 그래서 본문 세 줄이 헤드라인 크기로 나오고
  // 정작 작은 칸은 비어 있었다 (usageGuide 가 없거나, 블록 매칭 시설은
  // 블록 content = 이용안내 체크리스트가 설명 자리에 나왔다).
  //
  // em 에는 시설명을 넣어 원본의 "짧은 제목" 자리를 지키고, p 가 본문을 받는다.
  // p 는 description(소개문) + usageGuide(이용안내)를 한 줄 띄워 **둘 다** 보여준다.
  // 폴백이면 description 이 있을 때 이용 요금·시간·제약이 통째로 묻힌다.
  // 값이 없는 슬롯은 숨긴다 — em 은 `· · ·` 장식만, p 는 빈 줄만 남기 때문이다.
  /** 소개문 + 이용안내를 한 줄 띄워 잇는다. 한쪽만 있으면 그것만 쓴다. */
  function joinBodyGuide(body, guide) {
    return (body || '') + (body && guide ? '\n\n' : '') + (guide || '');
  }

  FacilityMapper.prototype.mapTexts = function () {
    var self = this;
    var f = this.getCurrentFacility() || {};

    var fields = [
      ['[data-facility-catch]', this.cleanText(f.name)],
      ['[data-facility-description]', joinBodyGuide(this.cleanText(f.description), this.cleanText(f.usageGuide))]
    ];

    fields.forEach(function (pair) {
      var value = pair[1];
      document.querySelectorAll(pair[0]).forEach(function (el) {
        el.innerHTML = value ? self.nl2br(value) : '';
        el.style.display = value ? '' : 'none';
      });
    });
  };

  // MAPPER: 시설 이미지 → .special_img_bnr ul (3칸 콜라주)
  //
  // 히어로가 pool 전량을 쓰므로 콜라주는 **뒤쪽 3장**을 가져와 겹침을 줄인다.
  // 3장 이하면 앞에서부터 쓴다(그때는 어차피 전부 겹친다).
  // 1~2장이면 원본 33.3% 칸이 남으므로 CSS 가 data-count 로 폭을 다시 잡는다.
  FacilityMapper.prototype.mapGallery = function () {
    var self = this;
    var ul = document.querySelector('[data-facility-gallery]');
    if (!ul) return;
    ul.innerHTML = '';

    var pool = this.getFacilityImages(this.getCurrentFacility());
    var images = pool.length > GALLERY_COLS ? pool.slice(pool.length - GALLERY_COLS) : pool.slice();

    if (!images.length) {
      ul.setAttribute('data-count', 1);
      var li = document.createElement('li');
      ImageHelpers.applyBackgroundPlaceholder(li, '부대시설 이미지');
      ul.appendChild(li);
      return;
    }

    ul.setAttribute('data-count', images.length);
    images.forEach(function (img) {
      var el = document.createElement('li');
      self.setBackground(el, img.url, '부대시설 이미지');
      ul.appendChild(el);
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new FacilityMapper();
    mapper.initialize();
    global.specialMapperInstance = mapper;
  });

  global.FacilityMapper = FacilityMapper;
})(window);
