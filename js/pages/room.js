/**
 * pages/room.js — t-template-G Room Detail Page Swiper Initialization
 * room-mapper 가 슬라이드를 만든 뒤 호출된다.
 *
 * 원본 room.html?room_id= 의 히어로는 view.html 과 같은 `.sub_visual` 슬라이더다.
 * 갤러리(.room_img_bnr)는 Swiper 가 아니라 정적 3칸 ul 두 줄이다.
 */
window.initRoomSwipers = function () {
  if (typeof Swiper === 'undefined' || !window.TplSwiper) return;

  window.TplSwiper.init('roomHero', '.sub_visual .swiper-container', {
    loop: true,
    spaceBetween: 0,
    roundLengths: true,
    autoplay: { delay: 4000, disableOnInteraction: false },
    pagination: { el: '.sub_visual .swiper-pagination', type: 'fraction' },
    navigation: {
      nextEl: '.sub_visual .swiper-button-next',
      prevEl: '.sub_visual .swiper-button-prev'
    },
    lockHide: '.sub_visual .visual_control'
  });
};
