let tasks = [];

// 页面加载时载入任务列表
document.addEventListener("DOMContentLoaded", () => {
    chrome.runtime.sendMessage({ action: "getTasks" }, (response) => {
        tasks = response.tasks || [];
        renderTasks(tasks);
    });

    // 绑定新增任务按钮事件
    const addTaskButton = document.getElementById("addTaskButton");
    addTaskButton.addEventListener("click", () => {
        const taskNameInput = document.getElementById("newTaskName");
        const taskName = taskNameInput.value.trim() || `任務 ${tasks.length + 1}`;
        taskNameInput.value = '';
        chrome.runtime.sendMessage({ action: "addTask", taskName }, (response) => {
            tasks = response.tasks || [];
            renderTasks(tasks);
        });
    });
});

// 每秒更新任务时间显示
setInterval(() => {
    chrome.runtime.sendMessage({ action: "getTasks" }, (response) => {
        tasks = response.tasks || [];
        updateTaskTimes(tasks);
    });
}, 1000);

// 渲染任务列表
function renderTasks(tasks) {
    const container = document.getElementById("tasks");
    container.innerHTML = '';
    tasks.forEach((task, index) => {
        const taskDiv = document.createElement("div");
        taskDiv.className = "task";

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.value = task.name;

        // 更新任务名称的函数
        const getUpdatedTaskName = () => nameInput.value.trim();

        const timeSpan = document.createElement("span");
        timeSpan.textContent = `累積時間: ${formatTime(task.time)}`;

        const startButton = createButton("開始", "start", () => {
            const updatedName = getUpdatedTaskName(); // 获取最新任务名称
            chrome.runtime.sendMessage(
                { action: "startTask", index, taskName: updatedName },
                (response) => {
                    tasks = response.tasks || [];
                    renderTasks(tasks);
                }
            );
        });

        const stopButton = createButton("停止", "stop", () => {
            chrome.runtime.sendMessage({ action: "stopTask", index }, (response) => {
                tasks = response.tasks || [];
                renderTasks(tasks);
            });
        });

        const deleteButton = createButton("刪除", "delete", () => {
            chrome.runtime.sendMessage({ action: "deleteTask", index }, (response) => {
                tasks = response.tasks || [];
                renderTasks(tasks);
            });
        });

        taskDiv.appendChild(nameInput);
        taskDiv.appendChild(timeSpan);
        taskDiv.appendChild(startButton);
        taskDiv.appendChild(stopButton);
        taskDiv.appendChild(deleteButton);

        container.appendChild(taskDiv);
    });
}

// 更新任务时间显示（避免重新渲染）
function updateTaskTimes(tasks) {
    const taskElements = document.querySelectorAll(".task");
    tasks.forEach((task, index) => {
        const timeSpan = taskElements[index]?.querySelector("span");
        if (timeSpan) {
            timeSpan.textContent = `累積時間: ${formatTime(task.time)}`;
        }
    });
}

// 创建按钮
function createButton(label, className, onClick) {
    const button = document.createElement("button");
    button.textContent = label;
    button.className = className;
    button.addEventListener("click", onClick);
    return button;
}

// 将秒数格式化为 hh:mm:ss
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
}

// 确保时间格式为两位数
function padZero(number) {
    return number < 10 ? `0${number}` : number;
}
