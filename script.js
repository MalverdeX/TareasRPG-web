class TareasRPG {
    constructor() {
        this.player = {
            name: 'Aventurero',
            level: 1,
            currentExp: 0,
            maxExp: 100,
            coins: 0,
            inventory: [],
            equipment: {
                head: null,
                chest: null,
                weapon: null
            }
        };
        
        this.tasks = [];
        this.taskStreaks = {}; // Guardar rachas de cada tarea
        this.currentView = 'dashboard';
        this.currentDate = new Date();
        
        this.items = [
            { id: 1, name: 'Espada de Hierro', type: 'weapon', rarity: 'common', price: 50, stats: { attack: 5 }, icon: '⚔️' },
            { id: 2, name: 'Armadura de Cuero', type: 'chest', rarity: 'common', price: 40, stats: { defense: 3 }, icon: '🛡️' },
            { id: 3, name: 'Casco de Bronce', type: 'head', rarity: 'common', price: 30, stats: { defense: 2 }, icon: '🪖' },
            { id: 4, name: 'Espada Mágica', type: 'weapon', rarity: 'rare', price: 150, stats: { attack: 12 }, icon: '✨' },
            { id: 5, name: 'Armadura de Acero', type: 'chest', rarity: 'rare', price: 120, stats: { defense: 8 }, icon: '🎖️' },
            { id: 6, name: 'Corona Dorada', type: 'head', rarity: 'epic', price: 300, stats: { defense: 15, wisdom: 5 }, icon: '👑' },
            { id: 7, name: 'Poción de Curación', type: 'consumable', rarity: 'common', price: 20, effect: 'heal', icon: '🧪' },
            { id: 8, name: 'Gema de Poder', type: 'accessory', rarity: 'epic', price: 250, stats: { attack: 8, defense: 8 }, icon: '💎' }
        ];
        
        this.init();
    }
    
    init() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.renderSchedule();
        this.renderTasks();
        this.renderCalendar();
        this.updatePlayerStats();
        this.renderInventory();
        this.renderMarket();
    }
    
    setupEventListeners() {
        // Navegación
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });
        
        // Botón agregar tarea
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.openTaskModal();
        });
        
        // Formulario de tarea
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });
        
        // Auto-calcular recompensas
        document.getElementById('taskPriority').addEventListener('change', () => {
            this.calculateRewards();
        });
        
        document.getElementById('taskRepeat').addEventListener('change', () => {
            this.calculateRewards();
        });
        
        // Modal close
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });
        
        // Calendario navegación
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });
        
        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });
        
        // Mercado tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderMarket(e.target.dataset.tab);
            });
        });
        
        // Cajas de botín
        document.querySelectorAll('.btn-buy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.openLootBox(e.target.dataset.rarity, parseInt(e.target.dataset.price));
            });
        });
        
        // Claim reward
        document.getElementById('claimReward').addEventListener('click', () => {
            this.claimReward();
        });
    }
    
    switchView(viewName) {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.getElementById(viewName).classList.add('active');
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
        this.currentView = viewName;
    }
    
    openTaskModal(taskId = null) {
        const modal = document.getElementById('taskModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('taskForm');
        
        if (taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            modalTitle.textContent = 'Editar Misión';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskExp').value = task.exp;
            document.getElementById('taskCoins').value = task.coins;
            document.getElementById('taskRepeat').value = task.repeat;
            document.getElementById('taskDate').value = task.date;
            document.getElementById('taskTime').value = task.time;
            form.dataset.taskId = taskId;
        } else {
            modalTitle.textContent = 'Nueva Misión';
            form.reset();
            delete form.dataset.taskId;
        }
        
        modal.style.display = 'block';
    }
    
    calculateRewards() {
        const priority = document.getElementById('taskPriority').value;
        const repeat = document.getElementById('taskRepeat').value;
        
        // Valores base según prioridad
        const baseRewards = {
            low: { exp: 10, coins: 5 },
            medium: { exp: 20, coins: 10 },
            high: { exp: 30, coins: 15 }
        };
        
        // Multiplicador según frecuencia
        const repeatMultiplier = {
            none: 1,
            daily: 0.5, // Las tareas diarias dan menos base pero más por racha
            weekly: 1.2,
            monthly: 2
        };
        
        const base = baseRewards[priority];
        const multiplier = repeatMultiplier[repeat];
        
        const exp = Math.round(base.exp * multiplier);
        const coins = Math.round(base.coins * multiplier);
        
        document.getElementById('autoExp').textContent = exp;
        document.getElementById('autoCoins').textContent = coins;
        
        return { exp, coins };
    }
    
    saveTask() {
        const form = document.getElementById('taskForm');
        const taskId = form.dataset.taskId;
        const rewards = this.calculateRewards();
        
        const taskData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            exp: rewards.exp,
            coins: rewards.coins,
            repeat: document.getElementById('taskRepeat').value,
            date: document.getElementById('taskDate').value,
            time: document.getElementById('taskTime').value,
            completed: false
        };
        
        if (taskId) {
            const index = this.tasks.findIndex(t => t.id === taskId);
            this.tasks[index] = { ...this.tasks[index], ...taskData };
        } else {
            taskData.id = Date.now();
            this.tasks.push(taskData);
        }
        
        this.saveToLocalStorage();
        this.renderTasks();
        this.renderCalendar();
        document.getElementById('taskModal').style.display = 'none';
    }
    
    completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task.completed) {
            task.completed = true;
            
            // Calcular recompensas con bonificación de racha
            const streakBonus = this.calculateStreakBonus(task);
            const totalExp = task.exp + streakBonus.exp;
            const totalCoins = task.coins + streakBonus.coins;
            
            this.showRewardModal(totalExp, totalCoins, streakBonus.streak);
            
            // Actualizar racha
            this.updateStreak(task);
            
            // Manejar repetición
            if (task.repeat !== 'none') {
                this.createRecurringTask(task);
            }
        }
        
        this.saveToLocalStorage();
        this.renderTasks();
    }
    
    calculateStreakBonus(task) {
        const taskKey = `${task.title}_${task.repeat}`;
        const streak = this.taskStreaks[taskKey] || 0;
        
        // Bonificación: 10% extra por cada día de racha, máximo 200%
        const bonusMultiplier = Math.min(1 + (streak * 0.1), 3);
        
        const bonusExp = Math.round(task.exp * (bonusMultiplier - 1));
        const bonusCoins = Math.round(task.coins * (bonusMultiplier - 1));
        
        return {
            streak,
            exp: bonusExp,
            coins: bonusCoins,
            multiplier: bonusMultiplier
        };
    }
    
    updateStreak(task) {
        if (task.repeat === 'none') return;
        
        const taskKey = `${task.title}_${task.repeat}`;
        const today = new Date().toDateString();
        const lastCompleted = this.taskStreaks[`${taskKey}_last`] || '';
        
        // Si es la primera vez o completó ayer, aumentar racha
        if (!this.taskStreaks[taskKey]) {
            this.taskStreaks[taskKey] = 1;
        } else {
            const lastDate = new Date(lastCompleted);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                this.taskStreaks[taskKey]++;
            } else if (diffDays > 1) {
                // Rompió la racha
                this.taskStreaks[taskKey] = 1;
            }
            // Si diffDays === 0, es el mismo día, no cambiar
        }
        
        this.taskStreaks[`${taskKey}_last`] = today;
    }
    
    createRecurringTask(originalTask) {
        let newDate = new Date(originalTask.date);
        
        switch (originalTask.repeat) {
            case 'daily':
                newDate.setDate(newDate.getDate() + 1);
                break;
            case 'weekly':
                newDate.setDate(newDate.getDate() + 7);
                break;
            case 'monthly':
                newDate.setMonth(newDate.getMonth() + 1);
                break;
        }
        
        const newTask = {
            ...originalTask,
            id: Date.now(),
            date: newDate.toISOString().split('T')[0],
            completed: false
        };
        
        this.tasks.push(newTask);
    }
    
    showRewardModal(exp, coins, streak = 0) {
        document.getElementById('rewardExp').textContent = exp;
        document.getElementById('rewardCoins').textContent = coins;
        
        const modal = document.getElementById('rewardModal');
        const rewardDisplay = modal.querySelector('.reward-display');
        
        if (streak > 0) {
            const streakInfo = document.createElement('div');
            streakInfo.className = 'streak-bonus';
            streakInfo.innerHTML = `
                <div class="reward-item">
                    <span class="reward-icon">🔥</span>
                    <span class="reward-text">Racha de ${streak} días</span>
                </div>
            `;
            
            // Remover streak anterior si existe
            const existingStreak = rewardDisplay.querySelector('.streak-bonus');
            if (existingStreak) {
                existingStreak.remove();
            }
            
            rewardDisplay.appendChild(streakInfo);
        }
        
        modal.style.display = 'block';
        
        this.pendingReward = { exp, coins };
    }
    
    claimReward() {
        if (this.pendingReward) {
            this.player.currentExp += this.pendingReward.exp;
            this.player.coins += this.pendingReward.coins;
            
            // Verificar nivel
            while (this.player.currentExp >= this.player.maxExp) {
                this.player.currentExp -= this.player.maxExp;
                this.player.level++;
                this.player.maxExp = Math.floor(this.player.maxExp * 1.5);
            }
            
            this.updatePlayerStats();
            this.saveToLocalStorage();
            document.getElementById('rewardModal').style.display = 'none';
            this.pendingReward = null;
        }
    }
    
    renderTasks() {
        const pendingContainer = document.getElementById('pendingTasks');
        const completedContainer = document.getElementById('completedTasks');
        
        const pendingTasks = this.tasks.filter(t => !t.completed);
        const completedTasks = this.tasks.filter(t => t.completed);
        
        pendingContainer.innerHTML = '';
        completedContainer.innerHTML = '';
        
        pendingTasks.forEach(task => {
            pendingContainer.appendChild(this.createTaskElement(task));
        });
        
        completedTasks.forEach(task => {
            completedContainer.appendChild(this.createTaskElement(task));
        });
    }
    
    createTaskElement(task) {
        const taskEl = document.createElement('div');
        taskEl.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
        
        // Calcular bonificación de racha
        const taskKey = `${task.title}_${task.repeat}`;
        const streak = this.taskStreaks[taskKey] || 0;
        const streakBonus = streak > 0 ? this.calculateStreakBonus(task) : null;
        
        taskEl.innerHTML = `
            <h4>${task.title}</h4>
            <p>${task.description || 'Sin descripción'}</p>
            <div class="task-meta">
                <span>⭐ ${task.exp} EXP</span>
                <span>💰 ${task.coins} monedas</span>
                ${task.date ? `<span>📅 ${task.date}</span>` : ''}
                ${task.time ? `<span>🕐 ${task.time}</span>` : ''}
                ${streak > 0 ? `<span class="streak-indicator">🔥 ${streak} días</span>` : ''}
            </div>
            ${streakBonus ? `<div class="bonus-info">+${streakBonus.exp} EXP, +${streakBonus.coins} 💰 por racha</div>` : ''}
            <div class="task-actions">
                ${!task.completed ? `<button class="btn-complete" onclick="game.completeTask(${task.id})">Completar</button>` : ''}
                <button class="btn-edit" onclick="game.openTaskModal(${task.id})">Editar</button>
                <button class="btn-delete" onclick="game.deleteTask(${task.id})">Eliminar</button>
            </div>
        `;
        
        return taskEl;
    }
    
    deleteTask(taskId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta misión?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveToLocalStorage();
            this.renderTasks();
        }
    }
    
    renderSchedule() {
        const scheduleGrid = document.getElementById('scheduleGrid');
        const hours = Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`);
        const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        
        scheduleGrid.innerHTML = '';
        
        // Esquina vacía
        const corner = document.createElement('div');
        scheduleGrid.appendChild(corner);
        
        // Días de la semana
        days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            scheduleGrid.appendChild(dayHeader);
        });
        
        // Horas y celdas
        hours.forEach(hour => {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = hour;
            scheduleGrid.appendChild(timeSlot);
            
            days.forEach(() => {
                const timeCell = document.createElement('div');
                timeCell.className = 'time-cell';
                timeCell.addEventListener('click', () => {
                    this.openTaskModal();
                });
                scheduleGrid.appendChild(timeCell);
            });
        });
    }
    
    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonth = document.getElementById('currentMonth');
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        currentMonth.textContent = `${this.getMonthName(month)} ${year}`;
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        calendarGrid.innerHTML = '';
        
        // Días de la semana
        const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        weekDays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.style.fontWeight = 'bold';
            dayHeader.style.textAlign = 'center';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });
        
        // Espacios vacíos
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            calendarGrid.appendChild(emptyDay);
        }
        
        // Días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const dayTasks = this.tasks.filter(t => t.date === dateStr);
            
            dayEl.innerHTML = `
                <div style="font-weight: bold;">${day}</div>
                ${dayTasks.length > 0 ? `<div style="font-size: 12px;">${dayTasks.length} misión(es)</div>` : ''}
            `;
            
            dayEl.addEventListener('click', () => {
                document.getElementById('taskDate').value = dateStr;
                this.openTaskModal();
            });
            
            calendarGrid.appendChild(dayEl);
        }
    }
    
    getMonthName(month) {
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return months[month];
    }
    
    updatePlayerStats() {
        document.getElementById('playerName').textContent = this.player.name;
        document.getElementById('playerLevel').textContent = this.player.level;
        document.getElementById('currentExp').textContent = this.player.currentExp;
        document.getElementById('maxExp').textContent = this.player.maxExp;
        document.getElementById('playerCoins').textContent = this.player.coins;
        document.getElementById('expFill').style.width = `${(this.player.currentExp / this.player.maxExp) * 100}%`;
    }
    
    renderInventory() {
        const inventoryGrid = document.getElementById('inventoryGrid');
        inventoryGrid.innerHTML = '';
        
        this.player.inventory.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'inventory-item';
            itemEl.innerHTML = `
                <div style="font-size: 32px;">${item.icon}</div>
                <div style="font-size: 12px; margin-top: 5px;">${item.name}</div>
            `;
            
            itemEl.addEventListener('click', () => {
                this.equipItem(item);
            });
            
            inventoryGrid.appendChild(itemEl);
        });
        
        // Render equipment
        Object.keys(this.player.equipment).forEach(slot => {
            const slotEl = document.querySelector(`[data-slot="${slot}"] .slot-item`);
            const item = this.player.equipment[slot];
            slotEl.innerHTML = item ? item.icon : '';
            slotEl.title = item ? item.name : 'Vacío';
        });
    }
    
    equipItem(item) {
        if (item.type === 'consumable') {
            this.useConsumable(item);
            return;
        }
        
        const slot = item.type === 'weapon' ? 'weapon' : item.type;
        if (this.player.equipment[slot]) {
            this.player.inventory.push(this.player.equipment[slot]);
        }
        this.player.equipment[slot] = item;
        this.player.inventory = this.player.inventory.filter(i => i.id !== item.id);
        
        this.renderInventory();
        this.saveToLocalStorage();
    }
    
    useConsumable(item) {
        if (item.effect === 'heal') {
            // Efecto de curación
            alert('Has usado una poción de curación');
        }
        this.player.inventory = this.player.inventory.filter(i => i.id !== item.id);
        this.renderInventory();
        this.saveToLocalStorage();
    }
    
    renderMarket(tab = 'buy') {
        const marketGrid = document.getElementById('marketGrid');
        marketGrid.innerHTML = '';
        
        if (tab === 'buy') {
            this.items.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'market-item';
                itemEl.innerHTML = `
                    <div style="font-size: 32px;">${item.icon}</div>
                    <h4>${item.name}</h4>
                    <div style="font-size: 12px; color: ${this.getRarityColor(item.rarity)}">${item.rarity}</div>
                    <div style="margin: 10px 0;">💰 ${item.price}</div>
                    <button class="btn-primary" onclick="game.buyItem(${item.id})">Comprar</button>
                `;
                marketGrid.appendChild(itemEl);
            });
        } else {
            this.player.inventory.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'market-item';
                itemEl.innerHTML = `
                    <div style="font-size: 32px;">${item.icon}</div>
                    <h4>${item.name}</h4>
                    <div style="font-size: 12px; color: ${this.getRarityColor(item.rarity)}">${item.rarity}</div>
                    <div style="margin: 10px 0;">💰 ${Math.floor(item.price * 0.7)}</div>
                    <button class="btn-primary" onclick="game.sellItem(${item.id})">Vender</button>
                `;
                marketGrid.appendChild(itemEl);
            });
        }
    }
    
    buyItem(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (this.player.coins >= item.price) {
            this.player.coins -= item.price;
            this.player.inventory.push({...item});
            this.updatePlayerStats();
            this.renderInventory();
            this.renderMarket();
            this.saveToLocalStorage();
        } else {
            alert('No tienes suficientes monedas');
        }
    }
    
    sellItem(itemId) {
        const item = this.player.inventory.find(i => i.id === itemId);
        const sellPrice = Math.floor(item.price * 0.7);
        this.player.coins += sellPrice;
        this.player.inventory = this.player.inventory.filter(i => i.id !== itemId);
        this.updatePlayerStats();
        this.renderInventory();
        this.renderMarket('sell');
        this.saveToLocalStorage();
    }
    
    openLootBox(rarity, price) {
        if (this.player.coins >= price) {
            this.player.coins -= price;
            this.updatePlayerStats();
            
            const items = this.getRandomLoot(rarity);
            const item = items[Math.floor(Math.random() * items.length)];
            
            this.player.inventory.push({...item});
            this.renderInventory();
            this.saveToLocalStorage();
            
            alert(`¡Has obtenido: ${item.name}!`);
        } else {
            alert('No tienes suficientes monedas');
        }
    }
    
    getRandomLoot(rarity) {
        const lootTable = {
            common: this.items.filter(i => i.rarity === 'common'),
            rare: this.items.filter(i => i.rarity === 'rare'),
            epic: this.items.filter(i => i.rarity === 'epic')
        };
        
        return lootTable[rarity] || lootTable.common;
    }
    
    getRarityColor(rarity) {
        const colors = {
            common: '#228B22',
            rare: '#FF8C00',
            epic: '#FFD700'
        };
        return colors[rarity] || '#FFFFFF';
    }
    
    saveToLocalStorage() {
        localStorage.setItem('tareasrpg_player', JSON.stringify(this.player));
        localStorage.setItem('tareasrpg_tasks', JSON.stringify(this.tasks));
        localStorage.setItem('tareasrpg_streaks', JSON.stringify(this.taskStreaks));
    }
    
    loadFromLocalStorage() {
        const savedPlayer = localStorage.getItem('tareasrpg_player');
        const savedTasks = localStorage.getItem('tareasrpg_tasks');
        const savedStreaks = localStorage.getItem('tareasrpg_streaks');
        
        if (savedPlayer) {
            this.player = JSON.parse(savedPlayer);
        }
        
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        }
        
        if (savedStreaks) {
            this.taskStreaks = JSON.parse(savedStreaks);
        }
    }
}

// Inicializar el juego
const game = new TareasRPG();
