let tasks = [];

// 定期從背景腳本獲取最新數據
setInterval(() => {
    chrome.runtime.sendMessage({ action: "getTasks" }, (response) => {
        tasks = response.tasks || [];
        renderTasks(tasks);
    });
}, 1000);

// 綁定新增按鈕事件
document.getElementById("addTaskButton").addEventListener("click", () => {
    const taskNameInput = document.getElementById("newTaskName");
    const taskName = taskNameInput.value.trim() || `任務 ${tasks.length + 1}`;
    taskNameInput.value = '';
    chrome.runtime.sendMessage({ action: "addTask", taskName }, (response) => {
        renderTasks(response.tasks);
    });
});

function renderTasks(tasks) {
    const container = document.getElementById("tasks");
    container.innerHTML = '';
    tasks.forEach((task, index) => {
        const taskDiv = document.createElement("div");
        taskDiv.className = "task";

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.value = task.name;
        nameInput.addEventListener("change", (event) => {
            task.name = event.target.value;
            chrome.storage.local.set({ tasks });
        });

        const timeSpan = document.createElement("span");
        timeSpan.textContent = `累積時間: ${formatTime(task.time)}`;

        const startButton = createButton("開始", "start", () => {
            chrome.runtime.sendMessage({ action: "startTask", index }, (response) => {
                renderTasks(response.tasks);
            });
        });

        const stopButton = createButton("停止", "stop", () => {
            chrome.runtime.sendMessage({ action: "stopTask", index }, (response) => {
                renderTasks(response.tasks);
            });
        });

        const deleteButton = createButton("刪除", "delete", () => {
            chrome.runtime.sendMessage({ action: "deleteTask", index }, (response) => {
                renderTasks(response.tasks);
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

function createButton(label, className, onClick) {
    const button = document.createElement("button");
    button.textContent = label;
    button.className = className;
    button.addEventListener("click", onClick);
    return button;
}

// 將秒數格式化為 hh:mm:ss
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
}

// 確保時間格式為兩位數
function padZero(number) {
    return number < 10 ? `0${number}` : number;
}
