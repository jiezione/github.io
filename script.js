        window.pageYOffset || document.documentElement.scrollTop;
        
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
    // 主题切换
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // 设置模态框
    elements.settingsBtn.addEventListener('click', () => {
        elements.settingsModal.classList.remove('hidden');
    });
    
    elements.closeSettings.addEventListener('click', () => {
        elements.settingsModal.classList.add('hidden');
    });
    
    elements.settingsOverlay.addEventListener('click', () => {
        elements.settingsModal.classList.add('hidden');
    });
    
    // 编辑中心
    elements.editBtn.addEventListener('click', () => {
        if (appData.github.validated) {
            elements.editModal.classList.remove('hidden');
        } else {
            showNotification("请先完成GitHub验证", "error");
            elements.settingsModal.classList.remove('hidden');
        }
    });
    
    elements.enterEditBtn.addEventListener('click', () => {
        elements.settingsModal.classList.add('hidden');
        elements.editModal.classList.remove('hidden');
    });
    
    elements.closeEdit.addEventListener('click', () => {
        elements.editModal.classList.add('hidden');
    });
    
    elements.editOverlay.addEventListener('click', () => {
        elements.editModal.classList.add('hidden');
    });
    
    // GitHub验证和保存
    elements.validateGithub.addEventListener('click', validateGitHubToken);
    
    elements.saveGithub.addEventListener('click', () => {
        appData.github.username = elements.githubUsername.value.trim();
        appData.github.repo = elements.githubRepo.value.trim();
        appData.github.token = elements.githubToken.value.trim();
        // 不改变验证状态
        saveLocalData();
        showNotification("GitHub设置已保存", "success");
    });
    
    // 搜索功能
    elements.searchInput.addEventListener('input', (e) => {
        renderBookmarks(e.target.value);
    });
    
    elements.searchInputMobile.addEventListener('input', (e) => {
        renderBookmarks(e.target.value);
    });
    
    // 导入导出书签
    elements.importBookmarks.addEventListener('click', () => {
        elements.bookmarkFile.click();
    });
    
    elements.bookmarkFile.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            importBookmarks(e.target.files[0]);
            // 重置文件输入，允许重复选择同一文件
            e.target.value = '';
        }
    });
    
    elements.exportBookmarks.addEventListener('click', exportBookmarks);
    
    // 添加书签
    elements.addBookmark.addEventListener('click', () => {
        // 重置表单和编辑状态
        elements.bookmarkName.value = '';
        elements.bookmarkUrl.value = '';
        elements.bookmarkQuick.checked = false;
        elements.addBookmarkTitle.textContent = "添加新书签";
        editBookmarkId = null;
        
        // 更新文件夹下拉列表
        updateFolderDropdown();
        
        // 显示模态框
        elements.addBookmarkModal.classList.remove('hidden');
    });
    
    elements.closeAddBookmark.addEventListener('click', () => {
        elements.addBookmarkModal.classList.add('hidden');
    });
    
    elements.addBookmarkOverlay.addEventListener('click', () => {
        elements.addBookmarkModal.classList.add('hidden');
    });
    
    elements.saveBookmark.addEventListener('click', () => {
        if (editBookmarkId) {
            saveEditedBookmark();
        } else {
            addNewBookmark();
        }
    });
    
    // 添加新文件夹
    elements.addNewFolder.addEventListener('click', () => {
        elements.addFolderModal.classList.remove('hidden');
        elements.newFolderName.value = '';
        elements.newFolderName.focus();
    });
    
    elements.closeAddFolder.addEventListener('click', () => {
        elements.addFolderModal.classList.add('hidden');
    });
    
    elements.addFolderOverlay.addEventListener('click', () => {
        elements.addFolderModal.classList.add('hidden');
    });
    
    elements.saveFolder.addEventListener('click', addNewFolder);
    
    // 添加城市
    elements.addCityBtn.addEventListener('click', () => {
        elements.addCityModal.classList.remove('hidden');
        elements.cityName.value = '';
        elements.cityTimezone.value = '';
    });
    
    elements.addNewCity.addEventListener('click', () => {
        elements.addCityModal.classList.remove('hidden');
        elements.cityName.value = '';
        elements.cityTimezone.value = '';
    });
    
    elements.closeAddCity.addEventListener('click', () => {
        elements.addCityModal.classList.add('hidden');
    });
    
    elements.addCityOverlay.addEventListener('click', () => {
        elements.addCityModal.classList.add('hidden');
    });
    
    elements.saveCity.addEventListener('click', addNewCity);
    
    // 确认删除
    elements.closeConfirmDelete.addEventListener('click', () => {
        elements.confirmDeleteModal.classList.add('hidden');
        deleteCallback = null;
    });
    
    elements.confirmDeleteOverlay.addEventListener('click', () => {
        elements.confirmDeleteModal.classList.add('hidden');
        deleteCallback = null;
    });
    
    elements.confirmDeleteBtn.addEventListener('click', () => {
        if (deleteCallback) {
            deleteCallback();
            deleteCallback = null;
        }
        elements.confirmDeleteModal.classList.add('hidden');
    });
    
    // 编辑标签页切换
    elements.editTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有标签页的活跃状态
            elements.editTabs.forEach(t => t.classList.remove('active'));
            // 添加当前标签页的活跃状态
            tab.classList.add('active');
            
            // 隐藏所有内容
            elements.tabsContents.forEach(content => content.classList.add('hidden'));
            // 显示对应内容
            const tabId = tab.dataset.tab;
            document.getElementById(tabId).classList.remove('hidden');
        });
    });
    
    // 广告图片上传
    elements.changeAd1.addEventListener('click', () => {
        elements.ad1File.click();
    });
    
    elements.ad1File.addEventListener('change', (e) => {
        handleAdImageUpload(e, 'ad1');
    });
    
    elements.changeAd2.addEventListener('click', () => {
        elements.ad2File.click();
    });
    
    elements.ad2File.addEventListener('change', (e) => {
        handleAdImageUpload(e, 'ad2');
    });
    
    elements.changeAd3.addEventListener('click', () => {
        elements.ad3File.click();
    });
    
    elements.ad3File.addEventListener('change', (e) => {
        handleAdImageUpload(e, 'ad3');
    });
    
    // 保存广告信息
    elements.ad1Url.addEventListener('change', () => {
        appData.ads.ad1.url = elements.ad1Url.value.trim();
        saveLocalData();
    });
    
    elements.ad1Alt.addEventListener('change', () => {
        appData.ads.ad1.alt = elements.ad1Alt.value.trim();
        saveLocalData();
    });
    
    elements.ad2Url.addEventListener('change', () => {
        appData.ads.ad2.url = elements.ad2Url.value.trim();
        saveLocalData();
    });
    
    elements.ad2Alt.addEventListener('change', () => {
        appData.ads.ad2.alt = elements.ad2Alt.value.trim();
        saveLocalData();
    });
    
    elements.ad3Url.addEventListener('change', () => {
        appData.ads.ad3.url = elements.ad3Url.value.trim();
        saveLocalData();
    });
    
    elements.ad3Alt.addEventListener('change', () => {
        appData.ads.ad3.alt = elements.ad3Alt.value.trim();
        saveLocalData();
    });
    
    // 保存更改到GitHub
    elements.saveChanges.addEventListener('click', saveDataToGitHub);
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
            elements.ad1Preview.src = e.target.result;
            elements.ad1.src = e.target.result;
        } else if (adId === 'ad2') {
            elements.ad2Preview.src = e.target.result;
            elements.ad2.src = e.target.result;
        } else if (adId === 'ad3') {
            elements.ad3Preview.src = e.target.result;
            elements.ad3.src = e.target.result;
        }
        
        // 保存到本地
        saveLocalData();
        
        showNotification(`广告图片已更新`, "success");
    };
    reader.readAsDataURL(file);
    
    // 重置文件输入
    event.target.value = '';
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
    