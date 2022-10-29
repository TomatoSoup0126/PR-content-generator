<p align="center">
  <img src="https://github.com/TomatoSoup0126/PR-content-generator/blob/master/public/repo-icon.png?raw=true" width="150px" height="150px">
</p>
<div align="center">
  <h1>PR Content generator</h1>
  <p>Download <a href="https://github.com/TomatoSoup0126/PR-content-generator/releases/tag/3.0.1">Release 3.1.0</a></p>
</div>

## Overview
- Fetch branch diff by github api
- Fetch issues on Jira and Redmine issue api
- Export issues to markdown
- Support dark mode

![action.png](https://github.com/TomatoSoup0126/PR-content-generator/blob/master/public/action-dark.png?raw=true)
![setting.png](https://github.com/TomatoSoup0126/PR-content-generator/blob/master/public/setting-light.png?raw=true)

## How to use
#### 1. Generate access token
- Github: https://github.com/settings/tokens -> Generate new token
- Redmine: https://redmine.YOURDOMAIN.com/my/account -> API token
- Jira: https://id.atlassian.com/manage-profile/security/api-tokens -> Create API token

#### 2.  Setup path & token on setting tab ⚙️
- Redmine path: `https://redmine.YOUR_DOMAIN.com`
- Jira path: `https://YOUR_DOMAIN.atlassian.net`
- click save button 💾 on right-bottom for save config

![setting.png](https://github.com/TomatoSoup0126/PR-content-generator/blob/master/public/path_config.png?raw=true)

#### 3. Setup repo &  on setting tab ⚙️
- Use add ➕ and delete 🗑️ to manage repo and branch option

![setting.png](https://github.com/TomatoSoup0126/PR-content-generator/blob/master/public/repo_config.png?raw=true)

#### 4. Get pull request content
- Fill repo owner and choose repo
- Choose base branch (into) and compare branch (from) for pull request
- Click magic stick 🪄 to generate content

---

## Quick start for dev

```sh
git clone https://github.com/TomatoSoup0126/PR-content-generator
npm i
npm run dev
```

## Build app
```
npm run build
=> release/version/PR Content Generator-Mac-version-Installer.dmg
```
## Stack
- [React](https://reactjs.org/)
- [Electron](https://www.electronjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind](https://tailwindcss.com/)
- [Material-ui](https://mui.com/)
- Template by [electron-vite-react](https://github.com/electron-vite/electron-vite-react)

---

<a href="https://www.buymeacoffee.com/tomatosoup" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee"  width="217" height="60">
</a>
