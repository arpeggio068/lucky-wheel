var store = localforage.createInstance({
    name: "myDatabaseScammer888"
  });   

  const canvas = document.getElementById("wheel");
  const ctx = canvas.getContext("2d");
  const spinBtn = document.getElementById("spinBtn");
  const result = document.getElementById("result");

  const prizes = ["1X", "1.5X", "2X", "2.5X", "3X", "-1X", "-1.5X", "-2X", "-2.5X", "-3X"];
  const numSegments = prizes.length;
  const arcSize = (2 * Math.PI) / numSegments;

  // 🌀 วาดวงล้อ
  function drawWheel(highlightIndex = -1, blink = false) {
    ctx.clearRect(0, 0, 400, 400);
    for (let i = 0; i < numSegments; i++) {
      const angle = i * arcSize;
      ctx.beginPath();
      ctx.moveTo(200, 200);
      ctx.arc(200, 200, 200, angle, angle + arcSize);
      ctx.fillStyle = i % 2 === 0 ? "#ffcc00" : "#ff9966";
      ctx.fill();

      ctx.save();
      ctx.translate(200, 200);
      ctx.rotate(angle + arcSize / 2);
      ctx.font = "bold 22px Prompt";
      ctx.textAlign = "right";

      if (i === highlightIndex) {
        ctx.fillStyle = blink ? "transparent" : "red";
      } else {
        ctx.fillStyle = "#333";
      }

      ctx.fillText(prizes[i], 180, 10);
      ctx.restore();
    }
  }

  drawWheel();

  let currentRotation = 0;
 // ตัวแปรนับจำนวนรอบ (ประกาศไว้นอก event listener)
let spinCount = 0;
let negativeCountInSet = 0;

spinBtn.addEventListener("click", async () => {
  spinBtn.disabled = true;
  console.log("negativeCountInSet:", negativeCountInSet);
  console.log("spinCount:", spinCount);

  // 🧹 รีเซ็ตข้อความในวงล้อให้กลับเป็นสีตั้งต้น
  drawWheel();
  result.textContent = "กำลังหมุน...";

  // เพิ่มตัวนับรอบ
  spinCount++;

  // เมื่อครบ 10 รอบให้รีเซ็ตตัวนับชุดใหม่
  if (spinCount % 10 === 1) {
    negativeCountInSet = 0;
  }

  // 🧩 แยกกลุ่มบวก/ลบ
  const positivePrizes = prizes.filter(p => !p.startsWith("-"));
  const negativePrizes = prizes.filter(p => p.startsWith("-"));

  let chosenPrize;

  // เงื่อนไข: ในแต่ละชุด 10 รอบ ให้ค่าลบไม่เกิน 3 ครั้ง
  if (negativeCountInSet < 3) {
    const isNegativeRound = Math.random() < 0.3; // 30% โอกาสเป็นค่าลบ
    if (isNegativeRound) {
      chosenPrize = negativePrizes[Math.floor(Math.random() * negativePrizes.length)];
      negativeCountInSet++;
    } else {
      chosenPrize = positivePrizes[Math.floor(Math.random() * positivePrizes.length)];
    }
  } else {
    chosenPrize = positivePrizes[Math.floor(Math.random() * positivePrizes.length)];
  }

  // หา index จริงใน array prizes เดิม
  const actualIndex = prizes.indexOf(chosenPrize);

  const extraSpins = 5;
  const targetAngle = (360 / numSegments) * actualIndex + 360 * extraSpins + 18;

  currentRotation += targetAngle;
  canvas.style.transition = "transform 5s cubic-bezier(0.2, 0.9, 0.3, 1)";
  canvas.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(async () => {
    const winning = prizes[actualIndex];
    result.innerHTML = `🎉 ผลลัพธ์: <b>${winning}</b>`;

    // 🧮 คำนวณรางวัล
    const bet = parseInt(document.getElementById("betAmount").value);
    const multiplier = parseFloat(winning.replace("X", "")); // "2.5X" → 2.5
    const reward = bet * multiplier;

    // ✅ อัปเดตยอดเงิน
    gEquity += reward;
    document.getElementById("equityValue").textContent = gEquity.toLocaleString();

    // ✅ บันทึกกลับลง localforage
    await store.setItem("equity", gEquity);
    console.log(`🏦 Updated equity: ${gEquity}`);

    // 🌟 แสดง SweetAlert2
    if (reward > 0) {
      Swal.fire({
        icon: "success",
        title: "🎉 ชนะ!",
        html: `<h3 style="color:green;">ได้รับ: ${reward.toLocaleString()} บาท</h3>`,
        background: "#f6fff5",
        confirmButtonColor: "#28a745",
        confirmButtonText: "ตกลง"
      });
    } else if (reward < 0) {
      Swal.fire({
        icon: "error",
        title: "😢 แพ้!",
        html: `<h3 style="color:red;">เสียเงิน: ${reward.toLocaleString()} บาท</h3>`,
        background: "#fff5f5",
        confirmButtonColor: "#d33",
        confirmButtonText: "โอเค"
      });
    } else {
      Swal.fire({
        icon: "info",
        title: "เสมอ",
        text: "ไม่ได้ไม่เสีย",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "ตกลง"
      });
    }

    // 🌟 กระพริบข้อความในวงล้อ
    let blinkCount = 0;
    const blinkInterval = setInterval(() => {
      drawWheel(actualIndex, blinkCount % 2 === 0);
      blinkCount++;
      if (blinkCount > 6) { // กระพริบ 3 ครั้ง
        clearInterval(blinkInterval);
        drawWheel(actualIndex, false);
        spinBtn.disabled = false;
      }
    }, 300);
  }, 5000);

});

document.getElementById("btn1").addEventListener("click", async () => {
  const nameInput = document.getElementById("victim_name");
  const name = nameInput.value.trim();

  if (!name) {
    Swal.fire({
      icon: "warning",
      title: "⚠️ โปรดระบุชื่อ-สกุลก่อนเล่นเกม!",
      confirmButtonColor: "#ffcc00"
    });
    nameInput.focus();
    return;
  }

  try {
    // ✅ บันทึกชื่อใน localforage
    await store.setItem("victim_name", name);

    // ✅ แสดง SweetAlert แจ้งผล
    Swal.fire({
      icon: "success",
      title: `🎯 ยินดีต้อนรับ ${name}!`,
      html: "ได้รับยอดเงิน 100,000 บาท <br> ขอให้โชคดีในการหมุนวงล้อ 🍀",
      confirmButtonColor: "#28a745"
    });

    // ✅ ซ่อนฟอร์มและแสดงหน้าเกม
    // ตรวจสอบชื่อผู้เล่น
    const gameDetail = document.getElementById("game-detail");
    const victimDetail = document.getElementById("victim-detail");

    // รีเซ็ตค่า display เพื่อไม่ให้มี class ซ้อนกันจากก่อนหน้า
    gameDetail.classList.remove("show", "hide");
    victimDetail.classList.remove("show", "hide");

    victimDetail.classList.add("hide");
    gameDetail.classList.add("show");

    // ✅ อัปเดตชื่อใน navbar (แทนคุณป้อม)
    const welcomeEl = document.querySelector(".welcome-text");
    if (welcomeEl) {
      welcomeEl.textContent = `👋 ยินดีต้อนรับคุณ ${name}`;
    }
  } catch (error) {
    console.error("❌ Error while saving victim_name:", error);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด!",
      text: "ไม่สามารถบันทึกชื่อได้ โปรดลองอีกครั้ง",
      confirmButtonColor: "#d33"
    });
  }
});

document.getElementById("withdraw").addEventListener("click", async (e) => {
  e.preventDefault(); // ป้องกันการเปิดลิงก์ทันที

  try {
    // ดึงยอดล่าสุดจาก localforage (เพื่อให้แน่ใจว่าเป็นข้อมูลใหม่สุด)
    let balance = gEquity || await store.getItem("equity");
    balance = Number(balance);

    if (balance < 100000) {
      // ❌ กรณียอดน้อยกว่า 100,000
      Swal.fire({
        icon: "warning",
        title: "⚠️ ถอนไม่ได้!",
        html: `ยอดเงินของคุณมีเพียง <b>${balance.toLocaleString()}</b> บาท<br>ยอดขั้นต่ำต้องมากว่า 100,000 บาท`,
        confirmButtonColor: "#ff8800"
      });
    } else {
      // ✅ ยอดเกิน 100,000 → ไปที่ Google
      Swal.fire({
        icon: "success",
        title: "✅ ถอนเงินสำเร็จ",
        text: "ระบบกำลังนำคุณไปยังหน้าธนาคาร...",
        showConfirmButton: false,
        timer: 1500
      });

      setTimeout(() => {
        window.open("https://arpeggio068.github.io/scam-landing/", "_blank");
      }, 1500);
    }

  } catch (error) {
    console.error("❌ Error checking balance:", error);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด!",
      text: "ไม่สามารถตรวจสอบยอดเงินได้ โปรดลองใหม่อีกครั้ง",
      confirmButtonColor: "#d33"
    });
  }
});



// ==============================
// โหลดค่า equity ตอนเริ่มต้น
// ==============================
let gEquity;
let gName;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    gEquity = await store.getItem("equity");
    gName = await store.getItem("victim_name");

    // ตรวจสอบชื่อผู้เล่น
    const gameDetail = document.getElementById("game-detail");
    const victimDetail = document.getElementById("victim-detail");

    // รีเซ็ตค่า display เพื่อไม่ให้มี class ซ้อนกันจากก่อนหน้า
    gameDetail.classList.remove("show", "hide");
    victimDetail.classList.remove("show", "hide");

    if (!gName) {
      gameDetail.classList.add("hide");
      victimDetail.classList.add("show");
      
    } else {
      victimDetail.classList.add("hide");
      gameDetail.classList.add("show");
      const welcomeEl = document.querySelector(".welcome-text");
      if (welcomeEl) {
        welcomeEl.textContent = `👋 ยินดีต้อนรับคุณ ${gName}`;
      }
    }

    // ถ้าไม่มี equity → ตั้งค่าเริ่มต้น
    if (!gEquity) {
      gEquity = 100000;
      await store.setItem("equity", gEquity);
    }

    // อัปเดตยอดเงิน
    document.getElementById("equityValue").textContent = gEquity.toLocaleString();
    console.log("💰 Equity loaded successfully:", gEquity);

  } catch (error) {
    console.error("❌ Error while saving/loading equity:", error);
  }
});