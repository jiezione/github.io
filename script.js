// 应用数据存储
const appData = {
    theme: localStorage.getItem('theme') || 'light',
    bookmarks: {
        "常用网站": [
            { title: "GitHub", url: "https://github.com" },
            { title: "Google", url: "https://google.com" },
            { title: "YouTube", url: "https://youtube.com" }
        ],
        "开发资源": [
            { title: "MDN", url: "https://developer.mozilla.org" },
            { title: "StackOverflow", url: "https://stackoverflow.com" }
        ]
    },
    ads: {
        ad1: { image: "", url: "" },
        ad2: { image: "", url: "" },
        ad3: { image: "", url: "" }
    },
    cities: [
        { name: "北京", timezone: "Asia/Shanghai" },
        { name: "纽约", timezone: "America/New_York" },
        { name: "伦敦", timezone: "Europe/London" },
        { name: "东京", timezone: "Asia/Tokyo" }
    ],
    github: {
        username: "",
        repo: "",
        token: "",
        validated: false
    },
    deployInfo: {
        username: "",
        repo: "",
        deployTime: 0
    }
};

// 页面元素
let elements = {};

// 初始化定时器
let scrollTimer;
let healthReminderTimer;

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

async function init() {
    // 获取页面元素
    getElements();
    
    // 加载部署信息
    loadDeployInfo();
    
    // 加载本地存储数据
    loadLocalData();
    
    // 初始化主题
    initTheme();
    
    // 绑定事件处理程序
    bindEvents();
    
    // 加载GitHub数据
    await loadDataFromGitHub();
    
    // 渲染页面内容
    renderBookmarks();
    renderEditableBookmarks();
    renderCities();
    updateWorldClocks();
    updateOnlineDuration();
    updateTotalBookmarks();
    renderAds();
    
    // 启动定时任务
    startTimers();
}

// 获取页面元素
function getElements() {
    // 主题和导航元素
    elements.themeToggle = document.getElementById('theme-toggle');
    elements.topNav = document.getElementById('top-nav');
    elements.settingsBtn = document.getElementById('settings-btn');
    
    // 设置对话框元素
    elements.settingsDialog = document.getElementById('settings-dialog');
    elements.closeSettings = document.getElementById('close-settings');
    elements.dialogOverlay = document.getElementById('dialog-overlay');
    elements.githubUsername = document.getElementById('github-username');
    elements.githubRepo = document.getElementById('github-repo');
    elements.githubToken = document.getElementById('github-token');
    elements.validateToken = document.getElementById('validate-token');
    elements.tokenValidationResult = document.getElementById('token-validation-result');
    elements.enterEditCenter = document.getElementById('enter-edit-center');
    
    // 主页和编辑中心元素
    elements.homePage = document.getElementById('home-page');
    elements.editCenter = document.getElementById('edit-center');
    elements.backToHome = document.getElementById('back-to-home');
    elements.validationStatus = document.getElementById('validation-status');
    
    // 书签元素
    elements.bookmarksContainer = document.getElementById('bookmarks-container');
    elements.editableBookmarks = document.getElementById('editable-bookmarks');
    elements.bookmarkFolder = document.getElementById('bookmark-folder');
    elements.bookmarkTitle = document.getElementById('bookmark-title');
    elements.bookmarkUrl = document.getElementById('bookmark-url');
    elements.addBookmark = document.getElementById('add-bookmark');
    elements.importBookmarks = document.getElementById('import-bookmarks');
    elements.exportBookmarks = document.getElementById('export-bookmarks');
    
    // 广告元素
    elements.ad1 = document.getElementById('ad-1');
    elements.ad2 = document.getElementById('ad-2');
    elements.ad3 = document.getElementById('ad-3');
    elements.ad1Image = document.getElementById('ad1-image');
    elements.ad1Url = document.getElementById('ad1-url');
    elements.saveAd1 = document.getElementById('save-ad1');
    elements.deleteAd1 = document.getElementById('delete-ad1');
    elements.ad2Image = document.getElementById('ad2-image');
    elements.ad2Url = document.getElementById('ad2-url');
    elements.saveAd2 = document.getElementById('save-ad2');
    elements.deleteAd2 = document.getElementById('delete-ad2');
    elements.ad3Image = document.getElementById('ad3-image');
    elements.ad3Url = document.getElementById('ad3-url');
    elements.saveAd3 = document.getElementById('save-ad3');
    elements.deleteAd3 = document.getElementById('delete-ad3');
    
    // 城市时钟元素
    elements.worldClocks = document.getElementById('world-clocks');
    elements.cityName = document.getElementById('city-name');
    elements.cityTimezone = document.getElementById('city-timezone');
    elements.addCity = document.getElementById('add-city');
    elements.citiesList = document.getElementById('cities-list');
    
    // 其他元素
    elements.saveChanges = document.getElementById('save-changes');
    elements.saveLoading = document.getElementById('save-loading');
    elements.onlineDuration = document.getElementById('online-duration');
    elements.healthReminder = document.getElementById('health-reminder');
    elements.healthPopup = document.getElementById('health-popup');
    elements.closeHealthPopup = document.getElementById('close-health-popup');
    elements.notification = document.getElementById('notification');
    elements.totalBookmarks = document.getElementById('total-bookmarks');
    elements.copyrightInfo = document.getElementById('copyright-info');
}

// 加载部署信息
function loadDeployInfo() {
    const deployInfo = document.getElementById('deploy-info');
    appData.deployInfo.username = deployInfo.dataset.username || '';
    appData.deployInfo.repo = deployInfo.dataset.repo || '';
    appData.deployInfo.deployTime = parseInt(deployInfo.dataset.deployTime) || Date.now();
    
    // 填充到设置表单
    elements.githubUsername.value = appData.deployInfo.username;
    elements.githubRepo.value = appData.deployInfo.repo;
    
    // 更新版权信息
    elements.copyrightInfo.textContent = `Copyright © 2018-${new Date().getFullYear()} ${appData.deployInfo.repo || '星际导航'}, All Rights Reserved`;
}

// 加载本地存储数据
function loadLocalData() {
    // 加载GitHub设置
    const savedGithub = localStorage.getItem('githubSettings');
    if (savedGithub) {
        try {
            const githubData = JSON.parse(savedGithub);
            appData.github = { ...appData.github, ...githubData };
            elements.githubUsername.value = appData.github.username;
            elements.githubRepo.value = appData.github.repo;
            elements.githubToken.value = appData.github.token;
        } catch (e) {
            console.error('Failed to load GitHub settings:', e);
        }
    }
    
    // 加载广告数据
    const savedAds = localStorage.getItem('spaceNavAds');
    if (savedAds) {
        try {
            appData.ads = JSON.parse(savedAds);
        } catch (e) {
            console.error('Failed to load ads:', e);
        }
    }
    
    // 加载城市数据
    const savedCities = localStorage.getItem('spaceNavCities');
    if (savedCities) {
        try {
            appData.cities = JSON.parse(savedCities);
        } catch (e) {
            console.error('Failed to load cities:', e);
        }
    }
}

// 初始化主题
function initTheme() {
    if (appData.theme === 'dark') {
        document.documentElement.classList.add('dark');
        elements.themeToggle.innerHTML = '<i class="fa fa-moon-o text-xl"></i>';
    } else {
        document.documentElement.classList.remove('dark');
        elements.themeToggle.innerHTML = '<i class="fa fa-sun-o text-xl"></i>';
    }
}

// 绑定事件处理程序
function bindEvents() {
    // 主题切换
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // 设置按钮
    elements.settingsBtn.addEventListener('click', showSettingsDialog);
    elements.closeSettings.addEventListener('click', hideSettingsDialog);
    elements.dialogOverlay.addEventListener('click', hideSettingsDialog);
    
    // GitHub验证
    elements.validateToken.addEventListener('click', validateGitHubToken);
    
    // 编辑中心切换
    elements.enterEditCenter.addEventListener('click', enterEditCenter);
    elements.backToHome.addEventListener('click', backToHome);
    
    // 书签操作
    elements.addBookmark.addEventListener('click', addNewBookmark);
    elements.importBookmarks.addEventListener('change', importBookmarks);
    elements.exportBookmarks.addEventListener('click', exportBookmarks);
    
    // 广告操作
    elements.saveAd1.addEventListener('click', () => saveAd(1));
    elements.deleteAd1.addEventListener('click', () => deleteAd(1));
    elements.saveAd2.addEventListener('click', () => saveAd(2));
    elements.deleteAd2.addEventListener('click', () => deleteAd(2));
    elements.saveAd3.addEventListener('click', () => saveAd(3));
    elements.deleteAd3.addEventListener('click', () => deleteAd(3));
    elements.ad1Image.addEventListener('change', (e) => handleAdImageUpload(e, 1));
    elements.ad2Image.addEventListener('change', (e) => handleAdImageUpload(e, 2));
    elements.ad3Image.addEventListener('change', (e) => handleAdImageUpload(e, 3));
    
    // 城市操作
    elements.addCity.addEventListener('click', addNewCity);
    
    // 保存更改
    elements.saveChanges.addEventListener('click', saveChangesToGitHub);
    
    // 健康提醒关闭
    elements.closeHealthPopup.addEventListener('click', () => {
        elements.healthPopup.style.transform = 'translateY(-100%)';
    });
    
    // 滚动事件 - 控制导航栏显示/隐藏
    window.addEventListener('scroll', handleScroll);
}

// 处理滚动事件
function handleScroll() {
    // 清除之前的定时器
    clearTimeout(scrollTimer);
    
    // 显示导航栏
    elements.topNav.classList.remove('hidden');
    
    // 设置新的定时器，3秒后隐藏导航栏
    scrollTimer = setTimeout(() => {
        // 只有在页面顶部才隐藏导航栏
        if (window.scrollY === 0) {
            elements.topNav.classList.add('hidden');
        }
    }, 3000);
}

// 切换主题
function toggleTheme() {
    if (appData.theme === 'light') {
        appData.theme = 'dark';
        document.documentElement.classList.add('dark');
        elements.themeToggle.innerHTML = '<i class="fa fa-moon-o text-xl"></i>';
    } else {
        appData.theme = 'light';
        document.documentElement.classList.remove('dark');
        elements.themeToggle.innerHTML = '<i class="fa fa-sun-o text-xl"></i>';
    }
    
    // 保存主题设置
    localStorage.setItem('theme', appData.theme);
}

// 显示设置对话框
function showSettingsDialog() {
    elements.settingsDialog.classList.add('active');
    document.body.style.overflow = 'hidden'; // 防止背景滚动
}

// 隐藏设置对话框
function hideSettingsDialog() {
    elements.settingsDialog.classList.remove('active');
    document.body.style.overflow = ''; // 恢复滚动
}

// 验证GitHub Token
async function validateGitHubToken() {
    const username = elements.githubUsername.value.trim();
    const repo = elements.githubRepo.value.trim();
    const token = elements.githubToken.value.trim();
    
    if (!username || !repo) {
        showValidationResult('请输入用户名和仓库名', 'error');
        return;
    }
    
    // 保存GitHub设置
    appData.github.username = username;
    appData.github.repo = repo;
    appData.github.token = token;
    localStorage.setItem('githubSettings', JSON.stringify({
        username,
        repo,
        token
    }));
    
    try {
        // 显示加载状态
        elements.validateToken.innerHTML = '<i class="fa fa-spinner fa-spin mr-2"></i>验证中...';
        elements.validateToken.disabled = true;
        
        // 调用GitHub API验证权限
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}`, {
            headers: {
                'Authorization': token ? `token ${token}` : '',
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            appData.github.validated = true;
            showValidationResult('验证成功！您可以进入编辑中心了', 'success');
            elements.enterEditCenter.disabled = false;
            updateEditControlsState(true);
        } else {
            appData.github.validated = false;
            const error = await response.json();
            showValidationResult(`验证失败: ${error.message || '无法访问该仓库'}`, 'error');
            elements.enterEditCenter.disabled = true;
            updateEditControlsState(false);
        }
    } catch (error) {
        appData.github.validated = false;
        showValidationResult(`验证失败: ${error.message}`, 'error');
        elements.enterEditCenter.disabled = true;
        updateEditControlsState(false);
    } finally {
        // 恢复按钮状态
        elements.validateToken.innerHTML = '<i class="fa fa-check mr-2"></i>验证Token';
        elements.validateToken.disabled = false;
    }
}

// 显示验证结果
function showValidationResult(message, type) {
    elements.tokenValidationResult.textContent = message;
    elements.tokenValidationResult.className = '';
    
    if (type === 'success') {
        elements.tokenValidationResult.classList.add('text-green-400', 'flex', 'items-center');
        elements.tokenValidationResult.innerHTML = `<i class="fa fa-check-circle mr-2"></i>${message}`;
    } else if (type === 'error') {
        elements.tokenValidationResult.classList.add('text-red-400', 'flex', 'items-center');
        elements.tokenValidationResult.innerHTML = `<i class="fa fa-exclamation-circle mr-2"></i>${message}`;
    } else {
        elements.tokenValidationResult.classList.add('text-blue-400', 'flex', 'items-center');
        elements.tokenValidationResult.innerHTML = `<i class="fa fa-info-circle mr-2"></i>${message}`;
    }
    
    elements.tokenValidationResult.classList.remove('hidden');
    
    // 5秒后自动隐藏
    setTimeout(() => {
        elements.tokenValidationResult.classList.add('hidden');
    }, 5000);
}

// 进入编辑中心
function enterEditCenter() {
    elements.homePage.classList.add('hidden');
    elements.editCenter.classList.remove('hidden');
    hideSettingsDialog();
    
    // 根据验证状态更新编辑控件
    updateEditControlsState(appData.github.validated);
}

// 返回主页
function backToHome() {
    elements.editCenter.classList.add('hidden');
    elements.homePage.classList.remove('hidden');
}

// 更新编辑控件状态
function updateEditControlsState(enabled) {
    // 书签编辑控件
    elements.bookmarkFolder.disabled = !enabled;
    elements.bookmarkTitle.disabled = !enabled;
    elements.bookmarkUrl.disabled = !enabled;
    elements.addBookmark.disabled = !enabled;
    elements.importBookmarks.disabled = !enabled;
    elements.exportBookmarks.disabled = !enabled;
    
    // 广告编辑控件
    elements.ad1Image.disabled = !enabled;
    elements.ad1Url.disabled = !enabled;
    elements.saveAd1.disabled = !enabled;
    elements.deleteAd1.disabled = !enabled;
    elements.ad2Image.disabled = !enabled;
    elements.ad2Url.disabled = !enabled;
    elements.saveAd2.disabled = !enabled;
    elements.deleteAd2.disabled = !enabled;
    elements.ad3Image.disabled = !enabled;
    elements.ad3Url.disabled = !enabled;
    elements.saveAd3.disabled = !enabled;
    elements.deleteAd3.disabled = !enabled;
    
    // 城市编辑控件
    elements.cityName.disabled = !enabled;
    elements.cityTimezone.disabled = !enabled;
    elements.addCity.disabled = !enabled;
    
    // 保存按钮
    elements.saveChanges.disabled = !enabled;
    
    // 验证状态提示
    elements.validationStatus.classList.toggle('hidden', enabled);
}

// 从GitHub加载数据
async function loadDataFromGitHub() {
    const { username, repo, token } = appData.github;
    
    // 如果没有配置GitHub信息，使用默认数据
    if (!username || !repo) {
        showNotification('使用本地默认数据', 'info');
        return;
    }
    
    try {
        let url, options = {};
        
        if (token) {
            // 有Token，使用API端点
            url = `https://api.github.com/repos/${username}/${repo}/contents/bookmarks.json`;
            options.headers = {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            };
        } else {
            // 无Token，使用raw.githubusercontent.com
            url = `https://raw.githubusercontent.com/${username}/${repo}/main/bookmarks.json`;
        }
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let data;
        if (token) {
            // 有Token的情况，需要解码base64
            const apiData = await response.json();
            const decodedContent = atob(apiData.content);
            data = JSON.parse(decodedContent);
        } else {
            // 无Token的情况，直接解析JSON
            data = await response.json();
        }
        
        // 更新应用数据
        if (data.bookmarks) appData.bookmarks = data.bookmarks;
        if (data.ads) appData.ads = data.ads;
        if (data.cities) appData.cities = data.cities;
        
        // 保存到本地存储
        localStorage.setItem('spaceNavAds', JSON.stringify(appData.ads));
        localStorage.setItem('spaceNavCities', JSON.stringify(appData.cities));
        
        showNotification('成功从GitHub加载数据', 'success');
    } catch (error) {
        console.error('Failed to load data from GitHub:', error);
        showNotification('无法从GitHub加载数据，使用本地数据', 'error');
    }
}

// 保存数据到GitHub
async function saveChangesToGitHub() {
    const { username, repo, token } = appData.github;
    
    if (!username || !repo || !token) {
        showNotification('请先完成GitHub验证', 'error');
        return;
    }
    
    try {
        // 显示加载状态
        elements.saveChanges.disabled = true;
        elements.saveLoading.classList.remove('hidden');
        
        // 准备要保存的数据
        const dataToSave = {
            bookmarks: appData.bookmarks,
            ads: appData.ads,
            cities: appData.cities,
            updatedAt: new Date().toISOString()
        };
        
        // 处理非Latin1字符的编码问题
        const jsonStr = JSON.stringify(dataToSave, null, 2);
        const utf8Bytes = new TextEncoder().encode(jsonStr);
        const base64Str = btoa(String.fromCharCode(...utf8Bytes));
        
        // 先获取文件的SHA（用于更新）
        const shaResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/bookmarks.json`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        let sha = '';
        if (shaResponse.ok) {
            const shaData = await shaResponse.json();
            sha = shaData.sha;
        }
        
        // 保存数据
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/bookmarks.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: `Update bookmarks - ${new Date().toISOString()}`,
                content: base64Str,
                sha: sha // 仅在文件已存在时需要
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '保存失败');
        }
        
        // 保存到本地存储
        localStorage.setItem('spaceNavAds', JSON.stringify(appData.ads));
        localStorage.setItem('spaceNavCities', JSON.stringify(appData.cities));
        
        showNotification('成功保存到GitHub', 'success');
        
        // 更新页面内容
        renderBookmarks();
        renderEditableBookmarks();
        renderCities();
        updateWorldClocks();
        updateTotalBookmarks();
        renderAds();
        
    } catch (error) {
        console.error('Failed to save data to GitHub:', error);
        showNotification(`保存失败: ${error.message}`, 'error');
    } finally {
        // 恢复状态
        elements.saveLoading.classList.add('hidden');
        elements.saveChanges.disabled = false;
    }
}

// 渲染书签
function renderBookmarks() {
    elements.bookmarksContainer.innerHTML = '';
    
    // 遍历所有文件夹
    Object.keys(appData.bookmarks).forEach(folderName => {
        const bookmarks = appData.bookmarks[folderName];
        
        // 创建文件夹容器
        const folderDiv = document.createElement('div');
        folderDiv.className = 'bookmark-folder';
        
        // 文件夹标题和切换按钮
        const folderHeader = document.createElement('div');
        folderHeader.className = 'folder-header';
        folderHeader.innerHTML = `
            <div class="folder-title">
                <i class="fa fa-folder"></i>
                <span>${folderName}</span>
            </div>
            <div class="folder-toggle">
                <i class="fa fa-chevron-down"></i>
            </div>
        `;
        
        // 绑定文件夹展开/折叠事件
        folderHeader.addEventListener('click', () => {
            const grid = folderDiv.querySelector('.bookmarks-grid');
            const icon = folderDiv.querySelector('.folder-toggle i');
            
            grid.classList.toggle('expanded');
            if (grid.classList.contains('expanded')) {
                icon.className = 'fa fa-chevron-up';
            } else {
                icon.className = 'fa fa-chevron-down';
            }
        });
        
        // 创建书签网格
        const bookmarksGrid = document.createElement('div');
        bookmarksGrid.className = 'bookmarks-grid';
        
        // 添加书签
        bookmarks.forEach(bookmark => {
            const bookmarkItem = document.createElement('a');
            bookmarkItem.className = 'bookmark-item';
            bookmarkItem.href = bookmark.url;
            bookmarkItem.target = '_blank';
            
            // 获取域名用于favicon
            let domain = '';
            try {
                const url = new URL(bookmark.url);
                domain = url.hostname;
            } catch (e) {
                console.error('Invalid URL:', bookmark.url);
            }
            
            // 处理标题（最多8个字）
            const shortTitle = bookmark.title.length > 8 
                ? bookmark.title.substring(0, 8) + '...' 
                : bookmark.title;
            
            // 标题首字符（用于无法获取favicon的情况）
            const firstChar = bookmark.title.charAt(0).toUpperCase();
            
            bookmarkItem.innerHTML = `
                <div class="bookmark-icon">
                    <img src="https://www.google.com/s2/favicons?domain=${domain}" 
                         alt="${bookmark.title}的图标"
                         onerror="this.parentElement.innerHTML='${firstChar}'">
                </div>
                <div class="bookmark-title">${shortTitle}</div>
            `;
            
            bookmarksGrid.appendChild(bookmarkItem);
        });
        
        // 组装文件夹
        folderDiv.appendChild(folderHeader);
        folderDiv.appendChild(bookmarksGrid);
        
        // 添加到容器
        elements.bookmarksContainer.appendChild(folderDiv);
    });
}

// 渲染可编辑的书签
function renderEditableBookmarks() {
    elements.editableBookmarks.innerHTML = '';
    
    // 遍历所有文件夹
    Object.keys(appData.bookmarks).forEach(folderName => {
        const bookmarks = appData.bookmarks[folderName];
        
        // 创建文件夹标题
        const folderTitle = document.createElement('h4');
        folderTitle.className = 'text-white/80 font-medium mb-2';
        folderTitle.textContent = folderName;
        elements.editableBookmarks.appendChild(folderTitle);
        
        // 添加书签
        bookmarks.forEach((bookmark, index) => {
            const editableBookmark = document.createElement('div');
            editableBookmark.className = 'editable-bookmark';
            
            editableBookmark.innerHTML = `
                <div class="bookmark-info">
                    <div class="bookmark-icon mr-3">
                        <img src="https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}" 
                             alt="${bookmark.title}的图标">
                    </div>
                    <div>
                        <div class="font-medium">${bookmark.title}</div>
                        <div class="text-sm text-white/60">${bookmark.url}</div>
                        <div class="text-xs text-white/40 mt-1">${folderName}</div>
                    </div>
                </div>
                <div class="bookmark-actions">
                    <button class="edit-btn" data-folder="${folderName}" data-index="${index}">
                        <i class="fa fa-pencil"></i>
                    </button>
                    <button class="delete-btn" data-folder="${folderName}" data-index="${index}">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            `;
            
            elements.editableBookmarks.appendChild(editableBookmark);
        });
    });
    
    // 绑定编辑和删除事件
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEditBookmark);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteBookmark);
    });
}

// 添加新书签
function addNewBookmark() {
    const folderName = elements.bookmarkFolder.value.trim();
    const title = elements.bookmarkTitle.value.trim();
    const url = elements.bookmarkUrl.value.trim();
    
    if (!folderName || !title || !url) {
        showNotification('请填写所有字段', 'error');
        return;
    }
    
    // 验证URL格式
    try {
        new URL(url);
    } catch (e) {
        showNotification('请输入有效的URL', 'error');
        return;
    }
    
    // 检查重复
    if (!appData.bookmarks[folderName]) {
        appData.bookmarks[folderName] = [];
    } else {
        const isDuplicate = appData.bookmarks[folderName].some(b => b.url === url);
        if (isDuplicate) {
            showNotification('该URL已存在于当前文件夹', 'error');
            return;
        }
    }
    
    // 添加新书签
    appData.bookmarks[folderName].push({ title, url });
    
    // 更新UI
    renderEditableBookmarks();
    
    // 清空表单
    elements.bookmarkTitle.value = '';
    elements.bookmarkUrl.value = '';
    
    showNotification('书签添加成功', 'success');
}

// 处理书签编辑
function handleEditBookmark(e) {
    const folderName = e.currentTarget.dataset.folder;
    const index = parseInt(e.currentTarget.dataset.index);
    const bookmark = appData.bookmarks[folderName][index];
    
    // 填充表单
    elements.bookmarkFolder.value = folderName;
    elements.bookmarkTitle.value = bookmark.title;
    elements.bookmarkUrl.value = bookmark.url;
    
    // 删除原书签
    appData.bookmarks[folderName].splice(index, 1);
    
    // 更新UI
    renderEditableBookmarks();
    
    showNotification('请修改书签信息并重新添加', 'info');
}

// 处理书签删除
function handleDeleteBookmark(e) {
    const folderName = e.currentTarget.dataset.folder;
    const index = parseInt(e.currentTarget.dataset.index);
    const bookmark = appData.bookmarks[folderName][index];
    
    if (confirm(`确定删除【${bookmark.title}】书签？`)) {
        // 删除书签
        appData.bookmarks[folderName].splice(index, 1);
        
        // 如果文件夹为空，删除文件夹
        if (appData.bookmarks[folderName].length === 0) {
            delete appData.bookmarks[folderName];
        }
        
        // 更新UI
        renderEditableBookmarks();
        
        showNotification('书签已删除', 'success');
    }
}

// 导入书签
function importBookmarks(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // 只接受HTML文件
    if (!file.name.endsWith('.html')) {
        showNotification('请选择HTML格式的书签文件', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(event.target.result, 'text/html');
            const bookmarkElements = htmlDoc.querySelectorAll('a');
            
            let importedCount = 0;
            let duplicateCount = 0;
            
            bookmarkElements.forEach(elem => {
                const url = elem.href;
                const title = elem.textContent.trim() || url;
                
                // 跳过无效URL
                if (!url || url === 'about:blank') return;
                
                // 默认文件夹
                let folderName = '导入的书签';
                
                // 尝试从父节点获取文件夹信息
                let parent = elem.closest('dl');
                if (parent && parent.previousElementSibling && parent.previousElementSibling.tagName === 'H3') {
                    folderName = parent.previousElementSibling.textContent.trim();
                }
                
                // 确保文件夹存在
                if (!appData.bookmarks[folderName]) {
                    appData.bookmarks[folderName] = [];
                }
                
                // 检查重复
                const isDuplicate = appData.bookmarks[folderName].some(b => b.url === url);
                if (isDuplicate) {
                    duplicateCount++;
                    return;
                }
                
                // 添加书签
                appData.bookmarks[folderName].push({ title, url });
                importedCount++;
            });
            
            // 更新UI
            renderEditableBookmarks();
            
            showNotification(`成功导入${importedCount}个，过滤重复${duplicateCount}个`, 'success');
        } catch (error) {
            console.error('Failed to import bookmarks:', error);
            showNotification('书签导入失败', 'error');
        }
    };
    
    reader.readAsText(file);
    
    // 重置文件输入，允许重复选择同一个文件
    elements.importBookmarks.value = '';
}

// 导出书签
function exportBookmarks() {
function exportBookmarks() {
    // 创建HTML格式的书签
    let htmlContent = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>书签导出</TITLE>
<H1>书签导出</H1>
<DL><p>`;
    
    // 遍历所有文件夹和书签
    Object.keys(appData.bookmarks).forEach(folderName => {
        htmlContent += `<DT><H3>${folderName}</H3>
<DL><p>`;
        
        appData.bookmarks[folderName].forEach(bookmark => {
            htmlContent += `<DT><A HREF="${bookmark.url}">${bookmark.title}</A>`;
        });
        
        htmlContent += `</DL><p>`;
    });
    
    htmlContent += `</DL><p>`;
    
    // 创建下载文件
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `星际导航书签_${new Date().toISOString().slice(0,10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('书签导出成功', 'success');
}

// 处理广告图片上传
function handleAdImageUpload(e, adNumber) {
    const file = e.target.files[0];
    if (!file) return;
    
    // 检查文件大小
    if (file.size > 3 * 1024 * 1024) { // 3MB
        showNotification('图片过大，请选择≤3M的文件', 'error');
        e.target.value = ''; // 重置输入
        return;
    }
    
    // 检查文件类型
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        showNotification('请选择JPG或PNG格式的图片', 'error');
        e.target.value = ''; // 重置输入
        return;
    }
    
    // 读取图片并显示预览
    const reader = new FileReader();
    reader.onload = function(event) {
        appData.ads[`ad${adNumber}`].image = event.target.result;
        
        // 更新对应广告位的预览
        renderAds();
        
        // 更新输入框的值
        document.getElementById(`ad${adNumber}Url`).value = appData.ads[`ad${adNumber}`].url || '';
        
        showNotification(`广告图片已加载`, 'success');
    };
    reader.readAsDataURL(file);
}

// 保存广告设置
function saveAd(adNumber) {
    const url = document.getElementById(`ad${adNumber}Url`).value.trim();
    
    if (!appData.ads[`ad${adNumber}`].image) {
        showNotification('请先上传广告图片', 'error');
        return;
    }
    
    appData.ads[`ad${adNumber}`].url = url;
    
    // 更新广告显示
    renderAds();
    
    showNotification(`广告${adNumber}保存成功`, 'success');
}

// 删除广告
function deleteAd(adNumber) {
    if (confirm(`确定删除广告${adNumber}？`)) {
        appData.ads[`ad${adNumber}`] = { image: "", url: "" };
        
        // 更新广告显示
        renderAds();
        
        // 清空输入
        document.getElementById(`ad${adNumber}Url`).value = '';
        
        showNotification(`广告${adNumber}已删除`, 'success');
    }
}

// 渲染广告
function renderAds() {
    for (let i = 1; i <= 3; i++) {
        const ad = appData.ads[`ad${i}`];
        const adElement = document.getElementById(`ad${i}`);
        
        if (ad.image && ad.url) {
            adElement.innerHTML = `<a href="${ad.url}" target="_blank"><img src="${ad.image}" alt="广告图片"></a>`;
        } else if (ad.image) {
            adElement.innerHTML = `<img src="${ad.image}" alt="未设置链接的广告图片">`;
        } else {
            adElement.innerHTML = '<p class="text-white/60">未设置广告</p>';
        }
    }
}

// 添加新城市
function addNewCity() {
    const cityName = elements.cityName.value.trim();
    const timezone = elements.cityTimezone.value;
    
    if (!cityName) {
        showNotification('请输入城市名称', 'error');
        return;
    }
    
    // 检查重复
    const isDuplicate = appData.cities.some(city => city.timezone === timezone);
    if (isDuplicate) {
        showNotification('该时区已存在', 'error');
        return;
    }
    
    // 添加城市
    appData.cities.push({ name: cityName, timezone });
    
    // 更新UI
    renderCities();
    updateWorldClocks();
    
    // 清空表单
    elements.cityName.value = '';
    
    showNotification(`已添加城市: ${cityName}`, 'success');
}

// 渲染城市列表
function renderCities() {
    elements.citiesList.innerHTML = '';
    
    appData.cities.forEach((city, index) => {
        const cityElement = document.createElement('div');
        cityElement.className = 'bg-white/5 p-3 rounded-lg flex justify-between items-center';
        
        cityElement.innerHTML = `
            <div>
                <div class="font-medium">${city.name}</div>
                <div class="text-sm text-white/60">${city.timezone}</div>
            </div>
            <button class="delete-city text-white/60 hover:text-red-400 p-2" data-index="${index}">
                <i class="fa fa-trash"></i>
            </button>
        `;
        
        elements.citiesList.appendChild(cityElement);
    });
    
    // 绑定删除事件
    document.querySelectorAll('.delete-city').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            const city = appData.cities[index];
            
            if (confirm(`确定删除城市【${city.name}】？`)) {
                appData.cities.splice(index, 1);
                renderCities();
                updateWorldClocks();
                showNotification(`已删除城市: ${city.name}`, 'success');
            }
        });
    });
}

// 更新世界时钟
function updateWorldClocks() {
    elements.worldClocks.innerHTML = '';
    
    appData.cities.forEach(city => {
        // 获取城市当前时间
        const options = { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false,
            timeZone: city.timezone
        };
        
        const timeString = new Date().toLocaleTimeString('zh-CN', options);
        
        const cityTimeElement = document.createElement('div');
        cityTimeElement.className = 'text-sm';
        cityTimeElement.innerHTML = `
            <span class="block">${city.name}</span>
            <span class="text-lg font-medium">${timeString}</span>
        `;
        
        elements.worldClocks.appendChild(cityTimeElement);
    });
}

// 更新在线时长
function updateOnlineDuration() {
    const deployTime = new Date(appData.deployInfo.deployTime);
    const now = new Date();
    const diffMs = now - deployTime;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    elements.onlineDuration.textContent = `已在线 ${days}天${hours}时${minutes}分`;
}

// 更新书签总数
function updateTotalBookmarks() {
    let total = 0;
    Object.values(appData.bookmarks).forEach(bookmarks => {
        total += bookmarks.length;
    });
    elements.totalBookmarks.textContent = `共收录 ${total} 个网站`;
}

// 显示通知
function showNotification(message, type) {
    elements.notification.textContent = message;
    elements.notification.className = '';
    elements.notification.classList.add('fixed', 'bottom-5', 'right-5', 'bg-white/10', 'backdrop-blur-md', 'border', 'border-white/20', 'rounded-lg', 'p-4', 'shadow-lg', 'z-50', 'max-w-sm');
    
    if (type === 'success') {
        elements.notification.classList.add('border-l-4', 'border-green-500');
        elements.notification.innerHTML = `<i class="fa fa-check-circle mr-2 text-green-400"></i>${message}`;
    } else if (type === 'error') {
        elements.notification.classList.add('border-l-4', 'border-red-500');
        elements.notification.innerHTML = `<i class="fa fa-exclamation-circle mr-2 text-red-400"></i>${message}`;
    } else {
        elements.notification.classList.add('border-l-4', 'border-blue-500');
        elements.notification.innerHTML = `<i class="fa fa-info-circle mr-2 text-blue-400"></i>${message}`;
    }
    
    // 显示通知
    elements.notification.style.transform = 'translateY(0)';
    elements.notification.style.opacity = '1';
    
    // 3秒后隐藏
    setTimeout(() => {
        elements.notification.style.transform = 'translateY(20px)';
        elements.notification.style.opacity = '0';
    }, 3000);
}

// 启动定时任务
function startTimers() {
    // 每秒更新时钟和在线时长
    setInterval(() => {
        updateWorldClocks();
        updateOnlineDuration();
    }, 1000);
    
    // 每60分钟显示健康提醒
    healthReminderTimer = setInterval(() => {
        elements.healthPopup.style.transform = 'translateY(0)';
        
        // 3秒后自动隐藏
        setTimeout(() => {
            elements.healthPopup.style.transform = 'translateY(-100%)';
        }, 3000);
    }, 60 * 60 * 1000); // 60分钟
}
