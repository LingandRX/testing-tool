document.getElementById('close').addEventListener('click', () => {
  window.parent.postMessage({ action: 'indexind' }, '*');
});

// sidepanel/index.js
// 页面切换逻辑
document.getElementById("nav-timestamp").addEventListener("click", () => {
  switchPage("timestamp");
});

document.getElementById("nav-other").addEventListener("click", () => {
  switchPage("other");
});

function switchPage(pageName) {
  // 隐藏所有页面
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });
  
  // 移除所有导航按钮的 active 状态
  document.querySelectorAll(".nav-button").forEach(button => {
    button.classList.remove("active");
  });

  // 显示目标页面
  document.getElementById(`page-${pageName}`).classList.add("active");
  
  // 激活对应的导航按钮
  document.getElementById(`nav-${pageName}`).classList.add("active");
}

// 关闭按钮逻辑 (使用消息传递)
document.getElementById("close").addEventListener("click", () => {
  // 向父页面发送消息请求关闭
  window.parent.postMessage({ action: "closeSidebar" }, "*");
});