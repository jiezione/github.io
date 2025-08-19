const DEFAULT_REPO = "";
const DEFAULT_RAW_URL = "";

let data = {
    bookmarks: [],
    ads: [],
    timezones: ["UTC"]
};
let startTime = new Date();
let timerInterval;
let userSettings = {
    repo: localStorage.getItem('githubRepo') || DEFAULT_REPO,
    token: localStorage.getItem('githubToken') || ''
};
let isEditing = false;

async function init() {
    setCopyright();
    setupEventListeners();
    await loadDataFromGitHub();
    renderBookmarks();
    renderAds();
    renderTimezones();
    startOnlineTimer();
    setupHealthReminders();
    checkThemePreference();
}

function setCopyright() {
    const year = new Date().getFullYear();
    const hostname = userSettings.repo || DEFAULT_REPO || '星际导航';
    document.getElementById('copyright').textContent = `Copyright © 2018-${year} ${hostname}, All Rights Reserved`;
}

function setupEventListeners() {
    // 主题切换
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // 编辑按钮
    document.getElementById('editButton').addEventListener('click', openSettingsModal);
    
    // 设置模态框
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('closeSettingsBtn').addEventListener('click', closeSettingsModal);
    
    // 编辑模态框
    document.getElementById('closeEditBtn').addEventListener('click', closeEditModal);
    document.getElementById('saveChangesBtn').addEventListener('click', saveChanges);
    
    // 书签导入导出
    document.getElementById('importBookmarks').addEventListener('click', () => {
        document.getElementById('bookmarkFile').click();
    });
    document.getElementById('bookmarkFile').addEventListener('change', importBookmarksFromFile);
    document.getElementById('exportBookmarks').addEventListener('click', exportBookmarks);
    
    // 标签切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    // 添加书签组
    document.getElementById('addBookmarkGroup').addEventListener('click', addNewBookmarkGroup);
    
    // 添加时区
    document.getElementById('addTimezone').addEventListener('click', addTimezone);
    
    // 滚动隐藏编辑和主题按钮
    let lastScrollTime = new Date();
    const editButton = document.getElementById('editButton');
    const themeToggle = document.getElementById('themeToggle');
    
    window.addEventListener('scroll', () => {
        lastScrollTime = new Date();
        editButton.classList.remove('hidden');
        themeToggle.classList.remove('hidden');
        
        clearTimeout(window.scrollTimeout);
        window.scrollTimeout = setTimeout(() => {
            if (new Date() - lastScrollTime >= 3000) {
                editButton.classList.add('hidden');
                themeToggle.classList.add('hidden');
            }
        }, 3000);
    });
}

async function loadDataFromGitHub() {
    try {
        let url;
        let options = {};
        
        if (userSettings.token && userSettings.repo) {
            const [owner, repo] = userSettings.repo.split('/');
            url = `https://api.github.com/repos/${owner}/${repo}/contents/bookmarks.json`;
            options.headers = {
                'Authorization': `token ${userSettings.token}`,
                'Accept': 'application/vnd.github.v3+json'
            };
        } else {
            url = DEFAULT_RAW_URL || `https://raw.githubusercontent.com/${DEFAULT_REPO}/main/bookmarks.json`;
        }
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.log('bookmarks.json not found, using default data');
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let fetchedData;
        if (userSettings.token && userSettings.repo) {
            const json = await response.json();
            fetchedData = JSON.parse(atob(json.content));
        } else {
            fetchedData = await response.json();
        }
        
        // 合并数据，新数据覆盖默认数据
        if (fetchedData.bookmarks) data.bookmarks = fetchedData.bookmarks;
        if (fetchedData.ads) data.ads = fetchedData.ads;
        if (fetchedData.timezones) data.timezones = fetchedData.timezones;
        
    } catch (error) {
        console.error('Error loading data from GitHub:', error);
        console.log('Using default data');
    }
}

async function saveDataToGitHub() {
    if (!userSettings.token || !userSettings.repo) {
        showImportStatus('未配置GitHub信息，无法保存', 'error');
        return false;
    }
    
    try {
        const [owner, repo] = userSettings.repo.split('/');
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/bookmarks.json`;
        
        // 先获取现有文件的sha
        let sha = '';
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${userSettings.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                const json = await response.json();
                sha = json.sha;
            }
        } catch (error) {
            console.log('No existing file, creating new one');
        }
        
        // 准备要保存的数据
        const content = JSON.stringify(data, null, 2);
        // 处理非Latin1字符
        const base64Content = btoa(unescape(encodeURIComponent(content)));
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${userSettings.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update bookmarks via web interface',
                content: base64Content,
                sha: sha // 只有当文件存在时才需要
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Failed to save data: ${response.status}`);
        }
        
        return true;
    } catch (error) {
        console.error('Error saving data to GitHub:', error);
        showImportStatus(`保存失败: ${error.message}`, 'error');
        return false;
    }
}

function renderBookmarks() {
    const container = document.getElementById('bookmarkGroups');
    container.innerHTML = '';
    
    let total = 0;
    
    data.bookmarks.forEach((group, groupIndex) => {
        total += group.items.length;
        
        const groupElement = document.createElement('div');
        groupElement.className = 'bookmark-group';
        groupElement.dataset.index = groupIndex;
        
        const groupHeader = document.createElement('div');
        groupHeader.className = 'group-header';
        groupHeader.innerHTML = `
            <div class="group-title">
                <span class="group-collapse">▶</span>
                ${group.name} (${group.items.length})
            </div>
        `;
        
        groupHeader.addEventListener('click', () => {
            groupElement.classList.toggle('group-collapsed');
        });
        
        const bookmarksContainer = document.createElement('div');
        bookmarksContainer.className = 'bookmarks';
        
        group.items.forEach((bookmark, bookmarkIndex) => {
            const faviconUrl = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(bookmark.url)}&size=32`;
            
            const bookmarkElement = document.createElement('a');
            bookmarkElement.className = 'bookmark';
            bookmarkElement.href = bookmark.url;
            bookmarkElement.target = '_blank';
            bookmarkElement.dataset.group = groupIndex;
            bookmarkElement.dataset.index = bookmarkIndex;
            
            const favicon = document.createElement('div');
            favicon.className = 'bookmark-favicon';
            
            const img = new Image();
            img.src = faviconUrl;
            img.onload = () => {
                favicon.innerHTML = `<img src="${faviconUrl}" alt="${bookmark.name}" width="24" height="24">`;
            };
            img.onerror = () => {
                favicon.textContent = bookmark.name.charAt(0).toUpperCase();
            };
            
            const title = document.createElement('div');
            title.className = 'bookmark-title';
            title.textContent = bookmark.name;
            
            bookmarkElement.appendChild(favicon);
            bookmarkElement.appendChild(title);
            bookmarksContainer.appendChild(bookmarkElement);
        });
        
        groupElement.appendChild(groupHeader);
        groupElement.appendChild(bookmarksContainer);
        container.appendChild(groupElement);
    });
    
    document.getElementById('totalBookmarks').textContent = total;
    renderBookmarkEditor();
}

function renderBookmarkEditor() {
    const container = document.getElementById('bookmarkEditor');
    container.innerHTML = '';
    
    data.bookmarks.forEach((group, groupIndex) => {
        const groupElement = document.createElement('div');
        groupElement.className = 'bookmark-group';
        groupElement.dataset.index = groupIndex;
        
        const groupHeader = document.createElement('div');
        groupHeader.className = 'group-header';
        
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.value = group.name;
        titleInput.className = 'group-title-input';
        titleInput.addEventListener('change', (e) => {
            data.bookmarks[groupIndex].name = e.target.value;
        });
        
        const groupControls = document.createElement('div');
        groupControls.className = 'group-controls';
        groupControls.innerHTML = `
            <button class="group-control-btn add-bookmark" data-group="${groupIndex}">添加书签</button>
            <button class="group-control-btn danger delete-group" data-group="${groupIndex}">删除组</button>
        `;
        
        groupHeader.appendChild(titleInput);
        groupHeader.appendChild(groupControls);
        
        const bookmarksContainer = document.createElement('div');
        bookmarksContainer.className = 'bookmarks';
        
        group.items.forEach((bookmark, bookmarkIndex) => {
            const bookmarkElement = document.createElement('div');
            bookmarkElement.className = 'bookmark';
            bookmarkElement.dataset.index = bookmarkIndex;
            
            const faviconUrl = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(bookmark.url)}&size=32`;
            
            bookmarkElement.innerHTML = `
                <div class="bookmark-favicon">
                    <img src="${faviconUrl}" alt="${bookmark.name}" width="24" height="24" onerror="this.parentNode.textContent='${bookmark.name.charAt(0).toUpperCase()}'">
                </div>
                <div class="bookmark-title">${bookmark.name}</div>
                <div class="bookmark-controls">
                    <button class="bookmark-control-btn edit-bookmark" data-group="${groupIndex}" data-index="${bookmarkIndex}">✎</button>
                    <button class="bookmark-control-btn danger delete-bookmark" data-group="${groupIndex}" data-index="${bookmarkIndex}">×</button>
                </div>
            `;
            
            bookmarksContainer.appendChild(bookmarkElement);
        });
        
        groupElement.appendChild(groupHeader);
        groupElement.appendChild(bookmarksContainer);
        container.appendChild(groupElement);
    });
    
    // 添加事件监听器
    document.querySelectorAll('.add-bookmark').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const groupIndex = parseInt(e.target.dataset.group);
            addNewBookmark(groupIndex);
        });
    });
    
    document.querySelectorAll('.delete-group').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const groupIndex = parseInt(e.target.dataset.group);
            if (confirm('确定要删除这个书签组吗？')) {
                data.bookmarks.splice(groupIndex, 1);
                renderBookmarkEditor();
            }
        });
    });
    
    document.querySelectorAll('.edit-bookmark').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const groupIndex = parseInt(e.target.dataset.group);
            const bookmarkIndex = parseInt(e.target.dataset.index);
            editBookmark(groupIndex, bookmarkIndex);
        });
    });
    
    document.querySelectorAll('.delete-bookmark').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const groupIndex = parseInt(e.target.dataset.group);
            const bookmarkIndex = parseInt(e.target.dataset.index);
            if (confirm('确定要删除这个书签吗？')) {
                data.bookmarks[groupIndex].items.splice(bookmarkIndex, 1);
                renderBookmarkEditor();
            }
        });
    });
}

function addNewBookmarkGroup() {
    const newGroup = {
        name: `新分组 ${data.bookmarks.length + 1}`,
        items: []
    };
    data.bookmarks.push(newGroup);
    renderBookmarkEditor();
}

function addNewBookmark(groupIndex) {
    const newBookmark = {
        name: '新书签',
        url: 'https://'
    };
    data.bookmarks[groupIndex].items.push(newBookmark);
    renderBookmarkEditor();
    editBookmark(groupIndex, data.bookmarks[groupIndex].items.length - 1);
}

function editBookmark(groupIndex, bookmarkIndex) {
    const bookmark = data.bookmarks[groupIndex].items[bookmarkIndex];
    const newName = prompt('书签名称:', bookmark.name);
    if (newName === null) return;
    
    const newUrl = prompt('书签URL:', bookmark.url);
    if (newUrl === null) return;
    
    if (newUrl && newName) {
        data.bookmarks[groupIndex].items[bookmarkIndex] = {
            name: newName,
            url: newUrl.startsWith('http') ? newUrl : `https://${newUrl}`
        };
        renderBookmarkEditor();
    }
}

function renderAds() {
    data.ads.forEach((ad, index) => {
        const adSlot = document.getElementById(`ad${index + 1}`);
        if (adSlot && ad.imageUrl) {
            adSlot.innerHTML = `<a href="${ad.url || '#'}" target="_blank"><img src="${ad.imageUrl}" alt="广告"></a>`;
        }
    });
    
    renderAdEditor();
}

function renderAdEditor() {
    const adItems = document.querySelectorAll('.ad-item');
    adItems.forEach((item, index) => {
        const ad = data.ads[index] || {};
        const urlInput = item.querySelector('.ad-url');
        const imageInput = item.querySelector('.ad-image');
        const preview = item.querySelector('.ad-preview');
        
        urlInput.value = ad.url || '';
        
        if (ad.imageUrl) {
            preview.src = ad.imageUrl;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
        
        urlInput.addEventListener('change', () => {
            if (!data.ads[index]) data.ads[index] = {};
            data.ads[index].url = urlInput.value;
        });
        
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.size <= 3 * 1024 * 1024) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (!data.ads[index]) data.ads[index] = {};
                    data.ads[index].imageUrl = event.target.result;
                    preview.src = event.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                alert('图片大小不能超过3MB');
            }
        });
        
        item.querySelector('.remove-ad').addEventListener('click', () => {
            if (confirm('确定要删除这个广告吗？')) {
                if (data.ads[index]) {
                    data.ads.splice(index, 1);
                }
                renderAdEditor();
            }
        });
    });
}

function renderTimezones() {
    const container = document.getElementById('timezones');
    container.innerHTML = '';
    
    data.timezones.forEach(tz => {
        const timezoneItem = document.createElement('div');
        timezoneItem.className = 'timezone-item';
        timezoneItem.innerHTML = `
            <span class="timezone-name">${tz}</span>
            <span class="timezone-time" data-tz="${tz}">--:--:--</span>
            <button class="remove-tz" data-tz="${tz}">×</button>
        `;
        container.appendChild(timezoneItem);
    });
    
    // 添加删除时区事件
    document.querySelectorAll('.remove-tz').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tz = e.target.dataset.tz;
            data.timezones = data.timezones.filter(timezone => timezone !== tz);
            renderTimezones();
            renderTimezonesEditor();
        });
    });
    
    updateTimezones();
    renderTimezonesEditor();
}

function renderTimezonesEditor() {
    const container = document.getElementById('timezonesEditor');
    container.innerHTML = '';
    
    data.timezones.forEach(tz => {
        const timezoneItem = document.createElement('div');
        timezoneItem.className = 'timezone-item';
        timezoneItem.innerHTML = `
            <span class="timezone-name">${tz}</span>
            <span class="timezone-time" data-tz="${tz}">--:--:--</span>
            <button class="remove-tz danger" data-tz="${tz}">删除</button>
        `;
        container.appendChild(timezoneItem);
    });
    
    // 添加删除时区事件
    document.querySelectorAll('#timezonesEditor .remove-tz').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tz = e.target.dataset.tz;
            if (confirm(`确定要删除${tz}时区吗？`)) {
                data.timezones = data.timezones.filter(timezone => timezone !== tz);
                renderTimezonesEditor();
                renderTimezones();
            }
        });
    });
    
    updateTimezones();
}

function updateTimezones() {
    document.querySelectorAll('.timezone-time').forEach(el => {
        const tz = el.dataset.tz;
        let date, options;
        
        if (tz === 'UTC') {
            date = new Date();
            options = { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit', 
                hour12: false,
                timeZone: 'UTC'
            };
        } else {
            date = new Date();
            options = { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit', 
                hour12: false,
                timeZone: tz
            };
        }
        
        el.textContent = date.toLocaleTimeString('zh-CN', options);
    });
}

function startOnlineTimer() {
    updateOnlineTime();
    timerInterval = setInterval(updateOnlineTime, 1000);
}

function updateOnlineTime() {
    const now = new Date();
    const diff = now - startTime;
    
    const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    
    document.getElementById('onlineTime').textContent = `${hours}:${minutes}:${seconds}`;
    updateTimezones();
}

function setupHealthReminders() {
    const tips = [
        "长时间浏览对眼睛不好，记得休息一下",
        "多喝水，保持身体水分充足",
        "站起来活动一下，缓解久坐疲劳",
        "深呼吸，放松一下心情",
        "保持正确的坐姿，保护颈椎健康"
    ];
    
    function updateTip() {
        const tipElement = document.getElementById('healthTip');
        const now = new Date();
        const hour = now.getHours();
        
        let tip;
        if (hour >= 5 && hour < 9) {
            tip = "早上好！新的一天开始了，精神饱满地开始浏览吧";
        } else if (hour >= 9 && hour < 12) {
            tip = "上午效率高，好好利用这段时间";
        } else if (hour >= 12 && hour < 14) {
            tip = "午餐时间到了，补充能量才能更好地工作";
        } else if (hour >= 14 && hour < 18) {
            tip = "下午容易犯困，适当活动一下提提神";
        } else if (hour >= 18 && hour < 22) {
            tip = "晚上浏览注意控制时间，不要影响休息";
        } else {
            tip = "夜深了，早点休息，保持充足睡眠";
        }
        
        tipElement.textContent = tip;
        
        // 随机提醒
        if (Math.random() > 0.7) {
            setTimeout(() => {
                tipElement.textContent = tips[Math.floor(Math.random() * tips.length)];
            }, 300000); // 5分钟后
        }
    }
    
    updateTip();
    setInterval(updateTip, 3600000); // 每小时更新一次
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

function checkThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || (!savedTheme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        document.body.classList.add('light-mode');
    }
}

function openSettingsModal() {
    document.getElementById('repoInput').value = userSettings.repo;
    document.getElementById('tokenInput').value = userSettings.token;
    document.getElementById('settingsModal').classList.add('active');
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('active');
}

function saveSettings() {
    const repo = document.getElementById('repoInput').value.trim();
    const token = document.getElementById('tokenInput').value.trim();
    
    userSettings.repo = repo;
    userSettings.token = token;
    
    localStorage.setItem('githubRepo', repo);
    localStorage.setItem('githubToken', token);
    
    setCopyright();
    closeSettingsModal();
    
    // 验证通过后打开编辑页
    openEditModal();
}

function openEditModal() {
    renderBookmarkEditor();
    renderAdEditor();
    renderTimezonesEditor();
    document.getElementById('editModal').classList.add('active');
    switchTab('bookmarks');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

async function saveChanges() {
    const success = await saveDataToGitHub();
    if (success) {
        showImportStatus('保存成功！', 'success');
        renderBookmarks();
        renderAds();
        renderTimezones();
        setTimeout(closeEditModal, 1000);
    }
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = tab.id === `${tabName}Tab` ? 'block' : 'none';
    });
}

function importBookmarksFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(e.target.result, 'text/html');
            const bookmarkElements = htmlDoc.querySelectorAll('dt a');
            
            if (bookmarkElements.length === 0) {
                showImportStatus('未找到书签数据', 'error');
                return;
            }
            
            const importedGroups = {};
            
            bookmarkElements.forEach(link => {
                let parent = link.parentNode;
                let groupName = '导入的书签';
                
                // 查找父级文件夹
                while (parent.tagName !== 'DL' && parent.parentNode) {
                    if (parent.tagName === 'DT' && parent.firstElementChild.tagName === 'H3') {
                        groupName = parent.firstElementChild.textContent;
                        break;
                    }
                    parent = parent.parentNode;
                }
                
                if (!importedGroups[groupName]) {
                    importedGroups[groupName] = [];
                }
                
                importedGroups[groupName].push({
                    name: link.textContent,
                    url: link.href
                });
            }
            
            // 合并书签并去重
            Object.keys(importedGroups).forEach(groupName => {
                let existingGroup = data.bookmarks.find(g => g.name === groupName);
                
                if (!existingGroup) {
                    existingGroup = { name: groupName, items: [] };
                    data.bookmarks.push(existingGroup);
                }
                
                importedGroups[groupName].forEach(newBookmark => {
                    // 去重检查
                    const isDuplicate = existingGroup.items.some(b => 
                        b.url.toLowerCase() === newBookmark.url.toLowerCase()
                    );
                    
                    if (!isDuplicate) {
                        existingGroup.items.push(newBookmark);
                    }
                });
            });
            
            renderBookmarkEditor();
            showImportStatus(`成功导入 ${bookmarkElements.length} 个书签（已去重）`, 'success');
        } catch (error) {
            console.error('Error importing bookmarks:', error);
            showImportStatus('导入失败: 无效的书签文件', 'error');
        }
    };
    reader.readAsText(file);
}

function exportBookmarks() {
    // 创建HTML书签格式
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>书签导出</TITLE>
<H1>书签</H1>
<DL><p>`;
    
    data.bookmarks.forEach(group => {
        html += `<DT><H3>${group.name}</H3>
<DL><p>`;
        
        group.items.forEach(bookmark => {
            html += `<DT><A HREF="${bookmark.url}">${bookmark.name}</A>`;
        });
        
        html += `</DL><p>`;
    });
    
    html += `</DL><p>`;
    
    // 创建下载
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmarks_${new Date().toISOString().slice(0,10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function addTimezone() {
    const select = document.getElementById('timezoneSelect');
    const tz = select.value;
    
    if (!data.timezones.includes(tz)) {
        data.timezones.push(tz);
        renderTimezones();
        renderTimezonesEditor();
    }
}

function showImportStatus(message, type) {
    const statusElement = document.getElementById('importStatus');
    statusElement.textContent = message;
    statusElement.className = type;
    
    setTimeout(() => {
        statusElement.textContent = '';
        statusElement.className = '';
    }, 3000);
}

// 初始化应用
window.addEventListener('DOMContentLoaded', init);