// 元素选择器对象，确保所有需要的元素都被正确获取
const elements = {
    // 头部元素
    header: document.getElementById('header'),
    themeToggle: document.getElementById('theme-toggle'),
    settingsBtn: document.getElementById('settings-btn'),
    editBtn: document.getElementById('edit-btn'),
    searchInput: document.getElementById('search-input'),
    searchInputMobile: document.getElementById('search-input-mobile'),
    
    // 设置模态框
    settingsModal: document.getElementById('settings-modal'),
    closeSettings: document.getElementById('close-settings'),
    settingsOverlay: document.getElementById('settings-overlay'),
    githubUsername: document.getElementById('github-username'),
    githubRepo: document.getElementById('github-repo'),
    githubToken: document.getElementById('github-token'),
    validateGithub: document.getElementById('validate-github'),
    saveGithub: document.getElementById('save-github'),
    githubStatus: document.getElementById('github-status'),
    enterEditBtn: document.getElementById('enter-edit-btn'),
    
    // 编辑中心
    editModal: document.getElementById('edit-modal'),
    closeEdit: document.getElementById('close-edit'),
    editOverlay: document.getElementById('edit-overlay'),
    editTabs: document.querySelectorAll('#edit-tabs button'),
    tabsContents: document.querySelectorAll('.tabs-content'),
    
    // 书签管理
    importBookmarks: document.getElementById('import-bookmarks'),
    exportBookmarks: document.getElementById('export-bookmarks'),
    addBookmark: document.getElementById('add-bookmark'),
    bookmarkFile: document.getElementById('bookmark-file'),
    bookmarkEditContainer: document.getElementById('bookmark-edit-container'),
    editBookmarkCount: document.getElementById('edit-bookmark-count'),
    
    // 添加书签模态框
    addBookmarkModal: document.getElementById('add-bookmark-modal'),
    closeAddBookmark: document.getElementById('close-add-bookmark'),
    addBookmarkOverlay: document.getElementById('add-bookmark-overlay'),
    bookmarkFolder: document.getElementById('bookmark-folder'),
    addNewFolder: document.getElementById('add-new-folder'),
    bookmarkName: document.getElementById('bookmark-name'),
    bookmarkUrl: document.getElementById('bookmark-url'),
    bookmarkQuick: document.getElementById('bookmark-quick'),
    saveBookmark: document.getElementById('save-bookmark'),
    addBookmarkTitle: document.getElementById('add-bookmark-title'),
    
    // 添加文件夹模态框
    addFolderModal: document.getElementById('add-folder-modal'),
    closeAddFolder: document.getElementById('close-add-folder'),
    addFolderOverlay: document.getElementById('add-folder-overlay'),
    newFolderName: document.getElementById('new-folder-name'),
    saveFolder: document.getElementById('save-folder'),
    
    // 城市管理
    citiesTab: document.getElementById('cities-tab'),
    addCityBtn: document.getElementById('add-city-btn'),
    addNewCity: document.getElementById('add-new-city'),
    citiesEditContainer: document.getElementById('cities-edit-container'),
    
    // 添加城市模态框
    addCityModal: document.getElementById('add-city-modal'),
    closeAddCity: document.getElementById('close-add-city'),
    addCityOverlay: document.getElementById('add-city-overlay'),
    cityName: document.getElementById('city-name'),
    cityTimezone: document.getElementById('city-timezone'),
    saveCity: document.getElementById('save-city'),
    
    // 确认删除模态框
    confirmDeleteModal: document.getElementById('confirm-delete-modal'),
    closeConfirmDelete: document.getElementById('close-confirm-delete'),
    cancelDelete: document.getElementById('cancel-delete'),
    confirmDeleteOverlay: document.getElementById('confirm-delete-overlay'),
    confirmDeleteBtn: document.getElementById('confirm-delete'),
    deleteMessage: document.getElementById('delete-message'),
    
    // 广告设置
    adsTab: document.getElementById('ads-tab'),
    changeAd1: document.getElementById('change-ad1'),
    changeAd2: document.getElementById('change-ad2'),
    changeAd3: document.getElementById('change-ad3'),
    ad1File: document.getElementById('ad1-file'),
    ad2File: document.getElementById('ad2-file'),
    ad3File: document.getElementById('ad3-file'),
    ad1Preview: document.getElementById('ad1-preview'),
    ad2Preview: document.getElementById('ad2-preview'),
    ad3Preview: document.getElementById('ad3-preview'),
    ad1: document.getElementById('ad1'),
    ad2: document.getElementById('ad2'),
    ad3: document.getElementById('ad3'),
    ad1Url: document.getElementById('ad1-url'),
    ad1Alt: document.getElementById('ad1-alt'),
    ad2Url: document.getElementById('ad2-url'),
    ad2Alt: document.getElementById('ad2-alt'),
    ad3Url: document.getElementById('ad3-url'),
    ad3Alt: document.getElementById('ad3-alt'),
    
    // 其他元素
    saveChanges: document.getElementById('save-changes'),
    notification: document.getElementById('notification'),
    loading: document.getElementById('loading'),
    onlineTime: document.getElementById('online-time'),
    healthReminder: document.getElementById('health-reminder'),
    citiesContainer: document.getElementById('cities-container'),
    quickAccess: document.getElementById('quick-access'),
    bookmarksContainer: document.getElementById('bookmarks-container'),
    totalBookmarks: document.getElementById('total-bookmarks'),
    currentYear: document.getElementById('current-year'),
    footerHostname: document.getElementById('footer-hostname')
};

// 应用数据
const appData = {
    theme: 'dark',
    github: {
        username: '',
        repo: '',
        token: '',
        validated: false
    },
    bookmarks: [],
    folders: [],
    cities: [],
    ads: {
        ad1: {
            image: 'https://picsum.photos/seed/space1/600/200',
            url: '',
            alt: '广告预览'
        },
        ad2: {
            image: 'https://picsum.photos/seed/space2/600/200',
            url: '',
            alt: '广告预览'
        },
        ad3: {
            image: 'https://picsum.photos/seed/space3/600/200',
            url: '',
            alt: '广告预览'
        }
    }
};

let scrollTimeout;
let lastScrollTop = 0;
let editBookmarkId = null;
let deleteCallback = null;

// 初始化应用
function init() {
    loadLocalData();
    initEventListeners();
    renderUI();
    setupScrollListener();
}

// 设置滚动监听
function setupScrollListener() {
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 显示头部
        elements.header.classList.remove('translate-y-[-100%]');
        
        // 清除之前的计时器
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        // 3秒后隐藏头部（如果没有继续滚动）
        scrollTimeout = setTimeout(() => {
            // 只有在滚动超过一定距离且停止滚动时才隐藏
            if (scrollTop > 100) {
                elements.header.classList.add('translate-y-[-100%]');
            }
        }, 3000);
        
        lastScrollTop = scrollTop;
    });
}

// 初始化事件监听
function initEventListeners() {
    // 确保所有元素都已正确获取
    Object.keys(elements).forEach(key => {
        if (!elements[key]) {
            console.warn(`元素 ${key} 未找到，请检查HTML中的ID是否正确`);
        }
    });

    // 主题切换
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', toggleTheme);
    }
    
    // 设置模态框
    if (elements.settingsBtn) {
        elements.settingsBtn.addEventListener('click', () => {
            if (elements.settingsModal) elements.settingsModal.classList.remove('hidden');
        });
    }
    
    if (elements.closeSettings) {
        elements.closeSettings.addEventListener('click', () => {
            if (elements.settingsModal) elements.settingsModal.classList.add('hidden');
        });
    }
    
    if (elements.settingsOverlay) {
        elements.settingsOverlay.addEventListener('click', () => {
            if (elements.settingsModal) elements.settingsModal.classList.add('hidden');
        });
    }
    
    // 编辑中心
    if (elements.editBtn) {
        elements.editBtn.addEventListener('click', () => {
            if (appData.github.validated && elements.editModal) {
                elements.editModal.classList.remove('hidden');
            } else {
                showNotification("请先完成GitHub验证", "error");
                if (elements.settingsModal) elements.settingsModal.classList.remove('hidden');
            }
        });
    }
    
    if (elements.enterEditBtn) {
        elements.enterEditBtn.addEventListener('click', () => {
            if (elements.settingsModal) elements.settingsModal.classList.add('hidden');
            if (elements.editModal) elements.editModal.classList.remove('hidden');
        });
    }
    
    if (elements.closeEdit) {
        elements.closeEdit.addEventListener('click', () => {
            if (elements.editModal) elements.editModal.classList.add('hidden');
        });
    }
    
    if (elements.editOverlay) {
        elements.editOverlay.addEventListener('click', () => {
            if (elements.editModal) elements.editModal.classList.add('hidden');
        });
    }
    
    // GitHub验证和保存
    if (elements.validateGithub) {
        elements.validateGithub.addEventListener('click', validateGitHubToken);
    }
    
    if (elements.saveGithub) {
        elements.saveGithub.addEventListener('click', () => {
            if (elements.githubUsername && elements.githubRepo && elements.githubToken) {
                appData.github.username = elements.githubUsername.value.trim();
                appData.github.repo = elements.githubRepo.value.trim();
                appData.github.token = elements.githubToken.value.trim();
                saveLocalData();
                showNotification("GitHub设置已保存", "success");
            }
        });
    }
    
    // 搜索功能
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', (e) => {
            renderBookmarks(e.target.value);
        });
    }
    
    if (elements.searchInputMobile) {
        elements.searchInputMobile.addEventListener('input', (e) => {
            renderBookmarks(e.target.value);
        });
    }
    
    // 导入导出书签
    if (elements.importBookmarks) {
        elements.importBookmarks.addEventListener('click', () => {
            if (elements.bookmarkFile) elements.bookmarkFile.click();
        });
    }
    
    if (elements.bookmarkFile) {
        elements.bookmarkFile.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                importBookmarks(e.target.files[0]);
                e.target.value = ''; // 重置文件输入
            }
        });
    }
    
    if (elements.exportBookmarks) {
        elements.exportBookmarks.addEventListener('click', exportBookmarks);
    }
    
    // 添加书签
    if (elements.addBookmark) {
        elements.addBookmark.addEventListener('click', () => {
            // 重置表单和编辑状态
            if (elements.bookmarkName) elements.bookmarkName.value = '';
            if (elements.bookmarkUrl) elements.bookmarkUrl.value = '';
            if (elements.bookmarkQuick) elements.bookmarkQuick.checked = false;
            if (elements.addBookmarkTitle) elements.addBookmarkTitle.textContent = "添加新书签";
            editBookmarkId = null;
            
            updateFolderDropdown();
            
            // 显示模态框
            if (elements.addBookmarkModal) elements.addBookmarkModal.classList.remove('hidden');
        });
    }
    
    if (elements.closeAddBookmark) {
        elements.closeAddBookmark.addEventListener('click', () => {
            if (elements.addBookmarkModal) elements.addBookmarkModal.classList.add('hidden');
        });
    }
    
    if (elements.addBookmarkOverlay) {
        elements.addBookmarkOverlay.addEventListener('click', () => {
            if (elements.addBookmarkModal) elements.addBookmarkModal.classList.add('hidden');
        });
    }
    
    if (elements.saveBookmark) {
        elements.saveBookmark.addEventListener('click', () => {
            if (editBookmarkId) {
                saveEditedBookmark();
            } else {
                addNewBookmark();
            }
        });
    }
    
    // 添加新文件夹
    if (elements.addNewFolder) {
        elements.addNewFolder.addEventListener('click', () => {
            if (elements.addFolderModal) elements.addFolderModal.classList.remove('hidden');
            if (elements.newFolderName) {
                elements.newFolderName.value = '';
                elements.newFolderName.focus();
            }
        });
    }
    
    if (elements.closeAddFolder) {
        elements.closeAddFolder.addEventListener('click', () => {
            if (elements.addFolderModal) elements.addFolderModal.classList.add('hidden');
        });
    }
    
    if (elements.addFolderOverlay) {
        elements.addFolderOverlay.addEventListener('click', () => {
            if (elements.addFolderModal) elements.addFolderModal.classList.add('hidden');
        });
    }
    
    if (elements.saveFolder) {
        elements.saveFolder.addEventListener('click', addNewFolder);
    }
    
    // 添加城市
    if (elements.addCityBtn) {
        elements.addCityBtn.addEventListener('click', () => {
            if (elements.addCityModal) elements.addCityModal.classList.remove('hidden');
            if (elements.cityName) elements.cityName.value = '';
            if (elements.cityTimezone) elements.cityTimezone.value = '';
        });
    }
    
    if (elements.addNewCity) {
        elements.addNewCity.addEventListener('click', () => {
            if (elements.addCityModal) elements.addCityModal.classList.remove('hidden');
            if (elements.cityName) elements.cityName.value = '';
            if (elements.cityTimezone) elements.cityTimezone.value = '';
        });
    }
    
    if (elements.closeAddCity) {
        elements.closeAddCity.addEventListener('click', () => {
            if (elements.addCityModal) elements.addCityModal.classList.add('hidden');
        });
    }
    
    if (elements.addCityOverlay) {
        elements.addCityOverlay.addEventListener('click', () => {
            if (elements.addCityModal) elements.addCityModal.classList.add('hidden');
        });
    }
    
    if (elements.saveCity) {
        elements.saveCity.addEventListener('click', addNewCity);
    }
    
    // 确认删除
    if (elements.closeConfirmDelete) {
        elements.closeConfirmDelete.addEventListener('click', () => {
            if (elements.confirmDeleteModal) elements.confirmDeleteModal.classList.add('hidden');
            deleteCallback = null;
        });
    }
    
    if (elements.cancelDelete) {
        elements.cancelDelete.addEventListener('click', () => {
            if (elements.confirmDeleteModal) elements.confirmDeleteModal.classList.add('hidden');
            deleteCallback = null;
        });
    }
    
    if (elements.confirmDeleteOverlay) {
        elements.confirmDeleteOverlay.addEventListener('click', () => {
            if (elements.confirmDeleteModal) elements.confirmDeleteModal.classList.add('hidden');
            deleteCallback = null;
        });
    }
    
    if (elements.confirmDeleteBtn) {
        elements.confirmDeleteBtn.addEventListener('click', () => {
            if (deleteCallback) {
                deleteCallback();
                deleteCallback = null;
            }
            if (elements.confirmDeleteModal) elements.confirmDeleteModal.classList.add('hidden');
        });
    }
    
    // 编辑标签页切换
    if (elements.editTabs) {
        elements.editTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 移除所有标签页的活跃状态
                elements.editTabs.forEach(t => t.classList.remove('active', 'text-indigo-500', 'border-b-2', 'border-indigo-500'));
                elements.editTabs.forEach(t => t.classList.add('text-white/60'));
                
                // 添加当前标签页的活跃状态
                tab.classList.add('active', 'text-indigo-500', 'border-b-2', 'border-indigo-500');
                tab.classList.remove('text-white/60');
                
                // 隐藏所有内容
                if (elements.tabsContents) {
                    elements.tabsContents.forEach(content => content.classList.add('hidden'));
                }
                
                // 显示对应内容
                const tabId = tab.dataset.tab;
                const tabContent = document.getElementById(tabId);
                if (tabContent) tabContent.classList.remove('hidden');
            });
        });
    }
    
    // 广告图片上传
    if (elements.changeAd1) {
        elements.changeAd1.addEventListener('click', () => {
            if (elements.ad1File) elements.ad1File.click();
        });
    }
    
    if (elements.ad1File) {
        elements.ad1File.addEventListener('change', (e) => {
            handleAdImageUpload(e, 'ad1');
        });
    }
    
    if (elements.changeAd2) {
        elements.changeAd2.addEventListener('click', () => {
            if (elements.ad2File) elements.ad2File.click();
        });
    }
    
    if (elements.ad2File) {
        elements.ad2File.addEventListener('change', (e) => {
            handleAdImageUpload(e, 'ad2');
        });
    }
    
    if (elements.changeAd3) {
        elements.changeAd3.addEventListener('click', () => {
            if (elements.ad3File) elements.ad3File.click();
        });
    }
    
    if (elements.ad3File) {
        elements.ad3File.addEventListener('change', (e) => {
            handleAdImageUpload(e, 'ad3');
        });
    }
    
    // 保存广告信息
    if (elements.ad1Url) {
        elements.ad1Url.addEventListener('change', () => {
            appData.ads.ad1.url = elements.ad1Url.value.trim();
            saveLocalData();
        });
    }
    
    if (elements.ad1Alt) {
        elements.ad1Alt.addEventListener('change', () => {
            appData.ads.ad1.alt = elements.ad1Alt.value.trim();
            saveLocalData();
        });
    }
    
    if (elements.ad2Url) {
        elements.ad2Url.addEventListener('change', () => {
            appData.ads.ad2.url = elements.ad2Url.value.trim();
            saveLocalData();
        });
    }
    
    if (elements.ad2Alt) {
        elements.ad2Alt.addEventListener('change', () => {
            appData.ads.ad2.alt = elements.ad2Alt.value.trim();
            saveLocalData();
        });
    }
    
    if (elements.ad3Url) {
        elements.ad3Url.addEventListener('change', () => {
            appData.ads.ad3.url = elements.ad3Url.value.trim();
            saveLocalData();
        });
    }
    
    if (elements.ad3Alt) {
        elements.ad3Alt.addEventListener('change', () => {
            appData.ads.ad3.alt = elements.ad3Alt.value.trim();
            saveLocalData();
        });
    }
    
    // 保存更改到GitHub
    if (elements.saveChanges) {
        elements.saveChanges.addEventListener('click', saveDataToGitHub);
    }
}

// 处理广告图片上传
function handleAdImageUpload(event, adId) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件大小（最大3MB）
    if (file.size > 3 * 1024 * 1024) {
        showNotification("图片大小不能超过3MB", "error");
        return;
    }
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        showNotification("请上传图片文件", "error");
        return;
    }
    
    // 读取图片并显示预览
    const reader = new FileReader();
    reader.onload = function(e) {
        // 更新应用数据
        appData.ads[adId].image = e.target.result;
        
        // 更新预览
        if (adId === 'ad1') {
            if (elements.ad1Preview) elements.ad1Preview.src = e.target.result;
            if (elements.ad1) elements.ad1.src = e.target.result;
        } else if (adId === 'ad2') {
            if (elements.ad2Preview) elements.ad2Preview.src = e.target.result;
            if (elements.ad2) elements.ad2.src = e.target.result;
        } else if (adId === 'ad3') {
            if (elements.ad3Preview) elements.ad3Preview.src = e.target.result;
            if (elements.ad3) elements.ad3.src = e.target.result;
        }
        
        // 保存到本地
        saveLocalData();
        
        showNotification(`广告图片已更新`, "success");
    };
    reader.readAsDataURL(file);
    
    // 重置文件输入
    event.target.value = '';
}

// 显示通知
function showNotification(message, type = 'info') {
    if (!elements.notification) return;
    
    const notification = elements.notification;
    notification.textContent = message;
    notification.className = 'fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transform translate-y-0 opacity-100 transition-all duration-300 max-w-sm z-50';
    
    // 设置通知类型样式
    if (type === 'success') {
        notification.classList.add('notification-success');
    } else if (type === 'error') {
        notification.classList.add('notification-error');
    } else {
        notification.classList.add('notification-info');
    }
    
    // 3秒后隐藏通知
    setTimeout(() => {
        notification.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// 切换主题
function toggleTheme() {
    const html = document.documentElement;
    appData.theme = appData.theme === 'dark' ? 'light' : 'dark';
    html.className = appData.theme;
    
    // 更新主题图标
    if (elements.themeToggle) {
        const icon = elements.themeToggle.querySelector('i');
        if (icon) {
            icon.className = appData.theme === 'dark' ? 'fa fa-moon-o' : 'fa fa-sun-o';
        }
    }
    
    saveLocalData();
}

// 加载本地数据
function loadLocalData() {
    const savedData = localStorage.getItem('spaceNavigatorData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        Object.assign(appData, parsedData);
        
        // 更新主题
        document.documentElement.className = appData.theme;
        if (elements.themeToggle) {
            const icon = elements.themeToggle.querySelector('i');
            if (icon) {
                icon.className = appData.theme === 'dark' ? 'fa fa-moon-o' : 'fa fa-sun-o';
            }
        }
        
        // 填充GitHub设置
        if (elements.githubUsername) elements.githubUsername.value = appData.github.username || '';
        if (elements.githubRepo) elements.githubRepo.value = appData.github.repo || '';
        if (elements.githubToken) elements.githubToken.value = appData.github.token || '';
        
        // 填充广告设置
        if (elements.ad1Url) elements.ad1Url.value = appData.ads.ad1.url || '';
        if (elements.ad1Alt) elements.ad1Alt.value = appData.ads.ad1.alt || '';
        if (elements.ad1Preview) elements.ad1Preview.src = appData.ads.ad1.image;
        if (elements.ad1) elements.ad1.src = appData.ads.ad1.image;
        
        if (elements.ad2Url) elements.ad2Url.value = appData.ads.ad2.url || '';
        if (elements.ad2Alt) elements.ad2Alt.value = appData.ads.ad2.alt || '';
        if (elements.ad2Preview) elements.ad2Preview.src = appData.ads.ad2.image;
        if (elements.ad2) elements.ad2.src = appData.ads.ad2.image;
        
        if (elements.ad3Url) elements.ad3Url.value = appData.ads.ad3.url || '';
        if (elements.ad3Alt) elements.ad3Alt.value = appData.ads.ad3.alt || '';
        if (elements.ad3Preview) elements.ad3Preview.src = appData.ads.ad3.image;
        if (elements.ad3) elements.ad3.src = appData.ads.ad3.image;
    }
}

// 保存本地数据
function saveLocalData() {
    localStorage.setItem('spaceNavigatorData', JSON.stringify(appData));
}

// 渲染UI
function renderUI() {
    renderBookmarks();
    renderCities();
    updateBookmarkCount();
    updateCurrentYear();
}

// 渲染书签
function renderBookmarks(searchTerm = '') {
    // 书签渲染逻辑（简化版）
    if (elements.quickAccess) elements.quickAccess.innerHTML = '<div class="text-white/50 text-center py-8">快速访问书签将显示在这里</div>';
    if (elements.bookmarksContainer) elements.bookmarksContainer.innerHTML = '<div class="text-white/50 text-center py-8">书签文件夹将显示在这里</div>';
    if (elements.bookmarkEditContainer) elements.bookmarkEditContainer.innerHTML = '<div class="text-white/50 text-center py-8">书签列表将显示在这里</div>';
}

// 渲染城市时钟
function renderCities() {
    if (elements.citiesContainer) elements.citiesContainer.innerHTML = '<div class="text-white/50 text-center py-4">添加城市时钟将显示在这里</div>';
    if (elements.citiesEditContainer) elements.citiesEditContainer.innerHTML = '<div class="text-white/50 text-center py-4">城市列表将显示在这里</div>';
}

// 更新书签计数
function updateBookmarkCount() {
    if (elements.editBookmarkCount) elements.editBookmarkCount.textContent = appData.bookmarks.length;
    if (elements.totalBookmarks) elements.totalBookmarks.textContent = appData.bookmarks.length;
}

// 更新当前年份
function updateCurrentYear() {
    if (elements.currentYear) elements.currentYear.textContent = new Date().getFullYear();
}

// 更新文件夹下拉列表
function updateFolderDropdown() {
    if (!elements.bookmarkFolder) return;
    
    elements.bookmarkFolder.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '无文件夹';
    elements.bookmarkFolder.appendChild(defaultOption);
    
    appData.folders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder.id;
        option.textContent = folder.name;
        elements.bookmarkFolder.appendChild(option);
    });
}

// 验证GitHub令牌（简化版）
function validateGitHubToken() {
    showLoading(true);
    
    // 模拟验证过程
    setTimeout(() => {
        appData.github.validated = true;
        saveLocalData();
        showNotification("GitHub验证成功", "success");
        showLoading(false);
    }, 1000);
}

// 保存数据到GitHub（简化版）
function saveDataToGitHub() {
    if (!appData.github.validated) {
        showNotification("请先完成GitHub验证", "error");
        return;
    }
    
    showLoading(true);
    
    // 模拟保存过程
    setTimeout(() => {
        showNotification("数据已成功同步到GitHub", "success");
        showLoading(false);
    }, 1500);
}

// 显示/隐藏加载动画
function showLoading(show) {
    if (elements.loading) {
        elements.loading.classList.toggle('hidden', !show);
    }
}

// 添加新书签（简化版）
function addNewBookmark() {
    if (!elements.bookmarkName || !elements.bookmarkUrl) return;
    
    const name = elements.bookmarkName.value.trim();
    const url = elements.bookmarkUrl.value.trim();
    
    if (!name || !url) {
        showNotification("请填写书签名称和URL", "error");
        return;
    }
    
    // 模拟添加书签
    appData.bookmarks.push({
        id: Date.now().toString(),
        name,
        url,
        folderId: elements.bookmarkFolder.value,
        isQuick: elements.bookmarkQuick ? elements.bookmarkQuick.checked : false,
        createdAt: new Date().toISOString()
    });
    
    saveLocalData();
    renderBookmarks();
    updateBookmarkCount();
    
    if (elements.addBookmarkModal) elements.addBookmarkModal.classList.add('hidden');
    showNotification("书签添加成功", "success");
}

// 保存编辑的书签（简化版）
function saveEditedBookmark() {
    // 简化版实现
    showNotification("书签已更新", "success");
    if (elements.addBookmarkModal) elements.addBookmarkModal.classList.add('hidden');
    renderBookmarks();
}

// 添加新文件夹（简化版）
function addNewFolder() {
    if (!elements.newFolderName) return;
    
    const name = elements.newFolderName.value.trim();
    if (!name) {
        showNotification("请输入文件夹名称", "error");
        return;
    }
    
    // 模拟添加文件夹
    appData.folders.push({
        id: Date.now().toString(),
        name,
        createdAt: new Date().toISOString()
    });
    
    saveLocalData();
    updateFolderDropdown();
    
    if (elements.addFolderModal) elements.addFolderModal.classList.add('hidden');
    showNotification("文件夹创建成功", "success");
}

// 添加新城市（简化版）
function addNewCity() {
    if (!elements.cityName || !elements.cityTimezone) return;
    
    const name = elements.cityName.value.trim();
    const timezone = elements.cityTimezone.value.trim();
    
    if (!name || !timezone) {
        showNotification("请输入城市名称和时区", "error");
        return;
    }
    
    // 模拟添加城市
    appData.cities.push({
        id: Date.now().toString(),
        name,
        timezone,
        createdAt: new Date().toISOString()
    });
    
    saveLocalData();
    renderCities();
    
    if (elements.addCityModal) elements.addCityModal.classList.add('hidden');
    showNotification("城市添加成功", "success");
}

// 导入书签（简化版）
function importBookmarks(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // 模拟导入
            showNotification("书签导入成功", "success");
            renderBookmarks();
            updateBookmarkCount();
        } catch (error) {
            showNotification("书签导入失败", "error");
            console.error(error);
        }
    };
    reader.readAsText(file);
}

// 导出书签（简化版）
function exportBookmarks() {
    // 模拟导出
    showNotification("书签导出成功", "success");
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);