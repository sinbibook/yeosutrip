/**
 * pages/main.js — t-template-G Main(ABOUT) Page Swiper Initialization
 * main-mapper 가 슬라이드를 만든 뒤 호출된다.
 *
 * 원본 view.html 의 히어로는 index 와 같은 `.visual .swiper-container` 를 쓰므로
 * custom.js 의 첫 번째 swiper 설정을 그대로 따른다.
 */
window.initMainSwipers = function () {
  if (typeof Swiper === 'undefined' || !window.TplSwiper) return;

  window.TplSwiper.init('mainHero', '.sub_visual .swiper-container', {
    loop: true,
    spaceBetween: 0,
    roundLengths: true,
    autoplay: { delay: 4000, disableOnInteraction: false },
    pagination: {
      el: '.sub_visual .swiper-pagination',
      type: 'fraction'
    },
    navigation: {
      nextEl: '.sub_visual .swiper-button-next',
      prevEl: '.sub_visual .swiper-button-prev'
    },
    // 히어로 이미지가 1장뿐이면 화살표 + 카운터 줄째 숨긴다
    lockHide: '.sub_visual .visual_control'
  });
};
