// ==UserScript==
// @name         洛谷提交记录显示优化
// @namespace    https://github.com/chenyuxuan2009/luogu_submission_better
// @version      3.0
// @description  修改提交记录背景，新增独立插件设置页面
// @author       lyx_axxs
// @match        *://www.luogu.com.cn/record/*
// @match        *://www.luogu.com.cn
// @match        *://www.luogu.com.cn/*
// @match        *://www.luogu.com.cn/plugin
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @license      MIT
// @downloadURL  https://github.com/lyx-axxs/luogu_submission_better_improved-version/raw/refs/heads/main/%E6%B4%9B%E8%B0%B7%E6%8F%90%E4%BA%A4%E8%AE%B0%E5%BD%95%E6%98%BE%E7%A4%BA%E4%BC%98%E5%8C%96%E6%94%B9%E8%89%AF%E7%89%88.user.js
// @updateURL    https://github.com/lyx-axxs/luogu_submission_better_improved-version/raw/refs/heads/main/%E6%B4%9B%E8%B0%B7%E6%8F%90%E4%BA%A4%E8%AE%B0%E5%BD%95%E6%98%BE%E7%A4%BA%E4%BC%98%E5%8C%96%E6%94%B9%E8%89%AF%E7%89%88.user.js
// ==/UserScript==

(function () {
    'use strict';

    // ==================== 配置与常量 ====================
    const jsdelivrOptions = [
        'https://cdn.jsdelivr.net',
        'https://jsdelivrcn.netlify.app',
        'https://cdn.mengze.vip'
    ];
    const themeOptions = [
        'nailoong',
        'andy',
        'qqemoji',
        'qqsuperemoji',
        'mixed1'
    ];
    const themeLabels = {
        "nailoong": "奶龙",
        "andy": "安梦梦",
        "qqemoji": "QQ 大表情",
        "qqsuperemoji": "QQ 超级表情",
        "mixed1": "混搭 1"
    };
    const themeTypes = {
        "nailoong": "gif",
        "andy": "gif",
        "qqemoji": "gif",
        "qqsuperemoji": "gif",
        "mixed1": "gif"
    };
    const statusKeys = [
        "AC", "WA", "TLE", "MLE", "RE",
        "OLE", "UKE", "Judging", "CE", "Waiting", "Unshown"
    ];
    const statusLabels = {
        "AC": "AC 图片 URL",
        "WA": "WA 图片 URL",
        "TLE": "TLE 图片 URL",
        "MLE": "MLE 图片 URL",
        "RE": "RE 图片 URL",
        "OLE": "OLE 图片 URL",
        "UKE": "UKE 图片 URL",
        "Judging": "Judging 图片 URL",
        "CE": "CE 图片 URL",
        "Waiting": "Waiting 图片 URL",
        "Unshown": "Unshown 图片 URL"
    };
    const statusShort = ["AC", "WA", "TLE", "MLE", "RE", "OLE", "UKE", "Judging", "CE", "WJ", "US"];

    function getStorage(key, def) {
        const val = localStorage.getItem(key);
        return val !== null ? val : def;
    }

    function setStorage(key, val) {
        localStorage.setItem(key, val);
    }

    let configCache = null;

    function getConfig() {
        if (configCache) return configCache;
        configCache = {
            opacity: parseFloat(getStorage("opacity", "0.3")),
            replaceSidebarStatus: getStorage("replaceSidebarStatus", "1"),
            jsdelivr: getStorage("jsdelivr", 'https://cdn.jsdelivr.net'),
            theme: getStorage("theme", 'nailoong')
        };
        return configCache;
    }

    function refreshConfig() {
        configCache = null;
        return getConfig();
    }

    function getImage(themeName, key) {
        const config = getConfig();
        if (themeOptions.includes(themeName)) {
            return `${config.jsdelivr}/gh/chenyuxuan2009/luogu_submission_better/theme/${themeName}/${key}.${themeTypes[themeName]}`;
        }
        return getStorage(key, '');
    }

    function getStatusColors(op) {
        return [
            `rgba(82, 196, 26, ${op})`,
            `rgba(231, 76, 60, ${op})`,
            `rgba(5, 34, 66, ${op})`,
            `rgba(5, 34, 66, ${op})`,
            `rgba(157, 61, 207, ${op})`,
            `rgba(5, 34, 66, ${op})`,
            `rgba(14, 29, 105, ${op})`,
            `rgba(20, 85, 143, ${op})`,
            `rgba(250, 219, 20, ${op})`,
            `rgba(20, 85, 143, ${op})`,
            `rgba(38, 38, 38, ${op})`
        ];
    }

    function getCol(index, op) {
        const config = getConfig();
        const colors = getStatusColors(op);
        const key = statusKeys[index];
        const imgUrl = getImage(config.theme, key);
        return `background: linear-gradient(${colors[index]}, ${colors[index]}), url('${imgUrl}'); background-size: cover;`;
    }

    // ==================== 核心功能：提交记录优化 ====================
    function subBetter() {
        let tc = document.getElementsByClassName('test-case');
        let len = tc.length;
        let firstSTA = -1;
        let ac = 0;
        let judging = 0;
        const config = getConfig();

        for (let i = 0; i < len; i += 1) {
            if (tc[i].id === 'luogu_submission_better_right_row') continue;
            if (tc[i].style.background === 'rgb(20, 85, 143)') {
                judging = 1;
                tc[i].style = getCol(7, config.opacity);
                continue;
            }
            if (!tc[i].getElementsByClassName('status')[0]) continue;
            let status = tc[i].getElementsByClassName('status')[0].innerHTML;
            if (status.length > 2) status = status.substring(0, 2);
            let tmpSTA = -1;
            if (status === "AC") tmpSTA = 0;
            else if (status === "WA") tmpSTA = 1;
            else if (status === "TL") tmpSTA = 2;
            else if (status === "ML") tmpSTA = 3;
            else if (status === "RE") tmpSTA = 4;
            else if (status === "OL") tmpSTA = 5;
            else if (status === "UK") tmpSTA = 6;

            if (tmpSTA !== -1) {
                tc[i].style = getCol(tmpSTA, config.opacity);
                if (tmpSTA === 0) ac = 1;
                if (tmpSTA !== 0 && firstSTA === -1) firstSTA = tmpSTA;
            }
        }
        if (judging) firstSTA = 7;
        if (firstSTA === -1 && ac) firstSTA = 0;

        if (config.replaceSidebarStatus === "1") {
            let doc = document.querySelector('div.info-rows');
            if (!doc) return;
            let id = -1;
            for (let i = 0; i < doc.children.length; i += 1) {
                if (doc.children[i].children[0].children[0].innerHTML.includes('评测状态')) {
                    id = i;
                    break;
                }
            }
            if (id === -1) return;
            let info = document.getElementsByClassName('info-rows')[0].children[id].children[1];
            if (!info) return;

            if (info.innerText.includes('Judging')) firstSTA = 7;
            if (info.innerText.includes('Compile Error') || info.innerText.includes('CE')) firstSTA = 8;
            if (info.innerText.includes('Unknown Error') || info.innerText.includes('UKE')) firstSTA = 6;
            if (info.innerText.includes('Waiting') || info.innerText.includes('WJ')) firstSTA = 9;
            if (info.innerText.includes('Unshown') || info.innerText.includes('US')) firstSTA = 10;
            if (firstSTA === -1) return;

            if (firstSTA == 7) {
                if (!info.innerHTML.includes('spinner')) {
                    info.innerHTML = `<div data-v-21e0a7cc="" class="test-case" style="${getCol(firstSTA, config.opacity)}" id="luogu_submission_better_right_row"><div data-v-21e0a7cc="" class="content"><div data-v-bbdab89a="" data-v-21e0a7cc="" class="spinner" style="width: 32px; height: 32px;"><div data-v-bbdab89a="" style="width: 32px; height: 32px; border-width: 2px;"></div></div></div></div>`;
                }
            } else {
                if (!info.innerText.includes(statusShort[firstSTA])) {
                    info.innerHTML = `<div data-v-21e0a7cc="" class="test-case" style="${getCol(firstSTA, config.opacity)}" id="luogu_submission_better_right_row"><div data-v-21e0a7cc="" class="content"><div data-v-21e0a7cc="" class="status">${statusShort[firstSTA]}</div></div></div>`;
                }
            }
        }
    }

    // ==================== 侧边栏入口（根据实际 HTML 结构） ====================
    function addSidebarButton() {
        if (document.getElementById('lgb-nav-plugin')) return;

        // 查找"应用"按钮
        let appBtn = document.querySelector('.popup-button');
        if (appBtn) {
            const tryInsert = () => {
                // 查找 .popup-wrap 下的 .apps 容器
                let popupWrap = document.querySelector('.popup-wrap');
                if (!popupWrap) return;

                let appsContainer = popupWrap.querySelector('.apps');
                if (!appsContainer) return;

                // 检查是否已经有"插件设置"
                if (appsContainer.querySelector('#lgb-nav-plugin')) return;

                // 获取所有现有的菜单项
                let existingItems = appsContainer.querySelectorAll('a');

                // 查找"反馈问题"作为插入位置
                let feedbackLink = appsContainer.querySelector('a[href="/ticket"]');

                // 创建与原生样式完全一致的菜单项
                let a = document.createElement('a');
                a.id = 'lgb-nav-plugin';
                a.href = '/plugin';
                a.className = 'color-none';
                a.setAttribute('data-v-0640126c', '');
                a.setAttribute('data-v-2afa32a4', '');
                a.textContent = '插件设置';

                // 复制原生菜单项的样式
                if (existingItems.length > 0) {
                    const firstItem = existingItems[0];
                    // 复制计算后的样式
                    const computedStyle = window.getComputedStyle(firstItem);
                    a.style.cssText = `
                        display: ${computedStyle.display || 'inline-block'};
                        padding: ${computedStyle.padding || '6px 20px'};
                        color: ${computedStyle.color || '#333'};
                        text-decoration: ${computedStyle.textDecoration || 'none'};
                        font-size: ${computedStyle.fontSize || '14px'};
                        line-height: ${computedStyle.lineHeight || '1.8'};
                        transition: background 0.2s;
                        cursor: pointer;
                    `;
                } else {
                    // 默认样式
                    a.style.cssText = `
                        display: inline-block;
                        padding: 6px 20px;
                        color: #333;
                        text-decoration: none;
                        font-size: 14px;
                        line-height: 1.8;
                        transition: background 0.2s;
                        cursor: pointer;
                    `;
                }

                // 添加 hover 效果（与原生一致）
                a.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = '#f0f0f0';
                });
                a.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = 'transparent';
                });

                // 在"反馈问题"后面插入
                if (feedbackLink) {
                    feedbackLink.parentNode.insertBefore(a, feedbackLink.nextSibling);
                } else {
                    // 如果找不到"反馈问题"，追加到末尾
                    appsContainer.appendChild(a);
                }
            };

            // 点击"应用"按钮时插入
            appBtn.addEventListener('click', () => setTimeout(tryInsert, 150));
            // 页面加载时也尝试
            setTimeout(tryInsert, 500);
            // 持续监听，确保在菜单打开时也能插入
            const observer = new MutationObserver(() => {
                const popupWrap = document.querySelector('.popup-wrap');
                if (popupWrap && popupWrap.style.display !== 'none') {
                    tryInsert();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            // 存储 observer 以便清理
            window._lgbObserver = observer;
            return;
        }

        // 备用方案：通过侧边栏导航
        let sidebar = document.querySelector(".nav-group.on-expand ul, .sidebar-menu, .nav-list");
        if (sidebar && !document.getElementById('pluginSettingsBtn')) {
            if (sidebar.querySelector('a[href="/plugin"]')) return;

            let li = document.createElement('li');
            li.setAttribute('data-v-71f35d47', '');
            li.setAttribute('data-v-a119941e', '');
            li.setAttribute('title', '插件设置');
            li.innerHTML = `<a data-v-12b24cc3="" data-v-71f35d47="" href="/plugin" class="" disabled="false" id="pluginSettingsBtn"><span data-v-71f35d47="" class="title minor">插件设置</span></a>`;
            sidebar.appendChild(li);
        }
    }

    // ==================== 保存成功弹窗（完美模拟洛谷原生 SweetAlert2） ====================
    function showSaveModal() {
        let modal = document.createElement('div');
        modal.id = 'lgb-save-modal';
        modal.innerHTML = `
            <div class="lgb-modal-mask" style="
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.4);
                z-index: 9998;
                opacity: 0;
                transition: opacity 0.2s ease;
            "></div>
            <div class="lgb-modal-content" style="
                position: fixed;
                top: 50%; left: 50%;
                transform: translate(-50%, -50%) scale(0.7);
                background: #fff;
                border-radius: 5px;
                padding: 0 0 1.25em;
                z-index: 9999;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                opacity: 0;
                transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                width: 32em;
            ">
                <div class="swal2-icon swal2-success swal2-icon-show" style="display:flex; margin: 2.5em auto .6em; width:5em; height:5em; border:0.25em solid rgba(0,0,0,0); border-radius:50%; border-color:#a5dc86; color:#a5dc86; position:relative; justify-content:center; line-height:5em; font-family:inherit; animation: lgb-animate-error-icon 0.5s;">
                    <div class="swal2-success-circular-line-left" style="background:transparent; position:absolute; width:3.75em; height:7.5em; transform:rotate(45deg); border-radius:50%; top:-0.4375em; left:-2.0635em; transform:rotate(-45deg); transform-origin:3.75em 3.75em; border-radius:7.5em 0 0 7.5em; background-color:#fff;"></div>
                    <span class="swal2-success-line-tip" style="display:block; position:absolute; z-index:2; height:.3125em; border-radius:.125em; background-color:#a5dc86; top:2.875em; left:.8125em; width:1.5625em; transform:rotate(45deg); animation: lgb-animate-success-line-tip .75s;"></span>
                    <span class="swal2-success-line-long" style="display:block; position:absolute; z-index:2; height:.3125em; border-radius:.125em; background-color:#a5dc86; top:2.375em; right:.5em; width:2.9375em; transform:rotate(-45deg); animation: lgb-animate-success-line-long .75s;"></span>
                    <div class="swal2-success-ring" style="position:absolute; z-index:2; top:-0.25em; left:-0.25em; box-sizing:content-box; width:100%; height:100%; border:.25em solid rgba(165,220,134,.3); border-radius:50%;"></div>
                    <div class="swal2-success-fix" style="position:absolute; z-index:1; top:.5em; left:1.625em; width:.4375em; height:5.625em; transform:rotate(-45deg); background-color:#fff;"></div>
                    <div class="swal2-success-circular-line-right" style="background:transparent; position:absolute; width:3.75em; height:7.5em; transform:rotate(45deg); border-radius:50%; top:-0.6875em; left:1.875em; transform:rotate(-45deg); transform-origin:0 3.75em; border-radius:0 7.5em 7.5em 0; background-color:#fff; animation: lgb-rotate-success-circular-line 4.25s ease-in;"></div>
                </div>
                <h2 class="swal2-title" id="swal2-title" style="position:relative; max-width:100%; margin:0; padding:.8em 1em 0; color:#545454; font-size:1.875em; font-weight:600; text-align:center; word-wrap:break-word; display:block;">保存成功</h2>
            </div>
        `;

        let style = document.createElement('style');
        style.textContent = `
            @keyframes lgb-animate-error-icon {
                0% { transform: rotateX(100deg); opacity:0; }
                100% { transform: rotateX(0deg); opacity:1; }
            }
            @keyframes lgb-animate-success-line-tip {
                0% { top:1.1875em; left:.0625em; width:0; }
                54% { top:1.0625em; left:.125em; width:0; }
                70% { top:2.1875em; left:-0.375em; width:3.125em; }
                84% { top:3em; left:1.3125em; width:1.0625em; }
                100% { top:2.8125em; left:.8125em; width:1.5625em; }
            }
            @keyframes lgb-animate-success-line-long {
                0% { top:3.375em; right:2.875em; width:0; }
                65% { top:3.375em; right:2.875em; width:0; }
                84% { top:2.1875em; right:0; width:3.4375em; }
                100% { top:2.375em; right:.5em; width:2.9375em; }
            }
            @keyframes lgb-rotate-success-circular-line {
                0% { transform: rotate(-45deg); }
                5% { transform: rotate(-45deg); }
                12% { transform: rotate(-405deg); }
                100% { transform: rotate(-405deg); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(modal);

        requestAnimationFrame(() => {
            const mask = modal.querySelector('.lgb-modal-mask');
            const content = modal.querySelector('.lgb-modal-content');
            mask.style.opacity = '1';
            content.style.opacity = '1';
            content.style.transform = 'translate(-50%, -50%) scale(1)';
        });

        setTimeout(() => {
            const mask = modal.querySelector('.lgb-modal-mask');
            const content = modal.querySelector('.lgb-modal-content');
            mask.style.opacity = '0';
            content.style.opacity = '0';
            content.style.transform = 'translate(-50%, -50%) scale(0.7)';

            setTimeout(() => {
                modal.remove();
                style.remove();
            }, 300);
        }, 2000);
    }

    // ==================== 独立设置页面 (/plugin) ====================
    function renderPluginPage() {
        if (document.getElementById('lgb-plugin-initialized')) return;

        document.title = '插件设置-洛谷';

        // 温和清理
        const userNavSelectors = [
            '.user-nav',
            '.header-right .user-info',
            '.header-right .avatar-wrapper',
            '.float-tools',
            '.float-btn'
        ];
        userNavSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => el.remove());
        });

        // 强行覆盖页面大标题 (改成洛谷/插件设置)
        const header = document.querySelector('.header-layout .header');
        if (header) {
            header.innerHTML = `
                <nav data-v-c9185fa2="" data-v-2dfcfd35="" class="lfe-caption bread-crumb">
                    <a href="/" style="color:inherit;text-decoration:none;">洛谷</a>
                    <span style="margin:0 0.5em;">/</span>
                    <span>插件设置</span>
                </nav>
                <h1 data-v-2dfcfd35="" class="lfe-h1">插件设置</h1>
            `;
        }

        const fullContainer = document.querySelector('main .full-container');
        if (!fullContainer) {
            setTimeout(() => {
                const retryContainer = document.querySelector('main .full-container');
                if (retryContainer && !document.getElementById('lgb-plugin-initialized')) {
                    renderPluginPageContent(retryContainer);
                }
            }, 500);
            return;
        }

        renderPluginPageContent(fullContainer);
    }

    function renderPluginPageContent(fullContainer) {
        if (document.getElementById('lgb-plugin-initialized')) return;

        const config = getConfig();
        let op = config.opacity;
        let opPercent = Math.round(op * 100);
        let jsd = config.jsdelivr;
        let thm = config.theme;
        let rpl = config.replaceSidebarStatus;

        if (fullContainer.querySelector('#lgb-plugin-initialized')) return;

        fullContainer.innerHTML = `
        <!-- 外层洛谷原生卡片 -->
        <div class="columba-content-wrap main-content">
            <div data-v-176b97b3="" class="l-card" style="padding: 20px; background: #fff; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <form data-v-5c9d4df6="" style="display:flex; flex-direction:column; gap:1.5em;">

                    <!-- 透明度 -->
                    <div data-v-02424d02="" class="l-form-layout row" style="display:flex;align-items:center;gap:1.5em;flex-wrap:wrap;border-bottom: 1px solid #eee; padding-bottom: 16px;">
                        <span data-v-02424d02="" class="" style="width: 130px; flex-shrink:0; color:#555; font-weight:500;">背景透明度(%)</span>
                        <div data-v-02424d02="" style="flex:1; min-width:220px;">
                            <div class="wrapper" style="position:relative; display:flex; align-items:center; gap:15px; width:100%; max-width:400px;">
                                <div class="slider" style="flex:1; position:relative;">
                                    <div class="track" style="height:6px; background:#e0e0e0; border-radius:4px; position:relative; cursor:pointer;">
                                        <div class="bar-wrapper" style="width:100%; height:100%; position:relative; overflow:hidden; border-radius:4px;">
                                            <div class="bar" id="slider-bar-lgb" style="height:100%; background:#3498db; border-radius:4px; transform-origin:left; transform: scaleX(${opPercent / 100});"></div>
                                        </div>
                                        <div class="dot-wrapper" id="slider-dot-lgb" style="position:absolute; top:50%; width:18px; height:18px; background:#3498db; border-radius:50%; box-shadow:0 2px 6px rgba(0,0,0,0.25); transform: translate(-50%, -50%); transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1); left: ${opPercent}%;">
                                            <div class="dot" style="width:100%; height:100%; border-radius:50%;"></div>
                                        </div>
                                        <input type="range" id="lgb-opacity-slider" min="0" max="100" value="${opPercent}"
                                            style="position:absolute; top:-8px; left:0; width:100%; height:20px; opacity:0; cursor:pointer; z-index:2;">
                                    </div>
                                </div>
                                <div class="value" id="lgb-opacity-value" style="min-width:35px; text-align:right; color:#555; font-weight:500; font-size:1em;">${opPercent}</div>
                            </div>
                        </div>
                    </div>

                    <!-- jsdelivr -->
                    <div data-v-02424d02="" class="l-form-layout row" style="display:flex;align-items:flex-start;gap:1.5em;flex-wrap:wrap;border-bottom: 1px solid #eee; padding-bottom: 16px;">
                        <span data-v-02424d02="" class="" style="width: 130px; flex-shrink:0; color:#555; font-weight:500; padding-top:6px;">jsdelivr 源</span>
                        <div data-v-02424d02="" style="flex:1; min-width:220px;">
                            <select id="lgb-jsdelivr" style="padding:6px 10px; border:1px solid #ddd; border-radius:4px; width:260px; font-size:0.95em; background:#fff;">
                                ${jsdelivrOptions.map(o => `<option value="${o}" ${o === jsd ? 'selected' : ''}>${o}</option>`).join('')}
                                <option value="custom" ${!jsdelivrOptions.includes(jsd) ? 'selected' : ''}>自定义</option>
                            </select>
                            <input type="text" id="lgb-jsdelivr-custom" placeholder="输入自定义地址" value="${!jsdelivrOptions.includes(jsd) ? jsd : ''}"
                                style="margin-top:6px; padding:6px 10px; border:1px solid #ddd; border-radius:4px; width:260px; font-size:0.95em; display:${!jsdelivrOptions.includes(jsd) ? 'block' : 'none'}; background:#fff;">
                            <p data-v-5c9d4df6="" class="lfe-caption" style="margin:5px 0 0; color:#999; font-size:0.85em;">仅适用于官方内置主题。</p>
                        </div>
                    </div>

                    <!-- 主题 -->
                    <div data-v-02424d02="" class="l-form-layout row" style="display:flex;align-items:flex-start;gap:1.5em;flex-wrap:wrap;border-bottom: 1px solid #eee; padding-bottom: 16px;">
                        <span data-v-02424d02="" class="" style="width: 130px; flex-shrink:0; color:#555; font-weight:500; padding-top:6px;">主题</span>
                        <div data-v-02424d02="" style="flex:1; min-width:220px;">
                            <select id="lgb-theme" style="padding:6px 10px; border:1px solid #ddd; border-radius:4px; width:260px; font-size:0.95em; background:#fff;">
                                ${themeOptions.map(o => `<option value="${o}" ${o === thm ? 'selected' : ''}>${o}（${themeLabels[o]}）</option>`).join('')}
                                <option value="custom" ${!themeOptions.includes(thm) ? 'selected' : ''}>自定义</option>
                            </select>

                            <div id="lgb-custom-theme" style="margin-top:12px; display:${!themeOptions.includes(thm) ? 'block' : 'none'};">
                                <p data-v-5c9d4df6="" class="lfe-caption" style="margin-bottom:8px; color:#666;">自定义主题图片 URL：</p>
                                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(230px, 1fr)); gap:10px;">
                                    ${statusKeys.map(k => `
                                        <div style="display:flex; flex-direction:column; gap:4px;">
                                            <label style="font-size:0.82em; color:#888;">${statusLabels[k]}</label>
                                            <input type="text" id="lgb-img-${k}" placeholder="https://..." value="${getStorage(k, '')}"
                                                style="padding:5px 8px; border:1px solid #ddd; border-radius:4px; font-size:0.9em; background:#fff;">
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 替换右侧栏 -->
                    <div data-v-02424d02="" class="l-form-layout row" style="display:flex;align-items:flex-start;gap:1.5em;flex-wrap:wrap;border-bottom: 1px solid #eee; padding-bottom: 16px;">
                        <span data-v-02424d02="" class="" style="width: 130px; flex-shrink:0; color:#555; font-weight:500; padding-top:6px;">替换右侧栏状态</span>
                        <div data-v-02424d02="" style="flex:1; min-width:220px;">
                            <select id="lgb-replace-sidebar" style="padding:6px 10px; border:1px solid #ddd; border-radius:4px; width:200px; font-size:0.95em; background:#fff;">
                                <option value="1" ${rpl === "1" ? "selected" : ""}>开启</option>
                                <option value="0" ${rpl === "0" ? "selected" : ""}>关闭</option>
                            </select>
                            <p data-v-5c9d4df6="" class="lfe-caption" style="margin:5px 0 0; color:#999; font-size:0.85em;">是否在评测记录详情页右侧信息栏显示主题化状态卡片。</p>
                        </div>
                    </div>

                    <!-- 预览 -->
                    <div data-v-02424d02="" class="l-form-layout row" style="display:flex;align-items:flex-start;gap:1.5em;flex-wrap:wrap;border-bottom: 1px solid #eee; padding-bottom: 16px;">
                        <span data-v-02424d02="" class="" style="width: 130px; flex-shrink:0; color:#555; font-weight:500; padding-top:6px;">效果预览</span>
                        <div data-v-02424d02="" style="flex:1; min-width:220px;">
                            <div id="lgb-preview-box" style="display:flex; flex-wrap:wrap; gap:16px;">
                                ${statusKeys.map((k, i) => `
                                    <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
                                        <div class="lgb-preview-card" data-idx="${i}" style="width:100px; height:100px; border-radius:10px; overflow:hidden; transition: background 0.15s ease; ${getCol(i, op)}">
                                        </div>
                                        <span style="font-size:0.85em; color:#666; font-weight:500;">${k}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- 保存 -->
                    <div data-v-02424d02="" class="l-form-layout row" style="display:flex;align-items:center;gap:1.5em; padding-top: 8px;">
                        <span data-v-02424d02="" class="" style="width: 130px; flex-shrink:0;"></span>
                        <div data-v-02424d02="" style="flex:1;">
                            <button data-v-505b6a97="" data-v-5c9d4df6="" class="solid lform-size-middle" type="button" id="lgb-save" style="background:#3498db; color:#fff; border:none; padding:8px 28px; border-radius:4px; cursor:pointer; font-size:1em;">保存设置</button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
        `;

        // 预览更新函数
        function updatePreview() {
            const newOp = parseInt(document.getElementById('lgb-opacity-slider').value) / 100;
            const newTheme = document.getElementById('lgb-theme').value;
            const newJsd = document.getElementById('lgb-jsdelivr').value === 'custom'
                ? document.getElementById('lgb-jsdelivr-custom').value.trim()
                : document.getElementById('lgb-jsdelivr').value;

            const colors = getStatusColors(newOp);
            const previewCards = document.querySelectorAll('.lgb-preview-card');

            previewCards.forEach((card, i) => {
                const key = statusKeys[i];
                let imgUrl;
                if (themeOptions.includes(newTheme)) {
                    imgUrl = `${newJsd}/gh/chenyuxuan2009/luogu_submission_better/theme/${newTheme}/${key}.${themeTypes[newTheme]}`;
                } else {
                    imgUrl = getStorage(key, '');
                }
                card.style = `width:100px; height:100px; border-radius:10px; overflow:hidden; transition: background 0.15s ease; background: linear-gradient(${colors[i]}, ${colors[i]}), url('${imgUrl}'); background-size: cover;`;
            });
        }

        // 滑块事件
        const slider = document.getElementById('lgb-opacity-slider');
        const valueDisplay = document.getElementById('lgb-opacity-value');
        const sliderBar = document.getElementById('slider-bar-lgb');
        const sliderDot = document.getElementById('slider-dot-lgb');

        if (slider) {
            slider.addEventListener('input', function() {
                const val = parseInt(this.value);

                if (sliderBar) sliderBar.style.transform = `scaleX(${val / 100})`;
                if (sliderDot) sliderDot.style.left = val + '%';

                valueDisplay.textContent = val;

                updatePreview();
            });
        }

        const jsdelivrSelect = document.getElementById('lgb-jsdelivr');
        if (jsdelivrSelect) {
            jsdelivrSelect.addEventListener('change', function () {
                const customInput = document.getElementById('lgb-jsdelivr-custom');
                if (customInput) {
                    customInput.style.display = this.value === 'custom' ? 'block' : 'none';
                }
                updatePreview();
            });
        }

        const customJsdInput = document.getElementById('lgb-jsdelivr-custom');
        if (customJsdInput) {
            customJsdInput.addEventListener('input', updatePreview);
        }

        const themeSelect = document.getElementById('lgb-theme');
        if (themeSelect) {
            themeSelect.addEventListener('change', function () {
                const customTheme = document.getElementById('lgb-custom-theme');
                if (customTheme) {
                    customTheme.style.display = this.value === 'custom' ? 'block' : 'none';
                }
                updatePreview();
            });
        }

        statusKeys.forEach(k => {
            const input = document.getElementById(`lgb-img-${k}`);
            if (input) {
                input.addEventListener('input', updatePreview);
            }
        });

        const saveBtn = document.getElementById('lgb-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                const newOp = parseInt(document.getElementById('lgb-opacity-slider').value) / 100;
                setStorage('opacity', newOp);

                let newJsd = document.getElementById('lgb-jsdelivr').value;
                if (newJsd === 'custom') {
                    newJsd = document.getElementById('lgb-jsdelivr-custom').value.trim();
                    if (!newJsd) { alert('请输入自定义 jsdelivr 地址'); return; }
                }
                setStorage('jsdelivr', newJsd);

                let newThm = document.getElementById('lgb-theme').value;
                if (newThm === 'custom') {
                    let missing = statusKeys.filter(k => !document.getElementById(`lgb-img-${k}`).value.trim());
                    if (missing.length) {
                        alert('自定义主题需要填写所有图片 URL\n缺少：' + missing.join(', '));
                        return;
                    }
                    statusKeys.forEach(k => setStorage(k, document.getElementById(`lgb-img-${k}`).value.trim()));
                }
                setStorage('theme', newThm);
                setStorage('replaceSidebarStatus', document.getElementById('lgb-replace-sidebar').value);

                refreshConfig();
                showSaveModal();
            });
        }
    }

    // ==================== 等待元素出现 ====================
    function waitFor(selector, callback, timeout = 5000) {
        const el = document.querySelector(selector);
        if (el) { callback(); return; }
        const obs = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                obs.disconnect();
                callback();
            }
        });
        obs.observe(document, { subtree: true, childList: true });
        setTimeout(() => obs.disconnect(), timeout);
    }

    // ==================== 路由与初始化 ====================
    function init() {
        const path = location.pathname;
        addSidebarButton();

        if (/^\/record\/\d+/.test(path)) {
            if (window._subBetterInterval) {
                clearInterval(window._subBetterInterval);
            }
            window._subBetterInterval = setInterval(subBetter, 10);
        } else if (path === '/plugin') {
            waitFor('main .full-container', renderPluginPage);
        }
    }

    let lastPath = location.pathname;
    const observer = new MutationObserver(() => {
        if (location.pathname !== lastPath) {
            lastPath = location.pathname;
            if (window._subBetterInterval) {
                clearInterval(window._subBetterInterval);
                window._subBetterInterval = null;
            }
            setTimeout(init, 300);
        }
    });
    observer.observe(document, { subtree: true, childList: true });

    window.addEventListener('beforeunload', () => {
        if (window._subBetterInterval) {
            clearInterval(window._subBetterInterval);
        }
        if (window._lgbObserver) {
            window._lgbObserver.disconnect();
        }
    });

    init();
})();
