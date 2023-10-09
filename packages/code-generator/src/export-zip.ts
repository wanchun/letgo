import JSZip from 'jszip';
import { isPlainObject } from 'lodash-es';

function writeContent(zip: JSZip, content: Record<string, any>) {
    Object.keys(content).forEach((key) => {
        if (isPlainObject(content[key])) {
            const img = zip.folder(key);
            writeContent(img, content[key]);
        }
        else {
            zip.file(key, content[key]);
        }
    });
}

export function exportZip(code: Record<string, any>) {
    const zip = new JSZip();
    writeContent(zip, code);

    // 生成zip文件并下载
    zip.generateAsync({
        type: 'blob',
    }).then((content) => {
        // 下载的文件名
        const filename = 'letgo-code.zip';
        // 创建隐藏的可下载链接
        const eleLink = document.createElement('a');
        eleLink.download = filename;
        eleLink.style.display = 'none';
        // 下载内容转变成blob地址
        eleLink.href = URL.createObjectURL(content);
        // 触发点击
        document.body.appendChild(eleLink);
        eleLink.click();
        // 然后移除
        document.body.removeChild(eleLink);
    });
}
