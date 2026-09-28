(function (global) {
  'use strict';

  function ReservationMapper() {
    BaseDataMapper.call(this);
  }
  ReservationMapper.prototype = Object.create(BaseDataMapper.prototype);
  ReservationMapper.prototype.constructor = ReservationMapper;

  ReservationMapper.prototype.mapPage = function () {
    this.mapPropertyNames();
    this.mapHero();
    this.mapBlocks();
  };

  // 섹션 배정 — pages.reservation.sections[0]
  //   hero  → .sub_wide_visual 배경 (문구는 매핑하지 않는다)
  //   about → 첫 안내 블록의 제목(h3) / 윗줄(p)
  //
  // 히어로 문구(`Reservation` / `{name} 이용안내`)는 페이지 성격 라벨이라 고정한다.
  // 본문 제목은 백오피스에서 사용자가 채우는 영역이라 슬롯을 열어 두고,
  // 비었을 때만 원본 문구로 떨어진다.
  ReservationMapper.prototype.getSection = function () {
    var page = this.getPages().reservation;
    return (page && page.sections && page.sections[0]) || {};
  };

  ReservationMapper.prototype.mapPropertyNames = function () {
    var self = this;
    document.querySelectorAll('[data-property-name-en]').forEach(function (el) {
      el.textContent = self.getPropertyNameEn();
    });
    document.querySelectorAll('[data-property-name]').forEach(function (el) {
      el.textContent = self.getPropertyName();
    });
    this.applyPropertyCaptions();
  };

  // MAPPER: hero.images[0] → .sub_wide_visual 배경
  // 원본은 객실 사진 한 장을 깔아 뒀다. 문구는 하드코딩이라 매핑하지 않는다.
  ReservationMapper.prototype.mapHero = function () {
    var section = this.getSection();
    var el = document.querySelector('[data-reservation-hero]');
    if (!el) return;
    var url =
      this.getFirstSelectedImage((section.hero && section.hero.images) || []) ||
      this.getFirstSelectedImage((section.about && section.about.images) || []);

    if (!url) {
      var picked = this.pickPropertyImage(['exterior', 'thumbnail', 'commonArea', 'surrounding']);
      url = picked ? picked.url : '';
    }
    this.setBackground(el, url, 'Hero Image');
  };

  // ── 안내 블록 ───────────────────────────────────────────
  // 원본은 `dl.info_box` 안에 `dt.sub_title_box`(제목) + `dd`(본문) 쌍이 두 벌이다.
  //
  //   유의사항  ← property.checkInOutInfo + usageGuide + reservationGuide
  //   환불규정  ← property.refundPolicies[] + refundSettings.customerRefundNotice
  //
  // 내용이 없는 블록은 **만들지 않는다.** 제목만 남은 빈 상자가 어색하다.
  ReservationMapper.prototype.mapBlocks = function () {
    var self = this;
    var host = document.querySelector('[data-reservation-blocks]');
    if (!host) return;
    host.innerHTML = '';

    var about = this.getSection().about || {};

    // 첫 블록의 제목(h3)과 윗줄(p)은 백오피스가 채울 수 있게 열어 둔다.
    var blocks = [
      {
        lead: this.cleanText(about.description),
        title: this.firstText(about.title, '유의사항'),
        body: this.buildGuideText()
      },
      { title: '환불규정', body: this.buildRefundText() }
    ];

    blocks.forEach(function (block) {
      if (!block.body) return;
      host.appendChild(self.buildBlock(block.title, block.body, block.lead));
    });

    // 둘 다 비면 안내 페이지가 통째로 빈다. 매핑 위치 안내를 남긴다.
    if (!host.children.length) {
      host.appendChild(this.buildBlock('이용안내', '등록된 이용안내가 없습니다.'));
    }
  };

  ReservationMapper.prototype.buildBlock = function (title, body, lead) {
    var frag = document.createDocumentFragment();

    var dt = document.createElement('dt');
    dt.className = 'sub_title_box';
    var p = document.createElement('p');
    var name = this.getPropertyName();
    p.innerHTML = this.nl2br(this.firstText(lead, (name ? name + ' - ' : '') + '이용안내'));
    var h3 = document.createElement('h3');
    h3.textContent = title;
    dt.appendChild(p);
    dt.appendChild(h3);

    var dd = document.createElement('dd');
    dd.innerHTML = this.nl2br(body);

    frag.appendChild(dt);
    frag.appendChild(dd);
    return frag;
  };

  // 유의사항 본문 조립.
  //
  // ⚠️ `usageGuide` 가 입퇴실 안내를 통째로 포함하는 경우가 흔하다.
  //    이미 들어 있으면 `checkInOutInfo` 를 앞에 다시 붙이지 않는다.
  //    `reservationGuide` 도 `usageGuide` 뒷부분과 겹치는 경우가 흔해 같은 검사를 한다.
  ReservationMapper.prototype.buildGuideText = function () {
    var prop = this.getProperty();
    var usage = this.cleanText(prop.usageGuide);
    var parts = [];

    var checkInOut = this.cleanText(prop.checkInOutInfo);
    if (checkInOut && !this.contains(usage, checkInOut)) parts.push(checkInOut);
    if (usage) parts.push(usage);

    var reservation = this.cleanText(prop.reservationGuide);
    if (reservation && !this.contains(usage, reservation)) parts.push(reservation);

    return parts.join('\n\n');
  };

  // 공백 차이를 무시하고 포함 여부를 본다 (줄바꿈/들여쓰기만 다른 중복이 흔하다)
  ReservationMapper.prototype.contains = function (haystack, needle) {
    if (!haystack || !needle) return false;
    var norm = function (s) {
      return String(s).replace(/\s+/g, '');
    };
    return norm(haystack).indexOf(norm(needle)) !== -1;
  };

  // 환불규정 조립 — refundPolicies[] 는 { refundProcessingDays, refundRate } 배열이다.
  // 일수 내림차순으로 정렬해 원본과 같은 문장으로 만든다.
  //
  //   days > 0, rate >= 100  → `* 이용일 {days}일전 취소시 전액 환불`
  //   days > 0, 0 < rate     → `* 이용일 {days}일전 취소시 {rate}% 환불`
  //   days === 0             → `* 이용일 당일 취소시 …`
  //   rate === 0             → `… 환불 불가`
  ReservationMapper.prototype.buildRefundText = function () {
    var prop = this.getProperty();
    var policies = (prop.refundPolicies || []).slice().sort(function (a, b) {
      return Number(b.refundProcessingDays) - Number(a.refundProcessingDays);
    });

    var lines = policies.map(function (policy) {
      var days = Number(policy.refundProcessingDays);
      var rate = Number(policy.refundRate);
      var when = days > 0 ? '이용일 ' + days + '일전 취소시' : '이용일 당일 취소시';
      var result = rate >= 100 ? '전액 환불' : rate > 0 ? rate + '% 환불' : '환불 불가';
      return '* ' + when + ' ' + result;
    });

    var notice = this.cleanText((prop.refundSettings || {}).customerRefundNotice);
    var text = lines.join('\n');
    if (notice) text = text ? text + '\n\n' + notice : notice;
    return text;
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.previewHandler) return;
    var mapper = new ReservationMapper();
    mapper.initialize();
    global.reservationMapperInstance = mapper;
  });

  global.ReservationMapper = ReservationMapper;
})(window);
