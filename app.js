/**
 * 2026 활동지원사 송년행사 럭키드로우
 * Discord Cheerful Edition Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. STATE INITIALIZATION ---
  const state = {
    // Range & Pools
    startNum: 1,
    endNum: 70,
    allNumbers: [],
    availableNumbers: [],
    drawnNumbers: new Set(), // Prevents duplicates across entire session

    // Draw Setup
    drawMode: 'prize', // 'prize' or 'batch'
    animationStyle: 'slot', // 'slot' or 'luckyball'
    batchCount: 1, // 1 to 10

    // Prizes
    prizes: [
      { id: 1, name: '1등 - 최고급 무선청소기', targetCount: 1, drawnCount: 0, winners: [] },
      { id: 2, name: '2등 - 프리미엄 온수매트', targetCount: 2, drawnCount: 0, winners: [] },
      { id: 3, name: '3등 - 6년근 홍삼 선물세트', targetCount: 3, drawnCount: 0, winners: [] },
      { id: 4, name: '4등 - 신세계 상품권 5만원권', targetCount: 5, drawnCount: 0, winners: [] },
      { id: 5, name: '행운상 - 롤케이크 & 커피 세트', targetCount: 10, drawnCount: 0, winners: [] }
    ],
    currentPrizeId: 1,

    // Integrated draws history
    integratedDraws: [],

    // Runtime flags
    isDrawing: false,
    currentWinners: [],
    activeTab: 'stage', // 'stage', 'results', 'prizes'

    // Sound state
    audioUnlocked: false
  };

  // --- 2. DOM ELEMENT REFERENCES ---
  const el = {
    // Header Stats
    headerTotalCount: document.getElementById('header-total-count'),
    headerRemainingCount: document.getElementById('header-remaining-count'),
    headerDrawnCount: document.getElementById('header-drawn-count'),

    // Range Inputs
    inputStartNum: document.getElementById('input-start-num'),
    inputEndNum: document.getElementById('input-end-num'),
    btnApplyRange: document.getElementById('btn-apply-range'),

    // Mode & Setup
    btnModePrize: document.getElementById('btn-mode-prize'),
    btnModeBatch: document.getElementById('btn-mode-batch'),
    prizeSelectGroup: document.getElementById('prize-select-group'),
    selectPrize: document.getElementById('select-prize'),
    batchCountPicker: document.getElementById('batch-count-picker'),
    batchNumBtns: document.querySelectorAll('.batch-num-btn'),

    // Animation Style Switchers
    btnStyleSlot: document.getElementById('btn-style-slot'),
    btnStyleDerby: document.getElementById('btn-style-derby'),

    // Recent Winners
    recentWinnersList: document.getElementById('recent-winners-list'),

    // Stage Elements
    stagePrizeTag: document.getElementById('stage-prize-tag'),
    stagePrizeTitle: document.getElementById('stage-prize-title'),
    stageRemainingBadge: document.getElementById('stage-remaining-badge'),
    animationStageBox: document.getElementById('animation-stage-box'),
    btnGrandDraw: document.getElementById('btn-grand-draw'),
    btnNextDraw: document.getElementById('btn-next-draw'),
    btnReroll: document.getElementById('btn-reroll'),
    drawStatusText: document.getElementById('draw-status-text'),

    // Views & Tabs
    tabBtnStage: document.getElementById('tab-btn-stage'),
    tabBtnResults: document.getElementById('tab-btn-results'),
    tabBtnPrizes: document.getElementById('tab-btn-prizes'),
    viewStage: document.getElementById('view-stage'),
    viewResults: document.getElementById('view-results'),
    viewPrizes: document.getElementById('view-prizes'),

    // Results Dashboard
    dashTotalParticipants: document.getElementById('dash-total-participants'),
    dashTotalWinners: document.getElementById('dash-total-winners'),
    dashRemainingParticipants: document.getElementById('dash-remaining-participants'),
    dashPrizeCount: document.getElementById('dash-prize-count'),
    resultsGroupsContainer: document.getElementById('results-groups-container'),
    inputSearchNumber: document.getElementById('input-search-number'),
    searchResultHint: document.getElementById('search-result-hint'),

    // Prize Manager
    prizeManagerTbody: document.getElementById('prize-manager-tbody'),
    btnAddNewPrize: document.getElementById('btn-add-new-prize'),

    // Modals
    modalSound: document.getElementById('modal-sound'),
    btnOpenSoundModal: document.getElementById('btn-sound-settings'),
    btnCloseSoundModal: document.getElementById('btn-close-sound-modal'),
    modalReset: document.getElementById('modal-reset'),
    btnOpenResetModal: document.getElementById('btn-reset-all'),
    btnCancelReset: document.getElementById('btn-cancel-reset'),
    btnConfirmReset: document.getElementById('btn-confirm-reset'),

    // Sound Controls
    switchMasterMute: document.getElementById('switch-master-mute'),
    btnMuteQuick: document.getElementById('btn-mute-quick'),
    switchBgm: document.getElementById('switch-bgm'),
    sliderBgm: document.getElementById('slider-bgm'),
    switchDrawSfx: document.getElementById('switch-draw-sfx'),
    sliderDrawSfx: document.getElementById('slider-draw-sfx'),
    switchWinSfx: document.getElementById('switch-win-sfx'),
    sliderWinSfx: document.getElementById('slider-win-sfx'),

    // Fullscreen & Theme
    btnFullscreen: document.getElementById('btn-fullscreen'),
    btnThemeToggle: document.getElementById('btn-theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
    themeText: document.getElementById('theme-text'),

    // Canvases
    bgCanvas: document.getElementById('bg-canvas'),
    confettiCanvas: document.getElementById('confetti-canvas'),
    luckyBallCanvas: document.getElementById('lucky-ball-canvas')
  };

  // --- 3. INIT CANVAS ANIMATIONS ---
  const bgParticles = new BackgroundParticleSystem(el.bgCanvas);
  const confetti = new ConfettiCannon(el.confettiCanvas);
  let derbyTrack = null;

  // --- 4. CORE DATA METHODS ---
  function generateNumbers(start, end) {
    const list = [];
    for (let i = start; i <= end; i++) {
      list.push(i);
    }
    return list;
  }

  function applyRange(start, end, resetAllDrawn = true) {
    if (isNaN(start) || isNaN(end) || start > end || start < 1) {
      alert('올바른 시작 번호와 종료 번호를 입력해주세요. (예: 1 ~ 70)');
      return false;
    }
    state.startNum = start;
    state.endNum = end;
    state.allNumbers = generateNumbers(start, end);

    if (resetAllDrawn) {
      state.drawnNumbers.clear();
      state.prizes.forEach(p => {
        p.drawnCount = 0;
        p.winners = [];
      });
      state.integratedDraws = [];
      state.currentWinners = [];
    }

    state.availableNumbers = state.allNumbers.filter(n => !state.drawnNumbers.has(n));
    updateUI();
    return true;
  }

  function getCurrentPrize() {
    return state.prizes.find(p => p.id === state.currentPrizeId) || state.prizes[0];
  }

  // Get current effective draw count (for dynamic reel layout)
  function getEffectiveDrawCount() {
    if (state.drawMode === 'prize') {
      const cur = getCurrentPrize();
      if (cur) {
        const remaining = cur.targetCount - cur.drawnCount;
        if (remaining > 0) {
          return Math.min(state.batchCount, remaining);
        }
      }
      return 1;
    }
    return state.batchCount;
  }

  function updateUI() {
    // 1. Stats
    const total = state.allNumbers.length;
    const drawn = state.drawnNumbers.size;
    const remaining = state.availableNumbers.length;

    el.headerTotalCount.textContent = total;
    el.headerDrawnCount.textContent = drawn;
    el.headerRemainingCount.textContent = remaining;

    el.dashTotalParticipants.textContent = total;
    el.dashTotalWinners.textContent = drawn;
    el.dashRemainingParticipants.textContent = remaining;
    el.dashPrizeCount.textContent = state.prizes.length;

    el.stageRemainingBadge.textContent = `추첨 가능: ${remaining}명 / 전체: ${total}명`;

    // 2. Prize Select Dropdown
    renderPrizeDropdown();

    // 3. Stage Banner
    if (state.drawMode === 'prize') {
      const curPrize = getCurrentPrize();
      if (curPrize) {
        el.stagePrizeTag.textContent = '🏆 경품 추첨';
        const needed = curPrize.targetCount - curPrize.drawnCount;
        el.stagePrizeTitle.textContent = `${curPrize.name} (${curPrize.drawnCount}/${curPrize.targetCount}명 완료)`;
        el.drawStatusText.textContent = needed > 0 
          ? `[${curPrize.name}] ${needed}명 남음` 
          : `[${curPrize.name}] 당첨 완료! 다음 경품을 선택하세요.`;
      } else {
        el.stagePrizeTitle.textContent = '선택된 경품 없음';
        el.drawStatusText.textContent = '경품을 선택해주세요.';
      }
    } else {
      el.stagePrizeTag.textContent = '🎯 통합 추첨';
      el.stagePrizeTitle.textContent = `통합 추첨 (${state.batchCount}명 동시 추첨)`;
      el.drawStatusText.textContent = `지정된 인원: ${state.batchCount}명`;
    }

    // 4. Update Recent Winners List
    renderRecentWinners();

    // 5. Update Prize Manager Table
    renderPrizeManager();

    // 6. Update Full Results List
    renderResultsDashboard();

    // 7. Check if draw button should be disabled
    checkDrawButtonState();
  }

  function renderPrizeDropdown() {
    const prevVal = el.selectPrize.value;
    el.selectPrize.innerHTML = '';
    state.prizes.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      const isComplete = p.drawnCount >= p.targetCount;
      opt.textContent = `${p.name} [${p.drawnCount}/${p.targetCount}명] ${isComplete ? '✓ 완료' : ''}`;
      el.selectPrize.appendChild(opt);
    });
    if (prevVal && state.prizes.some(p => p.id == prevVal)) {
      el.selectPrize.value = prevVal;
      state.currentPrizeId = parseInt(prevVal, 10);
    } else if (state.prizes.length > 0) {
      el.selectPrize.value = state.prizes[0].id;
      state.currentPrizeId = state.prizes[0].id;
    }
  }

  function renderRecentWinners() {
    el.recentWinnersList.innerHTML = '';
    const allRecent = [];

    state.prizes.forEach(p => {
      p.winners.forEach(w => {
        allRecent.push({ num: w, title: p.name });
      });
    });

    state.integratedDraws.forEach(batch => {
      batch.numbers.forEach(num => {
        allRecent.push({ num: num, title: `통합 ${batch.round}회차` });
      });
    });

    if (allRecent.length === 0) {
      el.recentWinnersList.innerHTML = '<div style="color:var(--color-fog); font-size:0.82rem; text-align:center; padding:12px;">아직 당첨자가 없습니다.</div>';
      return;
    }

    const reversed = allRecent.slice(-6).reverse();
    reversed.forEach(item => {
      const row = document.createElement('div');
      row.className = 'recent-item';
      row.innerHTML = `
        <span class="prize-badge">${item.title}</span>
        <span class="win-num">${item.num}번</span>
      `;
      el.recentWinnersList.appendChild(row);
    });
  }

  function checkDrawButtonState() {
    if (state.isDrawing) {
      el.btnGrandDraw.disabled = true;
      return;
    }

    const available = state.availableNumbers.length;
    let required = state.batchCount;

    if (state.drawMode === 'prize') {
      const curPrize = getCurrentPrize();
      if (!curPrize) {
        el.btnGrandDraw.disabled = true;
        return;
      }
      const remainingNeeded = curPrize.targetCount - curPrize.drawnCount;
      if (remainingNeeded <= 0) {
        el.btnGrandDraw.disabled = true;
        el.drawStatusText.textContent = `[${curPrize.name}] 당첨이 모두 완료되었습니다.`;
        return;
      }
      required = Math.min(state.batchCount, remainingNeeded);
    }

    if (available === 0) {
      el.btnGrandDraw.disabled = true;
      el.drawStatusText.textContent = '모든 참가 번호가 소진되었습니다!';
    } else if (required > available) {
      el.btnGrandDraw.disabled = true;
      el.drawStatusText.textContent = `추첨 가능 번호(${available}명)가 부족합니다.`;
    } else {
      el.btnGrandDraw.disabled = false;
    }
  }

  // --- 5. STAGE IDLE STATE (CLEAN REELS NO '?', HORSE DERBY READY) ---
  function resetStageToIdle() {
    if (state.isDrawing) return;

    if (derbyTrack) {
      derbyTrack.destroy();
      derbyTrack = null;
    }

    if (state.animationStyle === 'slot') {
      const count = getEffectiveDrawCount();
      const countClass = count === 1 ? 'count-1' : count >= 5 ? 'count-many' : '';

      let reelsHtml = '';
      for (let i = 0; i < count; i++) {
        reelsHtml += `
          <div class="slot-reel-window" data-reel-idx="${i}">
            <div class="slot-number-display">&nbsp;</div>
          </div>
        `;
      }

      el.animationStageBox.innerHTML = `
        <div class="slot-arcade-cabinet ${countClass}">
          <div class="slot-arcade-marquee">
            <span>★</span> LUCKY SLOTS <span>★</span>
          </div>
          <div class="slot-reels-row">
            ${reelsHtml}
          </div>
        </div>
      `;
    } else {
      // Horse Racing Derby Mode
      el.animationStageBox.innerHTML = `
        <div class="derby-track-wrapper">
          <canvas id="derby-canvas"></canvas>
        </div>
      `;
      const canvas = document.getElementById('derby-canvas');
      derbyTrack = new DerbyRaceTrack(canvas);
      derbyTrack.initHorses([], getEffectiveDrawCount());
    }
  }

  // --- 6. DRAWING EXECUTION & ANIMATION LOGIC ---
  function executeDraw() {
    if (state.isDrawing) return;

    // Trigger audio context on user action
    window.soundEngine.ensureContext();
    if (!state.audioUnlocked) {
      state.audioUnlocked = true;
      if (state.activeTab === 'stage' && window.soundEngine.bgmEnabled) {
        window.soundEngine.startBgm();
      }
    }

    const available = state.availableNumbers;
    if (available.length === 0) {
      alert('추첨 가능한 참가 번호가 모두 소진되었습니다.');
      return;
    }

    let drawCount = state.batchCount;
    const curPrize = state.drawMode === 'prize' ? getCurrentPrize() : null;

    if (curPrize) {
      const remainingForPrize = curPrize.targetCount - curPrize.drawnCount;
      if (remainingForPrize <= 0) {
        alert('이 경품은 이미 목표 인원 추첨이 완료되었습니다.');
        return;
      }
      drawCount = Math.min(drawCount, remainingForPrize);
    }

    if (drawCount > available.length) {
      alert(`남은 추첨 가능 인원(${available.length}명)보다 많은 인원(${drawCount}명)을 추첨할 수 없습니다.`);
      return;
    }

    // Unbiased Random Selection
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const selectedWinners = shuffled.slice(0, drawCount);

    state.isDrawing = true;
    checkDrawButtonState();
    el.btnNextDraw.style.display = 'none';
    el.btnReroll.style.display = 'none';

    // Start Sound
    window.soundEngine.startDrawSound(state.animationStyle);

    // Run Visual Animation
    if (state.animationStyle === 'slot') {
      runSlotMachineAnimation(selectedWinners, () => onDrawComplete(selectedWinners, curPrize));
    } else {
      runDerbyAnimation(selectedWinners, () => onDrawComplete(selectedWinners, curPrize));
    }
  }

  // A. Enhanced Slot Machine Animation Runner (High Quality & Readability)
  function runSlotMachineAnimation(winners, onComplete) {
    const count = winners.length;
    const countClass = count === 1 ? 'count-1' : count >= 5 ? 'count-many' : '';

    let reelsHtml = '';
    winners.forEach((_, idx) => {
      reelsHtml += `
        <div class="slot-reel-window" id="slot-reel-${idx}">
          <div class="slot-number-display" id="slot-num-${idx}">0</div>
        </div>
      `;
    });

    el.animationStageBox.innerHTML = `
      <div class="slot-arcade-cabinet ${countClass}">
        <div class="slot-arcade-marquee" style="animation: pulseDot 1s infinite alternate;">
          <span>⚡</span> SPINNING <span>⚡</span>
        </div>
        <div class="slot-reels-row">
          ${reelsHtml}
        </div>
      </div>
    `;

    const reels = winners.map((w, idx) => ({
      winEl: document.getElementById(`slot-reel-${idx}`),
      numEl: document.getElementById(`slot-num-${idx}`),
      target: w,
      stopped: false
    }));

    const startTime = Date.now();
    const duration = 2800; // 2.8s total tension

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      reels.forEach((reel, i) => {
        const reelStopTime = duration - (reels.length - 1 - i) * 260;
        if (elapsed < reelStopTime) {
          reel.numEl.textContent = Math.floor(Math.random() * (state.endNum - state.startNum + 1)) + state.startNum;
          reel.numEl.style.transform = `scale(${1 + Math.random() * 0.12})`;
          reel.numEl.style.filter = 'blur(1px)';
        } else if (!reel.stopped) {
          reel.stopped = true;
          reel.numEl.textContent = reel.target;
          reel.numEl.style.transform = 'scale(1.15)';
          reel.numEl.style.filter = 'none';
          reel.winEl.style.borderColor = '#57f287';
          reel.winEl.style.boxShadow = '0 0 35px rgba(87, 242, 135, 0.7)';
          setTimeout(() => {
            reel.numEl.style.transform = 'scale(1)';
          }, 120);
        }
      });

      if (elapsed >= duration + 200) {
        clearInterval(interval);
        onComplete();
      }
    }, 45);
  }

  // B. Horse Racing Derby Animation Runner
  function runDerbyAnimation(winners, onComplete) {
    if (derbyTrack) {
      derbyTrack.destroy();
      derbyTrack = null;
    }

    el.animationStageBox.innerHTML = `
      <div class="derby-track-wrapper">
        <canvas id="derby-canvas"></canvas>
      </div>
    `;
    const canvas = document.getElementById('derby-canvas');
    derbyTrack = new DerbyRaceTrack(canvas);
    derbyTrack.initHorses(winners, winners.length);

    // Start Race (DerbyRaceTrack maintains winner badges floating for 1.5s before calling callback)
    derbyTrack.startRace(winners, () => {
      onComplete();
    });
  }

  // Draw Completion Handler
  function onDrawComplete(winners, curPrize) {
    state.isDrawing = false;
    state.currentWinners = winners;

    if (derbyTrack) {
      derbyTrack.destroy();
      derbyTrack = null;
    }

    // Commit to pools (Strict duplicate prevention)
    winners.forEach(w => {
      state.drawnNumbers.add(w);
    });
    state.availableNumbers = state.allNumbers.filter(n => !state.drawnNumbers.has(n));

    // Update Prize or Integrated Records
    if (curPrize) {
      curPrize.drawnCount += winners.length;
      curPrize.winners.push(...winners);
    } else {
      state.integratedDraws.push({
        round: state.integratedDraws.length + 1,
        numbers: [...winners],
        time: new Date().toLocaleTimeString('ko-KR')
      });
    }

    // Play Fanfare & Launch Confetti
    window.soundEngine.playWinSound();
    confetti.fire(winners.length === 1 ? 180 : 250);

    // Render Winning Cards
    renderWinningCards(winners, curPrize);

    // Show Secondary Actions
    el.btnNextDraw.style.display = 'inline-flex';
    el.btnReroll.style.display = 'inline-flex';

    // Update Overall UI
    updateUI();
  }

  // Winning Cards Presentation (Beam-projector optimized)
  function renderWinningCards(winners, curPrize) {
    el.animationStageBox.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'winners-display-grid';

    if (winners.length === 1) {
      grid.classList.add('count-1');
    } else if (winners.length <= 4) {
      grid.classList.add(`count-${winners.length}`);
    } else {
      grid.classList.add('count-multi');
    }

    const prizeLabel = curPrize ? curPrize.name : '통합 추첨';
    const isMultiCount = winners.length >= 5;
    const rerollLabel = isMultiCount ? '부재 재추첨' : '부재자 개별 재추첨';

    winners.forEach((w, idx) => {
      const card = document.createElement('div');
      card.className = 'winner-card';
      card.id = `winner-card-${idx}`;
      card.style.animationDelay = `${idx * 0.08}s`;
      card.innerHTML = `
        <div class="card-badge">WINNER #${idx + 1}</div>
        <div class="card-number" id="winner-num-display-${idx}">${w}</div>
        <div class="card-label" title="${prizeLabel}">${prizeLabel}</div>
        <button class="btn-reroll-single" data-num="${w}" data-idx="${idx}" title="이 당첨자만 취소하고 1명 재추첨">
          <span>🔄</span> <span>${rerollLabel}</span>
        </button>
      `;
      grid.appendChild(card);
    });

    el.animationStageBox.appendChild(grid);

    // Bind individual absent re-roll buttons
    grid.querySelectorAll('.btn-reroll-single').forEach(btn => {
      btn.addEventListener('click', () => {
        const num = parseInt(btn.dataset.num, 10);
        const idx = parseInt(btn.dataset.idx, 10);
        rerollSingleWinner(num, idx, curPrize);
      });
    });
  }

  // Individual Absent Winner Re-roll (부재자 1명 단독 재추첨 연출 및 대형 화면 발표)
  function rerollSingleWinner(absentNum, cardIdx, curPrize) {
    if (!confirm(`${absentNum}번 참가자가 부재중인가요?\n\n[확인]을 누르면 ${absentNum}번을 취소하고, 1명만 즉시 단독 재추첨을 진행하여 화면에 발표합니다.`)) {
      return;
    }

    // 1. Release absent number back to pool
    state.drawnNumbers.delete(absentNum);
    const available = state.allNumbers.filter(n => !state.drawnNumbers.has(n));

    if (available.length === 0) {
      alert('추첨 가능한 남은 참가 번호가 없습니다.');
      state.drawnNumbers.add(absentNum);
      return;
    }

    // 2. Pick 1 new replacement winner
    const newWinner = available[Math.floor(Math.random() * available.length)];
    state.drawnNumbers.add(newWinner);
    state.availableNumbers = state.allNumbers.filter(n => !state.drawnNumbers.has(n));

    // 3. Replace in winners list
    state.currentWinners[cardIdx] = newWinner;

    if (curPrize) {
      const pIdx = curPrize.winners.indexOf(absentNum);
      if (pIdx !== -1) {
        curPrize.winners[pIdx] = newWinner;
      }
    } else if (state.integratedDraws.length > 0) {
      const lastBatch = state.integratedDraws[state.integratedDraws.length - 1];
      if (lastBatch) {
        const bIdx = lastBatch.numbers.indexOf(absentNum);
        if (bIdx !== -1) {
          lastBatch.numbers[bIdx] = newWinner;
        }
      }
    }

    // 4. Update UI stats and temporary status banner
    state.isDrawing = true;
    checkDrawButtonState();
    el.btnNextDraw.style.display = 'none';
    el.btnReroll.style.display = 'none';

    el.stagePrizeTag.textContent = '🔄 부재자 1명 재추첨';
    el.stagePrizeTitle.textContent = `부재자 발생: 기존 ${absentNum}번 ➡️ 새로운 1명 재추첨!`;
    el.drawStatusText.textContent = `1명 재추첨 진행 중...`;

    // 5. Run single-winner tension sound & animation (Slot or Derby)
    window.soundEngine.startDrawSound(state.animationStyle);

    if (state.animationStyle === 'slot') {
      runSlotMachineAnimation([newWinner], () => {
        showSingleRerollResult(absentNum, newWinner, cardIdx, curPrize);
      });
    } else {
      runDerbyAnimation([newWinner], () => {
        showSingleRerollResult(absentNum, newWinner, cardIdx, curPrize);
      });
    }
  }

  // Showcase single re-roll result on screen with huge emphasis
  function showSingleRerollResult(absentNum, newWinner, cardIdx, curPrize) {
    state.isDrawing = false;
    if (derbyTrack) {
      derbyTrack.destroy();
      derbyTrack = null;
    }
    window.soundEngine.playWinSound();
    confetti.fire(200);

    const prizeLabel = curPrize ? curPrize.name : '통합 추첨';

    el.animationStageBox.innerHTML = `
      <div class="single-reroll-showcase">
        <div class="reroll-header-badge">🔄 부재자 1명 재추첨 완료!</div>
        <div class="reroll-versus">
          <span class="old-num-strikethrough">기존: ${absentNum}번 (부재)</span>
          <span class="arrow-icon">➡️</span>
          <span class="new-winner-tag">새로운 당첨자</span>
        </div>
        <div class="reroll-mega-number">${newWinner}번</div>
        <div class="reroll-prize-title">${prizeLabel}</div>
        <div style="margin-top:24px; display:flex; gap:12px; justify-content:center;">
          <button id="btn-return-to-all-winners" class="btn-grand-draw" style="font-size:1.15rem; padding:12px 36px;">
            <span>📋</span> 전체 당첨 목록으로 복귀
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-return-to-all-winners').addEventListener('click', () => {
      renderWinningCards(state.currentWinners, curPrize);
      updateUI();
    });

    el.btnNextDraw.style.display = 'inline-flex';
    updateUI();
  }

  // Bottom action bar Re-roll button handler
  function rerollCurrentDraw() {
    if (state.currentWinners.length === 0) return;
    if (state.currentWinners.length === 1) {
      const curPrize = state.drawMode === 'prize' ? getCurrentPrize() : null;
      rerollSingleWinner(state.currentWinners[0], 0, curPrize);
    } else {
      alert('부재중인 당첨자 카드의 [🔄 부재자 개별 재추첨] 버튼을 눌러주시면 해당 번호만 교체됩니다.');
    }
  }

  // Next Draw action: clean stage and advance prize if complete
  function handleNextDraw() {
    el.btnNextDraw.style.display = 'none';
    el.btnReroll.style.display = 'none';

    if (state.drawMode === 'prize') {
      const curPrize = getCurrentPrize();
      if (curPrize && curPrize.drawnCount >= curPrize.targetCount) {
        const nextPrize = state.prizes.find(p => p.drawnCount < p.targetCount);
        if (nextPrize) {
          state.currentPrizeId = nextPrize.id;
          el.selectPrize.value = nextPrize.id;
        }
      }
    }

    resetStageToIdle();
    updateUI();
  }

  // --- 7. RESULTS DASHBOARD RENDERING & SEARCH ---
  function renderResultsDashboard() {
    el.resultsGroupsContainer.innerHTML = '';
    let hasAnyResults = false;

    // 1. Grouped by Prize
    state.prizes.forEach(p => {
      if (p.winners.length > 0) {
        hasAnyResults = true;
        const card = document.createElement('div');
        card.className = 'prize-result-card';
        card.innerHTML = `
          <div class="prize-result-header">
            <div class="prize-result-title">
              <span>🎁</span> ${p.name}
            </div>
            <div class="prize-result-count">${p.winners.length}명 당첨 / 목표 ${p.targetCount}명</div>
          </div>
          <div class="prize-result-numbers">
            ${p.winners.map(num => `<div class="drawn-num-chip" data-num="${num}">${num}번</div>`).join('')}
          </div>
        `;
        el.resultsGroupsContainer.appendChild(card);
      }
    });

    // 2. Grouped by Integrated Draw Rounds
    state.integratedDraws.forEach(batch => {
      hasAnyResults = true;
      const card = document.createElement('div');
      card.className = 'prize-result-card';
      card.innerHTML = `
        <div class="prize-result-header">
          <div class="prize-result-title">
            <span>🎯</span> 통합 추첨 제${batch.round}회차
          </div>
          <div class="prize-result-count">${batch.time} (${batch.numbers.length}명)</div>
        </div>
        <div class="prize-result-numbers">
          ${batch.numbers.map(num => `<div class="drawn-num-chip" data-num="${num}">${num}번</div>`).join('')}
        </div>
      `;
      el.resultsGroupsContainer.appendChild(card);
    });

    if (!hasAnyResults) {
      el.resultsGroupsContainer.innerHTML = `
        <div class="empty-results-msg">
          <p>아직 진행된 당첨 결과가 없습니다.</p>
          <small>추첨을 진행하면 경품별/회차별 당첨 목록이 실시간으로 집계됩니다.</small>
        </div>
      `;
    }
  }

  function searchParticipantNumber(numStr) {
    const num = parseInt(numStr.trim(), 10);
    const chips = el.resultsGroupsContainer.querySelectorAll('.drawn-num-chip');
    chips.forEach(c => c.classList.remove('highlighted'));

    if (isNaN(num)) {
      el.searchResultHint.textContent = '';
      return;
    }

    if (state.drawnNumbers.has(num)) {
      let wonLocation = '';
      state.prizes.forEach(p => {
        if (p.winners.includes(num)) {
          wonLocation = p.name;
        }
      });
      if (!wonLocation) {
        wonLocation = '통합 추첨 회차';
      }

      el.searchResultHint.textContent = `🎉 축하합니다! ${num}번은 [${wonLocation}]에 당첨되었습니다!`;
      el.searchResultHint.style.color = '#57f287';

      chips.forEach(c => {
        if (c.getAttribute('data-num') == num) {
          c.classList.add('highlighted');
          c.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    } else if (num >= state.startNum && num <= state.endNum) {
      el.searchResultHint.textContent = `ℹ️ ${num}번은 아직 미당첨 상태입니다. (추첨 대기 중)`;
      el.searchResultHint.style.color = 'var(--color-fog)';
    } else {
      el.searchResultHint.textContent = `⚠️ ${num}번은 참가 번호 범위(${state.startNum}~${state.endNum})에 없습니다.`;
      el.searchResultHint.style.color = '#de2761';
    }
  }

  // --- 8. PRIZE MANAGER ---
  function renderPrizeManager() {
    el.prizeManagerTbody.innerHTML = '';
    state.prizes.forEach((p, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color:#5865f2; font-family:var(--font-family-num)">${idx + 1}</strong></td>
        <td><input type="text" value="${p.name}" class="mgr-prize-name" data-id="${p.id}" /></td>
        <td style="width:110px;">
          <input type="number" min="1" max="100" value="${p.targetCount}" class="mgr-prize-count" data-id="${p.id}" />
        </td>
        <td><span style="font-family:var(--font-family-num); font-weight:700;">${p.drawnCount}명</span></td>
        <td style="width:90px;">
          <button class="btn-icon-gold btn-delete-prize" data-id="${p.id}" style="color:#de2761; border-color:rgba(222,39,97,0.4); padding:4px 10px;">삭제</button>
        </td>
      `;
      el.prizeManagerTbody.appendChild(tr);
    });

    el.prizeManagerTbody.querySelectorAll('.mgr-prize-name').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const id = parseInt(e.target.dataset.id, 10);
        const p = state.prizes.find(x => x.id === id);
        if (p) {
          p.name = e.target.value;
          updateUI();
        }
      });
    });

    el.prizeManagerTbody.querySelectorAll('.mgr-prize-count').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const id = parseInt(e.target.dataset.id, 10);
        const p = state.prizes.find(x => x.id === id);
        if (p) {
          const val = parseInt(e.target.value, 10);
          if (val >= 1) {
            p.targetCount = val;
            updateUI();
          }
        }
      });
    });

    el.prizeManagerTbody.querySelectorAll('.btn-delete-prize').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id, 10);
        if (confirm('이 경품을 삭제하시겠습니까?')) {
          state.prizes = state.prizes.filter(p => p.id !== id);
          if (state.currentPrizeId === id && state.prizes.length > 0) {
            state.currentPrizeId = state.prizes[0].id;
          }
          updateUI();
        }
      });
    });
  }

  function addNewPrize() {
    const nextId = state.prizes.length > 0 ? Math.max(...state.prizes.map(p => p.id)) + 1 : 1;
    state.prizes.push({
      id: nextId,
      name: `새 경품 ${nextId}`,
      targetCount: 1,
      drawnCount: 0,
      winners: []
    });
    updateUI();
  }

  // --- 9. EVENT LISTENERS ---
  el.btnApplyRange.addEventListener('click', () => {
    window.soundEngine.playClick();
    const start = parseInt(el.inputStartNum.value, 10);
    const end = parseInt(el.inputEndNum.value, 10);
    if (state.drawnNumbers.size > 0) {
      if (!confirm('참가 번호 범위를 변경하면 기존 당첨 결과가 초기화됩니다. 계속하시겠습니까?')) {
        return;
      }
    }
    applyRange(start, end, true);
    resetStageToIdle();
  });

  // Mode Toggle (Prize vs Batch)
  el.btnModePrize.addEventListener('click', () => {
    window.soundEngine.playClick();
    state.drawMode = 'prize';
    el.btnModePrize.classList.add('active');
    el.btnModeBatch.classList.remove('active');
    el.prizeSelectGroup.style.display = 'block';
    resetStageToIdle();
    updateUI();
  });

  el.btnModeBatch.addEventListener('click', () => {
    window.soundEngine.playClick();
    state.drawMode = 'batch';
    el.btnModeBatch.classList.add('active');
    el.btnModePrize.classList.remove('active');
    el.prizeSelectGroup.style.display = 'none';
    resetStageToIdle();
    updateUI();
  });

  // Prize Dropdown Change
  el.selectPrize.addEventListener('change', (e) => {
    window.soundEngine.playClick();
    state.currentPrizeId = parseInt(e.target.value, 10);
    resetStageToIdle();
    updateUI();
  });

  // Batch Count Selector Buttons (1~10)
  el.batchNumBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      window.soundEngine.playClick();
      el.batchNumBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.batchCount = parseInt(btn.dataset.count, 10);
      resetStageToIdle(); // Updates slot reels dynamically!
      updateUI();
    });
  });

  // Animation Style Switchers
  el.btnStyleSlot.addEventListener('click', () => {
    window.soundEngine.playClick();
    state.animationStyle = 'slot';
    el.btnStyleSlot.classList.add('active');
    el.btnStyleDerby.classList.remove('active');
    resetStageToIdle();
  });

  el.btnStyleDerby.addEventListener('click', () => {
    window.soundEngine.playClick();
    state.animationStyle = 'derby';
    el.btnStyleDerby.classList.add('active');
    el.btnStyleSlot.classList.remove('active');
    resetStageToIdle();
  });

  // Draw Button
  el.btnGrandDraw.addEventListener('click', executeDraw);
  el.btnNextDraw.addEventListener('click', handleNextDraw);
  el.btnReroll.addEventListener('click', rerollCurrentDraw);

  // Keyboard Shortcuts (Spacebar)
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      if (el.btnNextDraw.style.display !== 'none') {
        handleNextDraw();
      } else if (!el.btnGrandDraw.disabled) {
        executeDraw();
      }
    }
  });

  // Tab View Switcher
  function switchTab(targetTab) {
    state.activeTab = targetTab;
    el.tabBtnStage.classList.toggle('active', targetTab === 'stage');
    el.tabBtnResults.classList.toggle('active', targetTab === 'results');
    el.tabBtnPrizes.classList.toggle('active', targetTab === 'prizes');

    el.viewStage.classList.toggle('active', targetTab === 'stage');
    el.viewResults.classList.toggle('active', targetTab === 'results');
    el.viewPrizes.classList.toggle('active', targetTab === 'prizes');
  }

  el.tabBtnStage.addEventListener('click', () => switchTab('stage'));
  el.tabBtnResults.addEventListener('click', () => switchTab('results'));
  el.tabBtnPrizes.addEventListener('click', () => switchTab('prizes'));

  el.inputSearchNumber.addEventListener('input', (e) => {
    searchParticipantNumber(e.target.value);
  });

  el.btnAddNewPrize.addEventListener('click', addNewPrize);

  // Theme Switcher (Discord Vibrant <-> Classic Gold)
  if (el.btnThemeToggle) {
    el.btnThemeToggle.addEventListener('click', () => {
      window.soundEngine.playClick();
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'discord';
      if (currentTheme === 'discord') {
        document.documentElement.setAttribute('data-theme', 'gold');
        el.themeIcon.textContent = '✨';
        el.themeText.textContent = '클래식 골드';
      } else {
        document.documentElement.setAttribute('data-theme', 'discord');
        el.themeIcon.textContent = '🎮';
        el.themeText.textContent = '디스코드 테마';
      }
    });
  }

  // Fullscreen Toggle
  el.btnFullscreen.addEventListener('click', () => {
    window.soundEngine.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen request failed:', err);
      });
      el.btnFullscreen.innerHTML = '<span>⤓</span> 화면 복귀';
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        el.btnFullscreen.innerHTML = '<span>⛶</span> 전체 화면';
      }
    }
  });

  // Sound Settings Modal
  el.btnOpenSoundModal.addEventListener('click', () => {
    window.soundEngine.playClick();
    el.modalSound.classList.add('open');
  });

  el.btnCloseSoundModal.addEventListener('click', () => {
    el.modalSound.classList.remove('open');
  });

  el.modalSound.addEventListener('click', (e) => {
    if (e.target === el.modalSound) el.modalSound.classList.remove('open');
  });

  // Quick Mute Toggle in Header
  el.btnMuteQuick.addEventListener('click', () => {
    const newMute = !window.soundEngine.isMuted;
    window.soundEngine.setMute(newMute);
    el.switchMasterMute.checked = !newMute;
    el.btnMuteQuick.innerHTML = newMute ? '<span>🔇</span> 음소거 해제' : '<span>🔊</span> 사운드';
    el.btnMuteQuick.classList.toggle('active', !newMute);
  });

  // Master Mute Switch in Modal
  el.switchMasterMute.addEventListener('change', (e) => {
    const isUnmuted = e.target.checked;
    window.soundEngine.setMute(!isUnmuted);
    el.btnMuteQuick.innerHTML = isUnmuted ? '<span>🔊</span> 사운드' : '<span>🔇</span> 음소거 해제';
    el.btnMuteQuick.classList.toggle('active', isUnmuted);
  });

  // BGM Controls
  el.switchBgm.addEventListener('change', (e) => {
    window.soundEngine.setBgmEnabled(e.target.checked);
  });
  el.sliderBgm.addEventListener('input', (e) => {
    window.soundEngine.setBgmVolume(parseFloat(e.target.value));
  });

  // Draw SFX Controls
  el.switchDrawSfx.addEventListener('change', (e) => {
    window.soundEngine.setDrawSfxEnabled(e.target.checked);
  });
  el.sliderDrawSfx.addEventListener('input', (e) => {
    window.soundEngine.setDrawVolume(parseFloat(e.target.value));
  });

  // Win SFX Controls
  el.switchWinSfx.addEventListener('change', (e) => {
    window.soundEngine.setWinSfxEnabled(e.target.checked);
  });
  el.sliderWinSfx.addEventListener('input', (e) => {
    window.soundEngine.setWinVolume(parseFloat(e.target.value));
  });

  // Full Reset Modal
  el.btnOpenResetModal.addEventListener('click', () => {
    window.soundEngine.playClick();
    el.modalReset.classList.add('open');
  });

  el.btnCancelReset.addEventListener('click', () => {
    el.modalReset.classList.remove('open');
  });

  el.modalReset.addEventListener('click', (e) => {
    if (e.target === el.modalReset) el.modalReset.classList.remove('open');
  });

  el.btnConfirmReset.addEventListener('click', () => {
    el.modalReset.classList.remove('open');
    applyRange(state.startNum, state.endNum, true);
    resetStageToIdle();
    confetti.stop();
    alert('모든 추첨 결과가 성공적으로 초기화되었습니다.');
  });

  // First Interaction Sound Auto-unlock
  document.body.addEventListener('click', () => {
    if (!state.audioUnlocked) {
      window.soundEngine.ensureContext();
      state.audioUnlocked = true;
      if (state.activeTab === 'stage' && window.soundEngine.bgmEnabled) {
        window.soundEngine.startBgm();
      }
    }
  }, { once: true });

  // Initial Boot
  document.documentElement.setAttribute('data-theme', 'discord');
  applyRange(1, 70, true);
  resetStageToIdle();
});
