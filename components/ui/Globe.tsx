"use client";
import { useEffect, useRef, useState } from "react";
import { Color, Scene, Fog, PerspectiveCamera, Vector3 } from "three";
import ThreeGlobe from "three-globe";
import { useThree, Object3DNode, Canvas, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import countries from "@/data/globe.json";
declare module "@react-three/fiber" {
  interface ThreeElements {
    threeGlobe: Object3DNode<ThreeGlobe, typeof ThreeGlobe>;
  }
}

extend({ ThreeGlobe });

const RING_PROPAGATION_SPEED = 3;
const aspect = 1.2;
const cameraZ = 300;

type Position = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
};

export type GlobeConfig = {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialPosition?: {
    lat: number;
    lng: number;
  };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
};

interface WorldProps {
  globeConfig: GlobeConfig;
  data: Position[];
}

let numbersOfRings = [0];

/**
 * A Three.js globe component that renders a globe with lines and points on it.
 * The globe is interactive and can be rotated and zoomed.
 * The globe can also be configured to show atmosphere and ambient light.
 * The globe can also be configured to start an animation of the lines and points.
 *
 * @param {{ globeConfig: GlobeConfig; data: Position[]; }} props
 * The props object must contain a globeConfig property which is an object
 * that contains the configuration for the globe.
 * The props object must also contain a data property which is an array of
 * objects that contain the data for the lines and points on the globe.
 * Each object in the data array must contain the following properties:
 * - startLat: The starting latitude of the line.
 * - startLng: The starting longitude of the line.
 * - endLat: The ending latitude of the line.
 * - endLng: The ending longitude of the line.
 * - arcAlt: The altitude of the line.
 * - color: The color of the line.
 * - order: The order of the line.
 * The data array can also contain the following properties:
 * - pointSize: The size of the points on the globe.
 * - globeColor: The color of the globe.
 * - showAtmosphere: A boolean that indicates whether to show atmosphere or not.
 * - atmosphereColor: The color of the atmosphere.
 * - atmosphereAltitude: The altitude of the atmosphere.
 * - polygonColor: The color of the polygons on the globe.
 * - ambientLight: The color of the ambient light.
 * - directionalLeftLight: The color of the directional light on the left.
 * - directionalTopLight: The color of the directional light on the top.
 * - pointLight: The color of the point light.
 * - arcTime: The time it takes to animate one arc.
 * - arcLength: The length of the arc.
 * - rings: The number of rings on the globe.
 * - maxRings: The maximum number of rings on the globe.
 * - initialPosition: The initial position of the globe.
 * - autoRotate: A boolean that indicates whether to auto rotate the globe or not.
 * - autoRotateSpeed: The speed of the auto rotation.
 */
export function Globe({ globeConfig, data }: WorldProps) {
  const [globeData, setGlobeData] = useState<
    | {
        size: number;
        order: number;
        color: (t: number) => string;
        lat: number;
        lng: number;
      }[]
    | null
  >(null);

  const globeRef = useRef<ThreeGlobe | null>(null);

  const defaultProps = {
    pointSize: 1,
    atmosphereColor: "#ffffff",
    showAtmosphere: true,
    atmosphereAltitude: 0.1,
    polygonColor: "rgba(255,255,255,0.7)",
    globeColor: "#1d072e",
    emissive: "#000000",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    arcTime: 2000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    ...globeConfig,
  };

  useEffect(() => {
    if (globeRef.current) {
      _buildData();
      _buildMaterial();
    }
  }, [globeRef.current]);

/**
 * Builds and updates the material properties for the globe.
 * Ensures the globe's material is set with the specified color, emissive properties, emissive intensity, and shininess
 * from the globe configuration. If a property is not provided, defaults are used.
 */
  const _buildMaterial = () => {
    if (!globeRef.current) return;

    const globeMaterial = globeRef.current.globeMaterial() as unknown as {
      color: Color;
      emissive: Color;
      emissiveIntensity: number;
      shininess: number;
    };
    globeMaterial.color = new Color(globeConfig.globeColor);
    globeMaterial.emissive = new Color(globeConfig.emissive);
    globeMaterial.emissiveIntensity = globeConfig.emissiveIntensity || 0.1;
    globeMaterial.shininess = globeConfig.shininess || 0.9;
  };

  const _buildData = () => {
    const arcs = data;
    let points = [];
    for (let i = 0; i < arcs.length; i++) {
      const arc = arcs[i];
      const rgb = hexToRgb(arc.color) as { r: number; g: number; b: number };
      points.push({
        size: defaultProps.pointSize,
        order: arc.order,
        color: (t: number) => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${1 - t})`,
        lat: arc.startLat,
        lng: arc.startLng,
      });
      points.push({
        size: defaultProps.pointSize,
        order: arc.order,
        color: (t: number) => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${1 - t})`,
        lat: arc.endLat,
        lng: arc.endLng,
      });
    }

    // remove duplicates for same lat and lng
    const filteredPoints = points.filter(
      (v, i, a) =>
        a.findIndex((v2) =>
          ["lat", "lng"].every(
            (k) => v2[k as "lat" | "lng"] === v[k as "lat" | "lng"]
          )
        ) === i
    );

    setGlobeData(filteredPoints);
  };

  useEffect(() => {
    if (globeRef.current && globeData) {
      globeRef.current
        .hexPolygonsData(countries.features)
        .hexPolygonResolution(3)
        .hexPolygonMargin(0.7)
        .showAtmosphere(defaultProps.showAtmosphere)
        .atmosphereColor(defaultProps.atmosphereColor)
        .atmosphereAltitude(defaultProps.atmosphereAltitude)
        .hexPolygonColor((e) => {
          return defaultProps.polygonColor;
        });
      startAnimation();
    }
  }, [globeData]);

/**
 * Starts the globe animation by setting arcs, points, and rings data
 * on the globe instance.
 * 
 * - Arcs are created between start and end latitudes and longitudes,
 *   colored based on the data provided, with specified altitude,
 *   stroke, dash length, gap, and animation time.
 * 
 * - Points are colored and merged based on the data, with a fixed
 *   altitude and radius.
 * 
 * - Rings are set with color, maximum radius, propagation speed, and
 *   repeat period based on defined properties.
 * 
 * This function does not execute if the globe reference is not set or
 * if there is no globe data available.
 */
  const startAnimation = () => {
    if (!globeRef.current || !globeData) return;

    globeRef.current
      .arcsData(data)
      .arcStartLat((d) => (d as { startLat: number }).startLat * 1)
      .arcStartLng((d) => (d as { startLng: number }).startLng * 1)
      .arcEndLat((d) => (d as { endLat: number }).endLat * 1)
      .arcEndLng((d) => (d as { endLng: number }).endLng * 1)
      .arcColor((e: any) => (e as { color: string }).color)
      .arcAltitude((e) => {
        return (e as { arcAlt: number }).arcAlt * 1;
      })
      .arcStroke((e) => {
        return [0.32, 0.28, 0.3][Math.round(Math.random() * 2)];
      })
      .arcDashLength(defaultProps.arcLength)
      .arcDashInitialGap((e) => (e as { order: number }).order * 1)
      .arcDashGap(15)
      .arcDashAnimateTime((e) => defaultProps.arcTime);

    globeRef.current
      .pointsData(data)
      .pointColor((e) => (e as { color: string }).color)
      .pointsMerge(true)
      .pointAltitude(0.0)
      .pointRadius(2);

    globeRef.current
      .ringsData([])
      .ringColor((e: any) => (t: any) => e.color(t))
      .ringMaxRadius(defaultProps.maxRings)
      .ringPropagationSpeed(RING_PROPAGATION_SPEED)
      .ringRepeatPeriod(
        (defaultProps.arcTime * defaultProps.arcLength) / defaultProps.rings
      );
  };

  useEffect(() => {
    if (!globeRef.current || !globeData) return;

    const interval = setInterval(() => {
      if (!globeRef.current || !globeData) return;
      numbersOfRings = genRandomNumbers(
        0,
        data.length,
        Math.floor((data.length * 4) / 5)
      );

      globeRef.current.ringsData(
        globeData.filter((d, i) => numbersOfRings.includes(i))
      );
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [globeRef.current, globeData]);

  return (
    <>
      <threeGlobe ref={globeRef} />
    </>
  );
}

/**
 * Configures the WebGL renderer by setting the pixel ratio, size, and clear color.
 * 
 * - Sets the pixel ratio to match the device's pixel density for clearer visuals.
 * - Adjusts the renderer size to fit the current viewport dimensions.
 * - Sets a transparent clear color with a specific hexadecimal value.
 * 
 * This effect runs once on initial render and uses the `useThree` hook to access 
 * the WebGL renderer and the current canvas size.
 */
export function WebGLRendererConfig() {
  const { gl, size } = useThree();

  useEffect(() => {
    gl.setPixelRatio(window.devicePixelRatio);
    gl.setSize(size.width, size.height);
    gl.setClearColor(0xffaaff, 0);
  }, []);

  return null;
}

/**
 * The World component is a React component that creates a Three.js scene
 * containing a ThreeGlobe and OrbitControls. It is used to create a globe
 * visualization.
 *
 * The World component takes a single prop, `globeConfig`, which is an object
 * containing configuration options for the globe. The object must contain the
 * following keys:
 *
 * - `ambientLight`: The color of the ambient light in the scene.
 * - `directionalLeftLight`: The color of the directional light coming from
 *   the left side of the scene.
 * - `directionalTopLight`: The color of the directional light coming from
 *   the top of the scene.
 * - `pointLight`: The color of the point light in the scene.
 *
 * The World component will render a globe visualization with the specified
 * lighting configuration.
 */
export function World(props: WorldProps) {
  const { globeConfig } = props;
  const scene = new Scene();
  scene.fog = new Fog(0xffffff, 400, 2000);
  return (
    <Canvas scene={scene} camera={new PerspectiveCamera(50, aspect, 180, 1800)}>
      <WebGLRendererConfig />
      <ambientLight color={globeConfig.ambientLight} intensity={0.6} />
      <directionalLight
        color={globeConfig.directionalLeftLight}
        position={new Vector3(-400, 100, 400)}
      />
      <directionalLight
        color={globeConfig.directionalTopLight}
        position={new Vector3(-200, 500, 200)}
      />
      <pointLight
        color={globeConfig.pointLight}
        position={new Vector3(-200, 500, 200)}
        intensity={0.8}
      />
      <Globe {...props} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minDistance={cameraZ}
        maxDistance={cameraZ}
        autoRotateSpeed={1}
        autoRotate={true}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI - Math.PI / 3}
      />
    </Canvas>
  );
}

/**
 * Converts a hex color code to an RGB object.
 *
 * This function takes a hex string, which can be in shorthand (#RGB) or 
 * full form (#RRGGBB), and converts it to an object containing the 
 * red, green, and blue components as integers.
 *
 * @param hex - The hex color code string to convert.
 * @returns An object with `r`, `g`, and `b` properties representing
 *          the red, green, and blue color components, or null if the 
 *          input is not a valid hex color code.
 */
export function hexToRgb(hex: string) {
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Generates an array of unique random numbers between the given min and max values.
 *
 * The function takes three parameters: the minimum value, the maximum value, and
 * the count of numbers to generate. It returns an array of `count` unique random
 * numbers between `min` and `max` (inclusive). If the range is too small to
 * generate `count` unique numbers, the function will return fewer numbers.
 *
 * @param min - The minimum value of the range.
 * @param max - The maximum value of the range.
 * @param count - The count of numbers to generate.
 * @returns An array of unique random numbers between `min` and `max`.
 */
export function genRandomNumbers(min: number, max: number, count: number) {
  const arr = [];
  while (arr.length < count) {
    const r = Math.floor(Math.random() * (max - min)) + min;
    if (arr.indexOf(r) === -1) arr.push(r);
  }

  return arr;
}