(function (global) {
  'use strict';

  function LayoutMapMapper() {
    BaseDataMapper.call(this);
  }
  LayoutMapMapper.prototype = Object.create(BaseDataMapper.prototype);
  LayoutMapMapper.prototype.constructor = LayoutMapMapper;

  // 섹션 배정 — pages.layoutMap.sections[0]
  //   hero  → .sub_wide_visual 배경 (원본은 슬라이더가 아니라 고정 배경 한 장)
  //   about → .wide_img 배치도 (여러 장 가능)
  LayoutMapMapper.prototype.getSection = function () {
    var page = this.getPages().layoutMap;
    return (page && page.sections && page.sections[0]) || null;
  };

  LayoutMapMapper.prototype.mapPage = function () {
    var section = this.getSection();

    // enabled=false (또는 섹션 자체가 없음) → 404 리다이렉트.
    // 헤더의 "미리보기" li 도 header-footer-mapper 가 같은 기준으로 숨긴다.
    if (!section || section.enabled === false) {
      window.location.href = '404.html';
      return;
    }

    this.mapPropertyNames();
    this.mapHeroBg();
    this.renderRoomNav('[data-room-list-nav]', null);
    this.renderRoomSlides('[data-room-list-slides]');
    this.mapRoomIntro();
    this.mapLayoutImages();

    if (typeof window.initLayoutMapSwipers === 'function') window.initLayoutMapSwipers();
  };

  LayoutMapMapper.prototype.mapPropertyNames = function () {
    var self = this;
    document.querySelectorAll('[data-property-name-en]').forEach(function (el) {
      el.textContent = self.getPropertyNameEn();
    });
    document.querySelectorAll('[data-property-name]').forEach(function (el) {
      el.textContent = self.getPropertyName();
    });
    this.applyPropertyCaptions();
  };

  // MAPPER: hero → .sub_wide_visual (배경 + 문구)
  //
  // 문구는 백오피스에서 사용자가 채우는 영역이라 슬롯을 열어 두고
  // 비었을 때만 원본 문구(`Room Preview` / `객실미리보기`)로 떨어진다.
  // 히어로가 비면 객실 사진 pool 로 채운다. 서브 히어로가 회색 판이면 페이지가 죽는다.
  LayoutMapMapper.prototype.mapHeroBg = function () {
    var self = this;
    var section = this.getSection() || {};
    var hero = section.hero || {};

    document.querySelectorAll('[data-layout-hero-title]').forEach(function (el) {
      el.textContent = self.firstText(hero.title, 'Room Preview');
    });
    document.querySelectorAll('[data-layout-hero-description]').forEach(function (el) {
      el.innerHTML = self.nl2br(self.firstText(hero.description, '객실미리보기'));
    });

    var el = document.querySelector('[data-layout-hero]');
    if (!el) return;

    var url = this.getFirstSelectedImage(hero.images || []);

    if (!url) url = this.firstRoomImageUrl();
    if (!url) {
      var picked = this.pickPropertyImage(['exterior', 'thumbnail']);
      url = picked ? picked.url : '';
    }
    this.setBackground(el, url, 'Hero Image');
  };

  // 객실 썸네일 pool — 히어로 폴백용. 등록된 객실 순서대로 첫 장을 찾는다.
  LayoutMapMapper.prototype.firstRoomImageUrl = function () {
    var self = this;
    var url = '';
    this.getRoomtypes().some(function (rt) {
      var thumb = self.getRoomThumbUrl(rt);
      if (thumb) {
        url = thumb;
        return true;
      }
      return false;
    });
    return url;
  };

  // MAPPER: .main_room .title_box — 원본 문구 고정 (index 와 같은 규격)
  LayoutMapMapper.prototype.mapRoomIntro = function () {
    document.querySelectorAll('[data-layout-room-title]').forEach(function (el) {
      el.textContent = "Room's Preview";
    });
    document.querySelectorAll('[data-layout-room-description]').forEach(function (el) {
      el.textContent = '객실안내';
    });
  };

  // MAPPER: about → .wide_img 배치도
  //
  // 원본은 배치도 이미지가 한 장이지만(`<img src="layout.webp">`) 숙소에 따라
  // 동/층별로 여러 장을 올린다. isSelected 순서대로 **전부** 세로로 쌓는다.
  //
  // 이미지가 없어도 영역을 유지하고 placeholder 를 세운다.
  // 배치도는 이 페이지의 본 목적이라, 비었다고 숨기면 페이지가 객실 목록만 남는다.
  // (room.html 의 평면도는 부가 정보라 반대로 숨긴다)
  LayoutMapMapper.prototype.mapLayoutImages = function () {
    var self = this;
    var section = this.getSection() || {};
    var about = section.about || {};
    var name = this.getPropertyName();

    document.querySelectorAll('[data-layout-map-title]').forEach(function (el) {
      el.textContent = self.firstText(about.title, "Room's Layout");
    });
    document.querySelectorAll('[data-layout-map-description]').forEach(function (el) {
      var desc = self.firstText(about.description, name ? name + ' 객실 배치도' : '객실 배치도');
      el.innerHTML = self.nl2br(desc);
    });

    var host = document.querySelector('[data-layout-map-images]');
    if (!host) return;
    host.innerHTML = '';

    var images = this.getSelectedImages(about.images || []);
    if (!images.length) {
      var ph = document.createElement('img');
      ImageHelpers.applyPlaceholder(ph, '객실 배치도');
      host.appendChild(ph);
      return;
    }

    images.forEach(function (image) {
      var img = document.createElement('img');
      img.src = image.url;
      img.alt = self.cleanText(image.description) || (name ? name + ' 객실 배치도' : '객실 배치도');
      host.appendChild(img);
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new LayoutMapMapper();
    mapper.initialize();
    global.layoutMapMapperInstance = mapper;
  });

  global.LayoutMapMapper = LayoutMapMapper;
})(window);
