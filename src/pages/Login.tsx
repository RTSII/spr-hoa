[plugin:vite:import-analysis] Failed to resolve import "./contexts/AuthContext" from "src/pages/Login.tsx". Does the file exist?
C:/Users/rtsii/Desktop/sandpiper-portal/src/pages/Login.tsx:3:29
16 |  }
17 |  import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
18 |  import { AuthProvider } from "./contexts/AuthContext";
   |                                ^
19 |  import Login from "./pages/Login";
20 |  function App() {
    at TransformPluginContext._formatLog (file:///C:/Users/rtsii/Desktop/sandpiper-portal/node_modules/vite/dist/node/chunks/dep-Bg4HVnP5.js:31470:43)
    at TransformPluginContext.error (file:///C:/Users/rtsii/Desktop/sandpiper-portal/node_modules/vite/dist/node/chunks/dep-Bg4HVnP5.js:31467:14)
    at normalizeUrl (file:///C:/Users/rtsii/Desktop/sandpiper-portal/node_modules/vite/dist/node/chunks/dep-Bg4HVnP5.js:30010:18)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async file:///C:/Users/rtsii/Desktop/sandpiper-portal/node_modules/vite/dist/node/chunks/dep-Bg4HVnP5.js:30068:32
    at async Promise.all (index 4)
    at async TransformPluginContext.transform (file:///C:/Users/rtsii/Desktop/sandpiper-portal/node_modules/vite/dist/node/chunks/dep-Bg4HVnP5.js:30036:4)
    at async EnvironmentPluginContainer.transform (file:///C:/Users/rtsii/Desktop/sandpiper-portal/node_modules/vite/dist/node/chunks/dep-Bg4HVnP5.js:31284:14)
    at async loadAndTransform (file:///C:/Users/rtsii/Desktop/sandpiper-portal/node_modules/vite/dist/node/chunks/dep-Bg4HVnP5.js:26454:26)
Click outside, press Esc key, or fix the code to dismiss.
You can also disable this overlay by setting server.hmr.overlay to false in vite.config.ts.
