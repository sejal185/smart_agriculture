const crops = [
    { id: 1, name: 'Paddy', moisture: 65, temp: 28, humidity: 82, health: 92, history: [] },
    { id: 2, name: 'Sugarcane', moisture: 45, temp: 32, humidity: 78, health: 78, history: [] },
    { id: 3, name: 'Cotton', moisture: 52, temp: 30, humidity: 65, health: 85, history: [] },
    { id: 4, name: 'Soybean', moisture: 38, temp: 29, humidity: 70, health: 72, history: [] }
];

let farmState = { irrigationActive: false, fertilizerLevel: 50, totalYield: 1250 };

function getHealthClass(health) {
    if (health > 85) return 'healthy'; 
    if (health > 70) return 'warning'; 
    return 'critical';
}

function drawSparkline(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext('2d');
    const max = Math.max(...data), min = Math.min(...data);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = data[data.length-1] > 50 ? '#10b981' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    
    data.forEach((point, i) => {
        const x = (i / data.length) * canvas.width;
        const y = canvas.height - ((point - min) / (max - min)) * (canvas.height * 0.8);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
}

function renderCropList() {
    const container = document.getElementById('crop-list');
    container.innerHTML = crops.map(crop => `
        <div class="crop-card ${getHealthClass(crop.health)}">
            <h3>${crop.name}</h3>
            <p>💧 Moisture: <strong>${crop.moisture.toFixed(1)}%</strong></p>
            <p>🌡️ Temp: <strong>${crop.temp}°C</strong></p>
            <p>💨 Humidity: <strong>${crop.humidity}%</strong></p>
            <canvas id="chart-${crop.id}" width="280" height="50"></canvas>
        </div>
    `
).join('');
    
    crops.forEach(crop => drawSparkline(`chart-${crop.id}`, crop.history));
}

function renderStats() {
    const avgMoisture = (crops.reduce((sum, c) => sum + c.moisture, 0) / crops.length).toFixed(1);
    const alerts = crops.filter(c => c.moisture < 40 || c.health < 70).length;
    
    document.querySelector('.stats-grid').innerHTML = `
        <div class="card">
            <h3> Avg Moisture</h3>
            <p style="font-size: 2rem; font-weight: bold;">${avgMoisture}%</p>
            <p>${avgMoisture > 50 ? 'Optimal' : 'Dry'}</p>
        </div>
        <div class="card">
            <h3> Total Yield</h3>
            <p style="font-size: 2rem; font-weight: bold;">${farmState.totalYield.toFixed(0)} tons</p>
            <p>Expected harvest in 45 days</p>
        </div>
        <div class="card">
            <h3> Alerts</h3>
            <p style="font-size: 2.5rem; color: ${alerts ? 'var(--danger)' : 'var(--success)'}">${alerts}</p>
            <p>${alerts ? 'Crops need attention' : 'All systems normal'}</p>
        </div>
    `;
}

function updateDashboard() {
    renderCropList();
    renderStats();
}


setInterval(() => {
    crops.forEach(crop => {
        crop.moisture += (Math.random() - 0.5) * 8;
        crop.moisture = Math.max(20, Math.min(95, crop.moisture));
        crop.temp += (Math.random() - 0.5) * 2;
        crop.history.push(crop.moisture);
        if (crop.history.length > 30) crop.history.shift();
        
     
        crop.health = Math.round(50 + (crop.moisture / 2) + (100 - crop.temp) * 0.5);
    }
);
    
    
    if (farmState.irrigationActive) {
        crops.forEach(crop => crop.moisture = Math.min(85, crop.moisture + 3));
        farmState.totalYield += 0.5;
    }
    
    updateDashboard();
}
, 4000);


document.addEventListener('DOMContentLoaded', () => {
  
    const saved = localStorage.getItem('farmState');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(crops, data.crops);
        Object.assign(farmState, data.farmState);
    }
    
    updateDashboard();
    

    document.getElementById('dark-toggle').addEventListener('click', () => {
        document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    }
);
    
    document.getElementById('irrigation-btn').addEventListener('click', () => {
        farmState.irrigationActive = !farmState.irrigationActive;
        const btn = document.getElementById('irrigation-btn');
        btn.textContent = farmState.irrigationActive ? '💧 Irrigation ON' : '💧 Irrigation OFF';
        btn.classList.toggle('active', farmState.irrigationActive);
    }
);
    
    document.getElementById('fertilizer').addEventListener('input', (e) => {
        farmState.fertilizerLevel = e.target.value;
        document.getElementById('fert-value').textContent = e.target.value + '%';
        farmState.totalYield += farmState.fertilizerLevel > 70 ? 0.2 : 0;
    }
);
    
    document.getElementById('export-btn').addEventListener('click', () => {
        const data = crops.map(c => ({ name: c.name, moisture: c.moisture, health: c.health }));
        const csv = 'Crop,Moisture,Health\n' + data.map(c => `${c.name},${c.moisture},${c.health}`).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'farm-report.csv'; a.click();
    }
);
    
    
    setInterval(() => localStorage.setItem('farmState', JSON.stringify({ crops, farmState })), 10000);
}
);
