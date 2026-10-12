# Data Mapping 정의서 — t-template-G

`standard-template-data.json` 기준 HTML의 `data-*` 속성 매핑 정의.

원본 디자인: [playbeach.kr](https://playbeach.kr/) (동일 계열 대조: [아라마루.kr](https://xn--oi2b00agtk07a.kr/))

두 사이트는 같은 트립일레븐/makehome 원본의 동일 디자인이다. CSS 셀렉터가 사실상 겹치고
(양쪽 고유 셀렉터가 각 5개 안팎), 갈리는 값은 브랜드 블루와 영문 대제목 서체 두 축뿐이라
전부 `styles/theme.css` 토큰으로 뽑았다. playbeach 쪽이 섹션이 더 많고 최신이라
(메인 이미지 배너 2종, 카카오 플로팅, 예약 아이콘 특가 배지, 부대시설 9종) playbeach 를 정본으로 삼는다.

베이스 인프라는 **t-template-E2**에서 가져왔다. E2도 같은 트립일레븐 계열이라
HTML 골격(`#wrap > #header.header`, `#container > #content`, 그 뒤 `.footer_wrap`)이 동일하고
`base-mapper` / `preview-handler` / `popup` / `kakao-maps-sdk` 를 그대로 쓴다.

## 진행 현황

| 구분   | 파일                                                                                                                     | 상태                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| 공통   | `styles/theme.css` (토큰 5개)                                                                                            | 완료                  |
| 공통   | `styles/reset.css` (playbeach 원본 이식 + 토큰화)                                                                        | 완료                  |
| 공통   | `styles/style.css` (playbeach 원본 전체 이식 + 템플릿 확장)                                                              | 완료                  |
| 공통   | `styles/popup.css` (A/B/C2/D2/E2 공통본)                                                                                 | 완료                  |
| 공통   | `js/` 인프라 (`base-mapper` / `preview-handler` / `image-helpers` / `popup` / `kakao-maps-sdk` / `header-footer-loader`) | E2 복사본 그대로 사용 |
| 공통   | `common/header.html` + `header-footer-mapper.js`                                                                         | 완료                  |
| 공통   | `common/footer.html`                                                                                                     | 완료                  |
| 공통   | `js/common.js` (원본 `custom.js` UI 동작 + `TplSwiper`)                                                                  | 완료                  |
| 페이지 | `index.html` + `index-mapper.js` + `pages/index.js`                                                                      | 완료                  |
| 페이지 | `main.html` + `main-mapper.js` + `pages/main.js`                                                                         | 완료                  |
| 페이지 | `layout-map.html` + `layout-map-mapper.js` + `pages/layout-map.js`                                                       | 완료                  |
| 페이지 | `room.html` + `room-mapper.js` + `pages/room.js`                                                                         | 완료                  |
| 페이지 | `facility.html` + `facility-mapper.js` + `pages/facility.js`                                                             | 완료                  |
| 페이지 | `reservation.html` + `reservation-mapper.js`                                                                             | 완료                  |
| 페이지 | `nearby-attractions.html` + `nearby-attractions-mapper.js`                                                               | 완료                  |
| 페이지 | `directions.html` + `directions-mapper.js`                                                                               | 완료                  |
| 페이지 | `404.html`                                                                                                               | 공통본 그대로 사용    |

> 전 페이지 이관 완료. 남은 작업은 **색상·서체 토큰 확정**(아래 「테마 색상/폰트」의 미결 항목)이다.

---

## 작업 순서

1. ~~공통 (`common/header.html` / `common/footer.html` / `js/common.js`)~~ — 완료
2. ~~`index.html`~~ — 완료
3. ~~`main.html` — 원본 `about.html` + `view.html` 병합~~ — 완료
4. ~~`layout-map.html` — 원본 `room.html` 목록~~ — 완료
5. ~~`room.html` — 원본 `room.html?room_id=`~~ — 완료
6. ~~`facility.html` — 원본 `special1~9.html`~~ — 완료
7. ~~`reservation.html` — 원본 `reservation.html`~~ — 완료
8. ~~`nearby-attractions.html` — 원본 `travel.html`~~ — 완료
9. ~~`directions.html` — 원본 `traffic.html`~~ — 완료

각 페이지 작업 단위는 아래 4개를 한 세트로 처리한다.

- HTML: playbeach 원본 마크업 + `data-*` 속성
- mapper: `js/data-mapper/pages/{page}-mapper.js`
- 스크립트: `js/pages/{page}.js` (Swiper 초기화, 원본 selector 기준)
- 이 문서의 해당 섹션

---

## 구현 원칙

A/B/C2/D2/E2 와 동일하다.

- 파일명과 JS 구조는 우리 템플릿 구조를 따른다. 원본 `about.html`, `view.html`, `special1~9.html`, `travel.html`, `traffic.html` 파일명은 쓰지 않는다.
- 페이지 링크는 GitHub Pages 하위 경로 배포를 위해 상대경로(`./xxx.html`)만 쓴다.
- 이미지·아이콘 등 템플릿 고정 에셋은 `images/` 에 둔다. 원본 도메인(`/assets/...`) 직접 참조 금지.
- **로고는 고정 저장하지 않는다.** `homepage.images[0].logo[isSelected]` → 숙소명 텍스트 → placeholder 3단 폴백.
- **객실 목록의 단일 소스는 `homepage.customFields.roomtypes`** 다. `BaseDataMapper.getRoomtypes()` 가 localhost/preview 두 경로를 모두 처리하므로 페이지 매퍼는 이 메서드만 쓴다.
  최상위 `rooms[]` 는 `roomtypes[i].id === rooms[j].id` 매칭으로 인원/평형/집기 등 **상세값을 조회할 때만** 사용한다.
- 각 페이지 mapper 는 `js/preview-handler.js` 의 `mapperConfig` 에 등록한다. 초기화 주체는 `preview-handler` 이고, 페이지 매퍼의 `DOMContentLoaded` 핸들러는 `if (window.previewHandler) return;` 로 빠진다.
- **렌더 게이트**: 각 HTML `<head>` 에 `html.tpl-loading body{opacity:0}` + `window.__tplReveal`(3초 타임아웃)을 둔다. 매핑 완료 시 해제해 placeholder 깜빡임(FOUC)을 막는다.
- **원본의 장식용 하드코딩 텍스트는 그대로 둔다.** 모든 영역을 매핑하지 않는다.
- 값이 비어 있으면(`''` 또는 공백 한 칸) `firstText()` 가 `trim()` 후 판단해 다음 폴백으로 넘어간다.
- Swiper 초기화는 `TplSwiper.init()` / `TplSwiper.initRoomList()` 를 거친다. 슬라이드가 `slidesPerView` 보다 적으면 `loop` 를 자동으로 끄고, `new Swiper()` 가 실패해도 같은 페이지의 다른 슬라이더 초기화를 막지 않는다.
- 넘길 슬라이드가 없으면 화살표 영역을 숨긴다 (`lockHide` 옵션). 아래 **슬라이더 화살표 자동 숨김** 참조.
- 평면도/배치도는 크롤러가 평면도 영역에서 찾은 이미지(`category` 가 `floorplan` 계열)만 쓴다. 일반 객실 사진으로 폴백하지 않는다.

### 원본에서 가져오지 않은 것

| 원본                                                         | 이유                                                                               |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `aos.js` + `data-aos` 속성                                   | 스크롤 등장 애니메이션. E2 도 가져오지 않았다. 라이브러리 하나를 더 싣는 값이 없다 |
| `jquery.lettering.js` + `jquery.textillate.js` (`.move_txt`) | 히어로 대제목 글자 단위 애니메이션. 플러그인 2개를 더 싣는 값이 없어 클래스째 뺐다 |
| `board.js` / `board_black.css`                               | 예약 게시판. 템플릿은 실시간 예약 링크만 쓴다                                      |
| `#talk_custom_button` (카카오 상담 플로팅)                   | bookingplay `tid` 하드코딩이라 데이터로 만들 수 없다                               |
| `animate.css`                                                | `textillate` 전용 의존성                                                           |

---

## 슬라이더 화살표 자동 숨김 (`lockHide`)

슬라이드가 한 화면에 다 들어와 넘길 게 없으면 화살표 영역을 숨긴다.
`TplSwiper.init()` 에 `lockHide: '<선택자>'` 를 넘기면 된다.

Swiper 의 `watchOverflow`(기본 on)가 그 상태를 `isLocked` 와 `lock` / `unlock` 이벤트로 알려준다.
**브레이크포인트마다 `slidesPerView` 가 달라 잠김 여부가 바뀌므로** `resize` 에도 다시 판정한다.

| 페이지       | 대상                           | 비고                                               |
| ------------ | ------------------------------ | -------------------------------------------------- |
| `index.html` | `.main_visual .visual_control` | 히어로가 1장이면 화살표 + `1 / N` 카운터 줄째 숨김 |
| `index.html` | `.main_room .arw`              | 객실이 한 화면에 다 들어오면 PREV / NEXT 숨김      |

`.main_room .arw` 는 `margin:-30px 0 80px` 을 갖고 있어 숨기면 여백이 사라진다.
화살표를 쓰는 곳이 `.visual_control`(`position:absolute`) 하나뿐이라 숨겨도 흐름에 영향이 없다.

---

## 원본 페이지 → 템플릿 파일명

| 원본 (playbeach.kr)        | 템플릿                    | 데이터 소스                                  |
| -------------------------- | ------------------------- | -------------------------------------------- |
| `index.html`               | `index.html`              | `pages.index.sections[0]`                    |
| `about.html` + `view.html` | `main.html` (병합)        | `pages.main.sections[0]`                     |
| `room.html` 목록           | `layout-map.html`         | `pages.layoutMap.sections[0]`                |
| `room.html?room_id=`       | `room.html?room_id=`      | `pages.room[]` + `rooms[]`                   |
| `special1~9.html`          | `facility.html?id=`       | `pages.facility[]` + `property.facilities[]` |
| `reservation.html`         | `reservation.html`        | `pages.reservation.sections[0]`              |
| `travel.html`              | `nearby-attractions.html` | `pages.nearbyAttractions.sections[0]`        |
| `traffic.html`             | `directions.html`         | `pages.directions.sections[0]`               |
| —                          | `404.html`                | 공통본                                       |

원본 객실 id 참고 — playbeach: `22684~22687` (4실) / 아라마루: `25072~25078` (7실).

---

## 레이아웃 규약

**`#container` 에 상단 여백을 주지 않는다.** `.hd_inner` 가 `position:absolute` 라
`.header` 자체 높이가 0 이고, 히어로 위에 겹쳐 뜨는 디자인이다.

| 폭          | `.header`                                     | 겹침             |
| ----------- | --------------------------------------------- | ---------------- |
| 1024px 이상 | `position:fixed` + `rgba(43,44,48,.2)` 반투명 | 히어로 위        |
| 1023px 이하 | `position:absolute`                           | 히어로 위 (동일) |

E2 는 1023px 이하에서 헤더가 흰 배경 + 흐름 안으로 들어가 `updateContainerOffset()` 로
`padding-top` 을 줬지만, playbeach 는 두 구간 모두 겹치므로 **그 로직을 제거했다.**

### `#header.on` 은 스크롤 상태가 아니다

⚠️ 원본에서 `.on` 은 **LNB 패널 열림** 을 뜻한다.

```css
.header.on .hd_inner {
  transform: translateY(-100%);
} /* 상단 바가 위로 밀려남 */
.header.on .hd_lnb {
  transform: translateY(0);
} /* 흰 메뉴 패널이 내려옴 */
```

E2 의 `common.js` 는 `scrollTop > 0` 에서 `.on` 을 붙였다. 그 로직을 남기면
스크롤할 때마다 메뉴가 저절로 열린다. **제거했다.**

`.btn_toggle`(로고 오른쪽 전체를 덮는 투명 버튼) 과 `.btn_lnb_close` 가 `.on` 을 토글한다.

---

## 테마 색상/폰트

`styles/theme.css` 토큰 5개. 토큰 값은 **하나씩만** 두고 폴백은 사용처에서 붙인다
(`font-family: var(--font-en-main), 'Times New Roman', serif`).
폴백 체인을 토큰에 넣으면 백오피스가 값을 교체할 때 지저분해진다.

| 토큰                | 값 (playbeach)  | 아라마루   | 사용처                                                                        |
| ------------------- | --------------- | ---------- | ----------------------------------------------------------------------------- |
| `--color-secondary` | `#1d59a1`       | `#2a68a2`  | `.txt_logo` 배경, `.main_about .txt_box`, 객실 `em`, 특장점 `p`, 표 상단선    |
| `--font-en-main`    | `Cinzel`        | `PT Serif` | `.title_box h3`, `.aside .depth1`, `.main_wide_bg strong`, `.main_bnr p span` |
| `--font-ko-main`    | `Noto Sans KR`  | 동일       | `reset.css` 전역 본문 + 폼 요소                                               |
| `--font-ko-sub`     | `Noto Serif KR` | 동일       | `.hd_lnb .depth1_a`, `.visual .visual_txt`, `.ff_noto_serif`                  |

### 토큰 확정 (전 페이지 이관 후)

전 페이지 이관을 마친 뒤 `style.css` 를 전수 조사해 확정했다.

| 토큰                | 값              | 역할                   | `style.css` 사용                                                          |
| ------------------- | --------------- | ---------------------- | ------------------------------------------------------------------------- |
| `--color-primary`   | `#f5f5f5`       | **밝은 바탕 면**       | 6곳 — `.main_about` / 탭 바 / 표 헤더·줄무늬 / 모바일 표 헤더 / 지도 자리 |
| `--color-secondary` | `#1d59a1`       | **진한 브랜드 포인트** | 9곳 + `404.html` 버튼                                                     |
| `--font-en-main`    | `Cinzel`        | 영문 대제목            | 8곳                                                                       |
| `--font-ko-main`    | `Noto Sans KR`  | 한글 본문              | `reset.css` 전역 본문 + 폼 요소, `style.css` 3곳                          |
| `--font-ko-sub`     | `Noto Serif KR` | 메뉴·히어로 세리프     | 14곳                                                                      |

**`primary` = 밝은 바탕 / `secondary` = 진한 브랜드 포인트** 는 A / B / C2 / D2 / E2 / F / L
및 백오피스 실제 값과 같은 관례다.

| 템플릿 | primary       | secondary     |
| ------ | ------------- | ------------- |
| A      | `#f9f8f6`     | `#c3a87f`     |
| B      | `#faf6f0`     | `#333333`     |
| C2     | `#f5f5f5`     | `#30353e`     |
| E2     | `#fafafa`     | `#333`        |
| L      | `#dbdbdb`     | `#245469`     |
| **G**  | **`#f5f5f5`** | **`#1d59a1`** |

#### `#fff`(34곳)는 토큰으로 빼지 않는다

| 속성         | 곳  | 성격                                                                                    | 처리     |
| ------------ | --- | --------------------------------------------------------------------------------------- | -------- |
| `color`      | 22  | 어두운 면·사진 위 **흰 글자** (헤더 버튼, aside, 푸터, 히어로)                          | 하드코딩 |
| `border`     | 4   | 히어로 위 **흰 테두리**                                                                 | 하드코딩 |
| `background` | 8   | `.hd_lnb` 패널 / `.depth_box` / `.sub_cate_wrap` / 표 셀 / `.main_special` 카드 / hover | 하드코딩 |

앞 둘은 "밝은 바탕 면"이 아니라 **대비를 만드는 반전색**이다. 토큰으로 묶으면
백오피스에서 값을 바꾸는 순간 어두운 배경 위 글자·테두리가 안 보이게 된다.

`background` 8곳은 **흰 지면 위의 흰 면**이라 이것만 바꿔도 지면이 따라오지 않는다.
지면까지 바꾸려면 `body` 배경을 새로 깔아야 하는데(원본은 `body` / `html` / `#wrap`
어디에도 `background` 선언이 **아예 없다** — 지금 흰 배경은 브라우저 기본값이다)
파급이 커서 범위 밖으로 뒀다. 필요해지면 `body { background: var(--color-primary) }`
한 줄이면 된다.

#### primary 가 잡은 6곳

원본이 자리마다 미세하게 다르게 준 옅은 회색(`#f4f4f4` / `#f5f5f5` / `#f8f8f8` / `#fafafa`)을
하나로 통일했다. 명도 차가 6/255 범위라 의도된 디자인 언어라기보다 제작 과정의 편차로 보인다.

```
.main_about                                소개 섹션 배경
.sub_cate_wrap                             탭 바 배경 (반응형)
.table_default th                          표 헤더 셀
.table_default .bg                         표 줄무늬
.table_box.for_m .table_default thead th   모바일 표 헤더
.map_box #kakao-map                        지도 로딩 전 자리
```

#### secondary 는 진한 색 전제다

9곳 중 **3곳이 글자색**이다 (`.room_list em` / `.main_special .txt_box p` /
`.main_about .txt_box a:hover`). 특히 `.main_about .txt_box div` 는
**파란 배경 + 흰 글자** 조합이라 밝은 색으로 바꾸면 글자가 사라진다.
A(`#c3a87f`) / C2(`#30353e`) / L(`#245469`) 도 같은 전제다.

### 서체 재배정

영문 서체 3종은 **그 자리에 한글이 들어올 수 있는지** 를 기준으로 토큰에 배정했다.

| 셀렉터                            | 원본                | 배정      | 이유                                                               |
| --------------------------------- | ------------------- | --------- | ------------------------------------------------------------------ |
| `.main_about .txt_box strong`     | Playfair Display SC | `en-main` | 항상 영문(`Welcome To {nameEn}`). 디스플레이 세리프끼리 성격 일치  |
| `.main_wide_bg p`                 | PT Serif            | `ko-sub`  | 고정 영문 문구지만 `.main_reserve` 와 같은 계열로 묶는다           |
| `.main_special .txt_box strong`   | PT Serif            | `ko-sub`  | 한글 시설명이 들어감                                               |
| `.room_list .swiper-slide strong` | Open Sans           | `ko-main` | 한글 객실명. 이미 실질적으로 Noto Sans KR 로 폴백 중이었음         |
| `.room_list .swiper-slide em`     | Open Sans           | `ko-main` | 12px `Review` 소형 라벨. Cinzel 은 전각 대문자 디스플레이라 부적합 |

그 결과 `reset.css` 의 `@import` 가 **7종 → 4종**으로 줄었다
(`PT Serif` / `Playfair Display SC` / `Open Sans` 제거).

### 하드코딩으로 남긴 것

| 값                                                             | 위치                                                     | 이유                                                                  |
| -------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------- |
| `Charmonman`                                                   | `.about_txt_bnr .txt_box h4` (`Greetings` / `Landscape`) | **필기체 디자인**. 라틴 전용이라 한글이 오면 어차피 깨진다            |
| `Allura`                                                       | `.special_img_bnr .txt strong` (`Special 01`)            | 위와 같음                                                             |
| `#fff` / `#333` / `#666` / `#262626` / `#3e3e3e` / `#dedede` … | 전역                                                     | 무채색 계조. 브랜드색을 바꿔도 본문 가독성·면 대비가 흔들리면 안 된다 |

### 미사용 규칙 정리

마크업이 없어 동작하지 않던 규칙 **12개**를 걷어냈다 (E2 도 같은 처리를 했다).

| 셀렉터                         | 서체             | 사유                                                           |
| ------------------------------ | ---------------- | -------------------------------------------------------------- |
| `.about_txt` (3규칙)           | Charmonman       | 원본 `about.html` 하단 문구. `main.html` 병합 시 제외했다      |
| `.visual .scroll_down` (3규칙) | Playfair Display | **양쪽 원본 어디에도 마크업이 없다.** `@import` 도 원래 없었다 |
| `.main_room .arw` (6규칙)      | Cambria          | playbeach·아라마루 **둘 다 `.arw` 마크업이 없다**(드래그 전용) |

### 색상 원칙

**유채색은 브랜드 블루(`#1d59a1`) 한 계열뿐이다.**
원본의 주황 표 상단선(`#f89725`)도 `--color-secondary` 로 통일했다 —
한 곳짜리 액센트를 따로 두는 것보다 표가 브랜드색을 따라가는 편이 낫다.
경고 문구(`#b00`, `.table_text li.point`)는 마크업이 없어 규칙째 제거했다.

그 결과 `style.css` 에 **하드코딩된 유채색은 하나도 남지 않았다.**

본문·보조 글자색(`#333` / `#666` / `#777` / `#888`)과 테두리(`#dedede` / `#ddd` / `#dcdcdc`)는
무채색 계조라 **하드코딩으로 남긴다.** 백오피스가 브랜드색을 바꿔도 본문 가독성이 흔들리지 않게 하려는 것이다.

### 서체는 5종만 로드한다

`reset.css` 의 원본 `@import` 7종 중 **3종을 걷어냈다**(위 「서체 재배정」 참고).

| 서체          | 사용처                                                                                                                             | 토큰             |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Cinzel        | `.title_box h3`, `.aside .depth1`, `.visual_txt strong`, `.main_bnr p span`, `.main_wide_bg strong`, `.main_about .txt_box strong` | `--font-en-main` |
| Noto Serif KR | `.hd_lnb`, `.sub_visual .visual_txt p`, `.main_wide_bg p`, `.main_special .txt_box strong`, `.ff_noto_serif`                       | `--font-ko-sub`  |
| Noto Sans KR  | `reset.css` 전역 본문 + 폼 요소, `.room_list` 객실명 / `Review`                                                                    | `--font-ko-main` |
| Charmonman    | `.about_txt_bnr .txt_box h4` (main 전용)                                                                                           | 없음 (하드코딩)  |
| Allura        | `.special_img_bnr .txt strong` (special 전용)                                                                                      | 없음 (하드코딩)  |

#### 토큰으로 뽑지 않은 서체

Charmonman / Allura / PT Serif / Playfair Display SC / Open Sans 5종은 **하드코딩으로 남긴다.**

브랜드 서체가 아니라 특정 블록 한두 곳의 장식체다. 특히 **Charmonman·Allura 는
한글 글리프가 없어** 백오피스에서 값이 한글로 들어오면 어차피 고딕으로 떨어진다.
교체 가치가 없는 값을 토큰으로 열면 백오피스 설정 화면만 복잡해진다.

#### 중복 `@import` 해소

한동안 `reset.css` 의 7종이 그대로 있고 `theme.css` 가 그중 셋을 다시 `@import` 해
**같은 서체를 두 번 요청**하고 있었다. 이전 문서는 "웨이트 지정이 달라 남겨 둔다" 고
적었으나 **사실이 아니었다** — 세 URL 모두 `theme.css` 쪽과 웨이트까지 완전히 같았다.

```
reset.css  css2?family=Cinzel&display=swap
reset.css  css2?family=Noto+Serif+KR&display=swap
reset.css  css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap
theme.css  css2?family=Cinzel&family=Noto+Serif+KR&family=Noto+Sans+KR:wght@100;300;400;500;700;900
```

**`reset.css` 에서 그 3줄을 걷어냈다.** `Charmonman` / `Allura` 는 `theme.css` 가 로드하지
않고 `style.css` 가 실제로 쓰므로 `reset.css` 에 남는다.

| 파일        | 로드하는 서체                              |
| ----------- | ------------------------------------------ |
| `theme.css` | Cinzel / Noto Serif KR / Noto Sans KR      |
| `reset.css` | Charmonman / Allura                        |

### `style.css` 정리

원본의 **빈 규칙·빈 미디어쿼리 76개를 제거**했다 (stylelint `block-no-empty`).
E2 도 같은 처리를 해 뒀다. 스타일 규칙은 **494개 전부 이식됐다** (셀렉터 단위 대조 완료).

---

## 고정 에셋 (`images/common/`)

원본 `/assets/images/common/` 에서 받아 온 템플릿 공용 아이콘. **업체 전용 이미지는 받지 않는다.**

| 파일              | 원본                | 크기  | 사용처                                                          |
| ----------------- | ------------------- | ----- | --------------------------------------------------------------- |
| `price.png`       | `reserve_price.png` | 34×34 | 헤더 예약 버튼 특가 배지 (`.res_ico`)                           |
| `mobile_menu.png` | `menu.png`          | 35×40 | 모바일 메뉴 버튼 (`.btn_menu`)                                  |
| `close.png`       | `close.png`         | 20×20 | LNB 패널 닫기 (`.btn_lnb_close`)                                |
| `close2.png`      | `close2.png`        | 17×16 | 모바일 aside 닫기 (`.aside .btn_close`, CSS `background-image`) |
| `talk.png`        | `talk.png`          | 92×91 | 모바일 고정 예약 버튼 (`.ft_btn_reserve`) — E2 와 바이트 동일   |

받지 않은 것:

- `logo.webp` (200×80) — 업체 로고. 백오피스 데이터로 대체.
- `btn_left.png` / `btn_right.png` / `icon.png` / `reser1.png` / `reser2.png` / `scroll.png`
  — E2 잔여 파일이라 **삭제했다.** playbeach 는 히어로 화살표가 이미지가 아니라
  텍스트(`←` / `→`)고, `.scroll_down` 마크업도 예약 아이콘 흑백 전환도 없다.

---

## 공통 슬롯 (전 페이지)

페이지 매퍼가 아니라 `header-footer-mapper` 가 채우는 슬롯이다.

| `data-*`                | 요소        | JSON 경로                                               | 비고                                      |
| ----------------------- | ----------- | ------------------------------------------------------- | ----------------------------------------- |
| `data-page-title`       | `<title>`   | `homepage.seo.title`                                    | 없으면 원래 값 유지                       |
| `data-property-name`    | 임의 텍스트 | `customFields.property.name` → `property.name`          |                                           |
| `data-property-name-en` | 임의 텍스트 | `customFields.property.*NameEn` 6단 → `property.nameEn` | 표기 변형(대소문자)을 모두 받는다         |
| `data-property-caption` | 임의 텍스트 | 속성값이 템플릿 문자열                                  | `{name}` / `{nameEn}` 치환, `\n` → `<br>` |

### SEO 메타 (`updateSEOInfo`)

`homepage.seo` 를 `<head>` 에 upsert 한다. **값이 없으면 태그를 만들지 않는다**(빈 `content` 방지).

| JSON                         | 태그                                     |
| ---------------------------- | ---------------------------------------- |
| `seo.title`                  | `<title data-page-title>`                |
| `seo.description`            | `<meta name="description">`              |
| `seo.keywords`               | `<meta name="keywords">`                 |
| `seo.naverSiteVerification`  | `<meta name="naver-site-verification">`  |
| `seo.googleSiteVerification` | `<meta name="google-site-verification">` |

### 파비콘

`homepage.images[0].logo[isSelected]` 를 `<link rel="icon">` 에 넣는다 — **헤더 로고와 같은 이미지**다.
파비콘 전용 필드는 없다. 로고가 없으면 자리표(`href="data:,"`)가 남는데,
`data:,` 는 빈 데이터 URL 이라 브라우저가 `/favicon.ico` 를 찾지 않는다(404 요청 절약).

---

## 공통 — `common/header.html`

원본은 `.header` 안에 **형제 3개**를 둔다. E2 는 `.hd_lnb` 가 `.hd_inner` 안에 있어 구조가 다르다.

```
.header
├ .hd_inner   — .logo / .hd_right(네이버·인스타·예약·YBS·모바일 메뉴) / .btn_toggle
├ .hd_lnb     — .txt_logo / ul.depth1 / .btn_lnb_close
└ .aside      — 모바일 슬라이드 메뉴
```

메뉴 구성은 원본 6단(ABOUT / ROOMS / SPECIAL / RESERVE / TRAVEL / LOCATION)을 그대로 따른다.
원본 ABOUT 하위의 `외경보기(view.html)` 는 `main.html` 로 병합되므로 `펜션소개` 한 항목만 남겼다.

`header-footer-mapper.js` 는 E2 것을 **수정 없이 그대로 쓴다** (템플릿 공용, 원본 종속 없음).

| `data-*`                              | 요소                                             | JSON 경로                                      | 폴백 / 비고                                                                            |
| ------------------------------------- | ------------------------------------------------ | ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| `data-logo-image`                     | `.logo img`                                      | `homepage.images[0].logo[isSelected].url`      | 없으면 `img` 숨기고 `.logo_text` 노출 → 그것도 없으면 placeholder                      |
| `data-property-name`                  | `.logo .logo_text`, `.hd_lnb .txt_logo a`        | `customFields.property.name` → `property.name` |                                                                                        |
| `data-rooms-submenu`                  | ROOMS `.depth_box` / aside `.depth_list`         | `customFields.roomtypes[]`                     | `미리보기` li 뒤에 `data-generated="room"` 으로 추가                                   |
| `data-special-submenu`                | SPECIAL `.depth_box` / aside `.depth_list`       | `property.facilities[]`                        | 컨테이너를 비우고 전량 생성                                                            |
| `data-booking-link`                   | 헤더 예약 버튼 / RESERVE `depth1_a` / `예약하기` | `property.realtimeBookingId`                   | URL 형태일 때만 `href` 주입, 아니면 `#!` 유지                                          |
| `data-ybs-button` / `data-ybs-wrap`   | `.btn_reserve` (감싼 `span.ybs_wrap`)            | `property.ybsId`                               | 없으면 `span` 째 숨김. 링크는 `https://www.yapen.co.kr/external?ypIdx={ybsId}`         |
| `data-menu-id="layout-map"`           | ROOMS `미리보기` li                              | `pages.layoutMap.sections[0].enabled`          | `false` 면 li 숨김                                                                     |
| `data-travel-menu`                    | TRAVEL `li` / aside 블록                         | `pages.nearbyAttractions.sections[0].enabled`  | `false` 면 숨김                                                                        |
| `data-homepage-socialLinks-blog`      | 헤더 `.hd_sns` / aside `.aside_sns` 네이버 버튼  | `homepage.socialLinks.blog`                    | 없으면(null·빈 문자열·공백·키 없음) 숨김. 둘 다 없으면 래퍼(`data-social-wrap`)째 숨김 |
| `data-homepage-socialLinks-instagram` | 헤더 `.hd_sns` / aside `.aside_sns` 인스타 버튼  | `homepage.socialLinks.instagram`               | 위와 같음                                                                              |

### 네이버·인스타그램 버튼 (`socialLinks`)

기준 사이트(grangnarang · kalcamping · kia-ora · playbeach) 헤더에는 없는 버튼이라 다른 템플릿과 같은
"예약하기 앞" 규칙으로 넣었다. 네이버는 어드민 **blog** 칸(네이버 플레이스 주소)을, 인스타그램은 **instagram** 칸을 쓴다.

- **540px 이상**: `.hd_right` 맨 앞 `[N][인스타] 예약하기 YBS ☰`. 예약하기의 특가 배지(`.res_ico`)가 왼쪽으로 10px
  튀어나와 있어 묶음과 예약하기 사이를 18px 띄운다. 아이콘 32px(≥1024) / 30px(≤1023) / 26px(≤860), 아이콘 사이 8px(≤860 6px).
  인스타 로고(122×126)는 높이만 고정하고 폭은 비율대로(`width:auto`).
- **539px 이하**: 헤더 줄에 자리가 없어(YBS 가 꺼진 사이트도 헤더가 두 줄로 늘어난다) 헤더에서는 숨기고
  **aside 맨 아래**(LOCATION 아래 구분선 + 30px 아이콘 2개)에 보인다.
- PC 에서는 투명한 `.btn_toggle` 이 로고 오른쪽 헤더 전체를 덮으므로 `.hd_sns` 에 `position:relative; z-index:1`
  을 줘야 클릭된다(예약하기와 같은 처리).
- LNB 가 열린 `.header.on` 상태에서는 `.hd_inner` 와 함께 사라진다(예약·YBS 와 같음).
- 마크업은 링크·래퍼 모두 `style="display: none"` 으로 시작하고 `mapSocialLinks()` 가 값이 있을 때만 `href`
  (`target=_blank rel=noopener`)를 넣고 노출한다. 매퍼는 `facebook / instagram / blog / youtube` 4종을 처리하고
  G형 마크업은 blog·instagram 두 개다. 버튼이 하나라도 보이면 루트에 `data-social="on"`, 아니면 `"off"`.
- 어드민 프리뷰 `section_update` 의 `section === 'socialLinks'` 는 `pages[page].sections[0]` 이 아니라
  `homepage.socialLinks` 에 반영하고 헤더 버튼만 다시 매핑한다(`handleSocialLinksUpdate`).

### 서브메뉴 (`.depth_box`)

노출은 **CSS 가 담당**한다 — `.depth1:hover .depth_box { display:block }`.
E2 처럼 클릭 토글이 아니므로 관련 JS 를 걷어냈다.
`common.js` 는 `mouseenter` 에서 **높이 상한만** 계산한다. 객실·시설이 많으면 서브메뉴가
화면 아래로 흘러 내려가므로, 뷰포트를 넘칠 때만 `.is-scroll` 을 붙여 그 박스를 스크롤시킨다.

원본 `.depth_box` 폭 100px 은 백오피스 객실명을 담기엔 좁아 **200px 로 넓히고**
넘치는 이름은 `...` 으로 줄인다(전체 문구는 `title` 속성으로 남김). — 템플릿 확장

### 로고 처리 (원본과 다른 점)

원본은 200×80 고정 로고 파일 하나를 쓰고 데스크톱에 높이를 주지 않는다
(`.header .logo img { height:100% }` → 이미지 원본 크기 그대로).
백오피스 로고는 크기가 제각각이라 그대로 두면 헤더가 무너지므로
**원본과 같은 200×80 상자에 `object-fit:contain` 으로 가뒀다.**

`.btn_toggle { left:200px; width:calc(100% - 200px) }` 도 이 폭 기준이라 값을 맞춰야 한다.

⚠️ `max-width` / `max-height` 만으로는 **가로로 긴 로고가 상자를 넘친다**
(원본 `.logo img{height:100%}` 가 살아 있으면 폭이 비율대로 늘어난다).
상자 크기를 못박고 `object-fit:contain` 으로 안에 맞춘다.

그런데 폭·높이를 고정하면 원본이 좁은 화면에서 주는 로고 높이(70/60/50px)를
덮어쓴다. 확장 블록에서 되살리고 폭도 함께 줄인다 (860↓ 170px / 350↓ 140px).

> ⚠️ **`.logo_text` 의 CSS 기본값을 `display:none` 으로 두면 안 된다.**
> 매퍼는 노출할 때 `style.display = ''` 로 인라인 스타일을 지우는데,
> 그러면 그 `none` 으로 되돌아가 숙소명이 **영영 안 보인다**(로고 영역이 통째로 빈다).
> 기본값은 `block` 이고, 숨길 때만 매퍼가 `display:none` 을 명시한다.

---

## 공통 — `common/footer.html`

| `data-*`                                       | 요소                | JSON 경로                                           | 폴백 / 비고                              |
| ---------------------------------------------- | ------------------- | --------------------------------------------------- | ---------------------------------------- |
| `data-footer-phone-link` / `data-footer-phone` | `.tel > a`          | `property.contactPhone[]`                           | 번호 개수만큼 `a` 를 복제해 `\|` 로 구분 |
| `data-footer-address`                          | `.address p`        | `property.address` → `businessInfo.businessAddress` |                                          |
| `data-footer-business-name`                    | `업체명 :`          | `businessInfo.businessName`                         | 값 없으면 `p` 줄째 숨김                  |
| `data-footer-representative`                   | `대표자 :`          | `businessInfo.representativeName`                   | 값 없으면 `p` 줄째 숨김                  |
| `data-footer-business-number`                  | `사업자번호 :`      | `businessInfo.businessNumber`                       | 값 없으면 `p` 줄째 숨김                  |
| `data-booking-link`                            | `.ft_btn_reserve a` | `property.realtimeBookingId`                        | 모바일 고정 예약 버튼                    |

**원본 푸터에는 로고가 없다.** `[data-footer-logo]` 슬롯을 두지 않았고,
매퍼는 셀렉터가 안 잡히면 그냥 넘어간다.

**`#footer-wrap` 은 `#wrap` 바깥에 둔다(전 페이지).** `#wrap` 에 `max-width:1920px` 이
걸려 있어 안에 두면 1920px 보다 넓은 화면에서 어두운 푸터 배경 양옆에 흰 여백이 생긴다.
(원본도 `#wrap` 안이라 같은 현상이 있다 — 여기서만 바꾼 지점이다.)
푸터 내용은 `.footer.inner` 가 1400px 로 잡으므로 배경만 화면 폭을 채운다.

매핑하지 않는 것:

- `COPYRIGHT©(주)트립일레븐` — `property.tripProviderName` 이 있으면 그 이름으로 치환(아래 「카피라이트」). `개인정보처리방침` — 공통 정책 페이지.
- `#talk_custom_button`(부킹플레이 카톡 상담) — `tid` 하드코딩이라 데이터로 만들 수 없어 제외.

원본 `.tel` 은 링크 없는 텍스트다. 모바일에서 걸 수 있도록 `a` 로 감쌌고,
글자색·크기는 `.tel` 을 그대로 물려받게 `color:inherit / font-size:inherit` 을 줬다. — 템플릿 확장

### 매핑 슬롯 색상 (원본 버그 보정)

`reset.css` 가 `span` 에 `color:#333` 을 **직접** 박아 둬서 상속이 끊긴다.
원본 푸터는 값이 전부 텍스트 노드라 문제가 없었지만, 템플릿은 매핑 슬롯을
`<span data-footer-*>` 로 두기 때문에 어두운 푸터(`#262626`) 위에 `#333` 글자가 되어
**전화번호 · 업체명 · 대표자 · 사업자번호가 배경에 묻힌다.**

```css
.footer_wrap .footer span {
  color: inherit;
}
```

`개인정보처리방침` 은 트립일레븐 공통 정책 페이지로 **하드코딩**한다
(`http://design.trip11.net/privacy/privacy_policy.html`). 업체별로 다르지 않다.

---

## `index.html`

원본 구성:

```
.main_visual   히어로 슬라이더(16장) + 문구 + fraction 카운터
.main_bnr01    이미지 2장 + 영문 소제목 + 본문       (좌 세로 / 우 가로)
.main_bnr02    이미지 2장 + 영문 소제목 + 본문       (우 세로 / 좌 가로)
.main_room     Room's Preview 헤딩 + 객실 카드 슬라이더
.main_about    이미지 슬라이더(3장) + 우측 파란 문구 박스
.main_reserve  큰 한글 문구 + 영문 문구 + 예약 버튼        (숙소에 따라 있고 없다)
.main_special  Pension Point 헤딩 + 특장점 카드 3칸
.main_wide_bg  고정 배경 + 마무리 문구
```

`.main_reserve` 는 플레이비치(이 템플릿의 원본)에는 없고 같은 계열의 아라마루에는 있다.
**크롤러가 원본에서 이 영역을 발견하면 `closing.title` / `closing.description` 에 담는다** —
큰 한글 문구가 `title`, 영문 문구가 `description` 이다. 백오피스에 블록을 새로 팔 수 없어
`closing` 슬롯을 재배정했다. 원본에 없으면 두 값이 비고, 템플릿은 섹션을 숨긴다.

`.main_wide_bg` 문구는 데이터로 받지 않는다. 두 원본의 문구가 숙소명만 빼고 글자까지 같아
업체 카피가 아니라 템플릿 장식이기 때문이다.

```
{영문 숙소명}
Thank you for coming.
We hope you had a comfortable and happy time here
and we hope to see you again.
```

섹션 배정 — `pages.index.sections[0]`

| 섹션 키     | 대응 영역       |
| ----------- | --------------- |
| `hero`      | `.main_visual`  |
| `essence`   | `.main_bnr01`   |
| `signature` | `.main_bnr02`   |
| `gallery`   | `.main_about`   |
| `closing`   | `.main_reserve` |

블록 5개가 모두 배정되어 `.main_room` / `.main_special` 헤딩에는 남는 블록이 없다.
두 헤딩은 원본 문구를 기본값으로 두고 숙소명만 끼워 넣는다.

`closing` 은 **문구만** `.main_reserve` 로 가고, **이미지는** `.main_wide_bg` 배경으로 남는다.
마무리 배너(`.main_wide_bg`)의 문구는 고정이다 — 아래 참고.

| `data-*`                              | 요소                           | JSON 경로                                | 폴백                                               |
| ------------------------------------- | ------------------------------ | ---------------------------------------- | -------------------------------------------------- |
| `data-index-hero-title`               | `.visual_txt strong`           | `hero.title`                             | `customFields.property.nameEn` → `property.nameEn` |
| `data-index-hero-description`         | `.visual_txt p`                | `hero.description`                       | **폴백 없음** — 비면 `<p>` 째 숨김                 |
| `data-index-hero-slides`              | `.main_visual .swiper-wrapper` | `hero.images[isSelected]` (배경 `cover`) | placeholder 슬라이드 1장                           |
| `data-index-bnr01` / `-bnr02`         | `.main_bnr` 래퍼               | —                                        | 이미지가 하나도 없으면 배너째 숨김                 |
| `data-index-bnr01-image1` / `-image2` | `.img01` / `.img02`            | `essence.images[0]` / `[1]`              | 한 장뿐이면 `.img02` 만 숨김                       |
| `data-index-bnr01-title`              | `.main_bnr p span`             | `essence` 의 **짧은 쪽**                 | 아래 **배너 문구 배분**                            |
| `data-index-bnr01-description`        | `.main_bnr p .bnr_desc`        | `essence` 의 **긴 쪽**                   | 둘 다 비면 `<p>` 째 숨김                           |
| `data-index-bnr02-*`                  | 위와 동일                      | `signature`                              |                                                    |
| `data-index-room-title`               | `.main_room h3`                | —                                        | `Room's Preview` **고정**                          |
| `data-index-room-description`         | `.main_room p`                 | —                                        | `객실안내` **고정**                                |
| `data-index-room-slides`              | `.room_list .swiper-wrapper`   | `customFields.roomtypes[]`               | 썸네일 없으면 interior 첫 장 → placeholder         |
| `data-index-about-title`              | `.main_about strong`           | `gallery.title`                          | `Welcome To {nameEn}`                              |
| `data-index-about-description`        | `.main_about p`                | `gallery.description`                    | `{name}이/가 여러분을 기다립니다.`                 |
| `data-index-about-slides`             | `.main_about .swiper-wrapper`  | `gallery.images[isSelected]` (배경)      | placeholder 슬라이드 1장                           |
| `data-index-special-title`            | `.main_special h3`             | —                                        | `Pension Point` **고정**                           |
| `data-index-special-description`      | `.main_special p`              | —                                        | `{name}만의 특장점`                                |
| `data-index-special-list`             | `.main_special ul`             | `property.facilities[0..2]`              | 없으면 섹션째 숨김                                 |
| `data-index-reserve`                  | `.main_reserve`                | —                                        | 문구가 둘 다 없으면 섹션째 숨김                    |
| `data-index-reserve-title`            | `.main_reserve strong`         | `closing.title`                          | 비면 `<strong>` 숨김                               |
| `data-index-reserve-description`      | `.main_reserve p`              | `closing.description`                    | 비면 `<p>` 숨김                                    |
| `data-index-reserve-button`           | `.main_reserve a` 감싸는 `div` | `property.realtimeBookingId`             | 링크가 없어도 노출 (헤더 예약 버튼과 동일)         |
| `data-index-closing`                  | `.main_wide_bg`                | `closing.images[0]` (요소 배경)          | **이미지 없으면 섹션째 숨김**                      |
| `data-index-closing-title`            | `.main_wide_bg strong`         | —                                        | `property.nameEn` → `name` **고정**                |
| `data-index-closing-description`      | `.main_wide_bg p`              | —                                        | `Thank you for coming…` **고정**                   |
| `#popup-container`                    | 팝업                           | `customFields.popup.popups[]`            | `js/popup.js` 가 직접 로드                         |

히어로 설명은 **폴백을 두지 않는다.** `property.subtitle` 로 떨어뜨리면 백오피스에서
의도적으로 비운 값을 되살려 버리기 때문이다. 비면 `<p>` 를 숨긴다.

`.main_about` 의 링크는 `펜션소개 보러가기` 로 `./main.html` 에 간다.
원본 문구는 `외부풍경 보러가기`(→ `view.html`)였는데, `main.html` 이
원본 `about.html`(펜션소개) + `view.html`(외경보기)을 **병합한 페이지**라
외경만 가리키는 문구는 맞지 않는다. 헤더 ABOUT 메뉴도 `펜션소개` 한 항목만 두는 것과 맞춘다.

### 배너 문구 배분 — 길이로 가른다

`.main_bnr p` 는 슬롯이 둘이다.

| 슬롯                   | 스타일             | 성격                 |
| ---------------------- | ------------------ | -------------------- |
| `span` (눈썹)          | Cinzel 40px `#333` | 한 줄짜리 디스플레이 |
| `span.bnr_desc` (본문) | 15px `#666`        | 여러 줄              |

어느 쪽에 무엇이 들어올지 `title` / `description` 이름만으로는 정해지지 않는다.
**실제 백오피스 데이터가 블록마다 엇갈린다.**

```
essence : title = 150자 한글 문단   / description = "Stay Close To Every Season"
gallery : title = "Preview"         / description = 빈 값
```

그래서 이름 대신 **길이로 가른다.** 긴 문단이 40px Cinzel 자리에 들어가 배너를 무너뜨리는
사고가, 이름을 잘못 고르는 것보다 훨씬 크게 티가 나기 때문이다.

- 둘 다 있으면 **짧은 쪽이 눈썹, 긴 쪽이 본문**
- 하나만 있으면 길이로 판단 — 30자 이하면 눈썹, 넘으면 본문

원본 `.main_bnr01` 에는 `.text_bottom`(영문 3줄 장식 문구)이 하나 더 있다.
`Look at the blue sea...` 는 업체 고유 카피라 대응하는 블록 필드가 없다 —
`essence` 블록은 `title` / `description` / `images` 뿐이고 앞의 둘은 이미 눈썹·본문에 썼다.
대신 크롤링으로 채워지는 **`property.subtitle`** 을 넣는다(`사계절 아름다운 홍천강 뷰를 품은 힐링 펜션`).
성격이 같은 한 줄 소개 문구다. 값이 없으면 `<p>` 째 숨긴다.

| 슬롯                           | 위치                       | 소스                | 비고        |
| ------------------------------ | -------------------------- | ------------------- | ----------- |
| `data-index-bnr01-text-bottom` | `.main_bnr01 .text_bottom` | `property.subtitle` | 없으면 숨김 |

### 특장점 카드 (`.main_special`)

원본 카드 구조는 base 의 `renderSpecialCards()` 와 달라서(아래) 매퍼가 직접 만든다.

```html
<!-- 원본 .main_special ul li -->
<li>
  <a href="./facility.html?id={id}"></a>
  <div class="img_box"><!-- 배경 이미지 --></div>
  <div class="txt_box">
    <strong>{시설명}</strong>
    <!-- 원본의 p(설명 줄)는 템플릿에서 만들지 않는다 -->
  </div>
</li>
```

> base 의 `renderSpecialCards()` 는 `li > a + .img > img + strong + p` 구조라
> 여기서는 쓸 수 없다. `facility.html` 작업 때 어느 쪽을 쓸지 다시 판단한다.

원본은 `strong` 이 시설별 영문 카피(`Close To The Beach`), `p` 가 한글 한 줄 소개다.
백오피스 `facilities[]` 스키마에 영문명 필드가 없어 영문 카피를 만들 소스가 없다.

```
facilities[i] = { id, name, description, usageGuide, displayOrder, images }
```

그래서 **한글 시설명을 제목 자리에 올린다.**
`strong` 서체는 로드하지 않는 `PT Serif` 대신 `--font-ko-sub`(Noto Serif KR)로 바꿔
세리프 느낌을 유지하면서 한글이 제대로 나오게 했다. — 템플릿 확장

**시설명만 넣고 시설 설명(`description`)은 넣지 않는다.** — 템플릿 확장
설명은 길이가 제각각이라(한 줄짜리부터 두 문장짜리까지) 카드 아래가 들쭉날쭉해지고,
메인에서는 카드 제목만으로 충분하다. 설명은 카드를 눌러 들어가는 `facility.html` 이 보여준다.
그래서 원본의 `p`(브랜드색 `-` 소개 줄)는 만들지 않는다.

**카드는 최대 3개다.** 원본은 부대시설 9개 중 3개를 손으로 골라 한 줄(`31.3%` × 3)로 배치한다.
데이터로는 그 큐레이션을 재현할 수 없어 `displayOrder` 앞에서부터 한 줄치만 쓴다.
전체 목록은 `facility.html` 이 맡는다.

카드가 1~2개면 왼쪽에 몰려 빈 칸이 남으므로 매퍼가 `ul[data-count]` 를 내보내고
CSS 가 가운데로 모은다 (1개 → 60%, 2개 → 48%). — 템플릿 확장

### Swiper (`js/pages/index.js`)

원본 `custom.js` 의 `swiper` / `swiper2` / `swiper4` 세 개에 대응한다.

| 키            | 대상                             | 옵션                                                                                                                             |
| ------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `indexVisual` | `.main_visual .swiper-container` | `loop`, autoplay 4초, fraction 페이지네이션(`1 / N`), 좌우 화살표. `lockHide: .visual_control`                                   |
| `indexRoom`   | `.room_list .swiper-container`   | `TplSwiper.initRoomList()` — 4개 이하 균등 배치 / 5개 이상 4열 루프. **autoplay 없음**(원본과 동일). `lockHide: .main_room .arw` |
| `indexAbout`  | `.main_about .swiper-container`  | `loop`, `effect:'fade'`, autoplay 2.5초, 컨트롤 없음                                                                             |

**`.main_special` 은 Swiper 가 아니다.** 원본이 정적 그리드라 초기화 대상이 없다.

#### 객실 슬라이더 열 수 — 펜션마루 기준 PC 3열

원본들의 `swiper2` 설정을 비교하면 **1200px 이하는 완전히 같고 PC 열 수만 갈린다.**

|            | playbeach        | 아라마루         | 펜션마루 (정본)  |
| ---------- | ---------------- | ---------------- | ---------------- |
| PC 열 수   | 2                | 3                | **3**            |
| `loop`     | `true`           | `false`          | `false`          |
| `autoplay` | 없음             | `autoplay: true` | `autoplay: true` |
| 861~1200px | 2열              | 2열              | 2열              |
| 479~860px  | 2열              | 2열              | 2열              |
| 280~478px  | 1열              | 1열              | 1열              |

펜션마루(pensionmaru.kr)를 따라 **PC 최대 3열**로 둔다.

객실이 열 수보다 적으면 빈 칸이 생기므로 `TplSwiper.initRoomList()` 가 개수만큼만 배치한다.

| 객실 수 | PC  | 860↓ | 478↓ | `loop` |
| ------- | --- | ---- | ---- | ------ |
| 1       | 1   | 1    | 1    | off    |
| 2       | 2   | 2    | 1    | off    |
| 3       | 3   | 2    | 1    | off    |
| 4 이상  | 3   | 2    | 1    | on     |

**autoplay 는 원본에 없지만 켠다.** 화살표를 뺐더니 "넘길 수 있다"는 신호가 사라져서,
슬라이드가 스스로 움직여 그 역할을 대신하게 했다.
아라마루가 정확히 그 조합(화살표 없음 + autoplay)을 쓴다.

### 템플릿 확장 CSS

| 규칙                                            | 이유                                                                                                                                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.main_bnr p .bnr_desc`                         | 원본 본문은 텍스트 노드였다. 매핑 슬롯을 만들려고 `span` 으로 감쌌더니 `.main_bnr p span` 의 40px Cinzel 이 본문에도 걸려 되돌렸다                                                                |
| `.room_list .swiper-slide .img` 4:3 고정        | 백오피스 썸네일 비율이 제각각이라 카드 높이가 어긋난다                                                                                                                                            |
| `.main_special ul[data-count]`                  | 카드 1~2개일 때 가운데 정렬                                                                                                                                                                       |
| `.main_special ul li .img_box` 반응형 높이      | 원본 `442px` 는 데스크톱 3칸 기준 고정값이라 좁은 화면에서 세로로 길쭉해진다                                                                                                                      |
| `.main_special ul` grid + `li` 세로 flex        | 원본 `inline-block` 은 설명 줄 수가 다르면 카드 아래 테두리가 어긋난다. grid 로 줄 높이를 맞추고 `.txt_box{flex:1}` 로 바닥을 정렬한다. 640px 이하는 원본이 1열 + 사진 위 오버레이라 flex 를 푼다 |
| `.room_list .swiper-slide p` `min-height:1.4em` | 구조 문자열이 비면 라인 박스가 없어 높이가 0 이 되고 그 카드만 `Review` 줄이 위로 올라온다                                                                                                        |

---

## `main.html` (원본 `about.html` + `view.html` 병합)

C2 / D2 / E2 와 같은 방식으로 **탭을 만들지 않고 한 페이지에 이어 붙였다.**
원본 `.sub_cate_wrap`(펜션소개 / 외부풍경 2탭)은 통째로 뺐다 — 헤더 ABOUT 메뉴도
`펜션소개` 한 항목뿐이라 탭이 가리킬 다른 페이지가 없다.

```
.sub_visual (sub1_1)   히어로 슬라이더                  ← hero.images
                       strong `About` / p `{name} 소개`  ← 고정
.sub_title_box         p ← hero.description / h3 ← hero.title
.about_txt_bnr         큰 이미지 + 필기체 소제목 + 설명  ← about[] 중 글 있는 블록 (이미지 35%)
.about_img_bnr           └ 3칸 그리드
.about_txt_bnr           (다음 블록, 이미지 60% — view.html 규격)
.about_img_bnr           └ 3칸 그리드
.wide_img              맨 아래 큰 이미지 한 장 (페이지당 하나)
```

`<section>` 에 **`sub1_1`** 을 준다. 원본 `about.html`(펜션소개)이 쓰던 클래스로,
`.about_txt_bnr` 의 이미지/텍스트 폭이 **35:65** 가 된다. `view.html` 의 `sub1_2` 는
60:40 이라 이미지가 눈에 띄게 넓은데, 실제 사이트에서 인사말 영역은 `about.html` 쪽이다.

`sub1_1` 에는 CSS 규칙이 하나도 없다(전부 기본값). 다만 맨 아래 `.wide_img` 여백만은
원본에서 `sub1_2` 에만 걸려 있어 `.sub_about` 로 옮겨 왔다(`styles/style.css` 확장 섹션).

| `data-*`                 | 요소                          | JSON 경로                                | 폴백                                        |
| ------------------------ | ----------------------------- | ---------------------------------------- | ------------------------------------------- |
| `data-main-hero-slides`  | `.sub_visual .swiper-wrapper` | `hero.images[isSelected]` (배경 `cover`) | `property.images[0].exterior` → placeholder |
| `data-property-caption`  | `.visual_txt p`               | `{name} 소개` **고정**                   | —                                           |
| `data-main-lead`         | `.sub_title_box p`            | `hero.description`                       | `{name} - 펜션 소개`                        |
| `data-main-title`        | `.sub_title_box h3`           | `hero.title`                             | `펜션 인사말`                               |
| `data-main-about-blocks` | 블록 세트 컨테이너            | `about[]`                                | 아래 참조                                   |
| `data-main-wide-img`     | `.wide_img img`               | 아래 참조                                | 없으면 영역째 숨김                          |

히어로 문구(`About` / `{name} 소개`)는 원본 `about.html` 것을 **고정으로 둔다.**
페이지 성격을 알리는 라벨이라 백오피스 값으로 바뀌면 안 된다.
`hero.title` / `hero.description` 은 그 아래 `.sub_title_box` 가 받는다.

### `about[]` 블록 → 세트 반복

블록 하나가 **`.about_txt_bnr`(큰 이미지 + 소제목 + 설명) + `.about_img_bnr`(3칸)** 한 세트다.

| `data-*`            | 요소                    | 소스                                       | 폴백                                                   |
| ------------------- | ----------------------- | ------------------------------------------ | ------------------------------------------------------ |
| —                   | 히어로 `strong` / `p`   | —                                          | `Tour Information` / `{name} 여행지 정보` **고정**     |
| `data-nearby-hero`  | `.sub_wide_visual` 배경 | `hero.images[0]`                           | 여행지 사진 → `surrounding` → `exterior` → `thumbnail` |
| `data-nearby-lead`  | `.sub_title_box p`      | `hero.description`                         | `{name} - 관광안내`                                    |
| `data-nearby-title` | `.sub_title_box h3`     | `hero.title`                               | `주변 여행지`                                          |
| `data-nearby-list`  | `.travel_list ul`       | `about[]` → `property.nearbyAttractions[]` | 항목 없으면 비움                                       |
| `.about_img_bnr li` | 아래 **이미지 풀**      | 없으면 `ul` 자체를 만들지 않음             |

**⚠️ 세트 수는 `about[]` 길이가 아니라 "글이 있는 블록 수" 다.**
글 없이 이미지만 있는 블록이 흔한데(실데이터: 4블록 중 2개가 글 없음),
그런 블록까지 세트를 만들면 **전폭 이미지 한 장짜리 띠가 세로로 줄줄이 쌓인다.**
글 없는 블록은 세트를 만들지 않고 사진만 넘긴다.

**⚠️ 그리드 이미지는 블록 경계를 넘어 흐른다.**
글 있는 블록이 자기 그리드(3칸)를 채울 만큼 사진을 갖고 있는 경우가 거의 없다.

```
about[0] ABOUT      이미지 1장  ← 큰 이미지로 다 씀, 그리드 채울 게 없음
about[1] LANDSCAPE  이미지 2장  ← 큰 이미지 1 + 1장 남음
about[2] (글 없음)   이미지 2장
about[3] (글 없음)   이미지 2장
```

큰 이미지만 각자 블록 것을 쓰고, **남는 사진은 순서대로 모아 앞 세트의 그리드부터
3칸씩 채운다.** 마지막 세트가 나머지를 전부 받는다(3의 배수로 줄바꿈).
위 데이터면 `3칸 + 2칸` 이 된다. 이렇게 하지 않으면 ABOUT 그리드가 통째로 비고
나머지 4장이 갈 곳이 없다.

- `about[]` 이 비어 있어도 세트 하나는 만든다 (매핑 위치 안내 placeholder 노출).
  **사진이 하나도 없으면 3칸 그리드도 placeholder 로 함께 세운다** — 블록은
  `배너 + 3칸 그리드` 한 세트라 배너만 남으면 세트 모양이 무너진다.
  (데이터가 있는데 그리드 몫이 모자란 경우는 그리드를 만들지 않는다.
  그건 정상적인 배치이지 매핑 누락이 아니다)
- 소제목 폴백 `Greetings` / `Landscape` 는 원본 두 페이지의 필기체 문구다.
  세 번째 블록부터는 라벨을 만들 근거가 없어 `h4` 를 만들지 않는다.

### 블록 폭 교대 (35:65 ↔ 60:40)

원본은 같은 `.about_txt_bnr` 을 두 페이지에서 다른 폭으로 쓴다.

| 원본 페이지            | 섹션 클래스 | 이미지 : 텍스트 |
| ---------------------- | ----------- | --------------- |
| `about.html` (인사말)  | `sub1_1`    | **35 : 65**     |
| `view.html` (외부풍경) | `sub1_2`    | **60 : 40**     |

두 페이지를 한 장으로 합쳤으므로 **블록 순서대로 두 규격을 번갈아** 준다.
짝수 번째 세트는 기본값(35:65), 홀수 번째 세트에 매퍼가 `is-wide` 를 붙여 60:40 이 된다.
860px 이하에서는 둘 다 전폭이다(원본 `.sub1_2` 도 그렇다).

**좌우 반전은 하지 않는다.** 이미지는 항상 왼쪽이다 — 원본 두 페이지 모두 그렇고,
`direction: rtl` 로 뒤집으면 `.img_box:before` 파란 오프셋과 `h4` 밑줄 방향까지
따라 뒤집어야 해서 얻는 것보다 잃는 게 많다.

### `.wide_img` — 페이지 맨 아래 한 장

원본 `view.html` 하단에만 있던 블록이라 병합 후에도 **페이지당 하나**만 둔다.

1. 마지막 그리드에서 **혼자 남을 뻔한 사진** — 남는 사진이 4장이면 `3칸 + 1칸` 이 되어
   마지막 줄이 휑해지므로 그 1장을 여기로 돌린다 (`개수 % 3 === 1` 이고 2장 이상일 때)
2. `property.images[0].exterior` 첫 장
3. `thumbnail` 첫 장
4. 셋 다 없으면 **영역째 숨긴다** — 마무리 장식이라 placeholder 를 깔 자리가 아니다

### Swiper (`js/pages/main.js`)

| 키         | 대상                            | 옵션                                                                                              |
| ---------- | ------------------------------- | ------------------------------------------------------------------------------------------------- |
| `mainHero` | `.sub_visual .swiper-container` | `loop`, autoplay 4초, fraction 페이지네이션, 좌우 화살표. `lockHide: .sub_visual .visual_control` |

### 템플릿 확장 CSS

| 규칙                                          | 이유                                                                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `.about_txt_bnr.is-wide`                      | 원본 `view.html`(sub1_2) 의 60:40 을 두 번째 세트부터 번갈아 쓴다                                                  |
| `.about_txt_bnr + .about_txt_bnr` 간격        | 세트를 여러 개 쌓으므로 사이 여백이 필요하다                                                                       |
| `.about_img_bnr[data-count]`                  | 원본은 항상 3장 고정. 1~2장이면 칸이 남는다                                                                        |
| `.about_img_bnr li:nth-child(3n+1)` / `(n+4)` | 4장 이상 줄바꿈 시 4번째 칸이 줄 맨 앞에서도 왼쪽 여백을 갖는다                                                    |
| `.sub_about .wide_img` / `img`                | `sub1_2` 에만 있던 여백을 `sub1_1` 로 바꾼 main 에 옮겨 온다. 원본은 `img` 규칙이 없어 비율 제각각인 사진이 넘친다 |

---

## `layout-map.html` (원본 `room.html` 목록)

```
.sub_wide_visual (sub2_1)  고정 배경 ← hero.images[0]   (원본은 슬라이더가 아니다)
                           strong `Room Preview` / p `객실미리보기`  ← 고정
.sub_cate_wrap             객실 탭 ← renderRoomNav()
.main_room                 객실 카드 슬라이더 ← roomtypes (index 와 같은 규격)
.wide_img                  Room's Layout 배치도 ← about
```

| `data-*`                                  | 요소                         | JSON 경로                         | 폴백                                         |
| ----------------------------------------- | ---------------------------- | --------------------------------- | -------------------------------------------- |
| `data-layout-hero`                        | `.sub_wide_visual` 배경      | `hero.images[0]`                  | 객실 썸네일 첫 장 → `exterior` → `thumbnail` |
| `data-layout-hero-title` / `-description` | 히어로 `strong` / `p`        | `hero.title` / `hero.description` | `Room Preview` / `객실미리보기`              |
| `data-room-list-nav`                      | `.sub_cate_wrap ul`          | `getRoomMenuItems()`              | `미리보기` li 는 정적, 뒤에 생성             |
| `data-room-list-slides`                   | `.room_list .swiper-wrapper` | `customFields.roomtypes[]`        | `renderRoomSlides()` 공용 렌더러             |
| `data-layout-room-title` / `-description` | `.main_room .title_box`      | —                                 | `Room's Preview` / `객실안내` **고정**       |
| `data-layout-map-title`                   | `.wide_img h3`               | `about.title`                     | `Room's Layout`                              |
| `data-layout-map-description`             | `.wide_img p`                | `about.description`               | `{name} 객실 배치도`                         |
| `data-layout-map-images`                  | 배치도 이미지 컨테이너       | `about.images[isSelected]`        | placeholder (영역 유지)                      |

### `enabled: false` → 404 리다이렉트

```js
if (!section || section.enabled === false) {
  if (!window.previewHandler) {
    window.location.href = '404.html';
    return;
  }
}
```

A / B / C 템플릿과 같은 패턴이다. 헤더의 `미리보기` li 도 `header-footer-mapper` 가
같은 기준(`pages.layoutMap.sections[0].enabled`)으로 숨긴다.

**백오피스 preview 에서는 리다이렉트하지 않는다.** 편집자가 이 페이지를 끈 상태에서도
내용을 보고 다시 켤 수 있어야 하는데, 404 로 튕기면 그게 불가능하다.

### 배치도는 여러 장을 받는다

원본은 `<img src="layout.webp">` 한 장 고정이지만 숙소에 따라 동/층별로 나눠 올린다.
`about.images` 를 `isSelected` + `sortOrder` 순으로 **전부** 세로로 쌓는다(간격 40px / 모바일 20px).
`alt` 는 이미지 `description` → `{name} 객실 배치도` 순.

**이미지가 없어도 영역을 유지하고 placeholder 를 세운다.**
배치도는 이 페이지의 본 목적이라, 비었다고 숨기면 객실 목록만 남아 페이지 정체성이 사라진다.
(`room.html` 의 평면도는 부가 정보라 반대로 숨긴다)

### Swiper (`js/pages/layout-map.js`)

| 키           | 대상                           | 옵션                                                                            |
| ------------ | ------------------------------ | ------------------------------------------------------------------------------- |
| `layoutRoom` | `.room_list .swiper-container` | `TplSwiper.initRoomList()` — index 와 동일(PC 최대 3열, autoplay 4초, 화살표 없음) |

히어로는 고정 배경이라 Swiper 가 없다.

---

## `room.html?room_id=` (원본 `room.html?room_id=`)

```
.sub_visual (sub2_2)   히어로 슬라이더 ← roomtype_interior
                       p `Room Info` / strong ← 객실명
.sub_cate_wrap         객실 탭 ← renderRoomNav(currentId)
.sub_title_box         p `{name} - 객실안내` / h3 객실명
.table_box             .price_table for_pc(5열) + for_m(4열)
.room_img_bnr          3칸 ul + 영문 장식 문구 + 예약 버튼
[평면도]                Room's Floor Plan — **원본에 없던 신규 블록**
.wide_img              마무리 사진 한 장
```

### 현재 객실 판별

원본은 `?room_id=`, 백오피스 preview 는 `?id=` 로 넘어온다. **둘 다 받는다.**
값이 없거나 못 찾으면 첫 번째 객실로 떨어진다(빈 페이지보다 낫다).

| `data-*`                                      | 요소                              | JSON 경로                                | 폴백                                                     |
| --------------------------------------------- | --------------------------------- | ---------------------------------------- | -------------------------------------------------------- |
| `data-room-name`                              | 히어로 `strong` / `h3` / 표 첫 칸 | `roomtypes[i].name` → `rooms[].name`     | `getRoomtypeName()`                                      |
| `data-room-hero-slides`                       | `.sub_visual .swiper-wrapper`     | `roomtype_interior`                      | `roomtype_thumbnail` → `roomtype_exterior` → placeholder |
| `data-room-nav`                               | `.sub_cate_wrap ul`               | `getRoomMenuItems()`                     | 현재 id 로 `.on` 표시                                    |
| `data-room-base-occupancy` / `-max-occupancy` | 표 기준/최대                      | `rooms[].baseOccupancy` / `maxOccupancy` | `-`                                                      |
| `data-room-structure`                         | 표 유형                           | `formatRoomStructure(rooms[])`           | `-`                                                      |
| `data-room-size`                              | 표 평형                           | `toPyeong(rooms[].size)`                 | `-`                                                      |
| `data-room-amenities`                         | 집기품목                          | `rooms[].amenities[]` → `, ` 조인        | 비면 `li` 째 숨김                                        |
| `data-room-gallery-top`                       | `.room_img_bnr ul` (3칸 한 줄)    | `roomtype_interior[0..2]` (아래 참조)    | 사진이 없으면 3칸 placeholder                            |
| `data-room-floorplan-wrap` / `-images`        | 평면도 블록                       | `getRoomFloorplanImages()`               | **없으면 영역째 숨김**                                   |
| `data-room-wide-img`                          | 마무리 사진                       | 아래 참조                                | 없으면 숨김                                              |

`roomtypes[i]` 는 `{ id, images }` 뿐이라 인원·평형·집기는 최상위 `rooms[]` 에서
같은 id 로 찾아온다. **표 칸이 비면 행이 무너지므로 값 없는 칸은 `-` 로 채운다.**

> `toPyeong()` 은 `평` 까지 붙여서 돌려준다. 호출부에서 또 붙이면 `12평평` 이 된다.

### 객실 그룹 (`groupName`) — 이 페이지가 그룹을 알 필요는 없다

그룹 처리는 전부 `base-mapper` 의 공용 헬퍼가 한다. 헤더 메뉴 / `layout-map` 탭 /
이 페이지 탭이 모두 `getRoomMenuItems()` 한 곳을 거치므로 세 군데가 자동으로 일치한다.

```js
getRoomMenuLink(item) → './room.html?room_id=' + item.roomtype.id
                                                 ↑ 그룹의 첫 번째 객실
```

`getRoomMenuItems()` 가 `groupName` 으로 묶으면서 **그룹의 첫 객실을 `roomtype` 으로 잡아둔다.**
그래서 그룹 메뉴를 눌러도 이 페이지에는 평범한 `room_id` 하나가 들어오고,
페이지는 언제나 "객실 하나"만 그리면 된다.

`isRoomMenuItemActive()` 는 **그룹 안 어느 객실이든** 현재면 그 탭을 활성화한다.

| 상태             | 동작                                                                |
| ---------------- | ------------------------------------------------------------------- |
| `groupName` 없음 | 객실 하나가 항목 하나 (기존 매핑 그대로)                            |
| `groupName` 있음 | 같은 그룹이 한 항목으로 묶이고, 클릭 시 그 그룹 첫 객실 상세로 진입 |

### 객실 평면도 — 원본에 없던 블록

원본 객실 상세에는 평면도 자리가 없다. `layout-map` 의 `Room's Layout`
(`.wide_img` + `.title_box` + 이미지) 규격을 그대로 가져와 새로 만들었다.

- 소스는 `getRoomFloorplanImages()` — `roomtype_floorplan` / `floorplan` /
  `room_floorplan` / `floor_plan` 카테고리. 크롤러가 원본 평면도 영역에서 찾았을 때만 채운다.
- **일반 객실 사진으로 폴백하지 않는다.** 평면도 자리에 인테리어 사진이 들어가면 잘못된 정보다.
- 여러 장이면 세로로 쌓는다.
- **없으면 제목까지 영역째 숨긴다.** 평면도는 부가 정보다.
  (`layout-map` 의 배치도는 그 페이지의 본 목적이라 반대로 자리를 유지한다)

### 사진 배분

| 자리                      | 소스                                                             |
| ------------------------- | ---------------------------------------------------------------- |
| 히어로 슬라이더           | `roomtype_interior` 전체                                         |
| `.room_img_bnr` 3칸 한 줄 | `roomtype_interior[0] [1] [2]`                                   |
| `.wide_img` 마무리        | `roomtype_exterior` → `property.exterior` → `property.thumbnail` |

소스는 **`roomtype_exterior` 앞 3장**이다. 크롤러가 원본 `.room_img_bnr` 사진을
이 카테고리에 담는다 — 히어로(`roomtype_interior`)와 창고가 갈리므로
**히어로 재생 순서를 건드리지 않는다.** 그 카테고리가 비면 히어로 앞 3장으로 떨어진다.

(`pages.room[].sections[0].gallery` 는 백오피스에서 **설명 텍스트만** 받는 자리다.
이미지 배열이 스키마에 있어도 편집자가 손댈 수 없으니 화면의 소스로 쓰지 않는다)

**칸 수는 3칸 한 줄로 고정한다.** 원본은 숙소마다 다르다 — 플레이비치는 두 줄(6장),
아라마루는 한 줄(3장)이다. 어느 쪽인지 알려줄 신호가 없으므로 적은 쪽에 맞춘다.

**마무리 사진(`.wide_img`)은 같은 카테고리 안에서 위치로 가른다** — 그리드가 앞 3장,
마무리는 **마지막 한 장**. 단 `roomtype_exterior` 가 3장 이하면 건너뛴다. 원본 그리드가
3장뿐이고 `.wide_img` 가 없는 숙소는 exterior 가 딱 3장이라, 마지막 장을 쓰면 그리드와
같은 사진이 두 번 나오기 때문이다.

| `roomtype_exterior` | 그리드                 | `.wide_img`                       |
| ------------------- | ---------------------- | --------------------------------- |
| 4장 이상            | `[0][1][2]`            | 마지막 장                         |
| 3장                 | `[0][1][2]`            | `property.exterior` → `thumbnail` |
| 1~2장               | 있는 만큼 (칸 폭 자동) | `property.exterior` → `thumbnail` |
| 0장                 | 히어로 앞 3장          | `property.exterior` → `thumbnail` |

**사진이 하나도 없으면 3칸 placeholder 로 세운다** — 표 아래가 통째로 비는 것을 막는다.
`.wide_img` 는 마무리 장식이라 반대로 영역째 숨긴다.

**`usedGalleryUrls` 중복 검사는 없다.** 그리드와 마무리가 같은 카테고리 안에서 위치로
갈리므로, URL 중복 검사를 하면 오히려 정상 배치를 막는다.

### 매핑하지 않는 영역

- `Certainly, travel is more than the seeing of sights. / it is a change that goes on…`
  — `.room_img_bnr` 사진 줄 아래의 영문 장식 문구. **하드코딩 유지.**
  숙소 고유 내용이 아니라 일반적인 여행 인용구라 어디에 붙어도 어색하지 않고,
  대응할 데이터 필드도 없다(`rooms[].description` 은 한글 본문이라 이 영문 세리프
  장식 자리에는 톤이 안 맞는다).
- `Room Info` / `Room Preview` / `객실미리보기` — 페이지 성격 라벨.

### Swiper (`js/pages/room.js`)

| 키         | 대상                            | 옵션                                                                                              |
| ---------- | ------------------------------- | ------------------------------------------------------------------------------------------------- |
| `roomHero` | `.sub_visual .swiper-container` | `loop`, autoplay 4초, fraction 페이지네이션, 좌우 화살표. `lockHide: .sub_visual .visual_control` |

`.room_img_bnr` 은 Swiper 가 아니라 정적 3칸 `ul` 한 줄이다.

### 템플릿 확장 CSS

| 규칙                                                | 이유                                          |
| --------------------------------------------------- | --------------------------------------------- |
| `.sub2_1 .wide_img [data-layout-map-images] img`    | 배치도 여러 장 세로 배치 + 간격               |
| `.sub_room_detail [data-room-floorplan-images] img` | 평면도 여러 장 세로 배치 + 간격               |
| `.room_img_bnr ul[data-count]`                      | 원본은 항상 3칸. 사진이 1~2장이면 칸이 남는다 |
| `.sub_room_detail [data-room-wide-img] img`         | 원본은 `padding` 만 잡고 `img` 규칙이 없다    |

---

## `facility.html?id=` (원본 `special1~9.html`)

> **파일명은 `facility.html` 이다.** 형제 템플릿이 `special` / `facility` 로 갈려 있었는데
> (`special`: A·B·C2·E2 / `facility`: C·D·D2·E·F·L) `facility` 로 통일했다.
> 데이터 모델도 `pages.facility[]` / `property.facilities[]` 라 그쪽이 맞다.
> CSS 클래스(`.sub_special` / `.special_img_bnr`)는 원본 이름이라 그대로 둔다.

원본은 **시설당 파일 하나**(`special1.html` ~ `special9.html`)다. 템플릿은
**한 파일 + `?id=`** 로 합친다. 탭(`.sub_cate_wrap`)을 `property.facilities[]` 전량으로
생성하고 `?id=` 로 현재 시설을 판별한다. id 가 없거나 못 찾으면 첫 시설로 떨어진다.

```
.sub_visual (sub3_1)   히어로 슬라이더 ← 시설 이미지 pool
                       p `Special Info` (고정) / strong ← 시설명
.sub_cate_wrap         시설 탭 ← property.facilities[] 전량
.sub_title_box         p `{name} - 부대시설` / h3 시설명
.special_img_bnr .txt  strong `Special 01` / em ← description / p ← usageGuide
.special_img_bnr ul    3칸 콜라주
```

| `data-*`                    | 요소                          | JSON 경로                           | 폴백             |
| --------------------------- | ----------------------------- | ----------------------------------- | ---------------- |
| `data-facility-hero-slides` | `.sub_visual .swiper-wrapper` | 시설 이미지 pool 전량               | placeholder 1장  |
| `data-facility-label`       | 히어로 `p` (작은 줄)          | `pages.facility[].hero.description` | `Special Info`   |
| `data-facility-title`       | 히어로 `strong`               | `facilities[i].nameEn` → `name`     | —                |
| `data-facility-name`        | `.sub_title_box h3`           | `facilities[i].name`                | —                |
| `data-facility-nav`         | `.sub_cate_wrap ul`           | `property.facilities[]`             | 현재 id 에 `.on` |
| `data-facility-eyebrow`     | `.txt strong` (Allura)        | `nameEn` → **`Special NN`**         | 아래 참조        |
| `data-facility-catch`       | `.txt em` (20px + `· · ·`)    | `facilities[i].description`         | 비면 **숨김**    |
| `data-facility-description` | `.txt p` (14px)               | `facilities[i].usageGuide`          | 비면 **숨김**    |
| `data-facility-gallery`     | `.special_img_bnr ul`         | pool 뒤쪽 3장                       | placeholder 1칸  |

### 히어로는 원본 `special` 이 아니라 원본 `room` 상세 구조를 따른다

같은 사이트인데 두 페이지의 히어로 구조가 반대다.

```html
<!-- 원본 special1.html -->
<strong>Private Swimming Spa</strong>
<!-- 큰 줄 = 영문명 -->
<p>개별 스위밍 스파</p>
<!-- 작은 줄 = 한글명 -->

<!-- 원본 room.html 상세 -->
<p>Room Info</p>
<!-- 작은 줄 = 영문 라벨 -->
<strong>여름(오션뷰)</strong>
<!-- 큰 줄 = 한글 객실명 -->
```

`special` 은 **영문명이 있다는 전제**로 짠 구조이고, `room` 은 영문명이 없어서
영문 라벨을 작은 줄에 두고 한글을 큰 줄에 올린 것이다.
백오피스 `facilities[]` 에 `nameEn` 필드가 없어 우리 상황이 `room` 과 같으므로
**`room` 방식을 쓴다.**

| 페이지            | 작은 줄            | 큰 줄                           |
| ----------------- | ------------------ | ------------------------------- |
| `main.html`       | —                  | `About` / `{name} 소개`         |
| `layout-map.html` | —                  | `Room Preview` / `객실미리보기` |
| `room.html`       | `Room Info`        | 객실명                          |
| `facility.html`   | **`Special Info`** | 시설명                          |

`Special` 단독이 아니라 `Special Info` 인 이유: 눈썹 라벨이 이미 `Special 01` 을 쓰므로
히어로까지 `Special` 이면 한 페이지에 같은 단어가 두 번 나온다.
`Room Info` 와 짝이 맞기도 하고, E2 도 부대시설 헤딩에 `Special Info` 를 쓴다.

### 눈썹 라벨 — `Special 01`

`.special_img_bnr .txt strong` 은 **Allura 필기체** 자리다.
원본은 시설 영문명(`Private Swimming Spa`)을 올리는데 `facilities[]` 에 영문명이 없다.
한글 시설명을 넣으면 두 가지가 동시에 무너진다.

1. 바로 위 `h3` 와 같은 문구가 두 번 나온다 (`공용수영장` / `공용수영장`)
2. Allura 에 한글 글리프가 없어 고딕으로 떨어져 필기체 느낌이 사라진다

그래서 `Special 01` 순번 라벨로 대신한다. **라틴이라 Allura 가 그대로 살아난다.**
순번은 `facilities[]` 배열 순서(=`displayOrder`) 기준이라 헤더 SPECIAL 메뉴·탭 순서와 일치한다.
(`index.html` 특장점 카드도 같은 이유로 순번 라벨을 쓴다)

> `nameEn` 이 내려오기 시작하면 눈썹·히어로 모두 영문명으로 **자동 복원**된다. 코드 수정 불필요.

### 서체 처리

| 자리                                | 내용                       | 서체                                                  |
| ----------------------------------- | -------------------------- | ----------------------------------------------------- |
| 히어로 작은 줄                      | `Special Info` (영문 고정) | 원본 그대로                                           |
| 히어로 큰 줄 (`.visual_txt strong`) | 시설명 (한글)              | `--font-ko-sub` 로 **override** (Cinzel 에 한글 없음) |
| 눈썹 (`.txt strong`)                | `Special 01` (라틴)        | **Allura 원본 그대로**                                |

### 설명 두 슬롯 — 다른 템플릿과 다르다

원본 `.special_img_bnr .txt` 는 슬롯이 **둘**이라 폴백 체인으로 합치지 않고 각자 자리에 둔다.

```
em (20px, 아래 `· · ·` 장식) ← description   한 줄 소개 카피
p  (14px 본문)               ← usageGuide    이용 요금·시간·제약 등 실제 안내
```

운영에서 두 필드를 그렇게 나눠 쓴다. 다른 템플릿은 슬롯이 하나뿐이라 합쳐야 했다.

| 템플릿      | 슬롯    | 체인                                        |
| ----------- | ------- | ------------------------------------------- |
| A / F       | 1개     | `hero.title` → `description` → `usageGuide` |
| B / C2 / D2 | 1개     | `description` → `usageGuide`                |
| E2          | 1개     | `hero.title` → `usageGuide` → `description` |
| L           | 1개     | `hero.title` → `usageGuide`                 |
| **G**       | **2개** | `em` ← `description` / `p` ← `usageGuide`   |

**값이 없는 슬롯은 숨긴다.** `em` 은 `· · ·` 장식만, `p` 는 빈 줄만 남기 때문이다.
`description` 이 없을 때 `usageGuide` 를 끌어오지 않는다 — `- 이용 요금: 무료` 같은
목록 항목이 20px 카피 자리에 올라가면 어색하다.

### 이미지 pool

```
pages.facility[].hero.images → pages.facility[].about.images → facilities[].images
(URL 중복 제거)
히어로  = pool 전량
콜라주  = pool 뒤쪽 3장 (3장 이하면 앞에서부터 — 그때는 어차피 전부 겹친다)
```

백오피스에서 시설 페이지를 만들지 않으면 `pages.facility` 가 `[]` 로 오므로
실무상 `facilities[].images` 가 유일한 소스다.

### Swiper (`js/pages/facility.js`)

| 키            | 대상                            | 옵션                                                                                              |
| ------------- | ------------------------------- | ------------------------------------------------------------------------------------------------- |
| `specialHero` | `.sub_visual .swiper-container` | `loop`, autoplay 4초, fraction 페이지네이션, 좌우 화살표. `lockHide: .sub_visual .visual_control` |

`.special_img_bnr ul` 은 Swiper 가 아니라 정적 3칸 그리드다.

### 템플릿 확장 CSS

| 규칙                                          | 이유                                                                 |
| --------------------------------------------- | -------------------------------------------------------------------- |
| `.sub_special .visual_txt strong` 서체        | 히어로 큰 줄에 한글 시설명이 들어가는데 Cinzel 에 한글 글리프가 없다 |
| `.special_img_bnr ul[data-count='1'\|'2']`    | 원본은 항상 3칸. 시설마다 사진 수가 달라 1~2장이면 칸이 남는다       |
| `.special_img_bnr .txt em[style*='none'] + p` | `em` 이 숨겨지면 제목과 본문 사이 여백이 사라진다                    |

---

## `reservation.html` (원본 `reservation.html`)

```
.sub_wide_visual (sub4_1)  고정 배경 ← hero.images[0]  (슬라이더 아님)
                           strong `Reservation` / p `{name} 이용안내`  ← 고정
.sub_cate_wrap             예약하기(외부링크) / 이용안내(on)
dl.info_box                dt(제목) + dd(본문) 쌍을 매퍼가 생성
```

| `data-*`                  | 요소                    | JSON 경로                            | 폴백                                                    |
| ------------------------- | ----------------------- | ------------------------------------ | ------------------------------------------------------- |
| `data-reservation-hero`   | `.sub_wide_visual` 배경 | `hero.images[0]` → `about.images[0]` | `exterior` → `thumbnail` → `commonArea` → `surrounding` |
| `data-reservation-blocks` | `dl.info_box`           | 아래 두 블록                         | 둘 다 비면 안내 한 줄                                   |
| `data-booking-link`       | `예약하기` 탭           | `property.realtimeBookingId`         | header-footer-mapper 가 주입                            |

**히어로 문구는 고정이다.** 페이지 성격 라벨이라 백오피스 값으로 바뀌면 안 된다.
`hero` 는 배경 이미지만 쓴다.

### 안내 블록 두 벌

| 블록 | 제목(`h3`)                 | 윗줄(`p`)                                 | 본문(`dd`)                                                      |
| ---- | -------------------------- | ----------------------------------------- | --------------------------------------------------------------- |
| 1    | `about.title` → `유의사항` | `about.description` → `{name} - 이용안내` | `property.checkInOutInfo` + `usageGuide` + `reservationGuide`   |
| 2    | `환불규정` 고정            | `{name} - 이용안내`                       | `refundPolicies[]` 조립 + `refundSettings.customerRefundNotice` |

- **내용이 없는 블록은 만들지 않는다.** 제목만 남은 빈 상자가 어색하다.
- 둘 다 비면 `이용안내 / 등록된 이용안내가 없습니다.` 한 벌만 남긴다.
- 섹션에 `title`/`description` 이 한 벌뿐이라 **첫 블록이 가져간다.**
  환불 제목까지 열려면 별도 필드가 필요하다.
- 환불규정은 슬롯을 열지 않는다 — `refundPolicies[]` 에서 기계적으로 조립하는 값이라
  자유 문구로 덮으면 실제 정책과 어긋난다. 자유 문구 자리는
  `refundSettings.customerRefundNotice` 가 이미 맡고 있다.

### ⚠️ 본문 중복 제거

`usageGuide` 가 입퇴실 안내를 **통째로 포함**하는 경우가 흔하다.
`reservationGuide` 도 `usageGuide` 의 공지 부분과 사실상 같은 경우가 많다.
공백·줄바꿈을 무시하고(`contains()`) 이미 들어 있으면 앞뒤로 다시 붙이지 않는다.

> 실데이터 검증: `[입퇴실안내]` 1회 / `전 객실 금연입니다` 1회 — 중복 없음.

### 환불규정 조립

`refundPolicies[]` 를 `refundProcessingDays` 내림차순으로 정렬해 문장을 만든다.

| 조건                         | 출력                                      |
| ---------------------------- | ----------------------------------------- |
| `days > 0`, `rate >= 100`    | `* 이용일 {days}일전 취소시 전액 환불`    |
| `days > 0`, `0 < rate < 100` | `* 이용일 {days}일전 취소시 {rate}% 환불` |
| `days === 0`                 | `* 이용일 당일 취소시 …`                  |
| `rate === 0`                 | `… 환불 불가`                             |

E2 와 같은 규칙이다. 현재 데이터(11단계)로 원본 사이트와 **동일한 11줄**이 나온다.

### Swiper

없다. 히어로가 고정 배경이고 본문도 `dl` 텍스트다. `js/pages/*.js` 를 두지 않는다.
(`nearby-attractions` / `directions` 도 같은 이유로 없다)

---

## `nearby-attractions.html` (원본 `travel.html`)

```
.sub_wide_visual (sub5_1)  고정 배경 ← hero.images[0]
                           strong `Tour Information` / p `{name} 여행지 정보`  ← 고정
.sub_cate_wrap             주변여행지 (1탭)
.sub_title_box             p `{name} - 관광안내` / h3 `주변 여행지`  ← 고정
.travel_list ul            2열 목록
```

이 페이지 섹션의 `about` 은 **객체가 아니라 항목 배열**이라
`title`/`description` 슬롯이 `hero` 쪽에만 있다.

| 슬롯                  | 소스               | 폴백                                               |
| --------------------- | ------------------ | -------------------------------------------------- |
| 히어로 `strong` / `p` | —                  | `Tour Information` / `{name} 여행지 정보` **고정** |
| `.sub_title_box p`    | `hero.description` | `{name} - 관광안내`                                |
| `.sub_title_box h3`   | `hero.title`       | `주변 여행지`                                      |

히어로 문구는 페이지 성격 라벨이라 고정하고, 그 아래 제목 영역을 백오피스가 채운다
(`reservation.html` 과 같은 방식).

### `enabled: false` → 404 리다이렉트

`layout-map.html` 과 같다. 헤더 TRAVEL 메뉴도 `header-footer-mapper` 가
같은 기준(`pages.nearbyAttractions.sections[0].enabled`)으로 숨긴다.

### 항목 소스

| 순위 | 소스                           | 담기는 것                                                         |
| ---- | ------------------------------ | ----------------------------------------------------------------- |
| 1    | `nearbyAttractions.about[]`    | `{ title, description, images }` — 사진·설명까지                  |
| 2    | `property.nearbyAttractions[]` | **문자열 배열**(이름만) — `<p>` 를 만들지 않고 placeholder 이미지 |

히어로 배경은 `hero.images[0]` → 여행지 사진 첫 장 → `surrounding` → `exterior` → `thumbnail`.

### 항목 필드 매핑 — **크롤러 참고**

원본 `li` 는 본문 / 자료출처 / 거리 세 덩어리다.

```html
<img />
<strong>제목</strong>
<p>
  본문…
  <span>자료출처 : …</span>
  <em>펜션에서 약 4.2km, 차량 약 8분 거리</em>
</p>
```

| 슬롯            | 소스                                                  |
| --------------- | ----------------------------------------------------- |
| `img`           | `about[i].images[0].url`                              |
| `strong`        | `about[i].title`                                      |
| 본문            | `about[i].description`                                |
| `<span>` 출처   | `description` 안의 `자료출처` / `출처` 로 시작하는 줄 |
| **`<em>` 거리** | **`about[i].images[0].description`** ← 정본           |

거리는 `images[0].description` 이 정본이다(C2 / D2 / L / E2 공통).
없으면 `description` 안에서 `펜션에서` / `숙소에서` 로 시작하거나 `거리` 로 끝나는 줄을 찾는다.
출처·거리는 **각각 첫 매칭 한 줄만** 쓰고 나머지는 본문으로 남는다. 줄 순서는 상관없다.

`01.` `02.` 번호는 매퍼가 넣지 않는다 — 원본 CSS 의
`strong:before { counter-increment }` 가 붙인다.

### 구분선 정렬 (템플릿 확장)

원본은 `li` 를 float 로 흘리고 `:nth-of-type(2n+1){clear:both}` 로 줄을 끊는다.
그러면 **같은 줄 두 항목의 높이가 각자 달라져 아래 구분선이 어긋난다.**
원본은 설명 길이를 손으로 맞춰 뒀지만 백오피스 값은 길이가 제각각이다.

`ul` 을 grid 로 바꾸면 한 줄의 셀 높이가 자동으로 같아져(`align-items:stretch` 기본값)
`border-bottom` 이 줄마다 같은 높이에 그어진다. 폭·간격(2%)·여백은 원본 값을 그대로 옮겼고
반응형도 원본 브레이크포인트를 따른다(860↓ 2열 유지 / 640↓ 1열).

이미지도 **4:3 으로 고정**했다. 구분선은 grid 가 맞춰 주지만 사진 비율이 제각각이면
제목 줄 위치가 들쭉날쭉해진다.

### Swiper

없다. 히어로가 고정 배경이고 목록도 정적 그리드다.

---

## `directions.html` (원본 `traffic.html`)

```
.sub_wide_visual (sub6_1)  고정 배경 ← hero.images[0]
                           strong `Location` / p `{name} 오시는 길`  ← 고정
.sub_cate_wrap             오시는길 (1탭)
.sub_title_box             p `{name} - 오시는길` / h3 `지도안내`  ← 고정
.map_box                   주소 + 지도
dl.map_info                안내사항 — dt(제목) + dd(본문) 쌍
```

| `data-*`                  | 요소                    | JSON 경로                                           | 폴백                                     |
| ------------------------- | ----------------------- | --------------------------------------------------- | ---------------------------------------- |
| `data-directions-hero`    | `.sub_wide_visual` 배경 | `hero.images[0]`                                    | `exterior` → `surrounding` → `thumbnail` |
| `data-directions-address` | `.map_box p span`       | `property.address` → `businessInfo.businessAddress` | 없으면 줄째 숨김                         |
| `data-directions-notice`  | `dl.map_info`           | `notice` (아래 규약)                                | 주소 기반 조립                           |
| `#kakao-map`              | 지도                    | `property.latitude` / `longitude`                   | 좌표 없으면 영역 숨김                    |

### 지도 — daum roughmap → Kakao Maps SDK

원본은 **daum roughmap 퍼가기 위젯**이다.

```html
new daum.roughmap.Lander({ "timestamp": "1659193459575", "key": "2b7yh", … }).render();
```

`key` 가 업체별로 발급받는 값이라 데이터로 재현할 수 없다.
이미 있던 `js/kakao-maps-sdk.js` 로 대체하고 `property.latitude/longitude` 로 중심·마커를 잡는다.
원본 `.map_inner`(`padding-bottom:40%` 비율 상자)를 그대로 채우도록
`#kakao-map` 에 같은 좌표계를 준다. — 템플릿 확장

preview 는 데이터가 바뀔 때마다 매핑을 다시 돌린다. 그때마다 `new Map()` 을 만들면
인스턴스가 쌓이므로 **이미 있으면 중심만 옮긴다.**

좌표가 없어도 **영역은 유지하고 placeholder 를 깐다.** `.map_inner` 는
`padding-bottom:40%` 비율 상자라 안을 비우면 테두리만 남은 빈 띠가 된다.

### 안내사항(`notice`) 다중 블록 규약 — **크롤러 참고**

```
자가용 이용 시
※ 네비게이션에 주소를 검색해주세요
지번 주소 : 경기 가평군 북면 멱골로 398-6
도로명 주소 : …
                        ← 빈 줄로 블록 구분
대중교통 이용 시
가평터미널 하차 → 택시 약 15분
```

- **빈 줄(`\n\n`)로 블록을 구분한다.**
- **각 블록의 첫 줄이 제목**이다.
- 제목에 번호(`01,`)나 대괄호는 **넣지 않는다.** 대괄호는 템플릿이 붙인다.
- `notice.title` 은 **첫 블록의 제목**으로만 쓰인다.

**원본 `dl.map_info` 는 제목이 하나다.** 블록이 늘어나는 자리는 `dd` 안의 `.box` 다.

```
dt.sub_title_box   p `{name} - 오시는길` / h3 `오시는길 안내`   ← 고정, 한 번만
dd                 .box(strong 블록 제목 + p 본문) × N
```

블록 제목은 `h3` 가 아니라 **`strong`** 에 들어가고, 원본 표기(`[자가용 이용시]`)에 맞춰
대괄호가 없는 제목은 템플릿이 `[ ]` 로 감싼다. CSS `.map_info dd .box + .box` 가
박스 사이 여백을 잡는 것도 이 구조를 전제한다.

**제목 조건**: 첫 줄이 `※` 로 시작하지 않고 `:` 를 포함하지 않을 것.
`지번 주소 : …` 나 `※ …` 를 제목으로 오인하지 않기 위한 규칙이다.

| 순서 | 규칙                                                                           |
| ---- | ------------------------------------------------------------------------------ |
| 1    | `notice` 가 배열이면 항목마다, 객체면 그 하나를 처리                           |
| 2    | `description` 을 빈 줄로 블록 분리                                             |
| 3    | 첫 블록은 `notice.title` 이 있으면 그걸 제목으로 쓰고 본문 첫 줄을 떼지 않는다 |
| 4    | 그 외 블록은 첫 줄이 제목 조건을 만족하면 제목으로 뗀다                        |
| 5    | 제목이 비면 `notice.title` → `자가용 이용 시`                                  |
| 6    | 본문이 하나도 없으면 `property.address` 로 안내 문구를 조립                    |
| 7    | 블록마다 `.box` 를 만든다 — 제목은 `strong`(대괄호 자동), 본문은 `p`           |
| 8    | 블록이 하나도 없으면 `dl` 째 숨긴다 (제목만 남는 것을 막는다)                  |

#### 검증된 케이스

| 입력               | 결과                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| `notice` 비어 있음 | `[자가용 이용 시]` / `※ 네비게이션에 아래 주소를 입력해주세요.` + 주소             |
| 크롤러 규약 2블록  | h3 `오시는길 안내` 하나 + `.box` 두 개 (`[자가용 이용 시]` / `[대중교통 이용 시]`) |
| 제목에 대괄호 포함 | 그대로 둔다 (중복해 감싸지 않는다)                                                 |

### Swiper

없다. 히어로가 고정 배경이고 본문도 지도 + `dl` 텍스트다.

---

## 매핑 슬롯이 아닌 `data-*`

매퍼가 CSS 에 상태를 넘기려고 쓰는 내부 훅이다. 백오피스 데이터와 무관하다.

| 속성                        | 붙는 곳                                                                            | 용도                                     |
| --------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------- |
| `data-count`                | `.about_img_bnr` / `.special_img_bnr ul` / `.main_special ul` / `.room_img_bnr ul` | 이미지 개수별 폭·열 수                   |
| `data-images`               | `.main_bnr`                                                                        | 사진이 1장이면 float 을 풀고 폭을 채운다 |
| `data-generated="room"`     | 헤더 객실 서브메뉴 `li`                                                            | preview 재렌더 시 이전 생성분만 제거     |
| `data-footer-phone-sep`     | 푸터 번호 사이 `span`                                                              | 번호가 여러 개일 때 넣는 구분자          |
| `data-room-amenities-wrap`  | 객실 집기품목 `li`                                                                 | 값이 없을 때 줄째 숨기는 대상            |
| `data-menu-id="layout-map"` | 헤더 `미리보기` li                                                                 | `enabled` 로 숨기는 대상                 |
| `data-travel-menu`          | 헤더 TRAVEL 메뉴                                                                   | `enabled` 로 숨기는 대상                 |

---

## 객실 그룹 규칙 (`groupName`)

`roomtypes[].groupName`이 **하나라도 있으면** 그룹 모드로
동작한다. 없으면 객실 하나가 항목 하나다. 규칙은 `base-mapper.js` 한 곳에 있다.

**그룹으로 접히는 곳은 헤더 ROOMS 메뉴와 객실 상세 탭뿐이다.**
Room Preview(미리보기) 카드는 그룹과 무관하게 **항상 전체 객실**을 깔고,
카드마다 자기 객실 상세로 연결한다 — 원본이 그렇다.

| 함수                     | 역할                                                                      |
| ------------------------ | ------------------------------------------------------------------------- |
| `hasRoomGroups()`        | `groupName` 이 하나라도 있는지                                            |
| `getRoomMenuItems()`     | 그룹 단위 항목 배열 — `{ label, groupName, roomtype(대표), roomtypes[] }` |
| `getRoomMenuLabel()`     | 메뉴에 쓸 이름 — **그룹명** (없으면 객실명)                               |
| `getRoomMenuLink()`      | **그룹의 첫 객실** 상세로 연결                                            |
| `isRoomMenuItemActive()` | 그룹 안 **어느 객실 id 로 들어와도** 그 항목을 활성으로 본다              |
| `renderRoomSlides()`     | 미리보기 카드 — **그룹을 쓰지 않고 `roomtypes[]` 전체**를 깐다            |

### 화면 흐름

```
헤더 ROOMS 메뉴        →  그룹명        (스파동 | 프리미엄동)
        ↓ 그룹명 클릭
그룹의 첫 번째 객실 상세 →  탭에 그 그룹의 모든 객실
                          (미리보기 | 에버골드 | 퍼블하제 | 유메)

Room Preview(미리보기)  →  전체 객실 (그룹과 무관), 카드마다 자기 객실 상세로 연결
```

### ⚠️ 객실 상세 탭은 그룹을 펼친다

헤더 ROOMS 메뉴는 그룹명 하나로 접히므로, **상세 페이지 탭까지 접으면 그룹의 첫 객실
외에는 헤더로 도달할 방법이 없다.** 그래서 탭은 현재 객실이 속한 그룹을 찾아
**그 그룹의 객실만** 렌더한다.

| 상황                             | 탭                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| 그룹 밖 (미리보기 / 미그룹 객실) | `미리보기 \| 스파동 \| 프리미엄동 \| …`                                            |
| 그룹 안 (멤버 2실 이상)          | `미리보기 \| 에버골드 \| 퍼블하제 \| 유메`                                         |
| 멤버 1실 그룹                    | 펼치지 않음 — 항목이 하나뿐이라 탭이 비다시피 하고 그룹명 = 객실명이라 의미가 없다 |
| `groupName` 없음                 | 기존과 동일 (객실 하나가 항목 하나)                                                |

**다른 그룹은 이 줄에 섞지 않는다.** 그룹명과 객실명이 나란히 놓이면 부모/자식이
형제처럼 보인다. 다른 그룹으로는 헤더 ROOMS 메뉴나 미리보기를 거쳐 이동한다.
(미리보기에서는 어느 객실이든 바로 갈 수 있다.)

탭을 다시 그릴 때 **첫 li(`미리보기`)는 남기고** `data-generated="room"` 이 붙은
이전 생성분만 지운다. 통째로 비우면 미리보기로 돌아갈 길이 없어진다.

---

## 원본 대조 메모

- 원본 JS: `custom.js`(UI 동작) / `common.js` / `board.js` / `aos.js` / `jquery.lettering.js` + `jquery.textillate.js`
- Swiper: playbeach 는 로컬 `swiper-bundle.min.js`, 아라마루는 jsDelivr `swiper@8`. 템플릿은 jsDelivr `swiper@8` 을 쓴다
- playbeach 에만 있는 것: `.main_bnr01` / `.main_bnr02`, `.ft_kakao`, `.hd_right .res_ico`, `.price_table`
- 아라마루에만 있는 것: `.main_reserve`(예약 CTA 밴드) — playbeach 마크업에 없어 템플릿에서 쓰지 않는다. CSS 는 이식돼 있다

---

## 카피라이트 (`data-copyright`)

푸터 카피라이트는 `property.tripProviderName`(Trip11 공급자명)으로 렌더한다.

`common/footer.html` 의 카피라이트 요소에 템플릿 문자열을 두고,
`header-footer-mapper.js` 의 `mapCopyright()` 가 `{provider}` 를 치환한다.

```html
<a href="http://trip11.kr/" data-copyright="COPYRIGHT©{provider}. ALL RIGHTS RESERVED.">
  COPYRIGHT©(주)트립일레븐. ALL RIGHTS RESERVED.
</a>
```

| `property.tripProviderName` | 결과                                  |
| --------------------------- | ------------------------------------- |
| `"신비서"`                  | `COPYRIGHT©신비서. ALL RIGHTS RESERVED.` |
| `""` / 미입력               | HTML 에 적힌 기존 문구 그대로          |

- 문구 형식(대소문자, `ⓒ` 접두, `(주)` 표기)은 템플릿마다 달라서 **형식은 `data-copyright` 속성값이 갖고
  매퍼는 이름만 바꾼다**.
- 값이 없을 때(백오피스 미입력 → `""`) 는 건드리지 않으므로 기존 트립일레븐 문구가 그대로 남는다.
- `trip11.kr` 링크는 변경하지 않는다.
