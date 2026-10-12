(function (global) {
  'use strict';

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function setAllHtml(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.innerHTML = value;
    });
  }

  function IndexMapper() {
    BaseDataMapper.call(this);
  }
  IndexMapper.prototype = Object.create(BaseDataMapper.prototype);
  IndexMapper.prototype.constructor = IndexMapper;

  IndexMapper.prototype.mapPage = function () {
    this.mapPropertyNames();
    this.mapHero();
    this.mapBanner('bnr01', 'essence');
    this.mapBanner('bnr02', 'signature');
    this.mapRoomIntro();
    this.mapRoomSlides();
    this.mapAbout();
    this.mapReserve();
    this.mapSpecialIntro();
    this.mapSpecialList();
    this.mapClosing();

    if (typeof window.initIndexSwipers === 'function') window.initIndexSwipers();
  };

  // 섹션 배정 — pages.index.sections[0]
  //   hero      → .main_visual   (히어로 슬라이더 + 문구)
  //   essence   → .main_bnr01    (이미지 배너 1)
  //   signature → .main_bnr02    (이미지 배너 2)
  //   gallery   → .main_about    (숙소 소개 + 슬라이더)
  //   closing   → .main_wide_bg  (마무리 문구 + 고정 배경)
  //
  // 블록 5개가 모두 배정되어 .main_room / .main_special 헤딩에는 남는 블록이 없다.
  // 두 헤딩은 원본 문구를 기본값으로 두고 숙소명만 끼워 넣는다.
  IndexMapper.prototype.getSection = function () {
    var page = this.getPages().index;
    return (page && page.sections && page.sections[0]) || {};
  };

  IndexMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // MAPPER: hero → .main_visual
  //
  // 원본은 대제목에 jquery.textillate 글자 단위 애니메이션(.move_txt)을 건다.
  // 플러그인 2개(lettering + textillate)를 더 싣는 값이 없어 클래스째 뺐다.
  //
  // 제목은 hero.title → 영문 숙소명 순으로 떨어진다.
  // 설명은 폴백 없이 hero.description 만 쓰고, 비면 <p> 째 숨긴다.
  // (property.subtitle 로 폴백하면 백오피스에서 의도적으로 비운 값을 되살려 버린다)
  IndexMapper.prototype.mapHero = function () {
    var self = this;
    var hero = this.getSection().hero || {};
    var images = this.getSelectedImages(hero.images || []);

    setAllText('[data-index-hero-title]', this.firstText(hero.title, this.getPropertyNameEn()));

    var desc = this.cleanText(hero.description);
    document.querySelectorAll('[data-index-hero-description]').forEach(function (el) {
      if (desc) {
        el.innerHTML = self.nl2br(desc);
        el.style.display = '';
      } else {
        el.textContent = '';
        el.style.display = 'none';
      }
    });

    var wrapper = document.querySelector('[data-index-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, 'Hero Image');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      self.setBackground(slide, img.url, 'Hero Image');
      wrapper.appendChild(slide);
    });
  };

  // MAPPER: essence → .main_bnr01 / signature → .main_bnr02
  //
  // 두 배너는 좌우 배치만 다른 같은 구조다(이미지 2장 + 영문 소제목 + 본문).
  // 이미지가 한 장도 없으면 배너를 통째로 숨긴다 — 빈 500px 상자 두 개가
  // 남는 것보다 섹션을 건너뛰는 편이 낫다.
  //
  // 이미지가 한 장뿐이면 img02 만 숨기고 img01 은 남긴다.
  // (원본 레이아웃에서 img01 이 먼저 오고 본문이 그 옆에 붙는다)
  IndexMapper.prototype.mapBanner = function (slot, sectionKey) {
    var self = this;
    var block = this.getSection()[sectionKey] || {};
    var images = this.getSelectedImages(block.images || []);
    var wrap = document.querySelector('[data-index-' + slot + ']');

    if (!images.length) {
      if (wrap) wrap.style.display = 'none';
      return;
    }
    if (wrap) wrap.style.display = '';

    // 사진이 한 장뿐이면 CSS 가 float 을 풀고 폭을 채운다
    if (wrap) wrap.setAttribute('data-images', Math.min(images.length, 2));

    [0, 1].forEach(function (i) {
      var el = document.querySelector('[data-index-' + slot + '-image' + (i + 1) + ']');
      if (!el) return;
      if (images[i]) {
        el.style.display = '';
        self.setBackground(el, images[i].url, '배너 이미지');
      } else {
        el.style.display = 'none';
      }
    });

    var copy = this.pickBannerCopy(block);

    var titleEl = document.querySelector('[data-index-' + slot + '-title]');
    if (titleEl) {
      titleEl.textContent = copy.eyebrow;
      titleEl.style.display = copy.eyebrow ? '' : 'none';
    }

    var descEl = document.querySelector('[data-index-' + slot + '-description]');
    if (descEl) {
      descEl.innerHTML = copy.body ? this.nl2br(copy.body) : '';
      descEl.style.display = copy.body ? '' : 'none';
    }

    // 두 슬롯이 모두 비면 문구 <p> 째 숨긴다.
    // 원본 <p> 는 padding 3% 를 갖고 있어 빈 채로 두면 이미지 사이가 벌어진다.
    var copyBox = (titleEl || descEl) && (titleEl || descEl).closest('p');
    if (copyBox) copyBox.style.display = copy.eyebrow || copy.body ? '' : 'none';

    this.mapBannerTextBottom(slot, block);
  };

  // MAPPER: 배너 첫 이미지의 description → .text_bottom (배너 하단 장식 문구)
  // 원본의 `Look at the blue sea...` 는 업체 고유 영문 카피인데 섹션에 텍스트 슬롯이
  // 없다(title/description 은 눈썹·본문이 이미 쓴다). 배너 이미지는 <div> 배경이라
  // description 이 alt 로 쓰이지 않으므로 그 자리를 빌린다.
  // (주변여행지 거리 문구가 images[0].description 을 쓰는 것과 같은 규약)
  IndexMapper.prototype.mapBannerTextBottom = function (slot, block) {
    var el = document.querySelector('[data-index-' + slot + '-text-bottom]');
    if (!el) return;

    var images = this.getSelectedImages((block && block.images) || []);
    var text = this.cleanText(images[0] && images[0].description);
    el.innerHTML = text ? this.nl2br(text) : '';
    el.style.display = text ? '' : 'none';
  };

  // 눈썹 문구로 볼 수 있는 최대 길이. "Stay Close To Every Season" = 26자.
  IndexMapper.prototype.BANNER_EYEBROW_MAX = 30;

  // 배너 문구 두 슬롯 배분 — 짧은 쪽이 눈썹, 긴 쪽이 본문.
  //
  // 눈썹 자리(.main_bnr p span)는 Cinzel 40px 한 줄짜리 디스플레이 슬롯이고
  // 본문은 15px 회색 여러 줄이다. 어느 쪽에 무엇이 들어올지 title/description
  // 이름만으로는 정해지지 않는다 — 실제 백오피스 데이터가 블록마다 엇갈린다.
  //
  //   essence : title = 150자 한글 문단  / description = "Stay Close To Every Season"
  //   gallery : title = "Preview"        / description = 빈 값
  //
  // 이름 대신 길이로 가른다. 긴 문단이 40px Cinzel 자리에 들어가 배너를 무너뜨리는
  // 사고가 이름을 잘못 고르는 것보다 훨씬 크게 티가 나기 때문이다.
  //   - 둘 다 있으면 짧은 쪽이 눈썹, 긴 쪽이 본문
  //   - 하나만 있으면 길이로 판단 (30자 이하면 눈썹, 넘으면 본문)
  IndexMapper.prototype.pickBannerCopy = function (block) {
    var a = this.cleanText(block.title);
    var b = this.cleanText(block.description);

    if (a && b) {
      return a.length <= b.length ? { eyebrow: a, body: b } : { eyebrow: b, body: a };
    }

    var only = a || b;
    if (!only) return { eyebrow: '', body: '' };
    return only.length <= this.BANNER_EYEBROW_MAX
      ? { eyebrow: only, body: '' }
      : { eyebrow: '', body: only };
  };

  // MAPPER: .main_room .title_box — 남는 섹션 블록이 없어 원본 문구가 기본값이다
  IndexMapper.prototype.mapRoomIntro = function () {
    setAllText('[data-index-room-title]', "Room's Preview");
    setAllText('[data-index-room-description]', '객실안내');
  };

  // MAPPER: customFields.roomtypes[] → .room_list (base 공용 렌더러)
  // 원본 .room_list 마크업(a.link + .img > img + strong + p + em)이
  // gjyeoul 과 동일해 renderRoomSlides 를 그대로 쓴다.
  IndexMapper.prototype.mapRoomSlides = function () {
    this.renderRoomSlides('[data-index-room-slides]');
  };

  // MAPPER: gallery → .main_about
  // 이미지는 슬라이더(배경 div), 문구는 우측 파란 박스.
  IndexMapper.prototype.mapAbout = function () {
    var self = this;
    var gallery = this.getSection().gallery || {};
    var name = this.getPropertyName();
    var nameEn = this.getPropertyNameEn();

    setAllText(
      '[data-index-about-title]',
      this.firstText(gallery.title, nameEn ? 'Welcome To ' + nameEn : 'Welcome')
    );

    var desc = this.firstText(
      gallery.description,
      name ? self.withJosa(name, '이/가') + ' 여러분을 기다립니다.' : ''
    );
    setAllHtml('[data-index-about-description]', desc ? this.nl2br(desc) : '');

    var wrapper = document.querySelector('[data-index-about-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    var images = this.getSelectedImages(gallery.images || []);
    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, '숙소 이미지');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      self.setBackground(slide, img.url, '숙소 이미지');
      wrapper.appendChild(slide);
    });
  };

  // MAPPER: .main_special .title_box — 남는 섹션 블록이 없어 원본 문구가 기본값이다
  IndexMapper.prototype.mapSpecialIntro = function () {
    var name = this.getPropertyName();
    setAllText('[data-index-special-title]', 'Pension Point');
    setAllText('[data-index-special-description]', name ? name + '만의 특장점' : '특장점');
  };

  // 메인에 노출할 특장점 카드 수. 원본은 부대시설 9개 중 3개를 손으로 골라
  // 한 줄(31.3% × 3)로 배치한다. 데이터로는 그 큐레이션을 재현할 수 없어
  // displayOrder 앞에서부터 한 줄치만 쓴다. 전체 목록은 facility.html 이 맡는다.
  IndexMapper.prototype.SPECIAL_LIMIT = 3;

  // MAPPER: property.facilities[0..2] → .main_special ul
  //
  // 원본 카드 구조는 base 의 renderSpecialCards(li > a + .img > img + strong + p)와
  // 달라서(li > a + .img_box[배경] + .txt_box > strong) 여기서 직접 만든다.
  //
  // **시설명(strong)만 넣는다.** 시설 설명(description)은 문장 길이가 제각각이라
  // 카드 아래가 들쭉날쭉해지고, 메인에서는 카드 제목만으로 충분하다.
  // 설명은 카드를 눌러 들어가는 facility.html 이 보여준다.
  //
  // 카드가 1~2개면 남는 칸이 생기므로 ul 에 data-count 를 내보내 CSS 가 가운데로 모은다.
  IndexMapper.prototype.mapSpecialList = function () {
    var self = this;
    var facilities = this.getProperty().facilities || [];
    var wrap = document.querySelector('[data-index-special]');
    var ul = document.querySelector('[data-index-special-list]');
    if (!ul) return;
    ul.innerHTML = '';

    var items = [];
    facilities.slice(0, this.SPECIAL_LIMIT).forEach(function (f) {
      var name = self.cleanText(f.name);
      if (!name) return;
      items.push({
        id: f.id,
        name: name,
        url: self.getFirstSelectedImage(f.images || [])
      });
    });

    if (!items.length) {
      if (wrap) wrap.style.display = 'none';
      ul.removeAttribute('data-count');
      return;
    }
    if (wrap) wrap.style.display = '';
    ul.setAttribute('data-count', items.length);

    items.forEach(function (item) {
      var li = document.createElement('li');

      var link = document.createElement('a');
      link.href = './facility.html?id=' + item.id;
      link.setAttribute('aria-label', item.name);

      var imgBox = document.createElement('div');
      imgBox.className = 'img_box';
      self.setBackground(imgBox, item.url, '부대시설 이미지');

      var txtBox = document.createElement('div');
      txtBox.className = 'txt_box';

      var strong = document.createElement('strong');
      strong.textContent = item.name;
      txtBox.appendChild(strong);

      li.appendChild(link);
      li.appendChild(imgBox);
      li.appendChild(txtBox);
      ul.appendChild(li);
    });
  };

  // MAPPER: closing → .main_reserve (예약 유도 문구)
  //
  // 원본 `.main_reserve` 는 `main_about` 과 `main_special` 사이에 있는
  // `큰 한글 문구 + 영문 문구 + 예약 버튼` 블록이다. 숙소가 있는 곳도 없는 곳도 있다.
  // (플레이비치엔 없고, 아라마루엔 있다 — 둘 다 이 템플릿 계열이다)
  //
  // 백오피스에 블록을 새로 팔 수 없으므로 `closing` 의 문구를 여기로 돌린다.
  // 마무리 배너(`.main_wide_bg`)의 문구는 두 숙소가 글자까지 같은 장식 문구라
  // 데이터로 들고 있을 값이 아니다(아래 `mapClosing` 참고).
  //
  // `.main_reserve` 가 없는 숙소에서 크롤러가 마무리 배너(`.main_wide_bg`)의 장식 문구를
  // 대신 담아 오면 영문 숙소명이 30px 한글용 자리에 뜬다. 숙소명과 같은 문구는
  // (공백·대소문자 무시) 쓰지 않는다.
  IndexMapper.prototype.mapReserve = function () {
    var wrap = document.querySelector('[data-index-reserve]');
    if (!wrap) return;

    var closing = this.getSection().closing || {};
    var title = this.cleanText(closing.title);
    var desc = this.cleanText(closing.description);

    if (title && this.isPropertyNameText(title)) title = '';
    if (desc && this.isPropertyNameText(desc)) desc = '';

    // 문구가 없으면 예약 버튼만 남아 뜬금없는 띠가 된다
    if (!title && !desc) {
      wrap.style.display = 'none';
      return;
    }
    wrap.style.display = '';

    var titleEl = document.querySelector('[data-index-reserve-title]');
    if (titleEl) {
      titleEl.innerHTML = title ? this.nl2br(title) : '';
      titleEl.style.display = title ? '' : 'none';
    }

    var descEl = document.querySelector('[data-index-reserve-description]');
    if (descEl) {
      descEl.innerHTML = desc ? this.nl2br(desc) : '';
      descEl.style.display = desc ? '' : 'none';
    }

    // 예약 버튼은 링크가 없어도 남긴다 — 헤더 예약 버튼(`data-booking-link`)과 같은 동작이다.
    // href 는 header-footer 매퍼가 채운다.
  };

  // 공백·대소문자를 무시하고 숙소명(국문/영문)과 같은 문구인지 본다
  IndexMapper.prototype.isPropertyNameText = function (text) {
    var norm = function (v) {
      return String(v || '')
        .replace(/\s+/g, '')
        .toLowerCase();
    };
    var s = norm(text);
    if (!s) return false;
    return s === norm(this.getPropertyName()) || s === norm(this.getPropertyNameEn());
  };

  // MAPPER: closing.images → .main_wide_bg 배경 (문구는 고정)
  //
  // 원본 두 곳의 문구가 숙소명만 빼고 글자까지 같다 —
  // `{영문 숙소명}` + `Thank you for coming. / We hope you had a comfortable and
  // happy time here / and we hope to see you again.` 업체 카피가 아니라 템플릿
  // 장식이라 데이터로 받지 않고 고정한다. 문구를 담을 자리는 `.main_reserve` 다.
  //
  // 배경 이미지가 없으면 섹션을 숨긴다. 이 블록은 이미지가 본체라
  // 회색 placeholder 600px 을 깔면 페이지 끝이 어색해진다.
  IndexMapper.prototype.CLOSING_MESSAGE =
    'Thank you for coming.\nWe hope you had a comfortable and happy time here\nand we hope to see you again.';

  IndexMapper.prototype.mapClosing = function () {
    var closing = this.getSection().closing || {};
    var wrap = document.querySelector('[data-index-closing]');
    var url = this.getFirstSelectedImage(closing.images || []);

    if (!url) {
      if (wrap) wrap.style.display = 'none';
      return;
    }
    if (wrap) {
      wrap.style.display = '';
      wrap.style.backgroundImage = 'url(' + url + ')';
    }

    setAllText(
      '[data-index-closing-title]',
      this.firstText(this.getPropertyNameEn(), this.getPropertyName())
    );

    var descEl = document.querySelector('[data-index-closing-description]');
    if (descEl) descEl.innerHTML = this.nl2br(this.CLOSING_MESSAGE);
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new IndexMapper();
    mapper.initialize();
    global.indexMapperInstance = mapper;
  });

  global.IndexMapper = IndexMapper;
})(window);
