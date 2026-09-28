/**
 * pages/layout-map.js — t-template-G Layout Map Page Swiper Initialization
 * layout-map-mapper 가 슬라이드를 만든 뒤 호출된다.
 *
 * 원본 room.html 목록의 객실 슬라이더는 index 의 `.room_list` 와 같은 규격이다
 * (custom.js 의 swiper2 하나가 두 페이지를 함께 담당한다).
 * 히어로는 고정 배경이라 Swiper 가 없다.
 */
window.initLayoutMapSwipers = function () {
  if (typeof Swiper === 'undefined' || !window.TplSwiper) return;

  window.TplSwiper.initRoomList('layoutRoom', '.room_list .swiper-container', {
    autoplay: { delay: 4000, disableOnInteraction: false }
  });
};
