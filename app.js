// Data Layer
const STORAGE_KEYS = {
  vehicles: 'fuellog_vehicles',
  receipts: 'fuellog_receipts'
};

function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getVehicles() {
  const data = localStorage.getItem(STORAGE_KEYS.vehicles);
  return data ? JSON.parse(data) : [];
}

function saveVehicles(vehicles) {
  localStorage.setItem(STORAGE_KEYS.vehicles, JSON.stringify(vehicles));
}

function getReceipts() {
  const data = localStorage.getItem(STORAGE_KEYS.receipts);
  return data ? JSON.parse(data) : [];
}

function saveReceipts(receipts) {
  localStorage.setItem(STORAGE_KEYS.receipts, JSON.stringify(receipts));
}

function getVehicleById(vehicleId) {
  return getVehicles().find(v => v.id === vehicleId);
}

function getVehicleReceipts(vehicleId) {
  return getReceipts().filter(r => r.vehicleId === vehicleId).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getLastReceiptForVehicle(vehicleId) {
  const receipts = getVehicleReceipts(vehicleId);
  return receipts.length > 0 ? receipts[0] : null;
}

// Calculation Functions
function calculateTotalPrice(volume, pricePerLitre) {
  return volume * pricePerLitre;
}

function calculateDistance(currentOdometer, vehicle) {
  const lastReceipt = getLastReceiptForVehicle(vehicle.id);
  const previousOdometer = lastReceipt ? lastReceipt.odometer : vehicle.startingOdometer;
  return currentOdometer - previousOdometer;
}

function calculateConsumption(volumeLitres, distanceKm) {
  if (distanceKm <= 0) return 0;
  return (volumeLitres / distanceKm) * 100;
}

function validateOdometer(odometer, vehicle) {
  const lastReceipt = getLastReceiptForVehicle(vehicle.id);
  const previousOdometer = lastReceipt ? lastReceipt.odometer : vehicle.startingOdometer;
  
  if (odometer < previousOdometer) {
    return {
      valid: false,
      message: `Odometer must be at least ${previousOdometer.toLocaleString()} km (previous reading)`
    };
  }
  return { valid: true };
}

// UI Functions
function showAlert(message, type = 'success') {
  const container = document.getElementById('alert-container');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  container.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
}

function formatCurrency(amount) {
  return '$' + amount.toFixed(2);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatNumber(num, decimals = 2) {
  return num.toFixed(decimals);
}

// Tab Navigation
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(tabId).classList.add('active');

      if (tabId === 'dashboard') {
        renderDashboard();
      }
    });
  });
}

// Vehicle Functions
function addVehicle(make, model, year, nickname, color, startingOdometer) {
  const vehicles = getVehicles();
  const vehicle = {
    id: generateId(),
    make,
    model,
    year: parseInt(year),
    nickname: nickname || null,
    color: color || '#2563eb',
    startingOdometer: parseInt(startingOdometer),
    createdAt: new Date().toISOString()
  };
  vehicles.push(vehicle);
  saveVehicles(vehicles);
  showAlert('Vehicle added successfully!');
  renderVehicleList();
  updateVehicleSelects();
}

function updateVehicle(id, make, model, year, nickname, color, startingOdometer) {
  const vehicles = getVehicles();
  const index = vehicles.findIndex(v => v.id === id);
  if (index !== -1) {
    vehicles[index] = {
      ...vehicles[index],
      make,
      model,
      year: parseInt(year),
      nickname: nickname || null,
      color: color || '#2563eb',
      startingOdometer: parseInt(startingOdometer)
    };
    saveVehicles(vehicles);
    showAlert('Vehicle updated successfully!');
    renderVehicleList();
    updateVehicleSelects();
    renderDashboard();
  }
}

function deleteVehicle(id) {
  const vehicles = getVehicles();
  const receipts = getReceipts();

  const filteredVehicles = vehicles.filter(v => v.id !== id);
  const filteredReceipts = receipts.filter(r => r.vehicleId !== id);

  saveVehicles(filteredVehicles);
  saveReceipts(filteredReceipts);

  showAlert('Vehicle and all associated receipts deleted.');
  renderVehicleList();
  updateVehicleSelects();
  renderDashboard();
  renderReceiptList();
}

function clearAllData() {
  document.getElementById('delete-message').textContent = 'Are you sure you want to delete ALL data? This cannot be undone.';
  deleteCallback = () => {
    localStorage.clear();
    showAlert('All data cleared.');
    renderVehicleList();
    updateVehicleSelects();
    renderReceiptList();
    renderDashboard();
  };
  openModal('delete-modal');
}

function renderVehicleList() {
  const vehicles = getVehicles();
  const list = document.getElementById('vehicle-list');

  if (vehicles.length === 0) {
    list.innerHTML = '<li class="empty-state">No vehicles added yet.</li>';
    return;
  }

  list.innerHTML = vehicles.map(v => `
    <li class="vehicle-item">
      <div class="vehicle-info">
        <h3 style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="width: 12px; height: 12px; border-radius: 50%; background-color: ${escapeHtml(v.color || '#2563eb')};"></span>
          ${escapeHtml(v.make)} ${escapeHtml(v.model)}
          ${v.nickname ? `<span style="font-size: 0.85rem; color: var(--text-secondary);">(${escapeHtml(v.nickname)})</span>` : ''}
        </h3>
        <p>${escapeHtml(String(v.year))} | Starting: ${v.startingOdometer.toLocaleString()} km</p>
      </div>
      <div class="vehicle-actions">
        <button class="btn btn-secondary" onclick="openEditVehicleModal('${v.id}')">Edit</button>
        <button class="btn btn-danger" onclick="confirmDeleteVehicle('${v.id}')">Delete</button>
      </div>
    </li>
  `).join('');
}

function updateVehicleSelects() {
  const vehicles = getVehicles();
  const receiptSelect = document.getElementById('receipt-vehicle');
  const filterSelect = document.getElementById('filter-vehicle');

  const getVehicleLabel = (v) => {
    const base = `${v.make} ${v.model}`;
    return v.nickname ? `${base} (${v.nickname})` : base;
  };

  const options = '<option value="">Select a vehicle</option>' +
    vehicles.map(v => `<option value="${escapeHtml(v.id)}">${escapeHtml(getVehicleLabel(v))}</option>`).join('');

  receiptSelect.innerHTML = options;
  filterSelect.innerHTML = '<option value="">All Vehicles</option>' +
    vehicles.map(v => `<option value="${escapeHtml(v.id)}">${escapeHtml(getVehicleLabel(v))}</option>`).join('');
}

// Receipt Functions
function addReceipt(vehicleId, volumeLitres, pricePerLitre, date, odometer, gasStation) {
  const vehicle = getVehicleById(vehicleId);
  if (!vehicle) {
    showAlert('Vehicle not found.', 'error');
    return;
  }

  const odometerValidation = validateOdometer(odometer, vehicle);
  if (!odometerValidation.valid) {
    showAlert(odometerValidation.message, 'error');
    return;
  }

  const totalPrice = calculateTotalPrice(volumeLitres, pricePerLitre);
  const distanceKm = calculateDistance(odometer, vehicle);
  const consumptionLPer100km = calculateConsumption(volumeLitres, distanceKm);

  const receipts = getReceipts();
  const receipt = {
    id: generateId(),
    vehicleId,
    volumeLitres: parseFloat(volumeLitres),
    pricePerLitre: parseFloat(pricePerLitre),
    totalPrice,
    date,
    odometer: parseInt(odometer),
    gasStation,
    distanceKm,
    consumptionLPer100km,
    createdAt: new Date().toISOString()
  };

  receipts.push(receipt);
  saveReceipts(receipts);

  showAlert(`Receipt added! Distance: ${formatNumber(distanceKm)} km | Consumption: ${formatNumber(consumptionLPer100km)} L/100km`);
  renderReceiptList();
  renderDashboard();
  document.getElementById('receipt-form').reset();
  document.getElementById('calculated-total').textContent = '$0.00';
}

function deleteReceipt(id) {
  const receipts = getReceipts();
  const filtered = receipts.filter(r => r.id !== id);
  saveReceipts(filtered);
  showAlert('Receipt deleted.');
  renderReceiptList();
  renderDashboard();
}

function getVehicleLabel(v) {
  const base = `${v.make} ${v.model}`;
  return v.nickname ? `${base} (${v.nickname})` : base;
}

function renderReceiptList() {
  const receipts = getReceipts();
  const vehicles = getVehicles();
  const filterVehicle = document.getElementById('filter-vehicle').value;
  const list = document.getElementById('receipt-list');

  let filteredReceipts = receipts.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (filterVehicle) {
    filteredReceipts = filteredReceipts.filter(r => r.vehicleId === filterVehicle);
  }

  if (filteredReceipts.length === 0) {
    list.innerHTML = '<li class="empty-state">No receipts added yet.</li>';
    return;
  }

  list.innerHTML = filteredReceipts.map(r => {
    const vehicle = getVehicleById(r.vehicleId);
    const vehicleName = vehicle ? getVehicleLabel(vehicle) : 'Unknown';
    return `
      <li class="receipt-item">
        <div class="receipt-header">
          <div>
            <strong>${escapeHtml(vehicleName)}</strong>
            <span class="receipt-date">${formatDate(r.date)}</span>
          </div>
          <button class="btn btn-danger" onclick="confirmDeleteReceipt('${r.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Delete</button>
        </div>
        <div class="receipt-details">
          <div class="receipt-detail">
            <label>Volume</label>
            <span>${formatNumber(r.volumeLitres)} L</span>
          </div>
          <div class="receipt-detail">
            <label>Price/L</label>
            <span>${formatCurrency(r.pricePerLitre)}</span>
          </div>
          <div class="receipt-detail">
            <label>Total</label>
            <span>${formatCurrency(r.totalPrice)}</span>
          </div>
          <div class="receipt-detail">
            <label>Odometer</label>
            <span>${r.odometer.toLocaleString()} km</span>
          </div>
          <div class="receipt-detail">
            <label>Distance</label>
            <span>${formatNumber(r.distanceKm)} km</span>
          </div>
          <div class="receipt-detail">
            <label>Consumption</label>
            <span class="consumption-badge">${formatNumber(r.consumptionLPer100km)} L/100km</span>
          </div>
          <div class="receipt-detail" style="grid-column: 1 / -1;">
            <label>Gas Station</label>
            <span>${escapeHtml(r.gasStation)}</span>
          </div>
        </div>
      </li>
    `;
  }).join('');
}

// Dashboard Functions
function renderDashboard() {
  const vehicles = getVehicles();
  const receipts = getReceipts();

  document.getElementById('total-vehicles').textContent = vehicles.length;
  document.getElementById('total-receipts').textContent = receipts.length;

  const totalSpent = receipts.reduce((sum, r) => sum + r.totalPrice, 0);
  document.getElementById('total-spent').textContent = formatCurrency(totalSpent);

  const consumptions = receipts.filter(r => r.consumptionLPer100km > 0).map(r => r.consumptionLPer100km);
  const avgConsumption = consumptions.length > 0
    ? consumptions.reduce((a, b) => a + b, 0) / consumptions.length
    : 0;
  document.getElementById('avg-consumption').textContent = consumptions.length > 0 ? formatNumber(avgConsumption) : '--';

  const vehicleStatsList = document.getElementById('vehicle-stats-list');
  if (vehicles.length === 0) {
    vehicleStatsList.innerHTML = '<p class="no-receipts">Add vehicles and receipts to see statistics.</p>';
  } else {
    vehicleStatsList.innerHTML = vehicles.map(v => {
      const vReceipts = getVehicleReceipts(v.id);
      const vConsumptions = vReceipts.filter(r => r.consumptionLPer100km > 0).map(r => r.consumptionLPer100km);
      const vAvg = vConsumptions.length > 0
        ? vConsumptions.reduce((a, b) => a + b, 0) / vConsumptions.length
        : 0;
      const totalSpent = vReceipts.reduce((sum, r) => sum + r.totalPrice, 0);

      return `
        <div class="vehicle-item" style="margin-bottom: 1rem;">
          <div class="vehicle-info">
            <h3 style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="width: 12px; height: 12px; border-radius: 50%; background-color: ${escapeHtml(v.color || '#2563eb')};"></span>
              ${escapeHtml(v.make)} ${escapeHtml(v.model)}
              ${v.nickname ? `<span style="font-size: 0.85rem; color: var(--text-secondary);">(${escapeHtml(v.nickname)})</span>` : ''}
            </h3>
            <p>${vReceipts.length} receipt(s) | Total: ${formatCurrency(totalSpent)}</p>
          </div>
          <div class="stat-card" style="padding: 0.5rem;">
            <label style="font-size: 0.75rem;">Avg Consumption</label>
            <div class="value" style="font-size: 1.25rem;">${vConsumptions.length > 0 ? formatNumber(vAvg) : '--'}</div>
            <div class="unit" style="font-size: 0.75rem;">L/100km</div>
          </div>
        </div>
      `;
    }).join('');
  }

  const recentReceipts = document.getElementById('recent-receipts');
  if (receipts.length === 0) {
    recentReceipts.innerHTML = '<p class="no-receipts">No receipts yet. Add your first receipt!</p>';
  } else {
    const sorted = [...receipts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    recentReceipts.innerHTML = sorted.map(r => {
      const vehicle = getVehicleById(r.vehicleId);
      const vehicleName = vehicle ? getVehicleLabel(vehicle) : 'Unknown';
      return `
        <div class="receipt-item" style="padding: 0.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>${escapeHtml(vehicleName)}</strong>
              <span class="receipt-date">${formatDate(r.date)}</span>
            </div>
            <span class="consumption-badge">${formatNumber(r.consumptionLPer100km)} L/100km</span>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">
            ${formatNumber(r.volumeLitres)} L @ ${formatCurrency(r.pricePerLitre)} | ${formatNumber(r.distanceKm)} km
          </div>
        </div>
      `;
    }).join('');
  }
}

// Modal Functions
let deleteCallback = null;

function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function confirmDeleteVehicle(id) {
  const vehicle = getVehicleById(id);
  const vehicleLabel = getVehicleLabel(vehicle);
  document.getElementById('delete-message').textContent =
    `Are you sure you want to delete "${vehicleLabel}"? All associated receipts will also be deleted.`;
  deleteCallback = () => deleteVehicle(id);
  openModal('delete-modal');
}

function confirmDeleteReceipt(id) {
  document.getElementById('delete-message').textContent = 'Are you sure you want to delete this receipt?';
  deleteCallback = () => deleteReceipt(id);
  openModal('delete-modal');
}

function openEditVehicleModal(id) {
  const vehicle = getVehicleById(id);
  if (!vehicle) return;

  document.getElementById('edit-vehicle-id').value = id;
  document.getElementById('edit-vehicle-make').value = vehicle.make;
  document.getElementById('edit-vehicle-model').value = vehicle.model;
  document.getElementById('edit-vehicle-year').value = vehicle.year;
  document.getElementById('edit-vehicle-nickname').value = vehicle.nickname || '';
  document.getElementById('edit-vehicle-color').value = vehicle.color || '#2563eb';
  document.getElementById('edit-vehicle-odometer').value = vehicle.startingOdometer;
  openModal('edit-vehicle-modal');
}

// Export/Import Functions
function exportData() {
  const encryptExport = document.getElementById('encrypt-export').checked;
  const password = document.getElementById('export-password').value;
  
  const data = {
    vehicles: getVehicles(),
    receipts: getReceipts(),
    exportedAt: new Date().toISOString()
  };

  if (encryptExport && password) {
    encryptData(JSON.stringify(data), password).then(encrypted => {
      const blob = new Blob([encrypted], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fuellog-backup-${new Date().toISOString().split('T')[0]}-encrypted.json`;
      a.click();
      URL.revokeObjectURL(url);
      showAlert('Data exported and encrypted!');
    }).catch(err => {
      showAlert('Encryption failed: ' + err.message, 'error');
    });
  } else {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuellog-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showAlert('Data exported successfully!');
  }
  
  document.getElementById('export-password').value = '';
}

async function encryptData(plaintext, password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

async function decryptData(encryptedBase64, password) {
  const encoder = new TextEncoder();
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const encrypted = combined.slice(28);
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

function importData(file) {
  const password = document.getElementById('import-password').value;
  const reader = new FileReader();
  
  const tryParseData = (jsonString) => {
    const data = JSON.parse(jsonString);

    if (!data.vehicles || !Array.isArray(data.vehicles)) {
      throw new Error('Invalid data format: missing vehicles array');
    }

    if (!data.receipts || !Array.isArray(data.receipts)) {
      throw new Error('Invalid data format: missing receipts array');
    }

    const existingVehicles = getVehicles();
    const existingReceipts = getReceipts();
    const existingVehicleIds = new Set(existingVehicles.map(v => v.id));
    const existingReceiptIds = new Set(existingReceipts.map(r => r.id));

    const validVehicles = data.vehicles.filter(v => {
      if (!v.id || !v.make || !v.model || !v.year || !v.startingOdometer) return false;
      if (existingVehicleIds.has(v.id)) return false;
      if (typeof v.year !== 'number' || v.year < 1900 || v.year > 2100) return false;
      if (typeof v.startingOdometer !== 'number' || v.startingOdometer < 0) return false;
      return true;
    });

    const newVehicleIds = new Set(validVehicles.map(v => v.id));

    const validReceipts = data.receipts.filter(r => {
      if (!r.id || !r.vehicleId || !r.volumeLitres || !r.date || !r.odometer) return false;
      if (existingReceiptIds.has(r.id)) return false;
      if (!existingVehicleIds.has(r.vehicleId) && !newVehicleIds.has(r.vehicleId)) return false;
      const receiptDate = new Date(r.date);
      if (isNaN(receiptDate.getTime())) return false;
      if (receiptDate > new Date()) return false;
      if (typeof r.volumeLitres !== 'number' || r.volumeLitres <= 0) return false;
      if (typeof r.odometer !== 'number' || r.odometer < 0) return false;
      
      const existingReceiptsForVehicle = existingReceipts.filter(er => er.vehicleId === r.vehicleId);
      const lastReceipt = existingReceiptsForVehicle.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      const importedVehicle = validVehicles.find(v => v.id === r.vehicleId);
      const previousOdometer = lastReceipt ? lastReceipt.odometer : (importedVehicle ? importedVehicle.startingOdometer : 0);
      if (r.odometer < previousOdometer) return false;
      
      return true;
    });

    saveVehicles([...existingVehicles, ...validVehicles]);
    saveReceipts([...existingReceipts, ...validReceipts]);

    showAlert(`Imported ${validVehicles.length} vehicles and ${validReceipts.length} receipts! (${data.vehicles.length - validVehicles.length} vehicles, ${data.receipts.length - validReceipts.length} receipts skipped)`);
    renderVehicleList();
    updateVehicleSelects();
    renderReceiptList();
    renderDashboard();
  };

  reader.onload = (e) => {
    const content = e.target.result;
    
    if (password) {
      decryptData(content, password).then(tryParseData).catch(err => {
        showAlert('Decryption failed: ' + err.message + '. If the file is not encrypted, leave the password field empty.', 'error');
      });
    } else {
      try {
        tryParseData(content);
      } catch (err) {
        showAlert('Failed to import data: ' + err.message, 'error');
      }
    }
  };
  
  reader.readAsText(file);
}

// Event Listeners
function initEventListeners() {
  document.getElementById('vehicle-form').addEventListener('submit', (e) => {
    e.preventDefault();
    addVehicle(
      document.getElementById('vehicle-make').value.trim(),
      document.getElementById('vehicle-model').value.trim(),
      document.getElementById('vehicle-year').value,
      document.getElementById('vehicle-nickname').value.trim(),
      document.getElementById('vehicle-color').value,
      document.getElementById('vehicle-odometer').value
    );
    e.target.reset();
  });

  document.getElementById('receipt-form').addEventListener('submit', (e) => {
    e.preventDefault();
    addReceipt(
      document.getElementById('receipt-vehicle').value,
      document.getElementById('receipt-volume').value,
      document.getElementById('receipt-price').value,
      document.getElementById('receipt-date').value,
      document.getElementById('receipt-odometer').value,
      document.getElementById('receipt-station').value.trim()
    );
  });

  document.getElementById('receipt-volume').addEventListener('input', updateCalculatedTotal);
  document.getElementById('receipt-price').addEventListener('input', updateCalculatedTotal);

  function updateCalculatedTotal() {
    const volume = parseFloat(document.getElementById('receipt-volume').value) || 0;
    const price = parseFloat(document.getElementById('receipt-price').value) || 0;
    document.getElementById('calculated-total').textContent = formatCurrency(volume * price);
  }

  document.getElementById('filter-vehicle').addEventListener('change', renderReceiptList);

  document.getElementById('encrypt-export').addEventListener('change', (e) => {
    document.getElementById('export-password-group').classList.toggle('hidden', !e.target.checked);
  });

  document.getElementById('export-btn').addEventListener('click', exportData);
  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-password-group').classList.remove('hidden');
    document.getElementById('import-file').click();
  });
  document.getElementById('import-file').addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      importData(e.target.files[0]);
      document.getElementById('import-password').value = '';
    }
  });
  document.getElementById('clear-data-btn').addEventListener('click', clearAllData);

  document.getElementById('about-btn').addEventListener('click', () => {
    openModal('about-modal');
  });
  document.getElementById('close-about').addEventListener('click', () => {
    closeModal('about-modal');
  });

  document.getElementById('edit-vehicle-form').addEventListener('submit', (e) => {
    e.preventDefault();
    updateVehicle(
      document.getElementById('edit-vehicle-id').value,
      document.getElementById('edit-vehicle-make').value.trim(),
      document.getElementById('edit-vehicle-model').value.trim(),
      document.getElementById('edit-vehicle-year').value,
      document.getElementById('edit-vehicle-nickname').value.trim(),
      document.getElementById('edit-vehicle-color').value,
      document.getElementById('edit-vehicle-odometer').value
    );
    closeModal('edit-vehicle-modal');
  });

  document.getElementById('cancel-edit-vehicle').addEventListener('click', () => {
    closeModal('edit-vehicle-modal');
  });

  document.getElementById('confirm-delete').addEventListener('click', () => {
    if (deleteCallback) {
      deleteCallback();
      deleteCallback = null;
    }
    closeModal('delete-modal');
  });

  document.getElementById('cancel-delete').addEventListener('click', () => {
    deleteCallback = null;
    closeModal('delete-modal');
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        deleteCallback = null;
      }
    });
  });

  document.getElementById('receipt-date').value = new Date().toISOString().split('T')[0];
}

// Initialize App
function init() {
  initTabs();
  initEventListeners();
  renderVehicleList();
  updateVehicleSelects();
  renderReceiptList();
  renderDashboard();
}

document.addEventListener('DOMContentLoaded', init);
