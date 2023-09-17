import * as THREE from "three";
import * as dat from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger);

THREE.ColorManagement.enabled = false;

/**
 * PATHS
 */
const distPath = "https://cdn.jsdelivr.net/gh/wip-com/Metal-360@v1.2/dist";
const dracoPath = "./draco/";
const texturePath = "./textures/matcaps/12.png";
const modelPath = "./models/escalier-v2.glb";

/**
 * Add CANVAS to body
 */
const body = document.querySelector("body");

const creatCanvas = document.createElement("canvas");
creatCanvas.classList.add("webgl");

body.appendChild(creatCanvas);

/**
 * Loaders
 */
const loadingManager = new THREE.LoadingManager(() => {
  gsap.to(overlayMaterial.uniforms.uAlpha, {
    duration: 3,
    value: 0,
  });
});

const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath(dracoPath);

const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.setDRACOLoader(dracoLoader);

// SmoothScroll Lenis
const lenis = new Lenis({
  lerp: 0.1,
  wheelMultiplier: 0.7,
  infinite: false,
  gestureOrientation: "vertical",
  smoothWheel: true,
  normalizeWheel: false,
  smoothTouch: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

function connectToScrollTrigger() {
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
}
// Uncomment this if using GSAP ScrollTrigger
connectToScrollTrigger();

/**
 * Debug
 */
const gui = new dat.GUI();

const parameters = {
  materialColor: "#ffeded",
};

gui.addColor(parameters, "materialColor").onChange(() => {
  material.color.set(parameters.materialColor);
  particlesMaterial.color.set(parameters.materialColor);
});

/**
 * Base
 */
// Canvas
const canvas = document.querySelector(".webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */
// Texture
const textureLoader = new THREE.TextureLoader();
const matcapTexture = textureLoader.load(texturePath);

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uAlpha: { value: 1 },
  },
  vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
  fragmentShader: `
        uniform float uAlpha;

        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `,
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);

// Material
const material = new THREE.MeshMatcapMaterial();
material.matcap = matcapTexture;

// Models
// const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);
// mesh1.position.x = 2;
// scene.add(mesh1);

/**
 * Models
 */
gltfLoader.load(modelPath, (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = material;
  });
  scene.add(gltf.scene);
  gltf.scene.position.y = -2;
  gltf.scene.position.x = 1;
  gltf.scene.rotation.y = -0.8;

  // Debug
  //   gui.add(gltf.scene.position, "x", -3, 3, 0.01).name("TranslateX");
  //   gui.add(gltf.scene.position, "z", -3, 3, 0.01).name("TranslationZ");
  //   gui.add(gltf.scene.position, "y", -3, 3, 0.01).name("ElevationY");
  //   gui.add(gltf.scene.rotation, "x", -3, 3, 0.01).name("RotationX");
  //   gui.add(gltf.scene.rotation, "y", -3, 3, 0.01).name("RotationY");
  //   gui.add(gltf.scene.rotation, "z", -3, 3, 0.01).name("RotationZ");

  tick();

  // GSAP
  const tl1 = gsap.timeline({
    scrollTrigger: {
      trigger: ".section-2",
      scrub: true,
      start: "top 75%",
      end: "top 20%",
      //markers: true,
    },
  });
  tl1
    .to(
      gltf.scene.rotation,
      {
        y: "-=6",
        ease: "none",
      },
      0
    )
    .to(
      gltf.scene.position,
      {
        x: "-=3",
        ease: "none",
      },
      0
    )
    .to(
      camera.position,
      {
        z: 3,
        ease: "none",
      },
      0
    );
  const tl2 = gsap.timeline({
    scrollTrigger: {
      trigger: ".section-3",
      scrub: true,
      start: "top 75%",
      end: "top 20%",
      //markers: true,
    },
  });
  tl2
    .to(
      gltf.scene.rotation,
      {
        y: "+=6.2",
        ease: "none",
      },
      0
    )
    .to(
      gltf.scene.position,
      {
        x: "+=3",
        ease: "none",
      },
      0
    )
    .to(
      camera.position,
      {
        z: 3,
        ease: "none",
      },
      0
    );
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Scroll
 */
let scrollY = window.scrollY;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
});

/**
 * Cursor
 */
const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Animate camera
  //camera.position.y = -scrollY / sizes.height;
  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.1;
  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  //   const parallaxX = cursor.x * 0.1;
  // mesh1.rotation.y -= (parallaxX - cameraGroup.position.x) * 5 * deltaTime;

  // Animate meshes rotation
  // mesh1.rotation.x += deltaTime * 0.1;
  // mesh1.rotation.y += deltaTime * 0.1;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};
