/**
 * pages/index.js — t-template-G Index Page Swiper Initialization
 * index-mapper 가 슬라이드를 만든 뒤 호출된다.
 *
 * 원본 custom.js 의 swiper / swiper2 / swiper4 세 개에 대응한다.
 * .main_special 은 원본에서도 Swiper 가 아니라 정적 그리드라 초기화 대상이 없다.
 */
window.initIndexSwipers = function () {
  if (typeof Swiper === 'undefined' || !window.TplSwiper) return;

  // 히어로 — 원본 custom.js 의 swiper.
  // fraction 페이지네이션(1 / 16)과 좌우 화살표가 .visual_control 안에 함께 있다.
  window.TplSwiper.init('indexVisual', '.main_visual .swiper-container', {
    loop: true,
    spaceBetween: 0,
    roundLengths: true,
    autoplay: { delay: 4000, disableOnInteraction: false },
    pagination: {
      el: '.main_visual .swiper-pagination',
      type: 'fraction'
    },
    navigation: {
      nextEl: '.main_visual .swiper-button-next',
      prevEl: '.main_visual .swiper-button-prev'
    },
    // 히어로 이미지가 1장뿐이면 화살표·카운터 줄을 통째로 숨긴다
    lockHide: '.main_visual .visual_control'
  });

  // 객실 미리보기 — 원본 custom.js 의 swiper2.
  // initRoomList 가 playbeach breakpoints(최대 2열)로 열 수와 loop 를 정한다.
  //
  // 화살표를 붙이지 않는다. playbeach / 아라마루 둘 다 .main_room 에 .arw 마크업이 없고
  // 드래그(grabCursor)로만 넘긴다. style.css 의 .main_room .arw 규칙은 공용 원본 시트에
  // 남아 있는 미사용 규칙이다.
  //
  // 대신 autoplay 를 켠다. 화살표가 없으면 "넘길 수 있다"는 신호가 사라지는데,
  // 슬라이드가 스스로 움직이면 그 역할을 대신한다.
  // (playbeach 는 autoplay 가 없지만 아라마루가 화살표 없이 autoplay 만 쓴다)
  window.TplSwiper.initRoomList('indexRoom', '.room_list .swiper-container', {
    autoplay: { delay: 4000, disableOnInteraction: false }
  });

  // 숙소 소개 — 원본 custom.js 의 swiper4 (fade, 2.5초 autoplay, 컨트롤 없음)
  window.TplSwiper.init('indexAbout', '.main_about .swiper-container', {
    loop: true,
    effect: 'fade',
    spaceBetween: 0,
    roundLengths: true,
    autoplay: { delay: 2500, disableOnInteraction: false }
  });
};
