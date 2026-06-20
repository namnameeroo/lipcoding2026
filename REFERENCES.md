# 🔗 레퍼런스 문서
> 작성일: 2026-06-20 | 프로젝트: 딱 (Ddak)

감정 반응형 3D 오브젝트 구현을 위한 레퍼런스 링크 모음

---

## 🔵 Blob / Organic Shape
> `creative`, `new` 감정 태그 오브젝트 참고

| 제목 | URL | 특징 |
|------|-----|------|
| R3F MeshDistortMaterial | https://drei.docs.pmnd.rs/shaders/mesh-distort-material | blob 기본 구현, @react-three/drei 내장 |
| R3F MeshWobbleMaterial | https://drei.docs.pmnd.rs/shaders/mesh-wobble-material | 출렁이는 유기적 효과 |
| Codrops Organic Shape Animations | https://tympanus.net/Development/OrganicShapeAnimations/ | SVG 유기적 형태 레퍼런스 |
| Codrops Morphing Background Shapes | https://tympanus.net/Development/MorphingBackgroundShapes/ | 형태 → 형태 변형 레퍼런스 |

---

## 🔴 Spike / Distort
> `difficult`, `urgent` 감정 태그 오브젝트 참고

| 제목 | URL | 특징 |
|------|-----|------|
| Three.js IcosahedronGeometry | https://threejs.org/docs/#api/en/geometries/IcosahedronGeometry | 스파이크 베이스 지오메트리 |
| Shadertoy Noise Displacement | https://www.shadertoy.com/view/Xsl3Dl | 노이즈 기반 버텍스 디스플레이스먼트 |
| Three.js Noise Shader | https://threejs.org/examples/#webgl_modifier_tessellation | 뾰족한 노이즈 변형 예시 |

---

## 🟤 Stone / Heavy (Dodecahedron)
> `burden` 감정 태그 오브젝트 참고

| 제목 | URL | 특징 |
|------|-----|------|
| Three.js DodecahedronGeometry | https://threejs.org/docs/#api/en/geometries/DodecahedronGeometry | 돌 질감 베이스 지오메트리 |
| Three.js MeshStandardMaterial roughness | https://threejs.org/examples/#webgl_materials_physical_reflectivity | 거친 질감(roughness) 예시 |

---

## 😴 Flat Blob
> `routine` 감정 태그 오브젝트 참고

| 제목 | URL | 특징 |
|------|-----|------|
| Three.js SphereGeometry + scale Y | https://threejs.org/docs/#api/en/geometries/SphereGeometry | scale.y 낮춰 납작한 형태 |
| R3F MeshWobbleMaterial (speed=0) | https://drei.docs.pmnd.rs/shaders/mesh-wobble-material | 거의 움직이지 않는 효과 |

---

## 🌟 실제 구현 영감 사이트

| 사이트 | URL | 참고 포인트 |
|--------|-----|------------|
| **Stripe** | https://stripe.com/ | 그라디언트 blob 배경 |
| **Linear** | https://linear.app/ | 미니멀 + 3D 오브젝트 조화 |
| **Framer** | https://framer.com/ | Glassmorphism + 3D 배경 |
| **Bruno Simon Portfolio** | https://bruno-simon.com/ | Three.js 인터랙티브 3D 월드 |
| **Codrops WebGL Tag** | https://tympanus.net/codrops/tag/webgl/ | 최신 WebGL 튜토리얼 모음 |
| **Awwwards WebGL** | https://www.awwwards.com/websites/webgl/ | 수상작 WebGL 사이트 갤러리 |

---

## 🛠 React Three Fiber 구현 예제 (CodeSandbox)

| 예제 | URL | 활용 |
|------|-----|------|
| R3F Distort Blob | https://codesandbox.io/s/r3f-distort-blob-bxbhb | blob 오브젝트 기본 |
| R3F Wobbly Sphere | https://codesandbox.io/s/wobbly-sphere-rlsdk | 출렁이는 구 |
| R3F Particles Explosion | https://codesandbox.io/s/particles-r3f-8epjl | 완료 시 파티클 폭발 효과 |
| R3F MarchingCubes (drei) | https://drei.docs.pmnd.rs/abstractions/marching-cubes | 유기적 blob 고급 구현 |

---

## 📚 학습 리소스

| 리소스 | URL | 설명 |
|--------|-----|------|
| Three.js Journey | https://threejs-journey.com/ | Three.js + GLSL 심화 강의 |
| React Three Fiber 공식 문서 | https://r3f.docs.pmnd.rs/ | R3F 공식 docs |
| @react-three/drei 공식 문서 | https://drei.docs.pmnd.rs/ | drei 헬퍼 docs |
| Codrops Three.js 태그 | https://tympanus.net/codrops/tag/three-js/ | Three.js 튜토리얼/데모 모음 |

---

## 🎨 디자인 레퍼런스 (Glassmorphism + Fluid UI)

| 리소스 | URL | 설명 |
|--------|-----|------|
| Glassmorphism CSS Generator | https://css.glass/ | Glassmorphism 카드 스타일 |
| UI Gradients | https://uigradients.com/ | 라벤더→민트→코랄 그라디언트 |
| Framer Motion 공식 | https://www.framer.com/motion/ | spring 애니메이션 레퍼런스 |

---

*이 문서는 딱(Ddak) 앱의 3D 감정 오브젝트 구현 시 참고용입니다.*
