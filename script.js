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
        this.renderDashboardSummary();
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
            this.toggleDateFields();
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

    parseDateInput(dateString) {
        if (!dateString) return null;
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    formatDateInput(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    toggleDateFields() {
        const repeat = document.getElementById('taskRepeat').value;
        const dateGroup = document.getElementById('dateGroup');
        const dayOfWeekGroup = document.getElementById('dayOfWeekGroup');
        const timeGroup = document.getElementById('timeGroup');
        
        // Reset all
        dateGroup.style.display = 'none';
        dayOfWeekGroup.style.display = 'none';
        
        switch(repeat) {
            case 'none':
                dateGroup.style.display = 'block';
                timeGroup.style.display = 'block';
                break;
            case 'daily':
                timeGroup.style.display = 'block';
                break;
            case 'weekly':
                dayOfWeekGroup.style.display = 'block';
                timeGroup.style.display = 'block';
                break;
            case 'monthly':
                dateGroup.style.display = 'block';
                timeGroup.style.display = 'block';
                break;
        }
    }
    
    openTaskModal(taskId = null, defaultValues = {}) {
        const modal = document.getElementById('taskModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('taskForm');
        
        if (taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            modalTitle.textContent = 'Editar Misión';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskRepeat').value = task.repeat;
            document.getElementById('taskDate').value = task.date || '';
            document.getElementById('taskTime').value = task.time || '';
            document.getElementById('taskDayOfWeek').value = task.dayOfWeek ?? '';
            this.toggleDateFields();
            this.calculateRewards();
            form.dataset.taskId = taskId;
        } else {
            modalTitle.textContent = 'Nueva Misión';
            form.reset();
            delete form.dataset.taskId;

            if (defaultValues.repeat) {
                document.getElementById('taskRepeat').value = defaultValues.repeat;
            }

            this.toggleDateFields();

            if (defaultValues.time) {
                document.getElementById('taskTime').value = defaultValues.time;
            }
            if (defaultValues.date) {
                document.getElementById('taskDate').value = defaultValues.date;
            }
            if (defaultValues.dayOfWeek !== undefined) {
                document.getElementById('taskDayOfWeek').value = defaultValues.dayOfWeek;
            }

            this.calculateRewards();
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
        const repeat = document.getElementById('taskRepeat').value;
        
        const taskData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            exp: rewards.exp,
            coins: rewards.coins,
            repeat: repeat,
            time: document.getElementById('taskTime').value,
            completed: false
        };
        
        // Agregar campos específicos según el tipo de repetición
        if (repeat === 'none' || repeat === 'monthly') {
            taskData.date = document.getElementById('taskDate').value;
        }
        
        if (repeat === 'weekly') {
            taskData.dayOfWeek = parseInt(document.getElementById('taskDayOfWeek').value);
        }
        
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
        this.renderSchedule(); // Agregar esta línea
        document.getElementById('taskModal').style.display = 'none';
    }
    
    canCompleteTask(task) {
        const now = new Date();
        const today = now.toDateString();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        if (task.completed) return false;
        
        switch(task.repeat) {
            case 'none':
                // Tarea única: debe ser el día correcto y después de la hora
                if (!task.date || !task.time) return false;
                const taskDate = this.parseDateInput(task.date)?.toDateString();
                const [hours, minutes] = task.time.split(':').map(Number);
                const taskTime = hours * 60 + minutes;
                return taskDate === today && currentTime >= taskTime;
                
            case 'daily':
                // Tarea diaria: debe ser después de la hora
                if (!task.time) return false;
                const [dailyHours, dailyMinutes] = task.time.split(':').map(Number);
                const dailyTaskTime = dailyHours * 60 + dailyMinutes;
                return currentTime >= dailyTaskTime;
                
            case 'weekly':
                // Tarea semanal: debe ser el día correcto y después de la hora
                if (task.dayOfWeek === undefined || !task.time) return false;
                const currentDayOfWeek = now.getDay();
                const [weeklyHours, weeklyMinutes] = task.time.split(':').map(Number);
                const weeklyTaskTime = weeklyHours * 60 + weeklyMinutes;
                return currentDayOfWeek === task.dayOfWeek && currentTime >= weeklyTaskTime;
                
            case 'monthly':
                // Tarea mensual: debe ser el día correcto y después de la hora
                if (!task.date || !task.time) return false;
                const monthlyTaskDate = this.parseDateInput(task.date);
                if (!monthlyTaskDate) return false;
                const [monthlyHours, monthlyMinutes] = task.time.split(':').map(Number);
                const monthlyTaskTime = monthlyHours * 60 + monthlyMinutes;
                return monthlyTaskDate.getDate() === now.getDate() && 
                       monthlyTaskDate.getMonth() === now.getMonth() &&
                       currentTime >= monthlyTaskTime;
                
            default:
                return false;
        }
    }
    
    completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || !this.canCompleteTask(task)) {
            if (!this.canCompleteTask(task)) {
                alert('Aún no puedes completar esta misión. Debe esperar la fecha y hora establecidas.');
            }
            return;
        }
        
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
        let newDate = new Date();
        
        switch (originalTask.repeat) {
            case 'daily':
                // Mañana
                newDate.setDate(newDate.getDate() + 1);
                break;
            case 'weekly':
                // Próximo día de la semana
                const currentDay = newDate.getDay();
                const targetDay = originalTask.dayOfWeek;
                let daysUntilTarget = (targetDay - currentDay + 7) % 7;
                if (daysUntilTarget === 0) daysUntilTarget = 7; // Si es hoy, programar para la próxima semana
                newDate.setDate(newDate.getDate() + daysUntilTarget);
                break;
            case 'monthly':
                // Próximo mes, mismo día
                newDate.setMonth(newDate.getMonth() + 1);
                const originalDate = this.parseDateInput(originalTask.date);
                if (originalDate) {
                    newDate.setDate(originalDate.getDate());
                }
                break;
        }
        
        const newTask = {
            ...originalTask,
            id: Date.now(),
            date: this.formatDateInput(newDate),
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

        this.renderDashboardSummary();
    }
    
    createTaskElement(task) {
        const taskEl = document.createElement('div');
        const canComplete = this.canCompleteTask(task);
        taskEl.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''} ${!canComplete && !task.completed ? 'disabled' : ''}`;
        
        // Calcular bonificación de racha
        const taskKey = `${task.title}_${task.repeat}`;
        const streak = this.taskStreaks[taskKey] || 0;
        const streakBonus = streak > 0 ? this.calculateStreakBonus(task) : null;
        
        // Formatear información de fecha/hora según el tipo
        let timeInfo = '';
        switch(task.repeat) {
            case 'none':
                timeInfo = task.date ? `<span>📅 ${task.date}</span>` : '';
                break;
            case 'daily':
                timeInfo = task.time ? `<span>🕐 Todos los días a las ${task.time}</span>` : '';
                break;
            case 'weekly':
                const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                timeInfo = task.dayOfWeek !== undefined ? `<span>📅 ${dayNames[task.dayOfWeek]} a las ${task.time || '00:00'}</span>` : '';
                break;
            case 'monthly':
                if (task.date) {
                    const date = this.parseDateInput(task.date);
                    if (date) {
                        timeInfo = `<span>📅 Día ${date.getDate()} de cada mes a las ${task.time || '00:00'}</span>`;
                    }
                }
                break;
        }
        
        taskEl.innerHTML = `
            <h4>${task.title}</h4>
            <p>${task.description || 'Sin descripción'}</p>
            <div class="task-meta">
                <span>⭐ ${task.exp} EXP</span>
                <span>� ${task.coins} monedas</span>
                ${timeInfo}
                ${streak > 0 ? `<span class="streak-indicator">🔥 ${streak} días</span>` : ''}
            </div>
            ${streakBonus ? `<div class="bonus-info">+${streakBonus.exp} EXP, +${streakBonus.coins} 💰 por racha</div>` : ''}
            ${!canComplete && !task.completed ? '<div class="time-warning">⏰ Aún no es tiempo de completar esta misión</div>' : ''}
            <div class="task-actions">
                ${!task.completed ? `<button class="btn-complete" onclick="game.completeTask(${task.id})" ${!canComplete ? 'disabled' : ''}>Completar</button>` : ''}
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
        
        // Horas y celdas con tareas
        hours.forEach((hour, hourIndex) => {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = hour;
            scheduleGrid.appendChild(timeSlot);
            
            days.forEach((day, dayIndex) => {
                const timeCell = document.createElement('div');
                timeCell.className = 'time-cell';
                timeCell.dataset.hour = hourIndex;
                timeCell.dataset.day = dayIndex;
                
                // Buscar tareas para esta hora y día
                const tasksInSlot = this.getTasksForTimeSlot(hourIndex, dayIndex);
                
                if (tasksInSlot.length > 0) {
                    timeCell.classList.add('has-tasks');
                    tasksInSlot.forEach(task => {
                        const taskIndicator = document.createElement('div');
                        taskIndicator.className = `task-indicator priority-${task.priority}`;
                        taskIndicator.textContent = task.title.substring(0, 10) + (task.title.length > 10 ? '...' : '');
                        taskIndicator.title = `${task.title}\n${task.description || ''}\nTipo: ${task.repeat}`;
                        taskIndicator.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.openTaskModal(task.id);
                        });
                        timeCell.appendChild(taskIndicator);
                    });
                }
                
                timeCell.addEventListener('click', () => {
                    // Calcular la fecha para este día de la semana
                    const now = new Date();
                    const today = now.getDay(); // 0 = Domingo, 1 = Lunes, etc.
                    const currentDayIndex = today === 0 ? 6 : today - 1; // Convertir a nuestro formato (0=Lunes)
                    
                    // Calcular la diferencia de días
                    let daysDiff = dayIndex - currentDayIndex;
                    if (daysDiff < 0) {
                        daysDiff += 7; // Si es un día anterior, usar la próxima semana
                    }
                    
                    const targetDate = new Date(now);
                    targetDate.setDate(now.getDate() + daysDiff);

                    this.openTaskModal(null, {
                        repeat: 'none',
                        time: `${hourIndex.toString().padStart(2, '0')}:00`,
                        date: this.formatDateInput(targetDate)
                    });
                });
                
                scheduleGrid.appendChild(timeCell);
            });
        });
        
        // Debug: mostrar información de tareas en consola
        console.log('Renderizando horario con', this.tasks.length, 'tareas');
        this.tasks.forEach(task => {
            console.log('Tarea:', task.title, 'Tipo:', task.repeat, 'Hora:', task.time, 'Fecha:', task.date, 'Día semana:', task.dayOfWeek);
        });
    }
    
    getTasksForTimeSlot(hour, dayOfWeek) {
        return this.tasks.filter(task => {
            if (task.completed) return false;
            
            const taskHour = parseInt(task.time?.split(':')[0] || -1);
            if (taskHour !== hour) return false; // Primero filtrar por hora
            
            switch(task.repeat) {
                case 'none':
                    // Tarea única: verificar si coincide con la fecha y hora
                    if (!task.date) return false;
                    const taskDate = this.parseDateInput(task.date);
                    const taskDayOfWeek = taskDate.getDay(); // 0 = Domingo, 1 = Lunes, etc.
                    // Convertir nuestro formato (0=Lunes) al formato JavaScript (0=Domingo)
                    const scheduleDayOfWeek = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
                    return taskDayOfWeek === scheduleDayOfWeek;
                    
                case 'daily':
                    // Tarea diaria: siempre mostrar si la hora coincide
                    return true;
                    
                case 'weekly':
                    // Tarea semanal: verificar día de la semana
                    // Convertir nuestro formato (0=Lunes) al formato JavaScript (0=Domingo)
                    const scheduleDayForWeekly = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
                    return task.dayOfWeek === scheduleDayForWeekly;
                    
                case 'monthly':
                    // Tarea mensual: verificar día del mes
                    if (!task.date) return false;
                    const monthlyDate = this.parseDateInput(task.date);
                    const monthlyDay = monthlyDate.getDate();
                    const now = new Date();
                    const currentMonth = now.getMonth();
                    const currentYear = now.getFullYear();
                    
                    // Crear fecha para el día del mes actual en el día de la semana correspondiente
                    const testDate = new Date(currentYear, currentMonth, monthlyDay);
                    const testDayOfWeek = testDate.getDay();
                    const scheduleDayForMonthly = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
                    
                    return testDayOfWeek === scheduleDayForMonthly;
                    
                default:
                    return false;
            }
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
                this.openTaskModal(null, {
                    repeat: 'none',
                    date: dateStr
                });
            });
            
            calendarGrid.appendChild(dayEl);
        }
    }
    
    getMonthName(month) {
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return months[month];
    }
    
    isTaskForToday(task) {
        const now = new Date();
        const todayDate = this.formatDateInput(now);
        const todayDayOfWeek = now.getDay();

        switch (task.repeat) {
            case 'none':
                return task.date === todayDate;
            case 'daily':
                return true;
            case 'weekly':
                return task.dayOfWeek === todayDayOfWeek;
            case 'monthly': {
                if (!task.date) return false;
                const monthlyDate = this.parseDateInput(task.date);
                return monthlyDate ? monthlyDate.getDate() === now.getDate() : false;
            }
            default:
                return false;
        }
    }

    renderDashboardSummary() {
        const todayTasks = this.tasks.filter(task => !task.completed && this.isTaskForToday(task));
        const availableNow = todayTasks.filter(task => this.canCompleteTask(task));
        const pendingCount = this.tasks.filter(task => !task.completed).length;
        const completedCount = this.tasks.filter(task => task.completed).length;
        const expPercent = Math.round((this.player.currentExp / this.player.maxExp) * 100);

        document.getElementById('summaryTodayCount').textContent = todayTasks.length;
        document.getElementById('summaryReadyCount').textContent = `${availableNow.length} disponibles ahora`;
        document.getElementById('summaryPendingCount').textContent = pendingCount;
        document.getElementById('summaryCompletedCount').textContent = `${completedCount} completadas`;
        document.getElementById('summaryCoinsCount').textContent = `${this.player.coins} monedas`;
        document.getElementById('summaryInventoryCount').textContent = `${this.player.inventory.length} objetos en inventario`;
        document.getElementById('summaryLevel').textContent = this.player.level;
        document.getElementById('summaryExpPercent').textContent = `${expPercent}% hacia el siguiente nivel`;

        const dateLabel = new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });

        document.getElementById('dashboardDateLabel').textContent = `Hoy es ${dateLabel}. Enfoque total.`;
    }

    updatePlayerStats() {
        document.getElementById('playerName').textContent = this.player.name;
        document.getElementById('playerLevel').textContent = this.player.level;
        document.getElementById('currentExp').textContent = this.player.currentExp;
        document.getElementById('maxExp').textContent = this.player.maxExp;
        document.getElementById('playerCoins').textContent = this.player.coins;
        document.getElementById('expFill').style.width = `${(this.player.currentExp / this.player.maxExp) * 100}%`;
        this.renderDashboardSummary();
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
        
        // Renderizar horario después de cargar los datos
        setTimeout(() => {
            this.renderSchedule();
        }, 100);
    }
}

// Inicializar el juego
const game = new TareasRPG();
