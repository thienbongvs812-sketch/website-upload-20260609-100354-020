import { H as Hls } from './hls.esm.js';

window.Hls = Hls;
window.dispatchEvent(new Event('hls-loader-ready'));
