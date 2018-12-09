import '@capacitor/core';
global.THREE = require('three');
import noisejs from 'noisejs';
import _ from 'lodash';
import random from 'random';
import seedrandom from 'seedrandom';
import 'three-orbitcontrols';
import OBJExporter from './OBJExporter.js';
import axios from 'axios';
import iconPath from '../png/send.png';

const ENDPOINT_URL = 'http://10.0.11.200:1337';
var settings = {
  color: 'rgb(255, 255, 255)',
  drivers: {
    driverA: 2.0, // -> inner pyramid length
    driverB: 0.6, // -> inner pyramid width
    driverC: 3.0, // -> inner pyramid height
    driverD: 1.3, // -> outer width (multiplied)
    driverE: 1.3, // -> outer height
    driverF: 1.8, // -> front stretch
    driverG: 3.0 // -> front height
  }
};

const settingsDefault = {
  color: 'rgb(255, 255, 255)',
  drivers: {
    driverA: 2.0, // -> inner pyramid length
    driverB: 0.6, // -> inner pyramid width
    driverC: 3.0, // -> inner pyramid height
    driverD: 1.3, // -> outer width (multiplied)
    driverE: 1.3, // -> outer height
    driverF: 1.8, // -> front stretch
    driverG: 3.0 // -> front height
  }
};
const noise = new noisejs.Noise();


var currentTime = 0;
var globalTime = 0;
var container;
var camera, scene, renderer;
var controls;
var boatMesh, boatGeometry, boatMaterial;
var boatVertices;
var waterMesh, waterGeometry;
var mouseX = 0;
var mouseY = 0;
var hash = '';
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var button, message;

init();
setupInput();
const animateT = _.throttle(animate, 33);
animateT();

function updateBoat() {
  boatVertices = new Array();
  boatVertices.push(settings.drivers.driverA, 0, -settings.drivers.driverA);
  boatVertices.push(settings.drivers.driverB, 0, settings.drivers.driverB);
  boatVertices.push(-settings.drivers.driverB, 0, -settings.drivers.driverB);
  boatVertices.push(-settings.drivers.driverA, 0, settings.drivers.driverA);
  // TOP
  boatVertices.push(0, settings.drivers.driverC, 0);
  // Outer: Right
  boatVertices.push(
    settings.drivers.driverB * settings.drivers.driverD,
    settings.drivers.driverE,
    settings.drivers.driverB * settings.drivers.driverD
  );
  // Outer: Left
  boatVertices.push(
    -settings.drivers.driverB * settings.drivers.driverD,
    settings.drivers.driverE,
    -settings.drivers.driverB * settings.drivers.driverD
  );
  // Outer: Front
  boatVertices.push(
    -settings.drivers.driverA * settings.drivers.driverF,
    settings.drivers.driverG,
    settings.drivers.driverA * settings.drivers.driverF
  );
  // Outer: Back
  boatVertices.push(
    settings.drivers.driverA * settings.drivers.driverF,
    settings.drivers.driverG,
    -settings.drivers.driverA * settings.drivers.driverF
  );
  const indices = [
    4,
    0,
    1,
    4,
    2,
    3,
    4,
    1,
    3,
    4,
    2,
    0,
    5,
    0,
    1,
    5,
    1,
    3,
    6,
    2,
    3,
    6,
    2,
    0,
    7,
    6,
    3,
    7,
    5,
    3,
    8,
    6,
    0,
    5,
    8,
    0
  ];
  boatGeometry.setIndex(indices);
  boatGeometry.addAttribute(
    'position',
    new THREE.Float32BufferAttribute(boatVertices, 3)
  );
  boatGeometry.computeVertexNormals();
  boatMesh.material.color = new THREE.Color(settings.color);
}

function buildWater() {
  const size = 50;
  const divisions = 20;
  waterGeometry = new THREE.PlaneBufferGeometry(
    size,
    size,
    divisions,
    divisions
  );
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x444466,
    side: THREE.DoubleSide,
    opacity: 1.0,
    flatShading: true,
    roughness: 1.0
  });
  waterMesh = new THREE.Mesh(waterGeometry, material);
  waterMesh.rotation.x = Math.PI / 2;
  waterMesh.position.y = 0.45;
}

function updateWater() {
  const verts = waterMesh.geometry.attributes.position.array;
  for (var i = 0; i < verts.length; i += 3) {
    const x = verts[i] / 3.0;
    const y = verts[i + 1] / 3.0;
    verts[i + 2] =
      noise.perlin2(x + globalTime / 2.0, y + globalTime / 2.0) * 0.85;
  }
  waterMesh.geometry.attributes.position.needsUpdate = true;
}

function buildBoat() {
  boatVertices = new Array();
  boatVertices.push(settings.drivers.driverA, 0, -settings.drivers.driverA);
  boatVertices.push(settings.drivers.driverB, 0, settings.drivers.driverB);
  boatVertices.push(-settings.drivers.driverB, 0, -settings.drivers.driverB);
  boatVertices.push(-settings.drivers.driverA, 0, settings.drivers.driverA);
  // Top
  boatVertices.push(0, settings.drivers.driverC, 0);
  // Outer: Right
  boatVertices.push(
    settings.drivers.driverB * settings.drivers.driverD,
    settings.drivers.driverE,
    settings.drivers.driverB * settings.drivers.driverD
  );
  // Outer: Left
  boatVertices.push(
    -settings.drivers.driverB * settings.drivers.driverD,
    settings.drivers.driverE,
    -settings.drivers.driverB * settings.drivers.driverD
  );
  // Outer: Front
  boatVertices.push(
    -settings.drivers.driverA * settings.drivers.driverF,
    settings.drivers.driverG,
    settings.drivers.driverA * settings.drivers.driverF
  );
  // Outer: Back
  boatVertices.push(
    settings.drivers.driverA * settings.drivers.driverF,
    settings.drivers.driverG,
    -settings.drivers.driverA * settings.drivers.driverF
  );
  const indices = [
    4,
    0,
    1,
    4,
    2,
    3,
    4,
    1,
    3,
    4,
    2,
    0,
    5,
    0,
    1,
    5,
    1,
    3,
    6,
    2,
    3,
    6,
    2,
    0,
    7,
    6,
    3,
    7,
    5,
    3,
    8,
    6,
    0,
    5,
    8,
    0
  ];
  boatGeometry = new THREE.BufferGeometry();
  boatGeometry.setIndex(indices);
  boatGeometry.addAttribute(
    'position',
    new THREE.Float32BufferAttribute(boatVertices, 3)
  );
  boatGeometry.computeVertexNormals();
  boatMaterial = new THREE.MeshPhysicalMaterial({
    color: settings.color,
    roughness: 0.95,
    flatShading: true,
    side: THREE.DoubleSide
  });
  boatMesh = new THREE.Mesh(boatGeometry, boatMaterial);
  boatMesh.geometry.attributes.position.needsUpdate = true;
}

function init() {
  container = document.getElementById('container');
  camera = new THREE.PerspectiveCamera(
    20,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(5, 16, 50);
  camera.lookAt(new THREE.Vector3(-0.5, 1, 0));

  controls = new THREE.OrbitControls(camera);
  controls.minDistance = 30;
  controls.maxDistance = 60;
  controls.minPolarAngle = Math.PI / 2 - Math.PI / 12;
  controls.maxPolarAngle = Math.PI / 2 - Math.PI / 12;
  controls.enableKeys = false;
  controls.enablePan = false;
  console.log(controls);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  var light = new THREE.DirectionalLight({
    color: 0xffffff,
    intensity: 5.0
  });
  light.position.set(0, 5, 30);
  scene.add(light);
  var light = new THREE.DirectionalLight({
    color: 0xffffff,
    intensity: 5.0
  });
  light.position.set(0, 5, -30);
  scene.add(light);

  scene.fog = new THREE.Fog(0x000, 55, 70);
  buildWater();
  scene.add(waterMesh);
  buildBoat();
  scene.add(boatMesh);

  // Disable right click
  function onContextMenu(event) {
    event.preventDefault();
  }
  window.addEventListener('contextmenu', onContextMenu, false);

  renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // Event listeners
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
  // mouseX = ( event.clientX - windowHalfX );
  // mouseY = ( event.clientY - windowHalfY );
}

function animate() {
  requestAnimationFrame(animate);
  var now = Date.now();
  var deltaTime = now - currentTime;
  render();
  currentTime = now;
  globalTime += deltaTime * 0.001;
}

function render() {
  boatMesh.position.y = ((Math.sin(globalTime) + 1.0) / 2.0) * 0.1 + 0.2;
  boatMesh.rotation.x = Math.sin(globalTime * 2.0) * 0.015;
  boatMesh.rotation.z = Math.sin(globalTime * 1.8) * 0.055;
  scene.rotation.y = Math.sin(globalTime / 10.0) * 0.33;
  renderer.render(scene, camera);
  updateBoat();
  updateWater();
}

function hashCode(str) {
  var hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function updateSettings(ev) {
  // Message hash
  message = ev.target.value;
  if (message.length > 3) {
    button.removeAttribute('disabled');
  }
  if (message.length <= 3) {
    button.setAttribute('disabled', true);
  }
  hash = hashCode(message);
  const seed = Math.abs(hash / (message.length + 1)) + 1;
  random.use(seedrandom(seed));
  const poisson = random.poisson((lambda = 200.0));
  const randDriverA = poisson() / 100.0 - 0.5;
  const randDriverB = poisson() / 100.0 - 1.5;
  const randDriverC = poisson() / 70.0;
  const randDriverD = poisson() / 80.0 - 0.5;
  const randDriverE = poisson() / 78.0 - 0.85;
  const randDriverF = poisson() / 100.0;
  const randDriverG = poisson() / 50.0 - 1.0;
  const hue = random.uniform(0, 360);

  const timeout = setTimeout(() => {
    settings.color = `hsl(${hue()}, 92%, 90%)`;
    settings.drivers = {
      driverA: randDriverA, // -> inner pyramid length
      driverB: randDriverB, // -> inner pyramid width
      driverC: randDriverC, // -> inner pyramid height
      driverD: randDriverD, // -> outer width (multiplied)
      driverE: randDriverE, // -> outer height (multiplied)
      driverF: randDriverF, // -> front stretch (multiplied)
      driverG: randDriverG // -> front height (multiplied)
    };
  }, 1500);
}

function setupInput() {
  document.addEventListener('DOMContentLoaded', function() {
    const input = document.createElement('textarea');
    input.setAttribute('maxlength', 250);
    input.setAttribute('placeholer', 'Sende deine Nachricht als Boot');

    input.addEventListener('click', ev => {
      input.focus();
    });
    input.addEventListener('input', _.throttle(updateSettings, 2000));
    const inputMount = document.querySelector('#input');
    inputMount.appendChild(input);
    input.focus();

    button = document.createElement('button');
    const icon = document.createElement('img');
    const image = 
    icon.src = iconPath;
    button.setAttribute('disabled', true);
    button.appendChild(icon);
    icon.setAttribute('width', '60');
    icon.setAttribute('height', '60');
    button.addEventListener('click', ev => {
      const boatMeshClone = boatMesh.clone();
      boatMeshClone.position.y = 0;
      boatMeshClone.rotation.x = 0;
      boatMeshClone.rotation.z = 0;
      boatMeshClone.rotation.y = 90;
      const exporter = new THREE.OBJExporter();
      const obj = exporter.parse(boatMeshClone);

      function onSuccess() {
        input.value = '';
        button.setAttribute('disabled', true);
        settings = settingsDefault;
      }

      // --- Upload
      const payload = {
        message: message,
        hash: `${Math.abs(hash)}--${settings.color}`,
        data: obj
      };

      // console.log(window.navigator);
      // if (window.navigator !== undefined) {
      //   axios
      //     .post(ENDPOINT_URL, payload)
      //     .then(res => {
      //       onSuccess();
      //       console.log(res);
      //     })
      //     .catch(err => console.log(err));
      // } else {
      cordovaHTTP.post(
        ENDPOINT_URL,
        payload,
        {},
        function(response) {
          // console.log(response.status);
          onSuccess();
        },
        function(response) {
          // console.error(response.error);
        }
      );
      // }

      // --- Download
      // const link = document.createElement('A');
      // document.body.appendChild(link);
      // const objDataURL = `data:text/plain;charset=utf-8,${encodeURIComponent(
      //   obj
      // )}`;
      // link.setAttribute('href', objDataURL);
      // link.setAttribute('download', `boat.${hash}.obj`);
      // link.click();
      // console.log(link);
      // document.body.removeChild(link);
    });
    inputMount.appendChild(button);
  });
}
