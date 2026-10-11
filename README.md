# Jason Bu — Portfolio / 个人作品集

A bilingual Chinese/English portfolio for software engineering opportunities.

Live website / 在线网站: [yanxiabu001.com](https://yanxiabu001.com/)

## Local preview / 本地预览

Install Node.js, then run from this directory:

```sh
node preview.cjs 4190
```

Open <http://127.0.0.1:4190/> and keep the terminal running. If the port is occupied, replace `4190` with another port.

Windows PowerShell:

```powershell
& .\run-preview.cmd
```

## Files / 文件说明

- `dist/index.html`: bilingual content and page structure.
- `dist/reference.css`: responsive layout, themes, and animations.
- `dist/app.js`: language and portrait switches, navigation, and interactive effects.
- `dist/assets/`: portraits and project artwork.
- `dist/site-content.json`: introduction video URL and the displayed Codex usage snapshot.
- `preview.cjs`: a local static preview server using Node.js built-in modules.

Set `introVideoUrl` in `dist/site-content.json` to add an introduction video. The Codex token count is a dated snapshot; it is not a live counter.

Static hosts can publish the `dist` directory directly. The production domain currently uses Sites; this repository stores the website source.
