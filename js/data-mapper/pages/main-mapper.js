(function (global) {
  'use strict';

  // .about_img_bnr 한 줄 칸 수 (원본 3칸 그리드)
  var GRID_COLS = 3;

  function MainMapper() {
    BaseDataMapper.call(this);
  }
  MainMapper.prototype = Object.create(BaseDataMapper.prototype);
  MainMapper.prototype.constructor = MainMapper;

  MainMapper.prototype.mapPage = function () {
    this.mapPropertyNames();
    this.mapHero();
    this.mapTitleBox();
    this.mapAboutBlocks();
    this.mapWideImage();

    if (typeof window.initMainSwipers === 'function') window.initMainSwipers();
  };

  // 섹션 배정 — pages.main.sections[0]
  //   hero    → 히어로 슬라이더 이미지 + .sub_title_box 문구
  //   about[] → .about_txt_bnr + .about_img_bnr 한 세트씩 반복
  //
  // 원본은 about.html(펜션소개) / view.html(외부풍경) 두 페이지였다.
  // 데이터에는 그 구분이 없고 about[] 배열 하나뿐이라, 블록 순서가 곧 그 구분이 된다
  // (첫 블록 = 펜션소개, 둘째 블록 = 외부풍경 …). 탭은 만들지 않는다.
  MainMapper.prototype.getSection = function () {
    var page = this.getPages().main;
    return (page && page.sections && page.sections[0]) || {};
  };

  MainMapper.prototype.mapPropertyNames = function () {
    var self = this;
    document.querySelectorAll('[data-property-name-en]').forEach(function (el) {
      el.textContent = self.getPropertyNameEn();
    });
    document.querySelectorAll('[data-property-name]').forEach(function (el) {
      el.textContent = self.getPropertyName();
    });
    this.applyPropertyCaptions();
  };

  // MAPPER: hero.images → .sub_visual 슬라이더 (원본 view.html 규격)
  //
  // 히어로 문구(`About` / `{name} 소개`)는 원본 about.html 것을 고정으로 둔다.
  // 페이지 성격을 알리는 라벨이라 백오피스 값으로 바뀌면 안 된다.
  // hero.title / hero.description 은 아래 .sub_title_box 가 받는다.
  MainMapper.prototype.mapHero = function () {
    var self = this;
    var hero = this.getSection().hero || {};
    var images = this.getSelectedImages(hero.images || []);

    // 히어로가 비면 페이지 최상단이 회색 판이 된다. 외경 사진으로 채운다.
    if (!images.length) {
      images = this.getPropertyImagesByCategory('exterior');
    }

    var wrapper = document.querySelector('[data-main-hero-slides]');
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

  // MAPPER: hero.title / hero.description → .sub_title_box
  // 원본은 `{name} - 펜션 소개` / `펜션 인사말` 두 줄이다. 그 자리를 데이터가 받는다.
  MainMapper.prototype.mapTitleBox = function () {
    var name = this.getPropertyName();
    var hero = this.getSection().hero || {};

    var lead = this.firstText(hero.description, name ? name + ' - 펜션 소개' : '');
    var leadEl = document.querySelector('[data-main-lead]');
    if (leadEl) {
      leadEl.innerHTML = lead ? this.nl2br(lead) : '';
      leadEl.style.display = lead ? '' : 'none';
    }

    var titleEl = document.querySelector('[data-main-title]');
    if (titleEl) titleEl.textContent = this.firstText(hero.title, '펜션 인사말');
  };

  // MAPPER: about[] → `.about_txt_bnr + .about_img_bnr` 세트 반복
  //
  // 원본 about.html / view.html 은 각각 `큰 이미지 + 글` 뒤에 3칸 그리드가 붙고,
  // view.html 맨 아래에만 `.wide_img` 한 장이 있다. 그 구성을 그대로 쌓는다.
  //
  //   .about_txt_bnr (ABOUT)      + .about_img_bnr 3칸   ← 이미지 35% (about.html 규격)
  //   .about_txt_bnr (LANDSCAPE)  + .about_img_bnr 3칸   ← 이미지 60% (view.html 규격)
  //   .wide_img                                          ← 페이지 맨 아래 하나만
  //
  // ⚠️ 세트 수는 **글이 있는 블록 수**로 정한다. 글 없이 이미지만 있는 블록이 흔한데
  //    (실데이터: 4블록 중 2개가 글 없음) 그런 블록까지 세트를 만들면
  //    전폭 이미지 한 장짜리 띠가 세로로 줄줄이 쌓인다.
  //
  // ⚠️ 그리드 이미지는 **블록 경계를 넘어 흐른다.** 글 있는 블록이 자기 그리드를
  //    채울 만큼 사진을 갖고 있는 경우가 드물기 때문이다
  //    (실데이터: ABOUT 1장 / LANDSCAPE 2장). 큰 이미지만 각자 블록 것을 쓰고,
  //    남는 사진은 순서대로 모아 앞 세트의 그리드부터 3칸씩 채운다.
  MainMapper.prototype.mapAboutBlocks = function () {
    var self = this;
    var host = document.querySelector('[data-main-about-blocks]');
    if (!host) return;
    host.innerHTML = '';
    this.wideImageFromPool = null;

    var blocks = this.getSection().about;
    if (!Array.isArray(blocks)) blocks = [];

    var sets = [];
    var pool = [];

    blocks.forEach(function (block, i) {
      block = block || {};
      var images = self.getSelectedImages(block.images || []);
      var label = self.firstText(block.title, self.defaultBlockLabel(i));
      var desc = self.cleanText(block.description);

      if (!label && !desc) {
        pool.push.apply(pool, images); // 글 없는 블록은 사진만 넘긴다
        return;
      }
      sets.push({ image: images[0], label: label, desc: desc });
      pool.push.apply(pool, images.slice(1));
    });

    // 글 있는 블록이 하나도 없어도 한 벌은 만든다 (매핑 위치 안내 placeholder 노출)
    if (!sets.length) {
      sets.push({ image: pool.shift(), label: this.defaultBlockLabel(0), desc: '' });
    }

    // 사진이 하나도 없으면 그리드가 통째로 사라져 배너만 덩그러니 남는다.
    // 블록은 `배너 + 3칸 그리드` 한 세트이므로 빈 상태에서도 세트 모양을 유지한다.
    // (데이터가 있는데 그리드 몫이 모자란 경우는 지금처럼 그리드를 만들지 않는다 —
    //  그건 정상적인 배치이지 매핑 누락이 아니다)
    if (!pool.length) {
      sets.forEach(function (set, order) {
        host.appendChild(self.buildTextBanner(set.image, set.label, set.desc, order));
        host.appendChild(self.buildImageGrid([], GRID_COLS));
      });
      return;
    }

    sets.forEach(function (set, order) {
      host.appendChild(self.buildTextBanner(set.image, set.label, set.desc, order));

      // 마지막 세트는 남은 사진을 전부 받는다 (3의 배수로 줄바꿈)
      var isLast = order === sets.length - 1;
      var take = isLast ? pool.length : Math.min(GRID_COLS, pool.length);
      var slice = pool.splice(0, take);

      // 마지막 줄에 한 장만 남는 배치(4장 → 3+1)를 피하고, 그 한 장은 .wide_img 로 돌린다
      if (isLast && slice.length > 1 && slice.length % GRID_COLS === 1) {
        self.wideImageFromPool = slice.pop();
      }
      if (slice.length) host.appendChild(self.buildImageGrid(slice));
    });
  };

  // 큰 이미지(+파란 오프셋) + 필기체 소제목 + 설명 한 벌.
  //
  // 이미지는 항상 왼쪽이다(원본 about.html / view.html 둘 다 그렇다). 좌우 반전은 없고
  // 대신 **폭 규격**을 번갈아 준다 — 짝수 번째는 about.html 규격(이미지 35%),
  // 홀수 번째는 view.html 규격(`is-wide`, 이미지 60%). 두 페이지를 한 장으로 합친
  // 구성이라 원본의 두 인상을 그대로 재현한다.
  MainMapper.prototype.buildTextBanner = function (image, label, desc, order) {
    var bnr = document.createElement('div');
    bnr.className = 'about_txt_bnr inner';
    if (order % 2 === 1) bnr.classList.add('is-wide');

    var imgBox = document.createElement('div');
    imgBox.className = 'img_box';
    this.setBackground(imgBox, image ? image.url : '', '소개 이미지');

    var txtBox = document.createElement('div');
    txtBox.className = 'txt_box';
    var inner = document.createElement('div');

    if (label) {
      var h4 = document.createElement('h4');
      h4.textContent = label;
      inner.appendChild(h4);
    }
    if (desc) {
      var p = document.createElement('p');
      p.innerHTML = this.nl2br(desc);
      inner.appendChild(p);
    }

    txtBox.appendChild(inner);
    bnr.appendChild(imgBox);
    bnr.appendChild(txtBox);
    return bnr;
  };

  // 3칸 그리드. 4장 이상이면 줄바꿈해 3의 배수로 쌓인다.
  // 1~2장일 때만 원본 33.3% 칸이 남으므로 CSS 가 개수에 맞춰 폭을 잡는다.
  //
  // placeholderCount 를 주면 이미지가 없어도 그 수만큼 빈 칸을 세운다
  // (데이터가 하나도 없을 때 세트 모양을 보여주는 용도).
  MainMapper.prototype.buildImageGrid = function (images, placeholderCount) {
    var self = this;
    var ul = document.createElement('ul');
    ul.className = 'about_img_bnr inner';

    if (!images.length && placeholderCount) {
      for (var i = 0; i < placeholderCount; i++) {
        var cell = document.createElement('li');
        ImageHelpers.applyBackgroundPlaceholder(cell, '소개 이미지');
        ul.appendChild(cell);
      }
      return ul;
    }

    if (images.length < GRID_COLS) ul.setAttribute('data-count', images.length);
    images.forEach(function (img) {
      var li = document.createElement('li');
      self.setBackground(li, img.url, '소개 이미지');
      ul.appendChild(li);
    });
    return ul;
  };

  // 원본 about.html / view.html 의 필기체 소제목을 순서대로 기본값으로 쓴다.
  // 그 뒤 블록은 라벨을 만들 근거가 없어 비워 둔다(h4 는 비면 여백만 남는다).
  MainMapper.prototype.BLOCK_LABELS = ['Greetings', 'Landscape'];

  MainMapper.prototype.defaultBlockLabel = function (index) {
    return this.BLOCK_LABELS[index] || '';
  };

  // MAPPER: 페이지 맨 아래 .wide_img
  //
  // about[] 이 다 쓰고 남은 첫 이미지를 쓴다. 남는 게 없으면 숙소 외경 → 대표 사진 순.
  // 셋 다 없으면 영역째 숨긴다 — 마무리 장식이라 placeholder 를 깔 자리가 아니다.
  MainMapper.prototype.mapWideImage = function () {
    var wrap = document.querySelector('[data-main-wide-img]');
    if (!wrap) return;
    var img = wrap.querySelector('img');

    var url = this.pickWideImageUrl();
    if (!url || !img) {
      wrap.style.display = 'none';
      return;
    }
    wrap.style.display = '';
    img.src = url;
    img.alt = this.getPropertyName() || '';
  };

  MainMapper.prototype.pickWideImageUrl = function () {
    // 그리드 마지막 줄에 혼자 남을 뻔한 이미지가 있으면 그걸 쓴다
    if (this.wideImageFromPool && this.wideImageFromPool.url) {
      return this.wideImageFromPool.url;
    }
    var picked = this.pickPropertyImage(['exterior', 'thumbnail']);
    return picked ? picked.url : '';
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new MainMapper();
    mapper.initialize();
    global.mainMapperInstance = mapper;
  });

  global.MainMapper = MainMapper;
})(window);
