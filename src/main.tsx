// 应用入口：先把浏览器本地数据库（IndexedDB）里的存档与进度载入内存，再渲染界面
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { hydrateStore } from "./game/store";

const container = document.getElementById("root");

if (container) {
  void hydrateStore()
    .catch(() => {
      // 本地数据库不可用时仍可游玩，只是本次会话的数据不会保留
    })
    .finally(() => {
      createRoot(container).render(<App />);
    });
}
