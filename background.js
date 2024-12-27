let tasks = [];
let taskTimers = {};

// 初始化時從 storage 加載數據
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(["tasks"], (result) => {
        tasks = result.tasks || [];
    });
});

// 開始計時任務，同時支持更新任務名稱
function startTask(index, taskName = null) {
    stopAllTasks(); // 確保只有一個任務在計時

    if (taskName !== null && taskName.trim() !== "") {
        // 更新任务名称
        tasks[index].name = taskName.trim();
    }

    tasks[index].running = true;

    // 使用 setInterval 增加計時
    taskTimers[index] = setInterval(() => {
        tasks[index].time++;
        saveTasks();
    }, 1000);

    saveTasks();
}

// 停止任務
function stopTask(index) {
    if (taskTimers[index]) {
        clearInterval(taskTimers[index]);
        delete taskTimers[index];
    }
    tasks[index].running = false;
    saveTasks();
}

// 停止所有任務
function stopAllTasks() {
    tasks.forEach((_, index) => stopTask(index));
}

// 添加新任務
function addTask(taskName) {
    tasks.push({ name: taskName, time: 0, running: false });
    saveTasks();
}

// 刪除任務
function deleteTask(index) {
    stopTask(index);
    tasks.splice(index, 1);
    saveTasks();
}

// 保存數據到 storage
function saveTasks() {
    chrome.storage.local.set({ tasks });
}

// 處理來自 popup 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { action, index, taskName } = message;

    switch (action) {
        case "addTask":
            addTask(taskName);
            break;
        case "startTask":
            startTask(index, taskName); // 確保開始任務時更新名稱
            break;
        case "stopTask":
            stopTask(index);
            break;
        case "deleteTask":
            deleteTask(index);
            break;
        case "stopAllTasks":
            stopAllTasks();
            break;
        case "getTasks":
            sendResponse({ tasks });
            return;
    }

    sendResponse({ tasks });
});
