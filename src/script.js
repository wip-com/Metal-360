import * as THREE from "three";
import * as dat from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { CustomEase } from "gsap/CustomEase";
// import MouseFollower from "mouse-follower";
import SplitType from "split-type";
import Lenis from "@studio-freight/lenis";

// gsap.registerPlugin(ScrollTrigger, CustomEase);

// WAIT FOR PAGE LOADING FUNCTION
window.addEventListener("DOMContentLoaded", (event) => {
  //-- SPLIT TEXT--//
  let typeSplit = new SplitType("[text-split]", {
    types: "words, chars",
    tagName: "span",
  });
  // Avoid flash of unstyled content
  gsap.set("[chars-slide-up] .char", { yPercent: 100 });
  gsap.set("[chars-slide-up]", { autoAlpha: 1 });
  gsap.set("[fade-up]", { yPercent: 50, autoAlpha: 0 });

  // GSAP MATCH MEDIA
  // create
  let mm = ScrollTrigger.matchMedia();

  // INIT SCROLL AND LOADING
  ("use strict"); // fix lenis in safari

  // if (Webflow.env("editor") === undefined) {
  //--------------//
  // LENIS SCROLL //
  //--------------//
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
    //parallax.animate();
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  function connectToScrollTrigger() {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    console.log("lenis connect to scrolltrigger");
  }
  // Uncomment this if using GSAP ScrollTrigger
  connectToScrollTrigger();

  // LENIS SCROLL TOP AND STOP
  function topAndStop() {
    // Function to scroll to the top of the window
    // SCROLL TOP
    $(document).ready(function () {
      $(this).scrollTop(0);
    });
    // Wait for the scrolling animation to finish and then call scrollStop()
    setTimeout(lenis.stop(), 10);
  }

  // LENIS SCROLL START
  function scrollStart() {
    lenis.start();
    console.log("Start of header animation and scroll start !");
  }

  // LENIS SCROLL TO
  // Grab all elements that have a "data-target" attribute
  const scrollButtons = document.querySelectorAll("[data-target]");

  // For each element, listen to a "click" event
  scrollButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();

      // get the DOM element by the ID (data-target value)
      var target = button.dataset.target,
        immediate = "immediate" in button.dataset !== -1 ? true : false,
        $el = document.getElementById(target.replace("#", ""));

      // Use lenis.scrollTo() to scroll the page to the right element
      lenis.scrollTo($el, {
        offset: 0,
        immediate: immediate,
        duration: 2,
        easing: (x) =>
          x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, // https://easings.net
      });
    });
  });

  //-------------------//
  // LOADING ANIMATION //
  //-------------------//
  let customEase =
    "M0,0,C0,0,0.13,0.34,0.238,0.442,0.305,0.506,0.322,0.514,0.396,0.54,0.478,0.568,0.468,0.56,0.522,0.584,0.572,0.606,0.61,0.719,0.714,0.826,0.798,0.912,1,1,1,1";
  let counter = {
    value: 0,
  };
  let loaderDuration = 3;

  // If not a first time visit in this tab
  if (sessionStorage.getItem("visited") !== null) {
    loaderDuration = 1;
    counter = {
      value: 270,
    };
  }
  sessionStorage.setItem("visited", "true");

  function updateLoaderText() {
    let progress = Math.round(counter.value);
    let loaderNumber = document.querySelector(".loader_number");

    if (loaderNumber) {
      loaderNumber.textContent = progress;
    }
  }
  function endLoaderAnimation() {
    let tl = gsap.timeline({
      onStart: initHeader,
    });
    tl.to(
      ".loader",
      {
        "--clip": "0%",
        duration: 2,
        ease: "expo.out",
      },
      "0"
    ).to(
      ".loader_content",
      {
        y: "-100",
        opacity: "0",
        duration: 0.5,
        ease: "expo.inOut",
      },
      "<"
    );
  }

  let tl = gsap.timeline({
    onStart: topAndStop,
    onComplete: endLoaderAnimation,
  });
  tl.to(counter, {
    value: 360,
    onUpdate: updateLoaderText,
    duration: loaderDuration,
    ease: CustomEase.create("custom", customEase),
  });

  //-------------------//
  // HEADING ANIMATION //
  //-------------------//
  function initHeader() {
    let tl = gsap.timeline({
      onStart: scrollStart,
    });
    tl.to(
      ".section-hero--pv0 [chars-slide-up] .char",
      {
        yPercent: 0,
        duration: 2,
        ease: "power4.out",
        stagger: 0.03,
      },
      "0"
    )
      .from(
        ".section-hero--pv0 [chars-slide-up]",
        {
          y: 150,
          duration: 2,
          delay: 0.2,
          ease: "expo.out",
        },
        "0"
      )
      .from(
        ".topbar [top-item-fx]",
        {
          y: 50,
          autoAlpha: 0,
          duration: 2,
          stagger: { each: 0.1 },
          ease: "expo.out",
        },
        "0+=25%"
      )
      .to(
        ".section-hero--pv0 [fade-up]",
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 3,
          ease: "expo.out",
        },
        "<+=10%"
      );
  }

  // INIT UTILS
  const initUtils = () => {
    // Ce code s'exécutera après que la structure html soit entièrement chargée
    ("use strict"); // fix lenis in safari

    // FULL HEIGHT 100VH TRICKS
    // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty("--vh", `${vh}px`);

    // We listen to the resize event
    window.addEventListener("resize", () => {
      // We execute the same script as before
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    });

    // COPYRIGHT YEAR
    Webflow.push(function () {
      $(".copyright-year").text(new Date().getFullYear());
    });

    //SILENCE GSAP WARNING
    gsap.config({
      nullTargetWarn: false,
    });
  };

  // CURSOR
  const setupMouse = () => {
    mm.add("(min-width: 991px)", () => {
      const cursor = new MouseFollower({
        speed: 0.6,
        ease: "expo.out",
        stickDelta: 0,
        skewing: 0.1,
        hiddenState: "-hidden",
        textState: "-text",
        iconState: "-icon",
        activeState: "-active",
        mediaState: "-media",
      });
      console.log("cursor init");

      return () => {
        // optional
        // custom cleanup code here (runs when it STOPS matching)
        cursor.destroy();
        console.log("cursor is destroy");
      };
    });
  };

  //-- OVERLAY MENU --//
  const overlayMenu = () => {
    const overlay = document.getElementById("overlay");
    // Set the GSAP animation
    if (overlay) {
      let isOpen = false;
      gsap.set(overlay, { y: "-101vh", display: "flex" });
      const overlayAnim = gsap.timeline({ paused: true });
      mm.add("(min-width: 991px)", () => {
        overlayAnim
          .to(
            overlay,
            {
              duration: 1,
              ease: "power4.out",
              y: 0,
              autoAlpha: 1,
            },
            0
          )
          .to(
            ".overlay [chars-slide-up] .char",
            {
              yPercent: 0,
              duration: 0.5,
              ease: "power4.out",
              stagger: 0.01,
            },
            "<+=20%"
          )
          .to(
            ".overlay [fade-up]",
            {
              autoAlpha: 1,
              yPercent: 0,
              duration: 0.5,
              ease: "power4.out",
              stagger: 0.1,
            },
            "<+=30%"
          );
      });

      // on mobile
      mm.add("(max-width: 990px)", () => {
        gsap.set(".overlay [chars-slide-up] .char", { yPercent: 0 });
        gsap.set(".overlay [chars-slide-up]", { autoAlpha: 1 });
        gsap.set(".overlay [fade-up]", { yPercent: 0, autoAlpha: 1 });
        overlayAnim.to(
          overlay,
          {
            duration: 1,
            ease: "power4.out",
            y: 0,
            autoAlpha: 1,
          },
          0
        );
      });

      const openMenu = document.querySelector("[open-menu]");
      const closeMenu = document.querySelector("[close-menu]");
      const hamburgers = [openMenu, closeMenu];

      if (hamburgers.length > 0) {
        hamburgers.forEach((hamburger, i) => {
          //-- Menu animation --//
          hamburger.addEventListener("click", () => {
            isOpen = !isOpen; //toggle
            if (isOpen) {
              overlayAnim.timeScale(1).play();
              openMenu.setAttribute("aria-expanded", "true");
              closeMenu.setAttribute("aria-expanded", "true");
              overlay.setAttribute("aria-hidden", "false");
              lenis.stop();
            } else {
              overlayAnim.timeScale(2).reverse();
              openMenu.setAttribute("aria-expanded", "false");
              closeMenu.setAttribute("aria-expanded", "false");
              overlay.setAttribute("aria-hidden", "true");
              lenis.start();
            }
          });
          //-- Reverse menu animation on hash link click event --//
          const overlayNavLinks = document.querySelectorAll(
            ".overlay a[href^='#']"
          );
          overlayNavLinks.forEach((link) => {
            link.addEventListener("click", () => {
              if (isOpen) {
                isOpen = !isOpen; // Toggle
                overlayAnim.timeScale(2).reverse();
                openMenu.setAttribute("aria-expanded", "false");
                closeMenu.setAttribute("aria-expanded", "false");
                overlay.setAttribute("aria-hidden", "true");
                lenis.start();
              }
            });
          });
        });
      }
    }
  };

  // MARQUEE POWER-UP
  const initMarqueeParlons = () => {
    function attr(defaultVal, attrVal) {
      const defaultValType = typeof defaultVal;
      if (typeof attrVal !== "string" || attrVal.trim() === "")
        return defaultVal;
      if (attrVal === "true" && defaultValType === "boolean") return true;
      if (attrVal === "false" && defaultValType === "boolean") return false;
      if (isNaN(attrVal) && defaultValType === "string") return attrVal;
      if (!isNaN(attrVal) && defaultValType === "number") return +attrVal;
      return defaultVal;
    }
    // marquee component
    $("[tr-marquee-element='component']").each(function (index) {
      let componentEl = $(this),
        panelEl = componentEl.find("[tr-marquee-element='panel']"),
        triggerHoverEl = componentEl.find(
          "[tr-marquee-element='triggerhover']"
        ),
        triggerClickEl = componentEl.find(
          "[tr-marquee-element='triggerclick']"
        );
      let speedSetting = attr(100, componentEl.attr("tr-marquee-speed")),
        verticalSetting = attr(false, componentEl.attr("tr-marquee-vertical")),
        reverseSetting = attr(false, componentEl.attr("tr-marquee-reverse")),
        scrollDirectionSetting = attr(
          false,
          componentEl.attr("tr-marquee-scrolldirection")
        ),
        scrollScrubSetting = attr(
          false,
          componentEl.attr("tr-marquee-scrollscrub")
        ),
        moveDistanceSetting = -100,
        timeScaleSetting = 1,
        pausedStateSetting = false;
      if (reverseSetting) moveDistanceSetting = 100;
      let marqueeTimeline = gsap.timeline({
        repeat: -1,
        onReverseComplete: () => marqueeTimeline.progress(1),
      });
      if (verticalSetting) {
        speedSetting = panelEl.first().height() / speedSetting;
        marqueeTimeline.fromTo(
          panelEl,
          { yPercent: 0 },
          {
            yPercent: moveDistanceSetting,
            ease: "none",
            duration: speedSetting,
          }
        );
      } else {
        speedSetting = panelEl.first().width() / speedSetting;
        marqueeTimeline.fromTo(
          panelEl,
          { xPercent: 0 },
          {
            xPercent: moveDistanceSetting,
            ease: "none",
            duration: speedSetting,
          }
        );
      }
      let scrubObject = { value: 1 };
      ScrollTrigger.create({
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          if (!pausedStateSetting) {
            if (scrollDirectionSetting && timeScaleSetting !== self.direction) {
              timeScaleSetting = self.direction;
              marqueeTimeline.timeScale(self.direction);
            }
            if (scrollScrubSetting) {
              let v = self.getVelocity() * 0.006;
              v = gsap.utils.clamp(-60, 60, v);
              let scrubTimeline = gsap.timeline({
                onUpdate: () => marqueeTimeline.timeScale(scrubObject.value),
              });
              scrubTimeline.fromTo(
                scrubObject,
                { value: v },
                { value: timeScaleSetting, duration: 0.5 }
              );
            }
          }
        },
      });
      function pauseMarquee(isPausing) {
        pausedStateSetting = isPausing;
        let pauseObject = { value: 1 };
        let pauseTimeline = gsap.timeline({
          onUpdate: () => marqueeTimeline.timeScale(pauseObject.value),
        });
        if (isPausing) {
          pauseTimeline.fromTo(
            pauseObject,
            { value: timeScaleSetting },
            { value: 0, duration: 0.5 }
          );
          triggerClickEl.addClass("is-paused");
        } else {
          pauseTimeline.fromTo(
            pauseObject,
            { value: 0 },
            { value: timeScaleSetting, duration: 0.5 }
          );
          triggerClickEl.removeClass("is-paused");
        }
      }
      if (window.matchMedia("(pointer: fine)").matches) {
        triggerHoverEl.on("mouseenter", () => pauseMarquee(true));
        triggerHoverEl.on("mouseleave", () => pauseMarquee(false));
      }
      triggerClickEl.on("click", function () {
        !$(this).hasClass("is-paused")
          ? pauseMarquee(true)
          : pauseMarquee(false);
      });
    });
  };

  // Ce code s'exécutera après le chargement de la structure HTMl
  //initSmoothScrolling();
  // Ce code s'exécutera après que la page soit entièrement chargée
  document.body.classList.remove("loading");
  //initAndLoading();
  initUtils();
  setupMouse();
  overlayMenu();
  initMarqueeParlons();
});

/**
 * THREE JS ESCALIER 3D + GSAP Animation
 */

THREE.ColorManagement.enabled = false;

/**
 * PATHS
 */
const dracoPath =
  "https://cdn.jsdelivr.net/gh/wip-com/Metal-360@v1/dist/draco/";
const texturePath =
  "https://cdn.jsdelivr.net/gh/wip-com/Metal-360@v1/dist/textures/matcaps/12.png";
const modelPath =
  "https://cdn.jsdelivr.net/gh/wip-com/Metal-360@v1/dist/models/escalier-v2.glb";

/**
 * Add CANVAS to main page
 */
const main = document.querySelector(".page_main");
const creatCanvas = document.createElement("canvas");
creatCanvas.classList.add("webgl");

main.appendChild(creatCanvas);

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

/**
 * Debug
 */
//const gui = new dat.GUI();

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
        x: "+=0.5",
        ease: "none",
      },
      0
    )
    .to(
      gltf.scene.position,
      {
        x: "+=3",
        y: "-=1",
        ease: "none",
      },
      0
    )
    .to(
      camera.position,
      {
        z: 6,
        ease: "none",
      },
      0
    );
  const tl3 = gsap.timeline({
    scrollTrigger: {
      trigger: ".section_team",
      scrub: true,
      start: "top 75%",
      end: "top 20%",
      //markers: true,
    },
  });
  tl3.to(
    canvas,
    {
      opacity: 0,
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
  const parallaxX = cursor.x * 0.1;
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
