// public/js/guitar.js

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("guitarCanvas");
  const ctx = canvas.getContext("2d");

  // 현재 선택된 코드와 코드 유지 방식
  let currentChord = null;
  let sustainChord = false; // 코드 유지 방식: false - 누르고 있을 때만, true - 한 번 누르면 유지

  // 사용자가 선택할 수 있도록 옵션 제공
  const chordModeSelect = document.getElementById("chordMode");
  chordModeSelect.addEventListener("change", (e) => {
    sustainChord = e.target.value === "sustain";
  });

  // 코드 키와 번호
  const chordKeys = ["C", "D", "E", "F", "G", "A", "B"];
  const chordNumbers = ["1", "2", "3", "4", "5"];

  // 현 키
  const stringKeys = ["6", "7", "8", "9", "0", "-"];

  // 현재 누르고 있는 키
  let pressedChordKey = null;
  let pressedChordNumber = null;

  // 사운드 컨텍스트
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // 코드와 주파수 매핑
  const chordFrequencies = {
    C1: 261.63,
    C2: 277.18,
    C3: 293.66,
    C4: 311.13,
    C5: 329.63,
    // 다른 코드 추가
  };

  // 녹음 관련 변수
  let mediaRecorder;
  let recordedChunks = [];
  let dest; // 오디오 노드를 연결할 목적지

  const recordButton = document.getElementById("recordButton");
  const stopButton = document.getElementById("stopButton");

  // 키보드 이벤트 리스너
  document.addEventListener("keydown", (e) => {
    const key = e.key.toUpperCase();

    // 왼손 코드 키 처리
    if (chordKeys.includes(key)) {
      pressedChordKey = key;
      updateCurrentChord();
    }
    if (chordNumbers.includes(e.key)) {
      pressedChordNumber = e.key;
      updateCurrentChord();
    }

    // 오른손 현 키 처리
    if (stringKeys.includes(e.key)) {
      playString(e.key);
      animateString(e.key);
    }
  });

  document.addEventListener("keyup", (e) => {
    const key = e.key.toUpperCase();

    // 코드 유지 방식에 따라 코드 해제
    if (!sustainChord) {
      if (chordKeys.includes(key)) {
        pressedChordKey = null;
        updateCurrentChord();
      }
      if (chordNumbers.includes(e.key)) {
        pressedChordNumber = null;
        updateCurrentChord();
      }
    }
  });

  function updateCurrentChord() {
    if (pressedChordKey && pressedChordNumber) {
      currentChord = pressedChordKey + pressedChordNumber;
    } else {
      currentChord = null;
    }
  }

  function playString(stringKey) {
    if (!currentChord) return;

    const frequency = chordFrequencies[currentChord];
    if (!frequency) return;

    const oscillator = audioCtx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // 녹음 중일 경우 dest로 연결
    if (mediaRecorder && mediaRecorder.state === "recording") {
      gainNode.connect(dest);
    }

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 2);
  }

  function animateString(stringKey) {
    // 현의 위치를 정의합니다.
    const stringPositions = {
      6: 50,
      7: 100,
      8: 150,
      9: 200,
      0: 250,
      "-": 300,
    };

    const y = stringPositions[stringKey];
    let amplitude = 10;
    let decay = 0.95;

    function vibrate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGuitar();

      // 진동 효과를 적용합니다.
      let offset = amplitude * Math.sin(Date.now() / 100);
      ctx.beginPath();
      ctx.moveTo(0, y + offset);
      ctx.lineTo(canvas.width, y + offset);
      ctx.stroke();

      amplitude *= decay;
      if (amplitude > 0.1) {
        requestAnimationFrame(vibrate);
      }
    }

    vibrate();
  }

  function drawGuitar() {
    // 기타를 그리는 로직을 여기에 추가합니다.
    // 예를 들어, 현을 그립니다.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "black";
    const stringYs = [50, 100, 150, 200, 250, 300];
    stringYs.forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    });
  }

  function animate() {
    drawGuitar();
    requestAnimationFrame(animate);
  }

  animate();

  // 녹음 기능 구현
  recordButton.addEventListener("click", () => {
    // 녹음 시작
    dest = audioCtx.createMediaStreamDestination();
    mediaRecorder = new MediaRecorder(dest.stream);
    mediaRecorder.start();

    mediaRecorder.ondataavailable = (e) => {
      recordedChunks.push(e.data);
    };
  });

  stopButton.addEventListener("click", () => {
    // 녹음 정지
    mediaRecorder.stop();

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "audio/webm" });
      recordedChunks = [];

      // 서버로 업로드
      const formData = new FormData();
      formData.append("audio", blob);

      fetch("/music/upload", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          alert("녹음이 업로드되었습니다.");
        })
        .catch((error) => {
          console.error("업로드 중 오류 발생:", error);
        });
    };
  });

  // 악보 업로드 기능
  const sheetMusicInput = document.getElementById("sheetMusicInput");
  const sheetMusicImage = document.getElementById("sheetMusicImage");

  sheetMusicInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        sheetMusicImage.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
});
