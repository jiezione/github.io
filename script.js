// 全局数据
let appData = {
    bookmarks: {
        default: []
    },
    cities: [
        { name: "北京", timezone: "Asia/Shanghai" },
        { name: "伦敦", timezone: "Europe/London" },
        { name: "纽约", timezone: "America/New_York" },
        { name: "东京", timezone: "Asia/Tokyo" }
    ],
    ads: [
        { image: "", link: "" },
        { image: "", link: "" },
        { image: "", link: "" }
    ],
    github: {
        username: "",
        repo: "",
        token: "",
        validated: false
    },
    deploymentDate: new Date() // 将在数据加载时更新
};

// 全局变量
let adLinks = ["", "", ""];
let searchTimeout = null;

// DOM 元素
const elements = {
    themeToggle: document.getElementById('theme-toggle'),
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    editModal: document.getElementById('edit-modal'),
    openEditCenter: document.getElementById('open-edit-center'),
    closeSettingsBtn: document.querySelector('.close-btn'),
    closeEditBtn: document.querySelector('.close-edit-btn'),
    githubUsername: document.getElementById('github-username'),
    githubRepo: document.getElementById('github-repo'),
    githubToken: document.getElementById('github-token'),
    validateGithub: document.getElementById('validate-github'),
    githubStatus: document.getElementById('github-status'),
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    uptimeDisplay: document.getElementById('uptime-display'),
    reminderText: document.getElementById('reminder-text'),
    citiesContainer: document.getElementById('cities-container'),
    totalBookmarks: document.getElementById('total-bookmarks'),
    currentYear: document.getElementById('current-year'),
    hostname: document.getElementById('hostname'),
    toast: document.getElementById('toast'),
    loader: document.getElementById('loader'),
    saveChanges: document.getElementById('save-changes'),
    cancelEdits: document.getElementById('cancel-edits'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    addBookmarkBtn: document.getElementById('add-bookmark-btn'),
    addBookmarkModal: document.getElementById('add-bookmark-modal'),
    closeAddBookmark: document.querySelector('.close-add-bookmark'),
    saveBookmark: document.getElementById('save-bookmark'),
    importBookmarks: document.getElementById('import-bookmarks'),
    bookmarkImportFile: document.getElementById('bookmark-import-file'),
    exportBookmarks: document.getElementById('export-bookmarks'),
    addCityBtn: document.getElementById('add-city-btn'),
    cityName: document.getElementById('city-name'),
    cityTimezone: document.getElementById('city-timezone'),
    saveCityBtn: document.getElementById('save-city-btn'),
    citiesList: document.getElementById('cities-list'),
    newBookmarkName: document.getElementById('new-bookmark-name'),
    newBookmarkUrl: document.getElementById('new-bookmark-url'),
    newBookmarkFolder: document.getElementById('new-bookmark-folder')
};

// 初始化
async function init() {
    // 设置当前年份
    elements.currentYear.textContent = new Date().getFullYear();
    
    // 从本地存储加载 GitHub 信息
    loadGithubInfoFromLocalStorage();
    
    // 注入默认仓库信息（来自 deploy.yml）
    if (window.defaultRepoInfo) {
        appData.github.username = window.defaultRepoInfo.username;
        appData.github.repo = window.defaultRepoInfo.repo;
        elements.githubUsername.value = appData.github.username;
        elements.githubRepo.value = appData.github.repo;
    }
    
    // 加载数据
    showLoader();
    await loadDataFromGitHub();
    hideLoader();
    
    // 渲染页面
    renderBookmarks();
    renderCities();
    renderEditBookmarks();
    renderEditCities();
    updateBookmarkCount();
    updateEditFeaturesStatus();
    
    // 设置事件监听
    setupEventListeners();
    
    // 启动时钟和计时器
    updateUptime();
    setInterval(updateUptime, 60000);
    updateWorldClock();
    setInterval(updateWorldClock, 1000);
    updateHealthReminder();
    setInterval(updateHealthReminder, 3600000); // 每小时更新一次
}

// 设置事件监听
function setupEventListeners() {
    // 主题切换
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // 设置模态框
    elements.settingsBtn.addEventListener('click', () => {
        elements.settingsModal.style.display = 'block';
    });
    
    elements.closeSettingsBtn.addEventListener('click', () => {
        elements.settingsModal.style.display = 'none';
    });
    
    // 编辑中心
    elements.openEditCenter.addEventListener('click', () => {
        if (appData.github.validated) {
            elements.editModal.style.display = 'block';
            renderEditBookmarks();
            renderEditCities();
        }
    });
    
    elements.closeEditBtn.addEventListener('click', () => {
        elements.editModal.style.display = 'none';
    });
    
    // GitHub 验证
    elements.validateGithub.addEventListener('click', validateGitHubToken);
    
    // 搜索功能
    elements.searchBtn.addEventListener('click', performSearch);
    elements.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => performSearch(), 300);
    });
    
    // 标签页切换
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            switchTab(tab);
        });
    });
    
    // 书签操作
    elements.addBookmarkBtn.addEventListener('click', () => {
        elements.addBookmarkModal.style.display = 'block';
        elements.newBookmarkName.value = '';
        elements.newBookmarkUrl.value = '';
        elements.newBookmarkFolder.value = 'default';
    });
    
    elements.closeAddBookmark.addEventListener('click', () => {
        elements.addBookmarkModal.style.display = 'none';
    });
    
    elements.saveBookmark.addEventListener('click', saveNewBookmark);
    
    // 导入导出书签
    elements.importBookmarks.addEventListener('click', () => {
        elements.bookmarkImportFile.click();
    });
    
    elements.bookmarkImportFile.addEventListener('change', importBookmarksFromFile);
    elements.exportBookmarks.addEventListener('click', exportBookmarksToFile);
    
    // 城市操作
    elements.addCityBtn.addEventListener('click', () => {
        if (appData.github.validated) {
            elements.editModal.style.display = 'block';
            switchTab('clocks');
            elements.cityName.focus();
        } else {
            showToast('请先完成 GitHub 验证');
        }
    });
    
    elements.saveCityBtn.addEventListener('click', addNewCity);
    
    // 广告上传
    document.querySelectorAll('.ad-image-upload').forEach(input => {
        input.addEventListener('change', handleAdImageUpload);
    });
    
    document.querySelectorAll('.ad-link').forEach(input => {
        input.addEventListener('change', handleAdLinkChange);
    });
    
    document.querySelectorAll('.remove-ad').forEach(btn => {
        btn.addEventListener('click', handleRemoveAd);
    });
    
    // 保存和取消编辑
    elements.saveChanges.addEventListener('click', saveAllChanges);
    elements.cancelEdits.addEventListener('click', () => {
        elements.editModal.style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) elements.settingsModal.style.display = 'none';
        if (e.target === elements.editModal) elements.editModal.style.display = 'none';
        if (e.target === elements.addBookmarkModal) elements.addBookmarkModal.style.display = 'none';
    });
    
    // 控制栏自动隐藏
    let controlBar = document.querySelector('.control-bar');
    let hideTimeout;
    
    function showControlBar() {
        clearTimeout(hideTimeout);
        controlBar.style.opacity = '1';
        controlBar.style.pointerEvents = 'auto';
    }
    
    function hideControlBar() {
        hideTimeout = setTimeout(() => {
            controlBar.style.opacity = '0.7';
            controlBar.style.pointerEvents = 'none';
        }, 3000);
    }
    
    document.addEventListener('scroll', showControlBar);
    showControlBar();
    hideControlBar();
}

// 主题切换
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// 加载主题偏好
function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    }
}

// 切换标签页
function switchTab(tabName) {
    elements.tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });
    
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

// 从 GitHub 加载数据
async function loadDataFromGitHub() {
    try {
        let url;
        if (appData.github.token) {
            // 使用 GitHub API
            url = `https://api.github.com/repos/${appData.github.username}/${appData.github.repo}/contents/bookmarks.json`;
        } else if (appData.github.username && appData.github.repo) {
            // 使用公开 raw URL
            url = `https://raw.githubusercontent.com/${appData.github.username}/${appData.github.repo}/main/bookmarks.json`;
        } else {
            // 使用默认数据
            return;
        }
        
        const headers = appData.github.token ? {
            'Authorization': `token ${appData.github.token}`,
            'Accept': 'application/vnd.github.v3+json'
        } : {};
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            if (response.status === 404) {
                // 文件不存在，使用默认数据
                console.log('Bookmarks file not found, using default data');
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let data;
        if (appData.github.token) {
            const json = await response.json();
            data = JSON.parse(atob(json.content));
        } else {
            data = await response.json();
        }
        
        // 合并数据
        if (data.bookmarks) appData.bookmarks = data.bookmarks;
        if (data.cities) appData.cities = data.cities;
        if (data.ads) appData.ads = data.ads;
        if (data.deploymentDate) appData.deploymentDate = new Date(data.deploymentDate);
        
        // 更新广告链接
        appData.ads.forEach((ad, index) => {
            adLinks[index] = ad.link || '';
            const imgElement = document.querySelector(`#ad-${index + 1} .ad-img`);
            if (ad.image) {
                imgElement.src = ad.image;
                imgElement.alt = `广告 ${index + 1}`;
            } else {
                imgElement.src = '';
                imgElement.alt = `广告位 ${index + 1}`;
            }
        });
        
        // 更新广告链接输入框
        document.querySelectorAll('.ad-link').forEach((input, index) => {
            input.value = appData.ads[index].link || '';
        });
        
    } catch (error) {
        console.error('Error loading data from GitHub:', error);
        showToast('加载数据失败，使用默认数据');
    }
}

// 保存数据到 GitHub
async function saveDataToGitHub() {
    showLoader();
    try {
        if (!appData.github.username || !appData.github.repo || !appData.github.token) {
            throw new Error('GitHub 信息不完整');
        }
        
        // 准备数据
        const data = {
            bookmarks: appData.bookmarks,
            cities: appData.cities,
            ads: appData.ads,
            deploymentDate: appData.deploymentDate.toISOString()
        };
        
        const content = JSON.stringify(data, null, 2);
        
        // 先获取现有文件的 SHA
        const url = `https://api.github.com/repos/${appData.github.username}/${appData.github.repo}/contents/bookmarks.json`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${appData.github.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        let sha = '';
        if (response.ok) {
            const json = await response.json();
            sha = json.sha;
        }
        
        // 编码内容为 base64 并确保只包含 Latin1 字符
        const base64Content = btoa(unescape(encodeURIComponent(content)));
        
        // 保存文件
        const saveResponse = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${appData.github.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update bookmarks',
                content: base64Content,
                sha: sha // 只有文件存在时才需要
            })
        });
        
        if (!saveResponse.ok) {
            throw new Error(`保存失败: ${saveResponse.statusText}`);
        }
        
        showToast('数据已成功保存');
        return true;
    } catch (error) {
        console.error('Error saving data to GitHub:', error);
        showToast(`保存失败: ${error.message}`);
        return false;
    } finally {
        hideLoader();
    }
}

// 验证 GitHub Token
async function validateGitHubToken() {
    showLoader();
    try {
        const username = elements.githubUsername.value.trim();
        const repo = elements.githubRepo.value.trim();
        const token = elements.githubToken.value.trim();
        
        if (!username || !repo || !token) {
            showToast('请填写所有 GitHub 信息');
            return;
        }
        
        // 验证 token
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Token 无效');
        }
        
        // 验证仓库访问权限
        const repoResponse = await fetch(`https://api.github.com/repos/${username}/${repo}`, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        
        if (!repoResponse.ok) {
            throw new Error('无法访问仓库，请检查权限');
        }
        
        // 验证成功
        appData.github.username = username;
        appData.github.repo = repo;
        appData.github.token = token;
        appData.github.validated = true;
        
        // 保存到本地存储
        saveGithubInfoToLocalStorage();
        
        // 更新状态
        elements.githubStatus.textContent = '已验证';
        elements.githubStatus.style.color = 'var(--success-color)';
        elements.githubStatus.style.backgroundColor = 'rgba(46, 164, 79, 0.1)';
        
        showToast('GitHub 验证成功');
        updateEditFeaturesStatus();
        
    } catch (error) {
        console.error('GitHub validation error:', error);
        appData.github.validated = false;
        elements.githubStatus.textContent = `验证失败: ${error.message}`;
        elements.githubStatus.style.color = 'var(--danger-color)';
        elements.githubStatus.style.backgroundColor = 'rgba(215, 58, 73, 0.1)';
        showToast(`验证失败: ${error.message}`);
    } finally {
        hideLoader();
    }
}

// 从本地存储加载 GitHub 信息
function loadGithubInfoFromLocalStorage() {
    const savedGithub = localStorage.getItem('github-info');
    if (savedGithub) {
        try {
            const data = JSON.parse(savedGithub);
            appData.github = { ...appData.github, ...data };
            elements.githubUsername.value = appData.github.username;
            elements.githubRepo.value = appData.github.repo;
            elements.githubToken.value = appData.github.token;
            
            if (appData.github.validated) {
                elements.githubStatus.textContent = '已验证';
                elements.githubStatus.style.color = 'var(--success-color)';
                elements.githubStatus.style.backgroundColor = 'rgba(46, 164, 79, 0.1)';
            }
        } catch (error) {
            console.error('Error loading GitHub info from localStorage:', error);
        }
    }
}

// 保存 GitHub 信息到本地存储
function saveGithubInfoToLocalStorage() {
    localStorage.setItem('github-info', JSON.stringify({
        username: appData.github.username,
        repo: appData.github.repo,
        token: appData.github.token,
        validated: appData.github.validated
    }));
}

// 更新编辑功能状态
function updateEditFeaturesStatus() {
    const isEnabled = appData.github.validated;
    elements.openEditCenter.disabled = !isEnabled;
    elements.addCityBtn.disabled = !isEnabled;
    elements.saveCityBtn.disabled = !isEnabled;
    elements.addBookmarkBtn.disabled = !isEnabled;
    elements.importBookmarks.disabled = !isEnabled;
    elements.exportBookmarks.disabled = !isEnabled;
    
    document.querySelectorAll('.ad-image-upload, .ad-link, .remove-ad').forEach(el => {
        el.disabled = !isEnabled;
    });
}

// 渲染书签
function renderBookmarks(filter = '') {
    const container = document.querySelector('.bookmark-folders');
    container.innerHTML = '';
    
    // 确保默认文件夹存在
    if (!appData.bookmarks.default) {
        appData.bookmarks.default = [];
    }
    
    // 过滤书签
    const filteredBookmarks = {};
    Object.keys(appData.bookmarks).forEach(folder => {
        filteredBookmarks[folder] = appData.bookmarks[folder].filter(bookmark => 
            !filter || 
            bookmark.name.toLowerCase().includes(filter.toLowerCase()) || 
            bookmark.url.toLowerCase().includes(filter.toLowerCase())
        );
        
        // 只保留有书签的文件夹
        if (filteredBookmarks[folder].length === 0) {
            delete filteredBookmarks[folder];
        }
    });
    
    // 如果没有匹配的书签
    if (Object.keys(filteredBookmarks).length === 0) {
        container.innerHTML = '<div class="no-bookmarks">没有找到匹配的书签</div>';
        return;
    }
    
    // 创建文件夹和书签
    Object.keys(filteredBookmarks).forEach(folder => {
        const folderElement = document.createElement('div');
        folderElement.className = 'bookmark-folder folder-expanded';
        
        const folderHeader = document.createElement('div');
        folderHeader.className = 'folder-header';
        folderHeader.innerHTML = `
            <div class="folder-title">
                <span class="folder-icon">📁</span>
                <span>${folder === 'default' ? '默认文件夹' : folder}</span>
                <span>(${filteredBookmarks[folder].length})</span>
            </div>
            <span class="folder-toggle">−</span>
        `;
        
        folderHeader.addEventListener('click', () => {
            folderElement.classList.toggle('folder-expanded');
            const toggle = folderHeader.querySelector('.folder-toggle');
            toggle.textContent = folderElement.classList.contains('folder-expanded') ? '−' : '+';
        });
        
        const folderContent = document.createElement('div');
        folderContent.className = 'folder-content';
        
        filteredBookmarks[folder].forEach(bookmark => {
            const bookmarkElement = document.createElement('div');
            bookmarkElement.className = 'bookmark-item';
            bookmarkElement.title = bookmark.url;
            
            // 尝试获取 favicon，失败则显示首字母
            let faviconHtml = '';
            if (bookmark.url) {
                try {
                    const url = new URL(bookmark.url);
                    const faviconUrl = `${url.protocol}//${url.hostname}/favicon.ico`;
                    faviconHtml = `<img src="${faviconUrl}" class="bookmark-favicon" onerror="this.style.display='none'">`;
                } catch (e) {
                    console.error('Invalid URL for favicon:', bookmark.url);
                }
            }
            
            // 如果没有 favicon，显示首字母
            const firstLetter = bookmark.name.charAt(0).toUpperCase();
            faviconHtml += `<span class="bookmark-letter" style="display: none;">${firstLetter}</span>`;
            
            bookmarkElement.innerHTML = `
                <div class="bookmark-icon">
                    ${faviconHtml}
                </div>
                <div class="bookmark-name">${bookmark.name}</div>
            `;
            
            bookmarkElement.addEventListener('click', () => {
                window.open(bookmark.url, '_blank');
            });
            
            folderContent.appendChild(bookmarkElement);
        });
        
        folderElement.appendChild(folderHeader);
        folderElement.appendChild(folderContent);
        container.appendChild(folderElement);
    });
}

// 在编辑中心渲染书签
function renderEditBookmarks() {
    const container = document.getElementById('edit-bookmarks-container');
    container.innerHTML = '';
    
    // 清空文件夹选择下拉框
    elements.newBookmarkFolder.innerHTML = '';
    
    // 添加所有文件夹到下拉框
    Object.keys(appData.bookmarks).forEach(folder => {
        const option = document.createElement('option');
        option.value = folder;
        option.textContent = folder === 'default' ? '默认文件夹' : folder;
        elements.newBookmarkFolder.appendChild(option);
    });
    
    // 添加新建文件夹选项
    const newFolderOption = document.createElement('option');
    newFolderOption.value = '__new__';
    newFolderOption.textContent = '+ 新建文件夹';
    elements.newBookmarkFolder.appendChild(newFolderOption);
    
    // 监听文件夹选择变化
    elements.newBookmarkFolder.addEventListener('change', function() {
        if (this.value === '__new__') {
            const folderName = prompt('请输入新文件夹名称:');
            if (folderName && folderName.trim()) {
                const trimmedName = folderName.trim();
                if (!appData.bookmarks[trimmedName]) {
                    appData.bookmarks[trimmedName] = [];
                    this.value = trimmedName;
                    
                    // 更新下拉框
                    renderEditBookmarks();
                } else {
                    alert('该文件夹已存在');
                    this.value = 'default';
                }
            } else {
                this.value = 'default';
            }
        }
    });
    
    // 渲染所有书签
    Object.keys(appData.bookmarks).forEach(folder => {
        if (appData.bookmarks[folder].length === 0) return;
        
        const folderLabel = document.createElement('h3');
        folderLabel.textContent = folder === 'default' ? '默认文件夹' : folder;
        container.appendChild(folderLabel);
        
        appData.bookmarks[folder].forEach((bookmark, index) => {
            const bookmarkElement = document.createElement('div');
            bookmarkElement.className = 'edit-bookmark-item';
            bookmarkElement.innerHTML = `
                <div class="edit-bookmark-info">
                    <div class="bookmark-icon" style="width: 24px; height: 24px;">
                        ${bookmark.url ? `<img src="${new URL(bookmark.url).protocol}//${new URL(bookmark.url).hostname}/favicon.ico" class="bookmark-favicon" onerror="this.style.display='none'">` : ''}
                        <span class="bookmark-letter" style="display: none;">${bookmark.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <div>${bookmark.name}</div>
                        <div style="font-size: 12px; opacity: 0.7;">${bookmark.url}</div>
                    </div>
                </div>
                <div class="edit-bookmark-actions">
                    <button class="edit-bookmark-btn edit" data-folder="${folder}" data-index="${index}">✏️</button>
                    <button class="edit-bookmark-btn delete" data-folder="${folder}" data-index="${index}">🗑️</button>
                </div>
            `;
            
            container.appendChild(bookmarkElement);
        });
    });
    
    // 添加编辑和删除事件监听
    document.querySelectorAll('.edit-bookmark-btn.edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const folder = e.currentTarget.getAttribute('data-folder');
            const index = parseInt(e.currentTarget.getAttribute('data-index'));
            editBookmark(folder, index);
        });
    });
    
    document.querySelectorAll('.edit-bookmark-btn.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const folder = e.currentTarget.getAttribute('data-folder');
            const index = parseInt(e.currentTarget.getAttribute('data-index'));
            if (confirm(`确定要删除书签 "${appData.bookmarks[folder][index].name}" 吗？`)) {
                deleteBookmark(folder, index);
            }
        });
    });
}

// 保存新书签
function saveNewBookmark() {
    const name = elements.newBookmarkName.value.trim();
    let url = elements.newBookmarkUrl.value.trim();
    let folder = elements.newBookmarkFolder.value;
    
    if (!name || !url) {
        showToast('请填写书签名称和 URL');
        return;
    }
    
    // 确保 URL 有协议
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    // 检查是否已存在相同 URL 的书签
    let isDuplicate = false;
    Object.keys(appData.bookmarks).forEach(f => {
        appData.bookmarks[f].forEach(b => {
            if (b.url === url) {
                isDuplicate = true;
            }
        });
    });
    
    if (isDuplicate) {
        if (!confirm('已存在相同 URL 的书签，是否继续添加？')) {
            return;
        }
    }
    
    // 确保文件夹存在
    if (!appData.bookmarks[folder]) {
        appData.bookmarks[folder] = [];
    }
    
    // 添加新书签
    appData.bookmarks[folder].push({
        name,
        url
    });
    
    // 更新界面
    elements.addBookmarkModal.style.display = 'none';
    showToast('书签添加成功');
    renderEditBookmarks();
    updateBookmarkCount();
}

// 编辑书签
function editBookmark(folder, index) {
    const bookmark = appData.bookmarks[folder][index];
    const newName = prompt('编辑书签名称:', bookmark.name);
    if (newName === null) return; // 用户取消
    
    let newUrl = prompt('编辑书签 URL:', bookmark.url);
    if (newUrl === null) return; // 用户取消
    
    newUrl = newUrl.trim();
    const trimmedName = newName.trim();
    
    if (!trimmedName || !newUrl) {
        showToast('名称和 URL 不能为空');
        return;
    }
    
    // 确保 URL 有协议
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
        newUrl = 'https://' + newUrl;
    }
    
    // 更新书签
    appData.bookmarks[folder][index] = {
        name: trimmedName,
        url: newUrl
    };
    
    showToast('书签更新成功');
    renderEditBookmarks();
}

// 删除书签
function deleteBookmark(folder, index) {
    appData.bookmarks[folder].splice(index, 1);
    
    // 如果文件夹为空，删除文件夹
    if (appData.bookmarks[folder].length === 0 && folder !== 'default') {
        delete appData.bookmarks[folder];
    }
    
    showToast('书签已删除');
    renderEditBookmarks();
    updateBookmarkCount();
}

// 导入书签
function importBookmarksFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            const bookmarks = doc.querySelectorAll('a');
            
            if (bookmarks.length === 0) {
                showToast('未找到书签数据');
                return;
            }
            
            let importedCount = 0;
            let duplicateCount = 0;
            
            bookmarks.forEach(bookmark => {
                const name = bookmark.textContent.trim();
                let url = bookmark.getAttribute('href');
                
                if (!name || !url) return;
                
                // 过滤无效链接
                if (url.startsWith('javascript:') || url.startsWith('data:')) return;
                
                // 确保 URL 有协议
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                }
                
                // 检查是否重复
                let isDuplicate = false;
                Object.keys(appData.bookmarks).forEach(folder => {
                    appData.bookmarks[folder].forEach(b => {
                        if (b.url === url) {
                            isDuplicate = true;
                        }
                    });
                });
                
                if (isDuplicate) {
                    duplicateCount++;
                    return;
                }
                
                // 获取文件夹（从父节点获取）
                let folder = 'default';
                let parent = bookmark.parentNode;
                while (parent && parent.tagName !== 'DL') {
                    if (parent.tagName === 'H3') {
                        folder = parent.textContent.trim();
                        break;
                    }
                    parent = parent.parentNode;
                }
                
                // 确保文件夹存在
                if (!appData.bookmarks[folder]) {
                    appData.bookmarks[folder] = [];
                }
                
                // 添加书签
                appData.bookmarks[folder].push({ name, url });
                importedCount++;
            });
            
            showToast(`导入完成: 新增 ${importedCount} 个书签，跳过 ${duplicateCount} 个重复书签`);
            renderEditBookmarks();
            updateBookmarkCount();
            
            // 重置文件输入
            elements.bookmarkImportFile.value = '';
        } catch (error) {
            console.error('Error importing bookmarks:', error);
            showToast(`导入失败: ${error.message}`);
        }
    };
    
    reader.readAsText(file);
}

// 导出书签
function exportBookmarksToFile() {
    // 创建 HTML 书签格式
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>书签导出</TITLE>
<H1>书签</H1>
<DL><p>`;
    
    // 添加文件夹和书签
    Object.keys(appData.bookmarks).forEach(folder => {
        html += `<DT><H3>${folder === 'default' ? '默认文件夹' : folder}</H3>
<DL><p>`;
        
        appData.bookmarks[folder].forEach(bookmark => {
            html += `<DT><A HREF="${bookmark.url}">${bookmark.name}</A><p>`;
        });
        
        html += `</DL><p>`;
    });
    
    html += `</DL><p>`;
    
    // 创建下载
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmarks-export-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('书签导出成功');
}

// 渲染城市时钟
function renderCities() {
    elements.citiesContainer.innerHTML = '';
    
    appData.cities.forEach(city => {
        const cityElement = document.createElement('div');
        cityElement.className = 'city-time';
        cityElement.innerHTML = `
            <span>${city.name}</span>
            <span class="city-clock" data-timezone="${city.timezone}"></span>
        `;
        elements.citiesContainer.appendChild(cityElement);
    });
    
    updateWorldClock();
}

// 在编辑中心渲染城市列表
function renderEditCities() {
    elements.citiesList.innerHTML = '';
    
    appData.cities.forEach((city, index) => {
        const cityElement = document.createElement('div');
        cityElement.className = 'city-item';
        cityElement.innerHTML = `
            <div>
                <strong>${city.name}</strong>
                <div style="font-size: 12px; opacity: 0.7;">${city.timezone}</div>
            </div>
            <button class="delete-city btn danger" data-index="${index}">删除</button>
        `;
        elements.citiesList.appendChild(cityElement);
    });
    
    // 添加删除事件监听
    document.querySelectorAll('.delete-city').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.getAttribute('data-index'));
            if (confirm(`确定要删除城市 "${appData.cities[index].name}" 吗？`)) {
                appData.cities.splice(index, 1);
                renderEditCities();
                renderCities();
                showToast('城市已删除');
            }
        });
    });
}

// 添加新城市
function addNewCity() {
    const name = elements.cityName.value.trim();
    const timezone = elements.cityTimezone.value.trim();
    
    if (!name || !timezone) {
        showToast('请填写城市名称和时区');
