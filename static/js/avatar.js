// === Avatar 3D de Lênia — Versão Centralizada ===
(function(){
  const canvas = document.getElementById('avatar-canvas');
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf4f6ff);

  // === Câmera levemente acima e voltada para o centro ===
  const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 1.3, 3);
  camera.lookAt(0, 1.2, 0);

  // === Luzes ===
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(2, 4, 3);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));

  // === Avatar ===
  const avatar = new THREE.Group();
  avatar.position.set(0, 0, 0);
  scene.add(avatar);

  // Cabeça
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 32, 32),
    new THREE.MeshStandardMaterial({color: 0xffd7b5, roughness: 0.6})
  );
  head.position.y = 1.2;
  avatar.add(head);

  // Cabelo
  const hair = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.8, 1.2),
    new THREE.MeshStandardMaterial({color: 0x222244})
  );
  hair.position.set(0, 1.5, 0);
  avatar.add(hair);

  // Olhos
  const eyeWhiteMat = new THREE.MeshBasicMaterial({color: 0xffffff});
  const pupilMat = new THREE.MeshBasicMaterial({color: 0x000000});
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), eyeWhiteMat);
  const eyeR = eyeL.clone();
  const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), pupilMat);
  const pupilR = pupilL.clone();
  eyeL.position.set(-0.26, 1.28, 0.66);
  eyeR.position.set(0.26, 1.28, 0.66);
  pupilL.position.set(-0.26, 1.28, 0.74);
  pupilR.position.set(0.26, 1.28, 0.74);
  avatar.add(eyeL, eyeR, pupilL, pupilR);

  // Boca
  const mouth = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 12),
    new THREE.MeshStandardMaterial({color: 0x7a1f1f})
  );
  mouth.position.set(0, 1.03, 0.68);
  mouth.scale.set(1, 0.35, 0.6);
  avatar.add(mouth);

  // Tronco
  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 1.2, 0.8),
    new THREE.MeshStandardMaterial({color: 0x3b3b98})
  );
  torso.position.y = 0.2;
  avatar.add(torso);

  // === Movimento: respiração e leve oscilação natural ===
  let mouthTarget = 0.35;
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.02;
    // Leve movimento vertical (respiração)
    avatar.position.y = Math.sin(t) * 0.03;
    // Pequeno giro oscilante (sem girar completamente)
    avatar.rotation.y = Math.sin(t / 2) * 0.15;
    // Boca animada
    mouth.scale.y += (mouthTarget - mouth.scale.y) * 0.2;
    renderer.render(scene, camera);
  }
  animate();

  // === Interação ===
  const askBtn = document.getElementById('askBtn');
  const questionInput = document.getElementById('question');
  const responseBox = document.getElementById('responseBox');
  const responseText = document.getElementById('responseText');
  const responseMeta = document.getElementById('responseMeta');

  async function askNotebook(question) {
    const res = await fetch('/ask', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({question})
    });
    return res.json();
  }

  function speak(text) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'pt-BR';
    utter.rate = 0.95;
    utter.pitch = 1.0;
    utter.onstart = () => {
      window._lenia_voice = setInterval(() => {
        mouthTarget = 0.3 + Math.random() * 0.7;
      }, 120);
    };
    utter.onend = () => {
      clearInterval(window._lenia_voice);
      mouthTarget = 0.35;
    };
    speechSynthesis.speak(utter);
  }

  askBtn.addEventListener('click', async () => {
    const q = questionInput.value.trim();
    if (!q) return;
    askBtn.disabled = true;
    responseBox.hidden = true;
    try {
      const data = await askNotebook(q);
      const answer = data.answer || "Ainda estou pensando sobre isso...";
      const source = data.source || "(sem fonte)";
      responseText.textContent = answer;
      responseMeta.textContent = "Fonte: " + source;
      responseBox.hidden = false;
      speak(answer);
    } catch (err) {
      responseText.textContent = "Erro: " + err.message;
      responseBox.hidden = false;
    } finally {
      askBtn.disabled = false;
    }
  });
})();


