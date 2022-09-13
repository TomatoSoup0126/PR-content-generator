<p align="center">
  <img src="https://github.com/TomatoSoup0126/PR-content-generator/blob/master/public/repo-icon.png?raw=true" width="150px" height="150px">
</p>
<div align="center">
  <h1>PR Content generator</h1>
</div>
## Download
[Release 2.6](https://github.com/TomatoSoup0126/PR-content-generator/releases/tag/v2.6)

## Overview
- Fetch branch diff by github api
- Fetch issues on Jira and Redmine issue api
- Export issues to markdown
- Support dark mode

![action.png](https://github.com/TomatoSoup0126/PR-content-generator/blob/master/public/action-dark.png?raw=true)
![setting.png](https://github.com/TomatoSoup0126/PR-content-generator/blob/master/public/setting-light.png?raw=true)
## Quick start

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

## Generate token
- Github: https://github.com/settings/tokens -> Generate new token
- Redmine: https://redmine.YOURDOMAIN.com/my/account -> API token
- Jira: https://id.atlassian.com/manage-profile/security/api-tokens -> Create API token
