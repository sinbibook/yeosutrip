/**
 * pages/facility.js — t-template-G Facility Page Swiper Initialization
 * facility-mapper 가 슬라이드를 만든 뒤 호출된다.
 *
 * 원본 special1~9.html 의 히어로는 view.html / room 상세와 같은 `.sub_visual` 슬라이더다.
 * 하단 콜라주(.special_img_bnr ul)는 Swiper 가 아니라 정적 3칸 그리드다.
 */
window.initFacilitySwipers = function () {
  if (typeof Swiper === 'undefined' || !window.TplSwiper) return;

  window.TplSwiper.init('specialHero', '.sub_visual .swiper-container', {
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
