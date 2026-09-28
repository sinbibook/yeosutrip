(function (global) {
  'use strict';

  // .room_img_bnr 는 3칸 ul 두 줄이다
  var GALLERY_ROW = 3;

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function RoomMapper() {
    BaseDataMapper.call(this);
  }
  RoomMapper.prototype = Object.create(BaseDataMapper.prototype);
  RoomMapper.prototype.constructor = RoomMapper;

  RoomMapper.prototype.mapPage = function () {
    this.mapPropertyNames();
    this.mapRoomName();
    this.mapHeroSlides();
    this.renderRoomNav('[data-room-nav]', this.getCurrentRoomId());
    this.mapInfoTable();
    this.mapGallery();
    this.mapWideImage();
    this.mapFloorplan();
    this.mapBookingLink();

    if (typeof window.initRoomSwipers === 'function') window.initRoomSwipers();
  };

  RoomMapper.prototype.mapPropertyNames = function () {
    var self = this;
    document.querySelectorAll('[data-property-name-en]').forEach(function (el) {
      el.textContent = self.getPropertyNameEn();
    });
    document.querySelectorAll('[data-property-name]').forEach(function (el) {
      el.textContent = self.getPropertyName();
    });
    this.applyPropertyCaptions();
  };

  // ── 현재 객실 ──────────────────────────────────────────
  // 원본은 `?room_id=`, 백오피스 preview 는 `?id=` 로 넘어온다. 둘 다 받는다.
  // 값이 없거나 못 찾으면 첫 번째 객실로 떨어진다 (빈 페이지보다 낫다).
  //
  // 그룹 모드일 때 헤더/탭 메뉴는 `getRoomMenuLink()` 가 만든
  // **그룹의 첫 번째 객실 id** 로 들어온다. 그래서 이 페이지는 그룹을 따로 알 필요 없이
  // 언제나 "객실 하나"만 그리면 된다.
  RoomMapper.prototype.getCurrentRoomId = function () {
    var params = new URLSearchParams(window.location.search);
    return params.get('room_id') || params.get('id') || '';
  };

  RoomMapper.prototype.getCurrentRoomtype = function () {
    var id = this.getCurrentRoomId();
    var roomtypes = this.getRoomtypes();
    if (!roomtypes.length) return null;
    if (!id) return roomtypes[0];

    var found = null;
    roomtypes.some(function (rt) {
      if (String(rt.id) === String(id)) {
        found = rt;
        return true;
      }
      return false;
    });
    return found || roomtypes[0];
  };

  RoomMapper.prototype.mapRoomName = function () {
    var rt = this.getCurrentRoomtype();
    setAllText('[data-room-name]', rt ? this.getRoomtypeName(rt) : '');

    // 제목 윗줄에 그룹명을 넣어 `그룹 > 객실` 위계를 드러낸다.
    // 탭 줄에 `스파동 >` 같은 라벨을 끼우면 링크와 섞여 어색하고,
    // 아랫줄 h3 가 이미 객실명이라 여기에 또 쓰면 중복이다.
    //   그룹 안  : `{숙소명} - 스파동`
    //   그룹 밖  : `{숙소명} - 객실안내`
    var name = this.getPropertyName();
    var group = rt ? this.getRoomGroupName(rt) : '';
    setAllText('[data-room-lead]', (name ? name + ' - ' : '') + (group || '객실안내'));
  };

  // MAPPER: roomtype_interior → .sub_visual 슬라이더
  // 히어로가 비면 썸네일 → 객실 외경 순으로 떨어진다.
  RoomMapper.prototype.getHeroImages = function (rt) {
    if (!rt) return [];
    var list = this.getRoomtypeImages(rt, 'roomtype_interior');
    if (list.length) return list;
    list = this.getRoomtypeImages(rt, 'roomtype_thumbnail');
    if (list.length) return list;
    return this.getRoomtypeImages(rt, 'roomtype_exterior');
  };

  RoomMapper.prototype.mapHeroSlides = function () {
    var self = this;
    var wrapper = document.querySelector('[data-room-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    var images = this.getHeroImages(this.getCurrentRoomtype());
    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, '객실 이미지');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      self.setBackground(slide, img.url, '객실 이미지');
      wrapper.appendChild(slide);
    });
  };

  // MAPPER: rooms[] 상세값 → .price_table (PC/모바일 두 벌)
  //
  // roomtypes[i] 는 `{ id, images }` 뿐이라 인원/평형/집기는 최상위 rooms[] 에서
  // 같은 id 로 찾아 온다. 값이 없는 칸은 '-' 로 채운다 — 표 칸이 비면 행이 무너진다.
  RoomMapper.prototype.mapInfoTable = function () {
    var rt = this.getCurrentRoomtype();
    var room = rt ? this.findRoomById(rt.id) : null;
    var dash = '-';

    setAllText('[data-room-base-occupancy]', (room && room.baseOccupancy) || dash);
    setAllText('[data-room-max-occupancy]', (room && room.maxOccupancy) || dash);
    setAllText('[data-room-structure]', this.formatRoomStructure(room) || dash);

    // toPyeong() 이 '평' 까지 붙여서 돌려준다
    setAllText('[data-room-size]', (room && this.toPyeong(room.size)) || dash);

    // 집기품목은 배열로 온다. 비면 줄째 숨긴다 ("집기품목 : " 만 남지 않게)
    var amenities = (room && room.amenities) || [];
    var text = Array.isArray(amenities) ? amenities.filter(Boolean).join(', ') : '';
    document.querySelectorAll('[data-room-amenities-wrap]').forEach(function (el) {
      el.style.display = text ? '' : 'none';
    });
    setAllText('[data-room-amenities]', text);
  };

  // MAPPER: 객실 사진 → .room_img_bnr 3칸 한 줄
  //
  // 크롤러가 원본 `.room_img_bnr` 사진을 **`roomtype_exterior`** 에 담는다.
  // 히어로(`roomtype_interior`)와 창고가 갈리므로 히어로 재생 순서를 건드리지 않는다.
  // 크롤이 없거나 그 카테고리가 비면 히어로 앞 3장으로 떨어진다.
  //
  // **칸 수는 3칸 한 줄로 고정한다.** 원본은 두 줄(6장)인 숙소도 한 줄(3장)인 숙소도
  // 있는데 어느 쪽인지 알려줄 신호가 없다. 적은 쪽에 맞춘다.
  RoomMapper.prototype.mapGallery = function () {
    var self = this;
    var rt = this.getCurrentRoomtype();

    var ext = rt ? this.getRoomtypeImages(rt, 'roomtype_exterior') : [];
    var pool = ext.length
      ? ext.slice(0, GALLERY_ROW)
      : this.getHeroImages(rt).slice(0, GALLERY_ROW);

    // 사진이 하나도 없으면 줄이 통째로 사라져 표 아래가 비어 버린다.
    // 이 영역은 `3칸 한 줄` 이 한 세트이므로 빈 상태에서도 세트 모양을 유지한다.
    // (1~2장뿐이면 CSS `ul[data-count]` 가 그 수에 맞춰 칸 폭을 나눈다)
    fillRow('[data-room-gallery-top]', pool, !pool.length);

    function fillRow(selector, images, placeholder) {
      var ul = document.querySelector(selector);
      if (!ul) return;
      ul.innerHTML = '';

      if (!images.length && placeholder) {
        ul.style.display = '';
        ul.setAttribute('data-count', GALLERY_ROW);
        for (var i = 0; i < GALLERY_ROW; i++) {
          var cell = document.createElement('li');
          ImageHelpers.applyBackgroundPlaceholder(cell, '객실 이미지');
          ul.appendChild(cell);
        }
        return;
      }

      // 줄을 채울 사진이 없으면 ul 째 숨긴다 (빈 3칸 회색 상자 방지)
      ul.style.display = images.length ? '' : 'none';
      ul.setAttribute('data-count', images.length);
      images.forEach(function (img) {
        var li = document.createElement('li');
        self.setBackground(li, img.url, '객실 이미지');
        ul.appendChild(li);
      });
    }
  };

  // MAPPER: 페이지 맨 아래 마무리 사진 (.wide_img)
  //
  // 원본은 이 자리에 사진 한 장을 손으로 지정해 뒀다. 그리드와 같은
  // `roomtype_exterior` 안에서 **위치로 가른다** — 그리드가 앞 3장, 마무리는 마지막 한 장.
  //
  //   1. roomtype_exterior 의 마지막 장 (3장을 넘길 때만)
  //   2. property.images[0].exterior  숙소 전경
  //   3. property.images[0].thumbnail 마지막 안전망
  //   없으면 영역째 숨김 (마무리 장식이라 placeholder 를 깔 자리가 아니다)
  //
  // ⚠️ 3장 이하면 1번을 건너뛴다. 원본 그리드가 3장뿐이고 `.wide_img` 가 없는 숙소는
  //    exterior 가 딱 3장이라, 마지막 장을 쓰면 그리드와 같은 사진이 두 번 나온다.
  RoomMapper.prototype.mapWideImage = function () {
    var wrap = document.querySelector('[data-room-wide-img]');
    if (!wrap) return;
    var img = wrap.querySelector('img');

    var rt = this.getCurrentRoomtype();
    var ext = rt ? this.getRoomtypeImages(rt, 'roomtype_exterior') : [];
    var url = ext.length > GALLERY_ROW ? ext[ext.length - 1].url : '';

    if (!url) {
      var picked = this.pickPropertyImage(['exterior', 'thumbnail']);
      url = picked ? picked.url : '';
    }

    if (!url || !img) {
      wrap.style.display = 'none';
      return;
    }
    wrap.style.display = '';
    img.src = url;
    img.alt = rt ? this.getRoomtypeName(rt) : '';
  };

  // MAPPER: 객실 평면도 → .wide_img[data-room-floorplan-wrap]
  //
  // 크롤러가 원본 객실 상세의 평면도 영역에서 찾은 이미지(category 가 floorplan 계열)만
  // 쓴다. 일반 객실 사진으로 폴백하지 않는다 — 평면도 자리에 인테리어 사진이 들어가면
  // 잘못된 정보가 된다.
  //
  // 평면도는 부가 정보라 없으면 **제목까지 영역째 숨긴다.**
  // (layout-map 의 배치도는 그 페이지의 본 목적이라 반대로 자리를 유지한다)
  RoomMapper.prototype.mapFloorplan = function () {
    var self = this;
    var rt = this.getCurrentRoomtype();
    var images = rt ? this.getRoomFloorplanImages(rt) : [];

    var wrap = document.querySelector('[data-room-floorplan-wrap]');
    if (wrap) wrap.style.display = images.length ? '' : 'none';

    var host = document.querySelector('[data-room-floorplan-images]');
    if (!host) return;
    host.innerHTML = '';
    if (!images.length) return;

    var name = rt ? this.getRoomtypeName(rt) : '';
    images.forEach(function (image) {
      var img = document.createElement('img');
      img.src = image.url;
      img.alt = self.cleanText(image.description) || (name ? name + ' 평면도' : '객실 평면도');
      host.appendChild(img);
    });
  };

  // 예약 버튼은 매퍼가 만든 게 아니라 정적 마크업이지만, header-footer-mapper 의
  // 실행 순서에 기대지 않도록 여기서도 직접 href 를 넣는다.
  RoomMapper.prototype.mapBookingLink = function () {
    var url = this.getBookingUrl();
    if (!url || url === '#!') return;
    document.querySelectorAll('.room_img_bnr [data-booking-link]').forEach(function (el) {
      el.href = url;
      el.setAttribute('target', '_blank');
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new RoomMapper();
    mapper.initialize();
    global.roomMapperInstance = mapper;
  });

  global.RoomMapper = RoomMapper;
})(window);
