// 应用数据存储
const appData = {
    bookmarks: {
        folders: [],
        ads: [
            { url: '', image: '' },
            { url: '', image: '' },
            { url: '', image: '' }
        ],
        cities: [
            { name: '北京', timezone: 'Asia/Shanghai' },
            { name: '纽约', timezone: 'America/New_York' },
            { name: '伦敦', timezone: 'Europe/London' },
            { name: '东京', timezone: 'Asia/Tokyo' }
        ]
    },
    github: {
        username: '',
        repoName: '',
        token: '',
        validated: false
    },
    settings: {
        theme: 'dark',
        collapsedFolders: []
    }
};

// DOM 元素引用
const elements = {
    // 视图切换
    homeView: document.getElementById('home-view'),
    editView: document.getElementById('edit-view'),
    switchViewBtn: document.getElementById('switch-view'),
    editBtn: document.getElementById('edit-btn'),
    
    // 导航栏
    navbar: document.getElementById('navbar'),
    themeToggle: document.getElementById('theme-toggle'),
    settingsBtn: document.getElementById('settings-btn'),
    
    // 主页组件
    uptimeDisplay: document.getElementById('uptime-display'),
    healthReminder: document.getElementById('health-reminder'),
    worldClocks: document.getElementById('world-clocks'),
    searchInput: document.getElementById('search-input'),
    bookmarksFolder: document.getElementById('bookmarks-folder'),
    totalBookmarks: document.getElementById('total-bookmarks'),
    currentYear: document.getElementById('current-year'),
    siteHostname: document.getElementById('site-hostname'),
    adPlaceholders: [
        document.getElementById('ad-1'),
        document.getElementById('ad-2'),
        document.getElementById('ad-3')
    ],
    
    // 编辑中心
    unverifiedAlert: document.getElementById('unverified-alert'),
    goToSettingsBtn: document.getElementById('go-to-settings'),
    addBookmarkBtn: document.getElementById('add-bookmark-btn'),
    importBookmarksBtn: document.getElementById('import-bookmarks-btn'),
    exportBookmarksBtn: document.getElementById('export-bookmarks-btn'),
    bookmarkImportFile: document.getElementById('bookmark-import-file'),
    bookmarkEditTree: document.getElementById('bookmark-edit-tree'),
    saveChangesBtn: document.getElementById('save-changes'),
    loadingSpinner: document.querySelector('.loading-spinner'),
    
    // 广告编辑
    adUrls: document.querySelectorAll('.ad-url'),
    adImages: document.querySelectorAll('.ad-image'),
    adPreviews: document.querySelectorAll('.ad-preview'),
    
    // 时钟编辑
    citiesList: document.getElementById('cities-list'),
    cityNameInput: document.getElementById('city-name'),
    cityTimezoneSelect: document.getElementById('city-timezone'),
    addCityBtn: document.getElementById('add-city-btn'),
    
    // 模态框
    settingsModal: document.getElementById('settings-modal'),
    bookmarkModal: document.getElementById('bookmark-modal'),
    folderModal: document.getElementById('folder-modal'),
    confirmModal: document.getElementById('confirm-modal'),
    notification: document.getElementById('notification'),
    closeModals: document.querySelectorAll('.close-modal'),
    
    // 设置表单
    githubUsernameInput: document.getElementById('github-username'),
    githubRepoInput: document.getElementById('github-repo'),
    githubTokenInput: document.getElementById('github-token'),
    validationStatus: document.getElementById('validation-status'),
    validateTokenBtn: document.getElementById('validate-token'),
    saveSettingsBtn: document.getElementById('save-settings'),
    
    // 书签表单
    bookmarkModalTitle: document.getElementById('bookmark-modal-title'),
    bookmarkFolderSelect: document.getElementById('bookmark-folder'),
    addFolderBtn: document.getElementById('add-folder-btn'),
    bookmarkTitleInput: document.getElementById('bookmark-title'),
    bookmarkUrlInput: document.getElementById('bookmark-url'),
    bookmarkIdInput: document.getElementById('bookmark-id'),
    cancelBookmarkBtn: document.getElementById('cancel-bookmark'),
    saveBookmarkBtn: document.getElementById('save-bookmark'),
    
    // 文件夹表单
    folderNameInput: document.getElementById('folder-name'),
    cancelFolderBtn: document.getElementById('cancel-folder'),
    saveFolderBtn: document.getElementById('save-folder'),
    
    // 确认对话框
    confirmTitle: document.getElementById('confirm-title'),
    confirmMessage: document.getElementById('confirm-message'),
    cancelConfirmBtn: document.getElementById('cancel-confirm'),
    confirmActionBtn: document.getElementById('confirm-action')
};

// 确认对话框回调
let confirmCallback = null;

// 初始化应用
async function init() {
    // 加载本地存储数据
    loadFromLocalStorage();
    
    // 初始化仓库信息
    if (repoInfo.username && repoInfo.repoName) {
        appData.github.username = repoInfo.username;
        appData.github.repoName = repoInfo.repoName;
        elements.githubUsernameInput.value = repoInfo.username;
        elements.githubRepoInput.value = repoInfo.repoName;
        elements.siteHostname.textContent = `${repoInfo.username}/${repoInfo.repoName}`;
    }
    
    // 设置当前年份
    elements.currentYear.textContent = new Date().getFullYear();
    
    // 初始化主题
    applyTheme(appData.settings.theme);
    
    // 尝试从GitHub加载数据
    try {
        await loadDataFromGitHub();
    } catch (error) {
        console.error('Failed to load data from GitHub:', error);
        showNotification('加载云端数据失败，使用本地数据', 'error');
    }
    
    // 渲染UI
    renderBookmarks();
    renderBookmarkEditTree();
    renderWorldClocks();
    renderAds();
    updateTotalBookmarks();
    
    // 启动定时器
    startUptimeTimer();
    startHealthReminder();
    startClockTimer();
    
    // 检查GitHub验证状态
    updateEditAccess();
    
    // 添加事件监听器
    addEventListeners();
}

// 从本地存储加载数据
function loadFromLocalStorage() {
    const savedSettings = localStorage.getItem('appSettings');
    const savedGitHub = localStorage.getItem('githubSettings');
    
    if (savedSettings) {
        appData.settings = { ...appData.settings, ...JSON.parse(savedSettings) };
    }
    
    if (savedGitHub) {
        appData.github = { ...appData.github, ...JSON.parse(savedGitHub) };
        elements.githubTokenInput.value = appData.github.token;
    }
}

// 保存数据到本地存储
function saveToLocalStorage() {
    localStorage.setItem('appSettings', JSON.stringify(appData.settings));
    localStorage.setItem('githubSettings', JSON.stringify({
        username: appData.github.username,
        repoName: appData.github.repoName,
        token: appData.github.token,
        validated: appData.github.validated
    }));
}

// 应用主题
function applyTheme(theme) {
    document.body.classList.toggle('dark-mode', theme === 'dark');
    document.body.classList.toggle('light-mode', theme === 'light');
    appData.settings.theme = theme;
    saveToLocalStorage();
}

// 从GitHub加载数据
async function loadDataFromGitHub() {
    showLoading(true);
    
    try {
        let url;
        let headers = {};
        
        // 构建请求URL和头部
        if (appData.github.validated && appData.github.token) {
            // 有验证的请求
            url = `https://api.github.com/repos/${appData.github.username}/${appData.github.repoName}/contents/bookmarks.json`;
            headers['Authorization'] = `token ${appData.github.token}`;
        } else if (appData.github.username && appData.github.repoName) {
            // 公开仓库请求
            url = `https://raw.githubusercontent.com/${appData.github.username}/${appData.github.repoName}/main/bookmarks.json`;
        } else {
            // 没有仓库信息
            showLoading(false);
            return;
        }
        
        // 发送请求
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let data;
        if (appData.github.validated && appData.github.token) {
            // 处理API响应
            const apiData = await response.json();
            data = JSON.parse(atob(apiData.content));
        } else {
            // 处理直接文件响应
            data = await response.json();
        }
        
        // 合并数据
        if (data.folders) appData.bookmarks.folders = data.folders;
        if (data.ads) appData.bookmarks.ads = data.ads;
        if (data.cities) appData.bookmarks.cities = data.cities;
        
        showNotification('数据加载成功', 'success');
    } catch (error) {
        console.error('Error loading data from GitHub:', error);
        throw error;
    } finally {
        showLoading(false);
    }
}

// 保存数据到GitHub
async function saveDataToGitHub() {
    showLoading(true);
    
    try {
        if (!appData.github.validated || !appData.github.token) {
            throw new Error('未通过GitHub验证');
        }
        
        // 准备要保存的数据
        const dataToSave = {
            folders: appData.bookmarks.folders,
            ads: appData.bookmarks.ads,
            cities: appData.bookmarks.cities
        };
        
        // 获取现有文件的SHA
        const shaResponse = await fetch(
            `https://api.github.com/repos/${appData.github.username}/${appData.github.repoName}/contents/bookmarks.json`,
            {
                headers: {
                    'Authorization': `token ${appData.github.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        let sha = '';
        if (shaResponse.ok) {
            const shaData = await shaResponse.json();
            sha = shaData.sha;
        }
        
        // 编码数据解决btoa中文问题
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(dataToSave, null, 2))));
        
        // 提交保存请求
        const response = await fetch(
            `https://api.github.com/repos/${appData.github.username}/${appData.github.repoName}/contents/bookmarks.json`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${appData.github.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: 'Update bookmarks via星际导航',
                    content: content,
                    sha: sha
                })
            }
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `保存失败: ${response.status}`);
        }
        
        showNotification('数据已成功同步到GitHub', 'success');
        return true;
    } catch (error) {
        console.error('Error saving data to GitHub:', error);
        showNotification(`保存失败: ${error.message}`, 'error');
        return false;
    } finally {
        showLoading(false);
    }
}

// 验证GitHub Token
async function validateGitHubToken(token, username, repoName) {
    showLoading(true);
    
    try {
        // 验证Token有效性
        const userResponse = await fetch('https://api.github.com/user', {
            headers: { 'Authorization': `token ${token}` }
        });
        
        if (!userResponse.ok) {
            throw new Error('Token无效或没有权限');
        }
        
        // 验证仓库访问权限
        const repoResponse = await fetch(
            `https://api.github.com/repos/${username}/${repoName}`,
            { headers: { 'Authorization': `token ${token}` } }
        );
        
        if (!repoResponse.ok) {
            throw new Error('无法访问目标仓库，请检查仓库名称或Token权限');
        }
        
        // 验证成功
        appData.github.token = token;
        appData.github.validated = true;
        elements.validationStatus.textContent = '验证成功';
        elements.validationStatus.className = 'status success';
        saveToLocalStorage();
        
        showNotification('GitHub验证成功', 'success');
        return true;
    } catch (error) {
        console.error('Token validation failed:', error);
        elements.validationStatus.textContent = `验证失败: ${error.message}`;
        elements.validationStatus.className = 'status error';
        appData.github.validated = false;
        return false;
    } finally {
        showLoading(false);
    }
}

// 渲染书签
function renderBookmarks(filter = '') {
    elements.bookmarksFolder.innerHTML = '';
    
    if (appData.bookmarks.folders.length === 0) {
        elements.bookmarksFolder.innerHTML = '<div class="empty-state">暂无书签，前往编辑中心添加</div>';
        return;
    }
    
    // 递归渲染文件夹
    function renderFolder(folder, container) {
        const folderElement = document.createElement('div');
        folderElement.className = 'bookmark-folder';
        folderElement.dataset.folderId = folder.id;
        
        // 文件夹标题
        const header = document.createElement('div');
        header.className = 'folder-header';
        header.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-5 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"></path>
            </svg>
            <span class="folder-title">${folder.name}</span>
            <span class="folder-count">(${folder.bookmarks.length})</span>
        `;
        
        // 处理折叠状态
        const isCollapsed = appData.settings.collapsedFolders.includes(folder.id);
        header.addEventListener('click', () => toggleFolder(folder.id));
        
        // 文件夹内容
        const content = document.createElement('div');
        content.className = 'folder-content';
        content.style.display = isCollapsed ? 'none' : 'grid';
        
        // 添加书签
        folder.bookmarks.forEach(bookmark => {
            // 应用搜索过滤
            if (filter && !(
                bookmark.title.toLowerCase().includes(filter.toLowerCase()) || 
                bookmark.url.toLowerCase().includes(filter.toLowerCase())
            )) {
                return;
            }
            
            const bookmarkElement = document.createElement('div');
            bookmarkElement.className = 'bookmark-item';
            bookmarkElement.title = `${bookmark.title}\n${bookmark.url}`;
            bookmarkElement.addEventListener('click', () => window.open(bookmark.url, '_blank'));
            
            // 处理Favicon
            let faviconHtml = '';
            try {
                const urlObj = new URL(bookmark.url);
                faviconHtml = `<img src="${urlObj.protocol}//${urlObj.hostname}/favicon.ico" class="bookmark-favicon" onerror="this.style.display='none'">`;
            } catch (e) {
                // 无效URL，使用首字母
                const initial = bookmark.title.charAt(0).toUpperCase();
                faviconHtml = `<div class="bookmark-initial">${initial}</div>`;
            }
            
            bookmarkElement.innerHTML = `
                ${faviconHtml}
                <span class="bookmark-title">${bookmark.title}</span>
            `;
            
            content.appendChild(bookmarkElement);
        });
        
        folderElement.appendChild(header);
        folderElement.appendChild(content);
        container.appendChild(folderElement);
    }
    
    // 渲染所有顶级文件夹
    appData.bookmarks.folders.forEach(folder => {
        // 检查文件夹是否有匹配的书签
        const hasMatchingBookmarks = folder.bookmarks.some(bookmark => 
            !filter || 
            bookmark.title.toLowerCase().includes(filter.toLowerCase()) || 
            bookmark.url.toLowerCase().includes(filter.toLowerCase())
        );
        
        // 如果有搜索过滤且没有匹配项，则不渲染此文件夹
        if (filter && !hasMatchingBookmarks) {
            return;
        }
        
        renderFolder(folder, elements.bookmarksFolder);
    });
    
    // 如果过滤后没有结果
    if (filter && elements.bookmarksFolder.children.length === 0) {
        elements.bookmarksFolder.innerHTML = '<div class="empty-state">没有找到匹配的书签</div>';
    }
}

// 渲染编辑中心的书签树
function renderBookmarkEditTree() {
    elements.bookmarkEditTree.innerHTML = '';
    
    if (appData.bookmarks.folders.length === 0) {
        elements.bookmarkEditTree.innerHTML = '<div class="empty-state">暂无书签，请添加文件夹和书签</div>';
        return;
    }
    
    // 递归渲染文件夹
    function renderEditFolder(folder, container) {
        const folderElement = document.createElement('div');
        folderElement.className = 'bookmark-tree-item';
        
        // 文件夹标题
        const folderHeader = document.createElement('div');
        folderHeader.className = 'tree-folder';
        folderHeader.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-5 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"></path>
            </svg>
            <span>${folder.name}</span>
        `;
        
        // 文件夹内容容器
        const contentContainer = document.createElement('div');
        contentContainer.className = 'tree-folder-content';
        contentContainer.style.display = 'block';
        
        // 添加书签
        folder.bookmarks.forEach(bookmark => {
            const bookmarkElement = document.createElement('div');
            bookmarkElement.className = 'tree-bookmark';
            bookmarkElement.innerHTML = `
                <div>
                    <strong>${bookmark.title}</strong>
                    <div style="font-size: 12px; color: var(--text-secondary);">${bookmark.url}</div>
                </div>
                <div class="tree-bookmark-actions">
                    <button class="edit-bookmark" data-id="${bookmark.id}" data-folder="${folder.id}" title="编辑">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="delete-bookmark" data-id="${bookmark.id}" data-folder="${folder.id}" title="删除">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            `;
            contentContainer.appendChild(bookmarkElement);
        });
        
        folderElement.appendChild(folderHeader);
        folderElement.appendChild(contentContainer);
        container.appendChild(folderElement);
        
        // 添加事件监听器
        folderHeader.addEventListener('click', () => {
            contentContainer.style.display = contentContainer.style.display === 'none' ? 'block' : 'none';
        });
    }
    
    // 创建添加文件夹按钮
    const addFolderBtn = document.createElement('button');
    addFolderBtn.className = 'btn secondary';
    addFolderBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-5 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"></path>
            <line x1="12" y1="10" x2="12" y2="16"></line>
            <line x1="16" y1="13" x2="8" y2="13"></line>
        </svg>
        添加文件夹
    `;
    addFolderBtn.addEventListener('click', openFolderModal);
    elements.bookmarkEditTree.appendChild(addFolderBtn);
    
    // 渲染所有文件夹
    appData.bookmarks.folders.forEach(folder => {
        renderEditFolder(folder, elements.bookmarkEditTree);
    });
    
    // 添加编辑和删除书签的事件监听器
    document.querySelectorAll('.edit-bookmark').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookmarkId = e.currentTarget.dataset.id;
            const folderId = e.currentTarget.dataset.folder;
            openEditBookmarkModal(folderId, bookmarkId);
        });
    });
    
    document.querySelectorAll('.delete-bookmark').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookmarkId = e.currentTarget.dataset.id;
            const folderId = e.currentTarget.dataset.folder;
            confirmDeleteBookmark(folderId, bookmarkId);
        });
    });
}

// 渲染世界时钟
function renderWorldClocks() {
    elements.worldClocks.innerHTML = '';
    
    appData.bookmarks.cities.forEach(city => {
        const cityElement = document.createElement('div');
        cityElement.className = 'city-clock';
        cityElement.innerHTML = `
            <div class="city-name">${city.name}</div>
            <div class="city-time" data-timezone="${city.timezone}">--:--:--</div>
        `;
        elements.worldClocks.appendChild(cityElement);
    });
    
    // 更新一次时钟显示
    updateClocks();
}

// 渲染广告
function renderAds() {
    appData.bookmarks.ads.forEach((ad, index) => {
        if (ad.image) {
            elements.adPlaceholders[index].innerHTML = `<a href="${ad.url || '#'}" target="_blank"><img src="${ad.image}" style="width: 100%; height: 100%; object-fit: cover;"></a>`;
            elements.adPreviews[index].src = ad.image;
            elements.adUrls[index].value = ad.url;
        } else {
            elements.adPlaceholders[index].textContent = `广告位 ${index + 1}`;
            elements.adPreviews[index].src = '';
            elements.adUrls[index].value = '';
        }
    });
}

// 更新书签总数
function updateTotalBookmarks() {
    let total = 0;
    appData.bookmarks.folders.forEach(folder => {
        total += folder.bookmarks.length;
    });
    elements.totalBookmarks.textContent = total;
}

// 启动在线时长计时器
function startUptimeTimer() {
    if (!repoInfo.deployedAt) return;
    
    const deployedDate = new Date(repoInfo.deployedAt);
    
    function updateUptime() {
        const now = new Date();
        const diff = now - deployedDate;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        elements.uptimeDisplay.textContent = `${days}天${hours}时${minutes}分`;
    }
    
    // 初始更新
    updateUptime();
    // 每分钟更新一次
    setInterval(updateUptime, 60000);
}

// 启动健康提醒
// 启动健康提醒
function startHealthReminder() {
    const reminders = [
        "该休息一下了，让眼睛远离屏幕几分钟吧～",
        "记得多喝水，保持身体水分充足！",
        "站起来活动一下，缓解久坐疲劳～",
        "做个眼保健操，保护视力很重要！",
        "深呼吸几次，放松一下大脑吧～"
    ];
    
    // 随机显示一条提醒
    function showRandomReminder() {
        const randomIndex = Math.floor(Math.random() * reminders.length);
        elements.healthReminder.textContent = reminders[randomIndex];
        
        // 提醒动画
        elements.healthReminder.style.transition = "none";
        elements.healthReminder.style.opacity = "0.5";
        setTimeout(() => {
            elements.healthReminder.style.transition = "opacity 0.5s ease";
            elements.healthReminder.style.opacity = "1";
        }, 10);
    }
    
    // 初始显示
    showRandomReminder();
    // 每小时显示一次新提醒
    setInterval(showRandomReminder, 3600000);
}

// 启动时钟定时器
function startClockTimer() {
    // 更新时钟
    function updateClocks() {
        document.querySelectorAll('.city-time').forEach(element => {
            const timezone = element.dataset.timezone;
            try {
                const options = { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit',
                    timeZone: timezone
                };
                const time = new Date().toLocaleTimeString('zh-CN', options);
                element.textContent = time;
            } catch (e) {
                element.textContent = '无效时区';
            }
        });
    }
    
    // 初始更新
    updateClocks();
    // 每秒更新一次
    setInterval(updateClocks, 1000);
}

// 切换文件夹折叠状态
function toggleFolder(folderId) {
    const index = appData.settings.collapsedFolders.indexOf(folderId);
    if (index > -1) {
        // 展开文件夹
        appData.settings.collapsedFolders.splice(index, 1);
    } else {
        // 折叠文件夹
        appData.settings.collapsedFolders.push(folderId);
    }
    
    // 保存状态并重新渲染
    saveToLocalStorage();
    renderBookmarks(elements.searchInput.value);
}

// 切换视图
function switchView(viewName) {
    elements.homeView.classList.toggle('active', viewName === 'home');
    elements.editView.classList.toggle('active', viewName === 'edit');
    elements.switchViewBtn.classList.toggle('active', viewName === 'home');
    elements.editBtn.classList.toggle('active', viewName === 'edit');
}

// 更新编辑权限
function updateEditAccess() {
    const isVerified = appData.github.validated;
    elements.unverifiedAlert.style.display = isVerified ? 'none' : 'block';
    
    // 启用/禁用编辑按钮
    const editButtons = [
        elements.addBookmarkBtn,
        elements.importBookmarksBtn,
        elements.exportBookmarksBtn,
        elements.saveChangesBtn,
        elements.addCityBtn
    ];
    editButtons.forEach(btn => btn.disabled = !isVerified);
    
    // 启用/禁用广告编辑
    elements.adUrls.forEach(input => input.disabled = !isVerified);
    elements.adImages.forEach(input => input.disabled = !isVerified);
    
    // 启用/禁用城市编辑
    elements.cityNameInput.disabled = !isVerified;
    elements.cityTimezoneSelect.disabled = !isVerified;
}

// 显示/隐藏加载状态
function showLoading(show) {
    elements.loadingSpinner.style.display = show ? 'inline-block' : 'none';
    elements.saveChangesBtn.disabled = show;
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = elements.notification;
    notification.textContent = message;
    notification.className = 'notification';
    notification.classList.add(type);
    notification.classList.add('active');
    
    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}

// 打开添加书签模态框
function openAddBookmarkModal() {
    elements.bookmarkModalTitle.textContent = '添加书签';
    elements.bookmarkTitleInput.value = '';
    elements.bookmarkUrlInput.value = '';
    elements.bookmarkIdInput.value = '';
    populateFolderSelect();
    elements.bookmarkModal.classList.add('active');
}

// 打开编辑书签模态框
function openEditBookmarkModal(folderId, bookmarkId) {
    const folder = appData.bookmarks.folders.find(f => f.id === folderId);
    const bookmark = folder?.bookmarks.find(b => b.id === bookmarkId);
    
    if (!folder || !bookmark) return;
    
    elements.bookmarkModalTitle.textContent = '编辑书签';
    elements.bookmarkTitleInput.value = bookmark.title;
    elements.bookmarkUrlInput.value = bookmark.url;
    elements.bookmarkIdInput.value = bookmark.id;
    populateFolderSelect(folderId);
    elements.bookmarkModal.classList.add('active');
}

// 打开文件夹模态框
function openFolderModal() {
    elements.folderNameInput.value = '';
    elements.folderModal.classList.add('active');
}

// 填充文件夹选择下拉框
function populateFolderSelect(selectedFolderId = '') {
    elements.bookmarkFolderSelect.innerHTML = '';
    
    appData.bookmarks.folders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder.id;
        option.textContent = folder.name;
        option.selected = folder.id === selectedFolderId;
        elements.bookmarkFolderSelect.appendChild(option);
    });
}

// 保存书签
function saveBookmark() {
    const folderId = elements.bookmarkFolderSelect.value;
    const title = elements.bookmarkTitleInput.value.trim();
    const url = elements.bookmarkUrlInput.value.trim();
    const bookmarkId = elements.bookmarkIdInput.value;
    
    if (!folderId || !title || !url) {
        showNotification('请填写所有必填字段', 'error');
        return;
    }
    
    // 验证URL格式
    try {
        new URL(url);
    } catch (e) {
        showNotification('请输入有效的URL', 'error');
        return;
    }
    
    const folderIndex = appData.bookmarks.folders.findIndex(f => f.id === folderId);
    if (folderIndex === -1) return;
    
    if (bookmarkId) {
        // 编辑现有书签
        const bookmarkIndex = appData.bookmarks.folders[folderIndex].bookmarks.findIndex(b => b.id === bookmarkId);
        if (bookmarkIndex !== -1) {
            appData.bookmarks.folders[folderIndex].bookmarks[bookmarkIndex] = {
                ...appData.bookmarks.folders[folderIndex].bookmarks[bookmarkIndex],
                title,
                url
            };
            showNotification('书签已更新', 'success');
        }
    } else {
        // 添加新书签
        // 检查重复链接
        const isDuplicate = appData.bookmarks.folders.some(folder => 
            folder.bookmarks.some(b => b.url.toLowerCase() === url.toLowerCase())
        );
        
        if (isDuplicate) {
            showNotification('该链接已存在于书签中', 'error');
            return;
        }
        
        const newBookmark = {
            id: 'bookmark_' + Date.now(),
            title,
            url
        };
        
        appData.bookmarks.folders[folderIndex].bookmarks.push(newBookmark);
        showNotification('书签已添加', 'success');
    }
    
    // 更新UI
    renderBookmarks(elements.searchInput.value);
    renderBookmarkEditTree();
    updateTotalBookmarks();
    elements.bookmarkModal.classList.remove('active');
}

// 保存文件夹
function saveFolder() {
    const name = elements.folderNameInput.value.trim();
    
    if (!name) {
        showNotification('请输入文件夹名称', 'error');
        return;
    }
    
    // 检查同名文件夹
    const isDuplicate = appData.bookmarks.folders.some(f => f.name.toLowerCase() === name.toLowerCase());
    if (isDuplicate) {
        showNotification('文件夹名称已存在', 'error');
        return;
    }
    
    const newFolder = {
        id: 'folder_' + Date.now(),
        name,
        bookmarks: []
    };
    
    appData.bookmarks.folders.push(newFolder);
    showNotification('文件夹已添加', 'success');
    
    // 更新UI
    renderBookmarkEditTree();
    elements.folderModal.classList.remove('active');
}

// 确认删除书签
function confirmDeleteBookmark(folderId, bookmarkId) {
    elements.confirmTitle.textContent = '删除书签';
    elements.confirmMessage.textContent = '确定要删除这个书签吗？此操作无法撤销。';
    elements.confirmModal.classList.add('active');
    
    confirmCallback = () => {
        const folderIndex = appData.bookmarks.folders.findIndex(f => f.id === folderId);
        if (folderIndex === -1) return;
        
        const bookmarkIndex = appData.bookmarks.folders[folderIndex].bookmarks.findIndex(b => b.id === bookmarkId);
        if (bookmarkIndex !== -1) {
            appData.bookmarks.folders[folderIndex].bookmarks.splice(bookmarkIndex, 1);
            showNotification('书签已删除', 'success');
            
            // 更新UI
            renderBookmarks(elements.searchInput.value);
            renderBookmarkEditTree();
            updateTotalBookmarks();
        }
    };
}

// 添加城市
function addCity() {
    const name = elements.cityNameInput.value.trim();
    const timezone = elements.cityTimezoneSelect.value;
    
    if (!name || !timezone) {
        showNotification('请填写城市名称并选择时区', 'error');
        return;
    }
    
    // 检查重复城市
    const isDuplicate = appData.bookmarks.cities.some(c => 
        c.name.toLowerCase() === name.toLowerCase() && c.timezone === timezone
    );
    
    if (isDuplicate) {
        showNotification('该城市已添加', 'error');
        return;
    }
    
    appData.bookmarks.cities.push({ name, timezone });
    showNotification('城市已添加', 'success');
    
    // 更新UI
    renderWorldClocks();
    renderCitiesList();
    
    // 清空输入
    elements.cityNameInput.value = '';
}

// 渲染城市列表
function renderCitiesList() {
    elements.citiesList.innerHTML = '';
    
    appData.bookmarks.cities.forEach((city, index) => {
        const cityElement = document.createElement('div');
        cityElement.className = 'city-item';
        cityElement.innerHTML = `
            <div>
                <strong>${city.name}</strong>
                <div style="font-size: 12px; color: var(--text-secondary);">${city.timezone}</div>
            </div>
            <button class="delete-city btn danger tiny" data-index="${index}">删除</button>
        `;
        elements.citiesList.appendChild(cityElement);
    });
    
    // 添加删除城市事件
    document.querySelectorAll('.delete-city').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            deleteCity(index);
        });
    });
}

// 删除城市
function deleteCity(index) {
    if (appData.bookmarks.cities.length <= 1) {
        showNotification('至少保留一个城市', 'error');
        return;
    }
    
    appData.bookmarks.cities.splice(index, 1);
    showNotification('城市已删除', 'success');
    
    // 更新UI
    renderWorldClocks();
    renderCitiesList();
}

// 导入书签
function importBookmarks(file) {
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(e.target.result, 'text/html');
            const bookmarkElements = htmlDoc.querySelectorAll('a');
            
            let importedCount = 0;
            let duplicateCount = 0;
            let rootFolder = {
                id: 'folder_import_' + Date.now(),
                name: '导入的书签',
                bookmarks: []
            };
            
            // 检查是否已有导入文件夹，如有则复用
            const existingFolderIndex = appData.bookmarks.folders.findIndex(f => f.name === '导入的书签');
            if (existingFolderIndex !== -1) {
                rootFolder = appData.bookmarks.folders[existingFolderIndex];
            } else {
                appData.bookmarks.folders.push(rootFolder);
            }
            
            // 处理每个书签
            bookmarkElements.forEach(elem => {
                const url = elem.href;
                const title = elem.textContent.trim() || url;
                
                // 跳过无效链接
                if (!url || url.startsWith('javascript:')) return;
                
                // 检查重复
                const isDuplicate = appData.bookmarks.folders.some(folder => 
                    folder.bookmarks.some(b => b.url.toLowerCase() === url.toLowerCase())
                );
                
                if (isDuplicate) {
                    duplicateCount++;
                    return;
                }
                
                // 添加到导入文件夹
                rootFolder.bookmarks.push({
                    id: 'bookmark_' + Date.now() + '_' + importedCount,
                    title,
                    url
                });
                
                importedCount++;
            });
            
            showNotification(`成功导入 ${importedCount} 个书签，过滤 ${duplicateCount} 个重复项`, 'success');
            
            // 更新UI
            renderBookmarks(elements.searchInput.value);
            renderBookmarkEditTree();
            updateTotalBookmarks();
        } catch (error) {
            console.error('书签导入失败:', error);
            showNotification('书签导入失败，文件格式错误', 'error');
        }
    };
    
    reader.readAsText(file);
}

// 导出书签
function exportBookmarks() {
    // 创建HTML书签格式
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>书签导出</TITLE>
<H1>书签</H1>
<DL><p>`;
    
    // 添加文件夹和书签
    appData.bookmarks.folders.forEach(folder => {
        html += `<DT><H3>${folder.name}</H3>
<DL><p>`;
        
        folder.bookmarks.forEach(bookmark => {
            html += `<DT><A HREF="${bookmark.url}">${bookmark.title}</A></DT><p>`;
        });
        
        html += `</DL><p>`;
    });
    
    html += `</DL><p>`;
    
    // 创建下载文件
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarks.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('书签已导出为 bookmarks.html', 'success');
}

// 添加事件监听器
function addEventListeners() {
    // 视图切换
    elements.switchViewBtn.addEventListener('click', () => switchView('home'));
    elements.editBtn.addEventListener('click', () => switchView('edit'));
    
    // 主题切换
    elements.themeToggle.addEventListener('click', () => {
        const newTheme = appData.settings.theme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });
    
    // 搜索功能
    elements.searchInput.addEventListener('input', (e) => {
        renderBookmarks(e.target.value);
    });
    
    // 设置按钮
    elements.settingsBtn.addEventListener('click', () => {
        elements.settingsModal.classList.add('active');
    });
    
    // 编辑中心访问控制
    elements.goToSettingsBtn.addEventListener('click', () => {
        elements.settingsModal.classList.add('active');
    });
    
    // 书签编辑
    elements.addBookmarkBtn.addEventListener('click', openAddBookmarkModal);
    elements.importBookmarksBtn.addEventListener('click', () => {
        elements.bookmarkImportFile.click();
    });
    elements.exportBookmarksBtn.addEventListener('click', exportBookmarks);
    
    elements.bookmarkImportFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importBookmarks(e.target.files[0]);
            // 重置文件输入，允许重复选择同一文件
            e.target.value = '';
        }
    });
    
    // 保存更改
    elements.saveChangesBtn.addEventListener('click', async () => {
        // 保存广告设置
        appData.bookmarks.ads.forEach((ad, index) => {
            ad.url = elements.adUrls[index].value;
            // 图片已通过单独事件处理
        });
        
        const success = await saveDataToGitHub();
        if (success) {
            renderAds();
        }
    });
    
    // 广告图片上传
    elements.adImages.forEach((input, index) => {
        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                
                // 检查文件大小
                if (file.size > 3 * 1024 * 1024) { // 3MB
                    showNotification('图片超过3M，请重新选择', 'error');
                    return;
                }
                
                // 读取图片并预览
                const reader = new FileReader();
                reader.onload = function(event) {
                    appData.bookmarks.ads[index].image = event.target.result;
                    elements.adPreviews[index].src = event.target.result;
                    showNotification('图片已上传', 'success');
                };
                reader.readAsDataURL(file);
            }
        });
    });
    
    // 城市管理
    elements.addCityBtn.addEventListener('click', addCity);
    renderCitiesList(); // 初始渲染城市列表
    
    // GitHub 设置
    elements.validateTokenBtn.addEventListener('click', async () => {
        const token = elements.githubTokenInput.value;
        const username = elements.githubUsernameInput.value;
        const repoName = elements.githubRepoInput.value;
        
        if (!token || !username || !repoName) {
            showNotification('请填写所有字段', 'error');
            return;
        }
        
        const success = await validateGitHubToken(token, username, repoName);
        if (success) {
            updateEditAccess();
        }
    });
    
    elements.saveSettingsBtn.addEventListener('click', () => {
        appData.github.username = elements.githubUsernameInput.value;
        appData.github.repoName = elements.githubRepoInput.value;
        appData.github.token = elements.githubTokenInput.value;
        // 不自动验证，需用户手动触发
        saveToLocalStorage();
        showNotification('设置已保存', 'success');
        elements.settingsModal.classList.remove('active');
    });
    
    // 书签模态框
    elements.addFolderBtn.addEventListener('click', () => {
        elements.bookmarkModal.classList.remove('active');
        setTimeout(openFolderModal, 300);
    });
    
    elements.saveBookmarkBtn.addEventListener('click', saveBookmark);
    elements.cancelBookmarkBtn.addEventListener('click', () => {
        elements.bookmarkModal.classList.remove('active');
    });
    
    // 文件夹模态框
    elements.saveFolderBtn.addEventListener('click', saveFolder);
    elements.cancelFolderBtn.addEventListener('click', () => {
        elements.folderModal.classList.remove('active');
    });
    
    // 确认模态框
    elements.confirmActionBtn.addEventListener('click', () => {
        if (confirmCallback) {
            confirmCallback();
        }
        elements.confirmModal.classList.remove('active');
        confirmCallback = null;
    });
    
    elements.cancelConfirmBtn.addEventListener('click', () => {
        elements.confirmModal.classList.remove('active');
        confirmCallback = null;
    });
    
    // 关闭模态框
    elements.closeModals.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
    
    // 导航栏自动隐藏
    let navbarTimer;
    window.addEventListener('scroll', () => {
        // 显示导航栏
        elements.navbar.style.opacity = '1';
        elements.navbar.style.pointerEvents = 'auto';
        
        // 清除之前的定时器
        clearTimeout(navbarTimer);
        
        // 设置新定时器，3秒后隐藏
        navbarTimer = setTimeout(() => {
            elements.navbar.style.opacity = '0';
            elements.navbar.style.pointerEvents = 'none';
        }, 3000);
    });
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init);